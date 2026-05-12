# Markdown Lint Skill for Hermes

[![Version](https://img.shields.io/badge/version-v2.9.1-blue.svg)](https://github.com/CodeSigils/hermes-markdown-lint-skill/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hermes Skill](https://img.shields.io/badge/Hermes-Skill-8A2BE2.svg)](https://hermes-agent.nousresearch.com/)

A zero-dependency Hermes Agent skill that automatically lints and fixes Markdown files to enforce [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/) rules.

Powered by **pure Node.js** — `format-tables.js` for single-pass table formatting and `markdownlint-cli2` for GFM rule enforcement. No global installations, no bash required.

---

## Agent Behavioral Standards

This repository follows **autonomous agent governance standards** — explicit behavioral contracts for LLM agents.

### What This Means

- **AGENTS.md** defines a formal contract: what agents MUST do, what they SHOULD NOT do
- **Severity levels** (BLOCKING/WARNING/INFO) make validation failures actionable
- **Imperative section headers** (Validate Changes, Resolve Failures) for machine readability
- **Safe automation boundaries** prevent destructive "helpful AI" behavior
- **Consistency checks** prevent drift between config, documentation, and formatter behavior

### Why It Matters

As LLM agents increasingly work autonomously in repositories, explicit governance becomes critical:

- Deterministic validation prevents silent regressions
- Severity levels enable safe autonomous PRs
- Behavioral contracts create reproducible contributor expectations
- Machine-readable sections enable programmatic enforcement
- CI-backed consistency checks turn governance claims into enforceable guarantees

This is part of a broader shift toward **AI-native repository standards** — where human and agent workflows are equally well-specified.

Learn more: See [AGENTS.md](AGENTS.md) for the full behavioral contract.

---

## Design Philosophy

This skill treats Markdown linting as **agent-safe repository governance**:

- Formatting must be deterministic and idempotent
- Fenced code blocks are safety boundaries and must not be rewritten as prose
- Table formatting preserves semantic alignment (`:---`, `---:`, `:---:`)
- `lint.js` is the canonical entry point for manual, CI, and agent-driven execution
- Documentation, config, formatter behavior, and governance claims must stay synchronized

---

## For End Users

### Prerequisites

Before installing, ensure your environment meets the following requirements:

- **Hermes CLI** — Required to install the skill. The `post-write.js` hook is an optional safety net.
- **Node.js (v18+)** — The linting pipeline relies on native Node.js scripts and `npx` to dynamically fetch `markdownlint-cli2` without requiring global installations.
- **Cross-Platform** — The pipeline runs natively on Linux, macOS, and Windows. No WSL or Git Bash required!

### Install the Skill

```text
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint --force
```

The `--force` flag is required because the security scanner flags post-write hooks as dangerous (expected for a linting skill).

### Post-Install: Hook (Optional Safety Net)

The skill already instructs the AI agent to automatically lint every markdown file it writes. For guaranteed enforcement even if the agent skips the instruction, you can add a system-level hook:

**Edit `~/.hermes/config.yaml`:**

```yaml
hooks:
  post_tool_call:
    - matcher: "write_file"
      command: "node ~/.hermes/skills/markdown-lint/scripts/post-write.js"
hooks_auto_accept: true
```

Restart Hermes for the hook to activate. This is **optional** — the mandatory lint rule in `SKILL.md` handles the common case.

### Quick Start

```bash
# One-liner (recommended — pure Node.js, cross-platform)
node ${HERMES_SKILL_DIR}/lint.js <path>

# Options
node ${HERMES_SKILL_DIR}/lint.js --check <path>     # Read-only check
node ${HERMES_SKILL_DIR}/lint.js --all <dir>        # Fix all .md in directory
node ${HERMES_SKILL_DIR}/lint.js --validate <path>  # Validate table column consistency
node ${HERMES_SKILL_DIR}/lint.js --fences <path>    # Check fenced code blocks
```

Or run steps manually:

```bash
node skills/markdown-lint/references/format-tables.js <path> && npx markdownlint-cli2 --config skills/markdown-lint/references/.markdownlint.json <path> --fix
```

Step 1 formats all tables in a single pass (fixes separators + pads cells).
Step 2 fixes everything else.

### Preventing Broken Tables

The most common table error is **column count mismatch** between the header, separator, and data rows. This often happens with:

- Extra `|` characters in type definitions (e.g., `"tab" | "space"`)
- Copy-paste errors in separator rows

#### Validate Before You Push

```bash
# Add to CI or pre-commit to catch broken tables
node lint.js --validate .
```

This validates:

- Header columns match separator columns
- All data rows have the correct number of columns
- Pipes inside cells are properly escaped with `&#124;`

#### How to Escape Pipes in Tables

If a table cell contains a pipe character, escape it to prevent column misparsing:

**Before (broken)** — the raw `|` breaks the column count:

```markdown
| Type    | Value |
| :------ | :---- |
| Options | "tab" | "space" |
```

**After (fixed)** — escape with `&#124;`:

```markdown
| Type    | Value                      |
| :------ | :------------------------- |
| Options | "tab" &#124; "space"   |
```

### What It Does

The pipeline (`format-tables.js` → `markdownlint-cli2`) fixes GFM violations automatically:

**Table separators** — normalizes raw dashes to GFM-compliant aligned separators while preserving semantic alignment:

Before:

```markdown
| Name  | Age  | Score |
| ---   | ---: | :---: |
| Alice | 25   | A     |
```

After:

```markdown
| Name  | Age | Score |
| :---- | --: | :---: |
| Alice |  25 | A     |
```

**Headings** — adds required blank lines around headings:

Before:

```markdown
Some text
## My Heading
More text
```

After:

```markdown
Some text

## My Heading

More text
```

**Tabs & blank lines** — converts tabs to spaces and collapses multiple blank lines to one.

### Configuration

The skill includes a bundled config at `references/.markdownlint.json`.
`lint.js` uses it automatically — no setup required.

Key policy choices:

- MD040 is disabled — blank fences are allowed for output examples
- MD055 is disabled — leading/trailing table pipes are optional
- MD060 is set to `aligned` — table column positions are normalized while preserving semantic alignment

### Testing

Run against the test fixture:

```bash
npx markdownlint-cli2 --config skills/markdown-lint/references/.markdownlint.json test/kitchensink.md
```

### CI / Pre-commit

The project uses GitHub Actions to validate every push and PR. You can run the same checks locally:

```bash
# 1. Repository governance/config consistency
node scripts/check-consistency.js

# 2. Unit tests for the table formatter
node test/format-tables.test.js

# 3. Check for unclosed code fences or bad closers
node lint.js --fences .

# 4. Validate table column consistency
node lint.js --validate .

# 5. Final lint check
node lint.js --check .
```

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
├── lint.js                      # Developer wrapper
├── README.md
├── scripts/
│   └── check-consistency.js     # Config/docs anti-drift checker
├── skills/
│   └── markdown-lint/           # <-- The actual skill payload
│       ├── SKILL.md
│       ├── lint.js              # Canonical entry point
│       ├── scripts/
│       │   ├── check-fences.js  # Fenced code block checker
│       │   └── post-write.js    # Auto-lint hook (optional)
│       └── references/
│           ├── format-tables.js # Single-pass table formatter
│           └── .markdownlint.json
└── test/
    └── format-tables.test.js
```

## License

MIT License. See [LICENSE](./LICENSE).
