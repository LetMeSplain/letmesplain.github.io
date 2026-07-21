<!-- synced from splain@a738cf8 docs/devlog.md — edit THERE, then re-run bin/sync-docs.sh -->

# Development log

A dated, newest-first record of what's changing in Splain and why. For the full
capability picture — grouped by *what exists* rather than *when it landed* — see the
[Changelog](changelog.md). This log is the running "what changed when," and it's shaped
to become the versioned release notes once Splain tags its first release.

Splain is pre-release: nothing is tagged yet, so these are development milestones, not
versions. Entries use the usual **Added / Changed / Fixed** shape.

## 2026-07

### Added
- **Reveal-driven anchoring.** A step whose target lives behind a tab, a row/action
  dropdown, or a modal can list the trigger(s) to open first (`reveal`); the engine
  clicks its way in before spotlighting. It handles server-rendered (Livewire) tabs,
  client-side (Alpine `x-show`) tabs, teleported dropdowns, and modals, nesting
  included.
- **Idempotent reveal chains.** A trigger is skipped when what it would open is already
  on screen, so a chain through an already-open menu is never toggled shut — the same
  guide plays whether the panel arrives open or closed.
- **Actionable drift hint for dynamic anchors.** When a `data-splain` marker is emitted
  by interpolation, a source scan can't confirm it; `splain:check --drift` now stays
  strict but points the author at the fix — declare the literal in the array feeding the
  template — instead of a misleading "rotted."

### Changed
- **Authoring guidance** now recommends reveal-driven `direct` steps over
  `advance: await-anchor` gates for dropdown and modal anchors. The gate pattern stays
  for genuine learn-by-doing steps, but it must not be the only thing responsible for
  opening a panel, or the step can stall waiting on a menu nothing opened.

### Fixed
- **Spotlight surviving re-renders.** A Livewire re-render (a poll, an event, a
  websocket reconnect) strips driver.js's runtime highlight decoration, which could make
  a guide silently go dark mid-step. Tours now re-assert the current step's highlight
  after a morph — walkthroughs already did — so playback holds on a re-rendering page.

## Earlier

Development before this log started is captured in the [Changelog](changelog.md)'s
capability sections: the playback engine, the "can't silently rot" drift gate, tracks &
progress, introspection & generation, and the Filament v3/v4 support matrix.
