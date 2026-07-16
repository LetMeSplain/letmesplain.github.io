<!-- synced from splain@78003f2 docs/schema.md — edit THERE, then re-run bin/sync-docs.sh -->

# The guide JSON, field by field

This is the reference for everything that can appear in a guide. For a gentle
start, read [authoring.md](authoring.md) first; to test what you wrote, see
[checking.md](checking.md).

Every field below is tagged one of two ways:

- **(playback)** — the helper engine acts on it. Get it wrong and users see it.
- **(notes)** — written for humans (and the AI that drafts guides): audit trail,
  caveats, reminders. Playback ignores it — along with any other key it doesn't
  recognize, so extra notes ride along harmlessly.

One safety promise up front: a malformed guide degrades to "this guide is
absent" on the page, never to an error on your app.

## The guide (top level)

```json
{
  "slug": "hr-approve-applicant-documents",
  "title": "Review & approve an applicant's documents",
  "genre": "walkthrough",
  "spans": [ ... ],
  "steps": [ ... ]
}
```

- `slug` *(required, playback)* — the guide's stable machine name, kebab-case.
  Completion tracking and draft-vs-published resolution key off it.
- `title` *(required, playback)* — the human line in the helper dot's menu.
- `genre` *(optional, playback, default `walkthrough`)* — `walkthrough` (do a
  real task) or `tour` (look around a page). Decides the menu grouping and the
  playback style. Tours only read each step's `key`, `title`, `instruction`,
  and `anchor` — none of the flow machinery below applies to them.
- `spans` *(required, playback)* — which pages (and code areas) the guide
  covers. See the next section.
- `steps` *(required, playback)* — the steps themselves.
- `workflow_summary` *(optional, notes)* — long prose describing the whole
  workflow as traced from the code. The Studio displays it; playback never does.
- `honest_limits` *(optional, notes)* — caveats the author couldn't verify;
  playback never shows it. A list of plain-language notes: what the author could
  not confirm, selectors that are guesses, behavior that depends on live data.
  Keep it; it is the guide's conscience.
- `schema_version` *(optional, notes)* — a format stamp in the fixture files
  (`1` today). Nothing reads it yet.

Two more fields live on the database row (the `splain_guides` table), not in
the JSON you write: `status` (`draft` or `published`, default `draft`) and
`version` (an integer, default 1, part of the completion-tracking key). Draft
guides are hidden from regular users by default (`serve_drafts` ships `false`);
gate-passers preview them in place. There is also a stored `pii_default` flag
on the row; nothing acts on it today.

## Spans: the pages a guide covers

A span names one place the guide touches:

```json
{ "resource": "SubmissionResource (Document Submissions review queue)",
  "role_in_workflow": "The review queue table ...",
  "route": "/hr/submissions" }
```

- `resource` *(required, playback)* — the span's name; the exact string steps
  point at via `span_ref`.
- `route` *(playback)* — the URL path of that page. A `{placeholder}` segment
  matches any single real value: `/hr/applicants/{record}` covers
  `/hr/applicants/7` but not the list page. Matching is exact-or-prefix on
  whole segments — `/hr/submissions` also covers `/hr/submissions/3/edit`,
  never `/hr/submissions-archive`.
- A span may have `"route": null` — that marks a service or background code
  area kept as context. **Steps must never attach to a route-less span**; the
  checker calls that an error because such steps can't play on any page.
- `role_in_workflow` *(optional, notes)* — what this piece does in the flow.

## Steps

`splain:check` only fails if `key`, `span_ref`, or `anchor` are missing; a useful
step also needs `order`, `title`, and `instruction` (they default to blank, which
plays but says nothing).

- `order` *(playback)* — display position, an integer. Steps play in ascending
  order; the checker warns unless the orders form a clean 1, 2, 3, … sequence.
- `kind` *(playback, default `instruction`)* — one of:
  - `instruction` — explain or point; the ordinary step.
  - `navigation` — "go to this page"; ends one page's portion and hands off to
    the next (see [playback.md](playback.md)). Requires `destination`.
  - `decision` — a real fork (Accept / Reject / Skip). Requires `options`.
- `key` *(required, playback)* — the step's stable name; must be unique in the
  guide. Everything that routes (`next`, option branches) points at keys.
- `title`, `instruction` *(playback)* — the helper bubble's heading and body.
- `span_ref` *(required, playback)* — the `resource` string of a **routed**
  span; it decides which page the step plays on.
- `anchor` *(required, playback)* — what gets spotlighted. Own section below.
- `playback` *(playback, default `direct`)* — `direct` (the anchor is on the
  page) or `open-modal-then-anchor` (the anchor only exists once a window the
  previous step opens is open; the engine waits for it to appear). A tour
  stops at the first step that isn't a direct instruction — the flow steps
  below belong to walkthroughs.
- `modal_scoped` *(optional, notes-ish)* — true when the step's screen is a
  modal. It is serialized, but the engine gates on `playback`, not this — a
  step can be modal-scoped yet play `direct` (its anchor, a row button, sits
  on the base page).
- `next` *(optional, playback)* — the key of the step that follows; absent
  means "next in display order". A `next` pointing at no step, at itself, or
  forming a loop is a checker error.
