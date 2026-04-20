#!/usr/bin/env python3
"""Normalize markdown table separators to | :--- | :--- | :--- | style.

Converts old-style separators like |------|------| to GFM-compliant center-aligned
| :--- | :--- | :--- |. markdownlint has no built-in rule for table separator
style, so this handles it.

Usage:
    python3 fix-tables.py <file.md>
    python3 fix-tables.py <file.md> <file2.md> ...
    python3 fix-tables.py --all <directory>
"""

import sys
import os
import glob


def _normalize_cell(cell):
    """Normalize a single separator cell to center-aligned GFM style.

    All separators become :--- (center-aligned, min 3 dashes).
    e.g.  ":"   → ":---:"
          ":--"  → ":---:"
          "--:"  → ":---:"
          ":-:"  → ":---:"
          "--"   → ":---:"
    """
    inner = cell.strip()
    # Count dashes in the middle, ignoring any existing colons
    dashes = inner.lstrip(":").rstrip(":")
    min_width = max(len(dashes), 3)
    return ":" + ("-" * min_width) + ":"


def fix_file(path):
    """Normalize all table separators in a file to | :--- | :--- | :--- | style."""
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
                    # Normalize each cell to center-aligned :---: style
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
