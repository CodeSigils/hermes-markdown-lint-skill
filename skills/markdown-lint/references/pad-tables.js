#!/usr/bin/env node
/**
 * pad-tables.js — Pad table data rows so pipes align with header columns.
 *
 * MD060 requires every `|` in every row to align with the column boundaries
 * set by the header. This script pads cell content so pipes line up.
 *
 * Usage:
 *   node pad-tables.js <file>           Fix a file
 *   node pad-tables.js --check <file>  Read-only check
 *   node pad-tables.js --all <dir>      Fix all .md in directory
 */

"use strict";

const fs = require("fs");
const path = require("path");

// Minimal string-width implementation (handles emoji/CJK)
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
            width += 0;
        } else if (
            (cp >= 0x1100 && cp <= 0x115f) ||
            cp === 0x2329 ||
            cp === 0x232a ||
            (cp >= 0x2e80 && cp <= 0x303e) ||
            (cp >= 0x3040 && cp <= 0xa4cf) ||
            (cp >= 0xac00 && cp <= 0xd7a3) ||
            (cp >= 0xf900 && cp <= 0xfaff) ||
            (cp >= 0xfe10 && cp <= 0xfe1f) ||
            (cp >= 0xfe30 && cp <= 0xfe6f) ||
            (cp >= 0xff00 && cp <= 0xff60) ||
            (cp >= 0xffe0 && cp <= 0xffe6) ||
            (cp >= 0x1f300 && cp <= 0x1f9ff) || // emojis
            (cp >= 0x2600 && cp <= 0x27bf) ||   // misc symbols
            (cp >= 0x20000 && cp <= 0x2fffd) ||
            (cp >= 0x30000 && cp <= 0x3fffd)
        ) {
            width += 2; // wide (CJK, emoji, etc.)
        } else {
            width += 1; // regular
        }
    }
    return width;
}

function parseTableRow(line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
    
    // Strip leading/trailing pipes, split on unescaped |
    const stripped = trimmed.slice(1, -1);
    if (!stripped) return null;
    return stripped.split('|').map((cell) => {
        const raw = cell.trim();
        return {
            raw,
            width: stringWidth(raw),
        };
    });
}

function buildSeparator(colWidths, alignments) {
    return (
        "| " +
        colWidths
            .map((w, i) => {
                const align = alignments[i] || "left";
                if (align === "right") {
                    return "-".repeat(w) + ": |";
                }
                if (align === "center") {
                    const dashes = "-".repeat(Math.max(1, w - 2));
                    return ":" + dashes + ": |";
                }
                return ": " + "-".repeat(Math.max(3, w - 2)) + " |";
            })
            .join(" ")
    );
}

function findTables(lines) {
    const tables = [];
    let inTable = false;
    let tableStart = -1;
    let headerLine = -1;
    let dataStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const isTableLine = trimmed.startsWith('|') && trimmed !== "|";

        if (isTableLine) {
            if (!inTable) {
                inTable = true;
                tableStart = i;
            }
            if (/^\|[\s:|-]+\|$/.test(trimmed)) {
                if (headerLine >= 0) {
                    dataStart = i + 1;
                }
            } else if (headerLine < 0) {
                headerLine = i;
            }
        } else if (inTable) {
            tables.push({
                start: tableStart,
                end: i - 1,
                headerLine,
                dataStart,
            });
            inTable = false;
            tableStart = -1;
            headerLine = -1;
            dataStart = -1;
        }
    }

    if (inTable) {
        tables.push({
            start: tableStart,
            end: lines.length - 1,
            headerLine,
            dataStart,
        });
    }

    return tables;
}

function parseAlignments(separatorLine) {
    const cells = parseTableRow(separatorLine);
    if (!cells) return [];
    return cells.map((cell) => {
        const inner = cell.raw;
        if (/^:-+:$/.test(inner)) return "center";
        if (/:$/.test(inner)) return "right";
        return "left";
    });
}

function computeColWidths(lines, headerLine, dataStart, end) {
    if (headerLine < 0) return [];
    const headerCells = parseTableRow(lines[headerLine]);
    if (!headerCells) return [];

    const widths = headerCells.map((c) => Math.max(3, c.width)); // min width for valid dash formatting

    for (let i = dataStart; i <= end; i++) {
        const row = parseTableRow(lines[i]);
        if (!row) continue;
        for (let j = 0; j < row.length && j < widths.length; j++) {
            widths[j] = Math.max(widths[j], row[j].width);
        }
    }

    return widths;
}

