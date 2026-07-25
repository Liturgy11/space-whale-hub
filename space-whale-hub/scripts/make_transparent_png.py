"""Shared helper to knock out near-black backgrounds."""

from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit('Install Pillow first: pip3 install pillow') from exc


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
