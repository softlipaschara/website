# Portfolio Rebuild: Astro + Cloudflare R2

Status: draft for adversarial review
Date: 2026-10-21
Branch: `astro-rebuild`
Skills: `superpowers:brainstorming`, `workflow-authoring`

## 1. Background and goals

The current site is 27 hand-written HTML pages published by GitHub Pages from the
`master` branch and served at `https://xinyue.de`. The site works, but has three
structural problems:

1. All media lives in git. The working tree is about 460 MB and `.git` is about
   528 MB. Clone time is close to one minute on a fast connection.
2. Thirteen project pages embed Vimeo iframes. Vimeo is unreachable from mainland
   China, and the free Vimeo plan only exposes 720p streams.
3. Pages duplicate head, navigation, back button, and layout markup. Only six
   media queries exist, and several pages use fixed pixel widths. Mobile layouts
   overflow horizontally.

Goals:

- Rebuild the site with Astro and MDX content collections.
- Move project media to Cloudflare R2 behind `media.xinyue.de`.
- Replace Vimeo iframes with a native self-hosted `<video>` player.
- Fix mobile and narrow-screen layout without changing desktop visuals.
- Keep the existing URLs working through redirects.
- Deploy through GitHub Actions to GitHub Pages.
- Make adding a new project a single MDX file plus media assets.

Non-goals:

- Visual redesign. Desktop output must remain visually identical.
- Mainland China mirror. R2 is the only media origin for now.
- Adaptive bitrate streaming. Short clips use progressive MP4.
- Recovering 1080p or original Vimeo masters.

## 2. Current state audit

### 2.1 Page inventory

Project pages (21), all currently at the repository root:

| Current file | New route |
| --- | --- |
| `breathing-surface.html` | `/breathing-surface/` |
| `breeze.html` | `/breeze/` |
| `canny-edge-detection.html` | `/canny-edge-detection/` |
| `coffee-composer.html` | `/coffee-composer/` |
| `emotional-tail.html` | `/emotional-tail/` |
| `ink-animation.html` | `/ink-animation/` |
| `jie.html` | `/jie/` |
| `omzug.html` | `/omzug/` |
| `painting.html` | `/painting/` |
| `photography.html` | `/photography/` |
| `printing.html` | `/printing/` |
| `responsive-lighting.html` | `/responsive-lighting/` |
| `scale.html` | `/scale/` |
| `scribbling-speech.html` | `/scribbling-speech/` |
| `sensing-armband.html` | `/sensing-armband/` |
| `soft-robotic.html` | `/soft-robotic/` |
| `termochromic.html` | `/termochromic/` |
| `the-body-languages-of-machine.html` | `/the-body-languages-of-machine/` |
| `throw-it.html` | `/throw-it/` |
| `web.html` | `/web/` |
| `word-to-world.html` | `/word-to-world/` |

Site pages (6):

| Current file | New route |
| --- | --- |
| `index.html` | `/` |
| `about/about.html` | `/about/` |
| `contact/contact.html` | `/contact/` |
| `design/indexdesign.html` | `/design/` |
| `paintings/indexpainting.html` | `/paintings/` |
| `poems/indexpoem.html` | `/poems/` |

Total: 27 routes.

### 2.2 Media inventory

Counts and sizes in the current working tree:

| Type | Files | Size |
| --- | --- | --- |
| mp4 | 60 | 179 MB |
| gif | 50 | 155 MB |
| jpg | 93 | 54 MB |
| png | 95 | 40 MB |
| mov | 4 | 16 MB |

`imgA/` alone is 449 MB. External media references:

- `player.vimeo.com`: 13 project pages.
- `s3.eu-central-1.amazonaws.com/omzug.com`: 4 pages, 7 URLs.
- `media.tumblr.com` / `vt.media.tumblr.com`: 3 pages.
- `scontent.cdninstagram.com`: 1 page. These CDN URLs expire and are likely
  already broken.
- Google Fonts: shared across most pages.

### 2.3 Mobile defects

Evidence from 390 px wide headless Chrome screenshots:

- Home page: navigation clips the `Contact` item; hero text is cut off on the
  right; project cards overflow.
