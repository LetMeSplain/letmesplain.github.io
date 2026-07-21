<!-- synced from splain@a738cf8 docs/checking.md — edit THERE, then re-run bin/sync-docs.sh -->

# Checking guides (`splain:check`)

`splain:check` is your reviewer. It reads a guide, simulates playing it on every
page the guide covers, and tells you in plain language what would break — before
a real user finds out. If you hand-author guides (see [authoring.md](authoring.md)),
run it every time you save.

## How to run it

```bash
php artisan splain:check path/to/my-guide.json    # check one or more JSON files
php artisan splain:check                          # no paths = check every guide in the database
php artisan splain:check --strict                 # also fail on warnings (see below)
```

With file paths, each line of output is prefixed with the filename. With no
paths, it walks the `splain_guides` table instead and prefixes each line with
the guide's slug, version, and status — `my-guide v2 (draft)`. A file that
can't be opened or isn't valid JSON reports `unreadable or invalid JSON` and
counts as a failure.

A clean guide prints one line:

```
INFO  splain-studio-hub-tour.v1.json: OK
```

## Errors vs warnings, and what `--strict` means

- **Errors** mean the guide will not play right: dead ends, steps that can
  never appear, a Next button that does nothing. Errors always make the
  command fail (exit code 1).
- **Warnings** mean the guide plays, but a human owes it attention: a step
  flagged for review, a value that silently falls back to a default. Warnings
  alone still exit 0 — *unless* you pass `--strict`.

`--strict` is a free CI gate. Run it in CI or before you publish: nothing
with an outstanding review flag or silent-fallback reliance gets through. This
matters most on production hosts that set `splain.playback.serve_drafts` to
`false` — passing `splain:check --strict` is the "this guide was reviewed"
signal. (It gates *toward* publish; the governed named-human attested publish it
gates toward is a splain/pro feature — the separate proprietary package. Free
publishing is the plain draft→published status flip.)

A run against a guide that still carries a couple of open review flags:

```bash
php artisan splain:check path/to/your-guide.json
# WARN  ... step confirm-readiness: needs review — Branch-flow-ENABLED rendering unverified: ...
# WARN  ... step confirm-activation: needs review — Post-confirm transition unverified: ...
# exit 0 — it plays, but two steps still await a human

php artisan splain:check path/to/your-guide.json --strict
# same two warnings, exit 1 — not publishable until someone reviews those steps
```

## Every error, in plain language

Messages below show `X`, `Y`, `/route` where your step keys and paths appear.

### Structure

| Message | What it means, how to fix it |
|---|---|
| `unreadable or invalid JSON` | The file can't be opened or parsed. Check the path; run the file through a JSON checker (a trailing comma is the usual culprit). |
| `steps: guide has no usable steps` | The `steps` list is missing or empty. There is nothing to play; checking stops here. |
| `steps: contains entries that are not objects` | Something in the `steps` list isn't a step (a stray string or number). Remove it. |
| `steps[3]: missing key` | The step at that position (counting from 0) has no `key`. Every step needs one — it's the stable name other steps point at. |
| `step X: duplicate key` | Two steps share the same `key`, so anything pointing at it is ambiguous. Rename one. |
| `step X: span_ref does not resolve to a routed span — the step can never play on any page` | The step's `span_ref` doesn't name any span that has a `route`. Either the string doesn't exactly match a span's `resource`, or it names a route-less service/background span. Point it at a routed span — a page the user can stand on. |

### Anchors and selectors

| Message | What it means, how to fix it |
|---|---|
| `step X: anchor has no selector` | The step doesn't say what to spotlight on the page. Add `anchor.selector` — [authoring.md](authoring.md) shows how to pick one that won't break. |
| `step X: advance_on has no selector` | The step is supposed to advance when the user clicks something real, but doesn't say what. Splain can't watch for the click, so the user's *successful* action would end the guide as a wrong turn. Add the selector or delete `advance_on`. |
| `step X: navigation step has no destination` | A `"kind": "navigation"` step (the "continue on page X" hand-off) must say which path it leads to. Add `destination`. |

### Step-to-step routing

Steps flow in display order unless a step's `next` names the one that follows.
Decision steps route through each option's own `next`.

