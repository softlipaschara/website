import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '../..');
export const MEDIA_SRC = process.env.MEDIA_SRC ?? path.resolve(ROOT, '../media-src');
export const MEDIA_RECOVERED =
  process.env.MEDIA_RECOVERED ?? path.resolve(ROOT, '../media-recovered');
export const MEDIA_OUT = process.env.MEDIA_OUT ?? path.join(ROOT, 'media-out');
export const INVENTORY_PATH = path.join(ROOT, 'docs/media-r2-migration/media-inventory.json');
export const PLAN_PATH = path.join(ROOT, 'docs/media-r2-migration/media-plan.json');
export const MANIFEST_PATH = path.join(ROOT, 'docs/media-r2-migration/media-manifest.json');

export const VIMEO_KEYS = {
  174794803: 'projects/jie/demo/demo',
  189073056: 'projects/responsive-lighting/prototype/prototype',
  190151883: 'projects/breathing-surface/prototype/prototype',
  195434826: 'projects/breeze/prototype/prototype',
  202025192: 'projects/ink-animation/demo/demo',
  204383527: 'projects/sensing-armband/prototype/prototype',
  217140436: 'projects/scale/prototype/prototype',
  222038876: 'projects/termochromic/prototype/prototype',
  262208745: 'projects/canny-edge-detection/demo/demo',
  279840418: 'projects/scribbling-speech/visualisation/visualisation',
  329613216: 'projects/coffee-composer/video/video',
  414940484: 'projects/word-to-world/demo/demo',
};

export const SOURCE_OVERRIDES = {
  'projects/breathing-surface/hero/hero': 'imgA/ronResch.jpg',
  'projects/canny-edge-detection/hero/hero': 'imgA/canny.png',
  'projects/ink-animation/hero/hero': 'imgA/inkImage.png',
  'projects/soft-robotic/hero/hero': 'imgA/soft_background.jpg',
  'projects/the-body-languages-of-machine/hero/hero': 'imgA/pattern.png',
  'projects/throw-it/hero/hero': 'imgA/bucket_image.png',
  'projects/breeze/hero/hero': 'imgA/breezeImage.png',
  'projects/jie/hero/hero': 'imgA/insBorrow.jpg',
  'projects/coffee-composer/hero/hero': 'imgA/espresso_in_hand.jpg',
  'projects/word-to-world/hero/hero': 'imgA/word_to_world_titel_.gif',
  'projects/termochromic/hero/hero': 'imgA/termochromic.mp4',
  'projects/web/hero/hero': 'imgA/howIWork.mp4',
  'projects/omzug/hero/hero': 'imgA/hotAirBalloon.mp4',
  'projects/scribbling-speech/hero/hero': 'imgA/main_movie_bird_sea.mp4',
  'projects/breeze/video-poster/video-poster': 'imgA/breezeVideoBackground.png',
  'site/home/hero-poster/hero-poster': 'imgA/videoPoster.jpg',
  'site/about/self/self': null,
  'projects/coffee-composer/media-photo-coffee/media-photo-coffee': null,
  'site/paintings/sun/sun': null,
  'site/paintings/hanwen/hanwen': null,
  'site/paintings/qingchengshan/qingchengshan': null,
};

export const ALLOWED_MISSING = new Set([
  'site/about/self/self.jpg',
  'projects/coffee-composer/media-photo-coffee/media-photo-coffee.jpg',
  'site/paintings/sun/sun.jpg',
  'site/paintings/hanwen/hanwen.jpg',
  'site/paintings/qingchengshan/qingchengshan.jpg',
]);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

export function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function keyBase(key) {
  return key.replace(/\.(?:jpg|jpeg|png|gif|webp|avif|mp4|mov|webm|m4v)$/i, '');
}

export function mediaIdForKey(key) {
  const parts = key.split('/').filter(Boolean);
  return parts[2] ?? '';
}

export function pageForKey(key) {
  const parts = key.split('/').filter(Boolean);
  if (parts[0] === 'projects' && parts[1]) {
    return `${parts[1]}.html`;
  }
  if (parts[0] !== 'site' || !parts[1]) {
    return null;
  }
  switch (parts[1]) {
    case 'home':
      return 'index.html';
    case 'about':
      return 'about/about.html';
    case 'contact':
      return 'contact/contact.html';
    case 'design':
      return 'design/indexdesign.html';
    case 'paintings':
      return 'paintings/indexpainting.html';
    case 'poems':
      return 'poems/indexpoem.html';
    default:
      return null;
  }
}

export function probeImage(file) {
  const output = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  });
  return {
    width: Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]),
    height: Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]),
  };
}

