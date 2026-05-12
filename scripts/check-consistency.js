#!/usr/bin/env node

/**
 * Repository consistency checker.
 *
 * Verifies:
 * - markdownlint config exists and matches documented rule rows
 * - AGENTS.md and SKILL.md rule tables include every explicitly configured rule
 * - README.md carries current version, changelog, and canonical lint guidance
 * - GitHub Actions uses ci.yml as the single validation workflow
 */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONFIG = path.join(ROOT, "skills", "markdown-lint", "references", ".markdownlint.json");
const AGENTS = path.join(ROOT, "AGENTS.md");
const README = path.join(ROOT, "README.md");
const SKILL = path.join(ROOT, "skills", "markdown-lint", "SKILL.md");
const CI = path.join(ROOT, ".github", "workflows", "ci.yml");
const TEST_WORKFLOW = path.join(ROOT, ".github", "workflows", "test.yml");

const EXPECTED_RULES = [
    ["MD003", "heading-style", "Atx style headings", "Use ATX headings (`#` style)", "`atx`"],
    ["MD007", "ul-indent", "List indent", "Unordered list indent", "2 spaces"],
    ["MD009", "no-trailing-spaces", "No trailing spaces", "Trailing spaces", "2 spaces allowed"],
    ["MD010", "no-hard-tabs", "No hard tabs", "No hard tabs", "enabled"],
    ["MD012", "no-multiple-blanks", "Multiple blanks", "Multiple blanks", "max 1"],
    ["MD013", "line-length", "Line length", "Line length", "disabled"],
    ["MD014", "commands-show-output", "No dollar signs before commands without output", "No dollar signs before commands without output", "enabled"],
    ["MD024", "multiple-headings", "Multiple headings same content", "Same text in multiple sections", "disabled"],
    ["MD025", "multiple-h1", "Multiple top-level headings", "Multiple top-level headings", "disabled"],
    ["MD026", "no-punctuation-at-end", "No punctuation after heading", "No trailing punctuation on headings", "`.,;:!`"],
    ["MD029", "ol-prefix", "Ordered list style", "Ordered list prefix style", "ordered"],
    ["MD030", "list-marker-space", "List marker space", "Spaces after list markers", "enabled"],
    ["MD032", "blanks-around-lists", "Blanks around lists", "Lists surrounded by blank lines", "enabled"],
    ["MD033", "no-inline-html", "No inline HTML", "Inline HTML", "disabled"],
    ["MD034", "no-bare-urls", "No bare URLs", "Bare URLs", "disabled"],
    ["MD035", "hr-style", "Horizontal rule style", "Horizontal rule style", "`---`"],
    ["MD036", "emphasis-instead-of-heading", "Emphasis in headings", "Emphasis instead of heading", "disabled"],
    ["MD040", "fenced-code-language", "Fenced code language", "Fenced code language", "disabled"],
    ["MD041", "first-line-heading", "First line is top-level heading", "First line is a top-level heading", "enabled"],
    ["MD045", "no-alt-text", "No alt text (images)", "Images need alt text", "enabled"],
    ["MD046", "code-block-style", "Code block style", "Fenced code blocks", "`fenced`"],
    ["MD047", "single-trailing-newline", "Single trailing newline", "File ends with newline", "enabled"],
    ["MD048", "code-fence-style", "Code fence style", "Backtick fences", "`backtick`"],
    ["MD051", "no-bare-reference-link", "Links inline", "Bare reference links", "disabled"],
    ["MD052", "no-bare-reference-link", "Links without text", "Links without text", "disabled"],
    ["MD055", "table-pipe-style", "Table pipe style", "Consistent leading/trailing pipes", "disabled"],
    ["MD060", "table-column-style", "Table column alignment", "Pipes align with columns", "`aligned`"],
];

function fail(message) {
    console.error(`CONSISTENCY ERROR: ${message}`);
    process.exit(1);
}

function read(file) {
    if (!fs.existsSync(file)) {
        fail(`Missing file: ${path.relative(ROOT, file)}`);
    }
    return fs.readFileSync(file, "utf8");
}

function normalize(value) {
    return value.replace(/\s+/g, " ").trim();
}

function splitTableRow(line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return null;
    return trimmed.slice(1, -1).split("|").map((cell) => normalize(cell));
}

function findRuleTable(content, fileLabel) {
    const lines = content.split("\n");
    const headerIdx = lines.findIndex((line) => {
        const cells = splitTableRow(line);
        return cells && cells[0] === "Rule";
    });
    if (headerIdx < 0) fail(`${fileLabel} missing rule table`);

    const rows = new Map();
    for (let i = headerIdx + 2; i < lines.length; i++) {
        const cells = splitTableRow(lines[i]);
        if (!cells || !cells[0].startsWith("MD")) break;
        rows.set(cells[0], cells);
    }
    return rows;
}

