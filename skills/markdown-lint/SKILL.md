---
name: Markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files with markdownlint-cli2.
  Use after creating or editing any .md file to enforce GFM compliance and
  consistent formatting. Supports fix-tables.py for table separator normalization.
version: 1.0.0
author: Hermes Agent Community
license: MIT
prerequisites:
  commands: [markdownlint-cli2]
metadata:
  hermes:
    tags: [Markdown, lint, GFM, GitHub, formatting, quality, documentation]
    homepage: https://github.com/DavidAnson/markdownlint
    related_skills: []

---

# Markdown Lint

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules using
`markdownlint-cli2`. Load this skill whenever you create or edit a Markdown file.

## When to Use

-   After creating a new `.md` file
-   After editing an existing `.md` file
-   Before committing Markdown to a repository
-   When checking documentation quality

## Prerequisites

### Install markdownlint-cli2

Choose one method based on your package manager:

```bash
# pnpm (recommended — fast, disk-efficient)
pnpm add -g markdownlint-cli2

# npm (pin to a specific version)
npm install -g markdownlint-cli2@0.22.0

# yarn
yarn global add markdownlint-cli2

# bun
bun add -g markdownlint-cli2

# Zero-install (no install needed — uses npx)
npx markdownlint-cli2 <path> --fix
```

Verify the installation:

```bash
markdownlint-cli2 --version
```

### Set up configuration

Copy the reference config to your project directory:

```bash
# In your project root
cp ~/.hermes/skills/markdown-lint/references/.markdownlint-cli2.jsonc ./.markdownlint-cli2.jsonc
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json ./.markdownlint.json
```

Or copy just the markdownlint rules:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json ./.markdownlint.json
```

## Quick Start

### After every Markdown file create or edit

```bash
# Auto-fix a single file
markdownlint-cli2 <path> --fix

# Check without fixing
markdownlint-cli2 <path>

# Batch: fix all Markdown files in current directory
markdownlint-cli2 "**/*.md" --fix
```

### Two-step pipeline (recommended for docs with tables)

```bash
fix-tables.py <path> && markdownlint-cli2 <path> --fix
```

Step 1 normalizes table separators. Step 2 fixes everything else.
See [fix-tables.py](#fix-tablespy) below for details.

## Workflows

### 1. After Creating a New File

1.  Create the file using `write_file` or `patch`
2.  Run the fix command:

```bash
markdownlint-cli2 <path> --fix
```

1.  Done — the file is GFM-compliant

### 2. After Editing an Existing File

1.  Edit the file using `patch` or `write_file`
2.  Run the fix command:

```bash
markdownlint-cli2 <path> --fix
```

1.  Done — changes are applied and file is clean

### 3. Batch Fix All Markdown in a Project

```bash
# Fix all .md files in current directory and subdirectories
markdownlint-cli2 "**/*.md" --fix
```

### 4. CI / Pre-commit Check (Read-only)

```bash
# Exit non-zero if any violations exist
markdownlint-cli2 "**/*.md" || exit 1
```

### 5. With fix-tables.py (Table-Heavy Documentation)

```bash
# Step 1: normalize table separators
fix-tables.py <path>

