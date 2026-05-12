#!/usr/bin/env node

/**
 * Check fenced code blocks in markdown files.
 * Replaces the brittle bash version.
 * Verifies: matched counts/types, no bare-lang closers.
 * Note: Empty openers ARE allowed per AGENTS.md (MD040 is disabled).
 */

const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    if (!fs.existsSync(filePath)) return 0;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let issues = 0;

    let inFence = false;
    let openerChar = '';
    let openerCount = 0;
    let openerLine = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match up to 3 spaces of indentation, then 3+ backticks or tildes
        const match = line.match(/^( {0,3})(`{3,}|~{3,})(.*)$/);
        
        if (match) {
            const indent = match[1];
            const fence = match[2];
            const rest = match[3];
            const char = fence[0];
            const count = fence.length;

            if (!inFence) {
                // Opening a fence
                // In markdown, backtick fences cannot have backticks in their info string
                if (char === '`' && rest.includes('`')) {
                    continue; // Not a valid opener, just text
                }
                
                inFence = true;
                openerChar = char;
                openerCount = count;
                openerLine = i + 1;
            } else {
                // We are inside a fence.
                // To close, the character must match the opener, and length must be >= opener.
                if (char === openerChar && count >= openerCount) {
                    // Check for invalid closer (has trailing non-whitespace text)
                    if (rest.trim().length > 0) {
                        console.log(`[BAD_CLOSER] ${filePath}:${i + 1} | lang='${rest.trim()}' | expected clean closer`);
                        issues++;
                    }
                    inFence = false;
                    openerChar = '';
                    openerCount = 0;
                    openerLine = 0;
                }
            }
        }
    }

    if (inFence) {
        console.log(`[UNCLOSED_FENCE] ${filePath}:${openerLine} | File ended before fence was closed`);
        issues++;
    }

    return issues;
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
    if (args.length === 0) {
        console.error("Usage: check-fences.js <file-or-dir>...");
        process.exit(1);
    }

    let totalIssues = 0;
    const files = [];

    for (const arg of args) {
        if (!fs.existsSync(arg)) continue;
        if (fs.statSync(arg).isDirectory()) {
            files.push(...findMdFiles(arg));
        } else {
            files.push(arg);
        }
    }

    for (const file of files) {
        totalIssues += checkFile(file);
    }

    if (totalIssues === 0) {
        console.log("All fences clean.");
        process.exit(0);
    } else {
        console.log(`\nFound ${totalIssues} fence issue(s).`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
