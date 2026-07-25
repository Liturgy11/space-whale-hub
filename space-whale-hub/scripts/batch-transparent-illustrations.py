#!/usr/bin/env python3
"""Batch convert Space Whale collage assets to trimmed transparent PNGs."""

from __future__ import annotations

import json
from pathlib import Path

from make_transparent_png import remove_black_bg

ASSETS = Path('/Users/lizmccarthy/.cursor/projects/Users-lizmccarthy-space-whale-hub/assets')
OUT = Path(__file__).resolve().parents[1] / 'public' / 'illustrations'

# source filename -> public illustration name + description
ILLUSTRATIONS: list[tuple[str, str, str]] = [
    ('3-a77c5113-0d5a-486c-ab7f-9652239782d8.png', 'star-baby.png', 'Star Baby — teal guide character'),
    ('4-7fe7f64f-f6d2-4a6f-9709-6837b3f776f2.png', 'star.png', 'Hand-drawn yellow star'),
    ('2-48854546-8234-4590-8707-363fbc7a3b6f.png', 'whale.png', 'Space Whale brand whale'),
    ('6-7ee3d4f7-c8f7-4204-ad10-9a111f138fdf.png', 'mushroom-painted.png', 'Painted cap mushroom'),
    ('mushroom_1-4df45290-3850-4587-9a62-996fe66864cc.png', 'mushroom-1.png', 'Collage mushroom T-shape'),
    ('mushroom_2-c206fc27-a4a4-4b5e-9e30-a5f40604ff51.png', 'pickaxe.png', 'Pink pickaxe'),
    ('mushroom_3-f21647ff-408f-4697-be6f-f4649cc4dfc4.png', 'mushroom-3.png', 'Teal collage mushroom'),
    ('mushroom_4-6f64fdbd-16cf-4472-887d-05c4506b02df.png', 'mushroom-4.png', 'Maroon cap mushroom'),
    ('7-96cd0c90-ac21-4b62-809b-24dbb2942616.png', 'pink-stack.png', 'Pink layered stack'),
]


def main() -> None:
    manifest = []
    for src_name, out_name, label in ILLUSTRATIONS:
        src = ASSETS / src_name
        dst = OUT / out_name
        if not src.exists():
            raise FileNotFoundError(src)
        remove_black_bg(src, dst)
        from PIL import Image

        with Image.open(dst) as img:
            w, h = img.size
        manifest.append({
            'file': f'/illustrations/{out_name}',
            'name': out_name.replace('.png', ''),
            'label': label,
            'width': w,
            'height': h,
        })

    (OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Wrote {len(manifest)} illustrations + manifest.json')


if __name__ == '__main__':
    main()
