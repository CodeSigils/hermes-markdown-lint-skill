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


def fix_file(path):
    """Normalize all table separators in a file to | --- | style."""
    with open(path) as f:
        lines = f.readlines()

    new_lines = []
    changed = 0

    for i, line in enumerate(lines):
        stripped = line.rstrip()
        # Detect old-style separator: |----|----|----|
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = [c.strip() for c in stripped.split("|") if c != ""]
            if cells and all(set(c).issubset({"", "-", ":", "."}) for c in cells):
                if cells.count("") > 1 or (
                    cells and all(c in ("", "-", ":", ".") for c in cells)
                ):
                    # This is a separator row
                    # Count cols from header (look at previous non-separator row)
                    num_cols = None
                    for j in range(i - 1, -1, -1):
                        prev = lines[j].rstrip()
                        if prev.startswith("|") and not (
                            all(
                                set(c.strip()).issubset({"", "-", ":", "."})
                                for c in prev.split("|") if c.strip() != ""
                            )
                            and len(
                                [c for c in prev.split("|") if c.strip()]
                            )
                            == len(cells)
                        ):
                            prev_cells = [
                                c.strip() for c in prev.split("|") if c.strip()
                            ]
                            if prev_cells:
                                num_cols = len(prev_cells)
                                break

                    if num_cols is None:
                        num_cols = len([c for c in cells if c])

                    new_sep = "| " + " | ".join(["---"] * num_cols) + " |"
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
