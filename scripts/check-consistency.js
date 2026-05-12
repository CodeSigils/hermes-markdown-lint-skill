#!/usr/bin/env node

/**
 * Repository consistency checker.
 *
 * Verifies:
 * - markdownlint config exists
 * - AGENTS.md references canonical MD060 style
 * - SKILL.md references canonical MD060 style
 * - README.md references canonical MD060 style
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONFIG = path.join(ROOT, 'skills', 'markdown-lint', 'references', '.markdownlint.json');
const AGENTS = path.join(ROOT, 'AGENTS.md');
const README = path.join(ROOT, 'README.md');
const SKILL = path.join(ROOT, 'skills', 'markdown-lint', 'SKILL.md');

function fail(message) {
    console.error(`CONSISTENCY ERROR: ${message}`);
    process.exit(1);
}

function read(file) {
    if (!fs.existsSync(file)) {
        fail(`Missing file: ${file}`);
    }
    return fs.readFileSync(file, 'utf8');
}

const config = JSON.parse(read(CONFIG));
const md060 = config.MD060?.style;

if (md060 !== 'aligned') {
    fail(`Expected MD060 style 'aligned', found '${md060}'`);
}

const checks = [
    [AGENTS, 'MD060', '`aligned`'],
    [README, 'aligned separators'],
    [SKILL, 'table-column-style', '`aligned`'],
];

for (const [file, ...needles] of checks) {
    const content = read(file);
    for (const needle of needles) {
        if (!content.includes(needle)) {
            fail(`${path.basename(file)} missing expected text: ${needle}`);
        }
    }
}

console.log('Repository consistency checks passed.');
