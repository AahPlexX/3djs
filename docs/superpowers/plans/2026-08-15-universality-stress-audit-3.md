# Third Universality Stress Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the third stress audit's generalized universality defects without adding project-, ecosystem-, or scenario-specific routing.

**Architecture:** Keep the skill project-first and provenance-first, expand its reusable safety/data invariants, make bundled script invocation host-portable, make local validation reflect current Codex-required manifest fields, and keep npm metadata tooling explicitly narrow and compatibility-neutral. Existing live npm verification remains a real-endpoint integration gate.

**Tech Stack:** OpenAI/Codex skill Markdown, JSON plugin manifests, Node.js ESM, built-in `fetch`, `node:test`, GitHub Actions.

## Global Constraints

- No scenarios, personas, project types, language lists, engine lists, package-manager lists, or finite ecosystem routing.
- Unknown projects and technologies remain first-class inputs.
- Preserve developer work and project ownership boundaries.
- Ecosystem-specific helpers remain optional and truthfully scoped.
- External-integration claims must use real authoritative services.
- `main` remains the sole authoritative branch.

---

### Task 1: Add the third-audit failing contracts

**Files:**
- Modify: `tests/universality.test.mjs`

**Interfaces:**
- Consumes: active skill, references, manifest, validator, npm helper, README.
- Produces: generalized property tests for the newly discovered defects.

- [x] **Step 1:** Add a manifest contract assertion requiring non-empty `interface.category`, `defaultPrompt`, and capability metadata.
- [x] **Step 2:** Add a portability assertion rejecting `${PLUGIN_ROOT}` and requiring `scripts/resolve-npm-packages.mjs` as a skill-root-relative invocation.
- [x] **Step 3:** Add invariant assertions for preserving developer/uncommitted changes, incomplete/materialized working copies, and inspection of executable repository commands before material side effects.
- [x] **Step 4:** Add persisted-data assertions covering schema/serialization migration and 3D semantic fidelity such as units/coordinate conventions/color semantics when relevant.
- [x] **Step 5:** Require npm output/source to expose `registryCandidateVersion` and reject `recommendedVersion`; require documentation to state the candidate is not project compatibility approval.
- [x] **Step 6:** Require documentation to distinguish the simple npm helper from `.npmrc` scope/auth/proxy/certificate semantics.
- [x] **Step 7:** Require install documentation to include `codex plugin add current-3d-engineering@aahplexx-3djs` rather than treating marketplace registration/listing as installation.
- [x] **Step 8:** Run GitHub Actions on the failing-contract commit and record the expected red failures while confirming existing live npm endpoint checks still run.

### Task 2: Correct portable skill behavior and universal safety invariants

**Files:**
- Modify: `skills/current-3d-engineering/SKILL.md`
- Modify: `skills/current-3d-engineering/references/project-routing.md`
- Modify: `skills/current-3d-engineering/references/source-policy.md`
- Modify: `skills/current-3d-engineering/references/engineering-invariants.md`

**Interfaces:**
- Consumes: actual project/request and discovered project state.
- Produces: host-portable, state-preserving, materialization-aware, trust-aware, data-compatible project guidance.

- [x] **Step 1:** Replace `${PLUGIN_ROOT}` helper invocation with skill-root-relative `scripts/resolve-npm-packages.mjs` instructions.
- [x] **Step 2:** Require current working-state inspection before mutation and preservation of unrelated developer changes; prohibit destructive reset/clean/overwrite behavior unless explicitly required and authorized.
- [x] **Step 3:** Require materialization/completeness checks before concluding resources are missing; cover partial/sparse working copies, external dependency/assets, generated state, and equivalent project-specific mechanisms without making any one VCS mandatory.
- [x] **Step 4:** Require inspection of unfamiliar executable commands/scripts/hooks for material side effects and trust/credential requirements before execution.
- [x] **Step 5:** Add persisted/serialized/content compatibility invariants: schema/version ownership, migration direction, backups/reproducibility for destructive transforms, units/axes/handedness/color/animation/skeleton/material fidelity when applicable.
- [x] **Step 6:** Re-run focused universality tests.

### Task 3: Make npm metadata output compatibility-neutral

**Files:**
- Modify: `skills/current-3d-engineering/scripts/resolve-npm-packages.mjs`
- Modify: `tests/plugin.test.mjs`
- Modify: `tests/universality.test.mjs`

**Interfaces:**
- Consumes: explicit npm registry packages or npm-compatible `package.json` registry-backed entries.
- Produces: registry metadata with a neutral `registryCandidateVersion`, never a project compatibility recommendation.