function configDisplay(rule, value) {
    if (value === true) return "enabled";
    if (value === false) return "disabled";
    if (rule === "MD003") return `\`${value.style}\``;
    if (rule === "MD007") return `${value.indent} spaces`;
    if (rule === "MD009") return `${value.br_spaces} spaces allowed`;
    if (rule === "MD012") return `max ${value.max}`;
    if (rule === "MD026") return `\`${value.punctuation}\``;
    if (rule === "MD029") return value.style;
    if (rule === "MD035") return `\`${value.style}\``;
    if (rule === "MD046") return `\`${value.style}\``;
    if (rule === "MD048") return `\`${value.style}\``;
    if (rule === "MD060") return `\`${value.style}\``;
    fail(`No display mapping for ${rule}`);
}

function assertRuleDocs(config, agentsContent, skillContent) {
    const configuredRules = Object.keys(config)
        .filter((key) => key.startsWith("MD"))
        .sort();
    const expectedRules = EXPECTED_RULES.map(([rule]) => rule).sort();

    if (configuredRules.join(",") !== expectedRules.join(",")) {
        fail(`Documented rules do not match config. Config=${configuredRules.join(",")} Docs=${expectedRules.join(",")}`);
    }

    const agentsRows = findRuleTable(agentsContent, "AGENTS.md");
    const skillRows = findRuleTable(skillContent, "SKILL.md");

    for (const [rule, title, agentsDesc, skillDesc, expectedConfig] of EXPECTED_RULES) {
        const actualConfig = configDisplay(rule, config[rule]);
        if (actualConfig !== expectedConfig) {
            fail(`${rule} expected config label ${expectedConfig}, derived ${actualConfig}`);
        }

        const agentsRow = agentsRows.get(rule);
        if (!agentsRow) fail(`AGENTS.md missing ${rule}`);
        const [, actualAgentsDesc, actualAgentsConfig] = agentsRow;
        if (actualAgentsDesc !== agentsDesc || actualAgentsConfig !== expectedConfig) {
            fail(`AGENTS.md ${rule} mismatch`);
        }

        const skillRow = skillRows.get(rule);
        if (!skillRow) fail(`SKILL.md missing ${rule}`);
        const [, actualTitle, actualSkillDesc, actualSkillConfig] = skillRow;
        if (actualTitle !== title || actualSkillDesc !== skillDesc || actualSkillConfig !== expectedConfig) {
            fail(`SKILL.md ${rule} mismatch`);
        }
    }
}

function assertReadme(readmeContent, skillContent) {
    const version = skillContent.match(/^version:\s+([^\n]+)/m)?.[1]?.trim();
    if (!version) fail("SKILL.md missing top-level version");

    const author = skillContent.match(/^author:\s+([^\n]+)/m)?.[1]?.trim();
    if (!author) fail("SKILL.md missing top-level author");

    const badgeVersion = readmeContent.match(/version-v([0-9.]+)-blue/)?.[1];
    if (badgeVersion !== version) {
        fail(`README badge version ${badgeVersion || "<missing>"} does not match SKILL.md ${version}`);
    }

    const required = [
        "A self-contained Hermes Agent skill",
        "defines a formal contract for any Markdown file creation or edit",
        "node lint.js --check test/kitchensink.md",
        "### Changelog",
        `#### v${version}`,
        "direct `npx markdownlint-cli2` commands are only for debugging the skill internals",
    ];
    for (const needle of required) {
        if (!readmeContent.includes(needle)) {
            fail(`README.md missing expected text: ${needle}`);
        }
    }

    const stale = [
        "zero-dependency",
        "zero install",
        "npx markdownlint-cli2 --config",
        "pre-commit-hooks",
    ];
    for (const needle of stale) {
        if (readmeContent.includes(needle)) {
            fail(`README.md contains stale text: ${needle}`);
        }
    }
}

function assertWorkflow() {
    if (fs.existsSync(TEST_WORKFLOW)) {
        fail(".github/workflows/test.yml should not exist; ci.yml is canonical");
    }

    const ci = read(CI);
    const required = [
        "node scripts/check-consistency.js",
        "node test/format-tables.test.js",
        "node lint.js --fences .",
        "node lint.js --validate .",
        "node lint.js --check .",
    ];
    for (const needle of required) {
        if (!ci.includes(needle)) {
            fail(`ci.yml missing expected command: ${needle}`);
        }
    }
}

const config = JSON.parse(read(CONFIG));
const agentsContent = read(AGENTS);
const readmeContent = read(README);
const skillContent = read(SKILL);

assertRuleDocs(config, agentsContent, skillContent);
assertReadme(readmeContent, skillContent);
assertWorkflow();

console.log("Repository consistency checks passed.");
