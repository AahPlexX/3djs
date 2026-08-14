---
name: current-3d-engineering
description: Use when building, debugging, upgrading, or reviewing JavaScript or TypeScript 3D, WebGL, WebGPU, WebXR, glTF, physics, or 3D geospatial code, especially when package versions, APIs, browser support, or ecosystem compatibility may have changed.
---

# Current 3D Engineering

## Core rule

Never write or change 3D integration code from remembered package/API state alone. Establish the current date, inspect the project, verify current stable dependency and API facts from authoritative sources, then implement and prove the result.

Read `references/source-policy.md` before researching, `references/library-routing.md` before selecting or changing a library, and `references/scenarios.md` when the request matches a common end-to-end workflow.

## 1. Establish project truth

Before installation or code changes, inspect the repository's package manifest, lockfile, framework, React version when present, TypeScript/configuration, bundler, target browsers/devices, existing 3D packages, tests, and deployment environment. Preserve the existing stack unless the request requires a change.

Derive the current date from the host/runtime. Never infer the date from this skill's files.

## 2. Establish external truth

When network access exists, verify package metadata from npm's registry and the exact API/feature in the library's official documentation. In Codex or another shell-capable host, run:

```bash
node "${PLUGIN_ROOT}/skills/current-3d-engineering/scripts/resolve-packages.mjs" --project . --json
```

Use `--package <name>` repeatedly to narrow the check. The resolver distinguishes npm's `latest` tag from the highest stable semantic version and reports peer dependencies.

For Web APIs use MDN plus the applicable W3C/Khronos standard. If sources conflict, follow `references/source-policy.md`; do not guess. If current external verification is unavailable, say so and limit changes to facts provable from the repository. Never infer a latest version.

## 3. Route by project need

Choose the smallest suitable layer; do not add an engine because it is popular. Use the routing matrix in `references/library-routing.md`. Check peer dependencies before installs/upgrades, especially React/Fiber integrations and wrapper libraries. Do not select prerelease/canary/alpha/beta/RC packages unless explicitly requested.

## 4. Implement with graphics invariants

Preserve responsive sizing and correct resize handling. Feature-detect WebGPU/WebXR and provide the project's required fallback. Keep browser-only graphics initialization out of server execution. Use one authoritative render loop. Base animation/simulation on elapsed/delta time where appropriate. Dispose GPU/WASM/event resources on teardown. Treat glTF as runtime delivery, not an authoring format. Never expose service tokens or secrets in code that should remain server-side.

## 5. Verify before claiming completion

Run the repository's own tests, typecheck, lint, and production build when those commands exist. For client-side work, also exercise representative browser/device sizes, inspect console/runtime errors, verify asset loading and fallbacks, and check teardown/re-entry behavior. Reproduce the original failure for bug fixes. Report what was actually verified and any environment limitation.
