---
name: current-3d-engineering
description: Use when building, debugging, upgrading, reviewing, or integrating JavaScript or TypeScript 3D/graphics software where package versions, APIs, browser capabilities, build tooling, assets, runtime boundaries, or ecosystem compatibility may have changed.
---

# Current 3D Engineering

## Core rule

Never write or change 3D integration code from remembered package/API state alone. Establish the current date, inspect the actual project and request, verify current dependency/API facts from authoritative sources, then implement and prove the result.

Read `references/source-policy.md` before researching, `references/project-routing.md` before deciding what must change, and `references/engineering-invariants.md` before implementation and verification.

Do not classify work into predefined scenarios, personas, supported-library lists, or workflow IDs. An unfamiliar package or architecture is a first-class input: discover what the project actually uses and research that technology from its own authoritative sources.

## 1. Establish project truth

Before installation or code changes, inspect the repository evidence relevant to the request: package manifest and lockfile, package-manager configuration, source imports, framework/runtime boundaries, TypeScript and compiler configuration, bundler/build system, tests, deployment environment, target browsers/devices, assets, and existing graphics/3D dependencies.

Preserve the working architecture unless the request requires a change. Do not replace an unfamiliar engine/library merely because another ecosystem is better known.

Derive the current date from the host/runtime. Never infer the date from this skill's files.

## 2. Establish external truth

When network access exists, verify package metadata from npm's registry and verify the exact API/feature against the discovered package's official maintainer documentation or version-matched upstream source.

For a project-level dependency inventory in a shell-capable host, run:

```bash
node "${PLUGIN_ROOT}/skills/current-3d-engineering/scripts/resolve-packages.mjs" --project . --json
```

Project mode resolves every direct dependency declared by the inspected manifest; it does not filter through a built-in list of recognized libraries. Use repeated `--package <name>` arguments for specific packages, related packages not declared directly, or a narrower check.

The resolver distinguishes npm's `latest` tag from the highest stable semantic version and reports peer dependencies and engine requirements. Package metadata alone does not prove an API: corroborate version-sensitive implementation decisions with authoritative package documentation/source.

For web-platform APIs, use MDN plus the applicable normative standards when available. If sources conflict, follow `references/source-policy.md`; do not guess. If current external verification is unavailable, say so and limit changes to facts provable from the repository. Never infer a latest version.

## 3. Derive the change from the project

Follow `references/project-routing.md`. Determine each relevant component's actual role and dependency relationships from imports, manifests, configuration, runtime behavior, and official documentation. Check peer/optional dependencies, separate declaration packages when applicable, loaders/codecs/workers, build-time tooling, and client/server boundaries before changing versions or architecture.

For greenfield work, derive requirements and constraints first, then research current candidates. Do not select a library from a static preferred list. For existing work, favor the smallest coherent change that preserves the current stack and lockfile unless evidence requires migration.

Do not select prerelease/canary/alpha/beta/RC packages unless explicitly requested or the project already requires that channel and the user accepts it.

## 4. Implement using applicable invariants

Apply only the invariants from `references/engineering-invariants.md` that the actual project needs. Examples include authoritative loop ownership, time-based updates, responsive render-target sizing, capability detection, client/server separation, resource disposal, asset/deployment correctness, type availability, security boundaries, and explicit failure handling.

Do not force a graphics rule onto a project where the underlying runtime owns that concern automatically; establish ownership first.

## 5. Verify the actual result

Run the repository's own tests, typecheck, lint, and production build when those commands exist. Exercise the changed runtime path rather than substituting a generic canned workflow. For client-side work, inspect representative real viewport/device conditions, console/runtime errors, production asset loading, failure/fallback behavior, and teardown/re-entry when applicable.

Reproduce the original failure for bug fixes. Make hardware/browser/service claims only when that environment was actually exercised. Report what was verified and any environment limitation.