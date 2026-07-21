<!-- synced from splain@a738cf8 docs/authoring.md — edit THERE, then re-run bin/sync-docs.sh -->

# Hand-authoring guides (no Studio required)

Splain guides are JSON. The Studio makes refining them visual, but nothing about
authoring requires it — this page is the whole manual for doing it by hand.

## The most important rule: describe the *real* workflow, not the UI's affordances

The app's buttons show what's *possible*. A guide has to describe what's *actually done*
— and those aren't always the same thing. This is the one mistake `splain:check` can't
catch for you, because it's about your business, not your code.

The classic trap: a resource (in Filament, the pages that create/list/edit one kind
of record, e.g. Employees) has a **Create** button, so it's natural to write *"click
New Employee to add an employee."* The button works — but if employees really arrive
through a hiring and onboarding pipeline, that guide is confidently teaching a workflow
that doesn't exist. It plays perfectly and misleads every user.

`splain:check` proves a guide is well-formed and that its anchors resolve; it cannot
know whether the steps match how your team actually works — only a person who knows the
process can. So before you publish, ask of every step: *is this how the task is really
done here, or just a path the interface allows?* Reviewing your drafts before use
is free — a guide's draft/published status controls visibility, and you preview
through the gate. (Attested publish — before a guide goes live, Splain requires a
named person to sign off that it reflects how the work is really done — is a
splain/pro feature, a separate, proprietary package.) Either way, hold yourself
to that question.

The trap is sharpest for AI-drafted guides (Splain can generate first drafts from your
code — see [generation.md](generation.md)): a model reads the Create button with zero
business context and writes the fiction with total confidence. That's why generated
guides land as drafts you must review before use — the human gate is the only thing
that catches a plausible-but-wrong workflow. (The named-human attested sign-off that
formalizes that gate lives in splain/pro, the separate proprietary package.)

## The minimal guide

A span is Splain's word for one page (or code area) a guide covers. A playable guide
needs a slug, a title, one span, and steps. A playable **step** needs only what you
see here:

```json
{
  "slug": "my-first-guide",
  "title": "How to review a widget",
  "genre": "walkthrough",
  "spans": [
    { "resource": "The widgets page", "route": "/admin/widgets" }
  ],
  "steps": [
    {
      "order": 1,
      "kind": "instruction",
      "key": "find-the-table",
      "title": "This is your widget list",
      "instruction": "Every widget you can review appears here.",
      "span_ref": "The widgets page",
      "anchor": { "selector": ".fi-ta", "component_name": "the widgets table" }
    }
  ]
}
```

That's it. `order` is display position; `key` is the stable name other steps point
at; `span_ref` names which span (page) the step plays on; `anchor.selector` is what
gets spotlighted (Splain dims the page and cuts a lit hole around the element it
points at), and `component_name` is what humans call it. Everything else in
the schema — decision options, popover sides, action steps, privacy masks, review
flags — is **optional enrichment**; add it when you need it, never before.

## Formatting the instruction text

`instruction` (and only `instruction` — titles and labels stay plain) understands a
small, safe Markdown subset, so a longer step reads like a scannable note instead of
one wall of text:

- `**bold**` — the word the eye should land on
- `` `code` `` — a command, class, or column name
- a line starting with `- ` (or `* `) becomes a bullet; consecutive ones become a list
- a single newline is a line break; a blank line is a paragraph gap

Everything else is shown literally. The text is HTML-escaped **before** any of that is
applied, so anything resembling a tag (`<script>`, `<img …>`) renders as plain
characters, never markup — a guide can't inject anything into the host page. Keep it
tight: a sentence or two plus a short list is the sweet spot.

## Anchors: how to pick a selector without pain

