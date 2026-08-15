# Engineering invariants

These are reusable correctness checks, not a workflow catalog. Apply an invariant only when the actual project owns or exposes that concern.

## Developer-state preservation invariants

- Inspect the available current working state before mutation when the project/environment exposes one.
- Treat uncommitted, staged, unsaved/editor-managed, locally generated, or partially migrated developer changes as project truth unless the user explicitly authorizes discarding them.
- Do not reset, clean, force-checkout, revert, regenerate over, or overwrite unrelated developer changes merely to obtain a clean baseline.
- Keep edits scoped to the requested path and preserve unrelated local configuration and work.
- If a destructive change is required without a reliable version-control recovery path, use a recoverable/atomic strategy or preserve a backup appropriate to the project before mutation.

## Working-copy materialization invariants

- Establish whether the visible working copy is complete enough for the requested conclusion before treating missing files, assets, dependencies, generated outputs, or binaries as project absence.
- Inspect project-relevant evidence for partial/sparse checkout, uninitialized external components or submodules, large-file pointer objects, external asset stores, dependency restore, generated source, editor/engine import, vendor sync, remote artifacts, or another discovered materialization mechanism.
- Do not make any one materialization technology mandatory; use only the mechanism proven by the project.
- Do not automatically fetch, initialize, restore, import, or generate content when doing so can require credentials, large downloads, license acceptance, destructive regeneration, or external side effects.
- If the project cannot be materialized in the current environment, state that limitation and do not convert incomplete evidence into a definitive claim.

## Dependency provenance and compatibility invariants

- Identify the exact dependency/component involved in the requested change and how the project obtains it before researching versions.
- Preserve registry/index selection, VCS revisions, local/workspace links, vendored source, SDK/framework selection, engine/editor package state, system dependencies, generated artifacts, and other proven provenance unless the request requires movement.
- Inspect compatibility relationships exposed by the actual ecosystem: package constraints, peers/optional features, compiler/interpreter requirements, SDK/toolchain versions, engine/editor versions, platform/architecture requirements, ABI/binary constraints, or equivalent project-defined relationships.
- Preserve lock/resolution state and unrelated dependency graphs unless the requested change requires them to move.
- Never treat unfamiliar technology as unsupported simply because it is absent from plugin documentation.

## Toolchain, compiler, SDK, and binary invariants

- Establish the compiler or interpreter, build system, SDK/toolset, engine/editor version, target architecture/platform, and build configuration relevant to the changed path.
- For compiled/native boundaries, verify compile and link compatibility separately from source/API compatibility.
- Verify ABI, calling convention, architecture/target triple, binary format, runtime loader/search path, symbol/export availability, and static/dynamic linkage when relevant.
- Preserve required feature flags, build defines, language editions/standards, runtime versions, SDK deployment targets, and package/toolchain constraints.
- Do not claim cross-platform or cross-architecture compatibility from a successful build on only one target.

## Generated and editor-managed ownership invariants

- Establish whether each changed file is authoritative source, generated output, vendored source, editor/engine-managed state, cached/intermediate output, or a checked-in binary artifact.
- Modify the authoritative generator/source/configuration instead of disposable generated output unless the project's documented workflow explicitly requires direct edits.
- Respect engine/editor serialization and import pipelines; do not text-edit managed state when the owning tool can overwrite or invalidate the change.
- Identify how checked-in generated/binary artifacts are reproduced before replacing them.

## Execution-trust and side-effect invariants

- Treat repository build scripts, installers, package lifecycle hooks, generators, editor automation, deployment scripts, native binaries, and remote bootstrap commands as executable code.
- For unfamiliar or untrusted project commands, inspect the command/script before execution when it can have material side effects.
- Identify filesystem writes/deletions, generated output, dependency/install/postinstall hooks, network access, external services, credentials/secrets, migrations, signing, publishing/deployment, global installation, and other state changes when relevant.
- Prefer the least-privileged established command that can prove the required claim.
- Never expose secrets or credentials to untrusted executable code merely to complete a verification step.
- Do not blindly execute downloaded/remote shell code or assume a command is safe because it appears in a repository task/script.
- Distinguish local/read-only validation from commands that mutate remote or external state; require the appropriate authorization boundary for the latter.

