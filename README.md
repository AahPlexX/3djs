# Current 3D Engineering

A ChatGPT/Codex plugin for current-source-first 3D and graphics engineering across arbitrary project languages, runtimes, engines, toolchains, dependency systems, and target platforms. It requires the agent to inspect the actual project, preserve developer state, establish project materialization and dependency/toolchain provenance, verify exact APIs and compatibility against authoritative sources appropriate to that technology, implement against the discovered architecture, and prove the result before claiming completion.

## Public HTTPS MCP

The plugin is now hybrid: it keeps the full local `current-3d-engineering` skill and also bundles a public, anonymous, read-only remote MCP companion.

Canonical endpoint:

```text
https://current-3d-engineering-mcp-cpuz1i.v2.appdeploy.ai/api/mcp
```

The remote MCP requires **no user login, OAuth flow, bearer token, API key, authorization header, or user-provided secret**. `.mcp.json` contains only the remote HTTP type and HTTPS endpoint. It is intentionally stateless and bounded.

The anonymous network surface is deliberately smaller than the local engineering skill. It exposes deterministic plugin/server metadata plus bundled read-only guidance resources. It does **not** expose repository writes, filesystem mutation, shell/process execution, deployment actions, arbitrary URL proxying, private registries, credentials, paid AI/model calls, user-supplied executable code, or a remote autonomous coding agent.

The endpoint supports the initialization-era `2025-11-25` Streamable HTTP request path used by current clients and the stateless `2026-07-28` MCP request model. The server does not need a server-initiated SSE stream, so `GET /api/mcp` intentionally returns `405 Method Not Allowed`; MCP requests use `POST /api/mcp` with JSON responses.

Hosting is an implementation detail rather than the protocol source of truth. The current deployment uses AppDeploy's free hosted HTTPS/backend capability under its fair-use terms and has no database, hosted AI inference, paid third-party API, custom domain, or authentication-provider dependency. If the host stops satisfying the repository's zero-mandatory-recurring-cost requirement, the endpoint should be migrated rather than silently introducing a paid dependency.

The live status/self-check page is available at the deployment root and verifies the GET transport guard plus anonymous MCP initialization and tool discovery. GitHub CI independently exercises the real `/api/mcp` endpoint rather than substituting a mock.

## Universal project support

The plugin's domain is **3D/graphics engineering**. Within that domain, project eligibility is not restricted by language, engine, framework, package manager, registry, build system, editor, SDK, operating system, graphics API, repository layout, or deployment model.

It is intentionally **not** built around a catalog of predefined project types, personas, engines, user journeys, manifest filenames, or supported ecosystems. An unfamiliar technology is treated as a first-class research input.

The operating model is:

```text
actual request + actual project + current developer state
            ↓
working-copy completeness / relevant roots / ownership / provenance / toolchain discovery
            ↓
current authoritative evidence selected for those discovered technologies
            ↓
execution-trust review for commands with material side effects
            ↓
smallest coherent project-specific change
            ↓
verification in the project's actual build/runtime/target/data boundaries
```

A technology does not need to be named in this repository for the plugin to work with it. Unknown technology triggers project inspection and first-party research; it does not trigger substitution with a familiar stack.

## Preserve the developer's real project

The plugin treats the developer's current working state as project truth. Uncommitted, staged, unsaved/editor-managed, locally generated, or partially migrated work is not disposable merely because the last committed revision is easier to reason about.

It must not reset, clean, force-checkout, regenerate over, or overwrite unrelated developer changes to manufacture a clean baseline. When destructive transformation is genuinely required and there is no reliable recovery path, the project should retain a recoverable original or other reversible strategy appropriate to that project.

The plugin also does not treat the visible checkout as automatically complete. Before declaring a file, asset, dependency, generated artifact, or binary missing, it checks whether the relevant content is partially/sparsely materialized, externally synchronized, represented by a large-file pointer, awaiting dependency restore/import/generation, or governed by another project-defined materialization mechanism. Those mechanisms are evidence categories, not a supported-technology list.

## Provenance-first dependency reasoning

The plugin determines **how the project actually obtains each relevant component before looking up versions**. Depending on project evidence, a dependency may be registry/index-backed, VCS-pinned, local/workspace-linked, vendored, SDK/framework-provided, engine/editor-managed, system-installed, generated, binary, remotely archived, or sourced through another project-defined mechanism.

Those labels are evidence categories, not a support list. If a project uses a different mechanism, the agent follows that mechanism's authoritative source.

