# 🧭 Tree of Life Agency - Development Guidelines

**Version:** 1.0.0  
**Last Updated:** 2025-09-17  
**Status:** Active

---

## 1. Code Style Standards (CS)

### TypeScript Enforcement
- ✅ **All code must be written in TypeScript** (never use `.js` unless auto-generated)
- ✅ Use strict TypeScript configuration with `strict: true`
- ✅ All files must use `.tsx` extension for React components, `.ts` for utilities
- ✅ No `any` types - use proper type definitions or `unknown`

### React + Tailwind CSS Requirements
- ✅ **UI must use React + Tailwind CSS** exclusively
- ✅ **Atomic component design** with PascalCase filenames
- ✅ Functional components with hooks (no class components)
- ✅ Components in `components/` directory with index.ts barrel files

### Import/Export Standards
- ✅ **Named exports only** - no default exports
- ✅ Barrel files allowed **only** as `index.ts` within folders
- ✅ Imports must be at the top of files
- ✅ Group imports: React → Third-party → Internal → Relative

### Validation & Types
- ✅ **Zod** for runtime validation on all API boundaries
- ✅ Types stored in `src/types/` for reuse across components
- ✅ Interface over type aliases for object shapes
- ✅ Strict null checks enabled

---

## 2. Project Structure Standards (PS)

### Directory Structure
```
app/                # React TypeScript web app (Next.js)
apps/               # Nx-managed platforms (Expo mobile + Electron desktop)
libs/               # Shared TS code, UI libs, hooks, test utilities
tools/              # Generators, CLI helpers, scripts
docs/               # Documentation suite
├─ guidelines.md    # This file
├─ architecture/    # Mermaid C4 diagrams
├─ patches/         # Change log, patch history
└─ batches/         # Release batches and notes
public/             # Static assets
scripts/            # Build, deploy, lint, migration scripts
reports/            # Analytics & audit trail
├─ coverage/        # Jest + Cypress coverage reports
├─ performance/     # Lighthouse, Playwright perf metrics
└─ audits/          # Security scans, dependency reports
resources/          # Shared optimization + data layer
├─ optimization-maps/ # Algorithm efficiency profiles
├─ data/            # Datasets, schema snapshots
└─ models/          # AI/ML or simulation models
infrastructure/     # IaC & ops
├─ terraform/       # Terraform plans
├─ pulumi/          # Pulumi programs
├─ docker/          # Dockerfiles, docker-compose
└─ vercel/          # Vercel configs
```

### Monorepo Requirements
- ✅ **Nx React/TypeScript monorepo** as foundation
- ✅ Mobile app via `@nx/expo:app`
- ✅ Desktop via Expo web → Electron/Tauri
- ✅ Real-time/offline-first: **Meteor backend + @meteorrn/core**

---

## 3. CLI Flag Enforcement (CS/BR)

### Non-Interactive Commands
- ✅ **All CLI scaffolding commands must include explicit, non-interactive flags**
- ✅ No prompts or interactive selections allowed
- ✅ Commands must be reproducible and deterministic

### Divergence Protocol
- ❌ **Divergence → `proposed-tech/<name>` branch** with rationale + exact CLI
- ❌ **Missing flags → `PATCHN_ISSUES.md`** + halt execution
- ✅ All commands documented with exact flags used

### Example Compliant Commands
```bash
# ✅ GOOD - Explicit flags
npx create-nx-workspace @tree-of-life/agency \
  --preset=react-ts \
  --appName=web \
  --style=css \
  --defaultBase=main \
  --no-interactive

# ❌ BAD - Interactive prompts
npx create-nx-workspace @tree-of-life/agency
```

---

## 4. Development Flow: Patches & Batches (DF)

### Patch Structure
- 📁 `/docs/patches/patch-N/` → `PATCHN_CHECKLIST.md` + `PATCHN_SUMMARY.md`
- 📁 `/docs/batches/batch-N/` → `BATCHN_CHECKLIST.md` + `BATCHN_SUMMARY.md`

### Patch Flow Process
1. **Plan** → `/plan-feature-set` → develop
2. **Develop** → AI auto-check → commit & tag
3. **Deploy** → DemoMode
4. **Issues** → `PATCHN_ISSUES.md`
5. **Close** → batch completion when all patch checklists complete

