#!/usr/bin/env bash
# Pull the site's SOURCED content out of the package repo (../splain by default).
# The docs are rendered, never forked: each synced file gets a provenance header
# naming the exact commit, and edits belong in the package repo — not here.
# The vendor bundles are the FREE playback tier only (splain.js/standalone.js/css);
# the pro studio bundle deliberately never ships to the public site.
set -euo pipefail
cd "$(dirname "$0")/.."

PKG="${SPLAIN_REPO:-../splain}"
SHA=$(git -C "$PKG" rev-parse --short HEAD)

PAGES=(installation playback authoring checking privacy-mode studio progress generation adapters ci schema)

for page in "${PAGES[@]}"; do
    {
        printf '<!-- synced from splain@%s docs/%s.md — edit THERE, then re-run bin/sync-docs.sh -->\n\n' "$SHA" "$page"
        cat "$PKG/docs/$page.md"
    } > "content/docs/$page.md"
done

{
    printf '<!-- synced from splain@%s CHANGELOG.md — edit THERE, then re-run bin/sync-docs.sh -->\n\n' "$SHA"
    cat "$PKG/CHANGELOG.md"
} > "content/docs/changelog.md"

mkdir -p src/vendor
cp "$PKG/resources/dist/splain.js" "$PKG/resources/dist/standalone.js" "$PKG/resources/dist/splain.css" src/vendor/

echo "synced ${#PAGES[@]} docs pages + changelog + free playback bundles from splain@$SHA"
