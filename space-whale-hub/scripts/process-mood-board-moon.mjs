#!/usr/bin/env node
/**
 * Photo of paper moon cutout → blue fill + gold outline transparent PNG.
 *
 * Usage:
 *   node scripts/process-mood-board-moon.mjs <input.jpg> <output.png>
 */

import path from 'node:path';
import sharp from 'sharp';

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error('Usage: node scripts/process-mood-board-moon.mjs <input> <output>');
  process.exit(1);
}

const input = path.resolve(inputArg);
const output = path.resolve(outputArg);

const MOON = [64, 160, 192]; // accent-teal
const OUTLINE = [240, 208, 96];
const OUTLINE_PX = 2;

function isForeground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;

  // rust / terracotta paper cutout
  if (r > 85 && r > g + 10 && sat > 25) return true;
  return false;
}

function keepLargestBlob(alpha, width, height) {
  const visited = new Uint8Array(alpha.length);
  let best = [];

  for (let start = 0; start < alpha.length; start++) {
    if (visited[start] || alpha[start] < 128) continue;
    const stack = [start];
    const blob = [];
    visited[start] = 1;

    while (stack.length) {
      const idx = stack.pop();
      blob.push(idx);
      const x = idx % width;
      const y = (idx / width) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const nidx = ny * width + nx;
        if (visited[nidx] || alpha[nidx] < 128) continue;
        visited[nidx] = 1;
        stack.push(nidx);
      }
    }

    if (blob.length > best.length) best = blob;
  }

  const cleaned = new Uint8Array(alpha.length);
  for (const idx of best) cleaned[idx] = 255;
  return cleaned;
}

function buildFill(inputPath) {
  return sharp(inputPath)
    .metadata()
    .then((meta) =>
      sharp(inputPath)
        .extract({
          left: Math.floor(meta.width * 0.1),
          top: Math.floor(meta.height * 0.14),
          width: Math.floor(meta.width * 0.8),
          height: Math.floor(meta.height * 0.62),
        })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true }),
    )
    .then(({ data, info }) => {
      const { width, height } = info;
      const alpha = new Uint8Array(width * height);
      const rgb = new Uint8Array(width * height * 3);

      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (!isForeground(r, g, b)) {
          alpha[p] = 0;
          continue;
        }

        const peak = Math.max(r, g, b);
        const t = 0.72 + 0.28 * (peak / 255);
        rgb[p * 3] = Math.min(255, Math.round(MOON[0] * t));
        rgb[p * 3 + 1] = Math.min(255, Math.round(MOON[1] * t));
        rgb[p * 3 + 2] = Math.min(255, Math.round(MOON[2] * t));
        alpha[p] = 255;
      }

      return { width, height, alpha: keepLargestBlob(alpha, width, height), rgb };
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
const outlineAlpha = dilate(fill.alpha, fill.width, fill.height, OUTLINE_PX);
const pixels = compose(fill, outlineAlpha);

await sharp(pixels, {
  raw: { width: fill.width, height: fill.height, channels: 4 },
})
  .trim()
  .png()
  .toFile(output);

console.log(`Wrote ${output}`);