Version semantics are also project/ecosystem-defined. The plugin does not globally assume semantic versioning, a `latest` tag, or one universal meaning of stable. It preserves the project's pins, revisions, channels, SDK/toolchain versions, engine/editor versions, and resolution state unless the requested change requires movement.

## Multi-root, polyglot, native, and managed projects

The plugin does not assume one manifest represents an entire repository. It scopes the requested behavior across the relevant workspaces, subprojects, modules, targets, languages, generated bindings, native boundaries, editor/engine state, persisted content, and build systems.

Before editing, it determines whether files are authoritative source, generated output, vendored code, editor/engine-managed state, cached/intermediate output, checked-in artifacts, or serialized project/product state. For native/compiled work it can apply compile/link/ABI/architecture/toolchain/SDK invariants; for shader pipelines it identifies the actual source-to-binary ownership and target graphics environment. These checks are conditional on the real project rather than forced onto every project.

## Execution trust before project commands

A repository command is executable code, not automatic authorization. Before running unfamiliar build scripts, installers, package lifecycle hooks, generators, editor automation, deployment scripts, native binaries, or remote bootstrap commands with material side effects, the plugin inspects what they invoke and what they can touch.

Relevant effects can include filesystem writes/deletions, generated output, dependency/install hooks, network access, remote services, credentials/secrets, signing, publishing/deployment, migrations, global installation, and other external state. The plugin uses the least-privileged established project command that can prove the claim, does not blindly execute downloaded shell content, and does not expose secrets merely to force a verification step through.

## Persisted 3D data and migration compatibility

3D engineering compatibility is not limited to source code. Scenes, prefabs/templates, saves, editor state, caches, asset databases, baked data, binary resources, network snapshots, and custom serialized formats can outlive the code that created them.

When a change crosses a persisted-data boundary, the plugin establishes the actual schema/format owner and migration direction. It preserves and verifies project-relevant semantics such as units/scale, coordinate system, handedness, up/forward axes, transforms, color space or transfer function, animation timing, skeleton/bone conventions, material/texture semantics, collision/physics metadata, custom extensions, IDs/references, and application metadata when those concerns exist.

A file merely parsing is not proof that it remains semantically compatible. Lossy or destructive transformations require recoverable source/originals when needed, and verification can include the consuming runtime/tool, round-trip or rollback behavior, representative old/new readers, visual fidelity, animation, materials/color, collision, metadata, and interactions as appropriate.

## Optional npm metadata helper

The plugin ships one ecosystem-specific convenience utility:

```bash
skills/current-3d-engineering/scripts/resolve-npm-packages.mjs
```

This helper is **optional and npm-specific**. It is not the plugin's universal project detector and is not required for non-npm projects.

From the repository, use it only when project evidence establishes that simple npm-compatible package metadata is relevant:

```bash
node skills/current-3d-engineering/scripts/resolve-npm-packages.mjs --project . --json
```

Or resolve arbitrary npm registry package names explicitly:

```bash
node skills/current-3d-engineering/scripts/resolve-npm-packages.mjs --package <package-name> --json
node skills/current-3d-engineering/scripts/resolve-npm-packages.mjs --package <package-a> --package <package-b> --json
```

Inside the installed skill, bundled script references are skill-root-relative, so the skill invokes `node scripts/resolve-npm-packages.mjs ...` rather than depending on a host-specific plugin-root environment variable.

For registry-backed npm dependencies the helper reports declared identity, registry identity, original project spec, provenance, npm's `latest` tag, highest stable semantic version, a **registry candidate version**, peer dependencies, engine requirements, deprecation metadata, and basic upstream metadata.

A registry candidate is **not a project compatibility recommendation**. The helper only summarizes registry release metadata; the plugin must still evaluate the actual project's declared/resolved constraints, peers/engines, API version, toolchain/runtime requirements, and authoritative compatibility evidence before selecting or changing a version.

Project mode understands that npm dependency specs are not all public-registry package names. `npm:` aliases are resolved against their target registry package while retaining the declared alias. Local/workspace/VCS/protocol specs are preserved under `nonRegistryDependencies` and are **not** turned into false public-registry 404 failures. Real registry-backed failures remain visible.

`--registry <url>` is deliberately only a **simple npm-compatible HTTP registry endpoint selector**. This helper does not implement the complete `.npmrc` model for scoped registries, registry-specific authentication/tokens, proxies, client certificates/keys, or other npm client configuration. If a project depends on those semantics, use that project's established npm tooling and configuration rather than bypassing them with this helper.

## Generic routing and invariants