| Message | What it means, how to fix it |
|---|---|
| `step X: next edge "Y" resolves to no step` | `next` names a key that doesn't exist. At play time Splain would silently ignore it and follow display order instead — fix the key. |
| `step X: next edge points at itself` | The step is its own successor: an infinite loop. |
| `step X: decision has no usable options` | A decision step is a question — with no clickable answers it's a dead end (no Next button, nothing to click). Give each option an anchor with a selector. |
| `step X: decision has options with empty anchors` | Some options work, but the listed ones have no selector, so those choices can't be watched. |
| `step X: option "Y" routes to no step` | That option's `next` names a missing key. |
| `step X: next edges form a cycle — the walkthrough can never finish` | Following the steps from X eventually returns to a step already visited. The user would press Next forever. Break the loop. |

### Page coverage (walkthroughs only)

The checker splits the guide into per-page **segments** — the slice of steps
that actually plays on each page a span covers — using the exact same rules
the runtime uses. These errors catch what used to take a human playing the
guide to notice. Tours skip this section: they play as one straight sequence,
not per-page segments.

| Message | What it means, how to fix it |
|---|---|
| `step X: unreachable — no page's segment ever serves it (check its span_ref and the span's route)` | No page ever shows this step. It usually arrives alongside another error that names the cause — a `span_ref` that doesn't resolve (see Structure above) or a missing anchor selector. Fix that one and this clears. |
| `segment for /route: navigation step "X" sits mid-segment — the steps after it on this page can never play` | A hand-off to another page sits *before* other steps on the same page. Playback stops at the hand-off; everything after it is stranded. Reorder so navigation comes last on its page. |
| `segment for /route: step "X" has next "Y" outside its own segment — playback falls back to display order here` | A mid-page step jumps to a step on a different page. Inside one page, `next` must resolve locally; cross-page moves go through a navigation hand-off. |
| `segment for /route: hand-off "X" points at /a, but the next step "Y" lives on /b — the resumed page would have nothing to continue` | The navigation step's `destination` doesn't match the page where the guide actually continues. The user would land somewhere with nothing to resume. Fix the destination or the next step's span. |
| `segment for /route ends at step "X" but the guide continues — playback would mark the guide done early; bridge to the next page with a navigation step` | This page's last step isn't the guide's true end, and there's no hand-off. Playback would declare the whole guide finished partway through. Add a `"kind": "navigation"` step (see [authoring.md](authoring.md), "When guides span pages"). |

## Every warning, in plain language

| Message | What it means, how to fix it |
|---|---|
| `steps: display orders are not a contiguous 1..N sequence` | The `order` values skip, repeat, or are missing. Wherever `next` doesn't decide, steps sort by these numbers — gaps make the sequence fragile. Renumber 1, 2, 3… |
| `step X: option "Y" has no next edge and will route by display order` | Picking that answer lands on whatever step happens to come next in display order — usually the first step of one *specific* branch. If that's intended, fine; adding a `next` makes it deliberate. |
| `step X: popover_side "Z" is not top/right/bottom/left and will be ignored` | The helper bubble's placement hint is misspelled, so playback falls back to automatic placement — which may re-cover the very control you were steering it away from. |
| `step X: renders_pii with no machine-actionable mask_selectors — Privacy Mode cannot cover this step's regions` | The step says it shows sensitive data, but gives Privacy Mode no selectors to blur or cover. The prose description helps a human; the machine needs `mask_selectors`. |
| `step X: mask_selectors[0] mode "Z" is not blur/block and will degrade to blur` | Each mask's `mode` must be `blur` or `block`; anything else silently becomes `blur`. |
| `step X: needs review — <reason>` | Someone flagged this step for a human look; the reason prints verbatim. Verify the step actually works, then delete that entry from the step's `needs_review` list. These are exactly what `--strict` exists to catch. |

Two mask problems are **errors**, not warnings, because they leave sensitive
regions uncovered:

| Message | What it means, how to fix it |
|---|---|
| `step X: mask_selectors[0] has no selector` | A mask entry with nothing to point at. Give it a selector or remove it. |
| `step X: mask_selectors[0] contains characters that cannot appear in a CSS selector` | The selector contains `{ } @ < >` or comment markers, which could break out of the stylesheet Privacy Mode generates — so the engine skips the entry and that region renders *in the clear*. Rewrite the selector with plain CSS. |

One honest note on masks: Privacy Mode is a demo and screen-recording aid, not
a security control. Masked data is hidden visually but remains in the page.

## When you're done

Zero errors means the guide plays. Zero warnings under `--strict` means it's
reviewed and ready to publish — in the free package, flip its status from draft
to published (the named-human attested sign-off is a splain/pro feature, the
separate proprietary package). Then seed it into the `splain_guides` table and the
helper dot appears on the pages it covers.
