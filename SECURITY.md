# Security

## API keys

This app never stores API keys on the server. Keys are kept in the browser's `localStorage` and forwarded per request through `src/app/api/jev/route.ts`, which only proxies to the two whitelisted upstreams (TypeSafe and Vercel AI Gateway). If you self-host, put the app behind HTTPS so keys are not sent in the clear.

Do not paste production keys into a deployment you do not control.

## Reporting a vulnerability

If you find a security issue — for example a way to exfiltrate a key, make the proxy call an arbitrary host, or execute code through the state editor — please **do not open a public issue**. Report it privately through [GitHub's private vulnerability reporting](https://github.com/davila7/jev-explained/security/advisories/new) and include steps to reproduce.

You will get an acknowledgement within a few days and a fix or mitigation as soon as possible.
