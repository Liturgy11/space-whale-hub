#!/usr/bin/env python3
"""Remove near-black backgrounds and save trimmed RGBA PNGs.

Usage:
  python3 scripts/make-transparent-png.py input.jpg output.png
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print('Install Pillow first: pip3 install pillow', file=sys.stderr)
    raise SystemExit(1)


def remove_black_bg(src: Path, dst: Path, threshold: int = 30) -> None:
    img = Image.open(src).convert('RGBA')
    pixels = list(img.getdata())
    out = []
    for r, g, b, _a in pixels:
        peak = max(r, g, b)
        if peak <= threshold:
            out.append((r, g, b, 0))
        elif peak <= threshold + 45:
            alpha = int(255 * (peak - threshold) / 45)
            out.append((r, g, b, max(0, min(255, alpha))))
        else:
            out.append((r, g, b, 255))
    img.putdata(out)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, 'PNG')
    print(f'Wrote {dst} ({img.size[0]}x{img.size[1]}, RGBA)')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__)
        raise SystemExit(2)
    remove_black_bg(Path(sys.argv[1]), Path(sys.argv[2]))