function formatRow(cells, colWidths) {
    const parts = cells.map((cell, i) => {
        const w = colWidths[i] || stringWidth(cell);
        const paddingNeeded = Math.max(0, w - stringWidth(cell));
        return cell + " ".repeat(paddingNeeded);
    });
    return "| " + parts.join(" | ") + " |";
}

function padTableInPlace(lines, table) {
    const { start, end, headerLine, dataStart } = table;
    if (headerLine < 0 || dataStart < 0) return false;

    const colWidths = computeColWidths(lines, headerLine, dataStart, end);
    if (colWidths.length === 0) return false;

    // Check if we need to pad at all
    let needsFix = false;
    for (let i = headerLine; i <= end; i++) {
        if (i === dataStart - 1) continue; // skip separator
        const row = parseTableRow(lines[i]);
        if (!row) continue;
        for (let j = 0; j < row.length && j < colWidths.length; j++) {
            if (row[j].width < colWidths[j]) {
                needsFix = true;
                break;
            }
        }
        if (needsFix) break;
    }
    
    // Check if separator is malformed (width mismatch)
    const alignments = parseAlignments(lines[dataStart - 1]);
    const idealSeparator = buildSeparator(colWidths, alignments);
    if (idealSeparator !== lines[dataStart - 1].trim()) {
        needsFix = true;
    }

    if (!needsFix) return false;

    let changed = false;

    // Apply ideal separator
    if (lines[dataStart - 1] !== idealSeparator) {
        lines[dataStart - 1] = idealSeparator;
        changed = true;
    }

    // Process header
    const headerRow = parseTableRow(lines[headerLine]);
    if (headerRow) {
        const newHeader = formatRow(headerRow.map((c) => c.raw), colWidths);
        if (lines[headerLine] !== newHeader) {
            lines[headerLine] = newHeader;
            changed = true;
        }
    }

    // Process data rows
    for (let i = dataStart; i <= end; i++) {
        const row = parseTableRow(lines[i]);
        if (!row) continue;
        const newRow = formatRow(row.map((c) => c.raw), colWidths);
        if (lines[i] !== newRow) {
            lines[i] = newRow;
            changed = true;
        }
    }

    return changed;
}

function processFile(filePath, dryRun = false) {
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
        return 0;

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const tables = findTables(lines);

    if (tables.length === 0) return 0;

    let totalFixed = 0;
    
    if (dryRun) {
        // Just checking
        for (const table of tables) {
            const linesCopy = [...lines];
            const changed = padTableInPlace(linesCopy, table);
            if (changed) {
                totalFixed++;
                console.log(`Would pad table(s) in ${filePath}`);
                return 1; // exit early for check mode
            }
        }
        return 0;
    }

    let fileChanged = false;
    for (const table of tables) {
        const changed = padTableInPlace(lines, table);
        if (changed) {
            totalFixed++;
            fileChanged = true;
        }
    }

    if (fileChanged) {
        fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    }

    return totalFixed;
}

function findMdFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        return files;
    }
    function walk(subdir) {
        for (const entry of fs.readdirSync(subdir, { withFileTypes: true })) {
            const full = path.join(subdir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                walk(full);
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                files.push(full);
            }
        }
    }
    walk(dir);
    return files;
}

function main() {
    const args = process.argv.slice(2);
    let directory = null;
    let checkOnly = false;
    const files = [];

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--check') {
            checkOnly = true;
        } else if (args[i] === '--all') {
            directory = args[++i];
        } else if (!args[i].startsWith('-')) {
            files.push(args[i]);
        }
    }

    if (!files.length && !directory) {
        console.error("Usage: pad-tables.js <file> [--check]");
        console.error("       pad-tables.js --all <dir> [--check]");
        process.exit(1);
    }

    if (directory) {
        files.push(...findMdFiles(directory));
    }

    let totalCount = 0;
    let anyChanges = false;
    for (const file of files) {
        if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) continue;
        const count = processFile(file, checkOnly);
        if (count > 0) {
            anyChanges = true;
            if (!checkOnly) {
                console.log(`Padded ${count} table(s) in ${file}.`);
                totalCount += count;
            }
        } else if (!checkOnly && !directory) {
            console.log(`No table padding needed in ${file}.`);
        }
    }

    if (checkOnly && anyChanges) {
        process.exit(1);
    } else if (checkOnly) {
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}
