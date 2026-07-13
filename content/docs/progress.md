<!-- synced from splain@4028e58 docs/progress.md — edit THERE, then re-run bin/sync-docs.sh -->

# Server-side progress — what is stored about your users

By default, Splain records **nothing** on your server about who completed what —
completion lives only in each user's browser. A host can turn on server-side progress
to make completion durable and cross-device (and, with the pro report, visible to an
admin). This page says exactly what that stores, because the whole point is that you
can tell your users — and your lawyer — the truth without hedging.

## Turning it on

```php
// config/splain.php
'progress' => [
    'enabled' => env('SPLAIN_PROGRESS', false),   // ← default false; off stores nothing new
    'retention_days' => null,                     // null = you own retention
    'reporting' => ['per_person' => false],       // aggregate-only by default
],
```

Off (the default), Splain behaves exactly as before: completion is client-only and no
new rows are written. Nothing here activates until you set `enabled` to true.

## What is stored (the entire footprint)

One row per (user, guide-version) the user completes, holding **only**:

| field | what it is |
|---|---|
| `user_type`, `user_id` | a **pointer** to your own user record (its class + id). Not a copy — Splain stores no name/email. The report shows only this pointer (e.g. `App\Models\User #42`); if you want a human name, you resolve it against your own user table. |
| `guide_slug`, `guide_version` | which guide, which version |
| `completed_at` | when they reached the guide's final step (or `null` for a backfilled row, where the real date is unknown) |
| `source` | `playback` (recorded live) or `import` (migrated from the browser) |

## What is deliberately **not** stored

No name, email, IP, user-agent, session id, page URLs, step timings, or click trail —
and **no `created_at`/`updated_at`**: Splain does not record *when a user synced*, only
the completion fact itself. The honest framing is: *"we keep the single minimal
behavioral fact — that a user reached a guide's terminal step, and when"* — not "we keep
no behavior." A per-guide `completed_at` **is** minimal personal data; we say so.

## Anonymous users

If there's no identifiable user, **nothing is written** — no row, no synthetic id.
Logged-out visitors stay entirely on localStorage.

## Erasure and retention (you are the controller)

Splain is a processor here — you decide policy:

```bash
php artisan splain:progress:forget "App\Models\User" 42   # erase one user's records
php artisan splain:progress:prune                         # delete rows past retention_days
```

`prune` only removes **dated** completions (`source: playback`). A backfilled row
(`source: import`) carries no completion date — the real date is unknown — so it is exempt
from age-based pruning by design; erase those with `splain:progress:forget`.

`prune` with no `retention_days` set is a deliberate no-op — Splain never deletes on a
schedule you didn't choose.

## The admin report (pro) and employee monitoring

The pro completion report shows onboarding progress. Because per-person completion
visible to managers is **regulated employee monitoring** in some jurisdictions,
`reporting.per_person` defaults to **false** (aggregate counts only); turn on per-person
visibility deliberately, with whatever disclosure your jurisdiction requires. Treat that
wording as a lawyer-review item, like the publish attestation.

## Nothing leaves your perimeter

Recording is a local database write. Progress data never leaves your app.
