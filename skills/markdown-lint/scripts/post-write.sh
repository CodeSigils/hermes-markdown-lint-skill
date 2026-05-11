#!/bin/bash
# Shell hook for post_tool_call — lints markdown files after write_file
# Receives JSON payload via stdin from Hermes
#
# IMPORTANT: Requires jq to be installed. See README > Auto-Lint on Write
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LINT="$SCRIPT_DIR/lint.sh"

# Read JSON payload from stdin
payload="$(cat -)"

# Extract file path using node (zero dependency alternative to jq)
file_path="$(echo "$payload" | node -e "try{console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).tool_input.path||'')}catch(e){}" 2>/dev/null)" || file_path=""

# Skip if not a markdown file or file doesn't exist
if [[ -z "$file_path" ]]; then
    exit 0
fi

# Use case for pattern matching (bash 3 compatible)
case "$file_path" in
    *.md) ;;
    *) exit 0 ;;
esac

[[ ! -f "$file_path" ]] && exit 0

# Run lint
"$LINT" "$file_path"

# Output empty JSON (return value ignored for post_tool_call)
printf '{}\n'