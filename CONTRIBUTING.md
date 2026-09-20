# Contributing

Thanks for helping make Jev easier to understand. The most valuable contributions are **new examples** that show a pattern the playground does not cover yet, and fixes to existing ones.

## Setup

```bash
git clone https://github.com/davila7/jev-explained.git
cd jev-explained
npm install
npm run dev
```

You need a [TypeSafe API key](https://console.typesafe.ai/keys) or a Vercel AI Gateway key to run examples. Keys stay in your browser's `localStorage`; nothing is committed.

Before opening a PR, make sure these pass:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Adding an example

Examples live in `src/lib/examples.ts`. Add an `Example` object and append it to `EXAMPLES`:

- **`id`, `title`, `category`, `description`** — keep the description to one sentence that says what the example teaches.
- **`state`** — a string. If it is valid JSON it is sent as a structured object. Keep it realistic; that is what makes the answers interesting.
- **`questions`** — the same shape the API takes (`noul`, `choice`, `score`). Prefer a few atomic questions over one broad one, and put your domain rules in `instructions` and `criteria`.
- **`samples`** — 2–4 alternative states that make the answers move in different directions (the "happy path", an ambiguous case, a clear negative).
- **`decide(answers)`** — the decision your code would make from the answers. Threshold on probabilities and `confidence`; this is the part that shows *how* to use Jev, so keep it readable.

Run every sample against the real API and check that each one lands on the decision you intended before opening the PR. Mention the results in the PR description.

Questions are static per example, so if your samples share ids (tickets, items, options), keep the question text id-only rather than baking sample-specific content into it.

## Reporting issues

Use the issue templates. For a wrong or surprising answer from Jev, include the exact state and questions (the `</>` view gives you the request JSON) and what you expected.

## Style

- TypeScript, functional React components, Tailwind utility classes.
- Match the surrounding code; run `npx prettier --write` on files you touch.
- Keep UI text short. The trace panel is meant to be read at a glance.

## License

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE).
