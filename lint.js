#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const LINT_JS = path.join(SCRIPT_DIR, 'skills', 'markdown-lint', 'lint.js');

const args = process.argv.slice(2);
const res = spawnSync(process.execPath, [LINT_JS, ...args], { stdio: 'inherit' });
if (res.error) {
    console.error(`Error running ${LINT_JS}:`, res.error);
    process.exit(1);
}
process.exit(res.status ?? 0);
