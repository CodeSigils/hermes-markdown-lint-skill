#!/usr/bin/env bash
# Developer convenience wrapper
# Forwards commands to the canonical skill entry point

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/skills/markdown-lint/lint.sh" "$@"
