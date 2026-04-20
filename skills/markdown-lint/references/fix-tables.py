#!/usr/bin/env python3
"""Normalize markdown table separators to | --- | style.

Converts old-style separators like |------|------| to GFM-compliant | --- | --- |.
markdownlint has no built-in rule for table separator style, so this handles it.

Usage:
    python3 fix-tables.py <file.md>
    python3 fix-tables.py <file.md> <file2.md> ...
    python3 fix-tables.py --all <directory>
"""

import sys
import os
import glob
import re
from pathlib import Path


def count_cols(header_line):
    """Count table columns from a header or data row."""
    cells = [c.strip() for c in header_line.split("|")]
    return len([c for c in cells if c])


def _normalize_cell(cell):
    """Normalize a single separator cell, preserving alignment.

    Detects left (:---), right (---:), center (:---:), or default (---)
    alignment from the original cell and normalizes it to a min-width
    with consistent padding.

    e.g.  |--|  → | --- |     (default, min-width)
          |:--| → | :-- |    (left, preserves alignment)
          |--:| → | --: |    (right, preserves alignment)
          |:-:| → | :-: |    (center, preserves alignment)
    """
    raw = cell.strip()
    # Detect alignment from the original cell
    left_colon  = raw.startswith(":")
    right_colon = raw.endswith(":")
    # Strip colons and count dashes; use max(dash_count, 3)
    inner = raw.strip(":")
    dash_count = len(inner)
    min_width = max(dash_count, 3)
    # Build normalized inner (at least 3 dashes)
    norm_inner = "-" * min_width
    # Apply alignment markers back
    if left_colon and right_colon:
        return ":" + norm_inner + ":"
    elif left_colon:
        return ":" + norm_inner
    elif right_colon:
        return norm_inner + ":"
    else:
        return norm_inner


def fix_file(path):
    """Normalize all table separators in a file to | --- | style."""
    with open(path) as f:
        lines = f.readlines()

    new_lines = []
    changed = 0

    for i, line in enumerate(lines):
        stripped = line.rstrip()
        # Detect table separator: |----|----|----|
        if stripped.startswith("|") and stripped.endswith("|"):
            raw_cells = [c for c in stripped.split("|") if c != ""]
            cells = [c.strip() for c in raw_cells]
            if cells and all(set(c).issubset({"", "-", ":", "."}) for c in cells):
                if any(c for c in cells):
                    # Normalize each cell, preserving alignment
                    norm_cells = [_normalize_cell(c) for c in cells]
                    new_sep = "| " + " | ".join(norm_cells) + " |"
                    new_lines.append(new_sep + "\n")
                    changed += 1
                    continue

        new_lines.append(line)

    if changed:
        with open(path, "w") as f:
            f.writelines(new_lines)
        print(f"  Fixed {changed} table separator(s) in {path}")

    return changed


def main():
    if "--all" in sys.argv:
        sys.argv.remove("--all")
        if len(sys.argv) < 2:
            print(
                "Usage: fix-tables.py --all <directory>", file=sys.stderr
            )
            sys.exit(1)
        directory = sys.argv[1]
        files = glob.glob(os.path.join(directory, "**/*.md"), recursive=True)
    else:
        if len(sys.argv) < 2:
            print(
                f"Usage: {sys.argv[0]} <file.md> [<file2.md> ...]",
                file=sys.stderr,
            )
            print(
                f"       {sys.argv[0]} --all <directory>", file=sys.stderr
            )
            sys.exit(1)
        files = sys.argv[1:]

    total = 0
    for f in files:
        if os.path.isfile(f):
            total += fix_file(f)
        elif os.path.isdir(f):
            print(f"Skipping directory: {f}  (use --all)", file=sys.stderr)

    if total == 0:
        print("No table separators to fix.")
    else:
        print(
            f"Total: {total} separator(s) fixed in "
            f"{len([f for f in files if os.path.isfile(f)])} file(s)."
        )


if __name__ == "__main__":
    main()
