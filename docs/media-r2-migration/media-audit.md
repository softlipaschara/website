# Media audit

Generated from `media-inventory.json`, which was produced by scanning the legacy
HTML files after removing HTML comments.

## Summary

| Item | Count |
| --- | --- |
| Pages scanned | 27 |
| Unique local media references | 227 |
| Missing local references | 9 |
| Recoverable from git `cc4449b` | 4 |
| Recovered from owner's local files | 1 |
| Still unrecoverable local references | 4 |
| Vimeo iframes in legacy pages | 13 |
| Live Vimeo iframes | 11 |
| Downloaded Vimeo sources | 13/13 |

Counts by type are recorded in the inventory. The inventory excludes external
URLs, which are listed separately below.

## Missing local assets

| File | Page | Outcome |
| --- | --- | --- |
| `imgA/self.jpg` | `/about/` | Broken image kept with alt text; owner may supply. |
| `imgA/media_photo_coffee.jpg` | `/coffee-composer/` | Recovered from `~/Documents/ma semester 1/video material/coffee_composer_press.jpg`. |
| `imgA/tuzi1.jpg` | `/paintings/` | Recovered from `cc4449b`. |
| `imgA/xiaobing.jpg` | `/paintings/` | Recovered from `cc4449b`. |
| `imgA/tongtong.jpg` | `/paintings/` | Recovered from `cc4449b`. |
| `imgA/tuzi.jpg` | `/poems/` | Recovered from `cc4449b`. |
| `imgA/sun.jpg` | `/paintings/` | Unrecoverable; owner may supply. |
| `imgA/hanwen.jpg` | `/paintings/` | Unrecoverable; owner may supply. |
| `imgA/qingchengshan.jpg` | `/paintings/` | Unrecoverable; owner may supply. |

Recovered files are staged in `~/Development/portfolio/media-recovered/` outside
the repository and are copied to R2 under their manifest keys.

## Recovered on the old Mac (2026-10-22)

The three blog images were still served by the Tumblr CDN. The Coffee Composer
media photo was found in the local project archive.

| Asset | Source | Dimensions | SHA-256 |
| --- | --- | --- | --- |
| `blog-1.png` | Tumblr `tumblr_p6u7jchytL1qkfs2lo1_1280.png` | 868×706 | `d8b5812cfc70edac4afbc937c1c9b616f4341eeaaa66c8ed696b20b838b8416c` |
| `blog-2.jpg` | Tumblr `tumblr_p6o36lMMsC1qkfs2lo1_1280.jpg` | 1280×960 | `79abeb7c45ff735d0dfbcdaf3b692b95226ecbeb7089f0ee25661b2d618fd5d0` |
| `blog-3.jpg` | Tumblr `tumblr_p6mou53IBL1qkfs2lo1_1280.jpg` | 1280×960 | `4c9920a2f828a705a9cc58355e84bd2be2f9d85736914281446981ae0fbd55fb` |
| `media_photo_coffee.jpg` | `~/Documents/ma semester 1/video material/coffee_composer_press.jpg` | 2000×1206 | `7395a3c159d429783ddde32b25f547aa4d788aaa1b117af1d881121dcc2266f1` |

## External media decisions

### Vimeo

All 13 sources were downloaded to `/Users/xiaoxia/Development/portfolio/media-src/`.
Eleven iframes were live. Two were commented out in the legacy HTML:
`164829665` (Emotional Tail) and `279840418` (Scribbling Speech).

| Vimeo ID | Destination key | Page |
| --- | --- | --- |
| 174794803 | `projects/jie/demo/demo` | Jie |
| 189073056 | `projects/responsive-lighting/prototype/prototype` | Responsive Lighting |
| 190151883 | `projects/breathing-surface/prototype/prototype` | Breathing Surface |
| 195434826 | `projects/breeze/prototype/prototype` | Breeze |
| 202025192 | `projects/ink-animation/demo/demo` | Interactive Ink Animation |
| 204383527 | `projects/sensing-armband/prototype/prototype` | Sensing Armband |
| 217140436 | `projects/scale/prototype/prototype` | Moving Scale |
| 222038876 | `projects/termochromic/prototype/prototype` | Termochromic Print |
| 262208745 | `projects/canny-edge-detection/demo/demo` | Canny Edge Detection |
| 329613216 | `projects/coffee-composer/video/video` | Coffee Composer |
| 414940484 | `projects/word-to-world/demo/demo` | Word to World |
| 279840418 | `projects/scribbling-speech/visualisation/visualisation` | Scribbling Speech (S3 replacement) |
| 164829665 | unused | Emotional Tail (legacy iframe was commented) |

### S3

All seven `s3.eu-central-1.amazonaws.com/omzug.com` references return HTTP 403.
No local copies were found.

| Page | Reference | Outcome |
| --- | --- | --- |
| `/` | `armbandprototype.mp4` (hero) | Replaced by `videoPoster.jpg` as a still image. |
| `/breeze/` | `breezeLamp.mp4` | Poster-only using `breezeVideoBackground.png`. |
| `/sensing-armband/` | `armbandprototype.mp4` (hero) | Poster-only using the Vimeo thumbnail. |
| `/scribbling-speech/` | `cat_story.mov` | Poster-only. |
| `/scribbling-speech/` | `moon_table_chinese.mov` | Poster-only. |
| `/scribbling-speech/` | `user_play_with_it.mp4` | Poster-only. |
| `/scribbling-speech/` | `talk_to_me_no_text.mp4` | Replaced by Vimeo 279840418. |

### Tumblr, Instagram, Xiami

- `index.html`: the three `78.media.tumblr.com` images were recovered from the
  Tumblr CDN and stored as `blog-1.png`, `blog-2.jpg`, and `blog-3.jpg`; the Xiami
  Flash player was removed.
- `scribbling-speech.html`: two `vt.media.tumblr.com` videos removed; posters retained.
- `breeze.html`: Instagram video and poster removed.
- The remaining Scribbling Speech Tumblr videos and the Instagram video were
  unrecoverable from this environment.

### Third-party JavaScript and CSS

The following dependencies were removed and replaced:

- jQuery 1.11.0/1.11.3 from code.jquery.com and `imgA/`.
- Slick 1.6.0 from cdn.jsdelivr.net; replaced by `Carousel` and `carousel.ts`.
- Bootstrap 3.3.6 from maxcdn on `/paintings/`; replaced by `Carousel`.
- Font Awesome 4.2.0 from maxcdn on `/contact/`; it was unused.
- Google Fonts; replaced by self-hosted WOFF2 files in `public/assets/fonts/`.

## Media key convention

See `mdx-conventions.md`. Keys are stable, page-scoped, and contain no original
filename collisions:

```text
projects/<slug>/<media-id>/<media-id>-720.mp4
projects/<slug>/<media-id>/<media-id>-480.mp4
projects/<slug>/<media-id>/<media-id>-poster.jpg
projects/<slug>/<media-id>/<media-id>-800.webp
projects/<slug>/<media-id>/<media-id>-2000.webp
projects/<slug>/<media-id>/<media-id>-800.jpg
projects/<slug>/<media-id>/<media-id>-2000.jpg
site/<page>/<media-id>/<media-id>.<ext>
```

Transparent PNG and GIF files keep their original format until the alpha policy
is applied. JPEG images use `ResponsivePicture` and generated variants. Videos
use 720p and 480p renditions. The source mapping and manifest are generated in
Phase 3.
