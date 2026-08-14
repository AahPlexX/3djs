# Current 3D Engineering

A ChatGPT/Codex plugin for current-source-first JavaScript and TypeScript 3D/graphics engineering. It requires the agent to inspect the actual project, resolve current dependency metadata, verify exact APIs against authoritative sources, implement against the discovered architecture, and prove the result before claiming completion.

## Universal project support

The plugin is intentionally **not** built around a catalog of predefined project types, personas, engines, or user journeys. An unfamiliar renderer, engine, framework adapter, physics package, asset tool, geospatial library, XR integration, type package, build tool, or deployment architecture is treated as a first-class input.

The operating model is:

```text
actual request + actual repository
            ↓
project/dependency/import/runtime inspection
            ↓
current authoritative package + API research
            ↓
smallest coherent project-specific change
            ↓
project-specific verification evidence
```

A package does not need to be named in this repository for the plugin to work with it. The plugin discovers what the project uses and researches that technology from its own maintainer documentation/upstream source at execution time.

The plugin is skill-only: it uses host repository/research/code capabilities plus a bundled zero-dependency npm-registry resolver rather than adding an unnecessary remote service.

## Install / test as a repo marketplace

This repository contains `.agents/plugins/marketplace.json`, with the plugin at the repository root. With current Codex plugin tooling:

```bash
codex plugin marketplace add AahPlexX/3djs --ref main
codex plugin marketplace list
```

Then restart the ChatGPT desktop app, select the `AahPlexX 3D Plugins` marketplace source in the Plugins Directory, and install **Current 3D Engineering**. Local/plugin-directory availability depends on the host account/workspace features described by OpenAI.

## Invoke

Use the plugin explicitly when desired, or let its skill description trigger on relevant work. Examples:

```text
Use Current 3D Engineering to add this 3D feature using the architecture already in my repository.
Use Current 3D Engineering to diagnose this graphics runtime/build failure without replacing my existing stack.
Use Current 3D Engineering to verify and safely upgrade the dependencies involved in this 3D feature.
```

These prompts are examples only; they are not encoded routing paths.

## Current package resolver

The resolver queries npm registry metadata at execution time. It has **no recognized-package allowlist** and no implicit default ecosystem.

Use project mode to resolve every direct dependency declared in `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`:

```bash
node skills/current-3d-engineering/scripts/resolve-packages.mjs --project . --json
```

Or resolve any package name explicitly:

```bash
node skills/current-3d-engineering/scripts/resolve-packages.mjs --package <package-name> --json
node skills/current-3d-engineering/scripts/resolve-packages.mjs --package <package-a> --package <package-b> --json
```

The resolver reports the project spec when present, npm's `latest` tag, the highest stable semantic version, a stable recommendation, peer dependencies, engine requirements, deprecation metadata, and basic upstream metadata. If `latest` points at a prerelease, the resolver does not silently recommend it.

A project dependency that cannot be resolved from the selected registry is reported as a real failure rather than being silently excluded. Use `--registry <url>` when the relevant package belongs to an alternate/private npm-compatible registry and the execution environment has the required access.

## Generic routing and invariants

`skills/current-3d-engineering/references/project-routing.md` defines project-first discovery and decision rules. It does not choose from a fixed engine matrix.

`skills/current-3d-engineering/references/engineering-invariants.md` defines reusable correctness properties such as dependency compatibility, type availability, runtime boundaries, ownership/lifecycle, time handling, responsive rendering, optional capability detection, assets/deployment, security, failure handling, and evidence-based verification. Only invariants relevant to the actual project are applied.

## Validation

No third-party test dependency is required.

```bash
npm test
npm run verify
```

The contract suite validates plugin packaging, skill discovery, authoritative-source policy, marketplace wiring, absence of encoded workflow/persona contracts, open-ended resolver behavior, full direct-dependency discovery from a temporary project manifest, agreement with independently fetched live npm manifests, real-endpoint integration, and CI wiring.

`npm test` requires network access to `https://registry.npmjs.org`; registry outages fail the live integration tests instead of being hidden by simulated data.

## Design principles

- **Project evidence beats templates.** The repository/request decides the work; no predefined project catalog decides it first.
- **Current evidence beats memory.** Version-sensitive decisions require current registry + first-party API evidence when available.
- **Unknown is researchable, not unsupported.** New libraries do not require a plugin update merely to become eligible.
- **Stable by default.** Prerelease channels require explicit intent or an already-established project requirement.
- **Existing architecture wins.** Do not swap an unfamiliar dependency for a familiar one merely to fit a known pattern.
- **Smallest coherent change.** Preserve unrelated code, dependencies, and lockfile state.
- **Proof before completion claims.** Verification must exercise the actual changed project path and target environment.

## Repository policy

`main` is the authoritative development branch. Changes should land only after `npm test` and `npm run verify` pass. Avoid long-lived branches that diverge from `main`.