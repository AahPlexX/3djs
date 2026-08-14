# Universal Capability Architecture Design

## Goal

Make Current 3D Engineering universally applicable to arbitrary JavaScript/TypeScript 3D projects without encoding personas, named user journeys, scenario IDs, curated workflow catalogs, or a fixed allowlist of supported packages.

## Hard constraints

- No persona-specific or journey-specific runtime behavior.
- No scenario IDs or scenario catalog used to drive plugin behavior or validation.
- No curated `DEFAULT_PACKAGES` allowlist in the package resolver.
- An unfamiliar package, engine, framework, adapter, physics library, asset tool, XR library, geospatial library, type package, or build tool must be treated as a first-class input.
- Current project evidence and current authoritative external evidence decide behavior at runtime.
- Tests may use representative inputs to prove generic behavior, but representative inputs must never become production routing rules or allowlists.
- Real external integration checks must continue to use the authoritative npm registry rather than simulated registry endpoints.

## Architecture

### Project-first discovery

The skill starts from the actual repository: manifest, lockfile, imports, framework/runtime boundaries, TypeScript configuration, build tooling, target environments, tests, deployment, and the concrete request. It must not classify the request into a predefined scenario before acting.

### Open-ended package resolution

`resolve-packages.mjs` accepts arbitrary repeated `--package <name>` values. With `--project <path>` and no explicit package arguments, it resolves every direct dependency declared in `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`. The resolver has no internal list of recognized 3D packages.

The agent decides which resolved packages are relevant to the requested work after inspecting the project. Related packages that are not direct dependencies can be queried explicitly with `--package`.

### Generic routing

Routing is based on discovered roles and constraints rather than product names. Examples of roles include rendering/runtime engine, framework adapter, helper layer, physics, asset processing, geospatial, XR, types, and build/deployment tooling. These roles are descriptive, not an exhaustive taxonomy or allowlist. Unknown roles and packages are researched from their own authoritative documentation.

### Engineering invariants

The plugin keeps reusable correctness rules that apply across stacks: dependency and peer compatibility, type availability, environment boundaries, feature detection, lifecycle/resource ownership, timing, responsive sizing, asset/deployment correctness, security/secrets, failure handling, and evidence-based verification. Applicability is determined from the actual project rather than from a predefined workflow.

## Validation design

The test suite proves properties rather than journeys:

1. plugin packaging and discovery remain valid;
2. the skill references generic source, routing, and invariant documents;
3. no current product file depends on scenario/persona catalogs;
4. the resolver contains no package allowlist;
5. explicit arbitrary package names resolve against the live npm registry;
6. project mode resolves every direct dependency section from a temporary project manifest;
7. resolver results agree with independently fetched live npm manifests;
8. no loopback/simulated registry replaces real integration evidence;
9. structure validation does not require scenario counts or scenario files.

## Documentation policy

Current documentation describes universal behavior and may mention technologies only as non-binding examples. Historical scenario catalogs and journey fixtures are removed from the current tree so they cannot become accidental routing contracts or stale SSOT.

## Success criteria

A project using an engine or package never previously named in this repository can still be inspected, resolved, researched, implemented, and verified through the same generic workflow without adding a new scenario, persona, package allowlist entry, or special-case branch.