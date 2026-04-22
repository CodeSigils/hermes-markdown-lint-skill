# !/usr/bin/env bash

# Auto-lint markdown files on change using entr(1)

#

# Usage

#!/usr/bin/env bash
# Auto-lint markdown files on change using entr(1)
#
# Usage:
#   watch.sh              Watch all .md files under $HOME (recursive)
#   watch.sh /path/dir    Watch a specific directory
#
# Requires: entr (install via: apt install entr, brew install entr)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LINT="$SCRIPT_DIR/lint.sh"

# Default: watch all .md files under $HOME
TARGET="${1:-$HOME}"

if [ ! -d "$TARGET" ]; then
    echo "Error: $TARGET is not a directory" >&2
    exit 1
fi

echo "Watching $TARGET recursively for .md changes..."

# Watch directory recursively - entr reloads file list on any change
# -a: recombine file list after each event
# -r: run command on changes
find "$TARGET" -name '*.md' -type f | entr -a -r "$LINT" /_