- `word-to-world.html`: body copy is cut off on the right.
- `about/about.html`: no viewport meta; the portrait image `imgA/self.jpg` does
  not exist, so the page has a broken image.

Root causes:

- Five pages have no viewport meta: `about`, `contact`, `design`, `paintings`,
  `poems`.
- Fixed widths in `index.css`: `378px` cards, `768px` and `960px` content blocks.
- Vimeo iframes use `width="960" height="540"`.
- `word-to-world.html` has 118 inline style attributes; other pages also rely on
  inline widths.
- `index.css` has only six media queries; secondary CSS files have none.

### 2.4 Known broken or stale items

- `index.html` contains a commented-out `magpuzz.html` link. It is not rendered.
  The commented block will be removed during the rewrite.
- `about/about.html` references a missing `imgA/self.jpg`. The rewrite keeps an
  `<img>` with descriptive alt text; the missing asset is documented in
  `visual-suggestions.md` for the owner to supply.
- Instagram CDN URLs are expected to be dead. They will be audited, and if they
  cannot be recovered, listed for replacement.

## 3. Architecture

### 3.1 Stack

- Astro (latest stable) with static output.
- `@astrojs/mdx` for project content.
- Astro Content Layer API with a `glob` loader.
- No client framework. Interactive behavior is small vanilla TypeScript modules.
- TypeScript for scripts and content schema.

### 3.2 Directory layout

```text
website/
  astro.config.mjs
  package.json
  tsconfig.json
  public/
    assets/
      ui/                  # favicon, back button, small UI images, fonts
  src/
    components/
      BackButton.astro
      BaseLayout.astro
      ProjectCard.astro
      ProjectLayout.astro
      ResponsivePicture.astro
      SiteHeader.astro
      VideoPlayer.astro
    content/
      projects/            # one MDX file per project
    content.config.ts
    data/
      site.ts              # navigation, site metadata
    pages/
      index.astro
      about.astro
      contact.astro
      design.astro
      paintings.astro
      poems.astro
      [slug].astro         # project detail route
    styles/
      global.css
    scripts/
      back.ts
      hide-content.ts
      carousel.ts
  scripts/
    media/
      audit.mjs
      fetch-vimeo.sh
      optimize.sh
      upload.sh
  docs/
    media-r2-migration/
      design.md
      media-audit.md
      migration-checklist.md
      visual-suggestions.md
```

Old source files are removed only after the new site passes verification.

### 3.3 Content schema

`src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    tools: z.array(z.string()).default([]),
    cover: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    media: z
      .array(
        z.object({
          type: z.enum(['video', 'image']),
          src: z.string(),
          poster: z.string().optional(),
          alt: z.string().optional(),
          caption: z.string().optional(),
        }),
      )
      .default([]),
    legacyPath: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
```

Media `src` values are paths relative to the project media folder, for example
`video-720.mp4` or `cover-2000.webp`. Components prepend `MEDIA_BASE_URL` and
`/projects/<slug>/`.

### 3.4 Routing and redirects

- `src/pages/[slug].astro` calls `getStaticPaths()` over the `projects`
  collection and renders `ProjectLayout`.
- Site pages are dedicated `.astro` files.
- `astro.config.mjs` sets `build.format: 'directory'` and
  `trailingSlash: 'always'`, producing `/word-to-world/index.html` and URLs such
  as `/word-to-world/`.
- Legacy redirects are declared in `astro.config.mjs`:

```js
redirects: {
  '/about/about.html': '/about/',
  '/contact/contact.html': '/contact/',
  '/design/indexdesign.html': '/design/',
  '/paintings/indexpainting.html': '/paintings/',
  '/poems/indexpoem.html': '/poems/',
  '/breathing-surface.html': '/breathing-surface/',
  // ... one entry per project page
}
```

For static output Astro emits meta-refresh pages at the old paths. Each redirect
page also includes `<link rel="canonical">` pointing at the new URL. GitHub Pages
cannot emit HTTP 301 for static files; meta refresh is the accepted trade-off.

### 3.5 Components

