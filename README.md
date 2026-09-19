# Jev Explained

An interactive playground that shows, step by step, how [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) — TypeSafe's System One model — works.

Paste your TypeSafe API key, pick an example, edit the *state*, press **Run** (or ⌘↵), and watch a Claude Code-style session trace on the right: the request that was sent, latency and token usage, the typed answers with probability bars and confidence, and finally the decision your code makes from those numbers.

## What is Jev?

Jev is not a chat LLM. You send it a **state** (any text or JSON) plus a map of typed **questions**, and it answers all of them in parallel in one ~100 ms round trip, returning calibrated probabilities instead of generated text:

| Question | Returns |
| --- | --- |
| `noul` — a yes/no question | `noul`: probability 0–1 |
| `choice` — pick one option | `choice`, `probabilities`, `confidence` |
| `score` — rate on ordered levels | `score`, `legend`, `probabilities`, `confidence` |

Endpoint: `POST https://api.typesafe.ai/v1/systemone` · Model: `jev-latest`. See the [API reference](https://docs.typesafe.ai/api).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000, pick a provider, paste its key, and run an example: **Email Spam Classifier** (text state) or **NVIDIA: Buy or Sell?** (structured JSON state with market data). Use the `≡ / </>` toggle to switch between the formatted view and the raw request JSON.

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
