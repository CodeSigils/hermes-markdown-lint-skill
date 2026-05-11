---
name: markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files. Run after creating
  or editing any .md file to enforce consistent formatting. Uses markdownlint
  via npx for zero-install linting and format-tables.js for single-pass table formatting.
license: MIT
metadata:
  version: 2.9.0
  author: CodeSigils
  hermes:
    tags: [markdown, lint, gfm, github, formatting, quality, documentation]
    category: devtools
---

# Markdown Lint

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules.

This skill uses **markdownlint** via `npx` — zero install, works anywhere Node.js works.

Load this skill whenever you create or edit a Markdown file.

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

## Quick Start

### One-liner (recommended)

```text
node ${HERMES_SKILL_DIR}/lint.js <path>
```

This runs the full pipeline in one command: format tables (fix separators + pad cells), then lint and auto-fix everything else.

### Options

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>           # Fix file or directory
node ${HERMES_SKILL_DIR}/lint.js --check <path>   # Read-only check (exit 0 if clean)
node ${HERMES_SKILL_DIR}/lint.js --all <dir>      # Fix all .md in directory
node ${HERMES_SKILL_DIR}/lint.js --validate <path> # Validate table column consistency
node ${HERMES_SKILL_DIR}/lint.js --fences <path>  # Check fenced code blocks
```

### Manual pipeline

If you prefer running steps separately:

```bash
node ${HERMES_SKILL_DIR}/references/format-tables.js <path> && npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix
```

Step 1 formats all tables in a single pass (fixes separators + pads cells).
Step 2 fixes everything else.

### Lint only (read-only check)

```bash
npx markdownlint-cli2 <path>
```

## Agent Rule: Always Lint After Writing Markdown

> [!IMPORTANT]
> After **every** `write_file` call that targets a `.md` file, you MUST immediately run the linter on that file — without being asked. This is non-negotiable and applies to every file write, including edits, refactors, and new files.

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>
```

Do NOT skip this step. Do NOT wait for the user to ask. Do NOT batch multiple writes and lint later — lint each file immediately after it is written.

## Workflows

### 1. After Creating or Editing a Markdown File

1. Write the file using `write_file`.
2. **Immediately** run the linter (this is mandatory — see rule above):

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>
```

Done — the file is GFM-compliant.

### 2. Batch Fix All Markdown in a Project

```bash
node ${HERMES_SKILL_DIR}/lint.js --all .
```

### 3. CI / Pre-commit Check (read-only)

```bash
npx markdownlint-cli2 <path>
```

## Configuration

### Using bundled config

Copy the reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json ./.markdownlint.json
```

Or pass explicitly:

```bash
npx markdownlint-cli2 --config ~/.hermes/skills/markdown-lint/references/.markdownlint.json <path> --fix
```

## GFM Rules Reference

markdownlint implements MD001-MD060 rules. Key rules enforced:

| Rule  | Title                  | Description                                |
| :---- | :--------------------- | :----------------------------------------- |
| MD003 | heading-style          | Use ATX headings (`#` style)               |
| MD007 | ul-indent              | Unordered list indent = 2 spaces           |
| MD009 | no-trailing-spaces     | No trailing spaces                         |
| MD010 | no-hard-tabs           | No hard tabs                               |
| MD012 | no-multiple-blanks     | Max one blank line between paragraphs      |
| MD022 | blanks-around-headings | Blank line before and after headings       |
| MD026 | no-duplicate-heading   | No duplicate headings in the same document |
| MD029 | ol-prefix              | Ordered list prefix style                  |
| MD030 | list-marker-space      | Spaces after list markers                  |
| MD031 | blanks-around-fences   | Blank line around fenced code blocks       |
| MD032 | blanks-around-lists    | Lists should be surrounded by blank lines  |
| MD035 | hr-style               | Horizontal rule style `---`                |
| MD046 | code-block-style       | Use fenced code blocks                     |
| MD047 | single-h1              | File should start with a single h1 heading |
| MD048 | code-fence-style       | Use backticks for code fences              |
| MD060 | table-column-style     | Table pipes must align with header columns |

