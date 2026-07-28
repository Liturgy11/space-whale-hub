#!/usr/bin/env node
/**
 * Paper-cutout eye → tinted transparent PNG with optional outline + pupil.
 *
 * Usage:
 *   node scripts/process-inner-space-eye.mjs <input.png> <output.png> [--outline black|gold] [--no-pupil]
 */

import path from 'node:path';
import sharp from 'sharp';

const [, , inputArg, outputArg, ...flags] = process.argv;

if (!inputArg || !outputArg) {
  console.error(
    'Usage: node scripts/process-inner-space-eye.mjs <input> <output> [--outline black|gold] [--no-pupil]',
  );
  process.exit(1);
}

const input = path.resolve(inputArg);
const output = path.resolve(outputArg);
const outlineMode = flags.includes('--outline')
  ? flags[flags.indexOf('--outline') + 1] ?? 'black'
  : 'black';
const withPupil = !flags.includes('--no-pupil');

const MAGENTA = [217, 70, 180];
const OUTLINE =
  outlineMode === 'gold'
    ? [240, 208, 96] // accent-yellow — matches Star Baby border
    : [6, 10, 73]; // space-whale-navy — crisp but on-brand
const PUPIL = [90, 24, 100]; // deep plum, softer than black
const THRESHOLD = 35;
const FEATHER = 50;
const OUTLINE_PX = 2;

function buildFill(inputPath) {
  return sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
      const { width, height } = info;
      const alpha = new Uint8Array(width * height);
      const rgb = new Uint8Array(width * height * 3);

      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const peak = Math.max(data[i], data[i + 1], data[i + 2]);
        let a = 0;
        if (peak > THRESHOLD) {
          const t =
            peak <= THRESHOLD + FEATHER ? peak / 255 : 0.78 + 0.22 * (peak / 255);
          rgb[p * 3] = Math.min(255, Math.round(MAGENTA[0] * t));
          rgb[p * 3 + 1] = Math.min(255, Math.round(MAGENTA[1] * t));
          rgb[p * 3 + 2] = Math.min(255, Math.round(MAGENTA[2] * t));
          a =
            peak <= THRESHOLD + FEATHER
              ? Math.max(0, Math.min(255, Math.round(255 * (peak - THRESHOLD) / FEATHER)))
              : 255;
        }
        alpha[p] = a;
      }

      return { width, height, alpha, rgb };
    });
}

function dilate(alpha, width, height, radius) {
  const out = new Uint8Array(alpha.length);
  const r2 = radius * radius;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (alpha[idx] > 20) {
        out[idx] = alpha[idx];
        continue;
      }
      let hit = false;
      for (let dy = -radius; dy <= radius && !hit; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (alpha[ny * width + nx] > 140) {
            hit = true;
            break;
          }
        }
      }
      out[idx] = hit ? 255 : 0;
    }
  }
  return out;
}

function addPupil(alpha, rgb, width, height) {
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (alpha[idx] > 180) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }
  if (!count) return;

  const cx = sumX / count;
  const cy = sumY / count + height * 0.06;
  const rx = Math.max(2, Math.round(width * 0.055));
  const ry = Math.max(2, Math.round(height * 0.12));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (alpha[idx] < 120) continue;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        rgb[idx * 3] = PUPIL[0];
        rgb[idx * 3 + 1] = PUPIL[1];
        rgb[idx * 3 + 2] = PUPIL[2];
      }
    }
  }
}

function compose({ width, height, alpha, rgb }, outlineAlpha) {
  const out = Buffer.alloc(width * height * 4);

  for (let p = 0; p < width * height; p++) {
    const i = p * 4;
    const fillA = alpha[p];
    const outlineOnly = outlineAlpha[p] > 0 && fillA < 80;

    if (outlineOnly) {
      out[i] = OUTLINE[0];
      out[i + 1] = OUTLINE[1];
      out[i + 2] = OUTLINE[2];
      out[i + 3] = Math.min(255, outlineAlpha[p]);
    } else if (fillA > 0) {
      out[i] = rgb[p * 3];
      out[i + 1] = rgb[p * 3 + 1];
      out[i + 2] = rgb[p * 3 + 2];
      out[i + 3] = fillA;
    } else {
      out[i + 3] = 0;
    }
  }

  return out;
}

const fill = await buildFill(input);
if (withPupil) addPupil(fill.alpha, fill.rgb, fill.width, fill.height);

const outlineAlpha = dilate(fill.alpha, fill.width, fill.height, OUTLINE_PX);
const pixels = compose(fill, outlineAlpha);

await sharp(pixels, {
  raw: { width: fill.width, height: fill.height, channels: 4 },
})
  .trim()
  .png()
  .toFile(output);

console.log(`Wrote ${output} (outline: ${outlineMode}, pupil: ${withPupil})`);
