<!-- synced from splain@6961e15 docs/adapters.md — edit THERE, then re-run bin/sync-docs.sh -->

# Splain adapters — architecture & expansion

Splain is built as a **framework-agnostic engine with thin adapters**, so it can
grow from "Filament plugin" to "guidance for anything a Laravel shop ships" without
rewriting the hard part. This doc is the contract an adapter must satisfy and the
roadmap for the adapters we want.

## The shape: one engine, many adapters

```
                        ┌───────────────────────────────────────────┐
                        │  THE ENGINE  (resources/js/*.ts, pure TS)  │
                        │  driver.js spotlight · flow DAG · privacy  │
                        │  knows NOTHING about Filament/Tailwind/    │
                        │  any host design system (splain.ts:84)     │
                        └───────────────────────────────────────────┘
                             ▲ reads a documented page contract ▲
        ┌────────────────────┼─────────────────────┬────────────────────┐
   ┌────┴─────┐        ┌─────┴──────┐        ┌──────┴─────┐        ┌─────┴──────┐
   │ Filament │        │ pure-TS /  │        │  Livewire  │        │  Inertia / │
   │ v3 (shipped)      │ standalone │        │ (no Filament)       │  Vue/Blade │
   └──────────┘        └────────────┘        └────────────┘        └────────────┘
     each adapter only has to: put the payload on the page · render the launcher ·
                    deliver the assets · signal SPA navigation
```

The engine is already the framework-agnostic core the design intended — its own
header says it "knows NOTHING about Filament, Tailwind or any host design system."
An adapter is deliberately small.

## The adapter contract (what any adapter must provide)

**1. The payload** — a single script tag the engine reads (`readPayload()`):

```html
<script type="application/json" data-splain-payload>
  { "guides": [ … ], "masks": [ … ], "ui": { … } }
</script>
```

The shape is the guide serialization documented in [schema.md](schema.md) /
[playback.md](playback.md). How you produce it is the adapter's business — the
Filament adapter is a Livewire component (`SplainPlayback::payload()`); a pure-TS
adapter could fetch it from a JSON endpoint or inline it server-side.

**2. The launcher DOM** — the helper dot and its panel, marked with the contract
attributes the engine wires behaviour onto (`[data-splain-dot]`,
`[data-splain-panel]`, per-guide `[data-splain-guide]`, the privacy toggle
`[data-splain-privacy]`). The engine styles nothing — the adapter renders these in
the host's own design system (the Filament adapter wears Filament's compiled CSS).

**3. Asset delivery** — serve `splain.js` + `splain.css`. Filament uses
`FilamentAsset`; another adapter can ship a Vite entry or a plain `<script>`.

**4. The SPA navigation signal** — the engine's only lifecycle coupling, and it is
**framework-neutral**. It binds two abstract signals:

| Signal | Meaning | Default binding |
|---|---|---|
| navigating | SPA is leaving the page → tear down an active walkthrough | `livewire:navigating` |
| navigated | SPA arrived on a new page → boot | `livewire:navigated` |

Livewire's events are wired by default (Filament needs zero setup). **Any
non-Livewire adapter drives the identical lifecycle by dispatching the
framework-neutral events instead:**

```js
document.dispatchEvent(new Event('splain:navigating')); // before your SPA swaps the DOM
document.dispatchEvent(new Event('splain:navigated'));   // after it settles
```

That is the whole seam. A static (non-SPA) site needs neither — the engine also
boots on load.

## Roadmap

| Adapter | Status | Notes |
|---|---|---|
| **Filament v3** | shipped | the reference adapter; playback + Studio |
| **Filament v4** | **shipped + verified (playback AND Studio hub)** | Constraint `^3.2 \|\| ^4.0`, CI runs the full suite on BOTH majors. Verified on a fresh Laravel 13 + Filament v4.11 app: install, all splain:* commands, in-browser playback, and the FULL Studio hub (guide inventory, track builder with ordered-guides repeater + assignment manager, onboarding report). The hub is version-split — `SplainStudioHubV3`/`V4` roots outside composer's autoload (a runtime prefix autoloader in StudioServiceProvider), selected by installed major in StudioPlugin — because v4's Schema unification made v3's `form(Form)`/`infolist(Infolist)` signatures unloadable under v4 and vice versa. Proving ground: `~/projects/splain-v4-test`. |
| **Filament v5** | not yet | exists (5.x); deliberately outside the constraint until v4 is fully served. |
| **pure TypeScript / standalone** | **shipped (v0.1, reference)** | Splain with no Filament and no PHP: `resources/dist/standalone.js` renders the launcher/checklist chrome (neutral skin) from a payload object and boots the engine. **Browser-verified end-to-end** (launcher, checklist, tour, walkthrough spotlight, and decision branching) on a plain HTML page with `window.Livewire`/`window.filament` both `undefined`. See below + `examples/standalone/`. The Studio (authoring) stays a separate Laravel-side concern. |
| **Livewire without Filament** | designed | same engine; the adapter renders the launcher in the host's own Blade/Livewire components. Livewire events already drive it. |
| **Inertia / Vue, plain Blade** | designed | dispatch `splain:navigated` from the router's after-navigate hook; render the launcher as a Vue component / Blade partial. |

**Guiding principle:** keep **Laravel at the core** first — it's where the
depth and the daily proving happens — but design every seam so that *anything* a Laravel shop
puts in front of their app can eventually get in-perimeter, code-anchored guidance.
The goal is to add to Laravel's industry strength, not to fork away from it.

**YAGNI guard:** we do **not** build speculative adapters before there's a real
consumer. What we do now is keep the seam clean and documented (this file) and
never let a new feature re-couple the engine to Livewire/Filament specifics — the
navigation signal above is the model: bind the framework's event, but always behind
a framework-neutral one.

## Standalone adapter (non-Filament) — usage

Ship two files — the engine and the standalone adapter — then hand it a payload:

```html
<link rel="stylesheet" href="/path/to/splain.css">      <!-- driver.js theme + popovers -->
<script src="/path/to/splain.js"></script>              <!-- the engine (framework-agnostic) -->
<script src="/path/to/standalone.js"></script>          <!-- the neutral-skin adapter -->
<script>
  SplainStandalone.mount({
    guides: [{ slug, title, genre: 'walkthrough'|'tour', version, steps: [...] }],
    tracks: [{ slug, title, guides: [{ slug, title, version, url }] }],   // optional checklist
    progress: { enabled: false },                                          // optional
  });
</script>
```

`mount(payload, { root?, skin? })` renders the dot + launcher (its own neutral,
`prefers-color-scheme`-aware skin — pass `skin: false` to supply your own CSS),
injects the payload script, and boots the engine. For an SPA, call `mount()` again
after a route change (it replaces the prior chrome) and/or dispatch `splain:navigated`.
`steps` are the same shape the Filament serializer emits (see `docs/generation-design.md`
and the payload snapshot); a server or a static build produces the payload however it
likes — the adapter only cares about the shape.

**What's proven vs. what a first adopter hardens:** the *engine* is the same core the
production-shaped Filament proving host exercises daily — playback, decisions, advance-on, cross-page hand-off
all shared. The standalone *adapter* is a thin (~4.5kb) chrome renderer, hermetically
tested (`resources/js/standalone.test.ts`) and browser-verified via `examples/standalone/`.
What it hasn't had is a real third-party SPA with real content and users — that's a
first-adopter milestone, and shipping this as a reference adapter is how you attract one.
Run the harness locally: serve the repo root and open `examples/standalone/index.html`.
