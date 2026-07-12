# The Splain manual

Splain is a self-hosted Laravel / Filament plugin for guided, in-app walkthroughs —
spotlights over your real UI, anchored to your code, checked before anything ships.
This manual is the same documentation that ships inside the package.

**New here? Read in this order:**

1. [Installation](installation.md) — composer, migrations, the plugin line, and
   `splain:doctor` to verify the wiring.
2. [Playback](playback.md) — what your users see: the dot, the launcher, spotlights,
   decisions, cross-page hand-offs.
3. [Authoring guides](authoring.md) — how guides are written, and the one trap that
   matters most: describing the workflow that's *really* used, not just what the
   interface allows.
4. [splain:check](checking.md) — the validator that replays every guide before it
   ships, and fails loudly instead of letting guidance rot.

**Then, as you need them:**

- [Privacy Mode](privacy-mode.md) — blur and cover flagged regions for demos and
  screen recordings. A presentation aid, not a security control.
- [The Studio](studio.md) — the visual editor: design mode on the live page, review
  flags, and the attested publishing gate.
- [Tracks & progress](progress.md) — onboarding checklists and (off by default)
  server-side completion recording. Pointer, never a copy of personal data.
- [Generation](generation.md) — drafting guides with a model **you** configure.
  Splain ships no key and no default endpoint.
- [Adapters](adapters.md) — Filament is the first-class adapter; the standalone
  adapter runs the same engine anywhere.
- [CI & the drift gate](ci.md) — guides-as-code, and the build gate that fails when
  code deletes an anchor a guide depends on.
- [Guide schema](schema.md) — the full JSON reference.

> **Release status:** Splain is not on Packagist yet — the license is being
> finalized. These docs describe shipped, tested behavior; install today is via a
> private repository for early-access hosts.
