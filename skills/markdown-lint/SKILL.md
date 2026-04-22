---
name: markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files. Run after creating
  or editing any .md file to enforce consistent formatting. Uses markdownlint
  via npx for zero-install linting and fix-tables.js for table separators.
version: 2.2.0
author: CodeSigils
license: MIT
metadata:
  hermes:
    tags: [markdown, lint, gfm, github, formatting, quality, documentation]
    category: devtools
required_environment_variables: []
required_commands: ["npx"]
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

This skill uses **npx** which comes with Node.js. Hermes already has Node.js available.

## Quick Start

### Two-step pipeline (recommended for all docs)

```bash
${HERMES_SKILL_DIR}/references/fix-tables.js <path> && npx markdownlint-cli2 <path> --fix
```

Step 1 normalizes table separators to `| :--- | :--- |` left-aligned style.
Step 2 fixes everything else.

### Lint only (read-only check)

```bash
npx markdownlint-cli2 <path>
```

## Workflows

### 1. After Creating a New File

1. Create the file
2. Run the fix command:

```bash
${HERMES_SKILL_DIR}/references/fix-tables.js <path> && npx markdownlint-cli2 <path> --fix
```

Done — the file is GFM-compliant.

### 2. Batch Fix All Markdown in a Project

```bash
find . -name "*.md" -exec ${HERMES_SKILL_DIR}/references/fix-tables.js {} \; && npx markdownlint-cli2 . --fix
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

markdownlint implements MD001–MD060 rules. Key rules enforced:

| Rule | Title | Description |
| --- | --- | --- |
| MD003 | heading-style | Use ATX headings (`#` style) |
| MD004 | ul-style | Use dash (`-`) for unordered lists |
| MD007 | ul-indent | Unordered list indent = 2 spaces |
| MD009 | no-trailing-spaces | No trailing spaces |
| MD010 | no-hard-tabs | No hard tabs |
| MD012 | no-multiple-blanks | Max one blank line between paragraphs |
| MD022 | blanks-around-headings | Blank line before and after headings |
| MD029 | ol-prefix | Ordered list prefix style |
| MD030 | list-marker-space | Spaces after list markers |
| MD031 | blanks-around-fences | Blank line around fenced code blocks |
| MD035 | hr-style | Horizontal rule style `---` |
| MD046 | code-block-style | Use fenced code blocks |
| MD048 | code-fence-style | Use backticks for code fences |

Rules **disabled** (too strict for prose documentation):

| Rule | Title | Why Disabled |
| --- | --- | --- |
| MD013 | line-length | Prose lines are naturally longer |
| MD024 | multiple-headings | Same h2 text in different sections is valid |
| MD025 | multiple-h1 | Multiple top-level headings allowed |
| MD032 | list-indent | Lists can vary by content |
| MD033 | no-inline-html | GFM supports basic inline HTML |
| MD034 | no-bare-urls | Bare URLs auto-link in GFM |
| MD036 | emphasis-instead-of-heading | Valid use case for emphasis |
| MD040 | fenced-code-language | Empty code fences are acceptable |
| MD041 | first-line-heading | Frontmatter makes this noisy |
| MD052 | no-bare-reference-link | Common in prose |
| MD060 | table-column-style | fix-tables.js handles this separately |

## fix-tables.js

Normalizes Markdown table separators from old-style `|------|------|` to GFM-compliant
`| :--- | :--- | :--- |` style with left-aligned cells (`---`).

**Features:**
- Auto-width column alignment (matches header column lengths)
- Detects already-correct separators and skips them
- Verbose output option

### Location

```
${HERMES_SKILL_DIR}/references/fix-tables.js
```

### Usage

```bash
# Fix specific file
${HERMES_SKILL_DIR}/references/fix-tables.js <path>

# Fix all .md in directory
${HERMES_SKILL_DIR}/references/fix-tables.js --all <directory>

# Verbose output
${HERMES_SKILL_DIR}/references/fix-tables.js -v <path>

# Check only (exit non-zero if fixes needed)
${HERMES_SKILL_DIR}/references/fix-tables.js --check <path>
```

### How It Works

1. Scans for lines matching the table separator pattern
2. Detects column alignment from separator dashes
3. Replaces old-style separator with `| :--- |` matching the exact column count
4. Auto-width: calculates width based on header column lengths
5. Leaves all data rows and already-correct separators untouched

## Troubleshooting

### markdownlint-cli2: command not found

Hermes includes Node.js via npx. No manual installation needed.

### Config file not found

Run from the project root:

```bash
cd ~/my-project
npx markdownlint-cli2 . --fix
```

Or pass the config explicitly:

```bash
npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json . --fix
```

### `--fix` does not fix everything in one pass

Known behavior. Run twice if needed:

```bash
npx markdownlint-cli2 <path> --fix
npx markdownlint-cli2 <path> --fix
```

## Verification

Run the lint check to verify GFM compliance:

```bash
npx markdownlint-cli2 <path>
```

Exit code 0 means no violations.

## Quick Reference

| Task | Command |
| --- | --- |
| Fix file | `${HERMES_SKILL_DIR}/references/fix-tables.js <path> && npx markdownlint-cli2 <path> --fix` |
| Fix all | `find . -name "*.md" -exec ${HERMES_SKILL_DIR}/references/fix-tables.js {} \; && npx markdownlint-cli2 . --fix` |
| Check only | `npx markdownlint-cli2 <path>` |
| With config | `npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix` |