- [x] **Step 1:** Rename internal/output `recommendedVersion` to `registryCandidateVersion` and table label `recommended` to `registry candidate`.
- [x] **Step 2:** Keep candidate selection behavior limited to npm registry release metadata; do not add project compatibility claims to this helper.
- [x] **Step 3:** Update live npm tests to validate `registryCandidateVersion` against real registry data and reject legacy recommendation terminology.
- [x] **Step 4:** Preserve alias/non-registry behavior and require the live public npm suite to stay green.

### Task 4: Align plugin packaging and local verification with current Codex requirements

**Files:**
- Modify: `.codex-plugin/plugin.json`
- Modify: `skills/current-3d-engineering/scripts/validate-plugin.mjs`
- Modify: `package.json`
- Modify: `tests/plugin.test.mjs`

**Interfaces:**
- Consumes: plugin manifest.
- Produces: local validation that catches required current interface metadata before release.

- [x] **Step 1:** Add `interface.category` with a valid non-empty category and bump synchronized plugin/repo version to `1.3.0`.
- [x] **Step 2:** Strengthen `validate-plugin.mjs` to require non-empty `displayName`, `shortDescription`, `longDescription`, `developerName`, and `category`, require `defaultPrompt`/`default_prompt`, and require capabilities as a non-empty string array.
- [x] **Step 3:** Keep validator rejection of unimplemented MCP/server claims and generic architecture requirements.
- [x] **Step 4:** Run structure validation and manifest tests.

### Task 5: Correct public documentation and maintenance evidence

**Files:**
- Modify: `README.md`
- Modify: `research/2026-08-14.md`
- Modify: `docs/superpowers/plans/2026-08-15-universality-stress-audit-3.md`

**Interfaces:**
- Consumes: corrected architecture/helper/install behavior.
- Produces: accurate user/maintainer SSOT and completion evidence.

- [x] **Step 1:** Document skill-root-relative helper invocation and registry-candidate terminology.
- [x] **Step 2:** State that `--registry` is a simple npm-compatible endpoint selector and does not implement full `.npmrc` scoped registry/auth/proxy/certificate behavior; direct private/scoped projects to their established npm tooling/configuration.
- [x] **Step 3:** Correct installation instructions so marketplace registration and plugin installation are separate, including `codex plugin add current-3d-engineering@aahplexx-3djs` and a plugin-list verification step.
- [x] **Step 4:** Document the new state-preservation, materialization, execution-trust, and persisted-data invariants without enumerating supported project types.
- [x] **Step 5:** Record authoritative audit findings in research notes.

### Task 6: Final anti-overfitting and exact-HEAD verification

**Files:**
- Modify: `docs/superpowers/plans/2026-08-15-universality-stress-audit-3.md`

**Interfaces:**
- Consumes: final `main` tree and CI evidence.
- Produces: auditable final status.

- [x] **Step 1:** Run full `npm test` in GitHub Actions on the implementation state and require zero failures, including real public npm integration.
- [x] **Step 2:** Run `npm run verify` and require `current-3d-engineering@1.3.0; architecture=project-first,provenance-first`.
- [x] **Step 3:** Inspect the active tree and tests for scenario/persona/support-list regression and legacy `${PLUGIN_ROOT}`/`recommendedVersion` terminology; require none in active behavior.
- [x] **Step 4:** Verify final README install flow and current required manifest fields.
- [x] **Step 5:** Record red/green evidence in the ledger; run CI again on this ledger-closing HEAD before any completion claim.
- [x] **Step 6:** Verify `main` remains the only branch; the exact ledger-closing HEAD and its CI result are the final external completion evidence and are reported without another tree mutation.

## Verification evidence

### Red gate

Commit `6cf51ea8bf9a0171dca1847786caa44267d1c7b1` introduced the third-audit property tests before production corrections. GitHub Actions run `31897353429` executed 29 tests: 21 passed and 8 failed. Every pre-existing contract, including real public npm integration, remained green. The eight failures corresponded to the newly identified defects: current manifest validation, skill-host script portability, developer-state/materialization safety, execution trust, persisted 3D data semantics, compatibility-neutral npm naming, truthful private/scoped npm scope, and complete installation flow.

### Implementation green gate

Commit `db6ec75be4949faa2450686aeeba1072a8ab411d` completed the executable and public-documentation corrections. GitHub Actions run `31897642026` executed 29 tests: 29 passed and 0 failed. The suite continued to query the real public npm registry for integration claims. `npm run verify` returned:

```text
Plugin structure valid: current-3d-engineering@1.3.0; architecture=project-first,provenance-first
```

### Final-head rule

This ledger commit is intentionally the last repository mutation for the audit. Its GitHub Actions run must pass the same complete suite and structure validation before completion is claimed. The final run ID and exact HEAD are reported from GitHub Actions externally so recording them cannot create an infinite sequence of new unverified documentation commits.
