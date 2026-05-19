---
name: markdown-lint
description: >
  Lint and auto-fix GitHub Flavored Markdown (GFM) files. Run immediately after
  creating or editing any .md file to enforce consistent formatting.
version: 2.10.0
author: CodeSigils
license: MIT
metadata:
  hermes:
    tags: [markdown, lint, gfm, github, formatting, quality, documentation]
    category: devtools
---

# Markdown Lint

Use this skill whenever you create, edit, validate, or prepare to commit Markdown.
The hot path is intentionally short to reduce Hermes context overhead.

## Required Commands

Run the canonical wrapper, not `npx` directly:

```bash
node ${HERMES_SKILL_DIR}/lint.js <path>             # fix one file/path
node ${HERMES_SKILL_DIR}/lint.js --check <path>     # read-only check
node ${HERMES_SKILL_DIR}/lint.js --fences <path>    # fenced block validation
node ${HERMES_SKILL_DIR}/lint.js --validate <path>  # table column validation
node ${HERMES_SKILL_DIR}/lint.js --all <dir>        # fix all Markdown below dir
```

## Agent Contract

Agents using this skill MUST:

1. Run `node ${HERMES_SKILL_DIR}/lint.js <path>` immediately after creating or editing any `.md` file.
2. Run `--fences`, `--validate`, and final `--check` before committing Markdown-heavy changes.
3. Treat table column mismatches and unclosed fences as blocking failures.
4. Avoid direct `npx markdownlint-cli2` calls unless debugging this skill itself.
5. Avoid broad repo formatting unless the task explicitly asks for it.

Do not batch multiple Markdown edits and lint later. Lint each changed Markdown file immediately.

## Safety Notes

- Fenced code blocks are safety boundaries; do not rewrite their contents as prose.
- Blank fences are valid for output examples because MD040 is disabled.
- Tables preserve semantic alignment (`:---`, `---:`, `:---:`).
- Pipes inside table cells must be escaped as `&#124;`.
- Prefer ASCII status words in tables over emoji when MD060 alignment is unstable.
- If a file contains generated or externally managed blocks, use `--check` first or revert unintended edits inside the managed span.

## References

- Full rule table: `references/rules.md`
- Rule config: `references/.markdownlint.json`
- Table formatter: `references/format-tables.js`
- Fence checker: `scripts/check-fences.js`
- Optional write hook: `scripts/post-write.js`