## Shader and GPU-build invariants

- Establish who owns shader source, preprocessing, cross-compilation, offline compilation, runtime compilation, reflection, pipeline-cache/binary-archive generation, and generated bindings when these stages exist.
- Verify shader language/version, compiler/toolchain, target graphics API, target device/driver/runtime, entry points, resource layouts/bindings, and generated artifact compatibility when relevant.
- Do not assume a shader that compiles for one backend, platform, architecture, or driver path is valid for another.
- Validate produced shader/binary artifacts through the project's real build and runtime path rather than source parsing alone.

## Runtime-boundary invariants

- Establish where each module executes before initialization: browser, server, worker, native process, engine/editor runtime, plugin host, device, build process, test runtime, or another environment.
- Initialize only after required runtime objects, devices/contexts, render targets, services, modules/plugins, and dependent systems exist.
- Keep environment-specific APIs inside the boundary that owns them instead of hiding invalid cross-boundary use behind broad runtime checks.
- Respect the framework/engine/runtime lifecycle instead of creating parallel ownership.

## Ownership invariants

- Establish which layer owns the render/update loop, scene/world state, input, physics stepping, resources, workers/threads, sessions, subscriptions, device/context objects, native handles, and generated/runtime caches.
- Do not create duplicate loops or competing owners for the same concern.
- Release owned listeners, render resources, textures, buffers, materials, geometries, workers/threads, WASM/native state, sessions, timers, observers, device/context resources, file/native handles, and other resources on teardown when the underlying runtime does not own disposal automatically.
- Do not dispose shared/cached resources while other consumers still own them.

## Time, simulation, determinism, and numeric invariants

- Base animation/simulation on measured elapsed/delta time or an intentionally chosen fixed-step strategy rather than assumed frame rate.
- Keep one explicit source of truth for transform/state synchronization when multiple systems interact.
- Verify pause, resume, background/foreground, remount/reload, navigation/scene changes, and lifecycle suspension behavior when those states exist.
- When deterministic replay, networking, lockstep simulation, reproducible baking, or tests require determinism, establish random seeds, ordering, timestep, floating-point/precision, and cross-platform assumptions explicitly.
- For very large/small coordinate ranges or long-running simulations, verify precision/origin strategy when numeric precision can materially affect behavior.

## Rendering and presentation invariants

- Derive render-target/output sizing, scale, projection, viewport/scissor state, display density, orientation, and presentation configuration from the actual product/runtime rather than a browser-only assumption.
- Update render and projection state after real surface/window/view/display changes when the platform requires it.
- Treat resolution, sample count, texture precision, render scale, and other quality controls as performance budgets rather than unconditional maxima.
- Verify relevant input and accessibility paths, which may include pointer, touch, keyboard, controller, spatial/XR input, platform accessibility APIs, or engine-specific input systems.

## Capability and fallback invariants

- Detect optional runtime/device/platform capabilities before use when the platform exposes capability discovery.
- Treat surface-level detection as insufficient when device/context/session/pipeline initialization can still fail; handle initialization failure and missing required features.
- Preserve the product's required fallback/non-feature path rather than shipping blank, dead, or crash-only states.
- Make physical-device, GPU, driver, OS, architecture, SDK, or hardware-specific claims only after that target was actually exercised or the claim is narrowly proven by authoritative compatibility documentation.

## Asset and content-pipeline invariants

- Distinguish authoring/source assets from imported, generated, optimized, baked, compiled, streamed, or runtime delivery assets and preserve recoverable source material when required.
- Add compression, extensions, decoders, transcoders, importers, workers/tools, native plugins, or build transforms only when the runtime and deployment actually support the resulting output.
- Validate output assets after transformation and regression-check visual, animation, metadata, coordinate/unit, material, skeleton, collision, and interaction fidelity relevant to the product.
- Verify production/package/deployment locations, resource lookup paths, MIME/content types when applicable, runtime search paths, bundle/package layout, plugin/native-library locations, caches, and target-specific packaging rather than relying only on development/editor success.

