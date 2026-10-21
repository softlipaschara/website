import fs from 'node:fs';
import { MANIFEST_PATH } from './lib.mjs';

const mediaBase = (process.env.PUBLIC_MEDIA_BASE ?? 'https://media.xinyue.de').replace(/\/+$/, '');
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const keys = manifest.entries.map((entry) => entry.key);
const failures = [];
const concurrency = 8;
let cursor = 0;

async function worker() {
  while (cursor < keys.length) {
    const key = keys[cursor];
    cursor += 1;
    const url = `${mediaBase}/${key}`;
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        failures.push(`${response.status} ${url}`);
      }
    } catch (error) {
      failures.push(`${error.message} ${url}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

console.log(`Checked ${keys.length} media keys against ${mediaBase}`);
if (failures.length > 0) {
  console.log(`Failures: ${failures.length}`);
  for (const failure of failures) {
    console.log(failure);
  }
  process.exitCode = 1;
} else {
  console.log('All media keys returned HTTP 200.');
}
