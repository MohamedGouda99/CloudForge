#!/usr/bin/env python3
"""
Replace literal icon strings in resource definition files with getCloudIconPath calls.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ICON_PATTERN = re.compile(r"(icon:\s*)['\"]([^'\"]*)['\"]")
TYPE_PATTERN = re.compile(r"type:\s*['\"]([^'\"]+)['\"]")


def normalize_file(path: Path) -> None:
    content = path.read_text(encoding="utf-8")
    lines = content.splitlines()
    updated_lines = []
    current_type = None

    for line in lines:
        type_match = TYPE_PATTERN.search(line)
        if type_match:
            current_type = type_match.group(1)

        icon_match = ICON_PATTERN.search(line)
        if icon_match and current_type and "getCloudIconPath" not in line:
            prefix = icon_match.group(1)
            replacement = f"{prefix}getCloudIconPath('{current_type}')"
            line = ICON_PATTERN.sub(replacement, line, count=1)
            current_type = None

        updated_lines.append(line)

    path.write_text("\n".join(updated_lines) + "\n", encoding="utf-8")
    print(f"Normalised icons in {path}")


def main(args: list[str]) -> None:
    if len(args) < 2:
        print("Usage: normalize_resource_icons.py <file1> [file2 ...]")
        sys.exit(1)

    for file_name in args[1:]:
        normalize_file(Path(file_name))


if __name__ == "__main__":
    main(sys.argv)
