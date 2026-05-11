# Markdown Lint Skill for Hermes

[![Version](https://img.shields.io/badge/version-v2.9.0-blue.svg)](https://github.com/CodeSigils/hermes-markdown-lint-skill/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hermes Skill](https://img.shields.io/badge/Hermes-Skill-8A2BE2.svg)](https://hermes-agent.nousresearch.com/)

A zero-dependency Hermes Agent skill that automatically lints and fixes Markdown files to enforce [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/) rules. 

Powered by **markdownlint** via `npx` and a custom AST-like **fix-tables.js** pipeline for flawless table formatting — absolutely no global installations required.

---

## For End Users

### Prerequisites

- **Node.js / npx** — Available in Hermes environments (needed to run markdownlint-cli2)
- **jq** — Required for the shell hook (`post-write.sh`)

### Install the Skill

```text
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint --force
```

The `--force` flag is required because the security scanner flags post-write hooks as dangerous (expected for a linting skill).

### Post installation: Auto-Lint on Write

To auto-lint every markdown file Hermes writes, add a shell hook to your config.

**Edit `~/.hermes/config.yaml`:**

```yaml
hooks:
  post_tool_call:
    - matcher: "write_file"
      command: "~/.hermes/skills/CodeSigils/hermes-markdown-lint-skill/markdown-lint/scripts/post-write.sh"
hooks_auto_accept: true
```

Restart Hermes (CLI or gateway) for the hook to activate. Set `hooks_auto_accept: true` to lint silently without prompts.

### Quick Start

```bash
# One-liner (recommended — self-contained, finds npx automatically)
${HERMES_SKILL_DIR}/lint.sh <path>

# Options
${HERMES_SKILL_DIR}/lint.sh --check <path>     # Read-only check
${HERMES_SKILL_DIR}/lint.sh --all <dir>       # Fix all .md in directory
${HERMES_SKILL_DIR}/lint.sh --validate <path>  # Validate table column consistency
${HERMES_SKILL_DIR}/lint.sh --fences <path>   # Check fenced code blocks
```

Or use the two-step pipeline manually:

```bash
node skills/markdown-lint/references/fix-tables.js <path> && node skills/markdown-lint/references/pad-tables.js <path> && npx markdownlint-cli2 --config skills/markdown-lint/references/.markdownlint.json <path> --fix
```

Step 1 normalizes table separators.
Step 2 pads table cells for MD060 alignment.
Step 3 fixes everything else.

### Preventing Broken Tables

The most common table error is **column count mismatch** between the header, separator, and data rows. This often happens with:

- Extra `|` characters in type definitions (e.g., `"tab" | "space"`)
- Copy-paste errors in separator rows

#### Validate Before You Push

```bash
# Add to CI or pre-commit to catch broken tables
${HERMES_SKILL_DIR}/lint.sh --validate docs/
```

This validates:

- Header columns match separator columns
- All data rows have the correct number of columns
- Pipes inside cells are properly escaped with `&#124;`

#### How to Escape Pipes in Tables

If a table cell contains a pipe character, escape it to prevent column misparsing:

| Before (broken)                  | After (fixed)                    |
| : ------------------------------ | : ------------------------------ |
| `"tab" &#124; "space"`           | `"tab" &#124; "space"`           |
| `"lf" &#124; "crlf" &#124; "cr"` | `"lf" &#124; "crlf" &#124; "cr"` |

### What It Does

The two-step pipeline fixes GFM violations that markdownlint detects — and the one thing it can't handle alone:

| Problem                                 | Fix                                         |
| : ------------------------------------- | : ----------------------------------------- |
| Raw dashes in table separators          | GFM-compliant separators                    |
| Heading without surrounding blank lines | Blank lines added before and after headings |
| Tabs instead of spaces in indentation   | Converted to spaces                         |
| Multiple consecutive blank lines        | Collapsed to single blank line              |

### Configuration

The skill includes a bundled config at `references/.markdownlint.json`.
`lint.sh` uses it automatically — no setup required.

### Testing

Run against the test fixture:

```bash
npx markdownlint-cli2 --config skills/markdown-lint/references/.markdownlint.json test/kitchensink.md
```

### CI / Pre-commit

GitHub Actions: `npx markdownlint-cli2 .`

Pre-commit:

```yaml
# .pre-commit-config.yaml
- repo: https://github.com/pre-commit/pre-commit-hooks
  hooks:
    - id: markdownlint
```

---

## Official Hermes Skills Documentation

Learn more about creating and managing Hermes skills:

- [Creating Skills](https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills) - Official guide
- [Skills User Guide](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) - Using skills
- [agentskills.io](https://agentskills.io) - Open standard (compatible with Claude, OpenAI, etc.)

---

## For Developers

### Skill Structure

```text
.
├── AGENTS.md
├── lint.sh                      # Developer wrapper
├── README.md
├── skills/
│   └── markdown-lint/           # <-- The actual skill payload
│       ├── SKILL.md
│       ├── lint.sh              # Canonical entry point
│       ├── scripts/
│       │   ├── check-fences.js  # Fenced code block checker
│       │   └── post-write.sh    # Auto-lint hook
│       └── references/
│           ├── fix-tables.js
│           ├── pad-tables.js
│           └── .markdownlint.json
└── test/
    └── kitchensink.md
```

### Key Changes in v2.9

- Replaced `jq` dependency with zero-dependency Node.js extraction in `post-write.sh`.
- Replaced brittle bash regex `check-fences.sh` with a native `check-fences.js` script.
- Significantly improved `lint.sh` bulk execution performance (node processes run once instead of per-file).

### Key Changes in v2.8

- Add `--fences` mode to `lint.sh` for fenced code block validation (EMPTY_LANG, BAD_CLOSER, COUNT_MISMATCH, DOUBLE_FENCE)
- Add `scripts/check-fences.sh` — validates code fences across .md files
- Disable MD055 (table-pipe-style) — no longer enforces leading/trailing `|` on tables
- Disable MD033 (no-inline-html) — inline HTML is allowed in GFM
- Sync `skills/markdown-lint/lint.sh` with root `lint.sh` (all flags now available)

### Key Changes in v2.7

- Add `--validate` mode to `fix-tables.js` and `lint.sh` to catch table column mismatches
- Add "Preventing Broken Tables" section with escaped pipe guidance

### Key Changes in v2.6

- Add shell hook `scripts/post-write.sh` for auto-lint on write_file
- Add to `~/.hermes/config.yaml` to enable auto-lint
- Enable MD032 (blanks-around-lists) — lists must be surrounded by blank lines
- Enable MD060 (table-column-style) — table pipes must align with header content
- Add `hooks_auto_accept: true` for silent auto-lint on write

### Key Changes in v2.5

- Disable MD040 (fenced-code-language) and MD055 (table-pipe-style) — too strict for prose
- Fix column alignment to match VSCode/marktext format (header.length - 1)
- Remove glob dependency, use recursive fs.walk instead

### Key Changes in v2.4

- Enable MD030 (list-marker-space) — strict GFM compliance

### Key Changes in v2.3

- Add `lint.sh`: self-contained bash wrapper that resolves npx across environments
  (PATH, corepack, zed/node) — no PATH dependency for end users

### Key Changes in v2.1

- Migrated to Node.js stack (fix-tables.js instead of fix-tables.py)
- Added auto-width column alignment for tables
- Added MD060, MD025, MD032 disabled rules
- Removed duplicate configuration
- Updated frontmatter to Hermes 2.x format

### GitHub PR Workflow

This skill supports the full GitHub PR lifecycle via the `github-pr-workflow` skill:

```bash
# 1. Create a feature branch
git checkout -b feat/your-feature-name

# 2. Make changes and commit
git add <files>
git commit -m "feat: description of changes"

# 3. Push and create PR
git push -u origin HEAD
gh pr create --title "feat: your feature" --body "## Summary..."
```

### Adding to Your Own Tap

```bash
# Fork this repo or copy the skills/ directory into your repo
# Your tap repo structure must be: <repo>/skills/<skill-name>/SKILL.md

# Then add your tap
hermes skills tap add your-username/your-skills-repo
```

### Inspect Before Installing

```bash
hermes skills tap add CodeSigils/hermes-markdown-lint-skill
hermes skills inspect CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

---

## Skill Documentation

See [skills/markdown-lint/SKILL.md](skills/markdown-lint/SKILL.md) for the full skill document.

## License

MIT License. See [LICENSE](LICENSE).
