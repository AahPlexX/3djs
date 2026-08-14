# Engineering invariants

These are reusable correctness checks, not a workflow catalog. Apply an invariant only when the actual project owns or exposes that concern.

## Dependency and compatibility invariants

- Resolve the exact packages involved in the requested change from the project or explicit package input.
- Inspect peer dependencies, engine requirements, optional dependencies, bundled/separate type declarations, and compatibility notes before changing versions.
- Stable releases are the default unless the project/request explicitly requires a prerelease channel.
- Preserve the lockfile and unrelated dependency graph unless the requested change requires them to move.
- Never treat an unfamiliar package as unsupported simply because it is absent from plugin documentation.

## Runtime-boundary invariants

- Establish where each module executes before initialization: server, browser, worker, build process, native shell, test runtime, or another environment.
- Keep browser-only DOM/canvas/GPU/XR initialization out of server evaluation.
- Initialize only after required runtime objects and render targets exist.
- Respect the framework/runtime's real lifecycle rather than hiding boundary errors behind broad environment checks.

## Ownership invariants

- Establish which layer owns the render/update loop, scene/world state, input, physics stepping, resources, workers, sessions, and subscriptions.
- Do not create duplicate loops or competing owners for the same concern.
- Release owned listeners, render resources, textures, buffers, materials, geometries, workers, WASM state, sessions, timers, observers, and other resources on teardown when the underlying runtime does not own disposal automatically.
- Do not dispose shared/cached resources while other consumers still own them.

## Time and simulation invariants

- Base animation/simulation on measured elapsed/delta time or an intentionally chosen fixed-step strategy rather than assumed frame rate.
- Keep one explicit source of truth for transform/state synchronization when multiple systems interact.
- Verify pause, resume, remount, navigation, and visibility behavior when those states exist in the product.

## Rendering and responsive invariants

- Size render targets from the actual containing layout when the product is responsive.
- Update projection/resolution/render-target state after real size changes.
- Treat pixel density as a performance budget; do not assume maximum device pixel ratio is always appropriate.
- Verify pointer, touch, keyboard, orientation, resize, and accessibility interactions that are relevant to the product.

## Capability and fallback invariants

- Feature-detect optional browser/device capabilities before using them.
- Treat successful surface-level detection as insufficient when initialization can still fail; handle initialization rejection and missing required features.
- Preserve the product's required fallback/non-feature path rather than shipping blank or dead states.
- Make physical-device or hardware-specific claims only after that hardware was actually exercised.

## Asset and build-pipeline invariants

- Distinguish authoring/source assets from runtime delivery assets and preserve recoverable source material when required.
- Add compression, extensions, decoders, transcoders, loaders, workers, or build transforms only when the runtime and deployment actually support the resulting output.
- Validate output assets after transformation and regression-check visual, animation, metadata, and interaction fidelity relevant to the product.
- Verify production URLs, base paths, MIME types, public/subpath deployment, worker locations, and cache behavior rather than relying only on development-server success.

## Type-system invariants

- Inspect the project's TypeScript version/configuration and the package's actual declaration strategy before adding type dependencies.
- Do not assume browser/platform interfaces are present in the active compiler lib set.
- Do not add external declaration packages when the runtime package or active platform typings already supply the required types.
- Treat typecheck success as a separate verification gate from runtime/build success.

## Security invariants

- Identify whether credentials/tokens are intended for browser use, server use, build use, or another scope from the service's authoritative documentation.
- Never move server-only secrets into client bundles to make an integration easier.
- Account for secure-context, CSP, CORS, cross-origin isolation, permissions, and user-activation requirements when the actual APIs require them.

## Failure-handling invariants

- Handle asset, worker, decoder, device, session, network, and initialization failures at the layer that owns them.
- Preserve meaningful loading/error/fallback states required by the product.
- Reproduce the original failure before claiming a bug fix when reproduction is possible.

## Verification invariants

- Run the repository's actual test, typecheck, lint, and production build commands when present.
- Exercise the changed runtime path in the environment that matters to the request.
- Inspect runtime/console errors, production asset behavior, teardown/re-entry, and fallback paths when applicable.
- Measure performance or memory before and after optimization claims; do not substitute intuition for profiling evidence.
- State environment limitations explicitly. Evidence from a different browser, device, deployment, or service cannot be presented as proof for an untested target.