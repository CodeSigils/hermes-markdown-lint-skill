# !/usr/bin/env bash

# Auto-lint markdown files on change using entr(1)

#

# Usage

# watch.sh              Watch default ~/notes directory

# watch.sh /path/dir   Watch custom directory

#

# Requires: entr (install via: apt install entr, brew install entr)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LINT="$SCRIPT_DIR/lint.sh"

TARGET="${1:-$HOME/notes}"

if [ ! -d "$TARGET" ]; then
    echo "Error: $TARGET is not a directory" >&2
    exit 1
fi

echo "Watching $TARGET for .md changes..."

find "$TARGET" -name "*.md" -type f | entr -r "$LINT" /_
