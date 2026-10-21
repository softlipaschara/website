# MDX migration conventions

These conventions apply to every project page migrated from the legacy HTML files.

## Frontmatter

```yaml
---
title: Display title
order: 1
summary: One sentence for metadata and cards.
tools:
  - Tool name
cover:
  src: projects/<slug>/<media-id>/<media-id>.<ext>
  alt: Description
thumbnail:
  src: site/home/<media-id>/<media-id>.<ext>
  alt: Description
  type: image
  class: breezeBlock homeCardImage
homeSection: selectedWorks | prototype | whatsMore
homeLabel: Optional label for the home page
featured: true
backButton: black | white
---
```

`cover` is optional. Leave `media` out; inline components are authoritative.

## Media keys

For a project page `<slug>`, a local file `imgA/<stem>.<ext>` maps to:

```text
projects/<slug>/<media-id>/<media-id>.<ext>
```

`<media-id>` is the lowercased stem with non-alphanumeric runs replaced by `-`.
Examples: `breezeImage` -> `breeze-image`, `main_movie_bird_sea` -> `main-movie-bird-sea`,
`India1` -> `india1`, `p1` -> `p1`.

Home media uses `site/home/<media-id>/<media-id>.<ext>`. Site hub media uses
`site/<page>/<media-id>/<media-id>.<ext>`.

## Components

Use `ResponsivePicture` for JPG images. Pass the base key without an extension and
dimensions from `docs/media-r2-migration/media-inventory.json`:

```mdx
<ResponsivePicture
  src="projects/jie/situation-borrow/situation-borrow"
  alt="Two neighbours meeting"
  width={1600}
  height={900}
  class="storyImage"
/>
```

Use a plain `<img>` for PNG and GIF files, because they may be transparent or animated:

```mdx
<img
  class="paperFlow"
  src={mediaUrl('projects/jie/jimmy/jimmy.gif')}
  alt="Paper prototype flow for the person asking for help"
/>
```

Use `VideoPlayer` for local videos and Vimeo replacements. Pass the base key without
the rendition suffix:

```mdx
<VideoPlayer
  src="projects/jie/demo/demo"
  class="vimeoInk"
  width={960}
  height={540}
  controls
  preload="auto"
/>
```

Autoplay background videos:

```mdx
<VideoPlayer
  src="projects/omzug/hero/hero"
  autoplay
  loop
  muted
  playsinline
  width="100%"
/>
```

Keep the old wrapper elements and classes when they control layout, for example
`<div class="videos_scribbling_speech">`. `VideoPlayer` renders the `<video>` directly,
so pass the old video class/style to the component.

When the old element had a local `poster`, pass its key with the extension:

```mdx
poster="projects/word-to-world/mushroom-poster/mushroom-poster.png"
```

Otherwise omit `poster`; the pipeline supplies `<base>-poster.jpg`.

## Vimeo replacements

Replace `player.vimeo.com` iframes with `VideoPlayer` using these keys:

| Vimeo ID | Key |
| --- | --- |
| 174794803 | `projects/jie/demo/demo` |
| 189073056 | `projects/responsive-lighting/prototype/prototype` |
| 190151883 | `projects/breathing-surface/prototype/prototype` |
| 195434826 | `projects/breeze/prototype/prototype` |
| 202025192 | `projects/ink-animation/demo/demo` |
| 204383527 | `projects/sensing-armband/prototype/prototype` |
| 217140436 | `projects/scale/prototype/prototype` |
| 222038876 | `projects/termochromic/prototype/prototype` |
| 262208745 | `projects/canny-edge-detection/demo/demo` |
| 329613216 | `projects/coffee-composer/video/video` |
| 414940484 | `projects/word-to-world/demo/demo` |

Use the iframe's old width and height as the video width and height.

## Unrecoverable media

Remove dead S3, Tumblr, Instagram, and Flash embeds. Keep an MDX comment in place:

```mdx
{/* Source unavailable: original S3 video returned HTTP 403. */}
```

If a local poster exists, render it as an image instead of leaving an empty video.
Report every removed item in the final message so it can be added to `media-audit.md`.

## Page-specific CSS

Do not put `<style>` blocks in MDX. Create `src/styles/projects/<slug>.css` and import
it at the top of the MDX file:

```mdx
import '../../styles/projects/photography.css';
```

Only create a CSS file when the legacy page had a page-specific `<style>` block.

## Scope

- Do not edit shared components, styles, the content schema, or `src/pages/`.
- Do not run `npm run build` or `npm run check`; the shared build runs after all pages land.
- Keep all existing classes, inline styles, anchors, and text. Remove only the legacy
  back-button block, its inline script, external scripts, and non-rendered comments.
- Alt text must be in English. Preserve Chinese text that is visible content.