| Component | Responsibility |
| --- | --- |
| `BaseLayout.astro` | `<html>`, head, title, description, viewport, self-hosted fonts, global CSS, favicon |
| `SiteHeader.astro` | Home page navigation and anchor links (`#selectedWorks`, `#about`, `#blog`, `#contact`) |
| `BackButton.astro` | Accessible back control; uses `history.back()` when there is history, otherwise a provided fallback href |
| `ProjectLayout.astro` | Cover image, title, tools, MDX body, media gallery |
| `ProjectCard.astro` | Home page project tile |
| `VideoPlayer.astro` | Responsive `<video>` wrapper with poster, controls, autoplay/loop/muted options |
| `ResponsivePicture.astro` | `<picture>` with WebP and JPEG sources, `srcset`, `sizes`, explicit dimensions |

### 3.6 Interaction preservation

The existing behaviors are preserved exactly:

- `goBack()` back button behavior.
- `hideContent.js` behavior where pages use it.
- Carousel behavior where `carousel.js` is used.
- Home page smooth in-page anchors.

Inline scripts and inline styles are moved into modules and CSS classes where
they belong to shared behavior. Page-specific one-off styles are kept local
until they can be expressed cleanly; the desktop rendering must not change.

## 4. Media delivery

### 4.1 R2 layout

- Bucket: `portfolio-media` (new bucket, separate from the app bucket
  `w2w-cdn`).
- Public custom domain: `media.xinyue.de`, connected to the bucket.
- Zone: `xinyue.de` is hosted on Cloudflare. GitHub Pages records remain
  **DNS only** (grey cloud) to avoid proxy/SSL interactions.

Object paths:

```text
projects/<slug>/video-720.mp4
projects/<slug>/video-480.mp4
projects/<slug>/poster.jpg
projects/<slug>/<name>-2000.webp
projects/<slug>/<name>-2000.jpg
projects/<slug>/<name>-800.webp
projects/<slug>/<name>-800.jpg
```

Small UI assets (favicon, back button, logos) stay in `public/assets/ui/` and
are served from GitHub Pages.

### 4.2 Video pipeline

Source files are downloaded into `media-src/` (gitignored). Output goes to
`media-out/` (gitignored), mirroring the R2 paths.

Transcode rules:

- Container: MP4, `-movflags +faststart`.
- Video: H.264 High profile, CRF 23, preset slow, `yuv420p`.
- Audio: AAC 128 kbps, 48 kHz.
- Renditions: 720p and 480p, preserving aspect ratio with even dimensions.
- Poster: first frame at 1 second, JPEG quality 2.

Reference commands:

```bash
ffmpeg -i input.mp4 -vf "scale=-2:720" -c:v libx264 -profile:v high -crf 23 \
  -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k \
  video-720.mp4

ffmpeg -i input.mp4 -vf "scale=-2:480" -c:v libx264 -profile:v high -crf 23 \
  -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k \
  video-480.mp4

ffmpeg -ss 1 -i input.mp4 -frames:v 1 -q:v 2 poster.jpg
```

GIF replacement:

```bash
ffmpeg -i input.gif -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 \
  -pix_fmt yuv420p -movflags +faststart loop.mp4
```

GIFs that are purely decorative and loop silently become `autoplay muted loop
playsinline` videos. GIFs with meaningful controls stay as controls-enabled
videos.

### 4.3 Image pipeline

- Maximum long edge: 2000 px. Generate 2000 px and 800 px variants.
- Formats: WebP primary, JPEG fallback.
- Quality: WebP 82, JPEG 85.
- `ResponsivePicture` emits `srcset` and `sizes` so mobile downloads the 800 px
  variant.

### 4.4 Caching

- Project media: `Cache-Control: public, max-age=604800` (7 days).
  Updates are rare and can be purged from the Cloudflare dashboard.
- UI assets: Astro fingerprints filenames; long-lived caching is handled by
  GitHub Pages defaults.
- Uploads set cache headers through rclone's `--header-upload` option.

### 4.5 Local development

- `PUBLIC_MEDIA_BASE` selects the media origin.
- Production default: `https://media.xinyue.de`.
- Local development: `.env.development` sets `PUBLIC_MEDIA_BASE=/media`, and
  `scripts/media/localize.sh` copies `media-out/` into `public/media/`
  (gitignored). This keeps desktop and mobile previews working without network
  access to R2.
- If local media is absent, the site still renders; videos show their poster and
  a browser error only when played.

