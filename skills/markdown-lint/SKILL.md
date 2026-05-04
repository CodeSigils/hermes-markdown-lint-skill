---
name: markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files. Run after creating
  or editing any .md file to enforce consistent formatting. Uses markdownlint
  via npx for zero-install linting and fix-tables.js for table separators.
license: MIT
metadata:
  version: 2.6.0
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

This skill uses **npx** which comes with Node.js. Hermes already has Node.js available.

## Quick Start

### One-liner (recommended)

```text
${HERMES_SKILL_DIR}/lint.sh <path>
```

This runs the full two-step pipeline in one command: fix tables, then lint and auto-fix everything else.

### Options

```bash
${HERMES_SKILL_DIR}/lint.sh <path>         # Fix file or directory
${HERMES_SKILL_DIR}/lint.sh --check <path>  # Read-only check (exit 0 if clean)
${HERMES_SKILL_DIR}/lint.sh --all <dir>     # Fix all .md in directory
```

### Two-step pipeline (manual)

If you prefer running steps separately:

```bash
node ${HERMES_SKILL_DIR}/references/fix-tables.js <path> && npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix
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
${HERMES_SKILL_DIR}/lint.sh <path>
```

Done — the file is GFM-compliant.

### 2. Batch Fix All Markdown in a Project

```bash
${HERMES_SKILL_DIR}/lint.sh --all .
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

| Rule | Title | Description |
| :--- | :---- | :---------- |
| MD003 | heading-style | Use ATX headings (`#` style) |
| MD007 | ul-indent | Unordered list indent = 2 spaces |
| MD009 | no-trailing-spaces | No trailing spaces |
| MD010 | no-hard-tabs | No hard tabs |
| MD012 | no-multiple-blanks | Max one blank line between paragraphs |
| MD022 | blanks-around-headings | Blank line before and after headings |
| MD026 | no-duplicate-heading | No duplicate headings in the same document |
| MD029 | ol-prefix | Ordered list prefix style |
| MD030 | list-marker-space | Spaces after list markers |
| MD031 | blanks-around-fences | Blank line around fenced code blocks |
| MD032 | blanks-around-lists | Lists should be surrounded by blank lines |
| MD035 | hr-style | Horizontal rule style `---` |
| MD046 | code-block-style | Use fenced code blocks |
| MD047 | single-h1 | File should start with a single h1 heading |
| MD048 | code-fence-style | Use backticks for code fences |
| MD055 | table-pipe-style | Tables should have trailing pipes |
| MD060 | no-inline-html | No HTML in markdown |

Rules **disabled** (too strict for prose documentation):

| Rule | Title | Why Disabled |
| :--- | :---- | :----------- |
| MD013 | line-length | Prose lines are naturally longer |
| MD024 | multiple-headings | Same h2 text in different sections is valid |
| MD025 | multiple-h1 | Multiple top-level headings allowed |
| MD033 | no-inline-html | GFM supports basic inline HTML |
| MD034 | no-bare-urls | Bare URLs auto-link in GFM |
| MD036 | emphasis-instead-of-heading | Valid use case for emphasis |
| MD040 | fenced-code-language | Code fences don't always need a language |
| MD041 | first-line-heading | Frontmatter makes this noisy |
| MD045 | no-image-size | Images need dimensions sometimes |
| MD052 | no-bare-reference-link | Common in prose |

## fix-tables.js

Normalizes Markdown table separators from old-style `|------|------|` to GFM-compliant
`| :--- | :--- | :--- |` style with left-aligned cells (`---`).

**Features:**

- Uses `string-width` for column alignment (handles emoji/CJK correctly)
- Detects already-correct separators and skips them
- Verbose output option

### Location

```text
${HERMES_SKILL_DIR}/references/fix-tables.js
```

### Usage

```bash
# Fix specific file
${HERMES_SKILL_DIR}/lint.sh <path>

# Check only (read-only, exit 0 if clean)
${HERMES_SKILL_DIR}/lint.sh --check <path>

# Fix all .md in directory
${HERMES_SKILL_DIR}/lint.sh --all <directory>
```

### Auto-Lint on Write (Hermes Shell Hook)

Hermes supports `post_tool_call` hooks via `~/.hermes/config.yaml`:

```yaml
hooks:
  post_tool_call:
    - matcher: "write_file"
      command: "~/.hermes/skills/markdown-lint/scripts/post-write.sh"
```

> **Note:** OpenCode does NOT support hooks in `opencode.jsonc`. Do not document OpenCode hook configs — use git pre-commit hooks or shell aliases instead.

The script receives JSON payload via stdin (Hermes shell hook protocol) and lints the file automatically.

### How It Works

1. Scans for lines matching the table separator pattern
2. Detects column alignment from separator dashes
3. Replaces old-style separator with `| :--- |` matching the exact column count
4. Auto-width: calculates width based on header column lengths
5. Leaves all data rows and already-correct separators untouched

## Troubleshooting

### markdownlint-cli2: command not found

In some Hermes environments, npx may not be in PATH. Use the full path explicitly:

```bash
/usr/share/nodejs/corepack/shims/npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix
```

The bundled `lint.sh` handles this automatically — prefer it over running npx directly.

### Config file not found

The bundled `lint.sh` auto-locates the config — use it:

```bash
${HERMES_SKILL_DIR}/lint.sh <path>
```

Or pass the config explicitly with a full npx path:

```bash
/usr/share/nodejs/corepack/shims/npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix
```

### `--fix` does not fix everything in one pass

Known behavior. Run twice if needed:

```bash
${HERMES_SKILL_DIR}/lint.sh <path>
${HERMES_SKILL_DIR}/lint.sh <path>
```

## Verification

Run the lint check to verify GFM compliance:

```bash
${HERMES_SKILL_DIR}/lint.sh --check <path>
```

Exit code 0 means no violations.

### Code Fence Check

Fenced code blocks are a common source of subtle corruption (e.g. backtick content interpreted as shell, broken opener/closer pairs). Run the dedicated fence checker:

```bash
${HERMES_SKILL_DIR}/lint.sh --fences <path>
```

Or directly:

```bash
${HERMES_SKILL_DIR}/scripts/check-fences.sh <path>
```

Exit code 0 = all fences clean. The checker verifies:

- Every opener has a language tag (no empty ` ``` ` openers)

- Every closer is bare (` ``` ` with nothing after)

- Backtick/tilde count matches between opener and closer

- No double-fence bug (adjacent fence lines merged as one block)

## Quick Reference

| Task | Command |
| :--- | :------ |
| Fix file | `${HERMES_SKILL_DIR}/lint.sh <path>` |
| Fix all | `${HERMES_SKILL_DIR}/lint.sh --all .` |
| Check only | `${HERMES_SKILL_DIR}/lint.sh --check <path>` |
| Check fences | `${HERMES_SKILL_DIR}/lint.sh --fences <path>` |
| Manual steps | `node ${HERMES_SKILL_DIR}/references/fix-tables.js <path> && /usr/share/nodejs/corepack/shims/npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix` |
