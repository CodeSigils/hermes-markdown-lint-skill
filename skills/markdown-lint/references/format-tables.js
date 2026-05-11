#!/usr/bin/env node
/**
 * format-tables.js — Single-pass table formatter for GFM markdown.
 *
 * Combines fix-tables.js and pad-tables.js into one file read/write cycle:
 *   1. Detect table blocks (fence-aware)
 *   2. Fix separator alignment (was fix-tables.js)
 *   3. Pad all cells to column widths (was pad-tables.js)
 *
 * Usage:
 *   node format-tables.js <file.md>
 *   node format-tables.js --all <dir>
 *   node format-tables.js --check <file.md>
 *   node format-tables.js --validate <file.md>
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── Visual width (emoji/CJK-aware) ───────────────────────────────────────────

function stringWidth(str) {
    let width = 0;
    for (const ch of str) {
        const cp = ch.codePointAt(0);
        if (
            (cp >= 0x0000 && cp <= 0x001f) ||
            (cp >= 0x007f && cp <= 0x009f) ||
            cp === 0xfe0f
        ) {
            // control chars / variation selectors: zero width
        } else if (
            (cp >= 0x1100 && cp <= 0x115f) ||
            cp === 0x2329 || cp === 0x232a ||
            (cp >= 0x2e80 && cp <= 0x303e) ||
            (cp >= 0x3040 && cp <= 0xa4cf) ||
            (cp >= 0xac00 && cp <= 0xd7a3) ||
            (cp >= 0xf900 && cp <= 0xfaff) ||
            (cp >= 0xfe10 && cp <= 0xfe1f) ||
            (cp >= 0xfe30 && cp <= 0xfe6f) ||
            (cp >= 0xff00 && cp <= 0xff60) ||
            (cp >= 0xffe0 && cp <= 0xffe6) ||
            (cp >= 0x1f300 && cp <= 0x1f9ff) ||
            (cp >= 0x2600 && cp <= 0x27bf) ||
            (cp >= 0x20000 && cp <= 0x2fffd) ||
            (cp >= 0x30000 && cp <= 0x3fffd)
        ) {
            width += 2;
        } else {
            width += 1;
        }
    }
    return width;
}

// ── Cell parsing helpers ──────────────────────────────────────────────────────

function parseCellsRaw(line) {
    const cells = [];
    const parts = line.split("|");
    for (let i = 0; i < parts.length; i++) {
        if (i === 0 && parts[i] === "") continue;
        if (i === parts.length - 1 && parts[i] === "") continue;
        cells.push(parts[i]);
    }
    return cells;
}

function parseTableRow(line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
    const stripped = trimmed.slice(1, -1);
    if (!stripped) return null;
    return stripped.split("|").map((cell) => {
        const raw = cell.trim();
        return { raw, width: stringWidth(raw) };
    });
}

function isSeparatorLine(line) {
    const s = line.trim();
    if (!s.startsWith("|")) return false;
    const cells = parseCellsRaw(s);
    return cells.every((cell) => {
        const c = cell.trim();
        if (c === "") return true;
        const cleaned = c.replace(/:/g, "");
        return cleaned.length >= 3 && /^-{3,}$/.test(cleaned);
    });
}

function getSeparatorAlignment(cell) {
    const inner = cell.trim();
    if (inner.startsWith(":") && inner.endsWith(":")) return "center";
    if (inner.endsWith(":")) return "right";
    return "left";
}

// ── Separator rebuilding ──────────────────────────────────────────────────────

function buildSeparator(colWidths, alignments) {
    const parts = colWidths.map((w, i) => {
        const align = alignments[i] || "left";
        const dashes = Math.max(3, w);
        if (align === "right")  return "-".repeat(dashes) + ":";
        if (align === "center") return ":" + "-".repeat(Math.max(1, dashes - 2)) + ":";
        return ":" + "-".repeat(Math.max(2, dashes - 1));
    });
    return "| " + parts.join(" | ") + " |";
}

// ── Table block detection ─────────────────────────────────────────────────────

function findTables(lines) {
    const tables = [];
    let inFence = false;
    let inTable = false;
    let tableStart = -1, headerLine = -1, dataStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();

        if (/^(`{3,}|~{3,})/.test(trimmed)) {
            inFence = !inFence;
            if (inTable) {
                tables.push({ start: tableStart, end: i - 1, headerLine, dataStart });
                inTable = false; tableStart = headerLine = dataStart = -1;
            }
            continue;
        }
        if (inFence) continue;

        const isTableLine = trimmed.startsWith("|") && trimmed !== "|";

        if (isTableLine) {
            if (!inTable) { inTable = true; tableStart = i; }
            if (/^\|[\s:|-]+\|$/.test(trimmed)) {
                if (headerLine >= 0) dataStart = i + 1;
            } else if (headerLine < 0) {
                headerLine = i;
            }
        } else if (inTable) {
            tables.push({ start: tableStart, end: i - 1, headerLine, dataStart });
            inTable = false; tableStart = headerLine = dataStart = -1;
        }
    }

    if (inTable) {
        tables.push({ start: tableStart, end: lines.length - 1, headerLine, dataStart });
    }

    return tables;
}

// ── Single-pass: fix separator + pad cells ────────────────────────────────────

function formatTableInPlace(lines, table) {
    const { headerLine, dataStart, end } = table;
    if (headerLine < 0 || dataStart < 0) return false;

    const separatorIdx = dataStart - 1;
    const headerCells = parseTableRow(lines[headerLine]);
    if (!headerCells) return false;

    // Compute alignments from the existing separator
    const alignments = parseCellsRaw(lines[separatorIdx].trim())
        .map((c) => getSeparatorAlignment(c));

    // Compute required column widths across header + data rows
    const colWidths = headerCells.map((c) => Math.max(3, c.width));
    for (let i = dataStart; i <= end; i++) {
        const row = parseTableRow(lines[i]);
        if (!row) continue;
        for (let j = 0; j < row.length && j < colWidths.length; j++) {
            colWidths[j] = Math.max(colWidths[j], row[j].width);
        }
    }

    // Build ideal separator and data row formatter
    const idealSep = buildSeparator(colWidths, alignments);

    function formatRow(row) {
        const parts = row.map((cell, i) => {
            const w = colWidths[i] || stringWidth(cell);
            return cell + " ".repeat(Math.max(0, w - stringWidth(cell)));
        });
        return "| " + parts.join(" | ") + " |";
    }

    let changed = false;

    // Fix separator
    if (lines[separatorIdx].trim() !== idealSep) {
        lines[separatorIdx] = idealSep;
        changed = true;
    }

    // Fix header
    const newHeader = formatRow(headerCells.map((c) => c.raw));
    if (lines[headerLine] !== newHeader) { lines[headerLine] = newHeader; changed = true; }

    // Fix data rows
    for (let i = dataStart; i <= end; i++) {
        const row = parseTableRow(lines[i]);
        if (!row) continue;
        const newRow = formatRow(row.map((c) => c.raw));
        if (lines[i] !== newRow) { lines[i] = newRow; changed = true; }
    }

    return changed;
}

// ── Validate-only mode (no writes) ───────────────────────────────────────────

function validateTableColumnCounts(content) {
    const lines = content.split("\n");
    const issues = [];
    let inFence = false;

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (/^(`{3,}|~{3,})/.test(trimmed)) { inFence = !inFence; continue; }
        if (inFence) continue;
        if (!isSeparatorLine(trimmed)) continue;

        const headerLine = lines[i - 1];
        if (!headerLine) continue;
        const hCols = parseCellsRaw(headerLine.trim()).length;
        const sCols = parseCellsRaw(trimmed).length;

        if (hCols !== sCols) {
            issues.push({ line: i + 1, message: `Header has ${hCols} columns but separator has ${sCols} columns` });
        }
        for (let k = i + 1; k < Math.min(i + 10, lines.length); k++) {
            const dataLine = lines[k].trim();
            if (!dataLine.startsWith("|")) break;
            if (isSeparatorLine(dataLine)) break;
            const dCols = parseCellsRaw(dataLine).length;
            if (dCols !== sCols) {
                issues.push({ line: k + 1, message: `Row has ${dCols} columns but separator expects ${sCols}` });
            }
        }
    }
    return issues;
}

// ── File processing ───────────────────────────────────────────────────────────

function processFile(filePath, dryRun = false) {
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return 0;

    const content = fs.readFileSync(filePath, "utf8");
    const hasTrailingNewline = content.endsWith("\n");
    const lines = content.split("\n");
    const tables = findTables(lines);
    if (tables.length === 0) return 0;

    if (dryRun) {
        const linesCopy = [...lines];
        for (const table of tables) {
            if (formatTableInPlace(linesCopy, table)) {
                console.log(`Would format tables in ${filePath}`);
                return 1;
            }
        }
        return 0;
    }

    let totalFixed = 0;
    for (const table of tables) {
        if (formatTableInPlace(lines, table)) totalFixed++;
    }

    if (totalFixed > 0) {
        let out = lines.join("\n");
        if (hasTrailingNewline && !out.endsWith("\n")) out += "\n";
        fs.writeFileSync(filePath, out, "utf8");
    }

    return totalFixed;
}

function findMdFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return files;
    function walk(subdir) {
        for (const entry of fs.readdirSync(subdir, { withFileTypes: true })) {
            const full = path.join(subdir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
                walk(full);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                files.push(full);
            }
        }
    }
    walk(dir);
    return files;
}

// ── CLI entry point ───────────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);
    const files = [];
    let directory = null;
    let checkOnly = false;
    let validate = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--check")    checkOnly = true;
        else if (args[i] === "--all") directory = args[++i];
        else if (args[i] === "--validate") validate = true;
        else if (!args[i].startsWith("-")) files.push(args[i]);
    }

    if (!files.length && !directory) {
        console.error("Usage: node format-tables.js <file.md>");
        console.error("       node format-tables.js --all <dir>");
        console.error("       node format-tables.js --check <file.md>");
        console.error("       node format-tables.js --validate <file.md>");
        process.exit(1);
    }

    if (directory) files.push(...findMdFiles(directory));

    if (validate) {
        let totalIssues = 0;
        for (const f of files) {
            if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) continue;
            const issues = validateTableColumnCounts(fs.readFileSync(f, "utf8"));
            if (issues.length > 0) {
                console.log(`\n${f}:`);
                for (const issue of issues) { console.log(`  Line ${issue.line}: ${issue.message}`); totalIssues++; }
            }
        }
        if (totalIssues > 0) { console.log(`\nFound ${totalIssues} table column mismatch(es)`); process.exit(1); }
        console.log("All tables have consistent column counts.");
        process.exit(0);
    }

    let total = 0;
    let anyChanges = false;
    for (const f of files) {
        if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) continue;
        const count = processFile(f, checkOnly);
        if (count > 0) {
            anyChanges = true;
            if (!checkOnly) { console.log(`Formatted ${count} table(s) in ${f}.`); total += count; }
        } else if (!checkOnly && !directory) {
            console.log(`No table changes needed in ${f}.`);
        }
    }

    if (checkOnly && anyChanges) process.exit(1);
    if (!anyChanges && !checkOnly && directory) console.log("No table changes needed.");
}

if (require.main === module) main();

module.exports = {
    processFile,
    findMdFiles,
    validateTableColumnCounts,
    // Exported for unit testing
    _isSeparatorLine: isSeparatorLine,
    _buildSeparator: buildSeparator,
    _parseTableRow: parseTableRow,
    _formatTableInPlace: formatTableInPlace,
    _findTables: findTables,
    _stringWidth: stringWidth,
};
