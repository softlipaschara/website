# Migration checklist

Status: Phase 2 complete on 2026-10-22. Phase 3 media generation and upload are pending.

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

## Remaining work

- Phase 3: generate media variants, transcode videos, write `media-manifest.json`, upload to R2.
- Phase 4: responsive fixes and desktop parity screenshots.
- Phase 5: GitHub Actions deploy and cutover.
- The R2 bucket, API token, and `media.xinyue.de` custom domain are not created yet.
