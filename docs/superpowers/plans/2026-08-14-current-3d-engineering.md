# Current 3D Engineering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify an installable, current-source-first ChatGPT/Codex plugin for real-world JavaScript/TypeScript 3D engineering.

**Architecture:** A skill-only OpenAI plugin keeps the workflow stable while using host research tools and a bundled npm registry resolver for volatile package facts. Heavy source/routing/scenario guidance lives in references, deterministic Node tests validate packaging and scenario contracts, and networked integration tests validate the resolver against the real public npm registry.

**Tech Stack:** OpenAI plugin manifest + Agent Skill Markdown + Node.js built-ins + GitHub Actions.

## Global Constraints

- `main` is authoritative and must remain ahead of any other branch.
- Current version/API claims require current authoritative verification; do not rely on model memory.
- Stable releases are the default; prereleases require explicit user intent.
- No Reddit, Medium, Wikipedia, personal blogs, or unsourced snippets as default evidence.
- Minimum ten end-to-end real-world scenarios; each must have objective completion checks.
- Keep dependencies at zero unless an external package materially improves correctness/maintainability.
- External integration claims must use the real authoritative endpoint; loopback servers and fabricated remote payloads are not accepted as integration evidence.

---

### Task 1: Contract-first plugin skeleton

**Files:** `tests/plugin.test.mjs`, `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, `package.json`

**Interfaces:** The manifest exposes `./skills/`; the marketplace exposes the root plugin; tests consume both JSON files.

- [x] Write failing structural tests for the empty repository.
- [x] Run them and confirm failure occurs because required plugin files do not exist.
- [x] Add only the manifest/marketplace/package metadata needed by the contract.
- [x] Run the complete local baseline test suite and confirm these assertions pass.

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

- [x] Implement registry fetch, stable semantic-version selection, project spec inspection, and clear failures with Node built-ins only.
- [x] Require `https://registry.npmjs.org` as the default authoritative public registry.
- [x] Preserve custom `--registry` support for legitimate private or alternate npm registries.
- [x] Smoke-test `--help` and structural validation.

### Task 4: Twelve real-world acceptance flows

**Files:** `tests/scenarios.json`, `skills/current-3d-engineering/references/scenarios.md`

**Interfaces:** Every JSON scenario has `id`, `title`, `request`, and `doneWhen`; the Markdown reference contains every ID.

- [x] Encode twelve scenarios covering greenfield, framework integration, upgrades, assets, rendering backends, physics, engines, geospatial, XR, performance, and SSR.
- [x] Give each scenario at least four objective completion gates.
- [x] Mirror every scenario in the human workflow reference.
- [x] Run scenario completeness tests locally.

### Task 5: CI, documentation, and initial release verification

**Files:** `.github/workflows/ci.yml`, `README.md`, `LICENSE`, `skills/current-3d-engineering/scripts/validate-plugin.mjs`

**Interfaces:** `npm test` runs behavior/contract tests; `npm run verify` validates plugin structure; CI runs both on main pushes and PRs.

- [x] Add deterministic CI with Node 22 and read-only repository permissions.
- [x] Document install, invocation, live version resolution, scenario coverage, and repository policy.
- [x] Add independent structure validator and MIT license.
- [x] Verify the complete remote tree on `main`.
- [x] Verify branch topology keeps `main` authoritative/ahead.
- [x] Verify the initial GitHub Actions run succeeds.

### Task 6: Real-endpoint integration enforcement — v1.0.1

**Files:** `tests/plugin.test.mjs`, `skills/current-3d-engineering/references/source-policy.md`, `README.md`, `research/2026-08-14.md`, `.codex-plugin/plugin.json`, `package.json`, `.github/workflows/ci.yml`

**Interfaces:** Integration tests query the public npm registry directly and compare representative live manifests with the resolver's real output.

- [x] Add a failing guard that detects loopback registry replacement infrastructure.
- [x] Remove the local HTTP registry server and fabricated package metadata from the integration suite.
- [x] Query the real `/latest` npm manifests for every tracked core 3D package.
- [x] Compare live `three`, `@react-three/fiber`, and `cesium` manifests with the resolver's output without hardcoding current version numbers.
- [x] Add bounded live-request timeouts/retries and explicit HTTP success checks.
- [x] Require real authoritative endpoints for future integration claims in source policy.
- [x] Verify locally that the repository contains no loopback/local registry replacement patterns and that `npm run verify` passes for v1.0.1.
- [x] Verify the complete v1.0.1 live integration suite in networked GitHub Actions: 12/12 tests pass, 0 failed, plus plugin structure validation.
- [x] Update CI to current official stable `actions/checkout@v7.0.1` and `actions/setup-node@v7.0.0`, then verify the final workflow run succeeds without the prior deprecated action-runtime warning.
- [x] Re-verify branch topology: `main` is the repository's only branch and remains authoritative.