## Persisted 3D data and migration invariants

- Identify persisted or serialized state that can outlive the changed code: scenes, prefabs/templates, saves, editor/project state, caches, asset databases, baked data, network snapshots, binary resources, custom formats, or other product-defined data.
- Establish the schema/format version owner, reader/writer versions, migration direction, backward/forward compatibility expectations, and whether old/new runtimes must interoperate before changing serialized output.
- Preserve semantic conventions the product depends on. When relevant, verify units and scale, coordinate system, handedness, up/forward axis conventions, transform order, color space/transfer function, texture/material semantics, animation time/rate, skeleton/bone conventions, collision/physics metadata, custom extensions, IDs/references, and application metadata.
- Do not assume a file that parses is semantically compatible.
- Before lossy or destructive migration, preserve a recoverable original or ensure a reproducible source pipeline exists.
- Verify migrated content with the consuming runtime/tool and, when required, round-trip, rollback, representative old/new reader, visual-fidelity, animation, material/color, collision, metadata, and interaction checks.

## Language and type-system invariants

- Inspect the actual language/compiler/interpreter version, language mode/edition/standard, module/package system, generated bindings, type/declaration/header/interface strategy, and foreign-function boundary when relevant.
- Do not add external declarations, headers, bindings, shims, or wrappers when the runtime/SDK/package already supplies the required contract.
- Treat compile/type/static-analysis success as a separate verification gate from link, package, deployment, and runtime success.
- For cross-language boundaries, verify generated/manual bindings and data layout/serialization/ownership conventions rather than assuming API names imply compatibility.

## Security, permissions, and distribution invariants

- Identify whether credentials/tokens/keys/certificates/provisioning artifacts are intended for client, server, build, signing, editor, CI, or another scope from authoritative documentation.
- Never move secrets into a less-protected runtime to make an integration easier.
- Account for permissions, entitlements, sandboxing, secure-context, CSP/CORS/cross-origin isolation, platform privacy permissions, code signing/notarization, package capabilities, and user activation when the actual target requires them.
- Preserve target-specific packaging/signing requirements and do not claim deployability from an unsigned/unpackaged local executable when distribution requirements are part of the request.

## Failure-handling invariants

- Handle asset, device/context, shader/compiler, worker/thread, native library/plugin, decoder/importer, session, network/service, dependency-resolution, migration, and initialization failures at the layer that owns them.
- Preserve meaningful loading/error/fallback states required by the product.
- Reproduce the original failure before claiming a bug fix when reproduction is possible.

## Performance and concurrency invariants

- Measure before and after optimization claims; do not substitute intuition for profiling evidence.
- Attribute CPU, GPU, memory, I/O, synchronization, compilation, streaming, and allocation costs to the actual target environment when those costs matter.
- When work crosses threads/workers/jobs/tasks/render threads, establish synchronization and ownership rules before modifying shared state.
- Do not infer performance parity across devices, GPUs, drivers, architectures, build configurations, or editor vs production runtime from one measurement.

## Verification invariants

- After execution-trust review, run the project's actual applicable tests, compiler/type checks, static analysis, build/link steps, shader compilation, engine/editor validation, packaging/signing, production/release builds, deployment checks, and runtime smoke tests when they exist.
- Exercise the changed path in the target environment that matters to the request.
- Inspect runtime/editor/console/device logs, production asset/binary behavior, teardown/re-entry, fallback/error paths, migration results, and packaging/deployment output when applicable.
- Verify each affected workspace/subproject/target boundary in a polyglot or multi-root repository rather than assuming one root command proves all affected components.
- Confirm developer-authored unrelated state remains preserved after verification commands that can mutate/generated files.
- State environment limitations explicitly. Evidence from a different language toolchain, OS, architecture, browser, device, GPU/driver, SDK, engine/editor, deployment, or service cannot be presented as proof for an untested target.
