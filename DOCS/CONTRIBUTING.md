# Contributing

## Branching

- `main` — always deployable.
- `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>` — short-lived feature branches.
- Open a PR into `main`; preview deploy + Neon branch are created automatically.

## Commits — Conventional Commits

```
feat: add FAQ category management
fix: prevent deleting referenced media asset
docs: add DATABASE schema
refactor: extract LeadService
chore: bump deps
```

Scope optional: `feat(cms): …`. Keep messages imperative and focused.

## Pull request checklist

- [ ] `npm run lint` and `npx tsc --noEmit` pass
- [ ] Tests added/updated and green (see [TESTING.md](TESTING.md))
- [ ] No secrets committed; `.env.example` updated if env changed
- [ ] DB change includes a Prisma migration + seed update if needed
- [ ] Security-relevant change reviewed against [SECURITY.md](SECURITY.md)
- [ ] New decision recorded as an [ADR](ADR/) if architectural
- [ ] Docs updated (the affected `DOCS/*`)
- [ ] `CHANGELOG.md` updated under "Unreleased"

## Code review

- At least one approval. Reviewers check correctness, security, and that the change respects the
  layering (no DB access from components; mutations through services with RBAC + audit).

## Tooling

ESLint + Prettier enforced; a Husky/lint-staged pre-commit hook (lint + typecheck on staged files)
is recommended once Phase 1 begins.
