# Hermes Agent Instructions

Lints and auto-fixes Markdown files to enforce GitHub Flavored Markdown (GFM) rules.

> **Note:** Compatible with any LLM agent (Claude Code, OpenAI, OpenCode, etc.).

## Skill Location

Canonical entry point: `skills/markdown-lint/SKILL.md`

Helper scripts:

| File                                                 | Purpose                                  |
| :--------------------------------------------------- | :--------------------------------------- |
| `skills/markdown-lint/lint.js`                       | Pipeline wrapper — canonical entry point |
| `skills/markdown-lint/scripts/check-fences.js`       | Validates fenced code blocks             |
| `skills/markdown-lint/scripts/post-write.js`         | Auto-lint hook (optional)                |
| `skills/markdown-lint/references/format-tables.js`   | Single-pass table formatter              |
| `skills/markdown-lint/references/.markdownlint.json` | Lint rules config                        |

## Rules Enforced

These rules are configured in `.markdownlint.json`:

| Rule  | Description                    | Config           |
| :---- | :----------------------------- | :--------------- |
| MD003 | Atx style headings             | `atx`            |
| MD007 | List indent                    | 2 spaces         |
| MD009 | No trailing spaces             | 2 spaces allowed |
| MD010 | No hard tabs                   | enabled          |
| MD012 | Multiple blanks                | max 1            |
| MD014 | HR style                       | `---`            |
| MD024 | Multiple headings same content | disabled         |
| MD025 | Multiple top-level headings    | disabled         |
| MD026 | No punctuation after heading   | `. ,;:!`         |
| MD029 | Ordered list style             | enabled          |
| MD030 | List marker space              | enabled          |
| MD032 | Blanks around lists            | enabled          |
| MD033 | No inline HTML                 | disabled         |
| MD034 | No bare URLs                   | disabled         |
| MD035 | Horizontal rule style          | `---`            |
| MD036 | Emphasis in headings           | disabled         |
| MD040 | Fenced code language           | disabled         |
| MD041 | First heading style            | `dashed`         |
| MD045 | No alt text (images)           | enabled          |
| MD046 | Code block style               | `fenced`         |
| MD047 | Single trailing newline        | enabled          |
| MD048 | Code fence style               | `backtick`       |
| MD051 | Links inline                   | disabled         |
| MD052 | Links without text             | disabled         |
| MD055 | Table pipe style               | disabled         |
| MD060 | Table pipe alignment           | `left`           |

## Quick Reference

```bash
# Lint (read-only)
node ${HERMES_SKILL_DIR}/lint.js --check <file>

# Fix
node ${HERMES_SKILL_DIR}/lint.js <file>

# Fix all in directory
node ${HERMES_SKILL_DIR}/lint.js --all <dir>

# Check fenced code blocks
node ${HERMES_SKILL_DIR}/lint.js --fences <path>

# Validate table columns (exit 1 on mismatch)
node ${HERMES_SKILL_DIR}/lint.js --validate <path>
```

## Workflow

### After writing a `.md` file

Run lint immediately:

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>
```

Do not skip this step.

### Before committing

1. Check fenced blocks: `node ${HERMES_SKILL_DIR}/lint.js --fences <path>`
2. Validate tables: `node ${HERMES_SKILL_DIR}/lint.js --validate <path>`
3. Final lint: `node ${HERMES_SKILL_DIR}/lint.js --check <path>`

### After editing the config

Verify `${HERMES_SKILL_DIR}/references/.markdownlint.json` against this file. Every enabled rule must appear in both.

## Common Errors

| Error                          | Cause                      | Fix                    |
| :----------------------------- | :------------------------- | :--------------------- |
| MD018: No space after hash     | Missing space after `#`    | `## Heading`           |
| MD047: Single trailing newline | File missing final newline | Add blank line at end  |
| MD056: Table column count      | Separator width mismatch   | Run `format-tables.js` |
| MD060: Table pipe position     | Pipes misaligned           | Run `format-tables.js` |

## Before / After Examples

### Tables

Before:

```markdown
| Name  | Age |
| ---   | --- |
| Alice | 25  |
```

After:

```markdown
| Name  | Age |
| :---- | --: |
| Alice |  25 |
```

### Headings

Before:

```markdown
##No space
```

After:

```markdown
## No space
```

### Code Fences (MD040 disabled)

Blank fences are valid for output:

````markdown

output here

````

Use `text` for intentional blank-fence examples. Use `markdown` for examples of markdown output.

### Lists (MD032)

Before:

```markdown
- Item one
- Item two
```

After:

```markdown
- Item one

- Item two
```

### Horizontal Rules (MD035)

Before: `---`  
After: `***`

## Key Conventions

- `lint.js` is the canonical entry point — use it instead of `npx` directly
- MD040 is disabled — blank fences are allowed for output examples
- MD055 is disabled — leading/trailing `|` on tables is optional
- MD033 is disabled — inline HTML is allowed
- Use `${HERMES_SKILL_DIR}` or absolute paths in scripts

## Post-Install: Auto-Lint on Write

Add to `~/.hermes/config.yaml`:

```yaml
hooks:
  post_tool_call:
    - matcher: write_file
      command: "node ~/.hermes/skills/markdown-lint/scripts/post-write.js"
hooks_auto_accept: true
```

Restart Hermes. This is optional — the mandatory lint rule above handles the common case.

## Version Policy

- Update `metadata.version` in `SKILL.md` frontmatter on changes
- Document changes in `README.md` changelog