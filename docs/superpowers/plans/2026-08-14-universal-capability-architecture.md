# Universal Capability Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove scenario/persona/package allowlist encoding so the plugin works from arbitrary project evidence and arbitrary package inputs.

**Architecture:** Replace predefined scenario catalogs with generic engineering invariants and project-first routing. Make the resolver derive package names from explicit arguments or the inspected project's complete direct dependency manifest rather than a curated list. Keep live npm verification and structure checks property-based.

**Tech Stack:** Node.js ESM, built-in `fetch`, `node:test`, GitHub Actions, Markdown skill references.

## Global Constraints

- No persona-specific or journey-specific runtime behavior.
- No scenario IDs or scenario catalog used to drive plugin behavior or validation.
- No curated package allowlist in production resolver code.
- Unknown packages and project structures are first-class inputs.
- External integration evidence continues to hit the real npm registry.
- `main` remains the sole authoritative branch.

---

### Task 1: Replace scenario contracts with generic skill contracts

**Files:**
- Modify: `skills/current-3d-engineering/SKILL.md`
- Create: `skills/current-3d-engineering/references/project-routing.md`
- Create: `skills/current-3d-engineering/references/engineering-invariants.md`
- Delete: `skills/current-3d-engineering/references/scenarios.md`
- Delete: `tests/scenarios.json`
- Delete: `tests/developer-journeys.json`

**Interfaces:**
- Consumes: actual repository state and user request.
- Produces: generic routing and invariant instructions with no scenario/persona lookup.

- [x] **Step 1:** Add failing tests requiring generic reference paths and rejecting scenario/persona fixtures.
- [x] **Step 2:** Run the test suite and verify the new assertions fail against the prior scenario-based tree.
- [x] **Step 3:** Update the skill and references to project-first generic routing/invariants and delete scenario/journey fixtures.
- [x] **Step 4:** Re-run the focused structure tests and verify they pass.

### Task 2: Make package resolution open-ended

**Files:**
- Modify: `skills/current-3d-engineering/scripts/resolve-packages.mjs`
- Modify: `tests/plugin.test.mjs`

**Interfaces:**
- Consumes: repeated `--package <name>` values or all direct dependency specs from `<project>/package.json`.
- Produces: the existing JSON/report shape for every requested/discovered direct package, with no recognized-package allowlist.

- [x] **Step 1:** Add a failing test proving project mode must resolve dependencies not named anywhere in resolver production code.
- [x] **Step 2:** Add a failing assertion that production resolver source contains no `DEFAULT_PACKAGES`/recognized-package list.
- [x] **Step 3:** Run tests and confirm failure is caused by current allowlist filtering.
- [x] **Step 4:** Remove the curated list; make project mode use `Object.keys(project.specs)` when no explicit package list is supplied; fail clearly when neither explicit packages nor project dependencies provide work.
- [x] **Step 5:** Run live npm tests and confirm arbitrary explicit/project dependency names resolve from the authoritative registry.

### Task 3: Generalize structure validation and documentation

**Files:**
- Modify: `skills/current-3d-engineering/scripts/validate-plugin.mjs`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `.codex-plugin/plugin.json`
- Delete: `docs/superpowers/plans/2026-08-14-current-3d-engineering.md`
- Delete: `docs/superpowers/specs/2026-08-14-current-3d-engineering-design.md`

**Interfaces:**
- Consumes: generic skill/reference files.
- Produces: structure validation and public documentation with no scenario-count contract.

- [x] **Step 1:** Add failing assertions that validator/README no longer require scenario files/counts.
- [x] **Step 2:** Update validator required files and output to generic structure validation.
- [x] **Step 3:** Rewrite README coverage section around universal project-first behavior and representative property tests.
- [x] **Step 4:** Bump plugin/repo version to `1.1.0` and keep metadata synchronized.
- [x] **Step 5:** Remove superseded scenario-oriented design/plan documents from the current tree.

### Task 4: Repository-wide anti-overfitting gate and final verification

**Files:**
- Modify: `tests/plugin.test.mjs`
- Modify: `docs/superpowers/plans/2026-08-14-universal-capability-architecture.md`

**Interfaces:**
- Consumes: current repository tree.
- Produces: regression evidence that current production/test contracts do not depend on personas/scenario IDs/package allowlists.

- [x] **Step 1:** Add repository-level checks for prohibited scenario/persona fixture paths and production allowlist constructs while permitting representative test inputs.
- [x] **Step 2:** Run `npm test` and require zero failures, including live npm integration checks.
- [x] **Step 3:** Run `npm run verify` and require successful generic plugin structure validation.
- [x] **Step 4:** Inspect the current `main` tree and require no active `developer-journeys`, `tests/scenarios.json`, `references/scenarios.md`, finite library-routing matrix, `primaryScenario`, or encoded scenario-ID contracts.
- [x] **Step 5:** Verify `main` is the only branch and CI succeeds on the final state.
- [x] **Step 6:** Mark this plan complete only after fresh evidence from the final state.

## Verification evidence

### Red gate

GitHub Actions run `31844661104` on commit `d730ecb0caf84d96dbd4d8afef1d7108b665800d` executed the new universal contracts against the prior implementation. Result: 14 tests, 8 passed, 6 failed. The failures were the intended architectural defects: scenario references/fixtures, the `DEFAULT_PACKAGES` allowlist, implicit no-input ecosystem selection, project dependency filtering, and scenario-count structure validation.

### Green gate

GitHub Actions run `31845046275` on commit `75ad859d9944c444979622a9b0e1fb5d8575709d` completed successfully on Node 22.23.2. Result: 14 tests, 14 passed, 0 failed. Live registry checks used the real public npm registry, arbitrary explicit package input passed, project mode returned every declared direct dependency section without recognized-package filtering, and the anti-overfitting guard passed.

`npm run verify` also completed successfully with:

```text
Plugin structure valid: current-3d-engineering@1.1.0; architecture=project-first
```

The current tree contains the generic `project-routing.md`, `engineering-invariants.md`, and `source-policy.md` references and no active scenario/persona catalog or finite library-routing matrix.