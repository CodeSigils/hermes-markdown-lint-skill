# Markdown Lint Skill for Hermes

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules.
A skill for the [Hermes Agent](https://github.com/nousresearch/hermes-agent) ecosystem.

Uses **markdownlint** via `npx` and **fix-tables.js** for table formatting — zero install required.

---

## For End Users

### Prerequisites

**Node.js** — required for running the linter.

```bash
# Install Node.js
# macOS
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm
```

Verify:

```bash
node --version
```

### Install the Skill

```bash
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

### Quick Start

```bash
# Two-step pipeline (recommended)
${HERMES_SKILL_DIR}/references/fix-tables.js <path> && npx markdownlint-cli2 <path> --fix
```

Or after installation:
```bash
hermes markdown-lint <path>
```

Step 1 normalizes table separators.
Step 2 fixes everything else.

### Configuration

Copy the reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json ./.markdownlint.json
```

---

## Official Hermes Skills Documentation

Learn more about creating and managing Hermes skills:

- [Creating Skills](https://hermes-agent.nousresearch.com/docs/developer-guide/creating-skills) - Official guide
- [Skills System](https://hermes-agent.ai/blog/hermes-agent-skills-guide) - Skills guide
- [Skills User Guide](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) - Using skills
- [agentskills.io](https://agentskills.io) - Open standard (compatible with Claude, OpenAI, etc.)

---

## For Developers

### Skill Structure

```
hermes-markdown-lint-skill/
├── README.md
├── LICENSE
└── skills/
    └── markdown-lint/
        ├── SKILL.md                          # Skill document
        └── references/
            ├── fix-tables.js                 # Table separator normalizer (Node.js)
            └── .markdownlint.json            # Lint rule config
```

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