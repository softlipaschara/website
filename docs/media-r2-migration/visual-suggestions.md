# Visual suggestions and legacy content notes

These items are not implemented because they change the desktop appearance or
require owner-supplied assets.

## Missing images

- `/about/`: `self.jpg` portrait.
- `/paintings/`: `sun.jpg`, `hanwen.jpg`, `qingchengshan.jpg` are unrecoverable.
  `tuzi1.jpg`, `xiaobing.jpg`, and `tongtong.jpg` were recovered from git.
- `/poems/`: `tuzi.jpg` was recovered from git.
- `/coffee-composer/`: `media_photo_coffee.jpg` is unrecoverable.

The three unrecoverable paintings and the two other missing images remain broken
images with descriptive alt text, matching the legacy state.

## Content that existed only in HTML comments

The legacy pages contained several commented blocks that did not render. They
were removed during migration. The notable blocks were:

- `poems/indexpoem.html`: two Chinese poems (意, 艾).
- `scribbling-speech.html`: Applying Motion, Arrange Position, Adding Color,
  Changing Size, and Inspiration sections, plus `yeats.png` and `poetry.jpg`.
- `breeze.html`: the Designboom report link.
- `index.html`: cards for web, omzug, throw-it, and magpuzz; paintings and poems
  navigation items; the magpuzz block.
- `word-to-world.html`: Big Buck Bunny and catWalking videos.
- `emotional-tail.html`: the bow image and Vimeo iframe.
- `jie.html`: papercut/face images and alternate help-flow text.
- `ink-animation.html`: an additional sketch image.
- `coffee-composer.html`: `coffee_tokens.jpg` and the Technologies Behind section.
- `photography.html`, `printing.html`, `painting.html`: unused slide images.
- `canny-edge-detection.html`: an Ideation label.
- `throw-it.html`: a video version of the bucket animation.

Ask the owner before reintroducing any of these.

## Deliberate visual changes

- Slick and Bootstrap carousels were replaced by `Carousel` with 44 px arrow hit
  areas. Arrow rendering is not pixel-identical to the old CDN themes.
- Carousel slides are centered instead of left-aligned. The legacy photography,
  printing, and painting pages were left-aligned because the page-level `.slider`
  rule collided with the toggle-switch `.slider` rule in `index.css`. The new
  component avoids that collision.
- The blog's dead Tumblr images and Xiami Flash player were removed.
- The home hero and the Sensing Armband hero use poster images because their S3
  sources are unavailable.
- The About page now declares a viewport, so its mobile layout will differ from
  the legacy page.
- Five site pages now have a viewport meta tag.

## Known mobile issues for Phase 4

- `/poems/`: fixed 230 px poem columns and 65 px margins overflow at 390 px.
- `/about/`: horizontal flex layout with a 70 px introduction margin overflows.
- Home `#blog`: the block measures wider than the viewport at 390 px.
- The old 1280 px and 1024 px breakpoints must be preserved above 1200 px.
