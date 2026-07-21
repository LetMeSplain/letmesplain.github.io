<!-- synced from splain@a738cf8 docs/studio.md — edit THERE, then re-run bin/sync-docs.sh -->

# The Studio

> **The Studio ships in `splain/pro`** — a separate, proprietary package (`composer
> require splain/pro`). The free package (`splain/splain`, Apache-2.0) is the playback
> engine: it serves published guides and runs the launcher dot. The Studio is the paid
> layer on top — the on-page visual editor, the hub, and the governed attested-publish
> gate. Everything below describes that Pro layer unless noted otherwise.

Splain shows your users interactive on-screen walkthroughs of your app; a guide is one
such walkthrough. The Studio is Splain's built-in visual, point-and-click editor for
creating and editing those guides inside your app (a Pro feature).

The Studio is where a human refines what the AI drafted. It has two surfaces with
one rule between them: **the hub is for the overall; the page is for the particular** —
i.e. the hub manages all your guides; design mode edits a single step on the actual page.

- **The hub** — a "Guides" section inside one Filament panel of your choosing.
  See every guide, its health, and the AI's open questions; publish when clean.
- **Design mode** — a side panel on the live page itself. Fix a helper bubble's
  wording, position, or highlight while looking at the real screen.

Both are gated — see [Who's allowed](#whos-allowed-the-gates) below and
[installation.md](installation.md) for setup.

## Turning it on

```php
->plugins([SplainPlugin::make(), StudioPlugin::make()->hub()])
```

`StudioPlugin` on a panel gives editors design mode on that panel's pages.
`->hub()` additionally mounts the hub there — put it on ONE panel (your admin
panel, typically). Ordinary users never see either: the Studio's script is never
even referenced in their HTML.

## The hub

Look for **Splain Studio → Guides** in the panel navigation. The list shows, per
guide: title, genre, draft/published status, version, which pages it covers, and
two live badges:

- **Check** — the result of `splain:check`, computed fresh on every page load by
  the same validator the command runs. `clean`, `2 warnings`, or `3 errors` —
  the hub can never disagree with the checker, because it *is* the checker.
- **Needs review** — how many steps the AI flagged as needing human eyes.

Open a guide to see the full story: every check error and warning spelled out,
plus the **review inbox** — each flagged step with the AI's stated reasons.
These are real; here's one from a demo app, where the AI flagged a step it
couldn't confirm because a feature was switched off in that environment:

> **confirm-readiness** — "Optional section unverified: this feature was
> disabled in the demo env, so the section it points at never rendered — a
> human should confirm the step against a live screen where it's enabled…"

Two header buttons work the inbox:

- **Resolve flags…** — tick the steps you've verified on the live screen.
  Resolving asserts a human looked; that's the whole point of the flag.
- **Edit a flag…** — rewrite the outstanding reasons (one per line) when you've
  verified part of a flag but not all of it. Emptying the box resolves it.

### Publishing (attested publish — splain/pro)

The governed, named-human **attested publish** described here — before a guide goes live,
Splain requires a named person to sign off that it reflects how the work is really done —
is a **splain/pro** feature (the separate, proprietary package). In free `splain/splain`, a guide's draft/published
status still controls visibility and you publish by flipping that status after your own
review; the recorded, named-human sign-off of record below is what Pro adds.

**Publish** flips a draft to published — but only through a gate: zero check
errors AND zero unresolved review flags, **AND your sign-off**, all re-verified at
the moment you confirm (never trusted from a stale page). Publishing requires you
to tick an acknowledgment — *"I have reviewed this guide against the live
application and confirm its steps are accurate and safe for my users. I accept
responsibility for its content."* — and records who signed off, when, in which
version, and the exact words. This is deliberate: a walkthrough spotlights a real
control and **the user clicks it themselves** (Splain never acts for them), so the
one content risk — an inaccurate instruction — is owned by the human who attested
it before it reached users. If publish is blocked, the notification lists the exact
reasons. **Unpublish** puts a guide back to draft.

Publishing is the real release lever: drafts never reach regular users
(`serve_drafts` ships `false`), so the attested publish action is the moment a
guide goes live. Reviewers see drafts in place via the `splain.preview-drafts`
gate while they work.

The hub is read-mostly on purpose: no creating, no deleting, no raw editing.
Guides arrive by seeding JSON into the `splain_guides` table (guides are stored as JSON —
see [authoring.md](authoring.md); the hub reads them, it doesn't create them); copy and
anchors get refined in design mode.

## Design mode

Entry, today: add `?splain-studio=<guide-slug>` to the URL of a page the guide
covers — optionally `:<step-key>` to jump straight to one step:

```
/admin/documents?splain-studio=approve-a-document:start-review
```

Or run `window.SplainStudio.open()` in the browser console. (Buttons in the hub
and an "edit" item in the helper dot's menu — the helper dot is the small floating
launcher Splain adds to your page — see below.)

Opening it stops any guide that's mid-play, then shows a dark side panel. It
edits any guide covering the current page — walkthroughs and page tours alike;
if nothing covers the page, it says so and does nothing.

The fields, top to bottom:

- **Step** — which moment of the walkthrough you're editing.
- **Title** — the headline of the helper bubble users see on this step.
- **Instruction** — the body text: what you're telling the user to look at or do.
- **Bubble position** — "auto" lets Splain place the bubble; set a direction only
  if it covers something users need to click.
- **What gets highlighted** — a human name (e.g. `the "Start Review" button`) with
  the machine code (a CSS selector) beneath it. You never need to read the code:
  click **Pick on page**, then click the thing on screen this step should point
  at, and both fill in (Esc cancels).
- **Backup highlights (advanced)** — one selector per line, tried if the main one
  ever stops matching. Safe to leave alone.

**Pick on page** doesn't grab any old selector — it climbs a quality ladder.
Best: a `data-splain` marker you put in your own code. Next: a stable id. Last
resort: a path built from the page's structure — and when it lands there, it
tells you the pick is fragile and prints the exact
`->extraAttributes(['data-splain' => '…'])` one-liner to paste into your
Filament component so next time it isn't.

**Preview** shows the real helper bubble with your unsaved edits in place.
**Save** writes to the draft — through the same validator as `splain:check`, so
a save that would introduce a new structural error is refused with the checker's
message. Saving to a *published* guide is safe too: it lands on a draft revision,
never on what users see (next section). Structural surgery — adding steps,
changing branching — stays a JSON job: [authoring.md](authoring.md).

## Who's allowed (the gates)

Splain ships no roles. Your app defines one Laravel gate and the whole Studio
follows it:

```php
Gate::define('splain.manage-guides', fn ($user) => $user->isAdmin());
```

Need finer cuts? Define a specific gate and it wins over the umbrella:
`splain.view-guides` (see the hub), `splain.edit-steps` (design mode + flag
actions), `splain.publish` (publish/unpublish). If you define nothing at all,
everything is allowed in your `local` environment and denied everywhere else.
Details and examples: [installation.md](installation.md).

## Editing a published guide: draft revisions

Saving an edit to a published guide never changes what users see. Splain creates
a **draft revision** — a full copy at the next version number — and your edits land
there ("Editing draft v2 — users keep seeing v1 until you publish"). The hub shows
both rows; publishing the revision through the same gate swaps them atomically:
the new version goes live, the old one is archived as history. Completion resets
with the version, so users can be re-guided through what changed.

**Pilot testing**: define a `splain.preview-drafts` gate and whoever passes it sees
draft revisions *in place of* the published ones — a live test group experiencing
the working copy while everyone else stays on the stable version. Undefined, the
gate defers to `splain.manage-guides` (editors preview their own work by default).

## More ways in

Beyond the URL parameter: every guide row in the hub has a **Design mode** action
(deep-links to the guide's first page), and editors see an **"✎ Edit this page's
guides"** item at the bottom of the helper dot's own menu — ordinary users don't;
the item is injected by the gated studio script their browser never receives.

Design mode also edits each step's **Privacy Mode masks** ("Hide in Privacy Mode",
advanced) — one selector per line, `block:` prefix for an opaque cover.

## Committing Studio edits back to source: `splain:export`

> **`splain:export` is a FREE command** — it ships in `splain/splain` and works without the
> Studio. Guides-as-code (`splain:export` / `splain:import`) is part of the free package, so
> you can round-trip guide JSON out of and back into version control whether or not you run
> `splain/pro`.

Studio edits live in the database (as draft revisions). To get them back into the
version-controlled JSON that seeds your guides, export:

```bash
php artisan splain:export my-guide --output=database/guides/
# → database/guides/my-guide.json   (the slug's highest version)

php artisan splain:export --all --output=database/guides/ --force   # every guide
php artisan splain:export my-guide --rev=2                          # a specific version, to stdout
```

The export is the authored source only — `slug`, `title`, `genre`, `spans`, `steps`
(verbatim, so metadata the Studio never touches survives), `honest_limits`. Runtime
state (status, version, timestamps) is deliberately left out. Output 2-space JSON with a
deterministic, sorted key order and trailing newline — byte-stable across DB
backends (MySQL reshuffles JSON keys on write; export re-sorts) so re-exports diff
cleanly. A guide with outstanding `splain:check` errors is exported *with a warning*
so you don't commit a broken one by accident. The loop closes: edit in the Studio → `splain:export` → commit.

## Coming, not shipped

Structural editing — adding/removing steps, changing branches — is still a JSON job
([authoring.md](authoring.md)); the Studio edits copy, anchors, sides, and masks, not
graph shape. This page describes only what exists.
