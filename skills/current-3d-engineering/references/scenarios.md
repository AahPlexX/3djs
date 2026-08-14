# End-to-end real-world scenarios

These scenarios define the minimum behaviors the skill must successfully route. The executable catalog is `tests/scenarios.json`; this file supplies the workflow detail an agent should apply.

## `S01-three-vite-greenfield` — Greenfield Three.js + Vite TypeScript

**Flow:** inspect the Vite/TS configuration → resolve current stable `three` → verify the exact Three.js APIs/addon import paths → create the scene/camera/renderer around the existing DOM layout → implement container-based responsive sizing and one time-aware loop → add teardown → run typecheck/build/tests and browser smoke checks.

**Failure traps:** copied imports from an older Three revision, canvas sized only once, duplicate loops, uncapped assumptions about DPR, and undisposed controls/textures/renderer.

## `S02-r3f-react-integration` — R3F/Drei in an existing React app

**Flow:** inspect React/React DOM majors and lockfile → verify the current Fiber↔React major pairing and Drei peers → install the smallest package set → place `<Canvas>` inside the app's real responsive layout → use R3F lifecycle/hooks instead of manually owning a second renderer loop → verify loading/error states, route remount, pointer/touch behavior, build and tests.

**Failure traps:** Fiber major mismatch, browser-only helper used on a native route, raw Three loop fighting R3F, and client-only assumptions crossing an SSR boundary.

## `S03-safe-3d-upgrade` — Existing stack upgrade

**Flow:** record manifest and lockfile state → identify direct and peer-coupled 3D packages → resolve current stable releases and exact peers → read official migration/release/API material for only the crossed versions → upgrade the smallest coherent set → update affected API calls → verify dependency tree, lockfile diff, tests, build, and original user flows.

**Failure traps:** upgrading wrappers independently of their peers, silently selecting alpha/canary, or rewriting unrelated rendering code during a dependency migration.

## `S04-gltf-production-pipeline` — glTF/GLB optimization

**Flow:** inspect source/runtime asset constraints → confirm current Khronos glTF semantics and engine loader extension support → select build-time transforms only when they serve a measured goal → configure decoders/transcoders and production asset URLs → validate optimized models → compare visual/animation fidelity and production loading.

**Failure traps:** enabling Draco/KTX2/Meshopt without runtime support, treating glTF as an authoring master, dev-server-only decoder paths, and deleting recoverable source assets.

## `S05-webgpu-progressive-enhancement` — WebGPU + fallback

**Flow:** verify current browser availability and secure-context requirements → verify the chosen engine's current WebGPU API → feature-detect before backend selection → handle initialization rejection → route to the product's defined WebGL or non-3D fallback → smoke-test each reachable backend.

**Failure traps:** assuming `navigator.gpu` means all required features exist, shipping blank output when device creation fails, and using experimental renderer examples from a mismatched library version.

## `S06-rapier-physics` — Rapier integration

**Flow:** inspect bundler/runtime and rendering architecture → resolve Rapier/wrapper versions and peers → prefer standard WASM package → await initialization before world use → define simulation step strategy and transform ownership → connect collision/event behavior → tear down world/resources → run collision/remount/build/runtime checks.

**Failure traps:** selecting `-compat` by habit, stepping physics from two loops, frame-rate-dependent simulation without intent, and orphaning a WASM world across route changes.

## `S07-babylon-viewer-app` — Babylon.js viewer/application

**Flow:** inspect existing Babylon packages → use current scoped ESM modules for a new bundled app unless constraints prove otherwise → verify loader/feature registration → wire engine/scene lifecycle and resize → load assets with explicit failure handling → dispose scene/engine → verify the production bundle and interaction flow.

**Failure traps:** mixing legacy global/UMD examples with ESM code, importing the entire legacy barrel when bundle constraints matter, and forgetting loader registration or engine disposal.

## `S08-playcanvas-engine-app` — PlayCanvas app/game

**Flow:** resolve current PlayCanvas engine → verify official graphics-device initialization → choose WebGPU/WebGL2 behavior from support targets → implement entities/components/assets with current APIs → align app resize/input lifecycle → verify representative browsers and production assets.

**Failure traps:** treating WebGPU as universal, relying on stale engine signatures, and testing only the editor/dev path rather than the shipped build.

## `S09-cesium-geospatial` — CesiumJS geospatial app

**Flow:** resolve current `cesium` → verify the current npm/bundler setup → configure `CESIUM_BASE_URL` before import when applicable and make Workers/ThirdParty/Assets/Widgets available → include required widget CSS → configure content/token use → destroy the viewer on teardown → test the production deployment's static files, workers and 3D content.

**Failure traps:** a dev build that works only because assets are served differently, missing workers, setting `CESIUM_BASE_URL` too late, or treating a public-service access token like an unrelated server secret without understanding its intended scope.

## `S10-webxr-immersive` — WebXR VR/AR

**Flow:** verify current W3C WebXR and engine integration docs → require HTTPS/secure context → check requested session support → begin immersive sessions from valid user activation → declare required vs optional features deliberately → handle frame/session lifecycle and exit → preserve required non-XR behavior → test on supported hardware when available.

**Failure traps:** old proposal-era snippets, auto-starting immersive sessions, requesting unsupported required features without fallback, and claiming headset validation without physical evidence.

## `S11-mobile-gpu-performance` — Mobile performance/memory diagnosis

**Flow:** reproduce/profile → inspect actual renderer stats and browser/device evidence → audit render resolution/DPR, draw calls, geometry, texture dimensions/formats, shader/post effects, render targets, per-frame allocations, context-loss signals, and lifecycle disposal → make the smallest measured fix → re-profile and regress desktop/interaction behavior.

**Failure traps:** random quality reductions, blanket `devicePixelRatio` use, changing physics and rendering simultaneously, and declaring a memory leak fixed without navigation/remount stress.

## `S12-ssr-framework-boundary` — SSR/hybrid framework integration

**Flow:** inspect the framework/version → verify its current client boundary and lazy/dynamic loading mechanism → ensure renderer creation occurs only after a client render target exists → keep initial layout/hydration stable → tear down on route/unmount/development remount → run server build, hydration, navigation and production checks.

**Failure traps:** `window`/WebGL access during server evaluation, hiding problems behind broad `typeof window` checks instead of a real client boundary, and leaking GPU resources on client navigation.
