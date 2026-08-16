export const GUIDANCE_RESOURCES = Object.freeze({
  'current-3d://skill': Object.freeze({
    uri: 'current-3d://skill',
    name: 'Current 3D Engineering Skill',
    description: 'Core project-first operating rules for current 3D and graphics engineering.',
    mimeType: 'text/markdown',
    text: `# Current 3D Engineering

## Core rule

Never write or change 3D/graphics integration code from remembered ecosystem state alone. Establish the current date, inspect the actual project and request, discover the technologies and ownership boundaries that are really present, verify current dependency/API/toolchain facts from authoritative sources appropriate to those technologies, then implement and prove the result.

Do not classify work into predefined scenarios, personas, supported-language lists, supported-engine lists, package-manager lists, or workflow IDs. An unfamiliar language, build system, dependency source, SDK, engine, editor, renderer, framework, or architecture is a first-class input: discover what the project actually uses and research that technology from its own authoritative sources.

## Establish project truth safely

Before installation, command execution, or code changes, inspect dependency and resolution state; relevant roots and targets; toolchain, SDK, engine/editor and platform versions; source/runtime entry points; generated, vendored and managed ownership; verification/deployment commands; runtime boundaries; assets, shaders, native components and persisted data. Preserve uncommitted, unsaved, staged, locally generated and other developer-authored work. Do not manufacture a clean baseline by resetting or overwriting real work.

Establish whether the visible working copy is complete enough for the requested conclusion. Missing content may be sparse, externally synchronized, generated, imported, restored or otherwise materialized by the project. Do not infer absence until completeness is established, and do not trigger material side effects merely to make a checkout complete.

## Research from provenance

Determine how each relevant dependency or platform component is actually obtained before choosing an external source. Registry/index, version-control, local/workspace, vendored, SDK/framework, engine/editor, operating-system, generated, binary and other project-defined provenance require different authoritative evidence. Package metadata alone does not prove an API.

## Establish execution trust

Treat repository commands, installers, lifecycle hooks, generators, editor automation, deployment operations, native binaries and remote bootstrap commands as executable code. Inspect unfamiliar commands with material filesystem, network, credential, signing, publishing, migration or external-state effects before execution. Use the least-privileged established project path that proves the claim.

## Implement from the actual project

Preserve the working architecture unless the request or proven incompatibility requires change. Respect project-specific versioning, release, ownership and compatibility semantics. Apply only engineering invariants the project actually exposes.

For persisted 3D content, establish schema/format ownership plus relevant units, scale, coordinate system, handedness, axes, color semantics, transforms, animation, skeleton, material/texture, collision/physics and application metadata before migration. Preserve recoverable originals for lossy or destructive transforms.

## Verify the actual result

After execution-trust review, run the project's applicable verification paths and exercise the changed runtime boundary. Make target-specific claims only for targets actually exercised or narrowly proven by authoritative evidence. Report material environment limitations explicitly.`,
  }),
  'current-3d://source-policy': Object.freeze({
    uri: 'current-3d://source-policy',
    name: 'Current-source Policy',
    description: 'Evidence and source-selection policy for version-sensitive 3D engineering.',
    mimeType: 'text/markdown',
    text: `# Current-source policy

This reference defines what counts as evidence for version-sensitive 3D/graphics engineering across arbitrary project ecosystems.

## Mandatory evidence order

1. Project truth first: current developer state, declarations/resolution, relevant roots, source references, toolchain/SDK/engine/editor state, build/runtime configuration, ownership, tests, CI, packaging, deployment and target evidence as applicable.
2. Materialization truth: establish whether the visible project is complete enough before declaring content absent.
3. Provenance truth: determine how each relevant component is obtained before selecting an external source.
4. Publisher/platform truth: use the authoritative publication surface appropriate to that proven provenance.
5. API/behavior truth: use version-matched maintainer documentation, release notes, generated API references, upstream source, vendor/platform documentation or normative standards.
6. Corroborate material decisions where multiple authoritative surfaces define different parts of the claim.

No single registry, language, package manager, documentation site or standards body is globally mandatory.

## Preserve working evidence

Developer-authored local state is evidence. Do not discard uncommitted, staged, unsaved/editor-managed, locally generated or partially migrated work because committed state is easier to analyze. Do not reset, clean, force-checkout, revert or overwrite unrelated developer changes without authorization.

## Materialization rule

Before claiming a resource is absent, determine whether relevant content has actually been materialized. Partial checkouts, external components, large-file pointers, dependency restore, generated/imported state, asset synchronization and other project-defined mechanisms can all make a visible tree incomplete. Do not automatically fetch, restore, import or generate when that can require credentials, large transfers, license acceptance, destructive regeneration or external side effects.

## Source quality

Do not use Reddit, Medium, Wikipedia, personal blogs, SEO tutorials, generated snippets, copied forum answers or unsourced model memory as evidence for current API/version/compatibility claims when authoritative sources are available. Current external integration claims require the real authoritative endpoint/environment; simulated responses do not prove a live integration.

## Version and conflict rules

Version semantics come from the discovered project/ecosystem. Preserve exact pins, revisions, SDK/toolchain versions, release channels and resolution state unless the requested change requires movement. Do not infer that newer means compatible.

When authoritative sources conflict, identify what each source actually proves. Project resolution proves what is selected; publisher metadata proves what exists; version-matched API documentation/source proves behavior. Follow actual provenance and exact target version. State unresolved conflicts instead of averaging or guessing.

## Failure behavior

If current authoritative sources cannot be reached, continue only with facts provable from complete-enough project-local or already materialized authoritative evidence. State that current external verification was unavailable and do not label remembered information as current.`,
  }),
  'current-3d://project-routing': Object.freeze({
    uri: 'current-3d://project-routing',
    name: 'Project-first Routing',
    description: 'Evidence-driven routing for arbitrary 3D/graphics project structures.',
    mimeType: 'text/markdown',
    text: `# Project-first routing

Use evidence, not stored project labels. Identify the roots relevant to the requested behavior, their source-of-truth files and commands by responsibility, the actual source/assets involved, dependency provenance, ownership boundaries, current developer state and materialization completeness. Preserve the current architecture and reproducible project state unless the request or proven incompatibility requires change.

## Preserve developer-authored state

Treat current local work as project truth. Patch around uncommitted, staged, unsaved/editor-managed, locally generated and partially migrated state. Do not reset, clean, revert, regenerate over or overwrite unrelated work to manufacture a clean baseline. Prefer reversible or atomic edits when destructive work lacks a reliable recovery path.

## Multi-root and polyglot projects

A repository may contain multiple languages, toolchains, workspaces, native modules, generated bindings, shader languages, editor projects and deployment targets. Scope discovery to the requested behavior; identify every participating boundary and verify each affected build/runtime boundary without expanding into unrelated roots.

## Ownership and provenance

Before editing, determine whether each file or artifact is authoritative source, generated output, vendored code, editor/engine-managed state, cached/intermediate output, checked-in binary or persisted product data. Modify the owning source/pipeline rather than disposable output unless the documented project workflow requires otherwise.

Determine dependency provenance before version lookup. Never assume a dependency name means a public package and never substitute registry metadata for local, vendored, VCS, SDK, system or managed provenance.

## Existing and greenfield work

For existing projects, keep resolved dependency/toolchain state and developer-authored changes as starting truth, trace the requested behavior, verify exact APIs against the installed/target version and upgrade only the smallest coherent coupled set.

For greenfield work, derive requirements and constraints before selecting technology. Research current candidates from authoritative sources instead of using a static preference table.

## Runtime and deployment boundaries

Determine where changed code actually executes and which layers own rendering, assets, binaries, permissions, signing, secure-context behavior, services and target-specific packaging. Development success alone is not deployment proof.

## Unknown technology

Unknown technology is researchable, not unsupported. Establish its role, provenance, exact version/toolchain state, materialization status and authoritative sources; inspect side effects before commands; then implement against the existing architecture and validate through the project's real path.`,
  }),
  'current-3d://engineering-invariants': Object.freeze({
    uri: 'current-3d://engineering-invariants',
    name: 'Engineering Invariants',
    description: 'Reusable correctness properties applied only when the actual project exposes them.',
    mimeType: 'text/markdown',
    text: `# Engineering invariants

Apply an invariant only when the actual project owns or exposes that concern.

## State, materialization and provenance

Preserve developer-authored state; establish working-copy completeness before interpreting absence; identify exact dependency/component provenance and compatibility relationships before changing versions or sources; preserve resolution state outside the requested path.

## Toolchain, native and generated boundaries

Establish compiler/interpreter, build system, SDK/toolset, engine/editor, target architecture/platform and build configuration where relevant. Verify source, compile, link, ABI, binary and runtime compatibility as separate concerns. Respect generated/editor-managed ownership and shader source-to-artifact pipelines.

## Execution trust

Repository commands are executable code. Inspect unfamiliar commands with material side effects; identify filesystem mutation, install hooks, network access, services, credentials, migrations, signing, publishing/deployment and global-system effects; use least privilege and do not expose secrets to untrusted code.

## Runtime ownership and lifecycle

Establish runtime boundaries and which layer owns render/update loops, state, input, physics, resources, workers/threads, sessions, native handles and caches. Do not create competing owners. Release resources on teardown when the runtime does not own disposal automatically.

## Time, rendering and capabilities

Use measured delta/fixed-step timing intentionally rather than assumed frame rate. Keep explicit state synchronization when systems interact. Derive presentation sizing, projection, density and quality controls from the actual target. Detect optional capabilities before use and preserve required fallback paths.

## Assets and persisted 3D semantics

Distinguish authoring/source assets from imported, generated, optimized, baked, compiled or delivery assets. When persisted data crosses versions, establish schema/format ownership, reader/writer compatibility and migration direction. Preserve product-relevant units/scale, coordinate systems, handedness, axes, transforms, color/transfer semantics, animation, skeletons, materials/textures, collision/physics, IDs/references and application metadata. Parsing is not proof of semantic compatibility. Preserve recoverable originals for lossy/destructive transformation.

## Security, failure and performance

Keep credentials in their intended trust boundary. Account for actual platform permissions, sandboxing, secure-context/CSP/CORS rules, signing and distribution requirements. Handle failures at the layer that owns them. Measure before making optimization claims and do not infer performance parity across untested devices, GPUs, drivers, architectures or build configurations.

## Verification

Run the project's applicable tests, compiler/static analysis, build/link, shader, editor/engine, packaging/signing, deployment and runtime checks after execution-trust review. Exercise the changed target path, preserve unrelated developer state, and state environment limitations explicitly.`,
  }),
});

export const GUIDANCE_LIST = Object.freeze(Object.values(GUIDANCE_RESOURCES));
