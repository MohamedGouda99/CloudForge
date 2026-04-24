# Deployment Guide

CloudForge's production topology uses four free-tier services — no credit card required.

```
┌─────────────────────┐   HTTPS   ┌─────────────────────┐   TCP    ┌──────────────┐
│  Vercel             │──────────▶│  Render             │─────────▶│  Neon        │
│  Frontend SPA       │           │  Backend + Celery   │          │  Postgres 15 │
└─────────────────────┘           │  (Docker)           │          └──────────────┘
                                  └──────────┬──────────┘
                                             │  TLS
                                             ▼
                                  ┌─────────────────────┐
                                  │  Upstash            │
                                  │  Redis (rediss://)  │
                                  └─────────────────────┘
```

| Component | Provider | Free tier limit |
|---|---|---|
| Frontend SPA | Vercel | 100 GB bandwidth / month |
| Backend + Celery | Render Web Service | 750 hours / month (sleeps after 15 min idle) |
| Postgres | Neon | 0.5 GB storage, 3 projects (auto-suspend after 5 min) |
| Redis | Upstash | 10,000 commands / day, 256 MB |

## Prerequisites

- A GitHub account with access to your fork of CloudForge
- A working knowledge of copying connection strings between dashboards
- ~20 minutes for first deployment, ~3 minutes for subsequent redeploys

## Step 1 — Provision Postgres on Neon

1. Go to https://console.neon.tech and sign up (GitHub login works).
2. Click **Create Project** — pick any name (e.g. `cloudforge`), region closest to your Render region (`us-west-2` if you chose Render `oregon`).
3. Once created, open **Dashboard → Connection Details**.
4. Set **Connection type** = `Pooled connection` (important — Render's worker needs the pooler for short-lived connections).
5. Copy the connection string. It looks like:
   ```
   postgresql://user:pass@ep-xxx-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require
   ```

**Save this — you'll paste it into Render in Step 3.**

## Step 2 — Provision Redis on Upstash

1. Go to https://console.upstash.com and sign up (GitHub login works).
2. Click **Create Database**.
3. Name: `cloudforge-redis`, Type: **Regional**, Region: closest to your Render backend.
4. **Enable TLS** (default on — Render requires `rediss://`).
5. Click **Create**.
6. On the database page, scroll to **REST API / Connect** and copy the **Redis URL** (not the REST URL). It looks like:
   ```
   rediss://default:PASSWORD@HOST.upstash.io:6379
   ```

**Save this too — it's the other value Render will prompt for.**

## Step 3 — Deploy backend to Render

1. Go to https://dashboard.render.com and sign up (no card required for the free web-service plan).
2. Click **New → Blueprint**.
3. Connect the GitHub account that has CloudForge and grant access to the repo.
4. Select `MohamedGouda99/CloudForge` (or your fork).
5. Render reads `render.yaml` and shows one service: `cloudforge-backend`.
6. It will prompt you to fill in the values marked `sync: false`:
   - **`DATABASE_URL`** → paste the Neon pooled connection string from Step 1
   - **`REDIS_URL`** → paste the Upstash Redis URL from Step 2
   - Leave `INFRACOST_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_OAUTH_CLIENT_ID` blank unless you have them — they enable optional features.
7. Click **Apply**. Render kicks off the first Docker build.

**First build takes 10–15 minutes** (installs Terraform, tfsec, terrascan, infracost, builds the shared resource catalog). Subsequent deploys are fast thanks to layer caching.

When the deploy goes green, copy the public URL — something like `https://cloudforge-backend-xxxx.onrender.com`.

## Step 4 — Deploy frontend to Vercel

Run this from your local checkout:

```bash
cd frontend
vercel link                                    # creates .vercel/project.json
vercel env add VITE_API_URL production         # paste your Render URL
vercel env add VITE_WS_URL production          # same URL with ws:// → wss://
vercel --prod                                  # deploy
```

Vercel prints a URL like `https://cloudforge-xxxx.vercel.app`.

## Step 5 — Wire CORS

The backend only accepts requests from origins listed in `ALLOWED_ORIGINS`. After Vercel gives you a URL:

1. Go to the Render dashboard → `cloudforge-backend` → **Environment**.
2. Edit `ALLOWED_ORIGINS`, change the value to your Vercel URL (e.g. `https://cloudforge-xxxx.vercel.app`).
3. Save — Render auto-redeploys.

## Step 6 — Smoke test

1. Open your Vercel URL.
2. Log in with `admin` / `admin123` (the defaults — **change them immediately** via the Settings page).
3. Create a project, drop a VPC onto the canvas, click **Generate Terraform**.
4. If you see HCL output, the entire stack is wired up.

## Troubleshooting

**Backend boot fails with database connection error**
- Neon connection strings for Render MUST be the *pooled* one (ends in `-pooler.us-...`). The direct string doesn't handle Render's short-lived workers.

**CORS error in the browser after deploy**
- You probably forgot Step 5. The frontend URL must be in `ALLOWED_ORIGINS`.

**First login returns 401 "incorrect username or password"**
- The admin user is created on the **first** backend boot. If boot failed once, it may not have created the user. Check the Render deploy logs, redeploy, and the bootstrap will retry.

**Request hangs then returns 502**
- The Render free service has spun down after 15 min idle. First request takes ~30 s to wake it. Refresh once.

**Infracost / Claude AI features show errors**
- These are optional. Set `INFRACOST_API_KEY` / `ANTHROPIC_API_KEY` in Render dashboard → Environment to enable.

## Upgrading later

- **Render backend** — bump from Free (sleeps) to Starter ($7/mo, always-on).
- **Neon Postgres** — Starter is $19/mo for 10 GB. Free tier usually enough for demos.
- **Upstash Redis** — pay-as-you-go kicks in after 10K/day.

## Maintenance

- **Secrets rotation**: the deployment-time `SECRET_KEY` is generated once by Render. Rotate by editing it and redeploying — all existing JWTs will invalidate.
- **Neon branching**: for staging/preview backends, use `neon branch create` to spin up a point-in-time clone of prod data on a separate Neon branch.
