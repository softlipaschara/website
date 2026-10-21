#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SOURCE="$ROOT/media-out"
DESTINATION="$ROOT/public/media"

if [[ ! -d "$SOURCE" ]]; then
  echo "media-out not found. Run npm run media:build first." >&2
  exit 1
fi

rm -rf "$DESTINATION"
mkdir -p "$DESTINATION"
cp -R "$SOURCE/." "$DESTINATION/"

echo "Localized $(find "$DESTINATION" -type f | wc -l | tr -d ' ') files into public/media."
