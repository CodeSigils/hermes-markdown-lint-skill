---
name: Markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files. Run after creating
  or editing any .md file to enforce consistent formatting. Supports two
  backends: markdownlint-cli2 (via bunx, zero-install) and rumdl (self-downloaded
  binary with fast performance).
version: 1.2.0
author: Hermes Agent Community
license: MIT
prerequisites:
  commands: [bun]
metadata:
  hermes:
    tags: [Markdown, lint, GFM, GitHub, formatting, quality, documentation]
    homepage: https://github.com/rvben/rumdl
    related_skills: []

---

# Markdown Lint

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules.

This skill supports two linter backends:

-   **markdownlint-cli2** via `bunx` — zero install, works out of the box if
    you have `bun`
-   **rumdl** — self-downloaded static binary, 26x faster than Node.js linters,
    same MD-numbered rules

Load this skill whenever you create or edit a Markdown file.

## When to Use

-   After creating a new `.md` file
-   After editing an existing `.md` file
-   Before committing Markdown to a repository
-   When checking documentation quality

## Prerequisites

### bun (for markdownlint-cli2 backend — zero install)

This skill uses `bunx markdownlint-cli2` to run the linter without any
installation. If you have `bun`, nothing else is needed.

Verify:

```bash
bunx markdownlint-cli2 --version
```

### rumdl backend (optional — faster, needs one-time setup)

rumdl is a 12MB static Rust binary. On first use, the skill downloads it:

```bash
~/.hermes/skills/markdown-lint/references/get-rumdl
rumdl --version
```

This installs to `~/.local/bin/rumdl` and caches the binary — subsequent runs
skip the download. Supports Linux x86_64 and macOS (Intel + Apple Silicon).

## Quick Start

### markdownlint-cli2 backend (recommended — zero install)

```bash
bunx markdownlint-cli2 <path> --fix
```

### rumdl backend (after setup)

```bash
~/.hermes/skills/markdown-lint/references/get-rumdl  # one-time
rumdl check --fix <path>
```

### Two-step pipeline (recommended for docs with tables)

```bash
fix-tables.py <path> && bunx markdownlint-cli2 <path> --fix
```

Step 1 normalizes table separators to `| :--- | :--- |` center-aligned style.
Step 2 fixes everything else.
See [fix-tables.py](#fix-tablespy) below for details.

## Workflows

### 1. After Creating a New File (markdownlint-cli2)

1.  Create the file using `write_file` or `patch`
2.  Run the fix command:

```bash
bunx markdownlint-cli2 <path> --fix
```

1.  Done — the file is GFM-compliant

### 2. After Editing an Existing File (rumdl)

1.  Edit the file using `patch` or `write_file`
2.  First time: download rumdl

```bash
~/.hermes/skills/markdown-lint/references/get-rumdl
```

1.  Run the fix command:

```bash
rumdl check --fix <path>
```

### 3. Batch Fix All Markdown in a Project

```bash
# markdownlint-cli2 (no setup)
find . -name "*.md" -exec bunx markdownlint-cli2 {} --fix \;

# rumdl (after setup)
rumdl check --fix .
```

### 4. CI / Pre-commit Check (read-only)

```bash
# Exit non-zero if any violations exist
bunx markdownlint-cli2 <path>

# or with rumdl
rumdl check <path>
```

### 5. With fix-tables.py (table-heavy documentation)

```bash
# Step 1: normalize table separators
fix-tables.py <path>

# Step 2: apply remaining lint fixes (markdownlint-cli2)
bunx markdownlint-cli2 <path> --fix
```

## Configuration

### Bundled config files

This skill ships two configuration files in `references/`:

-   `.markdownlint-cli2.jsonc` — CLI2 config (fix:true, gitignore:true, noBanner:true)
-   `.rumdl.toml` — TOML config for the rumdl backend
-   `.markdownlint.json` — GFM rule config for markdownlint compatibility

### Using with markdownlint-cli2

CLI2 auto-discovers config from the current directory upward. Copy the
reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint-cli2.jsonc ./.markdownlint-cli2.jsonc
```

Or pass explicitly:

```bash
bunx markdownlint-cli2 --config ~/.hermes/skills/markdown-lint/references/.markdownlint-cli2.jsonc <path> --fix
```

### Using with rumdl

rumdl searches for `.rumdl.toml` upward from the current directory:

```bash
cp ~/.hermes/skills/markdown-lint/references/.rumdl.toml ./.rumdl.toml
rumdl check --fix <path>
```

## GFM Rules Reference

Both backends implement the standard MD001–MD045 rules with the same numbering.
Key rules enforced by the bundled config:

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

Rules that are intentionally **disabled** (too strict for prose documentation):

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
`| :--- | :--- | :--- |` style with center-aligned cells (`:---:`).

rumdl has no built-in rule for table separator formatting, so this script handles it.

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
-   **Center-aligned** — all cells become `:---:` for consistent GFM style
-   **Correct column counts** — reads header row to determine column count
-   **Idempotent** — running on clean files reports "0 fixed"

## Troubleshooting

### markdownlint-cli2: command not found

Ensure `bun` is installed. See https://bun.sh for installation options.

Verify:

```bash
bun --version
```

### rumdl: command not found

Run the setup script to download the binary:

```bash
~/.hermes/skills/markdown-lint/references/get-rumdl
```

Then ensure `~/.local/bin` is on your PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Config file not found

Both linters search for config upward from the current directory.
Run from the project root:

```bash
cd ~/my-project
bunx markdownlint-cli2 . --fix
```

Or pass the config explicitly:

```bash
bunx markdownlint-cli2 --config ~/.hermes/skills/markdown-lint/references/.markdownlint-cli2.jsonc . --fix
```

### `--fix` does not fix everything in one pass

Known behavior. Run twice if needed:

```bash
bunx markdownlint-cli2 <path> --fix
bunx markdownlint-cli2 <path> --fix
```

### File corruption from `--fix`

**Cause:** Writing Markdown with single newlines between paragraphs
(e.g., bash heredocs with `\n`). The fixer collapses paragraph spacing.

**Fix:** Use `write_file` or `patch` instead of terminal() with bash heredocs
for writing Markdown content. These tools produce files with proper
double-newline paragraph spacing.