# Step 2: apply remaining markdownlint fixes
markdownlint-cli2 <path> --fix
```

## Configuration

### .markdownlint-cli2.jsonc

Controls CLI2 behavior (auto-fix, glob patterns, ignores):

```jsonc
{
  // Auto-fix issues when possible
  "fix": true,

  // Use .gitignore for faster file enumeration
  "gitignore": true,

  // Suppress the banner for cleaner output
  "noBanner": true,

  // Disable the progress indicator
  "noProgress": true,

  // Files to lint
  "globs": ["**/*.md", "**/*.markdown"],

  // Directories to skip
  "ignores": ["node_modules", "dist", ".git", "coverage"],

  // Apply markdownlint rules
  "config": {
    "default": true
  }
}
```

### .markdownlint.JSON

Controls individual GFM rule enforcement. Place in your project root:

```json
{
  "default": true,
  "MD003": { "style": "atx" },
  "MD007": { "indent": 2 },
  "MD009": { "br_spaces": 2 },
  "MD010": true,
  "MD012": { "max": 1 },
  "MD013": false,
  "MD024": false,
  "MD026": { "punctuation": ".,;:" },
  "MD029": { "style": "ordered" },
  "MD030": { "ul_single": 3, "ol_single": 2 },
  "MD033": false,
  "MD034": false,
  "MD035": { "style": "---" },
  "MD036": false,
  "MD040": false,
  "MD041": false,
  "MD045": true,
  "MD046": { "style": "fenced" },
  "MD047": true,
  "MD048": { "style": "backtick" }
}
```

### Rule Overrides for Prose Documentation

These rules are relaxed for note-taking and prose, not strict code docs:

| Rule | Code Docs | Notes/Prose | This Config |
| --- | --- | --- | --- |
| MD013 line length | 80-120 | disabled | **false** |
| MD034 bare URLs | true | false | **false** |
| MD040 code language | true | false | **false** |
| MD033 inline HTML | true | false | **false** |
| MD036 emphasis headings | true | false | **false** |
| MD024 multiple H1s | true | false | **false** |

## fix-tables.py

Normalizes Markdown table separators from old-style `|------|------|` to GFM-compliant
`| --- | --- |` style.

markdownlint has no built-in rule for table separator formatting, so this script handles it.

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
fix-tables.py ~/notes/file.md
```

### How It Works

1.  Scans for lines matching the table separator pattern
2.  Looks backward to the header row to count columns
3.  Replaces old-style separator with `| --- | --- |` matching the exact column count
4.  Leaves all data rows and already-correct separators untouched

### Key Behaviors

-   **No data loss** — only replaces separator lines
-   **Correct column counts** — reads header row to determine column count
-   **Handles alignment** — `:---`, `---:`, `:---:` all normalized
-   **Idempotent** — running on clean files reports "0 fixed"

## GFM Rules Reference

| Rule | Title | Description |
| --- | --- | --- |
| MD009 | no-trailing-spaces | No trailing spaces |
| MD010 | no-hard-tabs | No hard tabs in content |
| MD012 | no-multiple-blanks | Max one blank line between paragraphs |
| MD013 | line-length | Line length — disabled for prose |
| MD022 | blanks-around-headings | Blank line before and after headings |
| MD024 | no-multiple-headings | No duplicate heading text |
| MD031 | blanks-around-fences | Blank line around fenced code blocks |
| MD032 | blanks-around-lists | Blank line before and after lists |
| MD033 | no-inline-HTML | No inline HTML |
| MD034 | no-bare-urls | URLs must use angle brackets |
| MD040 | fenced-code-language | Fenced code blocks need a language tag |
| MD045 | no-alt-text | Images need alt text |
| MD046 | code-block-style | Use fenced code blocks |
| MD047 | single-trailing-newline | File must end with one newline |
| MD048 | code-fence-style | Use backticks for code fences |
| MD056 | table-column-count | Table column count matches header |

## Troubleshooting

### "command not found: markdownlint-cli2"

```bash
# Verify installation
npm list -g markdownlint-cli2

# Check PATH includes global bin
export PATH="$(npm root -g):$PATH"

# Or use npx for zero-install
npx markdownlint-cli2 <path> --fix
```

### `--fix` does not fix everything in one pass

Known behavior. Run twice if needed:

```bash
markdownlint-cli2 <path> --fix
markdownlint-cli2 <path> --fix
```

### Config file not found

Ensure `.markdownlint.json` or `.markdownlint-cli2.jsonc` is in the current
working directory. markdownlint-cli2 searches upward from the file location:

```bash
# Run from the project root where the config lives
cd ~/my-project
markdownlint-cli2 README.md --fix
```

### File corruption from `--fix`

**Cause:** Writing Markdown with single newlines between paragraphs
(e.g., bash heredocs with `\n`). The `--fix` tool collapses paragraph spacing.

**Fix:** Use `write_file` or `patch` instead of terminal() with bash heredocs
for writing Markdown content. These tools produce files with proper
double-newline paragraph spacing.