### Quality Gates
- ✅ Compilation passes (`tsc --noEmit`)
- ✅ Linting passes (`eslint --fix`)
- ✅ Tests pass with ≥90% coverage
- ✅ UI follows React + Tailwind atomic rules
- ✅ CLI flag compliance verified

---

## 5. Testing Standards (TG)

### Coverage Requirements
- ✅ **≥90% test coverage** for all new code
- ✅ **Jest** for unit and integration tests
- ✅ **Cypress** for end-to-end testing
- ✅ **Playwright** for performance testing

### Test Structure
```
__tests__/
├─ unit/           # Component and utility tests
├─ integration/    # API and service tests
└─ e2e/           # End-to-end user flows
```

### Testing Patterns
- ✅ Test behavior, not implementation
- ✅ Mock external dependencies
- ✅ Use data-testid for element selection
- ✅ Test error states and edge cases

---

## 6. Git & Versioning Standards (BR/TG)

### Commit Message Format
```
feat[patch-N](tags): description

Tags: CS, PS, DF, AI, DS, BR
Example: feat[patch-3](PS, DF): add optimization-maps to resources root
```

### Branching Strategy
- `main` → production-ready code
- `proposed-tech/<name>` → stack deviations with POC + rationale
- `windsprint/batch-N` → development branches for batch work

### Semantic Versioning
- ✅ Use semantic-release: `v0.1.0`, `v0.2.0`, etc.
- ✅ Tags mark completion milestones
- ✅ `v0.0.1` → Bootstrap complete
- ✅ `v0.1.0` → Pipeline setup complete

---

## 7. AI Autonomy & Self-Check (AI)

### Pre-Commit Verification
Before concluding any patch, AI must verify:
- ✅ TypeScript compilation passes
- ✅ ESLint rules pass
- ✅ All tests pass with coverage ≥90%
- ✅ UI follows React + Tailwind atomic rules
- ✅ CLI flag compliance verified
- ✅ No hardcoded secrets or API keys

### Failure Protocol
- ❌ **Failures → `PATCHN_ISSUES.md`**
- ❌ **Halt execution until resolved**
- ✅ Document exact error and resolution steps

---

## 8. Security & Best Practices (DS)

### API Security
- ✅ **Never hardcode API keys** - use environment variables
- ✅ Validate all inputs with Zod schemas
- ✅ Implement proper CORS policies
- ✅ Use HTTPS in production

### Code Security
- ✅ Regular dependency audits (`npm audit`)
- ✅ No sensitive data in git history
- ✅ Proper error handling without information leakage
- ✅ Input sanitization for user data

---

## 9. Documentation Requirements (DS)

### Required Documentation
- ✅ `docs/guidelines.md` → source of truth (this file)
- ✅ `END_GOAL.md` → final product criteria (AI readable, never modified)
- ✅ Each patch feature must trace back to `END_GOAL.md`
- ✅ Architecture diagrams in Mermaid format

### Documentation Standards
- ✅ Markdown format with proper headers
- ✅ Code examples with syntax highlighting
- ✅ Clear step-by-step instructions
- ✅ Regular updates with version tracking

---

## 10. Enforcement & Compliance

### Automated Checks
- ✅ Pre-commit hooks for linting and formatting
- ✅ CI/CD pipeline verification
- ✅ Automated test execution
- ✅ Coverage reporting

### Manual Reviews
- ✅ Code review for all PRs
- ✅ Architecture review for major changes
- ✅ Security review for API changes
- ✅ Documentation review for clarity

---

## Summary Checklist

Before any code is considered complete:

- [ ] TypeScript compilation passes
- [ ] All tests pass with ≥90% coverage
- [ ] ESLint rules pass
- [ ] UI follows React + Tailwind atomic design
- [ ] CLI commands use explicit flags
- [ ] No hardcoded secrets
- [ ] Documentation updated
- [ ] Patch traces to END_GOAL.md
- [ ] Commit message follows format
- [ ] Security review completed

**Remember:** These guidelines are enforced by AI and must be followed without exception. Deviations require approval through the `proposed-tech/` branch process.