### 4.6 Upload and credentials

- Bucket and custom-domain management: `wrangler` (already authenticated as
  `xinyue@wordtoworld.io`).
- Bulk upload: `rclone` with an R2 API token scoped to `portfolio-media`
  (Object Read and Write). The token is stored in the local rclone config, never
  in the repository.
- Upload command:

```bash
rclone sync media-out/ r2:portfolio-media/ \
  --header-upload "Cache-Control: public, max-age=604800" \
  --progress
```

### 4.7 Vimeo source availability

Eleven of thirteen Vimeo videos have been downloaded at 720p. The remaining two
(`217140436` Scales, `279840418` Visualisation of the Space Model) are public
and owned by the same account; downloads fail intermittently because of Vimeo
session and rate limiting. They are retried during implementation. If a video
cannot be obtained, its page keeps the original Vimeo iframe temporarily and the
gap is recorded in `media-audit.md`; the page is not blocked on it.

## 5. Responsive and code quality

### 5.1 Layout rules

- Mobile-first CSS.
- Breakpoints: 640 px, 900 px, 1200 px.
- Content container: `width: min(100% - 48px, 1200px); margin-inline: auto;`.
- Home project grid: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));`.
- Project body text: `max-width: 72ch`.
- Media: `width: 100%; height: auto;` with `aspect-ratio` wrappers.
- Navigation wraps instead of clipping.
- Touch targets at least 44 by 44 px.

### 5.2 Desktop parity contract

At viewport widths of 1200 px and above, the new site must render the same
layout, typography, spacing, and colors as the current site. Permitted
differences:

- Sub-pixel anti-aliasing.
- Removal of non-rendered commented markup.
- Broken images that were already broken (for example the About portrait).

All other differences are regressions and must be fixed before merge.

### 5.3 Code cleanup

- Remove inline styles that duplicate shared CSS.
- Keep page-specific styles in page-scoped `<style>` blocks only when they are
  genuinely unique.
- Move repeated inline scripts into `src/scripts/`.
- Remove the commented `magpuzz` block.
- Remove `bootstrap.js`, `bootstrap.min.js`, and `npm.js` only if a reference
  audit proves they are unused.
- Do not perform unrelated refactors.

### 5.4 Fonts

Google Fonts (Abel, Signika Negative, Open Sans, Unna, Material Icons) are
downloaded as WOFF2 and self-hosted under `public/assets/fonts/`. `@font-face`
declarations live in `global.css`. This removes a third-party dependency that
is unreliable in mainland China.

### 5.5 Visual suggestions

Ideas that change the desktop appearance are recorded in
`docs/media-r2-migration/visual-suggestions.md` and are not implemented without
explicit approval.

## 6. Deployment

### 6.1 Astro configuration

```js
export default defineConfig({
  site: 'https://xinyue.de',
  build: { format: 'directory' },
  trailingSlash: 'always',
  integrations: [mdx()],
  redirects: { /* legacy paths */ },
});
```

### 6.2 GitHub Actions

Workflow file: `.github/workflows/deploy.yml`.

- Trigger: push to `master`, plus `workflow_dispatch`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.
- Build: Node 22, `npm ci`, `npm run build`.
- Publish: `actions/upload-pages-artifact` then `actions/deploy-pages`.
- Concurrency group `pages`, cancel in progress.

Repository setting: Settings -> Pages -> Source = **GitHub Actions**. This is a
one-time manual change.

The repository is public, so Actions minutes are free under GitHub's fair-use
policy.

### 6.3 Branch and release

- Development happens on `astro-rebuild`.
- `master` remains the deployed site until the rebuild passes verification.
- Before merge, tag `pre-astro` at the current `master` commit.
- Merge to `master` only after the acceptance checks pass.

## 7. Implementation phases

### Phase 0: Prerequisites

- Complete the `xinyue.de` nameserver migration to Cloudflare.
- Create the `portfolio-media` R2 bucket.
- Connect `media.xinyue.de` to the bucket.
- Create an R2 API token for rclone.
- Finish Vimeo downloads or record the two gaps.

### Phase 1: Scaffold

- Initialize Astro, TypeScript, MDX.
- Add `BaseLayout`, `SiteHeader`, `BackButton`, `ProjectLayout`, `ProjectCard`,
  `VideoPlayer`, `ResponsivePicture`.
- Add content schema, site data, global CSS, and self-hosted fonts.
- Configure redirects, trailing slashes, and site URL.

### Phase 2: Content migration

- Convert all 21 project pages into MDX entries with frontmatter.
- Convert the 6 site pages into `.astro` pages.
- Preserve headings, tools, descriptions, links, and media order.
- Replace Vimeo/S3/Tumblr/Instagram embeds with local media components.
- Keep page-specific behavior and anchors.

### Phase 3: Media pipeline

- Audit every media reference in the old pages.
- Download recoverable external media.
- Transcode videos to 720p and 480p with posters.
- Convert GIFs to looping MP4 where appropriate.
- Generate WebP and JPEG image variants.
- Upload `media-out/` to R2 and verify a sample of objects over HTTPS.

### Phase 4: Responsive and parity

- Apply mobile-first layout rules to every page.
- Verify no horizontal overflow at 390 px.
- Compare desktop screenshots at 1440 px and 1200 px against the old site.
- Fix regressions until parity is achieved.

### Phase 5: Verification and launch

- Build with `npm run build`.
- Serve `dist/` locally and run link, redirect, and media checks.
- Run the adversarial review workflow.
- Merge to `master`, enable GitHub Actions as the Pages source, and confirm the
  production deploy.

### Phase 6: Optional history cleanup

After the new site is live and stable, optionally rewrite git history to remove
large media from `.git` (about 528 MB). This requires `git filter-repo` or BFG,
a mirror backup, and a force push. It is a separate, explicitly approved step.

## 8. Acceptance criteria

1. All 27 routes return HTTP 200 in the built site.
2. Every legacy `.html` URL returns a page with a meta refresh to the new route
   and a canonical link.
3. No page references `player.vimeo.com`, `s3.eu-central-1.amazonaws.com`,
   `media.tumblr.com`, or `cdninstagram.com`. Exceptions are recorded in
   `media-audit.md`.
4. Videos play from the configured media origin, with posters and captions where
   available.
5. No horizontal overflow at 390 px on any page
   (`document.documentElement.scrollWidth <= window.innerWidth + 1`).
6. Desktop screenshots at 1440 px and 1200 px match the old site within the
   parity contract.
7. `npm run build` succeeds with no broken internal links.
8. The GitHub Actions workflow deploys successfully to Pages.
9. No Chinese characters appear in code, comments, test names, or commit
   messages.
10. `docs/media-r2-migration/` contains the design, media audit, migration
    checklist, and visual suggestions.

## 9. Risks and rollback

| Risk | Mitigation |
| --- | --- |
| Desktop parity regressions | Screenshot comparison at 1200/1440 px before merge; fix page by page |
| R2 or DNS not ready | `PUBLIC_MEDIA_BASE` switch and local `public/media` fallback; site still renders |
| Vimeo downloads fail | Retry; fall back to the original iframe for the affected page and record it |
| Missing original assets | Document in `visual-suggestions.md`; do not invent replacements |
| Meta-refresh redirects are weaker than 301 | Add canonical links; accept for static Pages hosting |
| History rewrite breaks clones | Optional phase, mirror backup, force push only with explicit approval |
| Media cache staleness | 7-day TTL; purge changed objects in Cloudflare |

Rollback: keep `master` untouched and tagged `pre-astro`. If the new build
fails, set Pages back to the previous source and force-push nothing.

## 10. Dependencies and open inputs

These are external inputs, not design gaps:

- Cloudflare nameserver migration must finish before `media.xinyue.de` can be
  connected.
- An R2 API token must be created locally for rclone. It is never committed.
- Two Vimeo videos remain to be downloaded; the fallback above applies.
- The About portrait `imgA/self.jpg` is missing from the repository. The owner
  may supply it; otherwise the image stays as an alt-text placeholder.

## 11. Documentation set

- `design.md`: this document.
- `media-audit.md`: every external and local media reference, its destination,
  and any failure.
- `migration-checklist.md`: page-by-page migration and verification state.
- `visual-suggestions.md`: non-implemented visual improvements for later review.
