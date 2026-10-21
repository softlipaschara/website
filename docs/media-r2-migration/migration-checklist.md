# Migration checklist

Status: Phase 2 and local Phase 3/4 work complete on 2026-10-22. R2 upload and
Pages cutover are pending.

## Routes

All 27 routes build from `src/pages/`:

| Route | Source | Content | Notes |
| --- | --- | --- | --- |
| `/` | `index.html` | `src/pages/index.astro` | Three hash states preserved by `hide-content.ts`. |
| `/about/` | `about/about.html` | `src/pages/about.astro` | Missing `self.jpg` kept as a broken image with alt text. |
| `/contact/` | `contact/contact.html` | `src/pages/contact.astro` | `hvr-float` reproduced locally; Font Awesome removed as unused. |
| `/design/` | `design/indexdesign.html` | `src/pages/design.astro` | Text-only page. |
| `/paintings/` | `paintings/indexpainting.html` | `src/pages/paintings.astro` | Bootstrap carousel replaced by `Carousel`. Three of six images are unrecoverable. |
| `/poems/` | `poems/indexpoem.html` | `src/pages/poems.astro` | Recoverable `tuzi.jpg`; commented poems removed. |
| `/breathing-surface/` | `breathing-surface.html` | MDX | Vimeo 190151883 replaced. |
| `/breeze/` | `breeze.html` | MDX | Vimeo 195434826 replaced; S3 video poster-only; Instagram video removed. |
| `/canny-edge-detection/` | `canny-edge-detection.html` | MDX | Vimeo 262208745 replaced. |
| `/coffee-composer/` | `coffee-composer.html` | MDX | Vimeo 329613216 replaced; missing media photo kept. |
| `/emotional-tail/` | `emotional-tail.html` | MDX | Commented Vimeo iframe removed. |
| `/ink-animation/` | `ink-animation.html` | MDX | Vimeo 202025192 replaced. |
| `/jie/` | `jie.html` | MDX | Vimeo 174794803 replaced. |
| `/omzug/` | `omzug.html` | MDX | Local videos and mobile GIF fallbacks preserved. |
| `/painting/` | `painting.html` | MDX | Slick carousel replaced by `Carousel`. |
| `/photography/` | `photography.html` | MDX | Slick carousel replaced by `Carousel`. |
| `/printing/` | `printing.html` | MDX | Slick carousel replaced by `Carousel`. |
| `/responsive-lighting/` | `responsive-lighting.html` | MDX | Vimeo 189073056 replaced. |
| `/scale/` | `scale.html` | MDX | Vimeo 217140436 replaced. |
| `/scribbling-speech/` | `scribbling-speech.html` | MDX | Vimeo 279840418 used for the S3 visualisation replacement; dead Tumblr/S3 demos poster-only. |
| `/sensing-armband/` | `sensing-armband.html` | MDX | S3 hero poster-only; Vimeo 204383527 replaced. |
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

- `npm run media:audit` builds `media-plan.json`: 235 references, 230 ready,
  5 allowed-missing, 0 unexpected.
- `npm run media:build` produced 395 files (362.6 MiB) in `media-out/` and
  `media-manifest.json`. `npm run media:validate` confirms every referenced key
  is in the manifest.
- `npm run media:localize` copies `media-out/` to `public/media/` for local
  preview. `public/media/` is gitignored and the prebuild guard blocks a
  production build while it exists.
- `npm run media:upload` performs an rclone copy dry run. No upload has been
  performed because the R2 bucket and API token do not exist yet.

## Responsive and parity verification

- `npm run verify` checked all 27 routes and all five home hash states at 320,
  375, 390, 414, 640, 768, 900, 1024, 1200, 1280, 1440, and 1920 px.
- Result: 0 horizontal overflows, 0 page errors.
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

- Upload `media-out/` to R2 after the bucket and API token exist.
- Verify `media.xinyue.de` over HTTPS.
- Phase 5: GitHub Actions deploy and cutover.

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
