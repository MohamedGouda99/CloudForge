# Summary

<!-- What changed and why. One or two sentences. -->

## Type of change
<!-- Check one -->
- [ ] Bug fix
- [ ] New feature (new cloud resource, new endpoint, new UI panel, ...)
- [ ] Refactor / internal cleanup
- [ ] Documentation
- [ ] Chore (CI, tooling, deps)

## Test plan
<!-- How you verified this. Paste relevant test output if helpful. -->
- [ ] `./scripts/test-backend.sh --unit`
- [ ] `./scripts/test-frontend.sh`
- [ ] Manually exercised the feature in the browser at http://localhost:3000

## Checklist
- [ ] Lint passes (`black app/` + `flake8` for backend, `npm run lint` for TS)
- [ ] Coverage stays at or above 80% on both backend and frontend
- [ ] No secrets in the diff (`.env` values belong in `.env.example` as blanks/placeholders)
- [ ] If a new cloud resource: I ran `npm run build` in `shared/resource-catalog/` and confirmed it appears in the designer palette
- [ ] If the PR touches a spec'd feature: `specs/<branch-name>/` is updated
- [ ] README / CLAUDE.md updated if commands or architecture changed

## Related issues
<!-- Closes #123, refs #456 -->
