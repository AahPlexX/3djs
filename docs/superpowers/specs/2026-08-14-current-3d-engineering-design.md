# Current 3D Engineering Plugin Design

## Goal

Create a ChatGPT/Codex plugin that makes version-sensitive 3D engineering current-source-first, routes work to the smallest appropriate 3D layer, and prevents stale API/package assumptions from reaching implementation.

## Architecture

The plugin is a skill-only OpenAI plugin with a required `.codex-plugin/plugin.json` manifest and one discoverable skill. It intentionally does not ship an MCP server: the job needs a durable workflow, source policy, references, and optional executable package resolution, while the host already supplies repository, browser/search, and code execution capabilities.

The skill is thin and stable. Volatile domain detail lives in references and is re-verified at execution time. A zero-dependency Node script resolves npm metadata and distinguishes the registry's `latest` tag from the highest stable semantic version. It also reports peer/engine constraints and project dependency specs.

## Components

- `.codex-plugin/plugin.json`: installable plugin manifest.
- `.agents/plugins/marketplace.json`: repo-scoped marketplace entry pointing at the root plugin.
- `skills/current-3d-engineering/SKILL.md`: trigger and mandatory current-source workflow.
- `references/source-policy.md`: evidence hierarchy, banned default sources, stable/prerelease and conflict rules.
- `references/library-routing.md`: engine/library selection and integration invariants.
- `references/scenarios.md`: human-readable end-to-end scenario workflows.
- `scripts/resolve-packages.mjs`: live npm metadata resolver.
- `scripts/validate-plugin.mjs`: deterministic structural validation.
- `tests/scenarios.json`: machine-checkable scenario contract.
- `tests/plugin.test.mjs`: offline contract and resolver behavior tests.
- `.github/workflows/ci.yml`: main/PR verification.

## Data flow

1. A request triggers the skill by explicit invocation or description match.
2. The agent derives the current date and inspects the target repository/environment.
3. The agent verifies package release/peer metadata through npm and exact APIs through primary library documentation; web APIs additionally use MDN plus W3C/Khronos where applicable.
4. The routing reference selects/preserves the smallest suitable library layer.
5. The agent implements against the verified version and the project's existing conventions.
6. Repository checks plus relevant browser/device/runtime flows are run before success is claimed.

## Failure behavior

- Network unavailable: never call remembered data "latest"; use only local package/lock/type/source evidence and report the limitation.
- npm `latest` is prerelease: report it and recommend the highest stable semantic version unless the user requested prerelease.
- Official sources conflict: stop the affected decision, distinguish publication/version/API claims, and use version-specific evidence; do not guess.
- Peer dependency mismatch: do not install an incoherent package set; resolve the compatible set or explain the block.
- Browser feature unavailable: capability-detect and take the product's defined fallback path.

## Scenario acceptance

At least ten end-to-end developer workflows are required. Version 1.0 ships twelve: Three/Vite, R3F/Drei, upgrades, glTF, WebGPU, Rapier, Babylon, PlayCanvas, Cesium, WebXR, mobile GPU diagnostics, and SSR/hybrid boundaries.

Each scenario has a request plus at least four objective completion checks and must exist in both the machine catalog and human reference.

## Non-goals

- Reimplementing library documentation inside a frozen prompt.
- Running a custom remote service when authoritative package/docs sources already exist.
- Choosing one 3D engine for all projects.
- Silently upgrading unrelated dependencies.
- Treating prerelease releases as stable by recency alone.
