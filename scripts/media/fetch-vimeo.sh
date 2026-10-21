#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MEDIA_SRC="${MEDIA_SRC:-$ROOT/../media-src}"

IDS=(
  164829665
  174794803
  189073056
  190151883
  195434826
  202025192
  204383527
  217140436
  222038876
  262208745
  279840418
  329613216
  414940484
)

missing=0
for id in "${IDS[@]}"; do
  if ! compgen -G "$MEDIA_SRC/${id}_*.mp4" >/dev/null; then
    echo "Missing Vimeo source: $id" >&2
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

echo "All ${#IDS[@]} Vimeo sources are present in $MEDIA_SRC."
