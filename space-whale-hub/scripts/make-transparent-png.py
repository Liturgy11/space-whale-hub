#!/usr/bin/env python3
"""Remove near-black backgrounds and save trimmed RGBA PNGs.

Usage:
  python3 scripts/make-transparent-png.py input.png output.png
  python3 scripts/batch-transparent-illustrations.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from make_transparent_png import remove_black_bg


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__)
        raise SystemExit(2)
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    remove_black_bg(src, dst)
    print(f'Wrote {dst}')


if __name__ == '__main__':
    main()
