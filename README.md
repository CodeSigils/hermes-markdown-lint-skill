# Markdown Lint Skill for Hermes

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules.
A skill for the [Hermes Agent](https://github.com/nousresearch/hermes-agent) ecosystem.

Supports two backends:

-   **markdownlint-cli2** via `bunx` — zero install, works immediately
-   **rumdl** — self-downloaded static binary (faster, one-time setup)

---

## For End Users

### Prerequisites

**bun** — required for the primary (zero-install) backend.

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash
```

Verify:

```bash
bun --version
```

### Install the Skill

```bash
hermes skills tap add CodeSigils/hermes-markdown-lint-skill
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

### Quick Start

```bash
# Zero-install: lint and fix with markdownlint-cli2 (requires bun)
bunx markdownlint-cli2 <path> --fix

# After one-time setup: use rumdl (faster)
~/.hermes/skills/markdown-lint/references/get-rumdl   # one-time
rumdl check --fix <path>
```

For prose documentation with tables, use the two-step pipeline:

```bash
fix-tables.py <path> && bunx markdownlint-cli2 <path> --fix
```

### Configuration

Copy the reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.markdownlint-cli2.jsonc ./
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
        ├── SKILL.md                            # Skill document (loaded by Hermes)
        └── references/
            ├── get-rumdl                       # One-time rumdl download script
            ├── fix-tables.py                   # Table separator normalizer
            ├── .markdownlint-cli2.jsonc       # CLI2 config (fix:true, gitignore:true)
            ├── .rumdl.toml                    # rumdl rule config
            └── .markdownlint.json             # markdownlint compat config
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