export function probeVideo(file) {
  const output = execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height:format=duration',
      '-of',
      'json',
      file,
    ],
    { encoding: 'utf8' },
  );
  const data = JSON.parse(output);
  const stream = data.streams?.[0] ?? {};
  return {
    width: Number(stream.width),
    height: Number(stream.height),
    duration: Number(data.format?.duration),
  };
}

export function imageWidths(width, height) {
  const longEdge = Math.max(width, height);
  if (longEdge >= 2000) {
    return [800, 2000];
  }
  if (longEdge > 800) {
    return [800, longEdge];
  }
  return [longEdge];
}

export function variantDimensions(width, height, targetLongEdge) {
  if (width >= height) {
    return {
      width: Math.min(width, targetLongEdge),
      height: Math.max(1, Math.round((height * Math.min(width, targetLongEdge)) / width)),
    };
  }
  return {
    width: Math.max(1, Math.round((width * Math.min(height, targetLongEdge)) / height)),
    height: Math.min(height, targetLongEdge),
  };
}

export function sha256(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function readInventory() {
  return JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
}

export function readVimeoSources() {
  const sources = new Map();
  if (!fs.existsSync(MEDIA_SRC)) {
    return sources;
  }
  for (const name of fs.readdirSync(MEDIA_SRC)) {
    const match = name.match(/^(\d+)_/);
    if (!match) {
      continue;
    }
    const id = match[1];
    const extension = path.extname(name).toLowerCase();
    const record = sources.get(id) ?? {};
    if (extension === '.mp4') {
      record.video = path.join(MEDIA_SRC, name);
    } else if (IMAGE_EXTENSIONS.has(extension)) {
      record.poster = path.join(MEDIA_SRC, name);
    }
    sources.set(id, record);
  }
  return sources;
}

export function buildSourceIndex() {
  const inventory = readInventory();
  const index = new Map();

  const add = (page, entry) => {
    const stem = normalize(path.basename(entry.file, path.extname(entry.file)));
    if (!index.has(page)) {
      index.set(page, new Map());
    }
    const pageIndex = index.get(page);
    if (!pageIndex.has(stem)) {
      pageIndex.set(stem, []);
    }
    pageIndex.get(stem).push(entry);
  };

  for (const [page, entries] of Object.entries(inventory.pages)) {
    for (const entry of entries) {
      if (!['image', 'video'].includes(entry.type)) {
        continue;
      }
      const basename = path.basename(entry.file);
      if (basename === 'backButton.png' || basename === 'backButtonWhite.png' || basename === 'favicon.png') {
        continue;
      }
      add(page, {
        ...entry,
        sourcePath: path.join(ROOT, entry.file),
      });
    }
  }

  const recovered = [
    ['index.html', 'blog-1.png'],
    ['index.html', 'blog-2.jpg'],
    ['index.html', 'blog-3.jpg'],
    ['coffee-composer.html', 'media_photo_coffee.jpg'],
    ['poems/indexpoem.html', 'tuzi.jpg'],
    ['paintings/indexpainting.html', 'tuzi1.jpg'],
    ['paintings/indexpainting.html', 'xiaobing.jpg'],
    ['paintings/indexpainting.html', 'tongtong.jpg'],
  ];

  for (const [page, name] of recovered) {
    const sourcePath = path.join(MEDIA_RECOVERED, name);
    if (!fs.existsSync(sourcePath)) {
      continue;
    }
    add(page, {
      file: `imgA/${name}`,
      sourcePath,
      exists: true,
      type: 'image',
      recovered: true,
      ...probeImage(sourcePath),
    });
  }

  return index;
}

function resolveOverrideSource(override) {
  if (!override) {
    return null;
  }
  if (override.startsWith('media-src/')) {
    return path.join(MEDIA_SRC, override.slice('media-src/'.length));
  }
  if (override.startsWith('media-recovered/')) {
    return path.join(MEDIA_RECOVERED, override.slice('media-recovered/'.length));
  }
  return path.join(ROOT, override);
}

export function findLocalSource(sourceIndex, page, key, expectedType) {
  const id = mediaIdForKey(key);
  const normalizedId = normalize(id);
  const candidates = sourceIndex.get(page)?.get(normalizedId) ?? [];
  const matching = candidates.filter((candidate) =>
    expectedType === 'video' ? candidate.type === 'video' : candidate.type === 'image',
  );
  const existing = matching.find((candidate) => candidate.exists);
  if (existing) {
    return existing;
  }

  const override = SOURCE_OVERRIDES[keyBase(key)];
  if (override !== undefined) {
    if (!override) {
      return null;
    }
    const sourcePath = resolveOverrideSource(override);
    if (!sourcePath || !fs.existsSync(sourcePath)) {
      return null;
    }
    return { sourcePath, exists: true, type: expectedType };
  }

  return null;
}

function vimeoPosterId(key) {
  const match = key.match(/^(.*)-poster\.(?:jpg|jpeg|png)$/i);
  if (!match) {
    return null;
  }
  const base = match[1];
  return Object.entries(VIMEO_KEYS).find(([, value]) => value === base)?.[0] ?? null;
}

function vimeoKeyId(key) {
  const base = keyBase(key);
  return Object.entries(VIMEO_KEYS).find(([, value]) => value === base)?.[0] ?? null;
}

function extractFrontmatterSource(frontmatter, field) {
  const block = frontmatter.match(
    new RegExp(`^${field}:\\s*\\n((?:[ \\t]+.*\\n?)+)`, 'm'),
  )?.[1];
  return block?.match(/^\s+src:\s*(.+)$/m)?.[1]?.trim() ?? null;
}

export function extractReferences() {
  const references = [];
  const add = (reference) =>
    references.push({
      ...reference,
      page: pageForKey(reference.key) ?? reference.page,
    });

  const projectDirectory = path.join(ROOT, 'src/content/projects');
  for (const file of fs.readdirSync(projectDirectory).filter((name) => name.endsWith('.mdx'))) {
    const slug = path.basename(file, '.mdx');
    const page = `${slug}.html`;
    const content = fs.readFileSync(path.join(projectDirectory, file), 'utf8');
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';

    for (const field of ['cover', 'thumbnail']) {
      const key = extractFrontmatterSource(frontmatter, field);
      if (key) {
        add({ key, page, kind: 'image-original', origin: field });
      }
    }

    for (const match of content.matchAll(/<VideoPlayer\b[\s\S]*?\/>/g)) {
      const tag = match[0];
      const key = tag.match(/\bsrc="([^"]+)"/)?.[1];
      const poster = tag.match(/\bposter="([^"]+)"/)?.[1];
      if (key) {
        add({
          key,
          page,
          kind: 'video-base',
          origin: 'VideoPlayer',
          hasExplicitPoster: Boolean(poster),
        });
      }
      if (poster) {
        add({ key: poster, page, kind: 'image-original', origin: 'VideoPlayer poster' });
      }
    }

    for (const match of content.matchAll(/<ResponsivePicture\b[\s\S]*?\/>/g)) {
      const key = match[0].match(/\bsrc="([^"]+)"/)?.[1];
      if (key) {
        add({ key, page, kind: 'image-base', origin: 'ResponsivePicture' });
      }
    }

    for (const match of content.matchAll(/mediaUrl\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      add({ key: match[1], page, kind: 'image-original', origin: 'mediaUrl' });
    }

    for (const match of content.matchAll(/src:\s*'([^']+)'/g)) {
      add({ key: match[1], page, kind: 'image-original', origin: 'object literal' });
    }
  }

  const pageFiles = [
    ['index.astro', 'index.html'],
    ['about.astro', 'about/about.html'],
    ['contact.astro', 'contact/contact.html'],
    ['design.astro', 'design/indexdesign.html'],
    ['paintings.astro', 'paintings/indexpainting.html'],
    ['poems.astro', 'poems/indexpoem.html'],
  ];

  for (const [file, page] of pageFiles) {
    const filePath = path.join(ROOT, 'src/pages', file);
    if (!fs.existsSync(filePath)) {
      continue;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    for (const match of content.matchAll(/mediaUrl\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      add({ key: match[1], page, kind: 'image-original', origin: 'mediaUrl' });
    }
    for (const match of content.matchAll(/src:\s*'([^']+)'/g)) {
      add({ key: match[1], page, kind: 'image-original', origin: 'object literal' });
    }
  }

  const deduplicated = new Map();
  for (const reference of references) {
    const identity = `${reference.kind}:${reference.key}`;
    const existing = deduplicated.get(identity);
    if (existing) {
      existing.hasExplicitPoster =
        Boolean(existing.hasExplicitPoster) || Boolean(reference.hasExplicitPoster);
      continue;
    }
    deduplicated.set(identity, { ...reference });
  }
  return [...deduplicated.values()];
}

