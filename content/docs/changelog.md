<!-- synced from splain@78e9916 CHANGELOG.md — edit THERE, then re-run bin/sync-docs.sh -->

# Changelog

Splain is **pre-release**: nothing has been tagged, so everything lives under
Unreleased. Entries are grouped by capability rather than date — the goal is that a
newcomer can read this top to bottom and know what exists and how proven it is.
(Suites at last update: package Pest 133+ · vitest 49 · browser e2e 38 · host
integration 20+ — all run by CI on every push, across PHP 8.3/8.4 × Filament v3/v4.)

## [Unreleased]

### Playback (free)
- The overlay engine: driver.js spotlight walkthroughs and page tours over the host's
  real UI — decision branches, modal-scoped steps, completion controls (`advance_on`),
  cross-page hand-off with resume, and a diagnosability ring buffer
  (`window.Splain.log`).
- Host-native skin: the launcher and popovers wear the host app's own Filament
  classes and palette (verified on three different design systems).
- Privacy Mode: blur/block masks for demos and screen recordings — explicitly a
  presentation aid, not a security control.
- Framework-agnostic core proven: the engine runs with zero Filament/Livewire via the
  standalone adapter (`SplainStandalone.mount`), browser-verified incl. decision
  branching (`examples/standalone/`).
- Filament v3 **and** v4 support; the CI matrix proves both majors on every push.

### Authoring & trust (free core, Studio pro)
- Guides are JSON with a validator (`ValidateGuide`) shared by CLI, Studio, and
  playback — what the checker validates is literally what plays (`GuideSegments`).
- `splain:check` — structural validation + review debt; `--strict` gates on warnings.
- `splain:check --drift` — the "can't silently rot" CI gate: fails the build when a
  code change deletes/renames a `data-splain` marker any guide depends on (all
  selector sites, compound selectors included). Recipe + GitHub Action in
  `docs/ci.md` / `examples/ci/`.
- Guides-as-code round trip: `splain:export` (canonical, byte-stable on any DB) and
  `splain:import` (validates, lands drafts, never demotes a published guide).
- The Studio (pro): guide inventory with live check results, on-page design mode,
  review inbox, and a publish gate requiring zero errors, zero open flags, and a
  named human sign-off. The attestation affirms **workflow truth** — "how this task
  is really done here, not just a path the interface allows."

### Onboarding tracks & progress
- Tracks: ordered guide paths (free data + learner checklist with next-step);
  server-side progress: durable cross-device completion, **off by default**, storing
  a pointer to the host's user — never a copy of PII, no sync timestamps.
- Pro: visual track builder, assignment, and the onboarding completion report
  (aggregate by default; per-person double-gated — employee-monitoring caution).
- Erasure + retention commands (`splain:progress:forget` / `:prune`).
- Offline-safe recording: completions drop a pending marker until the server
  confirms persistence; unconfirmed ones re-sync on a later visit as dateless
  self-attested rows (never forged timestamps) — a network blip can't silently
  diverge the learner's ✓ from the admin report.

### Introspection & generation
- `splain:introspect` — leak-safe, source-text-only reading of the host's surfaces:
  routes, stable anchors, columns, fields, actions, confirmation flows (follows
  `table()`/`form()` delegation).
- `splain:suggest` — deterministic coverage-gap report: which pages have no guide,
  ranked by transparent code-derived signals.
- Generation (pro, **bring-your-own model**): `splain:generate` runs the host's model
  through a validator-in-the-loop and a mechanical anchor flagger; drafts land
  unpublished with `needs_review` flags. Reference OpenAI-compatible adapter binds
  only when the host configures endpoint+key+model (fully-local endpoints supported);
  Splain ships no key and no default endpoint.

### Developer experience
- `splain:doctor` — one-shot install diagnostics (tables, asset freshness, panel
  registration, guide health, config warnings) with deploy-safe exit codes.
- Strict-CSP support: nonce propagation across every emitted/injected element
  (Laravel `Vite::useCspNonce()` picked up automatically), proven by a CI harness.
- RTL hosts: the launcher chrome anchors with logical properties and mirrors
  cleanly under `dir="rtl"` (browser-verified on all three engines).
- Static analysis in CI: Larastan (level 6) + `tsc --noEmit`; browser e2e across
  chromium, mobile-chromium (touch), and webkit, incl. an axe-core WCAG AA audit.

### Engineering
- Arch fences (Pest): the core is framework-agnostic; nothing outside the Studio /
  Generation / version-split hub namespaces may import them — the commercial boundary
  is enforced as architecture.
- Version-split Studio hub (`hub/v3`, `hub/v4`) loaded by a runtime autoloader so one
  package serves both Filament majors.
- CI: PHP 8.3/8.4 × Filament ^3.2/^4.0 matrix + Pint + esbuild + vitest + headless
  Playwright e2e.
- Workbench: a package-owned runnable Filament host (`bin/serve-workbench.sh`) that
  CI drives end-to-end — the real playback card and the Studio design-mode
  edit→save→persist loop against live Livewire. Its first boot caught two shipped
  bugs no other harness could see.
- Bundle-size budgets (`npm run budget`, chained onto every build): the free
  playback payload stays ~12 KB gzipped over the wire.
- Four proving grounds: a production-shaped host (Filament v3 + MySQL), a virgin
  v3 app, a virgin v4 app, and the CI-driven workbench.

### Known limits (honest scope)
- No public tag, no Packagist, no license chosen yet (`LICENSE.md`).
- Filament v5 exists and is deliberately outside the supported constraint for now.
- Drift-checking verifies literal markers only (interpolated markers documented).
- No third-party production adopter yet — the fresh-app installs are the closest proxy.
