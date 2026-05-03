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

# Resolve npx — cross-platform (macOS, Linux, WSL, Debian, Ubuntu, Fedora)
resolve_npx() {
    local NPX=""
    # Try system PATH first (works on most setups)
    if command -v npx >/dev/null 2>&1; then
        NPX="$(command -v npx)"
    # Try corepack (Debian/Ubuntu/WSL)
    elif [ -x /usr/share/nodejs/corepack/shims/npx ]; then
        NPX="/usr/share/nodejs/corepack/shims/npx"
    # Try homebrew on macOS
    elif [ -x /opt/homebrew/bin/npx ]; then
        NPX="/opt/homebrew/bin/npx"
    # Try nvm/fnm on macOS or Linux
    elif [ -d "$HOME/.local/share/fnm/node-versions" ]; then
        NPX="$HOME/.local/share/fnm/node-versions"/*/bin/npx 2>/dev/null || true
        NPX="$(echo $NPX)"
    elif [ -d "$HOME/.nvm/versions/node" ]; then
        NPX="$HOME/.nvm/versions/node"/*/bin/npx 2>/dev/null || true
        NPX="$(echo $NPX)"
    # Try ZED's bundled node (cross-platform)
    elif [ -d "$HOME/.local/share/zed/node" ]; then
        NPX="$HOME/.local/share/zed/node"/*/bin/npx 2>/dev/null || true
        NPX="$(echo $NPX)"
    # Try OpenCode's node
    elif [ -x "$HOME/.opencode/bin/node" ]; then
        NPX="$HOME/.opencode/bin/node"
    # Try fnm default installation (Linux)
    elif [ -x "$HOME/.local/share/fnm/fnm" ]; then
        local fnm_node
        fnm_node="$("$HOME/.local/share/fnm/fnm" current)" 2>/dev/null || true
        [ -n "$fnm_node" ] && [ -x "$fnm_node/bin/npx" ] && NPX="$fnm_node/bin/npx"
    fi
    # Fallback: try node as direct runner
    if [ -z "$NPX" ] || [ ! -x "$NPX" ]; then
        if command -v node >/dev/null 2>&1; then
            NPX="node"
        else
            echo "Error: npx not found. Install Node.js or ensure npx is in PATH." >&2
            exit 1
        fi
    fi
    echo "$NPX"
}

NPX="$(resolve_npx)"

# Helper: run npx with fallback for node-as-npx
run_npx() {
    if [[ "$NPX" == "node" ]]; then
        # Fallback: use node to run npx-cli.js directly from fnm/nvm
        local npx_cli=""
        for dir in "$HOME/.local/share/fnm/node-versions" "$HOME/.nvm/versions/node" "$HOME/.local/share/nvm/versions/node"; do
            if [ -d "$dir" ]; then
                npx_cli="$dir"/*/bin/npx-cli.js 2>/dev/null || true
                npx_cli="$(echo $npx_cli)"
                if [ -x "$npx_cli" ]; then
                    node "$npx_cli" "$@"
                    return
                fi
            fi
        done
        echo "Error: Cannot run npx. Ensure node and npm are properly installed." >&2
        exit 1
    else
        "$NPX" "$@"
    fi
}

usage() {
    echo "Usage: $0 [--check] [--all] [--validate] <path>"
    echo "  --check      Read-only check (exit 0 if clean)"
    echo "  --all        Treat <path> as a directory, fix all .md files"
    echo "  --validate   Validate table column consistency (exit 1 if mismatches)"
    exit 1
}

CHECK=false
ALL=false
VALIDATE=false
TARGET=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --check)     CHECK=true;    shift ;;
        --all)       ALL=true;      shift ;;
        --validate)  VALIDATE=true; shift ;;
        -*)          usage ;;
        *)           TARGET="$1";    shift ;;
    esac
done

if [[ -z "$TARGET" ]]; then
    usage
fi

if [[ "$VALIDATE" == true ]]; then
    if [[ -d "$TARGET" ]]; then
        find "$TARGET" -name "*.md" -exec node "$FIX_TABLES" --validate {} \;
    else
        node "$FIX_TABLES" --validate "$TARGET"
    fi
    exit $?
fi

# Step 1: Normalize table separators (skip if --check mode)
if [[ "$CHECK" != true ]]; then
    if [[ -d "$TARGET" ]]; then
        find "$TARGET" -name "*.md" -exec node "$FIX_TABLES" {} \;
    else
        node "$FIX_TABLES" "$TARGET"
    fi
fi

# Step 2: markdownlint with skill config
if [[ "$CHECK" == true ]]; then
    if [[ -d "$TARGET" ]]; then
        TARGET_DIR="${TARGET%/}"
        run_npx markdownlint-cli2 --config "$CONFIG" $(find "$TARGET_DIR" -name "*.md" -type f)
    else
        run_npx markdownlint-cli2 --config "$CONFIG" "$TARGET"
    fi
else
    if [[ -d "$TARGET" ]]; then
        TARGET_DIR="${TARGET%/}"
        run_npx markdownlint-cli2 --config "$CONFIG" $(find "$TARGET_DIR" -name "*.md" -type f) --fix
    else
        run_npx markdownlint-cli2 --config "$CONFIG" "$TARGET" --fix
    fi
fi
