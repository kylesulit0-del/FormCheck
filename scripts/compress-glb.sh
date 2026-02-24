#!/usr/bin/env bash
# Draco-compress a GLB file using gltf-transform
# Usage: bash scripts/compress-glb.sh <input.glb> [output.glb]
# If output is not specified, overwrites the input file.

set -euo pipefail

INPUT="${1:?Usage: compress-glb.sh <input.glb> [output.glb]}"
OUTPUT="${2:-$INPUT}"

# Use a temp file if input == output to avoid clobbering
if [ "$INPUT" = "$OUTPUT" ]; then
  TMP_FILE="$(dirname "$OUTPUT")/.tmp-compress-$$.glb"
  npx gltf-transform draco "$INPUT" "$TMP_FILE" --method edgebreaker
  mv "$TMP_FILE" "$OUTPUT"
else
  npx gltf-transform draco "$INPUT" "$OUTPUT" --method edgebreaker
fi

SIZE=$(wc -c < "$OUTPUT")
echo "Success: $OUTPUT (${SIZE} bytes)"
