#!/bin/bash
# Post-write hook — runs after Hermes writes a file
# Usage: post-write.sh <file>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LINT="$SCRIPT_DIR/lint.sh"

FILE="$1"
[ -f "$FILE" ] || exit 0

case "$FILE" in
    *.md) "$LINT" "$FILE" ;;
esac