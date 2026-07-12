<!-- synced from splain@78e9916 docs/installation.md — edit THERE, then re-run bin/sync-docs.sh -->

# Installing Splain

Splain adds a small helper dot to your Filament pages. Clicking it opens guided
walkthroughs and page tours that live in your own database. This page gets you from
`composer require` to a working helper dot, and explains every switch you can flip.

**Requirements:** PHP 8.3+, Laravel 11–13, Filament 3.2+ **or** Filament 4.x (both majors tested in CI on every push), Livewire 3.

## 1. Require the package

```bash
composer require splain/splain
```

**Not on Packagist yet?** While Splain is installed from a local checkout, tell
Composer where to find it before requiring it — add this to your app's
`composer.json` and require the `@dev` version:

```json
"repositories": [
    { "name": "splain", "type": "path", "url": "/path/to/splain" }
]
```

```bash
composer require splain/splain:@dev
```

A path install symlinks the package, so pulling new Splain code updates your app
immediately — no re-require needed.

## 2. Run the migration

```bash
php artisan migrate
```

Splain creates four tables: `splain_guides` (where every guide lives — title,
pages covered, steps), `splain_tracks` (ordered onboarding paths), and
`splain_guide_completions` + `splain_track_assignments`, which **stay empty
unless you opt into server-side progress** — completion tracking is off by
default, and when it's on it stores a pointer to your user, never a copy of
personal data (see [progress.md](progress.md)). The migrations load
automatically — there is nothing to publish first.

## 3. Register the plugins on your panels

Splain is two plugins with two jobs:

- **`SplainPlugin`** is playback — the helper dot your users see. Add it to every
  panel where guides should play.
- **`StudioPlugin`** is the editing side. Add it to panels where your guide editors
  work, and call `->hub()` on the **one** panel that should host the guide
  management pages (the list of all guides, with view and publish actions).

```php
use Splain\Filament\SplainPlugin;
use Splain\Studio\StudioPlugin;

// Your admin panel — playback plus the Studio hub:
$panel->plugins([
    SplainPlugin::make(),
    StudioPlugin::make()->hub(),
]);

// Any other panel — playback, and on-page editing for people who pass the gates:
$panel->plugins([
    SplainPlugin::make(),
    StudioPlugin::make(),
]);
```

Registering `StudioPlugin` widely is safe: everything it renders is
permission-checked on the server, so users who aren't allowed to edit see nothing
extra at all.

## 4. Publish the assets

```bash
php artisan filament:assets
```

This copies Splain's pre-compiled JavaScript and CSS into your `public/` folder.
You never need Node, npm, or a build step — the bundles ship ready-made. Re-run
this command whenever you update the package (most apps already run it on deploy).

## 5. See it work

