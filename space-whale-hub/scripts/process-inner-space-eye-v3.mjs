#!/usr/bin/env node
/**
 * Sticker-style Inner Space eye → mood-board moon teal lids, navy + gold preserved.
 *
 * Usage:
 *   node scripts/process-inner-space-eye-v3.mjs <input.png> <output.png>
 */

import path from 'node:path';
import sharp from 'sharp';

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
  console.error('Usage: node scripts/process-inner-space-eye-v3.mjs <input> <output>');
  process.exit(1);
}

const input = path.resolve(inputArg);
const output = path.resolve(outputArg);

const LID_TEAL = [64, 160, 192]; // mood-board-moon accent-teal
const NAVY = [6, 10, 73]; // space-whale-navy
const GOLD = [240, 208, 96];

function pixelKind(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;

  if (max < 28) return 'bg';

  if (r > 175 && g > 125 && b < 165 && r > b + 40) return 'gold';

  if (r > 150 && b > 80 && r > g + 10) return 'pink';

  if (b > r + 8 && b > 45 && max < 135) return 'navy';
  if (r < 45 && b > 55 && max < 135) return 'navy';

  // Drop shadow / anti-alias fringe
  if (max < 95 && sat < 55) return 'fringe';

  return 'fringe';
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

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const alpha = new Uint8Array(width * height);
const rgb = new Uint8Array(width * height * 3);

for (let i = 0, p = 0; i < data.length; i += 4, p++) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  let kind = pixelKind(r, g, b);

  if (kind === 'bg' || kind === 'fringe') continue;

  alpha[p] = 255;

  if (kind === 'gold') {
    rgb[p * 3] = GOLD[0];
    rgb[p * 3 + 1] = GOLD[1];
    rgb[p * 3 + 2] = GOLD[2];
  } else if (kind === 'navy') {
    rgb[p * 3] = NAVY[0];
    rgb[p * 3 + 1] = NAVY[1];
    rgb[p * 3 + 2] = NAVY[2];
  } else {
    rgb[p * 3] = LID_TEAL[0];
    rgb[p * 3 + 1] = LID_TEAL[1];
    rgb[p * 3 + 2] = LID_TEAL[2];
  }
}

const cleanedAlpha = keepLargestBlob(alpha, width, height);

// Preserve gold sparkle pixels from source inside the eye shape
for (let i = 0, p = 0; i < data.length; i += 4, p++) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r > 175 && g > 125 && b < 165 && r > b + 40 && cleanedAlpha[p]) {
    rgb[p * 3] = GOLD[0];
    rgb[p * 3 + 1] = GOLD[1];
    rgb[p * 3 + 2] = GOLD[2];
  }
}

const out = Buffer.alloc(width * height * 4);

for (let p = 0; p < width * height; p++) {
  const i = p * 4;
  if (!cleanedAlpha[p]) continue;
  out[i] = rgb[p * 3];
  out[i + 1] = rgb[p * 3 + 1];
  out[i + 2] = rgb[p * 3 + 2];
  out[i + 3] = 255;
}

await sharp(out, {
  raw: { width, height, channels: 4 },
})
  .trim()
  .png()
  .toFile(output);

console.log(`Wrote ${output}`);
