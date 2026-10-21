import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  MANIFEST_PATH,
  MEDIA_OUT,
  ROOT,
  buildPlan,
  probeImage,
  probeVideo,
  sha256,
} from './lib.mjs';

const only = process.argv.find((argument) => argument.startsWith('--only='))?.slice('--only='.length);

function ensureDirectory(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function temporaryPath(file) {
  const extension = path.extname(file);
  return `${file}.tmp-${process.pid}${extension}`;
}

function run(command, args) {
  try {
    execFileSync(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const stderr = error.stderr?.toString() ?? '';
    throw new Error(`${command} failed for ${args.at(-1)}\n${stderr || error.message}`);
  }
}

function copyFileAtomic(source, destination) {
  ensureDirectory(destination);
  const temporary = temporaryPath(destination);
  fs.copyFileSync(source, temporary);
  fs.renameSync(temporary, destination);
}

function copyImageOriginal(source, outputKey) {
  const destination = path.join(MEDIA_OUT, outputKey);
  ensureDirectory(destination);
  const sourceExtension = path.extname(source).toLowerCase();
  const outputExtension = path.extname(outputKey).toLowerCase();
  const dimensions = probeImage(source);
  const longEdge = Math.max(dimensions.width, dimensions.height);

  if (['.jpg', '.jpeg'].includes(outputExtension)) {
    if (sourceExtension === '.png' || longEdge > 2000) {
      const temporary = temporaryPath(destination);
      run('sips', [
        '-Z',
        String(Math.min(2000, longEdge)),
        '-s',
        'format',
        'jpeg',
        '-s',
        'formatOptions',
        '85',
        source,
        '--out',
        temporary,
      ]);
      fs.renameSync(temporary, destination);
      return;
    }
    copyFileAtomic(source, destination);
    return;
  }

  copyFileAtomic(source, destination);
}

function resizeImage(source, output) {
  const destination = path.join(MEDIA_OUT, output.key);
  ensureDirectory(destination);
  const temporary = temporaryPath(destination);

  if (output.format === 'jpg') {
    run('sips', [
      '-Z',
      String(Math.max(output.width, output.height)),
      '-s',
      'format',
      'jpeg',
      '-s',
      'formatOptions',
      '85',
      source,
      '--out',
      temporary,
    ]);
  } else {
    run('cwebp', [
      '-q',
      '82',
      '-resize',
      String(output.width),
      String(output.height),
      source,
      '-o',
      temporary,
    ]);
  }

  if (!fs.existsSync(temporary)) {
    throw new Error(`Image output was not written: ${output.key}`);
  }
  fs.renameSync(temporary, destination);
}

function transcodeVideo(entry, output) {
  const destination = path.join(MEDIA_OUT, output.key);
  ensureDirectory(destination);
  const temporary = temporaryPath(destination);
  const targetHeight = Math.floor(Math.min(output.rendition, entry.height) / 2) * 2;

  if (targetHeight < 2) {
    throw new Error(`Video is too small to transcode: ${entry.key}`);
  }

  run('ffmpeg', [
    '-y',
    '-i',
    entry.source,
    '-vf',
    `scale=-2:${targetHeight}`,
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-crf',
    '23',
    '-preset',
    'slow',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-ar',
    '48000',
    temporary,
  ]);

  if (!fs.existsSync(temporary)) {
    throw new Error(`Video output was not written: ${output.key}`);
  }
  fs.renameSync(temporary, destination);
}

function extractPoster(source, outputKey, duration) {
  const destination = path.join(MEDIA_OUT, outputKey);
  ensureDirectory(destination);
  const positions = duration > 0 ? [Math.min(1, duration / 2), 0] : [0];

  for (const position of positions) {
    const temporary = temporaryPath(destination);
    try {
      run('ffmpeg', [
        '-y',
        '-ss',
        String(position),
        '-i',
        source,
        '-frames:v',
        '1',
        '-q:v',
        '2',
        temporary,
      ]);
      if (fs.existsSync(temporary) && fs.statSync(temporary).size > 0) {
        fs.renameSync(temporary, destination);
        return;
      }
    } catch {
      // Try the next position.
    }
    if (fs.existsSync(temporary)) {
      fs.unlinkSync(temporary);
    }
  }

  throw new Error(`Could not extract a poster for ${outputKey}`);
}

function processEntry(entry) {
  if (entry.status === 'allowed-missing') {
    return;
  }
  if (entry.status !== 'ready' || !entry.source) {
    throw new Error(`Unresolved media entry: ${entry.key}`);
  }
  if (!fs.existsSync(entry.source)) {
    throw new Error(`Missing source for ${entry.key}: ${entry.source}`);
  }

  for (const output of entry.outputs ?? []) {
    if (output.type === 'video') {
      transcodeVideo(entry, output);
    } else if (output.type === 'poster') {
      if (output.source) {
        copyImageOriginal(output.source, output.key);
      } else {
        extractPoster(entry.source, output.key, entry.duration);
      }
    } else if (output.type === 'image') {
      resizeImage(entry.source, output);
    } else if (output.type === 'original') {
      copyImageOriginal(entry.source, output.key);
    } else {
      throw new Error(`Unknown output type: ${output.type}`);
    }
  }

  console.log(`[ready] ${entry.key}`);
}

const result = buildPlan();
if (result.missing.length > 0) {
  throw new Error(`Unexpected missing media:\n${result.missing.join('\n')}`);
}

fs.mkdirSync(MEDIA_OUT, { recursive: true });

const selected = only
  ? result.plan.filter((entry) => entry.key.includes(only))
  : result.plan;

console.log(
  `Processing ${selected.length} of ${result.plan.length} entries into ${path.relative(ROOT, MEDIA_OUT)}`,
);

for (const entry of selected) {
  processEntry(entry);
}

const manifestEntries = [];
let totalBytes = 0;

for (const entry of selected) {
  for (const output of entry.outputs ?? []) {
    const file = path.join(MEDIA_OUT, output.key);
    if (!fs.existsSync(file)) {
      throw new Error(`Missing output after build: ${output.key}`);
    }
    const stats = fs.statSync(file);
    totalBytes += stats.size;
    const record = {
      key: output.key,
      variantOf: entry.key,
      type: output.type,
      format: path.extname(output.key).slice(1),
      bytes: stats.size,
      sha256: sha256(file),
    };

    if (output.rendition) {
      record.rendition = output.rendition;
    }
    if (output.type === 'video') {
      const probe = probeVideo(file);
      record.width = probe.width;
      record.height = probe.height;
      record.duration = probe.duration;
    } else {
      const probe = probeImage(file);
      record.width = probe.width;
      record.height = probe.height;
    }

    manifestEntries.push(record);
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  mediaBase: 'https://media.xinyue.de',
  entryCount: manifestEntries.length,
  totalBytes,
  sources: result.plan.map((entry) => ({
    key: entry.key,
    kind: entry.kind,
    page: entry.page,
    status: entry.status,
    source: entry.source ? path.relative(ROOT, entry.source) : undefined,
    width: entry.width,
    height: entry.height,
    duration: entry.duration,
    note: entry.note,
  })),
  missing: result.plan
    .filter((entry) => entry.status === 'allowed-missing' || entry.status === 'missing')
    .map((entry) => ({ key: entry.key, status: entry.status, note: entry.note })),
  entries: manifestEntries,
};

fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(
  `Wrote ${manifest.entryCount} manifest entries (${(totalBytes / 1024 / 1024).toFixed(1)} MiB) to ${path.relative(ROOT, MANIFEST_PATH)}`,
);
