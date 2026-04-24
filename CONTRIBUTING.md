# Contributing to CloudForge

Thanks for taking the time to contribute! CloudForge is a multi-cloud visual IaC platform — any help with new cloud resources, bug fixes, or UI improvements is welcome.

## Getting set up

```bash
git clone https://github.com/MohamedGouda99/CloudForge.git
cd CloudForge
cp .env.example .env                    # fill in any keys you have; blanks are fine
./scripts/first-run.sh                  # or: docker compose up -d
```

That brings up the full stack (FastAPI + Postgres + Redis + Celery + frontend + LocalStack). The frontend is at http://localhost:3000. The backend API docs at http://localhost:8000/docs. Log in as `admin` / `admin123` — and **change the password immediately** if you plan to expose this beyond localhost.

For more setup detail (WSL specifics, single-service workflow, test commands) see [`CLAUDE.md`](./CLAUDE.md).

## Running tests

```bash
./scripts/test-all.sh                   # backend + frontend + contract tests
./scripts/test-backend.sh --unit        # backend only
./scripts/test-frontend.sh              # frontend only
./scripts/test-e2e.sh                   # Playwright end-to-end
```

Coverage gate is 80% on both sides. See [`TESTING.md`](./TESTING.md) for the full rundown.

## Adding a new cloud resource

The unified catalog at [`shared/resource-catalog/`](./shared/resource-catalog/) is the single source of truth. Add your resource definition there, rebuild the catalog, and the backend API + frontend palette pick it up automatically.

1. Create `shared/resource-catalog/src/<provider>/<category>/<resource>.ts`
2. Export it from the category and provider `index.ts`
3. Build: `cd shared/resource-catalog && npm run build`
4. Restart backend so it picks up the new JSON schema: `docker compose restart backend`

Full walk-through is in [`CLAUDE.md`](./CLAUDE.md#resource-catalog-architecture).

## Code style

- **Python backend:** `black app/` and `flake8 app/` before committing. `mypy app/` for type sanity.
- **TypeScript:** `npm run lint` in `frontend/` and `shared/resource-catalog/` — warnings fail the build (`--max-warnings 0`).
- **Commits:** Conventional-ish prefixes help (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Keep subjects under 72 chars.

## Pull request checklist

Before opening a PR:

- [ ] Tests pass locally (`./scripts/test-all.sh`)
- [ ] Lint passes (backend and frontend)
- [ ] New cloud resources include a build of the shared catalog
- [ ] No secrets in the diff (use `.env` locally, `.env.example` for docs)
- [ ] Relevant spec updated under `specs/<branch-name>/` if the PR changes specified behavior

## Branch naming

CloudForge uses [speckit](https://github.com/github/spec-kit) for non-trivial features, so the branch name is load-bearing — it maps 1:1 to a folder in `specs/`. Keep branches short-lived and delete them after merge.

| Prefix | When | Example |
|--------|------|---------|
| `NNN-<kebab-name>` | Speckit feature (number = next free under `specs/`) | `012-role-based-access-control` |
| `fix/<short-desc>` | Bug fix outside a speckit flow | `fix/terraform-generator-null-ref` |
| `chore/<short-desc>` | Tooling, deps, refactors that aren't a feature | `chore/bump-fastapi-0.110` |
| `docs/<short-desc>` | Documentation-only change | `docs/contributor-setup-mac` |
| `hotfix/<short-desc>` | Urgent production-affecting patch against `main` | `hotfix/cors-allowed-origins` |
| `release/<vX.Y.Z>` | Release-preparation branch | `release/v1.2.0` |

**Tags for archival:** use `archive/<old-branch-name>` tags to preserve work from deleted branches. Example: `archive/replit-agent` holds a 5-month-old Replit experiment that's no longer an active branch but whose commits remain retrievable.

**Protected branches:** `main` is the default and production branch. Open PRs from your feature/fix branch against `main` — direct pushes to `main` should be reserved for trivial documentation changes.

## Spec-driven work

Non-trivial features follow the [speckit](https://github.com/github/spec-kit) workflow. If you're tackling something in `specs/`, read the spec + plan + tasks there first — they're the source of truth, not the code alone.

## Found a security issue?

Please **don't** open a public issue. See [`SECURITY.md`](./SECURITY.md) for how to report privately.

## Questions?

Open a GitHub issue using one of the templates, or start a Discussion if it's open-ended.
