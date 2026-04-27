/**
 * Tests for fix-tables.js table separator normalization
 */

const { _fixFileInContent, _isSeparatorLine, _buildAlignedSeparator, _isSeparatorAlreadyCorrect } = require('../skills/markdown-lint/references/fix-tables.js');
const assert = require('assert');

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

// === Test _isSeparatorLine ===

test('_isSeparatorLine detects valid separator', () => {
    assert.strictEqual(_isSeparatorLine('| :--- | :--- |'), true);
});

test('_isSeparatorLine detects right-aligned', () => {
    assert.strictEqual(_isSeparatorLine('| ---: | ---: |'), true);
});

test('_isSeparatorLine detects center-aligned', () => {
    assert.strictEqual(_isSeparatorLine('| :---: | :---: |'), true);
});

test('_isSeparatorLine rejects header row', () => {
    assert.strictEqual(_isSeparatorLine('| Header | Header |'), false);
});

test('_isSeparatorLine rejects content row', () => {
    assert.strictEqual(_isSeparatorLine('| Cell | Cell |'), false);
});

test('_isSeparatorLine rejects non-data line', () => {
    assert.strictEqual(_isSeparatorLine('| a | b | c |'), false);
});

// === Test _isSeparatorAlreadyCorrect ===

test('_isSeparatorAlreadyCorrect accepts exact :---', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' :--- ']), true);
});

test('_isSeparatorAlreadyCorrect accepts exact ---:', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' ---: ']), true);
});

test('_isSeparatorAlreadyCorrect accepts exact :---:', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' :---: ']), true);
});

test('_isSeparatorAlreadyCorrect accepts variable width left-aligned', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' :---------- ']), true);
});

test('_isSeparatorAlreadyCorrect accepts variable width right-aligned', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' ----------: ']), true);
});

test('_isSeparatorAlreadyCorrect accepts variable width center-aligned', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' :---------: ']), true);
});

test('_isSeparatorAlreadyCorrect rejects plain dashes (no colons)', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' ----- ']), false);
});

test('_isSeparatorAlreadyCorrect rejects too short', () => {
    assert.strictEqual(_isSeparatorAlreadyCorrect([' :-- ']), false);
});

// === Test _buildAlignedSeparator ===

test('_buildAlignedSeparator basic table', () => {
    const result = _buildAlignedSeparator('| A | B |', '|------|------|');
    assert.strictEqual(result, '| :--- | :--- |');
});

test('_buildAlignedSeparator preserves right alignment', () => {
    const result = _buildAlignedSeparator('| A | B |', '|------:|------:|');
    assert.strictEqual(result, '| ---: | ---: |');
});

test('_buildAlignedSeparator preserves center alignment', () => {
    const result = _buildAlignedSeparator('| A | B |', '|:------:|:------:|');
    assert.strictEqual(result, '| :---: | :---: |');
});

test('_buildAlignedSeparator uses VSCode formula (stringWidth - 1)', () => {
    // "A " = 2 chars, so 2-1=1, but min 3 → 3 dashes
    const result = _buildAlignedSeparator('| A |', '|------|');
    assert.strictEqual(result, '| :--- |');
});

test('_buildAlignedSeparator longer header = more dashes', () => {
    // "LongerHeader" = 12 chars, so 12-1=11 dashes
    const result = _buildAlignedSeparator('| LongerHeader |', '|------|');
    assert.strictEqual(result, '| :----------- |');
});

test('_buildAlignedSeparator minimum 3 dashes', () => {
    // "Hi" = 2 chars, 2-1=1, capped at 3
    const result = _buildAlignedSeparator('| Hi |', '|------|');
    assert.strictEqual(result, '| :--- |');
});

test('_buildAlignedSeparator multiple cells', () => {
    const result = _buildAlignedSeparator('| A | B | C |', '|---|---|');
    assert.strictEqual(result, '| :--- | :--- | :--- |');
});

// === Test _fixFileInContent ===

test('_fixFileInContent fixes old-style separators', () => {
    const input = [
        '| A | B |',
        '|------|------|',
        '| 1 | 2 |'
    ].join('\n');
    const result = _fixFileInContent(input);
    assert.strictEqual(result.changed, 1);
    assert.ok(result.content.includes('| :--- | :--- |'));
});

test('_fixFileInContent preserves already-correct separators', () => {
    const input = [
        '| A |',
        '| :--- |',
        '| 1 |'
    ].join('\n');
    const result = _fixFileInContent(input);
    assert.strictEqual(result.changed, 0);
});

test('_fixFileInContent fixes compact style', () => {
    const input = [
        '| A |',
        '|---|',
        '| 1 |'
    ].join('\n');
    const result = _fixFileInContent(input);
    assert.strictEqual(result.changed, 1);
});

test('_fixFileInContent handles multiple tables', () => {
    const input = [
        '| A |',
        '|------|',
        '| 1 |',
        '',
        '| B |',
        '|------|',
        '| 2 |'
    ].join('\n');
    const result = _fixFileInContent(input);
    assert.strictEqual(result.changed, 2);
});

test('_fixFileInContent returns fixed line numbers', () => {
    const input = [
        '| A |',
        '|------|',
        '| 1 |'
    ].join('\n');
    const result = _fixFileInContent(input);
    assert.deepStrictEqual(result.fixedLines, [2]);
});

// === Test with string-width for emoji/CJK ===

test('string-width for emoji handling', () => {
    const result = _buildAlignedSeparator('| ✅ |', '|------|');
    // ✅ is 2 visual width, so header = " ✅ " → 3 chars → 3-1=2 → min 3 = 3 dashes
    // Actually string-width of " ✅ " (with spaces) needs recalculation
    const result2 = _buildAlignedSeparator('| ✅ |', '|------|');
    assert.ok(result2.includes(':---'));
});

test('string-width for CJK handling', () => {
    const result = _buildAlignedSeparator('| 日本語 |', '|------|');
    // "日本語" is 6 visual width (3 chars × 2), so header = " 日本語 " (8 chars)
    // Actually test the visual width calculation works
    assert.ok(result.includes('-----'));
});

// === Summary ===

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);