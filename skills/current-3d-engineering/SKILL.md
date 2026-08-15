---
name: current-3d-engineering
description: Use when building, debugging, upgrading, reviewing, or integrating 3D or graphics software in any language, runtime, engine, toolchain, platform, or deployment environment where APIs, dependencies, assets, hardware capabilities, build behavior, or compatibility may have changed.
---

# Current 3D Engineering

## Core rule

Never write or change 3D/graphics integration code from remembered ecosystem state alone. Establish the current date, inspect the actual project and request, discover the technologies and ownership boundaries that are really present, verify current dependency/API/toolchain facts from authoritative sources appropriate to those technologies, then implement and prove the result.

Read `references/source-policy.md` before researching, `references/project-routing.md` before deciding what must change, and `references/engineering-invariants.md` before implementation and verification.

Do not classify work into predefined scenarios, personas, supported-language lists, supported-engine lists, package-manager lists, or workflow IDs. An unfamiliar language, build system, dependency source, SDK, engine, editor, renderer, framework, or architecture is a first-class input: discover what the project actually uses and research that technology from its own authoritative sources.

## 1. Establish project truth

Before installation or code changes, inspect the project evidence relevant to the request by responsibility rather than by a fixed filename list. Establish, when applicable:

- dependency declarations and resolved dependency state;
- workspace, module, package, target, or subproject boundaries;
- compiler/interpreter, engine/editor, SDK, toolchain, build-system, and platform versions;
- source imports/includes/module references and runtime entry points;
- generated, vendored, editor-managed, or machine-authored files and the source that owns them;
- build, test, static-analysis, packaging, signing, deployment, and CI commands;
- runtime/process boundaries and target operating systems, CPU/GPU architectures, graphics APIs, drivers/runtimes, devices, and hardware constraints;
- assets, shaders, native libraries, plugins/modules, codecs, workers, generated binaries, and other non-source dependencies.

Preserve the working architecture unless the request requires a change. Do not replace an unfamiliar technology merely because another ecosystem is better known.

Derive the current date from the host/runtime. Never infer the date from this skill's files.

## 2. Establish dependency and external truth from provenance

For every dependency or platform component relevant to the requested change, determine how the project obtains it before attempting version research. Its provenance may be a registry/index, version-control revision, local/workspace path, vendored source, remote archive, operating-system package, SDK/framework, engine/editor package system, generated artifact, system installation, or another mechanism discovered from the project.

Use authoritative evidence appropriate to that provenance. Do not force a registry lookup onto a local, VCS, vendored, SDK, system, or editor-managed dependency. Package metadata alone does not prove an API: corroborate version-sensitive implementation decisions with version-matched first-party documentation, release notes, generated API references, upstream source, platform/SDK documentation, or normative standards when applicable.

For npm-compatible projects only, `scripts/resolve-npm-packages.mjs` is an optional helper for live npm-compatible registry metadata. Use it only after project evidence establishes that npm package metadata is relevant:

```bash
node "${PLUGIN_ROOT}/skills/current-3d-engineering/scripts/resolve-npm-packages.mjs" --project . --json
```

Use repeated `--package <name>` arguments for explicit npm registry packages. The helper is not a universal project detector and is not required for non-npm work.

If sources conflict, follow `references/source-policy.md`; do not guess. If current external verification is unavailable, say so and limit claims to facts provable from the project and locally available toolchain/dependency evidence. Never infer a latest version, revision, SDK, engine/editor release, or compatibility claim from memory.

## 3. Derive the change from the project

Follow `references/project-routing.md`. Determine each relevant component's actual role, provenance, ownership, and compatibility relationships from project files, resolved dependency state, source references, configuration, runtime behavior, and authoritative documentation.

For greenfield work, derive requirements and constraints first, then research current candidates. Do not select a language, engine, renderer, framework, dependency manager, graphics API, or toolchain from a static preferred list. For existing work, favor the smallest coherent change that preserves the current architecture and reproducible dependency/build state unless evidence requires migration.

Respect the project's own versioning and release model. Preserve exact pins, revisions, channels, compatibility ranges, SDK/toolchain versions, or engine/editor versions unless the requested change requires them to move. Do not assume every ecosystem uses semantic versioning or a universal definition of "stable".

## 4. Implement using applicable invariants

Apply only the invariants from `references/engineering-invariants.md` that the actual project exposes. These can include dependency provenance and compatibility, compiler/interpreter/SDK constraints, compile/link/ABI/architecture compatibility, render/update ownership, time-based simulation, resource lifetime, shader/build ownership, generated/editor-managed file ownership, responsive rendering, capability detection, client/server/native boundaries, asset/deployment correctness, security/permissions, and explicit failure handling.

Do not force a browser rule, native rule, engine rule, package rule, or lifecycle rule onto a project where that concern does not exist or is owned automatically by another layer; establish ownership first.

## 5. Verify the actual result

Run the repository/project's own applicable verification commands rather than assuming npm scripts or a web build. This may include tests, type checking, compilation, linking, static analysis, engine/editor validation, shader compilation, packaging, signing, deployment builds, runtime smoke tests, or hardware/device checks, depending on the project.

Exercise the changed runtime path in the environment that matters to the request. Reproduce the original failure for bug fixes. Make browser, OS, architecture, GPU, driver, SDK, engine/editor, service, or physical-hardware claims only when that target was actually exercised or authoritative evidence directly proves the narrow claim. Report what was verified and every material environment limitation.