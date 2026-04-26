# Hermes Agent Instructions

## Workflow

### Before Editing Any File

Always run a lint check first:

```bash
/usr/share/nodejs/corepack/shims/npx --yes markdownlint-cli2@latest --config skills/markdown-lint/references/.markdownlint.json <file>
```

Fix any lint errors before committing.

### After Editing README.md or SKILL.md

Run lint check on both:

```bash
/usr/share/nodejs/corepack/shims/npx --yes markdownlint-cli2@latest --config skills/markdown-lint/references/.markdownlint.json README.md skills/markdown-lint/SKILL.md
```

### After Editing the Config

Verify the config loads correctly by cross-referencing it against the rules documented in SKILL.md. Every rule in the config should appear in one of the two rules tables.

### Test Fixture

Run against kitchensink.md to verify the skill works end-to-end:

```bash
/usr/share/nodejs/corepack/shims/npx --yes markdownlint-cli2@latest --config skills/markdown-lint/references/.markdownlint.json test/kitchensink.md
```

## Version Policy

- Update `metadata.version` in SKILL.md frontmatter on each meaningful change
- Document changes in README.md changelog (v2.6, v2.5, etc.)

## Key Conventions

- `lint.sh` is the canonical interface — use it instead of running npx directly
- npx path in Hermes environments: `/usr/share/nodejs/corepack/shims/npx`
- MD055 (trailing pipes) is enabled — tables must have trailing pipes
- MD040 (code fence language) is disabled — blank fences are allowed for output examples and placeholders

## Files to Know

| File | Purpose |
| :--- | :------ |
| `skills/markdown-lint/SKILL.md` | Skill instructions for Hermes |
| `skills/markdown-lint/references/.markdownlint.json` | Lint rules config |
| `skills/markdown-lint/lint.sh` | Pipeline wrapper |
| `skills/markdown-lint/scripts/post-write.sh` | Auto-lint hook |
| `skills/markdown-lint/references/fix-tables.js` | Table separator normalizer |
| `test/kitchensink.md` | Comprehensive test fixture |
