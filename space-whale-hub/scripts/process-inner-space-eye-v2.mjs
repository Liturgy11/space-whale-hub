#!/usr/bin/env node
/**
 * Flat magenta eye graphic → brand magenta + gold outline strokes + gold pupil.
 *
 * Usage:
 *   node scripts/process-inner-space-eye-v2.mjs <input.png> <output.png>
 */

import path from 'node:path';
import sharp from 'sharp';

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error('Usage: node scripts/process-inner-space-eye-v2.mjs <input> <output>');
  process.exit(1);
}

const input = path.resolve(inputArg);
const output = path.resolve(outputArg);

const MAGENTA = [217, 70, 180];
const GOLD = [240, 208, 96];
const OUTLINE_PX = 1;

function pixelKind(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;

  if (max < 45) return 'bg';
  // Magenta / pink fill — keep inclusive so shaded pixels stay fill
  if (r > 70 && b > 35 && r >= g - 5) return 'magenta';
  // Dark neutral strokes + pupil source
  if (sat < 50 && max < 150) return 'dark';
  return 'magenta';
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
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
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

function drawPupil(alpha, width, height) {
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (alpha[idx] < 128) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const radius = Math.max(2, Math.round(Math.min(maxX - minX, maxY - minY) * 0.055));
  const pupil = new Uint8Array(alpha.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        pupil[y * width + x] = 1;
      }
    }
  }

  return pupil;
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

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const alpha = new Uint8Array(width * height);
const rgb = new Uint8Array(width * height * 3);
const dark = new Uint8Array(width * height);

for (let i = 0, p = 0; i < data.length; i += 4, p++) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const kind = pixelKind(r, g, b);

  if (kind === 'bg') continue;

  alpha[p] = 255;
  if (kind === 'dark') {
    dark[p] = 1;
    continue;
  }

  const peak = Math.max(r, g, b);
  const t = 0.82 + 0.18 * (peak / 255);
  rgb[p * 3] = Math.min(255, Math.round(MAGENTA[0] * t));
  rgb[p * 3 + 1] = Math.min(255, Math.round(MAGENTA[1] * t));
  rgb[p * 3 + 2] = Math.min(255, Math.round(MAGENTA[2] * t));
}

const cleanedAlpha = keepLargestBlob(alpha, width, height);
for (let p = 0; p < cleanedAlpha.length; p++) {
  if (!cleanedAlpha[p]) dark[p] = 0;
}

const pupil = drawPupil(cleanedAlpha, width, height);

for (let p = 0; p < width * height; p++) {
  if (!cleanedAlpha[p]) continue;
  if (pupil[p]) {
    rgb[p * 3] = GOLD[0];
    rgb[p * 3 + 1] = GOLD[1];
    rgb[p * 3 + 2] = GOLD[2];
  } else if (dark[p]) {
    rgb[p * 3] = GOLD[0];
    rgb[p * 3 + 1] = GOLD[1];
    rgb[p * 3 + 2] = GOLD[2];
  }
}

const outlineAlpha = dilate(cleanedAlpha, width, height, OUTLINE_PX);
const out = Buffer.alloc(width * height * 4);

for (let p = 0; p < width * height; p++) {
  const i = p * 4;
  const fillA = cleanedAlpha[p];
  const outlineOnly = outlineAlpha[p] > 0 && fillA < 80;

  if (outlineOnly) {
    out[i] = GOLD[0];
    out[i + 1] = GOLD[1];
    out[i + 2] = GOLD[2];
    out[i + 3] = 255;
  } else if (fillA > 0) {
    out[i] = rgb[p * 3];
    out[i + 1] = rgb[p * 3 + 1];
    out[i + 2] = rgb[p * 3 + 2];
    out[i + 3] = 255;
  } else {
    out[i + 3] = 0;
  }
}

await sharp(out, {
  raw: { width, height, channels: 4 },
})
  .trim()
  .png()
  .toFile(output);

console.log(`Wrote ${output}`);
