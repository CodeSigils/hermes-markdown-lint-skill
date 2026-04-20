# Markdown Lint Skill for Hermes

Auto-fix Markdown files to enforce GitHub Flavored Markdown (GFM) rules using
`rumdl`. A skill for the [Hermes Agent](https://github.com/nousresearch/hermes-agent) ecosystem.

**Why rumdl:** 12MB static binary, 26x faster than Node.js linters, same MD-numbered
rules as markdownlint, and it ships inside this skill so it works out of the box.

---

## For End Users

### Prerequisites

**Zero-install (recommended):** The skill ships a pre-built rumdl binary. No install needed.

For standalone install on PATH:

```bash
# Linux x86_64
curl -L https://github.com/rvben/rumdl/releases/latest/download/rumdl-x86_64-unknown-linux-musl.tar.gz \
  | tar xz -C /usr/local/bin rumdl

# macOS Intel
curl -L https://github.com/rvben/rumdl/releases/latest/download/rumdl-x86_64-apple-darwin.tar.gz \
  | tar xz -C /usr/local/bin rumdl

# macOS Apple Silicon
curl -L https://github.com/rvben/rumdl/releases/latest/download/rumdl-aarch64-apple-darwin.tar.gz \
  | tar xz -C /usr/local/bin rumdl
```

### Install the Skill

```bash
hermes skills tap add CodeSigils/hermes-markdown-lint-skill
hermes skills install CodeSigils/hermes-markdown-lint-skill/markdown-lint
```

### Quick Start

```bash
# Bundled binary (no install needed)
~/.hermes/skills/markdown-lint/references/rumdl check --fix <path>

# Or with rumdl on PATH
rumdl check --fix <path>

# Batch fix all .md files
rumdl check --fix .
```

For prose documentation with tables, use the two-step pipeline:

```bash
fix-tables.py <path> && rumdl check --fix <path>
```

### Configuration

Copy the reference config to your project:

```bash
cp ~/.hermes/skills/markdown-lint/references/.rumdl.toml <your-project>/
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
            ├── rumdl                           # Pre-built 12MB static binary
            ├── .rumdl.toml                     # GFM rule config
            ├── .markdownlint.json              # markdownlint compat config
            ├── .markdownlint-cli2.jsonc        # CLI2 config
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
