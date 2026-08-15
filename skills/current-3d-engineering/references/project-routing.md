# Project-first routing

Use this reference after inspecting the project. It defines how to decide what matters without relying on a predefined list of languages, engines, frameworks, package managers, build systems, SDKs, platforms, or workflows.

## Start from evidence, not labels

1. Identify the project root or roots relevant to the requested behavior. A repository may contain multiple workspaces, subprojects, modules, packages, targets, generated projects, or independent build systems.
2. Identify the source-of-truth files and commands for each relevant root by responsibility: dependency declarations/resolution, toolchain/SDK/engine/editor versions, build configuration, runtime entry points, generated/vendor ownership, tests, packaging, deployment, and CI.
3. Trace the actual code/assets involved in the requested behavior through imports, includes, module references, build targets, editor/engine metadata, generated-source relationships, asset references, and runtime wiring.
4. Determine the provenance and resolved identity of each relevant dependency before choosing how to research or change it.
5. Establish ownership for runtime/build concerns before modifying them.
6. Inspect the developer's current working state and whether the working copy is sufficiently materialized before interpreting absence or mutating files.
7. Preserve the current architecture and reproducible project state unless the request or proven incompatibility requires a change.

Do not map a project to a stored scenario or decide support from whether a filename, language, framework, package name, engine, or build system appears in this plugin's documentation.

## Preserve developer-authored state

Before editing, identify current local work when the environment exposes it: uncommitted or staged changes, unsaved editor-owned state, locally generated files, partially completed migrations, local configuration, and other developer-authored changes relevant to the affected path.

- Treat existing developer changes as project truth unless the user explicitly says to discard them.
- Do not reset, clean, force-checkout, revert, regenerate over, or overwrite unrelated changes to manufacture a clean baseline.
- Patch around existing work and keep the smallest coherent diff.
- If the requested change overlaps ambiguous local work, inspect the overlap and preserve intent rather than assuming the repository's last committed state is authoritative.
- If no version-control safety net exists, prefer reversible/atomic edits or a recoverable copy before destructive transformations when appropriate to the project.

A clean build is not valuable if obtaining it destroys the developer's actual work.

## Establish working-copy completeness before inferring absence

A visible project tree can be incomplete. Before concluding that a module, asset, dependency, generated file, binary, or source tree is missing, look for evidence of partial/sparse materialization or an external synchronization mechanism.

Depending on the discovered project, relevant evidence can include sparse/partial working copies, uninitialized nested repositories or submodules, large-file pointer objects, external asset stores, package/dependency restore steps, editor/engine imports, generated-source stages, vendor sync, remote caches, artifact downloads, or another project-specific materialization mechanism.

These are examples of evidence, not required technologies. Apply only the mechanism the project actually uses.

Do not automatically initialize, fetch, restore, import, generate, or download missing material if doing so can require credentials, large network transfers, license acceptance, destructive regeneration, or external side effects. Establish the intended mechanism and authorization first. Until completeness is known, report the limitation rather than treating absence as proven project truth.

## Multi-root and polyglot projects

A repository can legitimately contain multiple languages, toolchains, package managers, workspaces, native modules, generated bindings, shader languages, editor projects, or deployment targets. Do not pick one manifest and assume it represents the whole repository.

Scope discovery to the requested behavior:

- identify every workspace/subproject/module/target that participates in the changed path;
- identify the boundary between independently resolved dependency graphs;
- identify generated interfaces/bindings and the source that produces them;
- identify cross-language/native ABI or serialization boundaries;
- run verification in each affected build/runtime boundary rather than applying one ecosystem's command to the entire repository.

Do not expand to unrelated roots merely because they exist.

## Dependency provenance before version lookup

For each dependency relevant to the work, establish how the project obtains it. Examples of provenance categories are registry/index, VCS revision, local/workspace path, vendored source, remote archive, SDK/framework, engine/editor package mechanism, operating-system/system installation, generated artifact, or another project-defined source.

These categories describe evidence, not a support list. If the project uses a mechanism not named here, inspect it and follow its authoritative source.

Never assume that a dependency name implies a public package. Never use public registry metadata as proof for a local, vendored, VCS, system, SDK, or editor-managed dependency.

## Generated, vendored, editor-managed, and serialized ownership

Before editing a file or persisted project artifact, determine whether it is authoritative source or output/state managed by another tool.

