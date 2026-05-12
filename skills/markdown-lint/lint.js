#!/usr/bin/env node
/**
 * Markdown Lint Pipeline
 *
 * Pipeline:
 *   1. format-tables.js (single-pass table normalization)
 *   2. markdownlint-cli2 (general GFM rule enforcement)
 *
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
    console.error("Usage: node lint.js [--check] [--all] [--fences] [--validate] [--dry-run] <path>...");
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
const TARGETS = [];

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--check') CHECK = true;
    else if (arg === '--all') ALL = true;
    else if (arg === '--fences') FENCES = true;
    else if (arg === '--validate') VALIDATE = true;
    else if (arg === '--dry-run' || arg === '-n') DRY_RUN = true;
    else if (arg.startsWith('-')) usage();
    else TARGETS.push(arg);
}

if (TARGETS.length === 0) usage();

for (let i = 0; i < TARGETS.length; i++) {
    if (ALL || (fs.existsSync(TARGETS[i]) && fs.statSync(TARGETS[i]).isDirectory())) {
        TARGETS[i] = TARGETS[i].replace(/[/\\]$/, '');
    }
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
    let exitCode = 0;
    for (const target of TARGETS) {
        const status = runNodeScript(CHECK_FENCES, target);
        if (status !== 0) exitCode = status;
    }
    process.exit(exitCode);
}

if (VALIDATE) {
    let exitCode = 0;
    for (const target of TARGETS) {
        const argsToPass = ['--validate'];
        if (ALL || (fs.existsSync(target) && fs.statSync(target).isDirectory())) argsToPass.push('--all');
        argsToPass.push(target);
        const status = runNodeScript(FORMAT_TABLES, ...argsToPass);
        if (status !== 0) exitCode = status;
    }
    process.exit(exitCode);
}

if (!CHECK && !DRY_RUN) {
    for (const target of TARGETS) {
        const argsToPass = [];
        if (ALL || (fs.existsSync(target) && fs.statSync(target).isDirectory())) argsToPass.push('--all');
        argsToPass.push(target);
        const status = runNodeScript(FORMAT_TABLES, ...argsToPass);
        if (status !== 0) process.exit(status);
    }
} else if (DRY_RUN) {
    console.log("=== Dry Run Mode ===");
    for (const target of TARGETS) {
        console.log(`Would format tables with: node ${FORMAT_TABLES} ${target}`);
        runNodeScript(FORMAT_TABLES, '--check', target);
    }
    console.log("Would run markdownlint with --fix");
    process.exit(0);
}

const lintArgs = ['markdownlint-cli2', '--config', CONFIG];
for (const target of TARGETS) {
    const isDir = fs.existsSync(target) && fs.statSync(target).isDirectory();
    const targetPath = (ALL || isDir) ? `${target}/**/*.md` : target;
    lintArgs.push(targetPath);
}

if (!CHECK) {
    lintArgs.push('--fix');
}

const status = runNpx(lintArgs);
process.exit(status ?? 0);
