<!-- synced from splain@a738cf8 docs/privacy-mode.md — edit THERE, then re-run bin/sync-docs.sh -->

# Privacy Mode (the eye toggle)

Privacy Mode blurs or covers the sensitive parts of a page — name columns, ID
scans, filled-in forms — so you can give a demo or record your screen without
showing real data. Open the helper dot's menu — the helper dot is the small floating
launcher Splain adds to your page (it's live in the corner of this very page — click it) —
and click the **eye icon** in the header. Click it again to turn it off. The eye only appears on pages that
actually have flagged regions.

While it's on, every flagged region stays masked for the rest of your browser
tab's session — whether a guide is playing or not. That's deliberate: a
recording can't tolerate masks that come and go between steps.

> **Privacy Mode is a demo and recording aid, NOT a security control.** The
> masking is purely visual: the real values are still in the page (the DOM and
> the accessibility tree), still in the server response, one devtools click
> away. Never use it to hide data from someone who shouldn't see it — that's
> your app's authorization's job. If genuinely sensitive records are involved, the real answer is
> recording against synthetic data; Privacy Mode exists so a recording made on
> real-ish screens needs no post-production blurring.

## Two mask styles: blur and block

- **blur** — a soft blur for text regions (a name column, a hydrated form
  field). You can still see there's a table there; you can't read the values.
- **block** — an opaque cover labeled "Hidden by Privacy Mode", for document
  scans: ID-card images, PDF previews. Blur is not enough there — the large
  lettering on a scanned ID card stays legible through a blur — so the whole
  region gets covered, and the content behind the cover is heavily blurred as
  a backstop.

One practical rule for block masks: point the selector at a **container**
around the image or iframe, not at a bare `<img>` or `<iframe>` itself —
browsers can't draw the cover text on those elements (the backstop blur still
applies either way, so nothing becomes readable; you just lose the label).

A mode that isn't exactly `blur` or `block` is treated as blur — a typo must
degrade to "still masked", never to "rendered in the clear". If the same region
is flagged twice with different modes, the stronger one (block) wins.

## How guides flag regions

Any step can carry a `pii_risk.mask_selectors` list — pairs of a selector (the
machine address of a page region, same idea as a step anchor: how a guide points at a
specific on-page element, usually a `data-splain` marker you place in your code — see
[authoring.md](authoring.md)) and a mode. From the document-review guide:

```json
"pii_risk": {
  "mask_selectors": [
    { "selector": ".fi-table-cell-submitter\\.name", "mode": "blur" },
    { "selector": "[data-splain=\"doc-preview-file\"]", "mode": "block" }
  ]
}
```

When Privacy Mode is on, the page masks the **union** of these flags from every
guide covering the page — all steps, including ones that play inside modals.
Selectors aimed at other pages' regions simply match nothing here. A broken
selector is skipped safely: that one region goes unmasked, the rest keep
working.

## Masking things guides don't know about

Guides flag what their own steps touch. For app chrome — the user menu showing
a real name, global search results — add host-level masks in
`config/splain.php`:

```php
'privacy' => [
    'masks' => [
        ['selector' => '.fi-user-menu', 'mode' => 'blur'],
    ],
],
```

These join the guides' flags whenever the toggle is on.

## Recording tips

- Toggle **before** you hit record. The menu stays open when you click the eye,
  so you can flip it while framing the shot.
- It's per-tab: a fresh tab starts with Privacy Mode off. Stay in one tab.
- Walk every page of your recording route once with the toggle on and *look* —
  masks are only as good as their selectors, and a bad one silently leaves its
  region unmasked.
- Navigate in-app rather than hard-refreshing. Masks persist across in-app
  (SPA) page changes, even onto pages no guide covers.

## The uncovered-page caveat

With the default `overlay.load_on_request = true`, Splain's engine only ships
on pages a guide covers. In-app navigation keeps your masks up everywhere, but
a **hard load** (F5, pasted URL) of an uncovered page arrives with no engine
and no masks. The config's answer for gap-free recordings across a whole panel
is `overlay.load_on_request = false` in `config/splain.php`, which ships the
engine on every page — and either way, the safest recording starts on a page a
guide covers and sticks to in-app navigation.
