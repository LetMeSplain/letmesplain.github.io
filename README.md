# letmesplain.github.io

The Splain website — marketing + documentation. Hand-rolled static site, no framework.

**The site demonstrates the product by being it:** the dot in the corner, the page
tour, and the theme-switching hero demo all run Splain's real free-tier playback
bundle (`src/vendor/`), mounted through the standalone adapter with real guide
payloads. The pro bundle never ships here.

## Layout

- `src/` — hand-authored pages, CSS identity, site JS, vendored free bundles
- `content/docs/` — documentation markdown **synced from the package repo**
  (`bin/sync-docs.sh`), rendered at build time, never edited here
- `build.mjs` — renders docs into the shell template, copies static files to `dist/`
- `.github/workflows/deploy.yml` — builds and deploys to GitHub Pages on push

## Working on it

```bash
npm install
bin/sync-docs.sh     # pull docs + free bundles from ../splain (or SPLAIN_REPO=…)
npm run serve        # build + serve at http://localhost:8377
```

Content rules live in the package repo (`docs/website-brief.md`): the identity
tokens, the motion budget (reduced-motion honored, no idle drift), and the
honest-claims constraints every page must respect.
