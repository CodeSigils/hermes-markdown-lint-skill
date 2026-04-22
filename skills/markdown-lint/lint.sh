#!/usr/bin/env bash
# Markdown Lint Pipeline — wraps fix-tables.js + markdownlint-cli2
# Zero-install: uses Node.js from the system, finds npx automatically.
#
# Usage:
#   lint.sh <path>          Fix a single file or directory
#   lint.sh --check <path>  Read-only check (exit 0 if clean)
#   lint.sh --all <dir>     Fix all .md in directory
#
# Requires: node, npx (npm ships with node)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FIX_TABLES="$SCRIPT_DIR/references/fix-tables.js"
CONFIG="$SCRIPT_DIR/references/.markdownlint.json"

# Resolve npx — check common installation paths since PATH varies by environment
resolve_npx() {
    local NPX=""
    # Try system PATH first
    if command -v npx >/dev/null 2>&1; then
        NPX="$(command -v npx)"
    # Try corepack (Debian/Ubuntu)
    elif [ -x /usr/share/nodejs/corepack/shims/npx ]; then
        NPX="/usr/share/nodejs/corepack/shims/npx"
    # Try home-installed node via nvm/fnm
    elif [ -d "$HOME/.local/share/zed/node" ]; then
        NPX="$HOME/.local/share/zed/node"/*/bin/npx 2>/dev/null || true
        NPX="$(echo $NPX)"  # glob expansion
    fi
    if [ -z "$NPX" ] || [ ! -x "$NPX" ]; then
        echo "Error: npx not found. Install Node.js or ensure npx is in PATH." >&2
        exit 1
    fi
    echo "$NPX"
}

NPX="$(resolve_npx)"

usage() {
    echo "Usage: $0 [--check] [--all] <path>"
    echo "  --check    Read-only check (exit 0 if clean)"
    echo "  --all      Treat <path> as a directory, fix all .md files"
    exit 1
}

CHECK=false
ALL=false
TARGET=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --check) CHECK=true; shift ;;
        --all)   ALL=true;  shift ;;
        -*)      usage ;;
        *)       TARGET="$1"; shift ;;
    esac
done

if [[ -z "$TARGET" ]]; then
    usage
fi

# Step 1: Normalize table separators
if [[ -d "$TARGET" ]]; then
    find "$TARGET" -name "*.md" -exec node "$FIX_TABLES" {} \;
else
    node "$FIX_TABLES" "$TARGET"
fi

# Step 2: markdownlint with skill config
if [[ "$CHECK" == true ]]; then
    "$NPX" markdownlint-cli2 --config "$CONFIG" "$TARGET"
else
    "$NPX" markdownlint-cli2 --config "$CONFIG" "$TARGET" --fix
fi
