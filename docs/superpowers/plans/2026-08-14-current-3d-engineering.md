# Current 3D Engineering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify an installable, current-source-first ChatGPT/Codex plugin for real-world JavaScript/TypeScript 3D engineering.

**Architecture:** A skill-only OpenAI plugin keeps the workflow stable while using host research tools and a bundled npm registry resolver for volatile package facts. Heavy source/routing/scenario guidance lives in references, and deterministic Node tests validate packaging plus at least ten end-to-end developer workflows.

**Tech Stack:** OpenAI plugin manifest + Agent Skill Markdown + Node.js built-ins + GitHub Actions.

## Global Constraints

- `main` is authoritative and must remain ahead of any other branch.
- Current version/API claims require current authoritative verification; do not rely on model memory.
- Stable releases are the default; prereleases require explicit user intent.
- No Reddit, Medium, Wikipedia, personal blogs, or unsourced snippets as default evidence.
- Minimum ten end-to-end real-world scenarios; each must have objective completion checks.
- Keep dependencies at zero unless an external package materially improves correctness/maintainability.

---

### Task 1: Contract-first plugin skeleton

**Files:** `tests/plugin.test.mjs`, `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `package.json`

**Interfaces:** The manifest exposes `./skills/`; the marketplace exposes the root plugin; tests consume both JSON files.

- [x] Write failing structural tests for the empty repository.
- [x] Run them and confirm failure occurs because required plugin files do not exist.
- [x] Add only the manifest/marketplace/package metadata needed by the contract.
- [x] Run the complete local test suite and confirm these assertions pass.

### Task 2: Current-source skill and evidence policy

**Files:** `skills/current-3d-engineering/SKILL.md`, `references/source-policy.md`, `references/library-routing.md`

**Interfaces:** `SKILL.md` links all references; source policy defines evidence; routing maps verified needs to libraries.

- [x] Add discoverable trigger-only frontmatter.
- [x] Require date/project inspection and external verification before version-sensitive code.
- [x] Define source hierarchy, stable/prerelease rule, offline behavior, and conflict handling.
- [x] Define engine/library routing plus rendering, lifecycle, responsive, asset, and SSR invariants.
- [x] Run contract tests and structure validator locally.

### Task 3: Live npm resolver

**Files:** `skills/current-3d-engineering/scripts/resolve-packages.mjs`, `tests/plugin.test.mjs`

**Interfaces:** CLI accepts repeated `--package`, `--project`, `--registry`, and `--json`; JSON output exposes `latestTag`, `latestStable`, `recommendedVersion`, peers and engines.

- [x] Add a failing end-to-end test using a local mock registry whose `latest` tag is prerelease.
- [x] Implement registry fetch, stable semantic-version selection, project spec inspection, and clear failures with Node built-ins only.
- [x] Verify the mock-registry test chooses the highest stable version and returns peer metadata.
- [x] Smoke-test `--help` and structural validation.

### Task 4: Twelve real-world acceptance flows

**Files:** `tests/scenarios.json`, `skills/current-3d-engineering/references/scenarios.md`

**Interfaces:** Every JSON scenario has `id`, `title`, `request`, and `doneWhen`; the Markdown reference contains every ID.

- [x] Encode twelve scenarios covering greenfield, framework integration, upgrades, assets, rendering backends, physics, engines, geospatial, XR, performance, and SSR.
- [x] Give each scenario at least four objective completion gates.
- [x] Mirror every scenario in the human workflow reference.
- [x] Run scenario completeness tests locally.

### Task 5: CI, documentation, and release verification

**Files:** `.github/workflows/ci.yml`, `README.md`, `LICENSE`, `skills/current-3d-engineering/scripts/validate-plugin.mjs`

**Interfaces:** `npm test` runs behavior/contract tests; `npm run verify` validates plugin structure; CI runs both on main pushes and PRs.

- [x] Add deterministic CI with Node 22 and read-only repository permissions.
- [x] Document install, invocation, live version resolution, scenario coverage, and repository policy.
- [x] Add independent structure validator and MIT license.
- [x] Run `npm test` locally: 10/10 passing.
- [x] Run `npm run verify` locally: plugin valid; 12 scenarios.
- [ ] Verify the complete remote tree on `main`.
- [ ] Verify branch topology keeps `main` authoritative/ahead.
- [ ] Verify the GitHub Actions run succeeds on the final commit.
