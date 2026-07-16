<!-- synced from splain@78003f2 docs/ci.md — edit THERE, then re-run bin/sync-docs.sh -->

# CI: guides that can't silently rot

*Catch guides that break when your UI changes — in CI (your CI: the automated checks that
run before you merge code), before users see them.*

A walkthrough breaks the same way documentation breaks — quietly. Someone renames a
button, ships it, and three weeks later a user hits a tour that points at nothing. The
whole promise of guidance that lives inside your app and is anchored to your code
(in-perimeter, code-anchored guidance) is that this is *catchable*, in CI, before the
user ever sees it. This is how.

## The gate

```bash
php artisan splain:check --drift --strict
```

`splain:check` has always validated a guide's **structure** (every step is reachable and
there are no loops). Drift = when your code changes so a guide no longer matches the real
UI. `--drift` detects it: it scans your code for the `data-splain` markers that actually
exist right now, and **fails if any published guide anchors to a marker that's gone** —
the exact break a refactor introduces.

Exit codes are the contract, so CI can trust them:

| Result | Exit |
|---|---|
| all guides well-formed, no rot | `0` |
| a structural error, **or** a rotted anchor | non-zero |
| `--strict` and any warning (unresolved `needs_review`, etc.) | non-zero |

Drift only checks `[data-splain="…"]` markers — the anchors a code scan can verify.
Structural selectors (`.fi-ta`, a bare id) can't be confirmed against source, so they're
the human reviewer's job, not the gate's — same discipline as the generation flagger.
The free drift-gate stands on its own: it doesn't depend on the splain/pro attested
sign-off — resolving `needs_review` by hand clears the warnings it gates on.

## Where the guides come from

Guides live in your database, but CI shouldn't need a production DB. So version them:
run `splain:export` to write each published guide to canonical JSON, and commit those
files. CI then checks the committed files against the current code:

```bash
php artisan splain:export                          # writes guides to files (commit them)
php artisan splain:check --drift --strict path/to/guides/*.json
```

With file paths, `--drift` needs **no database and no booted panel** — it reads the JSON
and scans your source. (Run with no paths to check the live DB guides instead, e.g. on a
staging box.)

### Deploying guides (the other half of the loop)

The committed files are the source of truth; load them into an environment's database with
the inverse command:

```bash
php artisan splain:import database/splain/*.json     # a dir or a list of files
```

`splain:import` validates each guide (a broken one is refused, not loaded), lands a **new**
guide as a **draft** (all free) — only a human publishes it, and in the free package that's
the plain draft→published status flip (the governed named-human attested sign-off is a
splain/pro feature, the separate proprietary package) — and on re-import **refreshes an
existing guide's content without demoting a published one**. So the whole loop is:

```
author (Studio/hand) → splain:export → git commit → CI: splain:check --drift → deploy: splain:import
```

Content lives in git and is reviewed in PRs; who *publishes* stays a deliberate human act.

Tell it where your UI lives (defaults to `app` + `resources/views`):

```php
// config/splain.php
'check' => [
    'source_paths' => ['app', 'resources/views', 'resources/js'],
],
```

## GitHub Actions

Copy `examples/ci/github-actions.yml` into `.github/workflows/`. In short:

```yaml
name: Splain guides
on: pull_request
jobs:
  guides:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.3' }
      - run: composer install --no-interaction --prefer-dist
      - run: cp .env.example .env && php artisan key:generate   # boot only, no DB
      - name: Guides can't silently rot
        run: php artisan splain:check --drift --strict database/splain/*.json
```

Now a PR that renames a button a guide points at goes red, with the exact guide and marker
named — instead of shipping a dead walkthrough to your users.

## One limitation to know

Drift verifies **literal** markers. If you build a marker by interpolation —
`data-splain="tab-{$name}"` — the scanner can't know its runtime values, so a guide
anchoring a concrete `[data-splain="tab-settings"]` would be reported as rot even though
it renders. Anchor guides to **static** markers (the flagger already nudges you this way);
reserve interpolated markers for things guides don't point at.
