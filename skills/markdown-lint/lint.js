#!/usr/bin/env node
/**
 * Markdown Lint Pipeline — wraps fix-tables.js + pad-tables.js + markdownlint-cli2
 * Pure Node.js implementation for cross-platform compatibility.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const FORMAT_TABLES = path.join(SCRIPT_DIR, 'references', 'format-tables.js');
const CONFIG = path.join(SCRIPT_DIR, 'references', '.markdownlint.json');
const CHECK_FENCES = path.join(SCRIPT_DIR, 'scripts', 'check-fences.js');

function usage() {
    console.error("Usage: node lint.js [--check] [--all] [--fences] [--validate] [--dry-run] <path>");
    console.error("  --check      Read-only check (exit 0 if clean)");
    console.error("  --all        Treat <path> as a directory, fix all .md files");
    console.error("  --fences     Check fenced code blocks (unmatched markers, bad closers)");
    console.error("  --validate   Validate table column consistency (exit 1 if mismatches)");
    console.error("  --dry-run    Show what would be fixed without applying changes");
    process.exit(1);
}

let CHECK = false;
let ALL = false;
let FENCES = false;
let VALIDATE = false;
let DRY_RUN = false;
let TARGET = "";

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--check') CHECK = true;
    else if (arg === '--all') ALL = true;
    else if (arg === '--fences') FENCES = true;
    else if (arg === '--validate') VALIDATE = true;
    else if (arg === '--dry-run' || arg === '-n') DRY_RUN = true;
    else if (arg.startsWith('-')) usage();
    else TARGET = arg;
}

if (!TARGET) usage();

// Normalize TARGET directory path to remove trailing slash if present
if (ALL || (fs.existsSync(TARGET) && fs.statSync(TARGET).isDirectory())) {
    TARGET = TARGET.replace(/[/\\]$/, '');
}

function runNodeScript(scriptPath, ...scriptArgs) {
    const res = spawnSync(process.execPath, [scriptPath, ...scriptArgs], { stdio: 'inherit' });
    if (res.error) {
        console.error(`Error running ${scriptPath}:`, res.error);
        process.exit(1);
    }
    return res.status;
}

function runNpx(args) {
    const isWindows = process.platform === 'win32';
    const cmd = isWindows ? 'npx.cmd' : 'npx';
    const res = spawnSync(cmd, args, { stdio: 'inherit', shell: isWindows });
    if (res.error) {
        console.error(`Error running npx:`, res.error);
        process.exit(1);
    }
    return res.status;
}

if (FENCES) {
    process.exit(runNodeScript(CHECK_FENCES, TARGET));
}

if (VALIDATE) {
    const argsToPass = ['--validate'];
    if (ALL || fs.statSync(TARGET).isDirectory()) argsToPass.push('--all');
    argsToPass.push(TARGET);
    process.exit(runNodeScript(FORMAT_TABLES, ...argsToPass));
}

// Step 1: Format tables (fix separators + pad cells) in a single pass
if (!CHECK && !DRY_RUN) {
    const argsToPass = [];
    if (ALL || fs.statSync(TARGET).isDirectory()) argsToPass.push('--all');
    argsToPass.push(TARGET);
    const status = runNodeScript(FORMAT_TABLES, ...argsToPass);
    if (status !== 0) process.exit(status);
} else if (DRY_RUN) {
    console.log("=== Dry Run Mode ===");
    console.log(`Would format tables with: node ${FORMAT_TABLES}`);
    runNodeScript(FORMAT_TABLES, '--check', TARGET);
    console.log("Would run markdownlint with --fix");
    process.exit(0);
}

// Step 2: markdownlint with skill config
const lintArgs = ['markdownlint-cli2', '--config', CONFIG];
const targetPath = (ALL || fs.statSync(TARGET).isDirectory()) ? `${TARGET}/**/*.md` : TARGET;
lintArgs.push(targetPath);

if (!CHECK) {
    lintArgs.push('--fix');
}

const status = runNpx(lintArgs);
process.exit(status ?? 1);
