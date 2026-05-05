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
            (cp >= 0x007f && cp <= 0x009f)
        ) {
            // control chars: zero width
        } else if (
            (cp >= 0x1100 &&
                cp <= 0x115f) ||
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
    // Strip leading/trailing pipes, split on unescaped |
    const stripped = line.replace(/^\s*\|\s*/, "").replace(/\s*\|\s*$/, "");
    if (!stripped) return null;
    return stripped.split(/\s*\|\s*/).map((cell) => ({
        raw: cell,
        width: stringWidth(cell),
    }));
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
                // left: ": " + N dashes where total string-width = w
                // ": " = 2 visible chars, so dashes = w - 2, min 3
                return ": " + "-".repeat(Math.max(3, w - 2)) + " |";
            })
            .join(" ")
    );
}

function padCell(cell, width) {
    return cell; // content unchanged, alignment handled by separator
}

function findTables(content) {
    const lines = content.split("\n");
    const tables = [];
    let inTable = false;
    let tableStart = -1;
    let headerLine = -1;
    let dataStart = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isTableLine = /^\|/.test(line.trim()) && line.trim() !== "|";

        if (isTableLine) {
            if (!inTable) {
                inTable = true;
                tableStart = i;
            }
            // Detect separator row (all dashes/colons/pipes)
            if (/^\|[\s:|-]+\|$/.test(line.trim())) {
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

    return { lines, tables };
}

function parseAlignments(separatorLine) {
    const cells = parseTableRow(separatorLine);
    if (!cells) return [];
    return cells.map((cell) => {
        const raw = cell.raw.replace(/^\s*\|\s*/, "").replace(/\s*\|\s*$/, "");
        const inner = raw.replace(/^\s*\|\s*/, "").replace(/\s*\|\s*$/, "");
        if (/^:-+:$/.test(inner)) return "center";
        if (/:$/.test(inner)) return "right";
        return "left";
    });
}

function computeColWidths(lines, headerLine, dataStart, end) {
    if (headerLine < 0) return [];
    const headerCells = parseTableRow(lines[headerLine]);
    if (!headerCells) return [];

    // Init widths from header
    const widths = headerCells.map((c) => c.width);

    // Grow widths from data rows
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
        const content = cell.trim();
        return content.padEnd(w);
    });
    return "| " + parts.join(" | ") + " |";
}

function padTable(lines, table) {
    const { start, end, headerLine, dataStart } = table;
    if (headerLine < 0 || dataStart < 0) return null;

    const colWidths = computeColWidths(lines, headerLine, dataStart, end);
    if (colWidths.length === 0) return null;

    const alignments = parseAlignments(lines[dataStart - 1]);

    let changed = false;
    const newLines = [...lines];

    // Rebuild separator row to match column widths
    const newSeparator = buildSeparator(colWidths, alignments);
    if (newSeparator !== lines[dataStart - 1]) {
        newLines[dataStart - 1] = newSeparator;
        changed = true;
    }

    // Rebuild header (pad cells to max width)
    const headerCells = parseTableRow(lines[headerLine]);
    if (headerCells) {
        const padded = headerCells.map((c, i) =>
            c.raw.trim().padEnd(colWidths[i])
        );
        const newHeader = "| " + padded.join(" | ") + " |";
        if (newHeader !== lines[headerLine]) {
            newLines[headerLine] = newHeader;
            changed = true;
        }
    }

    // Rebuild data rows
    for (let i = dataStart; i <= end; i++) {
        const row = parseTableRow(lines[i]);
        if (!row) continue;
        const newRow = formatRow(row.map((c) => c.raw), colWidths);
        if (newRow !== lines[i]) {
            newLines[i] = newRow;
            changed = true;
        }
    }

    return changed ? newLines.join("\n") : null;
}

function processFile(filePath, dryRun = false) {
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
        return 0;

    const content = fs.readFileSync(filePath, "utf8");
    const { lines, tables } = findTables(content);

    if (tables.length === 0) return 0;

    let totalFixed = 0;
    let needsFix = false;

    // Check if any table needs fixing
    for (const table of tables) {
        const colWidths = computeColWidths(lines, table.headerLine, table.dataStart, table.end);
        if (colWidths.length === 0) continue;

        for (let i = table.headerLine; i <= table.end; i++) {
            const row = parseTableRow(lines[i]);
            if (!row) continue;
            for (let j = 0; j < row.length; j++) {
                if (row[j].width < colWidths[j]) {
                    needsFix = true;
                    break;
                }
            }
            if (needsFix) break;
        }
        if (needsFix) break;
    }

    if (!needsFix) return 0;

    if (dryRun) {
        console.log(`Would pad table(s) in ${filePath}`);
        return 1;
    }

    let current = content;
    for (const table of tables) {
        const result = padTable(current.split("\n"), table);
        if (result) {
            current = result;
            totalFixed++;
        }
    }

    if (totalFixed > 0) {
        fs.writeFileSync(filePath, current, "utf8");
    }

    return totalFixed;
}

function main() {
    const args = process.argv.slice(2);

    if (args[0] === "--check") {
        const file = args[1];
        if (!file) {
            console.error("Usage: pad-tables.js --check <file>");
            process.exit(1);
        }
        const count = processFile(file, true);
        process.exit(count > 0 ? 1 : 0);
    }

    const file = args[0];
    if (!file) {
        console.error("Usage: pad-tables.js <file> [--check]");
        process.exit(1);
    }

    const count = processFile(file);
    if (count > 0) {
        console.log(`Padded ${count} table(s) in ${file}.`);
    } else {
        console.log(`No table padding needed in ${file}.`);
    }
}

main();
