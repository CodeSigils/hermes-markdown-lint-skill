# Hermes Agent Instructions

Lints and auto-fixes Markdown files to enforce GitHub Flavored Markdown (GFM) rules.

> **Note:** Compatible with any LLM agent (Claude Code, OpenAI, OpenCode, etc.).

## Agent Contract

Agents creating or editing Markdown files in this repository MUST:

1. Run lint validation immediately after every tool, editor, or script action that creates or edits a `.md` file
2. Check fenced code blocks before committing
3. Validate table column consistency before pushing
4. Use `lint.js` as the canonical entry point — not `npx` directly
5. Prefer auto-fix (`lint.js <path>`) before manual formatting

Agents SHOULD NOT:

- Rewrite semantic prose for style-only reasons
- Alter code fence languages without certainty
- Normalize intentionally preserved formatting
- Modify generated content sections directly
- Batch multiple Markdown edits and lint later — lint each changed Markdown file immediately

## Design Philosophy

This repository treats Markdown linting as **agent-safe repository governance**:

- Formatting must be deterministic and idempotent
- Configuration, documentation, and script behavior must stay in sync
- Table formatting preserves semantic alignment (`:---`, `---:`, `:---:`)
- Fenced code blocks are safety boundaries and must not be rewritten as prose
- `lint.js` is the canonical entry point for all automated and manual runs

## Validate Changes

### After creating or editing a `.md` file

Run lint immediately after each Markdown file creation or edit, regardless of whether the change came from `write_file`, `apply_patch`, an editor, or a script:

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>
```

Do not skip this step.

### Before committing

1. Check repository consistency: `node scripts/check-consistency.js`
2. Check fenced blocks: `node ${HERMES_SKILL_DIR}/lint.js --fences <path>`
3. Validate tables: `node ${HERMES_SKILL_DIR}/lint.js --validate <path>`
4. Final lint: `node ${HERMES_SKILL_DIR}/lint.js --check <path>`

### After editing the config

Update the Rules Enforced sections in `AGENTS.md` and `skills/markdown-lint/SKILL.md`, plus the README policy summary and changelog when behavior changes. Then run:

```bash
node scripts/check-consistency.js
```

## Quick Reference

```bash
# Lint (read-only)
node ${HERMES_SKILL_DIR}/lint.js --check <file>

# Fix after creating or editing Markdown
node ${HERMES_SKILL_DIR}/lint.js <file>

# Fix all in directory
node ${HERMES_SKILL_DIR}/lint.js --all <dir>

# Check fenced code blocks
node ${HERMES_SKILL_DIR}/lint.js --fences <path>

# Validate table columns (exit 1 on mismatch)
node ${HERMES_SKILL_DIR}/lint.js --validate <path>
```

## Rules Enforced

These rules are configured in `skills/markdown-lint/references/.markdownlint.json`:

| Rule  | Description                                    | Config           |
| :---- | :--------------------------------------------- | :--------------- |
| MD003 | Atx style headings                             | `atx`            |
| MD007 | List indent                                    | 2 spaces         |
| MD009 | No trailing spaces                             | 2 spaces allowed |
| MD010 | No hard tabs                                   | enabled          |
| MD012 | Multiple blanks                                | max 1            |
| MD013 | Line length                                    | disabled         |
| MD014 | No dollar signs before commands without output | enabled          |
| MD024 | Multiple headings same content                 | disabled         |
| MD025 | Multiple top-level headings                    | disabled         |
| MD026 | No punctuation after heading                   | `.,;:!`          |
| MD029 | Ordered list style                             | ordered          |
| MD030 | List marker space                              | enabled          |
| MD032 | Blanks around lists                            | enabled          |
| MD033 | No inline HTML                                 | disabled         |
| MD034 | No bare URLs                                   | disabled         |
| MD035 | Horizontal rule style                          | `---`            |
| MD036 | Emphasis in headings                           | disabled         |
| MD040 | Fenced code language                           | disabled         |
| MD041 | First line is top-level heading                | enabled          |
| MD045 | No alt text (images)                           | enabled          |
| MD046 | Code block style                               | `fenced`         |
| MD047 | Single trailing newline                        | enabled          |
| MD048 | Code fence style                               | `backtick`       |
| MD051 | Links inline                                   | disabled         |
| MD052 | Links without text                             | disabled         |
| MD055 | Table pipe style                               | disabled         |
| MD060 | Table column alignment                         | `aligned`        |

## Resolve Failures

### Severity Levels

| Level    | CI     | Merge   | Description                            |
| :------- | :----- | :------ | :------------------------------------- |
| BLOCKING | fails  | blocked | Table column mismatch, unclosed fences |
| WARNING  | fails  | blocked | markdownlint rule violation            |
| INFO     | passes | allowed | Disabled-rule guidance                 |

### Common Errors

| Error                          | Severity | Cause                      | Fix                    |
| :----------------------------- | :------- | :------------------------- | :--------------------- |
| MD018: No space after hash     | WARNING  | Missing space after `#`    | `## Heading`           |
| MD047: Single trailing newline | WARNING  | File missing final newline | Add blank line at end  |
| MD056: Table column count      | BLOCKING | Separator width mismatch   | Run `format-tables.js` |
| MD060: Table pipe position     | WARNING  | Pipes misaligned           | Run `format-tables.js` |
| Unclosed code fence            | BLOCKING | Opener/closer mismatch     | Run `--fences` check   |

### Code Fence Rules (MD040 disabled)

Blank fences are valid for output examples:

````markdown

output here

````

Use `text` for intentional blank-fence examples. Use `markdown` for examples of markdown output.

## Fix Common Issues

### Tables

Before:

```markdown
| Name  | Age |
| ---   | ---: |
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

### Lists (MD032)

Before:

```markdown
Intro paragraph
- Item one
- Item two
Next paragraph
```

After:

```markdown
Intro paragraph

- Item one
- Item two

Next paragraph
```

### Horizontal Rules (MD035)

Before: `***`  
After: `---`

## Key Conventions

- `lint.js` is the canonical entry point — use it instead of `npx` directly
- MD040 is disabled — blank fences are allowed for output examples
- MD055 is disabled — leading/trailing `|` on tables is optional
- MD033 is disabled — inline HTML is allowed
- MD060 is `aligned` — preserve semantic table alignment
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

Restart Hermes. This is optional — the mandatory lint rule handles the common case.

## Version Policy

- Update top-level `version` in `SKILL.md` frontmatter on changes
- Document changes in `README.md` changelog
- Run `node scripts/check-consistency.js` after rule/config/doc edits
- Keep the README changelog current for user-visible behavior, contract, and validation changes

## Skill Location

Canonical entry point: `skills/markdown-lint/SKILL.md`

Helper scripts:

| File                                                 | Purpose                                  |
| :--------------------------------------------------- | :--------------------------------------- |
| `lint.js`                                            | Root developer wrapper                   |
| `scripts/check-consistency.js`                       | Checks config/docs consistency           |
| `skills/markdown-lint/lint.js`                       | Pipeline wrapper — canonical entry point |
| `skills/markdown-lint/scripts/check-fences.js`       | Validates fenced code blocks             |
| `skills/markdown-lint/scripts/post-write.js`         | Auto-lint hook (optional)                |
| `skills/markdown-lint/references/format-tables.js`   | Single-pass table formatter              |
| `skills/markdown-lint/references/.markdownlint.json` | Lint rules config                        |
