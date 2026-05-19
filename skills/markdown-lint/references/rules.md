# Markdown Lint Rules

This reference records the explicit markdownlint rules enforced by `references/.markdownlint.json`.
Keep this file, `AGENTS.md`, and the config synchronized when rules change.

## Explicitly Configured Rules

| Rule  | Title                       | Description                                    | Config           |
| :---- | :-------------------------- | :--------------------------------------------- | :--------------- |
| MD003 | heading-style               | Use ATX headings (`#` style)                   | `atx`            |
| MD007 | ul-indent                   | Unordered list indent                          | 2 spaces         |
| MD009 | no-trailing-spaces          | Trailing spaces                                | 2 spaces allowed |
| MD010 | no-hard-tabs                | No hard tabs                                   | enabled          |
| MD012 | no-multiple-blanks          | Multiple blanks                                | max 1            |
| MD013 | line-length                 | Line length                                    | disabled         |
| MD014 | commands-show-output        | No dollar signs before commands without output | enabled          |
| MD024 | multiple-headings           | Same text in multiple sections                 | disabled         |
| MD025 | multiple-h1                 | Multiple top-level headings                    | disabled         |
| MD026 | no-punctuation-at-end       | No trailing punctuation on headings            | `.,;:!`          |
| MD029 | ol-prefix                   | Ordered list prefix style                      | ordered          |
| MD030 | list-marker-space           | Spaces after list markers                      | enabled          |
| MD032 | blanks-around-lists         | Lists surrounded by blank lines                | enabled          |
| MD033 | no-inline-html              | Inline HTML                                    | disabled         |
| MD034 | no-bare-urls                | Bare URLs                                      | disabled         |
| MD035 | hr-style                    | Horizontal rule style                          | `---`            |
| MD036 | emphasis-instead-of-heading | Emphasis instead of heading                    | disabled         |
| MD040 | fenced-code-language        | Fenced code language                           | disabled         |
| MD041 | first-line-heading          | First line is a top-level heading              | enabled          |
| MD045 | no-alt-text                 | Images need alt text                           | enabled          |
| MD046 | code-block-style            | Fenced code blocks                             | `fenced`         |
| MD047 | single-trailing-newline     | File ends with newline                         | enabled          |
| MD048 | code-fence-style            | Backtick fences                                | `backtick`       |
| MD051 | no-bare-reference-link      | Bare reference links                           | disabled         |
| MD052 | no-bare-reference-link      | Links without text                             | disabled         |
| MD055 | table-pipe-style            | Consistent leading/trailing pipes              | disabled         |
| MD060 | table-column-style          | Pipes align with columns                       | `aligned`        |

## Policy Notes

- MD040 is disabled so blank fences remain valid for output examples.
- MD055 is disabled so leading and trailing table pipes remain optional.
- MD033 is disabled so inline HTML remains valid in Markdown.
- MD060 is set to `aligned` so table column positions are normalized while preserving semantic alignment.