Best: add a marker to your own Blade (Laravel's HTML templating) or Filament code and
point at it —

```php
->extraAttributes(['data-splain' => 'widget-approve'])   // on the component
```
```json
"anchor": { "selector": "[data-splain=\"widget-approve\"]", "component_name": "the Approve button" }
```

Naming the marker: kebab-case, `{thing}` or `{thing}-{role}` — `widget-approve`,
`report-row-actions`, `billing-section`. Name the thing a human would name.

Second-best: a stable structural class (`.fi-ta` is the page's table). Avoid ids
that look generated, and avoid anything positional if you can.

## Anchors behind a click: tabs, dropdowns, and modals

Some of the best anchors don't exist in the page until something is opened — a tab
panel, a row's actions (⋯) menu, a modal. Point a step at one directly and it can't
spotlight what isn't there yet. Give the step a `reveal` list of the trigger(s) to
open first, and Splain clicks its way in before anchoring:

```json
{
  "key": "log-a-touch",
  "kind": "instruction",
  "title": "Log the call here",
  "instruction": "Open the row's **actions** menu and choose **Log Call**.",
  "span_ref": "The contacts page",
  "anchor": { "selector": "[data-splain=\"contact-log-item\"]", "component_name": "the Log Call item" },
  "reveal": ["[data-splain=\"contact-row-actions\"]"]
}
```

`reveal` is an ordered list — each selector is clicked (and waited for) before the
next, so a target nested one more level deep (a modal opened *from* a menu item) lists
both: `["[data-splain=\"contact-row-actions\"]", "[data-splain=\"contact-log-item\"]"]`.
It handles server-rendered (Livewire) tabs, client-side (Alpine `x-show`) tabs,
teleported dropdowns, and modals alike, and the chain is idempotent — a panel that's
already open is skipped, not toggled shut. (`reveal` is a walkthrough feature; keep the
guide's `genre` as `walkthrough`.)

A **default-open** tab still deserves its own `reveal`: "which tab is active" is only
true at first paint, and a user who arrives on a different tab would otherwise land on
a missing anchor. The reveal is a no-op when the tab is already showing — free insurance.

## Anchoring looped UI: declare the marker, emit it dynamically

Tabs and table rows tempt a DRY shortcut — interpolate the marker in the loop:

```blade
<div data-splain="settings-tab-{{ $tab['key'] }}">…</div>   {{-- can't be drift-checked --}}
```

The catch: `splain:check --drift` scans your **source**, and a value with `{{ … }}` in
it is a runtime name — it can't resolve to `settings-tab-billing`, so it can't prove
that anchor exists. Declare the literal in the array that feeds the template, then emit
it — DRY loop, real literal the gate can grip:

```php
['key' => 'billing', 'label' => 'Billing', 'data-splain' => 'settings-tab-billing'],
```
```blade
<div data-splain="{{ $tab['data-splain'] }}">…</div>
```

If a marker is only ever emitted dynamically, `--drift` fails with a hint pointing you
right here rather than a bare "rotted."

## Check yourself

```bash
php artisan splain:check path/to/my-first-guide.json     # structure + coverage
php artisan splain:check --strict                        # the publish bar
```

The checker simulates playback on every page your spans cover and tells you in
plain language what would break: unreachable steps, a segment that would end the
guide early, a selector that can't work. Zero errors = it plays. Seed it into the
`splain_guides` table (or use your app's seeder) and the helper dot appears on the
covered pages.

## When guides span pages

End a page's portion with a `"kind": "navigation"` step whose `destination` is the
next page's path and whose anchor is the link users actually click — Splain hands
the walkthrough off and resumes it over there. The checker will tell you if you
forgot the bridge.

## Grounding: `splain:introspect`

Writing a span route or an anchor by hand is where mistakes creep in (a wrong
route is why a guide once played only part-way). `splain:introspect` reads your
Filament app and prints, per resource, the exact **span routes** and the stable
**`data-splain` anchors** already wired into it — deterministically, reading only
class metadata, the route table, and source text (never a database row).

```bash
php artisan splain:introspect documents        # one resource
php artisan splain:introspect --json            # machine-readable, all resources
```

Copy the routes into your guide's `spans`, and anchor steps to the listed
selectors. If a resource has no markers yet, that's your cue to add
`->extraAttributes(['data-splain' => '…'])` (see the naming grammar above) — the
primary, free way to author. (Design mode's element picker, which writes the same
`data-splain` markers for you, is part of the Studio in splain/pro, the separate
proprietary package.)

## Finding what to write next: `splain:suggest`

`splain:introspect` tells you about one resource; `splain:suggest` tells you which
resources have **no guide at all** — the deterministic answer to "what should we
cover next," read from the code with no LLM and no user surveys.

```bash
php artisan splain:suggest                 # every uncovered page, ranked
php artisan splain:suggest --panel=hr --limit=10
php artisan splain:suggest --json          # machine-readable, for a script
```

"Covered" means a guide actually *plays* on the page (the same segmentation
`splain:check` and playback use), not merely that a span mentions the route. Gaps
are ranked by a transparent heuristic — a confirmation/destructive action, then a
form, then how much anchored surface exists — but the only hard fact is the gap
itself; the ordering is a hint, and every signal is shown so you judge.