The helper dot only appears on pages that a guide actually covers, so an empty
`splain_guides` table means an invisible Splain. Write your first guide by hand
(see [authoring.md](authoring.md) — it's one JSON file), seed it into the table,
and check it before expecting it to play:

```bash
php artisan splain:check              # validates every guide in the database
php artisan splain:check --strict     # also fails on warnings — the publish bar
```

## Configuration

```bash
php artisan vendor:publish --tag=splain-config
```

That gives you `config/splain.php`. Every key, in plain language:

### `pii_default` (default: `false`)

Whether Splain should assume your screens show personally identifiable information
(PII — any sensitive personal data) unless told otherwise. Off by default. Today this is
a declared default only — what actually drives masking is the per-step privacy
flags inside each guide, plus `privacy.masks` below. Leave it `false` unless a
future release tells you otherwise.

### `capture.strategy` (default: `'code-only'`)

How guide drafts get created. `code-only` — the only mode that exists today —
means guides are drafted from your app's source code, not from watching a live
environment. The other values you'll see in the file's comment
(`demo-credentials`, `local-copy`, `splain-managed-ephemeral`) are reserved names
for future capture modes. Leave this alone.

### `overlay.load_on_request` (default: `true`)

When `true`, the playback JavaScript is only sent to the browser on pages where a
guide matched — pages with no guides pay nothing. When `false`, it loads on every
panel page. One reason to go eager: Privacy Mode. With on-request loading, doing a
hard page reload on a page **no** guide covers means no masking engine is present,
so masks won't show there. If you're screen-recording across the whole panel and
need gap-free masking, set this to `false`.

### `playback.serve_drafts` (default: `false`)

Fail-safe by default: draft guides play **only** for people who pass the
`splain.preview-drafts` gate (authors and reviewers preview their work in place;
the gate falls back to the Studio's umbrella gate, and in `local` environments
any authenticated user passes). Set `SPLAIN_SERVE_DRAFTS=true` only in throwaway
dev environments where drafts should reach everyone — never in production, since
walkthroughs guide users through real actions on real data. Published guides
published (after they pass `splain:check --strict`) reach users.

### `privacy.masks` (default: `[]`)

Extra page regions to cover whenever Privacy Mode is on, beyond what the guides
themselves flag — think app chrome like the user menu or global search results,
which no guide knows about. Each entry is a CSS selector plus how to hide it:

```php
'masks' => [
    ['selector' => '.fi-user-menu', 'mode' => 'blur'],   // or 'block' for an opaque cover
],
```

A typo in `mode` degrades to `blur` (still masked), never to "shown in the clear".

**Honest scope:** Privacy Mode is a demo and screen-recording aid, **not** a
security control. Masked content is hidden visually but remains in the page's HTML
and accessibility tree — anyone with browser dev tools can read it. Never rely on
it to keep data from the person at the keyboard.

## Who can use the Studio (gates)

Splain ships **no roles or permissions of its own** — your app already has those.
Instead it asks Laravel gates that *you* define. If you define nothing:

- **`local` environment: everyone is allowed** (so a fresh dev install works with
  zero setup),
- **everywhere else: everyone is denied.**

So on production, nobody can touch the Studio until you define a gate.

### The umbrella gate

One gate to grant everything Studio-related:

```php
use Illuminate\Support\Facades\Gate;

// e.g. in a service provider's boot():
Gate::define('splain.manage-guides', fn ($user) => $user->hasRole('admin'));
```

### Splitting off single abilities

Every Studio action first checks its own, more specific gate and only falls back
to the umbrella if you haven't defined one. The specific gates that exist today:

| Gate | What it controls |
|---|---|
| `splain.view-guides` | seeing the guide pages in the hub |
| `splain.edit-steps` | the on-page editor, step edits, and the hub's review-flag actions |
| `splain.publish` | publishing and unpublishing guides |

The classic use: an editor helps write guides but shouldn't ship them. Give the team
the umbrella, then carve publishing out:

```php
Gate::define('splain.manage-guides', fn ($user) => $user->onGuidesTeam());
Gate::define('splain.publish', fn ($user) => $user->isAdmin());
```

Editors can now view and edit, but the publish buttons never appear for them — the
specific gate overrides the umbrella for that one ability. The
`splain.preview-drafts` gate works the same way: passers see draft guides in
place of published ones while everyone else sees only published work.

## Something not working? `splain:doctor`

```bash
php artisan splain:doctor
```

One command checks the whole installation: tables migrated, published assets present
AND fresh (the classic trap after updating the package — a stale `public/` copy makes
the UI half-work), the plugin registered on a panel, every guide passing `splain:check`,
and config states worth knowing about (drafts served in production, half-configured
generation, per-person reporting). Exit code is non-zero only for real breakage, so
it's safe in a deploy pipeline.

## Content-Security-Policy (strict-CSP hosts)

Splain is CSP-clean by design and adds **no requirements beyond what your stack already
needs** (Filament/Livewire themselves render inline style attributes and Alpine needs
its own allowances — your policy already accounts for your stack).

If you use Laravel's nonce pattern (`Vite::useCspNonce()` in a middleware), Splain picks
it up automatically: every inline element it emits (the launcher's style block, the
payload script, the progress bridge, the engine script tags) carries your nonce, and the
JS bundles re-apply that nonce to everything they inject at runtime (the privacy-mask
stylesheet, the standalone skin). Nothing to configure.

The engine itself is proven under `script-src 'nonce-…'; style-src 'self' 'nonce-…'` —
no `unsafe-inline` anywhere — by a CI browser test (`tests/browser/csp.spec.ts`,
harness: `examples/standalone/csp.html`).
