# Current-source policy

This reference defines what counts as evidence for version-sensitive 3D/graphics engineering work across arbitrary project ecosystems.

## Mandatory evidence order

1. **Project truth first.** Read the project's own source-of-truth evidence for the requested change: current developer working state, dependency declarations and resolved state, workspace/subproject boundaries, imports/includes/module references, toolchain/compiler/interpreter metadata, engine/editor and SDK versions, build/runtime configuration, generated/vendor ownership, tests, CI, packaging, deployment, and target environment evidence as applicable.
2. **Materialization truth.** Establish whether the visible working copy is complete enough for the requested conclusion. Missing content can reflect sparse/partial materialization, external components, large-file pointers, dependency restore, generated/imported state, or another project-defined sync mechanism. Absence is not proven until the relevant materialization state is understood.
3. **Provenance truth.** Determine how each relevant dependency or platform component is obtained before selecting an external source. Provenance may be a package registry or index, version-control revision, local/workspace path, vendored source, remote archive, system package, SDK/framework, engine/editor package system, generated artifact, system installation, or another mechanism proven by the project.
4. **Publisher/platform truth.** Use the authoritative registry/index metadata, upstream repository revision, SDK/platform metadata, engine/editor package metadata, or other first-party publication surface appropriate to that provenance. A registry is authoritative only for components actually obtained from that registry.
5. **API/behavior truth.** Use version-matched maintainer documentation, release notes, generated API references, upstream source, platform/SDK documentation, engine/editor documentation, or normative standards that define the exact API/format/protocol/behavior being changed.
6. **Corroborate material decisions.** When a compatibility decision has multiple authoritative surfaces, require them to agree on their respective claims. Publication metadata proves what was published; API documentation/source proves what that version does; project-local evidence proves what the project actually uses.

No single registry, documentation site, language, package manager, or standards body is globally mandatory. npm, language package indexes, SDK/vendor documentation, MDN, W3C, Khronos, or other sources are used only when the discovered technology makes them relevant.

## Preserve working evidence

Developer-authored local state is evidence. Uncommitted, staged, unsaved/editor-managed, locally generated, or partially migrated work must not be discarded merely because committed upstream state is easier to analyze.

- Inspect the available working-state mechanism before mutation when one exists.
- Do not reset, clean, force-checkout, revert, or overwrite unrelated developer changes without explicit authorization.
- Do not interpret a clean remote commit as more authoritative than the local state the developer is actually asking you to modify.
- When destructive transformation is necessary and there is no reliable version-control recovery path, use a reversible or recoverable approach appropriate to the project.

## Materialization and incomplete-project rule

Before claiming that a resource is absent or a project is broken because something is missing, determine whether the relevant project content has actually been materialized.

Possible signals include sparse or partial checkouts, uninitialized nested repositories/submodules, large-file pointer content, external asset/package stores, generated source, build artifacts, editor imports, dependency restore, vendor sync, or another project-defined mechanism. These are examples, not support requirements.

Do not automatically fetch, initialize, restore, import, or generate material when that action can involve credentials, network transfer, license acceptance, expensive downloads, destructive regeneration, or external side effects. Establish the intended project mechanism and authorization first. If materialization cannot be completed, state that limitation and do not convert incomplete local evidence into a definitive claim about the full project.

## Prohibited default sources

Do not use `reddit.com`, `medium.com`, `wikipedia.org`, personal blogs, SEO tutorials, generated snippets, copied Stack Overflow answers, or unsourced model memory as evidence for current API/version/compatibility claims. A weaker source may be inspected only when the user explicitly requires it or no authoritative source can answer a non-critical historical question; it must never override authoritative evidence.

## Dependency provenance rules

- **Registry/index dependency:** verify the exact configured registry/index and candidate metadata. Do not assume a public default registry when project configuration points elsewhere.
- **Version-control dependency:** preserve and verify the requested/resolved revision, tag, branch, or commit. A registry version is not a substitute for the project's VCS dependency.
- **Local/workspace dependency:** inspect the actual local source and workspace resolution. Do not fabricate a public package lookup because the dependency name resembles a registry package.
- **Vendored dependency:** identify the vendored source/version/revision from project evidence and upstream metadata when available. Do not silently replace vendored code with a package-manager dependency.
- **SDK/framework/system dependency:** verify the installed/target SDK, framework, operating-system package, driver/runtime, engine/editor, or system component and its official compatibility documentation.
- **Generated/binary artifact:** identify the generator/source build, target architecture/platform, and reproducibility metadata before modifying or replacing the artifact.

## npm-helper scope

The bundled npm helper is intentionally narrower than npm itself. Its `--registry <url>` option selects one simple npm-compatible HTTP registry endpoint for metadata requests. It does **not** implement the full `.npmrc` configuration model, scoped-registry routing, authentication/token handling, proxy behavior, client certificates/keys, or other npm client configuration semantics.

When a project relies on scoped registries, private authentication, enterprise proxies/certificates, or other `.npmrc` behavior, use the project's established npm tooling/configuration and current npm documentation. Do not bypass that configuration by assuming a single direct registry URL is equivalent.

## Version and release-channel rule

Version semantics are defined by the discovered ecosystem and project, not by this plugin.

- Preserve exact pins, lock/resolution state, VCS revisions, SDK/toolchain versions, engine/editor releases, build configurations, and release channels unless the requested change requires movement.
- Do not assume semantic versioning, a `latest` tag, or a universal meaning of stable/prerelease.
- When the ecosystem exposes stable/prerelease channels, follow its authoritative versioning/release rules and the project's existing channel unless the user requests a change.
- Never select a newer version, commit, SDK, engine/editor release, or toolchain merely because it is more recent; verify compatibility with the project's actual constraints.

The optional npm helper applies npm-specific semantic-version and `dist-tags` logic only to npm-compatible registry metadata. Any stable value it derives is a **registry candidate**, not a project compatibility recommendation. Project constraints, resolved state, peers/engines, API documentation, and runtime/toolchain compatibility still determine whether a candidate is usable.

## Execution-trust rule

Repository commands, package lifecycle/install hooks, build scripts, generators, editor automation, native binaries, deployment scripts, and remote bootstrap commands are executable code. Their existence does not make them trusted or safe for the current environment.

Before running unfamiliar executable project code with material side effects:

- inspect the command and what it invokes;
- identify filesystem writes/deletions, generated output, install/postinstall hooks, network access, remote services, credentials/secrets, signing/publishing/deployment operations, migrations, global installation, and other external state changes when relevant;
- use the least-privileged project-established path that can prove the claim;
- do not expose credentials or secrets to untrusted code;
- do not blindly execute downloaded content or `curl | shell`-style bootstrap flows;
- distinguish read-only/local validation from commands that mutate external systems.

If the project's verification command cannot be executed safely in the available environment, report the limitation instead of pretending that command execution was verified.

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

If authoritative external sources cannot be reached, continue only with facts provable from complete-enough project-local manifests/resolution files, source, vendored code, installed toolchains/SDKs, engine/editor metadata, generated metadata, tests, binaries/symbols, or cached version-specific first-party documentation. State that current external verification was unavailable. Do not label remembered or cached information as latest/current when that cannot be proven.
