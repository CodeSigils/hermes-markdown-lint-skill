# Markdown Lint Skill for Hermes

[![Version](https://img.shields.io/badge/version-v2.9.1-blue.svg)](https://github.com/CodeSigils/hermes-markdown-lint-skill/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hermes Skill](https://img.shields.io/badge/Hermes-Skill-8A2BE2.svg)](https://hermes-agent.nousresearch.com/)

A zero-dependency Hermes Agent skill that automatically lints and fixes Markdown files to enforce [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/) rules.

Powered by **pure Node.js** — `format-tables.js` for single-pass table formatting and `markdownlint-cli2` for GFM rule enforcement. No global installations, no bash required.

---

## Agent Behavioral Standards

This repository follows **autonomous agent governance standards** — explicit behavioral contracts for LLM agents.

### What This Means

- **AGENTS.md** defines a formal contract: what agents MUST do, what they SHOULD NOT do
- **Severity levels** (BLOCKING/WARNING/INFO) make validation failures actionable
- **Imperative section headers** (Validate Changes, Resolve Failures) for machine readability
- **Safe automation boundaries** prevent destructive "helpful AI" behavior
- **Consistency checks** prevent drift between config, documentation, and formatter behavior

### Why It Matters

As LLM agents increasingly work autonomously in repositories, explicit governance becomes critical:

- Deterministic validation prevents silent regressions
- Severity levels enable safe autonomous PRs
- Behavioral contracts create reproducible contributor expectations
- Machine-readable sections enable programmatic enforcement
- CI-backed consistency checks turn governance claims into enforceable guarantees

This is part of a broader shift toward **AI-native repository standards** — where human and agent workflows are equally well-specified.

Learn more: See [AGENTS.md](AGENTS.md) for the full behavioral contract.

---

## Skill Documentation

See [skills/markdown-lint/SKILL.md](skills/markdown-lint/SKILL.md) for the full skill document.

## License

MIT License. See [LICENSE](./LICENSE).
