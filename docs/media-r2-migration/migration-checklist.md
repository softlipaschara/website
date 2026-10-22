# Migration checklist

Status: Phases 1-4 and the R2 upload are complete on 2026-10-22, including four
recovered images and all recovered S3 videos. Pages cutover is pending.

## Routes

All 27 routes build from `src/pages/`:

| Route | Source | Content | Notes |
| --- | --- | --- | --- |
| `/` | `index.html` | `src/pages/index.astro` | Three hash states preserved by `hide-content.ts`; S3 hero video restored. |
| `/about/` | `about/about.html` | `src/pages/about.astro` | Missing `self.jpg` kept as a broken image with alt text. |
| `/contact/` | `contact/contact.html` | `src/pages/contact.astro` | `hvr-float` reproduced locally; Font Awesome removed as unused. |
| `/design/` | `design/indexdesign.html` | `src/pages/design.astro` | Text-only page. |
| `/paintings/` | `paintings/indexpainting.html` | `src/pages/paintings.astro` | Bootstrap carousel replaced by `Carousel`. Three of six images are unrecoverable. |
| `/poems/` | `poems/indexpoem.html` | `src/pages/poems.astro` | Recoverable `tuzi.jpg`; commented poems removed. |
| `/breathing-surface/` | `breathing-surface.html` | MDX | Vimeo 190151883 replaced. |
| `/breeze/` | `breeze.html` | MDX | Vimeo 195434826 replaced; S3 video recovered and transcoded; top cover replaced with a silent looping `videoForIndex.mp4`; Instagram video removed. |
| `/canny-edge-detection/` | `canny-edge-detection.html` | MDX | Vimeo 262208745 replaced. |
| `/coffee-composer/` | `coffee-composer.html` | MDX | Vimeo 329613216 replaced; media photo recovered. |
| `/emotional-tail/` | `emotional-tail.html` | MDX | Commented Vimeo iframe removed. |
| `/ink-animation/` | `ink-animation.html` | MDX | Vimeo 202025192 replaced. |
| `/jie/` | `jie.html` | MDX | Vimeo 174794803 replaced. |
| `/omzug/` | `omzug.html` | MDX | Local videos and mobile GIF fallbacks preserved. |
| `/painting/` | `painting.html` | MDX | Slick carousel replaced by `Carousel`. |
| `/photography/` | `photography.html` | MDX | Slick carousel replaced by `Carousel`. |
| `/printing/` | `printing.html` | MDX | Slick carousel replaced by `Carousel`. |
| `/responsive-lighting/` | `responsive-lighting.html` | MDX | Vimeo 189073056 replaced. |
| `/scale/` | `scale.html` | MDX | Vimeo 217140436 replaced. |
| `/scribbling-speech/` | `scribbling-speech.html` | MDX | Original S3 demos restored; Vimeo 279840418 no longer used; dead Tumblr demos poster-only. |
| `/sensing-armband/` | `sensing-armband.html` | MDX | S3 hero restored; Vimeo 204383527 replaced. |
| `/soft-robotic/` | `soft-robotic.html` | MDX | No external media. |
| `/termochromic/` | `termochromic.html` | MDX | Local hero video; Vimeo 222038876 replaced. |
| `/the-body-languages-of-machine/` | `the-body-languages-of-machine.html` | MDX | Cover only. |
| `/throw-it/` | `throw-it.html` | MDX | Local GIF; commented video removed. |
| `/web/` | `web.html` | MDX | Local hero video and mobile GIF fallback. |
| `/word-to-world/` | `word-to-world.html` | MDX | Vimeo 414940484 replaced; local videos preserved. |

## Legacy stubs

`src/pages/[...legacy].ts` emits 26 exact flat `.html` files. `/index.html` resolves
to the new home page. The build output contains `dist/<legacy>.html` files, not
directories. Each stub has a meta refresh, a canonical link, and `noindex`.

## Build checks

- `npm run check`: 0 errors, 0 warnings.
- `npm run build`: 27 routes, 26 legacy stubs.
- No `player.vimeo.com`, `s3.eu-central-1.amazonaws.com`, Tumblr, Instagram,
  jsDelivr, jQuery, maxcdn, or Xiami references in `src/` or `dist/`.
- No `imgA/` references in the built HTML.
- Home page renders 6 selected-work cards, 8 prototype tiles, and 3 What's More links.

## Media build

