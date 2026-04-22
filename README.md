# Markdown Lint Skill for Hermes

Auto-fix Markdown files to enforce [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/) rules.
A skill for the [Hermes Agent](https://github.com/nousresearch/hermes-agent) ecosystem.

Uses **markdownlint** via `npx` and **fix-tables.js** for table formatting — zero install required.

---

## For End Users

### Prerequisites

- **Node.js / npx** — Available in Hermes environments (needed to run markdownlint-cli2)
- **jq** — Required for the shell hook (`post-write.sh`)

### Install the Skill

```bash
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

### Post installation: Auto-Lint on Write

To auto-lint every markdown file Hermes writes, add a shell hook to your config.

**Edit `~/.hermes/config.yaml`:**

```yaml
hooks:
  post_tool_call:
    - matcher: "write_file"
      command: "~/.hermes/skills/markdown-lint/scripts/post-write.sh"
hooks_auto_accept: true
```

Restart Hermes (CLI or gateway) for the hook to activate. Set `hooks_auto_accept: true` to lint silently without prompts.

### Quick Start

```bash
# One-liner (recommended — self-contained, finds npx automatically)
${HERMES_SKILL_DIR}/lint.sh <path>

# Options
${HERMES_SKILL_DIR}/lint.sh --check <path>   # Read-only check
${HERMES_SKILL_DIR}/lint.sh --all <dir>      # Fix all .md in directory
```

Or use the two-step pipeline manually:

```bash
${HERMES_SKILL_DIR}/references/fix-tables.js <path> && npx markdownlint-cli2 --config ${HERMES_SKILL_DIR}/references/.markdownlint.json <path> --fix
```

Step 1 normalizes table separators.
Step 2 fixes everything else.

### What It Does

The two-step pipeline fixes GFM violations that markdownlint detects — and the one thing it can't handle alone:

| Problem | Fix |
| :------ | :--- |
| Raw dashes in table separators (`&#124;------&#124;`) | GFM-compliant separators (`&#124; :--- &#124;`) |
| Heading without surrounding blank lines | Blank lines added before and after headings |
| Tabs instead of spaces in indentation | Converted to spaces |
| Multiple consecutive blank lines | Collapsed to single blank line |

### Configuration

The skill includes a bundled config at `references/.markdownlint.json`. 
`lint.sh` uses it automatically — no setup required.

### Testing

Run against the test fixture:

    npx markdownlint-cli2 test/kitchensink.md

### CI / Pre-commit

GitHub Actions: `npx markdownlint-cli2 .`

Pre-commit:

```yaml
# .pre-commit-config.yaml
- repo: https://github.com/nousresearch/pre-commit-hooks
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

```
markdown-lint/
├── README.md
├── SKILL.md
├── lint.sh
├── fix-tables.js
├── scripts/
│   └── post-write.sh
├── references/
│   ├── fix-tables.js
│   └── .markdownlint.json
└── test/
    └── kitchensink.md
```

### Key Changes in v2.6

- Add shell hook `scripts/post-write.sh` for auto-lint on write_file
- Add to `~/.hermes/config.yaml` to enable auto-lint

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
