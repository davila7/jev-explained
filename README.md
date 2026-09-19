# Jev Explained

**Learn how TypeSafe's Jev makes typed, probabilistic decisions — by running it.**

Live demo: **https://jev-explained-repo.vercel.app/** (bring your own TypeSafe or Vercel AI Gateway key).

<p align="center">
  <img src="docs/jev-primitives.png" alt="Jev primitives: Noul (yes/no), Choice (which one), Score (how much)" width="640">
</p>

An interactive playground that shows, step by step, how [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) — TypeSafe's System One model — works.

## What is Jev?

Jev is not a chat LLM. It does not generate text. You send it a **state** (any text or JSON: an email, a market snapshot, a tool call an agent wants to run, a whole inbox) plus one or more typed **questions**, and it returns calibrated probabilities for every question in a single ~100 ms round trip. Your code, not the model, makes the final decision by thresholding on those numbers.

### The three primitives

Choose the primitive by the type of question you are asking:

| Primitive | Ask it when | Example | Returns |
| --- | --- | --- | --- |
| **Noul** — yes / no? | the question is binary | *Is this email spam?* | one probability, 0 → no, 1 → yes |
| **Choice** — which one? | you pick from known options | *Which team should handle this?* | the chosen option, a probability for every option, and a `confidence` |
| **Score** — how much / what level? | you grade on an ordered rubric | *How risky is this?* | a weighted score, a probability for every level, and a `confidence` |

Two things make this different from asking an LLM:

- **Questions run in parallel.** Jev reads the state once and answers every question at the same time, so ten questions cost about the same as one. You can fan out speculatively and let your code decide what matters.
- **Confidence is a second axis.** Choice and Score answers tell you *what* (the answer) and *how sure* (the shape of the distribution). High confidence → act automatically; low confidence → ask a human.

### What this repo shows

The playground walks through four patterns, each with real requests you can run with your own key:

| Example | Pattern | State | Questions |
| --- | --- | --- | --- |
| **Email Spam Classifier** | Text classification | an email | `is_spam` (noul), `folder` (choice), `suspicion` (score) |
| **NVIDIA: Buy or Sell?** | Decision on structured data | a JSON market snapshot | `action` (choice), `sentiment` (score), `material_risk` (noul) |
| **Agent Tool-Call Guardrail** | Jev inside an agent harness | a tool call the agent wants to run | `verdict` (choice), `is_destructive` (noul), `blast_radius` (score), `in_scope` (noul) |
| **Inbox Triage** | Speculative fan-out | 8 support tickets | 8 × `priority` (score), `most_urgent` (choice), `needs_incident` (noul) — one request |

For every run the right-hand panel shows the exact request, latency and token usage, the typed answers with probability bars, and the decision your code makes from them.

Endpoint: `POST https://api.typesafe.ai/v1/systemone` · Model: `jev-latest`. See the [API reference](https://docs.typesafe.ai/api).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000, pick a provider, paste its key, choose an example and press **Run** (or ⌘↵). Edit the state or switch between the sample states to see how the answers move. Use the `≡ / </>` toggle to see the raw request JSON.

## Providers

Both providers speak TypeSafe's native request/response shape; only the URL, key and model id change.

| Provider | Endpoint | Model | Key |
| --- | --- | --- | --- |
| TypeSafe | `https://api.typesafe.ai/v1/systemone` | `jev-latest` | [console.typesafe.ai/keys](https://console.typesafe.ai/keys) |
| Vercel AI Gateway | `https://ai-gateway.vercel.sh/typesafe/v1/systemone` | `typesafe-ai/jev` | AI Gateway API key from your Vercel team ([docs](https://vercel.com/docs/ai-gateway/sdks-and-apis/typesafe)) |

## How the key is handled

Neither API accepts cross-origin browser calls, so the app ships a tiny proxy at `src/app/api/jev/route.ts`. Keys are stored per provider in your browser's `localStorage` only and forwarded on each request in the `x-jev-api-key` header (with `x-jev-provider` selecting the upstream); the server never persists them.

## Project layout

```
src/
  app/
    page.tsx            three-panel layout + run loop
    api/jev/route.ts    server-side proxy to api.typesafe.ai
  components/
    Sidebar.tsx         API key + example list
    Workbench.tsx       state editor, questions, formatted/JSON toggle
    TracePanel.tsx      session timeline (request → response → answers → decision)
    AnswerCard.tsx      noul / choice / score renderers
  lib/
    examples.ts         runnable examples
    providers.ts        TypeSafe / Vercel AI Gateway endpoints and model ids
    types.ts            TypeSafe API types
    trace.ts            timeline event types
    useApiKey.ts        localStorage-backed provider + key hook
```

## Adding an example

Add an object to `EXAMPLES` in `src/lib/examples.ts`. Each one declares a `state`, a `questions` map (the same shape the API takes), a few quick-swap `samples`, and a `decide()` function that turns the answers into the decision your code would make.
