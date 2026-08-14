# Library routing and integration guardrails

Use this reference after inspecting the project. Selection is based on the job and existing architecture, not download counts.

| Need | Prefer | Package(s) | Primary evidence | Integration guardrail |
|---|---|---|---|---|
| Direct general-purpose web 3D/rendering | Three.js | `three`; in TypeScript projects also verify whether `@types/three` is required by the current Three.js guidance/project compiler state | `threejs.org` + npm registry | Verify the exact renderer/addon import path for the installed/current version; addons evolve quickly. Do not assume Three.js bundles every TypeScript declaration needed by the project. |
| Declarative 3D inside an existing React application | React Three Fiber | `three`, `@react-three/fiber`; TypeScript projects may also require `@types/three` | `r3f.docs.pmnd.rs`, upstream repository + npm registry | Match Fiber major to React major from current official installation docs; verify Three.js/type compatibility; never add a second manual render loop. |
| Reusable helpers for an R3F scene | Drei | `@react-three/drei` | pmndrs docs/repo + npm registry | Add only for helpers actually used; verify peer dependencies and `/native` export differences when targeting React Native. |
| Full-featured web 3D/game/application engine | Babylon.js | `@babylonjs/core` plus feature modules | `doc.babylonjs.com` / `babylonjs.com` + npm registry | Prefer scoped ES modules for new bundled projects; import only needed modules when tree-shaking matters. |
| ECS/editor-oriented browser game or interactive 3D app | PlayCanvas | `playcanvas` | `developer.playcanvas.com` + npm registry | Treat WebGPU as capability-dependent and preserve WebGL2 fallback when broad support is required. |
| Globe, WGS84, terrain, 3D Tiles, geospatial visualization | CesiumJS | `cesium` or the current officially documented scoped packages when they better fit the project | `cesium.com/learn` + npm registry | Configure `CESIUM_BASE_URL` before import when required and serve/copy Cesium's Workers, ThirdParty, Assets, and Widgets. Include widget CSS. Test the actual deployed base/subpath. Keep ion tokens scoped appropriately. |
| Standalone rigid-body/collider physics | Rapier | `@dimforge/rapier3d` | `rapier.rs` + npm registry | WASM initialization is asynchronous. Use `-compat` only when the actual bundler/runtime cannot load the normal WASM package reliably. |
| React/R3F physics integration | react-three-rapier | `@react-three/rapier`, Rapier transitive/direct as required | upstream docs + npm registry | Match wrapper major to React/Fiber major; confirm exact peer dependencies before install. |
| Offline/build-time glTF transformation | glTF Transform | `@gltf-transform/core`, `@gltf-transform/extensions`, `@gltf-transform/functions`, `@gltf-transform/cli` as needed | `gltf-transform.dev` + npm registry | Keep the SDK packages version-aligned where the current package graph requires it. Verify transform-specific codecs/encoders (for example Draco, Meshopt, Sharp, Basis/KTX2 tooling) from current official docs before adding them. Run transforms in a build/asset pipeline unless browser-side transformation is explicitly needed; validate output assets. |
| Runtime interchange format | glTF/GLB | engine loader + Khronos glTF 2.0 | `registry.khronos.org/glTF` | glTF is a runtime delivery format. Confirm support before adding compression/material/texture extensions. Required glTF extensions must be supported by the selected runtime and configured decoders/transcoders. |
| GPU-first rendering/compute | WebGPU through selected engine or Web API | engine-specific | MDN + W3C/WebGPU spec + engine docs | WebGPU is not universally available; use secure contexts and capability checks, then follow product fallback requirements. |
| Immersive VR/AR | WebXR through selected engine or Web API | engine-specific; direct TypeScript projects should verify whether `@types/webxr` is needed | W3C WebXR + engine docs + npm registry for supplemental typings | Secure context, `navigator.xr`/session capability checks, user activation, explicit optional/required features, and a non-XR path where the product requires one. Do not install a polyfill or typings package by reflex; prove the project actually needs it. |

## TypeScript declaration rule

Runtime packages and TypeScript declarations are separate compatibility surfaces. Before declaring a TypeScript journey complete:

- Run the project's real typecheck rather than assuming package installation implies usable types.
- If a runtime library does not provide the declarations required by the project, resolve the current matching declaration package from npm and official/upstream guidance.
- Prefer the declaration version intended for the installed runtime and TypeScript version; do not blindly pair unrelated latest versions.
- For WebXR, first inspect the project's TypeScript/DOM libs. Add `@types/webxr` only when the required XR interfaces are absent or the project's established type strategy already uses it.

## Cross-cutting implementation rules

### Rendering and lifecycle

- Keep exactly one authoritative animation/render loop per rendered surface.
- Tie updates to measured time, not assumed frame rate.
- On unmount/reload/navigation, detach listeners and dispose resources the selected library does not automatically own: renderers/engines, geometries, materials, textures, controls, loaders/decoder workers, physics worlds, XR sessions, and other GPU/WASM resources as applicable.
- Do not dispose shared/cached assets while another scene still owns them; establish ownership first.

### Responsive browser behavior

- Size the canvas from its containing layout rather than assuming viewport dimensions.
- Update renderer resolution/aspect/projection after actual container-size changes.
- Treat device pixel ratio as a performance budget, not a requirement to render at the device's maximum density.
- Test pointer/touch input and orientation/resize behavior on representative narrow, wide, and high-DPI targets.

### Assets

- Prefer glTF/GLB for runtime 3D delivery unless project constraints require another format.
- Use Draco/Meshopt/KTX2/Basis or other compression only when the selected loader/runtime and target devices are verified to support the required extension/decoder path.
- Preprocess expensive assets at build time when doing so reduces client work and preserves required fidelity.
- Verify MIME/path/base URL behavior in the production build, not only the dev server.

### SSR/framework boundaries

- Do not execute DOM, WebGL, WebGPU, WebXR, canvas, or window-dependent initialization during server rendering.
- Place the 3D runtime behind the framework's actual client boundary and initialize after the render target exists.
- Clean up on route transitions and development remounts; do not rely on a full page refresh to release resources.
