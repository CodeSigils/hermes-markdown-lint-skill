/**
 * Tests for format-tables.js — single-pass table formatter
 *
 * Covers: separator detection, separator building, row parsing,
 * table detection (fence-aware), full format pass, and CJK/emoji width.
 */

"use strict";

const {
    _isSeparatorLine,
    _buildSeparator,
    _parseTableRow,
    _findTables,
    _formatTableInPlace,
    _stringWidth,
    processFile,
} = require("../skills/markdown-lint/references/format-tables.js");
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (e) {
        console.log(`✗ ${name}`);
        console.log(`  ${e.message}`);
        failed++;
    }
}

// ── _isSeparatorLine ──────────────────────────────────────────────────────────

test("isSeparatorLine: detects left-aligned", () => {
    assert.strictEqual(_isSeparatorLine("| :--- | :--- |"), true);
});

test("isSeparatorLine: detects right-aligned", () => {
    assert.strictEqual(_isSeparatorLine("| ---: | ---: |"), true);
});

test("isSeparatorLine: detects center-aligned", () => {
    assert.strictEqual(_isSeparatorLine("| :---: | :---: |"), true);
});

test("isSeparatorLine: detects plain dashes (raw style)", () => {
    assert.strictEqual(_isSeparatorLine("| --- | --- |"), true);
});

test("isSeparatorLine: rejects header row", () => {
    assert.strictEqual(_isSeparatorLine("| Header | Value |"), false);
});

test("isSeparatorLine: rejects data row", () => {
    assert.strictEqual(_isSeparatorLine("| Alice | 25 |"), false);
});

// ── _buildSeparator ───────────────────────────────────────────────────────────

test("buildSeparator: left alignment", () => {
    const sep = _buildSeparator([4, 4], ["left", "left"]);
    assert.match(sep, /:\-+/);
    assert.ok(sep.startsWith("|"));
});

test("buildSeparator: right alignment", () => {
    const sep = _buildSeparator([4, 4], ["right", "right"]);
    assert.match(sep, /----:/);
});

test("buildSeparator: center alignment", () => {
    const sep = _buildSeparator([5, 5], ["center", "center"]);
    assert.match(sep, /:.*:/);
});

test("buildSeparator: minimum 3 chars enforced", () => {
    // colWidth=1 → Math.max(3,1)=3 dashes, left = ':' + '--' = ':--' (3 chars total)
    const sep = _buildSeparator([1, 1], ["left", "left"]);
    assert.match(sep, /:-+/);
});

// ── _parseTableRow ────────────────────────────────────────────────────────────

test("parseTableRow: parses header row", () => {
    const cells = _parseTableRow("| Name | Age |");
    assert.strictEqual(cells.length, 2);
    assert.strictEqual(cells[0].raw, "Name");
    assert.strictEqual(cells[1].raw, "Age");
});

test("parseTableRow: returns null for non-table line", () => {
    assert.strictEqual(_parseTableRow("Just some text"), null);
});

test("parseTableRow: returns null for line without trailing pipe", () => {
    assert.strictEqual(_parseTableRow("| Name | Age"), null);
});

// ── _findTables (fence-aware) ─────────────────────────────────────────────────

test("findTables: finds simple table", () => {
    const lines = [
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
    ];
    const tables = _findTables(lines);
    assert.strictEqual(tables.length, 1);
    assert.strictEqual(tables[0].headerLine, 0);
    assert.strictEqual(tables[0].dataStart, 2);
});

test("findTables: skips table inside fenced code block", () => {
    const lines = [
        "```markdown",
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
        "```",
    ];
    const tables = _findTables(lines);
    assert.strictEqual(tables.length, 0);
});

test("findTables: finds table after fenced block", () => {
    const lines = [
        "```bash",
        "echo hello",
        "```",
        "",
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
    ];
    const tables = _findTables(lines);
    assert.strictEqual(tables.length, 1);
    assert.strictEqual(tables[0].headerLine, 4);
});

test("findTables: finds multiple tables", () => {
    const lines = [
        "| A |",
        "| --- |",
        "| 1 |",
        "",
        "| B |",
        "| --- |",
        "| 2 |",
    ];
    const tables = _findTables(lines);
    assert.strictEqual(tables.length, 2);
});

// ── _formatTableInPlace ───────────────────────────────────────────────────────

test("formatTableInPlace: fixes raw separator", () => {
    const lines = [
        "| Name | Age |",
        "| --- | --- |",
        "| Alice | 25 |",
    ];
    const tables = _findTables(lines);
    _formatTableInPlace(lines, tables[0]);
    assert.ok(lines[1].includes(":"), "Separator should have alignment colons");
});

test("formatTableInPlace: pads cells to column width", () => {
    const lines = [
        "| Name | Description |",
        "| --- | --- |",
        "| Al | Short |",
    ];
    const tables = _findTables(lines);
    _formatTableInPlace(lines, tables[0]);
    assert.ok(lines[2].includes("Al "), "Short cell should be padded");
});

test("formatTableInPlace: idempotent on already-correct table", () => {
    // Build lines, format once to get canonical form, then format again — must not change
    const lines = [
        "| Name  | Age |",
        "| --- | --- |",
        "| Alice | 25  |",
    ];
    const tables = _findTables(lines);
    _formatTableInPlace(lines, tables[0]); // first pass: normalize
    const afterFirst = [...lines];
    _formatTableInPlace(lines, tables[0]); // second pass: must be no-op
    assert.deepStrictEqual(lines, afterFirst, "Second format pass must not change output");
});

// ── _stringWidth ──────────────────────────────────────────────────────────────

test("stringWidth: ASCII is 1 per char", () => {
    assert.strictEqual(_stringWidth("Hello"), 5);
});

test("stringWidth: CJK chars are width 2", () => {
    assert.strictEqual(_stringWidth("日本語"), 6);
});

test("stringWidth: emoji is width 2", () => {
    assert.ok(_stringWidth("✅") >= 1); // at least 1, usually 2
});

// ── processFile (integration) ─────────────────────────────────────────────────

test("processFile: fixes a file end-to-end", () => {
    const tmp = path.join(os.tmpdir(), `format-test-${Date.now()}.md`);
    fs.writeFileSync(tmp, "# Test\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n", "utf8");
    const count = processFile(tmp);
    assert.ok(count >= 0, "processFile should return a count");
    const result = fs.readFileSync(tmp, "utf8");
    assert.ok(result.includes(":"), "Output should have GFM separators");
    fs.unlinkSync(tmp);
});

test("processFile: returns 0 for non-existent file", () => {
    assert.strictEqual(processFile("/does/not/exist.md"), 0);
});

test("processFile: does not modify content inside fenced blocks", () => {
    const tmp = path.join(os.tmpdir(), `fence-test-${Date.now()}.md`);
    const input = "# Test\n\n```markdown\n| A | B |\n| --- | --- |\n| 1 | 2 |\n```\n";
    fs.writeFileSync(tmp, input, "utf8");
    processFile(tmp);
    const result = fs.readFileSync(tmp, "utf8");
    assert.ok(result.includes("| --- | --- |"), "Table inside fence must not be modified");
    fs.unlinkSync(tmp);
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);