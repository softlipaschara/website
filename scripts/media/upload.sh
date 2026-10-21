#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE="$ROOT/media-out"
REMOTE="${R2_REMOTE:-r2:portfolio-media}"
CACHE_CONTROL="${R2_CACHE_CONTROL:-public, max-age=604800}"

if [[ ! -d "$SOURCE" ]]; then
  echo "media-out not found. Run npm run media:build first." >&2
  exit 1
fi

ARGS=(
  copy
  "$SOURCE/"
  "$REMOTE/"
  --header-upload
  "Cache-Control: $CACHE_CONTROL"
  --s3-no-check-bucket
  --exclude
  ".DS_Store"
  --progress
)

if [[ "${1:-}" != "--apply" ]]; then
  echo "Dry run. Pass --apply to upload."
  ARGS+=(--dry-run)
fi

rclone "${ARGS[@]}"