export function buildPlan() {
  const references = extractReferences();
  const sourceIndex = buildSourceIndex();
  const vimeoSources = readVimeoSources();
  const explicitPosterKeys = new Set(
    references.filter((reference) => reference.kind === 'image-original').map((reference) => reference.key),
  );
  const plan = [];
  const missing = [];
  let allowedMissing = 0;

  for (const reference of references) {
    const base = keyBase(reference.key);

    if (reference.kind === 'video-base') {
      const vimeoId = vimeoKeyId(reference.key);
      if (vimeoId && vimeoSources.get(vimeoId)?.video) {
        const source = vimeoSources.get(vimeoId).video;
        const posterSource = vimeoSources.get(vimeoId).poster;
        const posterKey = `${base}-poster.jpg`;
        const generatePoster = !reference.hasExplicitPoster && !explicitPosterKeys.has(posterKey);
        plan.push({
          key: reference.key,
          kind: 'video',
          page: reference.page,
          source,
          sourceType: 'video',
          vimeoId,
          ...probeVideo(source),
          outputs: [
            { key: `${base}-720.mp4`, type: 'video', rendition: 720 },
            { key: `${base}-480.mp4`, type: 'video', rendition: 480 },
            ...(generatePoster
              ? [
                  {
                    key: posterKey,
                    type: 'poster',
                    source: posterSource ?? null,
                  },
                ]
              : []),
          ],
          status: 'ready',
        });
        continue;
      }

      const local = findLocalSource(sourceIndex, reference.page, reference.key, 'video');
      if (local) {
        const posterKey = `${base}-poster.jpg`;
        const generatePoster = !reference.hasExplicitPoster && !explicitPosterKeys.has(posterKey);
        plan.push({
          key: reference.key,
          kind: 'video',
          page: reference.page,
          source: local.sourcePath,
          sourceType: 'video',
          ...probeVideo(local.sourcePath),
          outputs: [
            { key: `${base}-720.mp4`, type: 'video', rendition: 720 },
            { key: `${base}-480.mp4`, type: 'video', rendition: 480 },
            ...(generatePoster ? [{ key: posterKey, type: 'poster', source: null }] : []),
          ],
          status: 'ready',
        });
      } else {
        plan.push({
          key: reference.key,
          kind: 'video',
          page: reference.page,
          status: 'missing',
          note: 'No video source found',
        });
        missing.push(reference.key);
      }
      continue;
    }

    if (reference.kind === 'image-base') {
      const local = findLocalSource(sourceIndex, reference.page, reference.key, 'image');
      if (!local) {
        plan.push({
          key: reference.key,
          kind: 'image',
          page: reference.page,
          status: 'missing',
          note: 'No image source found',
        });
        missing.push(reference.key);
        continue;
      }
      const dimensions = probeImage(local.sourcePath);
      const outputs = [];
      for (const width of imageWidths(dimensions.width, dimensions.height)) {
        const target = variantDimensions(dimensions.width, dimensions.height, width);
        outputs.push({
          key: `${reference.key}-${width}.jpg`,
          type: 'image',
          format: 'jpg',
          ...target,
        });
        outputs.push({
          key: `${reference.key}-${width}.webp`,
          type: 'image',
          format: 'webp',
          ...target,
        });
      }
      plan.push({
        key: reference.key,
        kind: 'image',
        page: reference.page,
        source: local.sourcePath,
        sourceType: 'image',
        ...dimensions,
        outputs,
        status: 'ready',
      });
      continue;
    }

    if (reference.kind === 'image-original') {
      const posterVimeoId = vimeoPosterId(reference.key);
      if (posterVimeoId && vimeoSources.get(posterVimeoId)?.poster) {
        plan.push({
          key: reference.key,
          kind: 'image-original',
          page: reference.page,
          source: vimeoSources.get(posterVimeoId).poster,
          sourceType: 'image',
          status: 'ready',
          outputs: [{ key: reference.key, type: 'original' }],
        });
        continue;
      }

      const local = findLocalSource(sourceIndex, reference.page, reference.key, 'image');
      if (local) {
        plan.push({
          key: reference.key,
          kind: 'image-original',
          page: reference.page,
          source: local.sourcePath,
          sourceType: 'image',
          ...probeImage(local.sourcePath),
          status: 'ready',
          outputs: [{ key: reference.key, type: 'original' }],
        });
      } else {
        const allowed = ALLOWED_MISSING.has(reference.key);
        plan.push({
          key: reference.key,
          kind: 'image-original',
          page: reference.page,
          status: allowed ? 'allowed-missing' : 'missing',
          note: allowed ? 'Owner-supplied asset pending' : 'No image source found',
        });
        if (allowed) {
          allowedMissing += 1;
        } else {
          missing.push(reference.key);
        }
      }
    }
  }

  return {
    references: references.length,
    plan,
    missing,
    allowedMissing,
    ready: plan.filter((entry) => entry.status === 'ready').length,
  };
}
