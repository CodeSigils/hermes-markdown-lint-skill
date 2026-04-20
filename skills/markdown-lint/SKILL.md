---
name: Markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files with rumdl.
  Use after creating or editing any .md file to enforce GFM compliance and
  consistent formatting. Ships a self-contained 12MB rumdl binary — zero
  dependencies, 26x faster than Node.js alternatives.
version: 1.1.0
author: Hermes Agent Community
license: MIT
prerequisites:
  commands: [rumdl]
metadata:
  hermes:
    tags: [Markdown, lint, GFM, GitHub, formatting, quality, documentation]
    homepage: https://github.com/rvben/rumdl
    related_skills: []

---

# Markdown Lint

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules using
`rumdl` — a self-contained Rust binary with no runtime dependencies.

**Why rumdl:** 12MB static binary, 26x faster than Node.js linters, same MD-numbered
rules as markdownlint, and it ships inside this skill so it works out of the box.

Load this skill whenever you create or edit a Markdown file.

## When to Use

-   After creating a new `.md` file
-   After editing an existing `.md` file
-   Before committing Markdown to a repository
-   When checking documentation quality

## Prerequisites

### Bundled binary (recommended — zero install)

This skill ships a pre-built rumdl binary. Use it directly:

```
~/.hermes/skills/markdown-lint/references/rumdl
```

No install needed. No Node.js required.

### Standalone install (if you prefer it on PATH)

Download a pre-built binary for your platform:

```bash
# Linux x86_64 (this skill uses this build)
curl -L https://github.com/rvben/rumdl/releases/latest/download/rumdl-x86_64-unknown-linux-musl.tar.gz \
  | tar xz -C /usr/local/bin rumdl
chmod +x /usr/local/bin/rumdl

# macOS Intel
curl -L https://github.com/rvben/rumdl/releases/latest/download/rumdl-x86_64-apple-darwin.tar.gz \
  | tar xz -C /usr/local/bin rumdl

# macOS Apple Silicon
curl -L https://github.com/rvben/rumdl/releases/latest/download/rumdl-aarch64-apple-darwin.tar.gz \
  | tar xz -C /usr/local/bin rumdl
```

All releases: https://github.com/rvben/rumdl/releases

Verify:

```bash
rumdl --version
```

## Quick Start

### After every Markdown file create or edit

```bash
# Bundled binary
~/.hermes/skills/markdown-lint/references/rumdl check --fix <path>

# Or with rumdl on PATH
rumdl check --fix <path>

# Check without fixing
rumdl check <path>

# Batch: fix all Markdown files in current directory tree
rumdl check --fix .
```

### Two-step pipeline (recommended for docs with tables)

```bash
fix-tables.py <path> && rumdl check --fix <path>
```

Step 1 normalizes table separators. Step 2 fixes everything else.
See [fix-tables.py](#fix-tablespy) below for details.

## Workflows

### 1. After Creating a New File

1.  Create the file using `write_file` or `patch`
2.  Run the fix command:

```bash
~/.hermes/skills/markdown-lint/references/rumdl check --fix <path>
```

3.  Done — the file is GFM-compliant

### 2. After Editing an Existing File

1.  Edit the file using `patch` or `write_file`
2.  Run the fix command:

```bash
~/.hermes/skills/markdown-lint/references/rumdl check --fix <path>
```

3.  Done — changes are applied and file is clean

### 3. Batch Fix All Markdown in a Project

```bash
# Fix all .md files recursively
rumdl check --fix .

# Dry-run: see what would change without modifying files
rumdl check --fix --diff .
```

### 4. CI / Pre-commit Check (read-only)

```bash
# Exit non-zero if any violations exist
rumdl check .
```

### 5. With fix-tables.py (table-heavy documentation)

```bash
# Step 1: normalize table separators
fix-tables.py <path>

# Step 2: apply remaining rumdl fixes
rumdl check --fix <path>
```

## Configuration

### Using the bundled config

rumdl auto-discovers config from the current directory upward:

```bash
# Copy the reference config to your project
cp ~/.hermes/skills/markdown-lint/references/.rumdl.toml ./.rumdl.toml
```

rumdl will pick it up automatically:

```bash
rumdl check --fix .
```

### Bundled .rumdl.toml

This skill ships a GFM-tuned config at
`~/.hermes/skills/markdown-lint/references/.rumdl.toml`:

```toml
[global]
disable = [
    "MD013",  # line-length — too strict for prose docs
    "MD024",  # multiple-headings — allow h2 reuse in sections
    "MD033",  # inline-html — rarely needed in GFM docs
    "MD034",  # bare-urls — disable; auto-links work without brackets
    "MD036",  # no-bare-urls — alias of MD034
    "MD040",  # fenced-code-language — ``` is fine without a language
    "MD041",  # first-line-heading — frontmatter makes this noisy
    "MD052",  # no-bare-reference-link — too strict for prose
]

[MD003]
style = "atx"

[MD004]
style = "dash"

[MD007]
indent = 2

[MD010]
spaces-per-tab = 4

[MD012]
maximum = 1

[MD026]
punctuation = ".,;:!"

[MD029]
style = "ordered"

[MD030]
ol-multi = 2
ol-single = 2
ul-multi = 3
ul-single = 3

[MD035]
style = "---"

[MD046]
style = "fenced"
```

### Switching to strict mode

For strict code documentation, use rumdl's built-in presets:

```bash
rumdl check --config <(rumdl init --preset default --output -) .
```

### Importing an existing markdownlint config

rumdl can import your existing `.markdownlint.json` directly:

```bash
rumdl import .markdownlint.json --output .rumdl.toml
```

## GFM Rules Reference

rumdl implements the standard MD001–MD045 rules with the same numbering as
markdownlint. Key rules enforced by this skill's config:

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
`| --- | --- |` style.

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
-   **Correct column counts** — reads header row to determine column count
-   **Handles alignment** — `:---`, `---:`, `:---:` all normalized
-   **Idempotent** — running on clean files reports "0 fixed"

## Troubleshooting

### "rumdl: command not found"

The bundled binary is not on PATH. Use the full path:

```bash
~/.hermes/skills/markdown-lint/references/rumdl check --fix <path>
```

Or add it to PATH:

```bash
export PATH="$HOME/.hermes/skills/markdown-lint/references:$PATH"
```

### Config file not found

rumdl searches for `.rumdl.toml` upward from the current directory.
Run from the project root:

```bash
cd ~/my-project
rumdl check --fix .
```

Or pass the config explicitly:

```bash
rumdl check --config ~/.hermes/skills/markdown-lint/references/.rumdl.toml --fix <path>
```

### `--fix` does not fix everything in one pass

Known behavior. Run twice if needed:

```bash
rumdl check --fix <path>
rumdl check --fix <path>
```

### File corruption from `--fix`

**Cause:** Writing Markdown with single newlines between paragraphs
(e.g., bash heredocs with `\n`). The fixer collapses paragraph spacing.

**Fix:** Use `write_file` or `patch` instead of terminal() with bash heredocs
for writing Markdown content. These tools produce files with proper
double-newline paragraph spacing.

### Different behavior between rumdl and markdownlint-cli2

Both use the same MD-numbered rules, but minor differences exist:

-   MD013 (line length): rumdl uses visual length by default; this config disables it
-   MD030 (list marker spaces): rumdl default is 1 space; this config sets ul-single=3
-   MD035 (HR style): rumdl default is `***`; this config enforces `---`
