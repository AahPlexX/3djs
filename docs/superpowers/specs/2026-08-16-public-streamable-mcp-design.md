# Public Streamable MCP Design

**Date:** 2026-08-16

## Goal

Make `current-3d-engineering` openly usable through a real remote MCP endpoint with these hard requirements:

- public HTTPS endpoint;
- Streamable HTTP transport;
- no end-user login;
- no OAuth;
- no bearer token or API key;
- no paid AI/API dependency;
- no mandatory recurring hosting cost at current provider pricing;
- preserve the existing project-first, provenance-first skill architecture;
- keep the anonymous network surface read-only and bounded.

Cloudflare is explicitly not required by this design.

## Hosting choice

Use **AppDeploy Free** for the remote MCP service while its current free-hosting terms satisfy these requirements.

The service must not use AppDeploy AI, paid third-party APIs, paid storage, or another billable downstream dependency. The deployment remains replaceable: the MCP protocol contract lives in this repository and the plugin points to one public HTTPS endpoint. Hosting is an implementation detail rather than a permanent architectural dependency.

## Transport

AppDeploy separates the human-facing frontend CDN from the backend API gateway. The canonical MCP endpoint is therefore the raw backend-gateway route, not the status-page hostname:

```text
https://api-v2.appdeploy.ai/app/<app-id>/api/mcp
```

The current concrete URL is stored once in `.mcp.json`; tests read it from there rather than duplicating it as an independent configuration source.

Implement MCP over Streamable HTTP.

For compatibility with current MCP clients:

- the canonical endpoint accepts JSON-RPC requests/notifications through `POST`;
- JSON-RPC requests return `application/json` unless a future feature genuinely requires SSE;
- accepted notifications/responses return `202` with no response body where required by the negotiated protocol;
- direct `GET` returns `405 Method Not Allowed` because this server does not provide a server-initiated SSE stream;
- validate `Origin` when present;
- validate the negotiated MCP protocol version;
- for protocol versions that require them, validate `Mcp-Method` and `Mcp-Name` headers against the JSON body;
- do not mint hidden server-side sessions for the stateless protocol path;
- reject malformed JSON-RPC and unsupported methods deterministically.

Support current stateless MCP `2026-07-28` while retaining the narrow `2025-11-25` initialization-era Streamable HTTP request path needed by current clients.

## Anonymous access boundary

The remote MCP is intentionally unauthenticated, but open access does **not** mean arbitrary execution.

Allowed public capabilities are read-only and deterministic. Initial scope:

- plugin/server metadata and version information;
- bundled current engineering/source-policy guidance;
- bundled project-routing and engineering-invariant guidance;
- health/capability discovery required by MCP clients.

The optional public npm lookup considered during design is intentionally omitted from v1.4.0 because it is unnecessary for open access and would enlarge the anonymous network surface.

The anonymous service must **not** expose:

- GitHub writes;
- filesystem mutation;
- shell/process execution;
- arbitrary URL fetching/proxying;
- deployment actions;
- secrets or environment values;
- authenticated/private registries;
- credentialed upstream services;
- arbitrary code evaluation;
- user-supplied executable scripts.

This preserves the existing local skill as the full engineering/reasoning layer while making a safe subset available remotely.

## Abuse and safety controls

Because the endpoint is public:

- cap request body size;
- cap accepted argument scope through closed schemas and known resource URIs;
- never reflect secret headers;
- reject invalid Origin values with `403` when Origin is present;
- return structured JSON-RPC errors without internal stack traces;
- do not persist per-user state;
- do not add a database unless a future requirement proves it necessary;
- do not add an LLM or model invocation to the server.

Provider fair-use limits are acceptable; code must not silently opt into a paid plan or billable third-party API.

## Plugin packaging

Convert the plugin from skill-only packaging to a hybrid skill + remote MCP plugin:

- add `.mcp.json` with the deployed remote MCP URL;
- add `mcpServers` to `.codex-plugin/plugin.json` using the current OpenAI-supported contract;
- do not configure bearer-token, OAuth, custom authorization-header, or secret environment fields;
- preserve `skills: "./skills/"`;
- keep the existing marketplace entry and installation flow;
- bump the plugin to v1.4.0 because the externally observable capability surface changes.

The local validator must fail if the manifest claims an MCP server but `.mcp.json` is absent, malformed, non-HTTPS, loopback-only, or contains unsupported credential-bearing configuration.

## Source of truth

The repository remains authoritative for:

- MCP protocol behavior;
- tool/resource schemas;
- bundled guidance returned by the remote service;
- plugin manifest and `.mcp.json`;
- tests and endpoint conformance checks.

The hosted guidance is a concise immutable read-only projection of the governing local skill/reference rules rather than a byte-for-byte duplicate. The full local skill/references remain authoritative for full engineering behavior. The AppDeploy deployment is a hosted build of the remote contract, not a second independent product specification.

## Verification

Completion requires evidence at four layers:

1. **Protocol/contract tests**
   - JSON-RPC validation;
   - tool/resource schemas;
   - no authentication fields;
   - Origin and protocol-header handling;
   - no write/execution capabilities.

2. **Real deployment tests**
   - anonymous request succeeds without credentials;
   - HTTPS endpoint is reachable from an independent network path;
   - initialize/discovery/list/call behavior works through the raw backend gateway;
   - GET behavior is correct;
   - invalid Origin/protocol/header/body cases fail correctly.

3. **Plugin packaging validation**
   - current OpenAI plugin manifest contract;
   - `.mcp.json` points at the real deployed endpoint;
   - skill remains installed alongside the MCP server.

4. **Exact-HEAD CI**
   - GitHub Actions tests the final repository HEAD;
   - live integration exercises the deployed raw backend endpoint rather than a mock or the same-app frontend client;
   - `main` remains authoritative.

## Cost constraint

At implementation time, AppDeploy must still provide the required hosted HTTPS/backend capability on its Free tier. If that changes, migrate to another directly controllable $0 host rather than introducing a mandatory paid dependency.

The design intentionally uses no database, hosted AI inference, paid API, custom domain, or authentication provider, minimizing both cost and operational surface.

## Non-goals

This change does not make the public MCP a remote autonomous coding agent. Repository mutation, shell execution, private project access, deployment privileges, and credentialed services remain outside the anonymous endpoint.

The plugin's existing local skill remains capable of guiding full project engineering work in environments where the host itself has appropriate tools and permissions.
