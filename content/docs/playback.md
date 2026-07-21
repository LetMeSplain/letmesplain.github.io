<!-- synced from splain@a738cf8 docs/playback.md — edit THERE, then re-run bin/sync-docs.sh -->

# Playback: what your users see

This page explains the experience on the *reading* end — the helper dot, the menu
behind it, and how a guide moves once someone starts it. For writing guides, see
[authoring.md](authoring.md).

## The helper dot

On any page at least one guide covers, a small round button appears in the
bottom-right corner — the **helper dot**. It wears your app's primary color and
pulses gently (a soft expanding ring, never a strobe; it obeys the browser's
reduced-motion setting). Pages with no matching guide get nothing at all — no dot,
and (with the default config) not even the guide script.

Clicking the dot opens the **launcher menu**, a small panel listing every guide for
the page, grouped by what kind of guide it is:

- **How do I…** — walkthroughs (do a real task, step by step)
- **Learn this page** — tours (a look around, nothing touched)

Guides someone has finished show a **Completed** badge (in your theme's success
color). Once *every* guide on
the page is completed the dot dims — but everything stays clickable forever; guides
are always replayable. The menu is keyboard-friendly (arrow keys, Enter, Esc).

If a page's guides flag sensitive regions, the menu header also shows a **Privacy
Mode** eye toggle: it blurs or covers those regions for demos and screen recordings.
Honest scope: it is a *recording aid*, not a security control — the data is still in
the page, just visually hidden.

One honesty note for hosts: **drafts never reach regular users by default** —
`splain.playback.serve_drafts` ships `false` (fail-safe). Authors and reviewers
still see drafts in place via the `splain.preview-drafts` gate (which falls back
to the Studio's umbrella gate), so you can test unpublished work on the live
screens without exposing it. Flip `SPLAIN_SERVE_DRAFTS=true` only in throwaway
dev environments where everyone should see everything.

## Tours: look, don't touch

A tour spotlights parts of the page one at a time — "this is your work queue", "this
filter hides approved people" — with a helper bubble beside each spotlight. You move
with **Next** and **Previous**, the bubble shows "Step 1 of 4", and closing the tour
any way at all (finishing, Esc, the X, clicking the darkened background) counts as
completing it. A tour is just a look around; there's nothing to abandon halfway.

## Walkthroughs drive the real app

A walkthrough is different, and this matters: **it performs no actions for you, and
it fakes nothing — you do the real thing, on live data, while it points.** When the
"Review & approve a submitted document" walkthrough highlights the *Start
Review* button and you click it, a real document is claimed under your name. When
it highlights *Accept*, the document really becomes Accepted. Splain only watches;
your app's own buttons do what they always do.

Because of that, a walkthrough advances in a few different ways depending on the
step:

- **Next button.** Plain explanation steps have a Next button in the bubble, like a
  tour. Previous works within a run of these — but not backwards across a real
  action (Splain can't un-click a button for you).
- **"Click the highlighted button to continue."** Some steps have no Next button:
  the way forward *is* clicking the real control — for example *Start Review*, which
  opens the review window. Splain waits, with no time limit, while you read; once
  you click, it watches for the next step's target to appear and moves there. If
  nothing appears within ~20 seconds of your click, the walkthrough ends quietly
  rather than hang.
- **Decisions with real buttons.** At a fork — Accept, Reject, or Skip — the bubble
  lists the choices and what each really does ("IN_REVIEW → ACCEPTED"). You click
  the actual button, the real action happens, and the walkthrough follows whichever
  branch you chose.
- **"Complete the highlighted action to continue."** For a confirmation dialog
  (say, *Yes, reject it* with its required note), Splain waits for two things: your
  click on the confirm button *and* the dialog actually closing. If validation fails
  and the dialog stays open, you're still on the step — fix the field and confirm
  again. Cancel the dialog and the walkthrough ends gracefully instead.

Walkthroughs show no "Step x of y" counter — with branches, that number would lie.

## Crossing pages

Some tasks span pages: approve a document on one, update the record on another. The
walkthrough ends a page's portion by spotlighting the real navigation link
("Continue on the Documents list") and telling you to click it. When you do, the
page changes — and the walkthrough **resumes automatically** on the other side,
starting at that page's first step. The resume note lives only in that browser tab
and expires after about three minutes, and it's discarded if you end up somewhere
else — a guide never ambushes you on the wrong page or hours later.

## Finishing, dismissing, replaying

Reaching a walkthrough's wrap-up step marks it **done**: the Completed badge appears
in the menu, and the dot dims once all the page's guides are done. Completion is
remembered per guide *and per guide version* — so a revised guide invites a fresh play.

By default, completion lives only in that browser (localStorage), so a different device
or browser won't remember anything. A host that turns on **server-side progress**
(`config('splain.progress.enabled')` — off by default) changes that: completion is then
recorded against the host's own user, so it follows the person across devices, and a
one-time backfill migrates their existing localStorage completions. See
[progress.md](progress.md) for exactly what is stored (a minimal pointer — never a copy
of who they are) and the privacy posture.

Dismissing a walkthrough mid-way — Esc, the bubble's X, or clicking the darkened
background — just stops it. It is **not** marked done, and nothing is undone either:
any real action you already took stays taken. The same quiet stop happens if you
wander off-script, like closing the window the guide is pointing into. Replaying
starts the page's steps from the top.

## It wears your app's design

The dot, the menu, the Completed badge, and the bubble's Next/Previous buttons are
built from your Filament theme's own building blocks — your colors, your font, your
dark mode, automatically. Flip the app to dark mode and everything follows; no
Splain theming to configure. Animations (the pulse, spotlight transitions, smooth
scrolling) all switch off when the user's system asks for reduced motion.

## On phones and tablets

The launcher and popovers are viewport-aware (the panel caps at the screen width,
the dot meets the 44px touch floor, and on touch devices the popover buttons grow to
meet it too — desktop keeps the host's compact button scale). CI runs the browser
suite at a phone viewport, so small-screen fit is a tested invariant, not a hope.

One caveat worth knowing: on a phone, Filament's sidebar is an overlay. If a user
opens a guide while that overlay is open, the sidebar can sit inside the spotlight
cutout and look un-dimmed on top of the highlighted element. In practice the tap
path that opens the launcher usually has the sidebar closed; if your users report
it, tell them to close the menu first — a future adapter (Splain's per-framework
integration layer) nicety may auto-close it.
