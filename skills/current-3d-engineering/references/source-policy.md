# Current-source policy

This reference defines what counts as evidence for version-sensitive 3D/graphics engineering work across arbitrary project ecosystems.

## Mandatory evidence order

1. **Project truth first.** Read the project's own source-of-truth evidence for the requested change: dependency declarations and resolved state, workspace/subproject boundaries, imports/includes/module references, toolchain/compiler/interpreter metadata, engine/editor and SDK versions, build/runtime configuration, generated/vendor ownership, tests, CI, packaging, deployment, and target environment evidence as applicable.
2. **Provenance truth.** Determine how each relevant dependency or platform component is obtained before selecting an external source. Provenance may be a package registry or index, version-control revision, local/workspace path, vendored source, remote archive, system package, SDK/framework, engine/editor package system, generated artifact, system installation, or another mechanism proven by the project.
3. **Publisher/platform truth.** Use the authoritative registry/index metadata, upstream repository revision, SDK/platform metadata, engine/editor package metadata, or other first-party publication surface appropriate to that provenance. A registry is authoritative only for components actually obtained from that registry.
4. **API/behavior truth.** Use version-matched maintainer documentation, release notes, generated API references, upstream source, platform/SDK documentation, engine/editor documentation, or normative standards that define the exact API/format/protocol/behavior being changed.
5. **Corroborate material decisions.** When a compatibility decision has multiple authoritative surfaces, require them to agree on their respective claims. Publication metadata proves what was published; API documentation/source proves what that version does; project-local evidence proves what the project actually uses.

No single registry, documentation site, language, package manager, or standards body is globally mandatory. npm, language package indexes, SDK/vendor documentation, MDN, W3C, Khronos, or other sources are used only when the discovered technology makes them relevant.

## Prohibited default sources

Do not use `reddit.com`, `medium.com`, `wikipedia.org`, personal blogs, SEO tutorials, generated snippets, copied Stack Overflow answers, or unsourced model memory as evidence for current API/version/compatibility claims. A weaker source may be inspected only when the user explicitly requires it or no authoritative source can answer a non-critical historical question; it must never override authoritative evidence.

## Dependency provenance rules

- **Registry/index dependency:** verify the exact configured registry/index and candidate metadata. Do not assume a public default registry when project configuration points elsewhere.
- **Version-control dependency:** preserve and verify the requested/resolved revision, tag, branch, or commit. A registry version is not a substitute for the project's VCS dependency.
- **Local/workspace dependency:** inspect the actual local source and workspace resolution. Do not fabricate a public package lookup because the dependency name resembles a registry package.
- **Vendored dependency:** identify the vendored source/version/revision from project evidence and upstream metadata when available. Do not silently replace vendored code with a package-manager dependency.
- **SDK/framework/system dependency:** verify the installed/target SDK, framework, operating-system package, driver/runtime, engine/editor, or system component and its official compatibility documentation.
- **Generated/binary artifact:** identify the generator/source build, target architecture/platform, and reproducibility metadata before modifying or replacing the artifact.

## Version and release-channel rule

Version semantics are defined by the discovered ecosystem and project, not by this plugin.

- Preserve exact pins, lock/resolution state, VCS revisions, SDK/toolchain versions, engine/editor releases, build configurations, and release channels unless the requested change requires movement.
- Do not assume semantic versioning, a `latest` tag, or a universal meaning of stable/prerelease.
- When the ecosystem exposes stable/prerelease channels, follow its authoritative versioning/release rules and the project's existing channel unless the user requests a change.
- Never select a newer version, commit, SDK, engine/editor release, or toolchain merely because it is more recent; verify compatibility with the project's actual constraints.

The optional npm helper applies npm-specific semantic-version and `dist-tags` logic only to npm-compatible registry dependencies. That npm behavior is not a universal version rule.

## Unknown-technology rule

An unfamiliar language, engine, framework, package, SDK, build system, editor, renderer, or dependency source is not unsupported. Determine its role and provenance from project evidence, identify the authoritative maintainer/vendor/upstream sources, verify the installed or requested version/revision/toolchain, and continue from evidence. Never replace unknown technology with familiar technology solely to fit a predefined workflow.

## Conflict resolution

When authoritative sources conflict, stop the affected implementation decision and identify what each source is actually claiming.

- **Project resolution vs publisher metadata:** project resolution proves what is currently selected; publisher metadata proves what exists externally. Do not silently change one to match the other.
- **Current docs vs installed/target version:** do not apply a current API to an older installed version. Use version-matched documentation/source or make an explicit, tested migration.
- **Registry/index vs VCS/local/vendor source:** follow the provenance the project actually uses. Do not substitute a registry package for a different source mechanism.
- **Toolchain/SDK vs library docs:** satisfy both when compatibility depends on compiler, ABI, SDK, driver/runtime, engine/editor, or target architecture.
- **Normative standard vs implementation docs:** use the standard for normative semantics and vendor/maintainer documentation for implementation-specific behavior and support.
- **Two first-party pages disagree:** prefer the source scoped to the exact version/component/target, then inspect release notes or upstream source. State unresolved conflicts instead of guessing.

Never average conflicting facts, guess a compatibility range, or invent a migration path.

## Integration-validation rule

When validating an external registry, index, repository API, package service, remote API, SDK service, or other network integration, use the actual authoritative endpoint/environment for the claim. Do not substitute loopback servers, fabricated remote payloads, or simulated HTTP responses as evidence that a real external integration works. Keep pure algorithm tests separate from integration claims. If the real service cannot be reached, report that limitation rather than converting the check into simulated success.

## Offline/failure behavior

If authoritative external sources cannot be reached, continue only with facts provable from project-local manifests/resolution files, source, vendored code, installed toolchains/SDKs, engine/editor metadata, generated metadata, tests, binaries/symbols, or cached version-specific first-party documentation. State that current external verification was unavailable. Do not label remembered or cached information as latest/current when that cannot be proven.