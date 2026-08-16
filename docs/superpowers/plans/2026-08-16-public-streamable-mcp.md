# Public Streamable MCP Implementation Ledger

**Date:** 2026-08-16  
**Goal:** Add and deploy a real anonymous HTTPS Streamable HTTP MCP companion for `current-3d-engineering`, wire it into the existing plugin, preserve the universal project-first/provenance-first skill architecture, and require real external verification without authentication or mandatory paid dependencies.

## Completion rules

- Work remains on the authorized sole `main` branch.
- Public MCP access must require no login, OAuth, bearer token, API key, authorization header, or user secret.
- The public endpoint must remain read-only and bounded: no repository/filesystem mutation, shell/process execution, deployments, arbitrary URL proxying, private registries, credentials, database, or model invocation.
- The repository is the source of truth for protocol behavior, schemas, plugin configuration, tests, and deployment adapter.
- Same-app hosting QA is useful but insufficient; completion requires an independent raw-HTTPS path.
- The final ledger-closing commit must itself pass GitHub Actions before completion is reported. That post-commit result is deliberately not written back into this file, because doing so would create a new unverified HEAD.

## Task 1 — Red MCP and packaging contracts

- [x] Added `tests/public-mcp.test.mjs` defining legacy and modern MCP transport behavior, Origin handling, bounded request size, read-only tools/resources, and anonymous packaging requirements.
- [x] Added hybrid v1.4.0 packaging expectations for `skills` + `.mcp.json`.
- [x] Proved the red state in GitHub Actions rather than treating unexecuted tests as evidence.

Evidence:

```text
Red contract commit: c8b12132f35fe51253331c18709b3c8ea7dfa8ac
Red run:             31974652955
Existing tests:      29 passed
New MCP contracts:   failed because core/packaging did not yet exist
```

## Task 2 — Stateless read-only protocol core

- [x] Added `remote-mcp/appdeploy/backend/mcp-core.js`.
- [x] Added immutable bundled guidance resources for skill, source policy, project routing, and engineering invariants.
- [x] Implemented 64 KiB request cap, JSON-RPC validation, HTTPS-Origin matching when Origin is present, structured errors, and no persisted session state.
- [x] Implemented the `2025-11-25` initialization-era path: `initialize`, `notifications/initialized`, `ping`, tools, and resources.
- [x] Implemented the stateless `2026-07-28` path: `server/discover`, `ping`, tools, and resources with required protocol/method/name metadata checks.
- [x] Limited tools to `current_3d_info` and `current_3d_guidance`; intentionally omitted the optional network/npm lookup from the anonymous service.
- [x] Added a separate regression contract proving parameterless `tools/call` accepts omitted `arguments`.

Evidence:

```text
Protocol-core run:        31974808282 — 41/42 passed; only future packaging remained red
Optional-arguments run:  31974910715 — regression proved red before the narrow fix
```

Implementation adjustment from the original plan: hosted guidance is a concise immutable read-only projection of the governing rules, not a byte-for-byte copy of every full Markdown source. The full local skill/reference files remain authoritative for complete engineering behavior. This keeps remote responses bounded and removes runtime GitHub availability as a dependency.

## Task 3 — AppDeploy adapter and real deployment

- [x] Added the AppDeploy adapter, status/self-check source, styling, and three user-visible QA workflows under `remote-mcp/appdeploy/`.
- [x] Re-verified the provider's current free-hosting suitability before deployment; no paid AI, database, storage, secrets, auth, realtime, custom domain, or billable third-party service is used.
- [x] Fixed the initial deploy-blocking guidance serialization syntax error before making any live-success claim.
- [x] Strengthened same-app QA after the first green deployment exposed only 50% backend route coverage.
- [x] Final AppDeploy QA reached 3/3 E2E workflows, 2/2 backend routes, 100% endpoint coverage, and zero reported frontend/network/backend errors.
- [x] Independently traced AppDeploy's frontend-CDN versus backend-gateway routing instead of accepting same-app client behavior as public MCP proof.

Human-facing status page:

```text
https://current-3d-engineering-mcp-cpuz1i.v2.appdeploy.ai/
```

Canonical raw MCP gateway:

```text
https://api-v2.appdeploy.ai/app/current-3d-engineering-mcp-cpuz1i/api/mcp
```

## Task 4 — Hybrid v1.4.0 plugin packaging

- [x] Added `.mcp.json` containing exactly one anonymous remote HTTP server with only `type` and `url` fields.
- [x] Set `.codex-plugin/plugin.json` and `package.json` to v1.4.0.
- [x] Preserved `skills: "./skills/"` and added `mcpServers: "./.mcp.json"`.
- [x] Kept the MCP server key underscore-safe as `current_3d_engineering` while preserving the plugin name `current-3d-engineering`.
- [x] Updated the local validator to require HTTPS hybrid MCP packaging and reject credential-bearing/unsupported fields and loopback endpoints.
- [x] Updated README installation, public-access, compatibility, cost-boundary, hosting-gateway, and verification documentation.
- [x] Corrected validation from an over-specific exact `/api/mcp` pathname assumption to the actual host-independent invariant: the HTTPS path must end in `/api/mcp`.

## Task 5 — Independent live endpoint conformance

- [x] Added `tests/public-mcp-live.test.mjs`, which reads the canonical endpoint only from `.mcp.json` and uses real built-in `fetch` with bounded timeouts.
- [x] Live tests prove direct HTTPS GET refusal, legacy anonymous initialization/list/call, modern discover/list/named call, Origin rejection, header/name mismatch rejection, no auth challenge, and no hidden session requirement.
- [x] CI remains one minimal `main`/PR workflow and explicitly runs universal contracts, live npm integration, live deployed MCP integration, and plugin structure validation.
- [x] Recorded dated protocol/packaging/hosting/deployment evidence in `research/2026-08-16.md`.
- [x] Preserved a failed independent live run as evidence rather than weakening the tests.
- [x] Used systematic debugging to identify the actual provider gateway, then reran the same behavioral live tests against the corrected canonical URL.

Important red integration evidence:

```text
Wrong frontend-CDN live run: 31975409410
Result:                      live endpoint checks failed externally
Root cause:                  frontend CDN accepted cacheable GET but rejected raw POST
Correction:                  use AppDeploy public backend gateway in .mcp.json
```

A second independent raw probe from a separate Hatchable isolate confirmed the corrected backend gateway before the GitHub gate:

```text
GET             -> 405 Allow: POST
legacy init     -> 200
modern discover -> 200
modern call     -> 200
Mcp-Name mismatch -> 400 / -32020
invalid Origin  -> 403
credentials     -> none required
```

Fresh implementation verification before ledger closure:

```text
Implementation SHA: 38c3f28255e05e57cbeecdf932f9efc1db2e6fe5
GitHub Actions run: 31975725291
npm test:          47 passed / 0 failed / 0 skipped
npm run verify:    PASS
Validator output:  current-3d-engineering@1.4.0; architecture=project-first,provenance-first; remote-mcp=anonymous-read-only
```

## External final-HEAD release gate

After this ledger-closing commit is created, completion may be reported only if all of the following are independently re-verified without another repository mutation:

1. the GitHub Actions run is associated with this exact ledger-closing `main` SHA;
2. `npm test` reports zero failures, including real npm and real public MCP network tests;
3. `npm run verify` passes for v1.4.0 hybrid anonymous MCP packaging;
4. the repository branch topology still has only the authorized `main` branch.

If any item fails, this ledger is not a completion claim; resume debugging and create a new verified closing commit.
