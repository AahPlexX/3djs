# Any-Project Universality Design

## Goal

Make Current 3D Engineering applicable to 3D/graphics work in any developer project without using a language, engine, framework, package manager, registry, build system, or deployment catalog as a support boundary.

## Architectural decision

The plugin core is provenance-first and project-first. It discovers the project's actual source-of-truth files, dependency origins, toolchain, build/runtime boundaries, generated/editor-managed artifacts, target platforms, and verification commands before selecting research or implementation actions.

Ecosystem-specific utilities may exist only as optional helpers after the project proves they apply. They cannot be required by the skill, used as support gates, or define which projects are eligible. The existing npm metadata resolver remains useful, but it must be explicitly npm-specific and must not imply that npm is the plugin's universal dependency model.

## Rejected approaches

### Finite ecosystem adapters

Rejected because a table of npm/Cargo/Unity/CMake/Python/Swift/etc. adapters would make unfamiliar ecosystems second-class and require plugin updates before new project types become first-class.

### Giant manifest detector

Rejected because a detector that recognizes a fixed set of filenames or technologies is another allowlist. It also breaks on custom build systems, polyglot repositories, nested workspaces, vendored source, generated projects, and proprietary tooling.

## Universal project evidence model

Before changes, the agent identifies evidence by responsibility rather than filename:

- dependency declarations and resolved dependency state;
- workspace/module/subproject boundaries;
- toolchain, compiler/interpreter, engine/editor, SDK, and platform versions;
- build, test, lint/static-analysis, packaging, signing, and deployment commands;
- source entry points and ownership boundaries;
- generated, vendored, editor-managed, or machine-authored files and their upstream sources;
- runtime boundaries such as process, browser, server, worker, native application, engine/editor, plugin host, device, or build tool;
- target operating systems, CPU/GPU architectures, graphics APIs, drivers/runtimes, and physical hardware requirements when applicable;
- assets, shaders, generated binaries, codecs, native libraries, plugins/modules, and other non-source dependencies.

No particular filename or ecosystem is required for a project to be supported.

## Dependency provenance model

For every dependency relevant to the requested change, determine how the project obtains it before attempting current-version research. A dependency may come from a package registry/index, VCS revision, local/workspace path, vendored source, binary SDK/framework, operating-system package, engine/editor package system, generated artifact, remote archive, system installation, or another mechanism discovered from the project.

Use the authoritative source appropriate to that provenance. Never force a registry lookup onto a local/VCS/system/editor-managed dependency and never infer that lack of registry metadata means the dependency is invalid.

Version semantics are ecosystem-defined. Preserve exact pins, revisions, channels, compatibility ranges, SDK versions, engine/editor versions, or other project-defined constraints. Do not globally redefine "stable" as semantic versioning.

## Optional npm helper

Rename the npm helper to `resolve-npm-packages.mjs` so its scope is unambiguous.

For npm-compatible projects it may:

- resolve explicit registry package names;
- inspect a selected `package.json` when the agent has established that file is relevant;
- resolve registry-backed dependencies against the configured npm-compatible registry;
- preserve and report non-registry dependency specs without turning them into false registry failures;
- handle npm aliases by distinguishing the declared dependency name from the registry package name.

It does not discover arbitrary project ecosystems and is never mandatory for non-npm work.

## Universal engineering invariants

Keep existing cross-cutting graphics invariants when applicable, and add missing native/toolchain concerns:

- compiler/interpreter/engine/editor/SDK compatibility;
- compile, link, ABI, architecture, calling-convention, native library, and symbol compatibility;
- shader/source-to-binary build ownership and target-specific shader compilation;
- generated/editor-managed file ownership;
- workspace/subproject boundaries and polyglot repositories;
- dependency provenance and reproducible pins;
- build configurations, target triples/architectures, feature flags, platform entitlements/permissions, and deployment packaging;
- hardware/device/driver evidence for claims that depend on them.

Apply only invariants proven relevant by the project.

## Source policy

Repository/project evidence remains first. External evidence is then selected from the discovered dependency/toolchain/API provenance:

1. project-local source of truth;
2. authoritative registry/index/repository/SDK/engine/editor/platform metadata appropriate to the component;
3. version-matched maintainer documentation, release notes, API references, or upstream source;
4. normative standards when the technology implements a standard;
5. corroboration when a material compatibility decision has more than one authoritative surface.

npm, MDN, W3C, Khronos, or any other source is conditional, not globally mandatory.

## Testing strategy

Do not encode the five audit probes as permanent journeys. Convert findings into property tests:

- skill/manifest contain no JavaScript/TypeScript/web-only eligibility gate;
- npm helper is explicitly optional and npm-scoped;
- source policy requires provenance-appropriate authoritative evidence rather than a universal npm registry;
- project routing covers multi-root/polyglot/generated/editor-managed/native projects without enumerating ecosystems;
- npm helper distinguishes registry-backed and non-registry specs;
- npm helper resolves npm aliases correctly;
- current-tree anti-overfitting checks continue to reject scenario/persona/package allowlists;
- live npm integration still uses the real registry for the npm helper.

## Success criteria

A project is eligible because the request involves 3D/graphics engineering, not because its language, engine, dependency manager, manifest format, or deployment target is known to the plugin in advance. Unknown technology triggers evidence discovery and authoritative research, never substitution or refusal solely due to unfamiliarity.