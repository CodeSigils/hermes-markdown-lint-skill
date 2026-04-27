# Hermes Agent Instructions

When working in Hermes skill repos, follow these conventions.

## Official Standards

- **Skill structure**: Use `skills/<skill-name>/SKILL.md` as the entry point
- **Entry commands**: Use `skills/<skill-name>/lint.sh` or documented CLI tools
- **Hermes hooks**: Use `skills/<skill-name>/scripts/post-write.sh` via hooks config
- **Verification**: Cross-reference config against SKILL.md rules tables

## Agent Best Practices

Follow these principles in all work:

1. **Read first, then act** — read existing files before editing. Understand the current state.
2. **Verify before committing** — test changes. Run linters. Don't assume it works.
3. **Use tools actively** — file read/search instead of grep/cat. Run lint.sh before push.
4. **Be incremental** — commit logical chunks. One concern per commit.
5. **Handle errors gracefully** — show actionable error messages. Don't hide failures.
6. **Preserve working behavior** — don't break what's already correct. The formatter is idempotent.
7. **Learn from mistakes** — if something fails, understand why before retrying.
8. **Use best practices proactively** — add input validation, security checks, proper error handling without being asked.

## Quick Start

### Lint a file (read-only check)

```bash
${HERMES_SKILL_DIR}/lint.sh --check <file>
```

### Fix a file

```bash
${HERMES_SKILL_DIR}/lint.sh <file>
```

### Fix all markdown files in directory

```bash
${HERMES_SKILL_DIR}/lint.sh --all <dir>
```

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

## Testing

### Run Test Suite

```bash
node test/fix-tables.test.js
```

All 28 tests must pass. Tests validate:

- Separator detection (valid/invalid separators)
- Width calculation (string-width for emoji/CJK)
- Alignment preservation (left/center/right)
- Fix behavior (fixes old-style, skips correct)

### Manual Testing

Create a test file with various table styles, then run:

```bash
# Step 1: normalize table separators
node skills/markdown-lint/references/fix-tables.js test-file.md

# Step 2: lint and auto-fix remaining issues
npx markdownlint-cli2 --config skills/markdown-lint/references/.markdownlint.json test-file.md --fix
```

## Key Conventions

- `lint.sh` is the canonical interface — use it instead of running npx directly
- npx path in Hermes environments: `/usr/share/nodejs/corepack/shims/npx`
- MD055 (trailing pipes) is enabled — tables must have trailing pipes
- MD040 (code fence language) is disabled — blank fences are allowed for output examples and placeholders
- Always use `${HERMES_SKILL_DIR}` or absolute paths in scripts

## Troubleshooting

### Common Errors

| Error | Cause | Fix |
| :--- | :---- | :--- |
| MD018: No space after hash | Missing space after `#` | Add space: `## Heading` |
| MD047: Single trailing newline | File doesn't end with newline | Add blank line at end |
| MD055: No trailing pipe | Table row missing trailing pipe | Add trailing pipe |
| MD056: Table column width | Separator width mismatch | Run the fix-tables tool |
| MD060: Table pipe position | Pipes not aligned | Run the fix-tables tool |

### fix-tables.js Issues

**Problem**: Tables with emoji/CJK don't align visually.

**Cause**: Using code-unit length instead of visual width.

**Fix**: Install `string-width` package for proper double-width handling:

```bash
cd skills/markdown-lint/references
npm install string-width
```

Without it, falls back to `.length` count — works for ASCII but not emoji/CJK.

## Version Policy

- Update `metadata.version` in SKILL.md frontmatter on each meaningful change
- Document changes in README.md changelog (v2.7, v2.6, etc.)

Changelog format:

```markdown
### Key Changes in v2.7

- Brief description of change
- Another change
```

## Post-Install: Auto-Lint on Write

To auto-lint every markdown file Hermes writes, add hook to `~/.hermes/config.yaml`:

```yaml
hooks:
  post_tool_call:
    - matcher: write_file
      command: "~/.hermes/skills/markdown-lint/scripts/post-write.sh"
hooks_auto_accept: true
```

Restart Hermes for hook to activate.

## Files to Know

| File | Purpose |
| :--- | :------ |
| `skills/markdown-lint/SKILL.md` | Skill instructions for Hermes |
| `skills/markdown-lint/references/.markdownlint.json` | Lint rules config |
| `skills/markdown-lint/lint.sh` | Pipeline wrapper |
| `skills/markdown-lint/scripts/post-write.sh` | Auto-lint hook |
| `skills/markdown-lint/references/fix-tables.js` | Table separator normalizer |
| `test/kitchensink.md` | Comprehensive test fixture |
| `test/fix-tables.test.js` | Test suite (28 tests) |
