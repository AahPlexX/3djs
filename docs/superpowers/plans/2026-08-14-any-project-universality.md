# Any-Project Universality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the remaining JavaScript/npm/web assumptions so Current 3D Engineering is eligible for 3D/graphics work in any developer project while keeping npm tooling as an optional, correctly scoped helper.

**Architecture:** The skill and references become provenance-first and ecosystem-agnostic. Project evidence determines dependency sources, toolchains, build/runtime boundaries, generated/editor-managed ownership, and verification. The npm resolver is renamed and hardened so npm-specific behavior is explicit and non-registry npm specs are preserved instead of falsely treated as registry failures.

**Tech Stack:** OpenAI skill Markdown, Node.js ESM, built-in `fetch`, `node:test`, GitHub Actions.

## Global Constraints

- No language, engine, framework, package manager, registry, build system, or deployment catalog may act as a support boundary.
- No scenario IDs, personas, or finite project-type routing.
- Unknown technologies remain first-class inputs and trigger evidence discovery.
- Ecosystem-specific utilities are optional helpers only after project evidence proves they apply.
- External integration evidence must use the real authoritative service when that integration is being claimed.
- `main` remains the sole authoritative branch.

---

### Task 1: Add failing universality contracts

**Files:**
- Modify: `tests/plugin.test.mjs`

**Interfaces:**
- Consumes: skill, manifest, references, npm helper source.
- Produces: property tests that fail while JS/npm/web eligibility assumptions remain.

- [ ] **Step 1:** Add assertions that skill/manifest descriptions do not restrict eligibility to JavaScript, TypeScript, browser, or web projects.
- [ ] **Step 2:** Add assertions that source policy starts from generic project/dependency provenance rather than requiring `package.json` or npm for every project.
- [ ] **Step 3:** Add assertions that project routing covers workspace/subproject, generated/editor-managed, toolchain/SDK, native/compiled, and polyglot concerns without a finite ecosystem catalog.
- [ ] **Step 4:** Add assertions that the npm helper is named `resolve-npm-packages.mjs`, is described as optional/npm-specific, and the old ambiguous helper path is absent.
- [ ] **Step 5:** Add a project-mode test with registry-backed, npm-alias, and non-registry dependency specs; require registry entries to resolve, alias identity to be preserved, and non-registry specs to be reported without process failure.
- [ ] **Step 6:** Run GitHub Actions and require the new contracts to fail for the expected old assumptions before production changes.

### Task 2: Generalize the skill and evidence policy

**Files:**
- Modify: `skills/current-3d-engineering/SKILL.md`
- Modify: `skills/current-3d-engineering/references/source-policy.md`
- Modify: `skills/current-3d-engineering/references/project-routing.md`
- Modify: `skills/current-3d-engineering/references/engineering-invariants.md`

**Interfaces:**
- Consumes: actual request, repository/project evidence, discovered dependency/toolchain provenance.
- Produces: ecosystem-agnostic research, implementation, and verification instructions.

- [ ] **Step 1:** Broaden skill trigger/description from JavaScript/TypeScript web graphics to 3D/graphics engineering across arbitrary project languages/runtimes/toolchains.
- [ ] **Step 2:** Replace package.json/npm-first project truth with responsibility-based evidence discovery: manifests/resolved state, workspaces, source imports, toolchain/SDK/engine/editor versions, generated/vendor ownership, build/runtime/deployment targets.
- [ ] **Step 3:** Make external-source selection provenance-driven; npm/MDN/W3C/Khronos become conditional sources when relevant, not mandatory universal sources.
- [ ] **Step 4:** Replace global semantic-version stable rules with project/ecosystem version-channel rules while retaining npm semver logic inside the npm helper.
- [ ] **Step 5:** Add native/toolchain/build invariants: compiler/interpreter/SDK compatibility, compile/link/ABI/architecture, shader compilation ownership, generated/editor-managed files, feature/build configuration, device/driver evidence.
- [ ] **Step 6:** Run focused contracts and require them to pass.

### Task 3: Scope and harden the npm helper

**Files:**
- Create: `skills/current-3d-engineering/scripts/resolve-npm-packages.mjs`
- Delete: `skills/current-3d-engineering/scripts/resolve-packages.mjs`
- Modify: `tests/plugin.test.mjs`
- Modify: `skills/current-3d-engineering/scripts/validate-plugin.mjs`

**Interfaces:**
- Consumes: explicit npm package names or one npm-compatible `package.json` selected by the agent.
- Produces: registry metadata for registry-backed specs plus preserved records for non-registry specs.

- [ ] **Step 1:** Rename the helper and update CLI help so it explicitly states npm scope and optional use.
- [ ] **Step 2:** Add `classifyProjectDependency(declaredName, spec)` behavior that distinguishes normal registry dependencies, `npm:` aliases, and non-registry/local/VCS/protocol specs.
- [ ] **Step 3:** For `npm:` aliases, query the target registry package while preserving `declaredName`, `registryName`, and original `installedSpec` in output.
- [ ] **Step 4:** For non-registry specs, do not issue a registry request and do not add a failure; return them under `nonRegistryDependencies` with declared name/spec and a provenance classification.
- [ ] **Step 5:** Keep explicit `--package` behavior for arbitrary registry package names and real npm endpoint validation.
- [ ] **Step 6:** Update structure validation to require the renamed npm helper and reject the old ambiguous path.
- [ ] **Step 7:** Run all tests and require live npm checks to pass.

### Task 4: Align public metadata and documentation

**Files:**
- Modify: `.codex-plugin/plugin.json`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `research/2026-08-14.md`

**Interfaces:**
- Consumes: universal architecture and optional npm helper behavior.
- Produces: accurate plugin discovery text and maintainer documentation.

- [ ] **Step 1:** Bump repo/plugin version to `1.2.0` and keep versions synchronized.
- [ ] **Step 2:** Remove JavaScript/TypeScript/web-only discovery text and keywords that imply eligibility limits; retain 3D/graphics purpose.
- [ ] **Step 3:** Document that project support is independent of dependency manager or registry and that npm tooling is optional.
- [ ] **Step 4:** Document dependency provenance and non-registry npm behavior without presenting an ecosystem catalog.
- [ ] **Step 5:** Update research notes with the generalized audit finding and authoritative evidence model.

### Task 5: Final anti-overfitting and real-endpoint verification

**Files:**
- Modify: `docs/superpowers/plans/2026-08-14-any-project-universality.md`

**Interfaces:**
- Consumes: final `main` tree and GitHub Actions results.
- Produces: auditable completion evidence.

- [ ] **Step 1:** Run `npm test` in GitHub Actions; require zero failures and real public npm integration success for npm-specific tests.
- [ ] **Step 2:** Run `npm run verify`; require `current-3d-engineering@1.2.0` and project-first/provenance-first validation.
- [ ] **Step 3:** Inspect the final tree for the old `resolve-packages.mjs`, JS/TS eligibility language in active plugin metadata, scenario/persona fixtures, or package allowlists; require none.
- [ ] **Step 4:** Verify `main` is the repository's only branch and final HEAD CI succeeds.
- [ ] **Step 5:** Record red and green evidence in this plan only after the corresponding runs complete.