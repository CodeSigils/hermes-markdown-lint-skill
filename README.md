# Markdown Lint Skill for Hermes

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules.
A skill for the [Hermes Agent](https://github.com/nousresearch/hermes-agent) ecosystem.

Uses **markdownlint** via `uvx` — zero install, works anywhere uv works.

---

## For End Users

### Prerequisites

**uv** — required for running the linter.

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify:

```bash
uv --version
```

### Install the Skill

```bash
hermes skills tap add CodeSigils/hermes-markdown-lint-skill
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

### Quick Start

```bash
# Lint and fix with uvx
uvx markdownlint-cli2 <path> --fix
```

For prose documentation with tables, use the two-step pipeline:

```bash
fix-tables.py <path> && uvx markdownlint-cli2 <path> --fix
```

### Configuration

Copy the reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json ./.markdownlint.json
```

---

## For Developers

### Skill Structure

```
hermes-markdown-lint-skill/
├── README.md
├── LICENSE
└── skills/
    └── markdown-lint/
        ├── SKILL.md                            # Skill document
        └── references/
            ├── fix-tables.py                   # Table separator normalizer
            └── .markdownlint.json              # lint rule config
```

### Key Changes in v2.0

- Removed rumdl backend (was too complex)
- Switched to `uvx markdownlint-cli2` (simpler, more portable)
- Removed duplicate config files at root level
- Single config file: `.markdownlint.json`

### Adding to Your Own Tap

```bash
# Fork this repo or copy the skills/ directory into your repo
# Your tap repo structure must be: <repo>/skills/<skill-name>/SKILL.md

# Then add your tap
hermes skills tap add your-username/your-skills-repo
```

### Inspect Before Installing

Preview a skill without installing:

```bash
hermes skills tap add CodeSigils/hermes-markdown-lint-skill
hermes skills inspect CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

---

## Skill Documentation

See [skills/markdown-lint/SKILL.md](skills/markdown-lint/SKILL.md) for the full
skill document.

## License

MIT License. See [LICENSE](LICENSE).