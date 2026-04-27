# Hermes Agent Instructions

This skill lints and auto-fixes Markdown files to enforce GitHub Flavored Markdown (GFM) rules.

## Official Standards

- **Skill structure**: Use `skills/<skill-name>/SKILL.md` as the entry point
- **Entry commands**: Use `skills/<skill-name>/lint.sh` or documented CLI tools
- **Hermes hooks**: Use `skills/<skill-name>/scripts/post-write.sh` via hooks config
- **Verification**: Cross-reference config against SKILL.md rules tables

## MD Rules Enforced

| Rule | Description | Enabled |
| :--- | :---------- | :------- |
| MD001 | Heading increments | Yes |
| MD002 | First heading should be h1 | Yes |
| MD003 | Atx style headings | Yes |
| MD004 | Bullet list style | Yes |
| MD005 | Table pipe alignment | Yes |
| MD010 | No hard tabs | Yes |
| MD018 | No space after hash | Yes |
| MD019 | No multiple spaces after hash | Yes |
| MD022 | Blank lines around headings | Yes |
| MD023 | Heading space after hash | Yes |
| MD024 | Multiple headings with same content | Yes |
| MD025 | Multiple top-level headings | Yes |
| MD026 | No space after hyphen in atx | Yes |
| MD027 | Space after marker | Yes |
| MD028 | Inside block quote | Yes |
| MD029 | Ordered list item prefix | Yes |
| MD030 | List marker space | Yes |
| MD031 | Blank lines around lists | Yes |
| MD032 | Blanks around lists | Yes |
| MD033 | No inline HTML | Yes |
| MD034 | No bare URLs | Yes |
| MD035 | Horizontal rule style | Yes |
| MD036 | No space after emphasis | Yes |
| MD037 | No space in emphasis | Yes |
| MD038 | No space in code span | Yes |
| MD039 | No space after code span | Yes |
| MD040 | Code fence language | No (blank allowed) |
| MD041 | First heading in file | Yes |
| MD042 | No empty links | Yes |
| MD043 | Valid heading structure | Yes |
| MD044 | Proper names | Yes |
| MD045 | Emphasis used correctly | Yes |
| MD046 | Code block style | Yes |
| MD047 | Single trailing newline | Yes |
| MD049 | No empty link text | Yes |
| MD050 | Strong/emphasis style | Yes |
| MD051 | Links should be inline | Yes |
| MD052 | Links without text | Yes |
| MD053 | Code fence language | Yes |
| MD054 | Sass/SCSS areas | Yes |
| MD055 | Table pipe style | Yes (trailing pipes) |
| MD056 | Table column count | Yes |
| MD057 | Table pipe separation | Yes |
| MD058 | Table collapsed border | Yes |
| MD059 | Emphasis in heading | Yes |
| MD060 | Table column alignment | Yes |
| MD061 | Table hex color | Yes |
| MD062 | Emphasis in heading | Yes |
| MD063 | Punctuation at start of heading | Yes |
| MD064 | Link text variation | Yes |
| MD065 | No GFM disabled | Yes |
| MD066 | No trailing spaces | Yes |
| MD067 | Code vs pre | Yes |
| MD068 | Colons in definition | Yes |
| MD069 | Atx style closed | Yes |
| MD070 | No space after marker | Yes |

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

## Before / After Examples

### Tables (MD055 + MD060)

Before (not compliant):

```markdown
|Name|Age|Role|
|----|---|----|
|Alice|25|Developer|
```

After (GFM compliant with trailing pipes):

```markdown
| Name     | Age | Role      |
| :------- | --: | :-------- |
| Alice    | 25  | Developer |
```

### Headings (MD018)

Before:

```markdown
##No space after hash
```

After:

```markdown
## No space after hash
```

### Code Fences (MD040 disabled)

Both are valid — blank fences allowed for output:

```markdown
```

Output result here

```
```

```markdown
```python
def hello():
    print("Hello")
```

```

### Lists (MD032)

Before:

```markdown
- Item one
- Item two
- Item three
```

After:

```markdown
- Item one

- Item two

- Item three
```

### Horizontal Rules (MD035)

Before:

```markdown
---
```

After:

```markdown
***
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
