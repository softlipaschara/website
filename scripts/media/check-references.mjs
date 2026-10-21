import fs from 'node:fs';
import path from 'node:path';
import { MANIFEST_PATH, ROOT, extractReferences, imageWidths } from './lib.mjs';

const mediaBase = (process.env.PUBLIC_MEDIA_BASE ?? 'https://media.xinyue.de').replace(/\/+$/, '');
const localMedia = path.join(ROOT, 'public/media');

if (mediaBase !== '/media' && fs.existsSync(localMedia)) {
  console.log('public/media exists and PUBLIC_MEDIA_BASE is not /media.');
  console.log('Remove public/media before a production build, or build with PUBLIC_MEDIA_BASE=/media.');
  process.exitCode = 1;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const entries = new Set(manifest.entries.map((entry) => entry.key));
const sources = new Map(manifest.sources.map((source) => [source.key, source]));
const failures = [];

for (const reference of extractReferences()) {
  const source = sources.get(reference.key);
  if (source?.status === 'allowed-missing') {
    continue;
  }
  if (!source) {
    failures.push(`No manifest source for ${reference.key}`);
    continue;
  }
  if (source.status !== 'ready') {
    failures.push(`Source is ${source.status}: ${reference.key}`);
    continue;
  }

  if (reference.kind === 'video-base') {
    for (const suffix of ['-720.mp4', '-480.mp4']) {
      const key = `${reference.key}${suffix}`;
      if (!entries.has(key)) {
        failures.push(`Missing video variant: ${key}`);
      }
    }
    if (!reference.hasExplicitPoster && !entries.has(`${reference.key}-poster.jpg`)) {
      failures.push(`Missing video poster: ${reference.key}-poster.jpg`);
    }
  } else if (reference.kind === 'image-base') {
    for (const width of imageWidths(source.width, source.height)) {
      for (const extension of ['jpg', 'webp']) {
        const key = `${reference.key}-${width}.${extension}`;
        if (!entries.has(key)) {
          failures.push(`Missing image variant: ${key}`);
        }
      }
    }
  } else if (reference.kind === 'image-original') {
    if (!entries.has(reference.key)) {
      failures.push(`Missing image: ${reference.key}`);
    }
  }
}

console.log(`Checked ${manifest.sources.length} manifest sources and ${manifest.entries.length} files.`);
if (failures.length > 0) {
  console.log(`Failures: ${failures.length}`);
  for (const failure of failures) {
    console.log(failure);
  }
  process.exitCode = 1;
} else {
  console.log('Every referenced media key is present in the manifest.');
}
