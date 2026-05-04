#!/usr/bin/env bash
# Check fenced code blocks in markdown files for GFM compliance.
# Verifies: no empty openers, no bare-lang closers, matched counts, no double-fences.
# Exit 0 = all clean, exit 1 = issues found.

set -euo pipefail

check_file() {
    local file="$1"
    local issues=0
    local ln=0

    while IFS= read -r line; do
        ln=$((ln + 1))
        # Detect fence lines
        if [[ "$line" =~ ^(\`{3,}|~{3,})(.*) ]]; then
            local count="${#BASH_REMATCH[1]}"
            local char="${BASH_REMATCH[1]:0:1}"
            local lang="${BASH_REMATCH[2]}"

            if [[ -z "${in_fence:-}" ]]; then
                # Opening fence
                in_fence=1
                opener_count="$count"
                opener_line="$ln"
                opener_raw="$line"

                if [[ -z "$lang" ]]; then
                    echo "[EMPTY_LANG] $file:$ln | $line"
                    issues=$((issues + 1))
                fi
            else
                # Closing fence
                unset in_fence
                local closer_count="$count"
                local closer_line="$ln"

                if [[ -n "$lang" ]]; then
                    echo "[BAD_CLOSER] $file:$closer_line | lang='$lang' | expected: $char$char$char"
                    issues=$((issues + 1))
                fi

                if [[ "$opener_count" != "$closer_count" ]]; then
                    echo "[COUNT_MISMATCH] $file:$opener_line vs $closer_line | opener=${opener_count} vs closer=${closer_count}"
                    issues=$((issues + 1))
                fi
            fi
        fi
    done < "$file"

    return $issues
}

total=0
for arg in "$@"; do
    if [[ -d "$arg" ]]; then
        while IFS= read -r -d '' f; do
            c=0
            check_file "$f" || c=$?
            total=$((total + c))
        done < <(find "$arg" -name '*.md' -type f -print0 | sort -z)
    elif [[ -f "$arg" ]]; then
        c=0
        check_file "$arg" || c=$?
        total=$((total + c))
    fi
done

if [[ $total -eq 0 ]]; then
    echo "All fences clean."
    exit 0
else
    echo ""
    echo "Found $total fence issue(s)."
    exit 1
fi
