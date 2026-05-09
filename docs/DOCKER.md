# DOCKER.md

> The Vercel deploy doesn't use Docker — Vercel builds directly from git. Docker is here for two reasons: a portable production image (if we ever need to host elsewhere) and a deterministic local build for debugging Vercel-specific issues.

## Local dev with docker-compose

```bash
docker-compose up
```

Reads `.env.local` via `env_file:` in `docker-compose.yml`. Hot-reloads with the Next dev server inside the container.

Stop: `Ctrl+C` then `docker-compose down`.

## Production image build

```bash
docker build -t sams-southern .
```

Multi-stage build:

| Stage | Purpose |
|---|---|
| `deps` | `npm ci` to populate `node_modules` |
| `builder` | `npm run build` — produces `.next/standalone/` |
| `runner` | Minimal Alpine image with the standalone build only — no devDeps |

Final image is around 200 MB (vs ~1.5 GB if we shipped the whole `node_modules`).

## Run the production image locally

```bash
docker run --rm -p 3000:3000 --env-file .env.local sams-southern
```

Open [http://localhost:3000](http://localhost:3000).

## Production compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Same image, but with restart policies and healthchecks for long-running deployment.

## .dockerignore

Excludes `.env*`, `node_modules`, `.next`, `coverage`, `.git`, etc. Without this, the build context balloons to >500 MB and `.env.local` would leak into the image.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails on `npm ci` | Lockfile out of sync with `package.json` | `rm package-lock.json && npm install` then commit. |
| Runtime: "env var X is required" | `.env.local` not mounted | Pass `--env-file .env.local` on `docker run`. |
| Container exits immediately | `output: "standalone"` missing in `next.config.ts` | Confirm it's still in next.config.ts (the Sentry wrap preserves it). |
| Healthcheck fails | App takes >30s to start | Increase healthcheck `start_period` in compose. |

## When NOT to use Docker

- Local dev where `npm run dev` works fine — Docker is slower for dev.
- Vercel deploys — Vercel builds natively from `package.json` and is faster.
