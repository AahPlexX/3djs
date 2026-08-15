# Current 3D Engineering

A ChatGPT/Codex plugin for current-source-first 3D and graphics engineering across arbitrary project languages, runtimes, engines, toolchains, dependency systems, and target platforms. It requires the agent to inspect the actual project, discover dependency/toolchain provenance and ownership, verify exact APIs and compatibility against authoritative sources appropriate to that technology, implement against the discovered architecture, and prove the result before claiming completion.

## Universal project support

The plugin's domain is **3D/graphics engineering**. Within that domain, project eligibility is not restricted by language, engine, framework, package manager, registry, build system, editor, SDK, operating system, graphics API, or deployment model.

It is intentionally **not** built around a catalog of predefined project types, personas, engines, user journeys, manifest filenames, or supported ecosystems. An unfamiliar technology is treated as a first-class research input.

The operating model is:

```text
actual request + actual project
            ↓
relevant roots / ownership / dependency provenance / toolchain discovery
            ↓
current authoritative evidence selected for those discovered technologies
            ↓
smallest coherent project-specific change
            ↓
verification in the project's actual build/runtime/target boundaries
```

A technology does not need to be named in this repository for the plugin to work with it. Unknown technology triggers project inspection and first-party research; it does not trigger substitution with a familiar stack.

## Provenance-first dependency reasoning

The plugin determines **how the project actually obtains each relevant component before looking up versions**. Depending on project evidence, a dependency may be registry/index-backed, VCS-pinned, local/workspace-linked, vendored, SDK/framework-provided, engine/editor-managed, system-installed, generated, binary, remotely archived, or sourced through another project-defined mechanism.

Those labels are evidence categories, not a support list. If a project uses a different mechanism, the agent follows that mechanism's authoritative source.

Version semantics are also project/ecosystem-defined. The plugin does not globally assume semantic versioning, a `latest` tag, or one universal meaning of stable. It preserves the project's pins, revisions, channels, SDK/toolchain versions, engine/editor versions, and resolution state unless the requested change requires movement.

## Multi-root, polyglot, native, and managed projects

The plugin does not assume one manifest represents an entire repository. It scopes the requested behavior across the relevant workspaces, subprojects, modules, targets, languages, generated bindings, native boundaries, editor/engine state, and build systems.

Before editing, it determines whether files are authoritative source, generated output, vendored code, editor/engine-managed state, cached/intermediate output, or checked-in artifacts. For native/compiled work it can apply compile/link/ABI/architecture/toolchain/SDK invariants; for shader pipelines it identifies the actual source-to-binary ownership and target graphics environment. These checks are conditional on the real project rather than forced onto every project.

## Optional npm metadata helper

The plugin ships one ecosystem-specific convenience utility:

```bash
skills/current-3d-engineering/scripts/resolve-npm-packages.mjs
```

This helper is **optional and npm-specific**. It is not the plugin's universal project detector and is not required for non-npm projects.

Use it only when project evidence establishes that npm-compatible package metadata is relevant:

```bash
node skills/current-3d-engineering/scripts/resolve-npm-packages.mjs --project . --json
```

Or resolve arbitrary npm registry package names explicitly:

```bash
node skills/current-3d-engineering/scripts/resolve-npm-packages.mjs --package <package-name> --json
node skills/current-3d-engineering/scripts/resolve-npm-packages.mjs --package <package-a> --package <package-b> --json
```

For registry-backed npm dependencies it reports declared identity, registry identity, original project spec, provenance, npm's `latest` tag, highest stable semantic version, stable recommendation, peer dependencies, engine requirements, deprecation metadata, and basic upstream metadata.

Project mode understands that npm dependency specs are not all public-registry package names. `npm:` aliases are resolved against their target registry package while retaining the declared alias. Local/workspace/VCS/protocol specs are preserved under `nonRegistryDependencies` and are **not** turned into false public-registry 404 failures. Real registry-backed failures remain visible.

Use `--registry <url>` when the relevant npm package belongs to an alternate/private npm-compatible registry and the execution environment has the required access.

## Generic routing and invariants

`skills/current-3d-engineering/references/project-routing.md` defines evidence-driven project discovery and change routing. It contains no fixed engine, language, package-manager, or project-type matrix.

`skills/current-3d-engineering/references/source-policy.md` defines provenance-first authoritative research. No single registry or documentation site is globally mandatory; evidence sources are selected from the technology the project actually uses.

`skills/current-3d-engineering/references/engineering-invariants.md` defines reusable correctness properties. Depending on the project, these may cover dependency provenance, toolchain/SDK compatibility, compile/link/ABI/architecture constraints, generated/editor-managed ownership, shader/GPU build pipelines, runtime ownership/lifecycle, simulation timing, presentation/resizing, capability detection, assets/content pipelines, language/bindings, security/permissions/signing, failure handling, concurrency, performance, packaging, deployment, and target-specific verification.

Only invariants relevant to the actual project are applied.

## Install / test as a repo marketplace

This repository contains `.agents/plugins/marketplace.json`, with the plugin at the repository root. With current Codex plugin tooling:

```bash
codex plugin marketplace add AahPlexX/3djs --ref main
codex plugin marketplace list
```

Then restart the ChatGPT desktop app, select the `AahPlexX 3D Plugins` marketplace source in the Plugins Directory, and install **Current 3D Engineering**. Local/plugin-directory availability depends on the host account/workspace features described by OpenAI.

## Invoke

Use the plugin explicitly when desired, or let its skill description trigger on relevant 3D/graphics work. Example prompts are documentation only and are not encoded routing paths:

```text
Use Current 3D Engineering to implement this feature using the architecture and toolchain already in my project.
Use Current 3D Engineering to diagnose this graphics build/runtime failure without replacing my existing stack.
Use Current 3D Engineering to verify and safely change the dependencies, SDKs, toolchains, or runtime components involved in this 3D work.
```

## Validation

No third-party test dependency is required.

```bash
npm test
npm run verify
```

The tests validate plugin packaging, universal discovery metadata, provenance-first source policy, arbitrary project-structure routing properties, native/toolchain/build invariants, absence of encoded workflow/persona/package allowlists, explicit npm-helper scoping, npm alias/non-registry provenance handling, independent agreement with live public npm manifests, real-endpoint integration, and CI wiring.

`npm test` includes live npm integration checks and therefore requires network access to `https://registry.npmjs.org`; registry outages fail those real integration tests instead of being hidden by simulated data.

## Design principles

- **3D/graphics domain, unrestricted project ecosystem.** Project language/runtime/toolchain does not determine eligibility.
- **Project evidence beats templates.** The actual project/request decides the work; no predefined catalog decides it first.
- **Provenance before lookup.** Determine where a component comes from before choosing a registry, repository, SDK, vendor, or documentation source.
- **Current evidence beats memory.** Version/API/toolchain compatibility claims require current authoritative evidence when available.
- **Unknown is researchable, not unsupported.** New technologies do not require a plugin update merely to become eligible.
- **Existing architecture wins.** Do not swap unfamiliar technology for familiar technology merely to fit a known pattern.
- **Smallest coherent change.** Preserve unrelated roots, code, dependencies, generated output, and reproducible project state.
- **Proof before completion claims.** Verification must exercise the actual affected build/runtime/target boundaries.

## Repository policy

`main` is the authoritative development branch. Changes should land only after `npm test` and `npm run verify` pass. Avoid long-lived branches that diverge from `main`.