- `popover_side` *(optional, playback)* — pin the bubble to `top`, `right`,
  `bottom`, or `left` of the anchor, for when auto-placement would cover the
  control the user must reach. Anything else falls back to auto (checker
  warns).
- `destination` *(navigation steps, required, playback)* — the path the user
  should end up on, `{placeholder}`s allowed. If the user is already there,
  the step is skipped as already satisfied.
- `advance_on` *(optional, playback)* — turns the step into an **action step**:
  no Next button; the walkthrough advances when the user clicks this real
  control *and* the step's anchor then leaves the screen (a dialog that stays
  open failed validation — the user is still on the step). Shape mirrors an
  anchor: `{ "selector": "...", "fallback_selectors": [...] }`. Honest scope
  reminder: this is a **real click on live data** — nothing is simulated.
- `advance` *(optional, playback)* — only the value `"await-anchor"` means
  anything: it forces "wait for the next step's anchor to appear" on layered
  reveals the engine can't infer (a dropdown item that opens a modal).
- `needs_review` *(optional, notes + gate)* — a list of plain-language reasons
  a human still needs to verify this step on a live screen. Each reason is a
  checker warning, so `splain:check --strict` fails until someone resolves them.
  The free path is resolving each `needs_review` by hand and re-running
  `splain:check --strict`; the Studio's review queue (splain/pro, the separate
  proprietary package) is a convenience over that same discipline.
- `pii_risk` *(mixed)* — the step's sensitive-data record. Own section below.
- Everything else is **(notes)**: `screen` (which screen the step lives on),
  `status_effect` (what really changes in the database — shown to users only
  on decision *options*, see below), `confidence` / `confidence_reason`,
  `source_refs` (host files the claim was read from), `provenance`
  (`route`, `component_fqcn`, `symbols` — where in the code this came from),
  and any ad-hoc flags like `cross_resource_hop`.

## Anchors: pointing at the right thing

```json
"anchor": {
  "selector": "[data-splain=\"start-review\"]",
  "component_name": "the Start Review button",
  "fallback_selectors": ["[data-splain=\"row-review\"]"],
  "needs_injected_attr": true,
  "recommended_attr": "->extraAttributes(['data-splain' => 'start-review']) on the start_approval header Action"
}
```

- `selector` *(required, playback)* — machine code: the CSS selector of the
  element to spotlight. Free authors write these by hand (with `splain:introspect`
  and `splain:suggest` to surface the right markers); having the Studio pick them
  for you is a convenience in splain/pro (the separate proprietary package).
- `component_name` *(recommended, playback)* — the human name of that element
  ("the Start Review button"). The Studio shows this instead of the selector.
- `fallback_selectors` *(optional, playback)* — tried in order when the main
  selector matches nothing on the page.
- `component_type` *(notes)* — what sort of widget it is, for the reader.
- `needs_injected_attr` *(notes)* — true when the selector relies on a
  `data-splain` marker your app's code must carry for it to work.
- `recommended_attr` *(notes)* — the exact one-liner to paste into your app to
  add that marker.

**Naming `data-splain` markers:** kebab-case, `{thing}` or `{thing}-{role}` —
`start-review`, `doc-accept`, `branch-wallet-section`. Name the thing the way
a human would say it.

## Decision options

A `decision` step lists the real buttons the user can choose between:

```json
"options": [
  { "label": "Accept",
    "anchor": { "selector": "[data-splain=\"doc-accept\"]" },
    "status_effect": "IN_REVIEW -> ACCEPTED; reviewed_at=now; auto-advances",
    "next": "accept-all-gating" }
]
```

- `label` *(required, playback)* — the choice's name in the bubble.
- `anchor.selector` *(required, playback)* — the real button for that choice.
  An option without one is unusable; a decision with *no* usable options is a
  dead end (checker error).
- `status_effect` *(optional, playback)* — what really happens, in prose. The
  bubble shows just the first clause, arrow prettified: "IN_REVIEW → ACCEPTED".
  Effects starting with "none" show nothing.
- `next` *(optional, playback)* — where that branch goes. Leave it off and the
  branch falls through to whatever step happens to follow — usually wrong, so
  the checker warns.

## `pii_risk`: flagging sensitive data

```json
"pii_risk": {
  "renders_pii": true,
  "types": ["name"],
  "mask_target": "The Submitted By and Reviewed By columns",
  "mask_selectors": [
    { "selector": ".fi-table-cell-submitter\\.name", "mode": "blur" }
  ]
}
```

- `renders_pii`, `types`, `mask_target`, `note` *(notes)* — the human record of
  what sensitive data the step shows and what should be hidden.
- `mask_selectors` *(playback)* — the machine-actionable part: regions Privacy
  Mode blurs (`"mode": "blur"`, for text) or covers opaquely (`"block"`, for
  document scans and images). An unknown mode degrades to blur — a typo must
  never mean "shown in the clear" — and when two guides mask the same region,
  block beats blur. Masks from **every** step of every guide covering the page
  apply for the whole browser-tab session while the toggle is on, so a
  recording has no gaps between steps. Flagging `renders_pii` without any
  `mask_selectors` earns a checker warning: Privacy Mode can't act on prose.

Honest scope, verbatim in spirit from [privacy-mode.md](privacy-mode.md):
Privacy Mode is a demo and screen-recording aid, **not** a security control.
The data stays in the page; masking is purely visual.
