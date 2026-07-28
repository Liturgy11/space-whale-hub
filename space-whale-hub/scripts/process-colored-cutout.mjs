#!/usr/bin/env node
/**
 * Convert a white paper-cutout on black to a tinted transparent PNG.
 *
 * Usage:
 *   node scripts/process-colored-cutout.mjs <input.png> <output.png> [r g b]
 *
 * Example (Inner Space magenta eye):
 *   node scripts/process-colored-cutout.mjs assets/eye.png public/illustrations/inner-space-eye.png 217 70 180
 */

import path from 'node:path';
import sharp from 'sharp';

const [, , inputArg, outputArg, rArg, gArg, bArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error('Usage: node scripts/process-colored-cutout.mjs <input> <output> [r g b]');
  process.exit(1);
}

const input = path.resolve(inputArg);
const output = path.resolve(outputArg);
const tint = [Number(rArg ?? 217), Number(gArg ?? 70), Number(bArg ?? 180)];
const THRESHOLD = 35;
const FEATHER = 50;

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const peak = Math.max(data[i], data[i + 1], data[i + 2]);
  if (peak <= THRESHOLD) {
    data[i + 3] = 0;
    continue;
  }

  const t = peak <= THRESHOLD + FEATHER ? peak / 255 : 0.78 + 0.22 * (peak / 255);
  data[i] = Math.min(255, Math.round(tint[0] * t));
  data[i + 1] = Math.min(255, Math.round(tint[1] * t));
  data[i + 2] = Math.min(255, Math.round(tint[2] * t));
  data[i + 3] =
    peak <= THRESHOLD + FEATHER
      ? Math.max(0, Math.min(255, Math.round(255 * (peak - THRESHOLD) / FEATHER)))
      : 255;
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim()
  .png()
  .toFile(output);

console.log(`Wrote ${output}`);
