# Current-source policy

This reference defines what counts as evidence when the plugin handles a version-sensitive 3D request.

## Mandatory source order

1. **Repository truth first.** Read the project's `package.json`, lockfile, package-manager configuration, framework configuration, source imports, and CI commands. Installed/ranged versions and local architecture constrain what can be changed safely.
2. **Published package truth.** Resolve package metadata through `https://registry.npmjs.org`. Treat npm's `dist-tags.latest` as the registry's default release tag, but also calculate the highest stable semantic version. If `latest` points to a prerelease, do not silently install it.
3. **Library API truth.** Use the library maintainer's official documentation or version-matched upstream repository/source. Examples include `threejs.org`, `r3f.docs.pmnd.rs`, `doc.babylonjs.com`, `developer.playcanvas.com`, `cesium.com/learn`, `rapier.rs`, and `gltf-transform.dev`.
4. **Web-platform truth.** Use `developer.mozilla.org` for implementer-oriented browser guidance and compatibility context. Use normative specifications from `w3.org` for Web APIs such as WebXR and `khronos.org` / `registry.khronos.org` for glTF and Khronos standards.
5. **Corroborate material decisions.** For a version/API decision that can break a build, require both package metadata and official API documentation when both exist.

## Prohibited default sources

Do not use `reddit.com`, `medium.com`, `wikipedia.org`, personal blogs, SEO tutorials, generated snippets, copied Stack Overflow answers, or unsourced model memory as evidence for current API/version claims. A prohibited source may be inspected only when the user explicitly requires it or no primary source can answer a non-critical historical question; it must never override authoritative evidence.

## Stable-release rule

- Stable is a semantic version without a prerelease suffix such as `-alpha`, `-beta`, `-rc`, or `-canary`.
- Do not select a prerelease simply because it is newer.
- Inspect peer dependencies and engine requirements on the exact candidate version before changing a project.
- Preserve a working lockfile unless the requested change requires dependency resolution.

## Conflict resolution

When sources conflict, stop the implementation decision and identify what each source is actually claiming.

- **Registry vs documentation version:** use the npm registry for what is published; use version-specific official docs/source for what that version supports.
- **Current docs vs installed project:** do not apply a current API to an older installed major. Either use the installed-version API or make an explicit, tested upgrade.
- **MDN vs W3C/Khronos wording:** use the standard for normative semantics and MDN for practical browser-implementation guidance.
- **Two official pages disagree:** prefer the page scoped to the exact package/version/API, then inspect release notes or upstream source. State the unresolved conflict if it cannot be proven.

Never average conflicting facts, guess a compatibility range, or invent a migration path.

## Integration-validation rule

When validating registry or remote API behavior, use the actual authoritative endpoint. Do not substitute loopback servers, fabricated registry payloads, or simulated HTTP responses for evidence that an external integration works. Keep pure algorithm tests separate from integration claims. If the real service is unreachable, report the network failure rather than converting the check into simulated success.

## Offline/failure behavior

If the registry or official docs cannot be reached, continue only with facts that can be proven from local manifests, lockfiles, installed typings/source, tests, or cached version-specific documentation. State that current external verification was unavailable. Do not label any remembered or cached version as "latest".
