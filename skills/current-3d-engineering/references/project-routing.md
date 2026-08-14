# Project-first routing

Use this reference after inspecting the repository. It defines how to decide what matters without relying on a predefined list of engines, frameworks, packages, or workflows.

## Start from evidence, not labels

1. Read the project's direct dependencies, lockfile, imports, configuration, build scripts, and runtime entry points.
2. Identify which files and packages participate in the requested behavior.
3. Determine dependency relationships from actual package metadata and official documentation: peers, optional dependencies, declaration packages, adapters, loaders, codecs, workers, WASM modules, and build-time tools.
4. Preserve the current architecture unless a change is required by the request or proven incompatibility.
5. Treat every unfamiliar package as researchable rather than unsupported.

Do not map a project to a stored scenario or decide support based on whether a package name appears in this plugin's documentation.

## Describe roles dynamically

Roles are useful only as descriptions of discovered responsibilities. A package may provide rendering, an application engine, a framework adapter, physics, asset processing, geospatial behavior, XR integration, type declarations, build tooling, or several responsibilities at once. Do not assume a package's role from its name; verify its actual use and upstream documentation.

When multiple packages overlap, identify who owns each concern in the current project before changing anything. Examples of concerns include render-loop ownership, scene state, input, asset loading, physics stepping, resource disposal, worker lifecycle, and client/server initialization.

## Existing projects

For an existing project:

- Keep manifest and lockfile state as the starting truth.
- Trace imports/configuration for the requested feature before proposing dependency changes.
- Resolve all direct dependency metadata with project mode when a broad compatibility picture is needed.
- Narrow with explicit `--package` arguments when only a subset is relevant or when a related package is not declared directly.
- Verify exact APIs against the installed/candidate version's official documentation or source.
- Upgrade the smallest coherent dependency set; do not independently upgrade wrappers/adapters without checking their peer ranges.
- Preserve unrelated code and dependency state.

## Greenfield projects

For greenfield work, derive requirements before selecting technology. Relevant requirements may include rendering model, framework integration, target devices, performance budget, content pipeline, accessibility, SSR/hybrid constraints, deployment model, XR/geospatial needs, licensing, and maintenance expectations.

Research current candidates at runtime from authoritative sources. Selection must follow the requirements and evidence, not a static preference table in this plugin.

## Type and package boundaries

Do not assume runtime packages contain every type declaration the project needs. Inspect the package's published metadata, TypeScript configuration, bundled declarations, platform DOM typings, and official guidance. Add a separate declaration package only when the current project actually requires it.

Likewise, do not assume a core package includes optional loaders, codecs, extensions, workers, physics backends, or build-time utilities. Verify the concrete feature's package boundary before installation.

## Runtime and deployment boundaries

Determine where code executes: server, browser, worker, build step, native wrapper, test environment, or multiple boundaries. Browser-only graphics initialization must not leak into server evaluation. Build-time asset tooling should not be shipped to clients unless the product genuinely needs runtime transformation.

Verify production asset base paths, MIME behavior, worker URLs, decoder/transcoder locations, public-path/subpath behavior, CSP/security constraints, and service-token scope from the actual deployment rather than assuming development-server behavior.

## Unknown technology rule

If the project uses a technology not previously encountered, do not substitute a familiar library. Instead:

1. identify the package/repository and exact installed version;
2. resolve current registry metadata when applicable;
3. find the maintainer's official documentation or upstream source;
4. verify the exact feature/API and compatibility constraints;
5. implement against the existing architecture;
6. validate using the project's own build/runtime path.

The absence of a package from this plugin's examples is never evidence that the package is unsupported.