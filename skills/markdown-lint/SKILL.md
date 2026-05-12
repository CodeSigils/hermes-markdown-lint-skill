---
name: markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files. Run immediately after
  creating or editing any .md file to enforce consistent formatting. Uses
  markdownlint-cli2 via npx and format-tables.js for single-pass table formatting.
version: 2.9.1
author: CodeSigils
license: MIT
metadata:
  hermes:
    tags: [markdown, lint, gfm, github, formatting, quality, documentation]
    category: devtools
---

# Markdown Lint

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules.

This skill uses bundled Node.js scripts plus **markdownlint-cli2** via `npx`.

Load this skill whenever you create or edit a Markdown file.

## Agent Requirements

Agents using this skill MUST:

1. Run `node ${HERMES_SKILL_DIR}/lint.js <path>` immediately after creating or editing any `.md` file
2. Use `node ${HERMES_SKILL_DIR}/lint.js --check <path>` for read-only validation
3. Use `node ${HERMES_SKILL_DIR}/lint.js --fences <path>` before committing Markdown with fenced code blocks
4. Use `node ${HERMES_SKILL_DIR}/lint.js --validate <path>` before pushing Markdown tables
5. Avoid direct `npx markdownlint-cli2` calls unless debugging this skill itself

Do not batch multiple Markdown edits and lint later. Lint each changed Markdown file immediately.

## When to Use

- After creating a new `.md` file
- After editing an existing `.md` file
- Before committing Markdown to a repository
- When checking documentation quality

## Prerequisites

Before installing, ensure your environment meets the following requirements:

- **Hermes CLI** — Required to install the skill. The `post-write.js` hook is an optional safety net.
- **Node.js (v18+)** — The linting pipeline relies on native Node.js scripts and `npx` to dynamically fetch `markdownlint-cli2` without requiring global installations.
- **Cross-Platform** — The pipeline runs natively on Linux, macOS, and Windows. No WSL or Git Bash required!

## Skill Structure

```text
.
├── AGENTS.md
├── lint.js                      # Developer wrapper
├── README.md
├── skills/
│   └── markdown-lint/           # <-- The actual skill payload
│       ├── SKILL.md
│       ├── lint.js              # Canonical entry point
│       ├── scripts/
│       │   ├── check-fences.js  # Fenced code block checker
│       │   └── post-write.js    # Auto-lint hook
│       └── references/
│           ├── format-tables.js
│           └── .markdownlint.json
└── test/
    └── kitchensink.md
```

## GFM Rules Reference

markdownlint implements MD001-MD069 rules. Config lives in `references/.markdownlint.json`.

### Explicitly configured rules

| Rule  | Title                       | Description                                    | Config           |
| :---- | :-------------------------- | :--------------------------------------------- | :--------------- |
| MD003 | heading-style               | Use ATX headings (`#` style)                   | `atx`            |
| MD007 | ul-indent                   | Unordered list indent                          | 2 spaces         |
| MD009 | no-trailing-spaces          | Trailing spaces                                | 2 spaces allowed |
| MD010 | no-hard-tabs                | No hard tabs                                   | enabled          |
| MD012 | no-multiple-blanks          | Multiple blanks                                | max 1            |
| MD013 | line-length                 | Line length                                    | disabled         |
| MD014 | commands-show-output        | No dollar signs before commands without output | enabled          |
| MD024 | multiple-headings           | Same text in multiple sections                 | disabled         |
| MD025 | multiple-h1                 | Multiple top-level headings                    | disabled         |
| MD026 | no-punctuation-at-end       | No trailing punctuation on headings            | `.,;:!`          |
| MD029 | ol-prefix                   | Ordered list prefix style                      | ordered          |
| MD030 | list-marker-space           | Spaces after list markers                      | enabled          |
| MD032 | blanks-around-lists         | Lists surrounded by blank lines                | enabled          |
| MD033 | no-inline-html              | Inline HTML                                    | disabled         |
| MD034 | no-bare-urls                | Bare URLs                                      | disabled         |
| MD035 | hr-style                    | Horizontal rule style                          | `---`            |
| MD036 | emphasis-instead-of-heading | Emphasis instead of heading                    | disabled         |
| MD040 | fenced-code-language        | Fenced code language                           | disabled         |
| MD041 | first-line-heading          | First line is a top-level heading              | enabled          |
| MD045 | no-alt-text                 | Images need alt text                           | enabled          |
| MD046 | code-block-style            | Fenced code blocks                             | `fenced`         |
| MD047 | single-trailing-newline     | File ends with newline                         | enabled          |
| MD048 | code-fence-style            | Backtick fences                                | `backtick`       |
| MD051 | no-bare-reference-link      | Bare reference links                           | disabled         |
| MD052 | no-bare-reference-link      | Links without text                             | disabled         |
| MD055 | table-pipe-style            | Consistent leading/trailing pipes              | disabled         |
| MD060 | table-column-style          | Pipes align with columns                       | `aligned`        |
