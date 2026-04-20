# Markdown Lint Skill for Hermes

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules using
`markdownlint-cli2`. A skill for the [Hermes Agent](https://github.com/nousresearch/hermes-agent) ecosystem.

---

## For End Users

### Prerequisites

Install `markdownlint-cli2`:

```bash
pnpm add -g markdownlint-cli2
# or npm install -g markdownlint-cli2@0.22.0
# or yarn global add markdownlint-cli2
# or bun add -g markdownlint-cli2
# or bunx markdownlint-cli2 <path> --fix   # zero-install (no install needed)
```

### Install the Skill

```bash
hermes skills tap add CodeSigils/hermes-markdown-lint-skill
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

### Quick Start

```bash
# Auto-fix a single file (run after every create/edit)
markdownlint-cli2 <path> --fix

# Batch fix all .md files
markdownlint-cli2 "**/*.md" --fix
```

For prose documentation with tables, use the two-step pipeline:

```bash
fix-tables.py <path> && markdownlint-cli2 <path> --fix
```

### Configuration

Copy the reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json <your-project>/
cp ~/.hermes/skills/markdown-lint/references/.markdownlint-cli2.jsonc <your-project>/
```

---

## For Developers

### Skill Structure

```
hermes-markdown-lint-skill/
├── README.md
├── LICENSE
├── .markdownlint.json                          # Repo lint config
├── .markdownlint-cli2.jsonc                    # Repo CLI2 config
└── skills/
    └── markdown-lint/
        ├── SKILL.md                            # Skill document (loaded by Hermes)
        └── references/
            ├── .markdownlint.json              # Distributable GFM rules
            ├── .markdownlint-cli2.jsonc        # Distributable CLI2 config
            └── fix-tables.py                   # Table separator normalizer
```

### Adding to Your Own Tap

To use this as a base for your own skills tap:

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
skill document — workflows, configuration, troubleshooting, and GFM rules reference.

## License

MIT License. See [LICENSE](LICENSE).
