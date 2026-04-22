#!/usr/bin/env node
/**
 * Normalize markdown table separators to GFM-compliant format.
 *
 * Fixes MD060 (table-column-style) by aligning separator pipes with header columns.
 * Converts old-style separators like |------|------| to GFM-compliant
 * | :--- | :--- | format with proper column alignment.
 *
 * Usage:
 *     node fix-tables.js <file.md>
 *     node fix-tables.js <file.md> <file2.md> ...
 *     node fix-tables.js --all <directory>
 *     node fix-tables.js --check <file.md>
 *     node fix-tables.js --stdout <file.md>
 *     cat file.md | node fix-tables.js --stdout
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function _parseCellsRaw(line) {
    const cells = [];
    const parts = line.split('|');
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === 0 && part === '') continue;
        if (i === parts.length - 1 && part === '') continue;
        cells.push(part);
    }
    return cells;
}

function _parseCells(line) {
    return _parseCellsRaw(line).map(c => c.trim());
}

function _isSeparatorLine(line) {
    const stripped = line.trim();
    if (!stripped.startsWith('|')) {
        return false;
    }
    const hasTrailingPipe = stripped.endsWith('|');
    const cells = _parseCellsRaw(stripped);
    return cells.every(cell => {
        const c = cell.trim();
        if (c === '') return true;
        const cleaned = c.replace(/:/g, '');
        return cleaned.length >= 3 && /^-{3,}$/.test(cleaned);
    });
}

function _normalizeCell(cell) {
    const inner = cell.trim();
    const leading = inner.startsWith(':');
    const trailing = inner.endsWith(':');
    const center = leading && trailing;

    if (center) return ':---:';
    if (trailing) return '---:';
    return ':---';
}

function _getSeparatorAlignment(cell) {
    const inner = cell.trim();
    if (inner.startsWith(':') && inner.endsWith(':')) return 'center';
    if (inner.endsWith(':')) return 'right';
    return 'left';
}

function _buildAlignedSeparator(headerLine, separatorLine) {
    const headerCells = _parseCells(headerLine);
    const separatorCells = _parseCellsRaw(separatorLine.trim());
    const alignments = separatorCells.map(c => _getSeparatorAlignment(c.trim()));

    const parts = [];
    for (let i = 0; i < headerCells.length; i++) {
        const align = alignments[i] || 'left';
        const cellWidth = Math.max(headerCells[i].length, 3);
        const minDashes = Math.max(3, cellWidth);
        let sep;
        if (align === 'center') {
            sep = ':' + '-'.repeat(minDashes) + ':';
        } else if (align === 'right') {
            sep = '-'.repeat(minDashes) + ':';
        } else {
            sep = ':' + '-'.repeat(minDashes);
        }
        parts.push(' ' + sep + ' ');
    }

    return '|' + parts.join('|') + '|';
}

function _fixFileInContent(content) {
    const hasTrailingNewline = content.endsWith('\n');
    const lines = content.split('\n');
    const newLines = [...lines];
    let changed = 0;
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!_isSeparatorLine(line)) continue;

        if (i === 0) continue;
        const headerLine = lines[i - 1];
        if (!_parseCellsRaw(headerLine).length) continue;

        const cells = _parseCellsRaw(line.trim());
        if (_isSeparatorAlreadyCorrect(cells)) {
            continue;
        }

        const newSep = _buildAlignedSeparator(headerLine, line);
        newLines[i] = newSep;
        changed++;
        fixedLines.push(i + 1);
    }

    let newContent = newLines.join('\n');
    if (hasTrailingNewline && !newContent.endsWith('\n')) {
        newContent += '\n';
    }

    if (changed === 0) {
        return { content, changed: 0, fixedLines: [] };
    }
    return { content: newContent, changed, fixedLines };
}

function _isSeparatorAlreadyCorrect(cells) {
    return cells.every(c => {
        const t = c.trim();
        return t === ':---' || t === '---:' || t === ':---:';
    });
}

function fixFile(filePath, options = {}) {
    const { dryRun = false, verbose = false } = options;

    const content = fs.readFileSync(filePath, 'utf8');
    const { content: fixedContent, changed, fixedLines } = _fixFileInContent(content);

    if (changed) {
        if (!dryRun) {
            fs.writeFileSync(filePath, fixedContent, 'utf8');
            if (!verbose) {
                console.log(`  Fixed ${changed} table separator(s) in ${filePath}`);
            }
        } else {
            console.log(`  Would fix ${changed} table separator(s) in ${filePath}`);
        }

        if (verbose && fixedLines.length) {
            for (const lineno of fixedLines) {
                console.log(`    Line ${lineno}`);
            }
        }
    }

    return changed;
}

function fixStdin() {
    let content = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { content += chunk; });
    process.stdin.on('end', () => {
        const { content: fixedContent, changed } = _fixFileInContent(content);
        process.stdout.write(fixedContent);
    });
}

function main() {
    const args = process.argv.slice(2);

    if (args.includes('--stdout') || args.includes('-s')) {
        return fixStdin();
    }

    const files = [];
    let dryRun = false;
    let verbose = false;
    let directory = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--check') {
            dryRun = true;
        } else if (args[i] === '-v' || args[i] === '--verbose') {
            verbose = true;
        } else if (args[i] === '--all') {
            directory = args[++i];
        } else if (!args[i].startsWith('-')) {
            files.push(args[i]);
        }
    }

    if (!files.length && !directory) {
        console.error('Usage: node fix-tables.js <file.md>...');
        console.error('       node fix-tables.js --all <directory>');
        console.error('       node fix-tables.js --check <file.md>');
        console.error('       node fix-tables.js --stdout <file.md');
        process.exit(1);
    }

    if (directory) {
        const pattern = path.join(directory, '**/*.md');
        const matches = glob.sync(pattern);
        files.push(...matches);
    }

    let total = 0;
    for (const f of files) {
        if (!fs.existsSync(f)) continue;
        if (fs.statSync(f).isDirectory()) {
            console.error(`Skipping directory: ${f} (use --all)`);
            continue;
        }
        total += fixFile(f, { dryRun, verbose });
    }

    if (total === 0) {
        console.log('No table separators to fix.');
        if (dryRun) process.exit(0);
    } else {
        console.log(`Total: ${total} separator(s) fixed in ${files.length} file(s).`);
    }

    if (dryRun && total > 0) process.exit(1);
}

if (require.main === module) {
    main();
}

module.exports = { fixFile, fixStdin, _fixFileInContent, _isSeparatorLine };