- If a file is generated, modify the generator/source configuration unless the project's documented workflow requires editing the generated output directly.
- If an engine/editor owns serialized project state, use the project's intended editing mechanism when direct text edits can corrupt or be overwritten.
- If source is vendored, preserve the project's vendoring strategy and record the upstream revision/version when available.
- If binary/generated artifacts are checked in, identify how they are rebuilt and which target/platform they represent before replacing them.
- If a scene, save, cache, asset database, or other serialized artifact crosses versions, identify the schema/format owner and migration direction before writing it.

Do not hand-edit disposable outputs as a shortcut to passing a local check.

## Existing projects

For an existing project:

- keep resolved dependency state, lock/resolution files, VCS pins, vendored revisions, SDK/toolchain versions, engine/editor versions, build configuration, and developer-authored local changes as the starting truth;
- establish materialization completeness before treating absent resources as defects;
- trace the requested feature before proposing dependency or architecture changes;
- verify exact APIs against documentation/source matching the installed/target version;
- upgrade the smallest coherent set of coupled components;
- preserve unrelated code, subprojects, dependencies, generated output, serialized state, and build state;
- respect package-manager, editor, engine, compiler, SDK, signing, and deployment ownership boundaries proven by the project.

If an optional ecosystem-specific helper exists, use it only after evidence proves that helper matches the relevant dependency source. The bundled npm helper is one such optional tool; it is not a universal project resolver.

## Greenfield projects

For greenfield work, derive requirements before selecting technology. Relevant requirements can include product/runtime environment, rendering model, target hardware, supported operating systems/architectures, graphics/API constraints, framework or engine integration, performance/memory budget, content pipeline, accessibility, networking, XR/geospatial needs, deployment/package/signing model, licensing, team/tooling constraints, persistence/data compatibility, and maintenance expectations.

Research current candidates at runtime from authoritative sources. Selection must follow requirements and evidence, not a static preference table in this plugin.

## Toolchain, SDK, native, and build boundaries

Establish the compiler/interpreter, build system, SDK/toolset, engine/editor, target architecture, feature flags/configuration, native libraries, shader compiler/pipeline, linker/package/signing stages, and runtime/driver requirements when the actual project exposes them.

For native or compiled boundaries, verify ABI, architecture, calling convention, binary format, library linkage, symbol availability, runtime loader behavior, and toolchain/SDK compatibility when they can affect the requested path. Do not infer source-level compatibility implies binary compatibility.

For shader or generated-code pipelines, identify whether source is compiled at build time, runtime, editor import time, or another stage. Modify the owning source/pipeline and verify the produced artifact on the actual target.

## Execution boundary before commands

A project command is executable code, not merely documentation. Before running an unfamiliar build/install/generator/editor/deploy command, trace what it invokes and whether it has material side effects.

Identify filesystem writes, generated output, package lifecycle/install hooks, network access, external services, credentials/secrets, signing/publishing/deployment actions, destructive cleanup, migrations, or global-system changes when applicable. Prefer the least-privileged established command that proves the required claim. Do not run untrusted or remote bootstrap code blindly.

## Runtime and deployment boundaries

Determine where the changed code executes: browser, server, worker, native process, engine/editor runtime, plugin host, device, build process, test environment, or another discovered boundary. A project may cross several of these.

Verify deployment/packaging facts that can differ from development: asset and binary locations, runtime search paths, base/public paths, MIME/content types, worker/plugin locations, dynamic libraries, architecture slices, entitlements/permissions, CSP/CORS/secure-context rules, signing, service credentials, driver/runtime requirements, and target-specific packaging where applicable.

## Unknown technology rule

If the project uses technology not previously encountered, do not substitute a familiar technology. Instead:

1. identify its role and ownership from project evidence;
2. identify how it is sourced/resolved and the exact installed/target version, revision, SDK, engine/editor release, or toolchain state;
3. identify whether the local project evidence is complete/materialized enough for the requested conclusion;
4. locate the maintainer/vendor/upstream official documentation, release information, source, or applicable standard;
5. verify the exact feature/API and compatibility constraints;
6. inspect material side effects before executing unfamiliar project code;
7. implement against the existing project architecture while preserving developer-authored state;
8. validate using the project's own build/runtime/deployment path.

There is no supported-technology list. Absence from this plugin's documentation is never evidence that a project or technology is unsupported.