Rules **disabled** (too strict for prose documentation):

| Rule  | Title                       | Why Disabled                                |
| :---- | :-------------------------- | :------------------------------------------ |
| MD013 | line-length                 | Prose lines are naturally longer            |
| MD024 | multiple-headings           | Same h2 text in different sections is valid |
| MD025 | multiple-h1                 | Multiple top-level headings allowed         |
| MD033 | no-inline-html              | Inline HTML is allowed in GFM               |
| MD034 | no-bare-urls                | Bare URLs auto-link in GFM                  |
| MD036 | emphasis-instead-of-heading | Valid use case for emphasis                 |
| MD040 | fenced-code-language        | Code fences don't always need a language    |
| MD041 | first-line-heading          | Frontmatter makes this noisy                |
| MD045 | no-image-size               | Images need dimensions sometimes            |
| MD052 | no-bare-reference-link      | Common in prose                             |
| MD055 | table-pipe-style            | No leading/trailing pipes enforced          |

## format-tables.js

Single-pass table formatter that combines separator normalization and cell padding
into one file read/write cycle. Required by **MD060** — ensures every `|` in every
row aligns with the column boundaries set by the header.

**Features:**

- Fixes separator alignment (`:---`, `---:`, `:---:`)
- Computes max column width from header + all data rows (string-width aware for emoji/CJK)
- Rebuilds header, separator, and every data row with consistent pipe positions
- Fence-aware — never modifies table syntax inside fenced code blocks
- Idempotent — skips files that are already correctly formatted

```bash
# Check if formatting is needed (read-only)
node ${HERMES_SKILL_DIR}/references/format-tables.js --check <path>
```

## Troubleshooting

### markdownlint-cli2: command not found

In some Hermes environments, npx may not be in PATH. Use the full path explicitly:

```bash
/usr/share/nodejs/corepack/shims/npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix
```

The bundled `lint.js` handles this automatically — prefer it over running npx directly.

### Config file not found

The bundled `lint.js` auto-locates the config — use it:

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>
```

Or pass the config explicitly with a full npx path:

```bash
/usr/share/nodejs/corepack/shims/npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix
```

### `--fix` does not fix everything in one pass

Known behavior. Run twice if needed:

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>
node ${HERMES_SKILL_DIR}/lint.js <path>
```

## Verification

Run the lint check to verify GFM compliance:

```bash
node ${HERMES_SKILL_DIR}/lint.js --check <path>
```

Exit code 0 means no violations.

### Code Fence Check

Fenced code blocks are a common source of subtle corruption (e.g. backtick content interpreted as shell, broken opener/closer pairs). Run the dedicated fence checker:

```bash
node ${HERMES_SKILL_DIR}/lint.js --fences <path>
```

Or directly:

```bash
node ${HERMES_SKILL_DIR}/scripts/check-fences.js <path>
```

Exit code 0 = all fences clean. The checker verifies:

- Openers and closers have matching marker characters (\` vs ~).

- Every closer is bare (` ``` ` with nothing after)

- Backtick/tilde count matches between opener and closer (closer must be >= opener)

- No double-fence bug (adjacent fence lines merged as one block)

## Quick Reference

| Task            | Command                                                                                                                                                        |
| :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fix file        | `node ${HERMES_SKILL_DIR}/lint.js <path>`                                                                                                                      |
| Fix all         | `node ${HERMES_SKILL_DIR}/lint.js --all .`                                                                                                                     |
| Check only      | `node ${HERMES_SKILL_DIR}/lint.js --check <path>`                                                                                                              |
| Check fences    | `node ${HERMES_SKILL_DIR}/lint.js --fences <path>`                                                                                                             |
| Validate tables | `node ${HERMES_SKILL_DIR}/lint.js --validate <path>`                                                                                                           |
| Manual steps    | `node ${HERMES_SKILL_DIR}/references/format-tables.js <path> && npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix` |