- `npm run media:audit` last ran on the source machine: 235 references, 230
  ready, 5 allowed-missing, 0 unexpected. The recovered media raise the totals
  to 245 references, 241 ready, and 4 allowed-missing. The plan was not
  regenerated on the old Mac because the Vimeo sources in `media-src` are not
  present there.
- The original build produced 395 files (362.6 MiB) in `media-out/` and
  `media-manifest.json`. The recovered media added 20 files: four images; the
  Breeze video and its silent cover; and six S3 video keys (five source files)
  with 720p and 480p renditions. The manifest now has 415 files (414.4 MiB).
  `npm run media:validate` confirms every referenced key is in the manifest.
- `npm run media:localize` copies `media-out/` to `public/media/` for local
  preview. `public/media/` is gitignored and the prebuild guard blocks a
  production build while it exists.
- `portfolio-media` and `media.xinyue.de` are active. The original upload
  completed with 395 files and 362.65 MiB. The recovered upload added 20 files
  (51.71 MiB), bringing the bucket to 415 objects and 414.36 MiB.
  `npm run media:check` returned HTTP 200 for all 415 keys. Sample responses
  have the expected Content-Type and `Cache-Control: public, max-age=604800`.

## Responsive and parity verification

- `npm run verify` checked all 27 routes and all five home hash states at 320,
  375, 390, 414, 640, 768, 900, 1024, 1200, 1280, 1440, and 1920 px.
- Result: 0 horizontal overflows, 0 page errors.
- After the four recovered images were merged, a second run at 390 and 1200 px
  checked all 27 routes and the five home hash states: 0 overflows, 0 page
  errors. The new images loaded at their expected dimensions and no page had a
  broken image.
- The Breeze video was re-checked at 390 and 1200 px after restoration: 0
  overflows, 0 page errors. The player loaded the 1280x720 rendition
  (`readyState` 4, duration 48.6 s) with controls.
- The home hero, Breeze top cover, Sensing Armband hero, and four Scribbling
  Speech demos were checked in the browser and at 390/1200 px: 0 overflows, 0
  page errors. The hero videos autoplay, loop, and are muted with no controls;
  the Scribbling Speech demos keep controls and audio.
- Screenshots at 1200 and 1440 were captured to `/tmp/portfolio-screenshots`
  and compared with the legacy local site.
- The home page matches the legacy layout. Project text blocks, images, videos,
  and captions match after fixing MDX paragraph wrappers and image height
  scaling. The `word-to-world` Demo heading differs by 1 px and the full page
  height by 72 px.
- Accepted differences: the missing About portrait keeps alt text and shifts
  the introduction; recovered poems/paintings images change those layouts; the
  carousel slides are centered instead of the legacy left-aligned layout; dead
  external media is poster-only or removed.

## Remaining work

- Phase 5: GitHub Actions deploy and cutover.

## R2 verification

- Bucket: `portfolio-media`; custom domain: `media.xinyue.de`; ownership and SSL active.
- Original upload: 395 objects, 362.65 MiB, 100%, 2m 5s.
- Recovered upload: 20 files (51.71 MiB); the bucket now holds 415 objects and
  414.36 MiB.
- Size check: the 20 recovered files matched their remote objects; the other
  395 objects were verified over HTTPS because they are not present locally on
  the old Mac.
- HTTPS check: 415/415 keys returned HTTP 200.
- Cache headers: `public, max-age=604800`; content types match the file extensions.
- Production build (`dist/` with `https://media.xinyue.de` URLs) checked at 390
  and 1200 px: 0 overflows, 0 page errors.

## Cutover order

Do not merge before the Pages source and custom domain are checked.

1. Tag `pre-astro` at the current `master` commit.
2. Create and push a `legacy-site` branch at that commit. A tag cannot be selected
   as a Pages source.
3. Record the current custom domain (`xinyue.de`) and Enforce HTTPS state.
4. Switch Settings -> Pages -> Source to GitHub Actions before the merge that
   triggers the first deploy.
5. Merge `astro-rebuild` into `master` and let the workflow deploy `dist/`.
6. Verify `https://xinyue.de/`, all 27 routes, and the legacy `.html` stubs.
7. Verify Settings -> Pages still shows `xinyue.de` and enable Enforce HTTPS.
8. Delete the old root HTML, CSS, JS, and `imgA/` in a follow-up commit, after the
   new site is live.

Rollback: switch the Pages source to the `legacy-site` branch and verify the old
site. Do not force-push.

The workflow is in `.github/workflows/deploy.yml`. It builds on every branch it is
dispatched for, but the deploy job is gated to `master` and uses the
`github-pages` environment.