`skills/current-3d-engineering/references/project-routing.md` defines evidence-driven project discovery and change routing. It contains no fixed engine, language, package-manager, or project-type matrix.

`skills/current-3d-engineering/references/source-policy.md` defines project-state preservation, materialization awareness, provenance-first authoritative research, execution-trust rules, conflict resolution, and real-endpoint integration evidence. No single registry or documentation site is globally mandatory; evidence sources are selected from the technology the project actually uses.

`skills/current-3d-engineering/references/engineering-invariants.md` defines reusable correctness properties. Depending on the project, these may cover developer-state preservation, working-copy materialization, dependency provenance, execution trust, toolchain/SDK compatibility, compile/link/ABI/architecture constraints, generated/editor-managed ownership, shader/GPU build pipelines, runtime ownership/lifecycle, simulation timing/determinism/numeric precision, presentation, capability detection, assets/content pipelines, persisted-data migrations, language/bindings, security/permissions/signing, failure handling, concurrency, performance, packaging, deployment, and target-specific verification.

Only invariants relevant to the actual project are applied.

## Install from this repository marketplace

Marketplace registration and plugin installation are separate operations. Register this repository's marketplace source, then install the named plugin from that marketplace:

```bash
codex plugin marketplace add AahPlexX/3djs --ref main
codex plugin add current-3d-engineering@aahplexx-3djs
codex plugin list
```

The first command makes the marketplace available to Codex. The second installs **Current 3D Engineering** from that marketplace. The final command verifies installed plugins rather than merely listing marketplace sources. The installed plugin includes both the local skill and the anonymous remote MCP declared in `.mcp.json`; users do not supply MCP credentials.

## Invoke

Use the plugin explicitly when desired, or let its skill description trigger on relevant 3D/graphics work. Example prompts are documentation only and are not encoded routing paths:

```text
Use Current 3D Engineering to implement this feature using the architecture and toolchain already in my project.
Use Current 3D Engineering to diagnose this graphics build/runtime failure without replacing my existing stack or losing my current work.
Use Current 3D Engineering to verify and safely change the dependencies, SDKs, toolchains, assets, persisted content, or runtime components involved in this 3D work.
```

## Validation

No third-party test dependency is required.

```bash
npm test
npm run verify
```

The tests validate hybrid plugin packaging and current required interface metadata, the anonymous `.mcp.json` contract, legacy and modern MCP protocol behavior, the real deployed HTTPS endpoint, universal discovery metadata, skill-root-relative bundled script invocation, provenance-first source policy, developer-state preservation, project materialization, execution-trust rules, persisted 3D migration semantics, arbitrary project-structure routing properties, native/toolchain/build invariants, absence of encoded workflow/persona/package allowlists, explicit npm-helper scoping, compatibility-neutral npm candidate semantics, npm alias/non-registry provenance handling, independent agreement with live public npm manifests, installation documentation, and CI wiring.

`npm test` includes real external integration checks for both the public npm registry and the deployed MCP endpoint. External outages therefore fail the corresponding integration tests instead of being hidden by simulated data.

## Design principles

- **3D/graphics domain, unrestricted project ecosystem.** Project language/runtime/toolchain does not determine eligibility.
- **Developer state is project truth.** Existing work is preserved rather than erased to make analysis easier.
- **Do not infer absence from an incomplete checkout.** Establish relevant project materialization first.
- **Project evidence beats templates.** The actual project/request decides the work; no predefined catalog decides it first.
- **Provenance before lookup.** Determine where a component comes from before choosing a registry, repository, SDK, vendor, or documentation source.
- **Commands are executable code.** Inspect unfamiliar material side effects before running them.
- **Current evidence beats memory.** Version/API/toolchain compatibility claims require current authoritative evidence when available.
- **Unknown is researchable, not unsupported.** New technologies do not require a plugin update merely to become eligible.
- **Existing architecture wins.** Do not swap unfamiliar technology for familiar technology merely to fit a known pattern.
- **Persisted semantics matter.** Source compatibility does not imply scene/asset/save/data compatibility.
- **Anonymous does not mean privileged.** The public MCP remains deterministic, read-only, and free of private/project-mutation authority.
- **Smallest coherent change.** Preserve unrelated roots, code, dependencies, generated output, developer changes, and reproducible project state.
- **Proof before completion claims.** Verification must exercise the actual affected build/runtime/target/data boundaries.

## Repository policy

`main` is the authoritative development branch. Changes should land only after `npm test` and `npm run verify` pass. Avoid long-lived branches that diverge from `main`.
