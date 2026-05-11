#!/usr/bin/env node
/**
 * Shell hook for post_tool_call — lints markdown files after write_file
 * Receives JSON payload via stdin from Hermes.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const LINT = path.join(SCRIPT_DIR, '..', 'lint.js');

try {
    const payload = fs.readFileSync(0, 'utf8');
    if (payload) {
        const json = JSON.parse(payload);
        const filePath = json.tool_input?.path || '';

        if (filePath.endsWith('.md') && fs.existsSync(filePath)) {
            // Run lint
            spawnSync(process.execPath, [LINT, filePath], { stdio: 'inherit' });
        }
    }
} catch (e) {
    // Ignore parse errors or read errors
}

// Output empty JSON (return value ignored for post_tool_call)
console.log('{}');
