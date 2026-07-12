<!-- synced from splain@78e9916 docs/generation.md — edit THERE, then re-run bin/sync-docs.sh -->

# Generation (pro, bring-your-own model)

`splain:generate` drafts a guide for a resource by having a model read your app's
**code** and produce guide JSON — then it runs that draft through the same validator
`splain:check` uses, mechanically flags every anchor it couldn't verify, and lands the
result as an **unpublished draft**. It is a drafting aid for a developer, never an
autopilot: nothing it produces reaches your users until a human reviews it, signs off,
and publishes.

## Bring your own model

**Splain ships no model, no API key, and no default endpoint.** The one thing
generation sends anywhere is your source (at dev time, never runtime data), and *you*
own that crossing. You opt in one of two ways.

### The quick way: the reference adapter (OpenAI-compatible, your endpoint)

Set all three and Splain binds its reference client to **your** endpoint — OpenAI,
Azure, OpenRouter, or a fully-local Ollama / LM Studio / vLLM:

```dotenv
SPLAIN_GENERATION_ENDPOINT=https://api.openai.com/v1   # or http://localhost:11434/v1
SPLAIN_GENERATION_KEY=sk-…                             # local hosts: any non-empty string
SPLAIN_GENERATION_MODEL=gpt-4o                         # or llama3.1:70b, etc.
```

Leave any of them unset (the default) and nothing is bound — `splain:generate`
refuses. The configuration *is* the consent: your source facts go only to the endpoint
you chose (the confirmation prompt names the host and model, never the key), and a
fully local endpoint means they never leave your machine at all. The reference prompt
*asks for* the same discipline the pipeline *enforces*: anchor only to real markers —
any non-marker or unverifiable selector is mechanically flagged by the AnchorFlagger
for human review before publish — and describe what the user actually does, never a
process the interface merely allows.

Two operational notes, said plainly:

- **`config:cache` freezes these values** — including the key, in plaintext, in
  `bootstrap/cache/config.php`. Removing them from `.env` only takes effect after you
  re-run `config:cache` (or `config:clear`); until then the generator stays bound.
- **The key rides your app's shared HTTP client**, so host-level HTTP logging or
  listeners that record request headers (a Telescope-style client watcher) will see the
  `Authorization` header — configure such tooling to redact it. Splain itself never
  logs or echoes the key.

### The full-control way: bind your own adapter

```php
// A service provider in your app
use Splain\Generation\Contracts\Generator;

public function register(): void
{
    $this->app->bind(Generator::class, YourGenerator::class);
}
```

`Generator` is one method:

```php
use Splain\Generation\Contracts\Generator;

class YourGenerator implements Generator
{
    public function draft(array $context, array $feedback = []): array
    {
        // $context = the introspected surface facts (routes, anchors, model, label).
        // $feedback = validator errors from the previous attempt (empty on the first).
        // Call whatever you want — your OpenAI/Anthropic/Azure/Bedrock/local endpoint,
        // with YOUR key — and return a guide array (slug, title, genre, spans, steps).
        // You do NOT need to make it valid; the loop validates and asks you to fix.
        return $yourModel->draft($context, $feedback);
    }
}
```

Until a `Generator` is bound, `splain:generate` refuses to run and tells you so.

## What Splain does around your model

You supply the drafting; Splain supplies the **conscience**, so a weak or careless
model still can't ship something dangerous:

1. **Validator-in-the-loop.** Each draft is run through `ValidateGuide`; its errors are
   fed back to your `draft()` verbatim, up to `splain.generation.max_attempts` times,
   until the guide has zero structural errors. Your model can be dumb — the loop keeps
   it honest. (It repairs *errors* only; it never feeds a `needs_review` flag back as
   something to "fix", so a model can't learn to delete a flag to pass.)
2. **Mechanical anchor-flagging.** The only anchors Splain can verify are the
   `data-splain` markers `splain:introspect` actually found in your source. Every other
   anchor a model emits — a fabricated `data-splain` value, a bare `.fi-*` class, a
   proposed injection — gets a `needs_review` flag saying "confirm this on the live
   screen." A model cannot launder a guessed selector as a confident one.
3. **Lands as a draft.** The result is created as an unpublished guide carrying its
   flags. It appears in the Studio hub; you resolve the flags on the live page, sign off
   (the publish attestation), and publish. The publish gate blocks on any open flag.

## Usage

```bash
php artisan splain:suggest              # find a resource with no guide
php artisan splain:generate documents   # draft one (asks for confirmation first)
php artisan splain:generate documents --yes   # non-interactive (CI); explicit consent
```

## Honest scope

- **Generation reads code, at dev time.** It sends the resource's source facts to the
  endpoint you configured — never runtime data, never your users' records, and only when you run the
  command. What "code" means and how much data your model sees is your adapter's choice;
  Splain does not choose, vet, or secure your endpoint.
- **Generated guides are unverified drafts.** `splain:check` proves structure, not truth
  or safety; the flags mark what a human must confirm. You are the reviewer of record.
- **Nothing auto-publishes.** A generated draft cannot reach users until a person signs
  off — by design.
