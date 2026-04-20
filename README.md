# Markdown Lint Skill for Hermes

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules using
`markdownlint-cli2`. A skill for the [Hermes Agent](https://github.com/nousresearch/hermes-agent) ecosystem.

---

## For End Users

### Prerequisites

Install `markdownlint-cli2`:

```bash
pnpm add -g markdownlint-cli2
# or npm install -g markdownlint-cli2
# or yarn global add markdownlint-cli2
# or bun add -g markdownlint-cli2
```

### Install the Skill

**Option 1 — From a tap (recommended):**

```bash
# Add the skill registry tap
hermes skills tap add owner/repo

# Install the skill
hermes skills install owner/repo/markdown-lint
```

**Option 2 — Manual copy:**

```bash
cp -r hermes-markdown-lint-skill ~/.hermes/skills/markdown-lint
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
cp ~/.hermes/skills/markdown-lint/references/.markdownlint.json ./docs/
cp ~/.hermes/skills/markdown-lint/references/.markdownlint-cli2.jsonc ./docs/
```

---

## For Developers

### Publishing to a GitHub Tap

This repo is the skill directory. To publish it as a community skill:

```bash
# Publish to a GitHub repo acting as a skills registry
hermes skills publish --to github --repo owner/repo ~/hermes-markdown-lint-skill
```

Replace `owner/repo` with your actual GitHub repository. After publishing, users
can install with:

```bash
hermes skills tap add owner/repo
hermes skills install markdown-lint
```

### Publishing to ClawHub

```bash
hermes skills publish --to clawhub ~/hermes-markdown-lint-skill
```

### Skill Structure

```
hermes-markdown-lint-skill/
├── SKILL.md                              # Skill document (loaded by Hermes)
├── references/
│   ├── .markdownlint.json               # GFM rule configuration
│   ├── .markdownlint-cli2.jsonc          # CLI2 auto-fix settings
│   └── fix-tables.py                    # Table separator normalizer
```

### Inspect Before Installing

Preview a skill without installing:

```bash
hermes skills inspect owner/repo/markdown-lint
```

---

## Skill Documentation

See [SKILL.md](SKILL.md) for the full skill document — workflows, configuration,
troubleshooting, and GFM rules reference.

## License

MIT License. See [LICENSE](LICENSE).
