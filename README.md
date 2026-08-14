# Current 3D Engineering

A ChatGPT/Codex plugin that prevents stale-memory 3D implementation by requiring current package, API, browser, and standards verification before code is written or changed.

## What it covers

The plugin routes work across Three.js, React Three Fiber, Drei, Babylon.js, PlayCanvas, CesiumJS, Rapier, glTF Transform, glTF/GLB pipelines, WebGL, WebGPU, and WebXR. It is intentionally **skill-only**: current OpenAI plugin architecture supports skills without an MCP server, so the plugin uses the host's research/code tools plus a bundled zero-dependency npm-registry resolver instead of inventing an unnecessary service.

It does not assume that today's versions remain current. The skill instructs the model to derive the execution date, inspect the project, resolve current package metadata, and verify exact APIs against primary documentation every time the result is version-sensitive.

## Install / test as a repo marketplace

This repository contains `.agents/plugins/marketplace.json`, with the plugin at the repository root. With current Codex plugin tooling:

```bash
codex plugin marketplace add AahPlexX/3djs --ref main
codex plugin marketplace list
```

Then restart the ChatGPT desktop app, select the `AahPlexX 3D Plugins` marketplace source in the Plugins Directory, and install **Current 3D Engineering**. Local/plugin-directory availability depends on the host account/workspace features described by OpenAI.

## Invoke

Use the plugin explicitly when desired, or let its skill description trigger on relevant work. Example requests:

```text
Use Current 3D Engineering to upgrade this React Three Fiber app safely.
Use Current 3D Engineering to add WebGPU with a WebGL fallback.
Use Current 3D Engineering to diagnose this Cesium production asset failure.
```

## Current package resolver

The resolver queries the npm registry at execution time and reports project specs, the npm `latest` tag, the highest stable semantic version, the recommended stable version, peer dependencies, engine requirements, and basic package metadata.

```bash
node skills/current-3d-engineering/scripts/resolve-packages.mjs --json
node skills/current-3d-engineering/scripts/resolve-packages.mjs --project . --json
node skills/current-3d-engineering/scripts/resolve-packages.mjs --package three --package @react-three/fiber --json
```

If npm's `latest` tag points at a prerelease, the resolver does **not** silently recommend it; it reports the condition and selects the highest stable semantic version instead.

## Validation

No third-party test dependency is required.

```bash
npm test
npm run verify
```

The contract suite validates plugin packaging, skill discovery, authoritative-source policy, marketplace wiring, scenario completeness, resolver behavior against the live public npm registry, and CI wiring. `npm test` therefore requires network access to `https://registry.npmjs.org`; registry outages fail the integration tests instead of being hidden by simulated data.

## End-to-end scenario coverage

Twelve required flows are encoded in `tests/scenarios.json` and explained in `skills/current-3d-engineering/references/scenarios.md`:

1. Three.js + Vite TypeScript greenfield scene
2. React Three Fiber/Drei integration
3. Safe 3D dependency upgrades
4. glTF/GLB optimization and production loading
5. WebGPU progressive enhancement + fallback
6. Rapier physics
7. Babylon.js viewer/application
8. PlayCanvas app/game
9. CesiumJS geospatial/3D Tiles
10. WebXR immersive mode
11. Mobile GPU performance/memory diagnosis
12. SSR/hybrid framework integration

## Design principles

- **Current evidence beats memory.** Registry + official docs are mandatory for version-sensitive decisions when network access exists.
- **Stable by default.** Alpha/beta/RC/canary releases are not selected unless requested.
- **Existing architecture wins.** The skill preserves the project's stack unless a change is required.
- **Smallest sufficient dependency layer.** Three.js, R3F, Babylon, PlayCanvas, Cesium, and Rapier are not interchangeable defaults.
- **Proof before completion claims.** Tests/build/browser/device checks are matched to the work actually performed.

## Repository policy

`main` is the authoritative development branch. Changes should land only after `npm test` and `npm run verify` pass. Avoid long-lived branches that diverge from `main`.
