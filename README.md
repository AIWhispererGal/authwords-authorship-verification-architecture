# AuthWords

A student-first authorship-verification reference workspace with a detailed five-part production architecture blueprint.

## Evaluate without signing in or uploading

Open **`/demo`** (also linked as **Public demo** in the sidebar and **Try the public demo** on the overview). An Austen holdout result is already visible on first load—no account, workspace cookie, database seed, or uploaded document is required.

The versioned fixture in `src/data/public-demo/corpus.json` includes three credited public-domain Jane Austen reference passages, an Emma holdout, an 1818 Mary Shelley excerpt, one explicitly labeled AI-generated fixture, and a short-sample abstention case. It is roughly 30 KB, downloaded locally with the app, and never fetched from a third-party archive at runtime. Source URLs, editions, excerpt hashes, rights scope, and synthetic-generation provenance are included. The full manifest is downloadable at `/api/demo/corpus`.

The demo calculates a deterministic six-feature **style index**, not an authorship probability or AI verdict. Read-only `/api/demo/compare` accepts only allowlisted scenario/reference IDs. Changing selected baseline texts recomputes the result; a short candidate or a one-excerpt baseline produces no score. Published source labels are not fed into the calculation. No result mints a credential.

Documented context includes English source language, birthplace, lifespan, and publication period. ESL status and proficiency remain explicitly unknown. Biographical/context fields are display-only and never adjust the score; this tiny historical collection cannot validate demographic fairness.

See `src/data/public-demo/README.md` for rights, source credits, limitations, and maintenance. With the app running, `node scripts/public-demo-smoke.mjs` checks this anonymous evaluation flow.

## What runs here

- Responsive dashboard, searchable/filterable submissions, writing-profile visualizations, and an accessible verification flow.
- PostgreSQL persistence via Drizzle for isolated demo sessions, source preferences, consent, submissions, review requests, and credentials.
- Browser-local extraction of coarse writing metrics. The submission API rejects raw-text fields; it accepts a strict, bounded JSON schema. Text is cleared from application state, but forensic browser-memory erasure is not guaranteed.
- Explicitly illustrative consistency scoring, including abstention for short and prompt-engineering samples. There is no trained authorship classifier in this reference app.
- Real Ed25519 signatures on **synthetic demo claims**, public JWKS, online revocation checks, and minimal public verification pages. These do not certify a real grade, student identity, or actual authorship.
- A searchable five-section blueprint with Markdown export. Open `/?view=blueprint` or download `/api/blueprint`.

## Runtime versus proposed architecture

The supplied environment runs this reference app on **Next.js App Router, React 19, Tailwind CSS v4, and PostgreSQL/Drizzle**. The blueprint's production target explicitly preserves **TanStack Start, React 19, Vite, Tailwind v4, and Bun**, with institutional Python/ONNX inference and separate background workers.

LTI integrations, university identity, a trained/calibrated ensemble, institutional isolation, HSM key custody, and lawful consent governance are **design specifications**, not live services in this demo. No claim of FERPA/GDPR certification or mathematically irreversible embeddings is made.

## Run and validate

Set `DATABASE_URL` in the server environment. Do not expose it through public-prefixed variables.

1. Install dependencies with `npm install`.
2. Apply the schema with `npx drizzle-kit push` against the configured local PostgreSQL database.
3. Use `npm run dev` for local development.
4. Validate with `npx next typegen`, `npm exec tsc -- --noEmit --pretty false`, and `npm run build`.
5. In the managed preview, use the platform build/start action for production startup and `/api/health` verification.

The workspace initializes synthetic records on its first `/api/workspace` request. The HttpOnly, SameSite demo-session cookie isolates each visitor's data. It is not institutional authentication.

## End-to-end checks

With the application running, install Chromium and system dependencies using `npx playwright install --with-deps chromium`, then run:

`node scripts/smoke.mjs`

Use `TEST_BASE_URL` to target another instance. Tests cover session persistence/isolation, origin checking, raw-text rejection, consent enforcement, source preferences, prompt-specific abstention, review requests, credential minting/idempotency, public metadata minimization, independent signature verification, payload tampering, revocation, navigation, table filtering, blueprint search/export, browser-only metric extraction, and mobile layouts. API test workspaces are deleted afterward.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Interactive workspace |
| `/?view=blueprint` | Five-part technical submission |
| `/api/blueprint` | Downloadable Markdown blueprint |
| `/api/workspace` | GET workspace; PATCH consent/source preferences; DELETE/reset session |
| `/api/submissions` | POST derived metrics only |
| `/api/submissions/[id]` | PATCH an owned demo review request |
| `/api/credentials` | POST mint; PATCH permanently revoke an owned credential |
| `/api/credentials/jwks` | Public Ed25519 verification key |
| `/verify/[id]` | PII-free public demo-verification page |
| `/api/verify/[id]` | Minimal signed proof plus current status |
| `/api/health` | PostgreSQL-backed healthcheck |

## Important security boundary

Never put real student data into this demonstration. Synthetic-demo signing keys are persisted in a server-only database table so links survive restarts. This is **not production key custody**; real issuance requires the institution-controlled HSM/signing topology described in section 5. Static bearer links are correlatable and do not authenticate their holder. Revoked tokens may retain a valid mathematical signature, so online status checking remains essential.

Embeddings, fingerprints, scores, and pseudonyms can remain protected personal data. The production design therefore keeps all derived student state local, restricts egress, provides realistic purge/backup controls, supports appeal and abstention, and separates ordinary academic grades from optional authorship enhancements.
