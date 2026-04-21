---
name: markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files. Run after creating
  or editing any .md file to enforce consistent formatting. Uses markdownlint
  via uvx for zero-install, portable linting.
version: 2.0.0
author: Hermes Agent
license: MIT
required_environment_variables: []
required_commands: ["uv"]
metadata:
  hermes:
    tags: [markdown, lint, gfm, github, formatting, quality, documentation]
    homepage: https://github.com/DavidAnson/markdownlint-cli2
    related_skills: []
---

# Markdown Lint

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules.

This skill uses **markdownlint** via `uvx` — zero install, works anywhere uv works.

Load this skill whenever you create or edit a Markdown file.

## When to Use

- After creating a new `.md` file
- After editing an existing `.md` file
- Before committing Markdown to a repository
- When checking documentation quality

## Prerequisites

### uv (required)

This skill uses `uvx markdownlint-cli2` to run the linters without installation.

Verify:

```bash
uv --version
```

## Quick Start

### Lint and fix with uvx

```bash
uvx markdownlint-cli2 <path> --fix
```

### Two-step pipeline (recommended for docs with tables)

```bash
fix-tables.py <path> && uvx markdownlint-cli2 <path> --fix
```

Step 1 normalizes table separators to `| :--- | :--- |` left-aligned style.
Step 2 fixes everything else.

## Workflows

### 1. After Creating a New File

1. Create the file using `write_file` or `patch`
2. Run the fix command:

```bash
uvx markdownlint-cli2 <path> --fix
```

Done — the file is GFM-compliant

### 2. Batch Fix All Markdown in a Project

```bash
find . -name "*.md" -exec uvx markdownlint-cli2 {} --fix \;
```

### 3. CI / Pre-commit Check (read-only)

```bash
# Exit non-zero if any violations exist
uvx markdownlint-cli2 <path>
```

### 4. With fix-tables.py (table-heavy documentation)

```bash
# Step 1: normalize table separators
fix-tables.py <path>

# Step 2: apply remaining lint fixes
uvx markdownlint-cli2 <path> --fix
```

## Configuration

### Using bundled config

Copy the reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json ./.markdownlint.json
```

Or pass explicitly:

```bash
uvx markdownlint-cli2 --config ~/.hermes/skills/markdown-lint/references/.markdownlint.json <path> --fix
```

## GFM Rules Reference

markdownlint implements MD001–MD045 rules. Key rules enforced:

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
| MD032 | blanks-around-lists | Blank line before and after lists |
| MD035 | hr-style | Horizontal rule style `---` |
| MD046 | code-block-style | Use fenced code blocks |
| MD048 | code-fence-style | Use backticks for code fences |

Rules **disabled** (too strict for prose documentation):

| Rule | Title | Why Disabled |
| --- | --- | --- |
| MD013 | line-length | Prose lines are naturally longer |
| MD024 | multiple-headings | Same h2 text in different sections is valid |
| MD033 | no-inline-html | GFM supports basic inline HTML |
| MD034 | no-bare-urls | Bare URLs auto-link in GFM |
| MD036 | emphasis-instead-of-heading | Valid use case for emphasis |
| MD040 | fenced-code-language | Empty code fences are acceptable |
| MD041 | first-line-heading | Frontmatter makes this noisy |
| MD052 | no-bare-reference-link | Common in prose |

## fix-tables.py

Normalizes Markdown table separators from old-style `|------|------|` to GFM-compliant
`| :--- | :--- | :--- |` style with left-aligned cells (`---`).

markdownlint has no built-in rule for table separator formatting, so this handles it.

### Location

```
~/.hermes/skills/markdown-lint/references/fix-tables.py
```

### Usage

```bash
# Fix specific files
fix-tables.py ~/notes/file.md

# Fix all .md in a directory (recursive)
fix-tables.py --all ~/notes/

# Dry-run (shows what would be fixed, no changes)
fix-tables.py --dry ~/notes/file.md
```

### How It Works

1. Scans for lines matching the table separator pattern
2. Looks backward to the header row to count columns
3. Replaces old-style separator with `| --- | --- |` matching the exact column count
4. Leaves all data rows and already-correct separators untouched

## Troubleshooting

### markdownlint-cli2: command not found

Ensure `uv` is installed:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify:

```bash
uv --version
```

### Config file not found

markdownlint searches for config upward from the current directory.

Run from the project root:

```bash
cd ~/my-project
uvx markdownlint-cli2 . --fix
```

Or pass the config explicitly:

```bash
uvx markdownlint-cli2 --config ~/.hermes/skills/markdown-lint/references/.markdownlint.json . --fix
```

### `--fix` does not fix everything in one pass

Known behavior. Run twice if needed:

```bash
uvx markdownlint-cli2 <path> --fix
uvx markdownlint-cli2 <path> --fix
```