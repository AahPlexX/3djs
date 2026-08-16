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

Use **AppDeploy Free** for the remote MCP service.

Current official AppDeploy pricing states that the Free tier is $0, requires no credit card, and includes managed hosting, HTTPS, a hosted live URL, backend services, and global delivery under fair-use limits. The service must not use AppDeploy AI, paid third-party APIs, paid storage, or another billable downstream dependency.

The deployment remains replaceable: the MCP protocol contract lives in this repository and the plugin points to one public HTTPS endpoint. Hosting is an implementation detail rather than a permanent architectural dependency.

## Transport

Expose one public endpoint:

```text
https://<appdeploy-host>/api/mcp
```

Implement MCP over Streamable HTTP.

For compatibility with current MCP clients:

- `POST /api/mcp` accepts JSON-RPC requests/notifications/responses;
- JSON-RPC requests return `application/json` unless a future feature genuinely requires SSE;
- accepted notifications/responses return `202` with no response body where required by the negotiated protocol;
- `GET /api/mcp` returns `405 Method Not Allowed` because this server does not need a server-initiated SSE stream;
- validate `Origin` when present;
- validate the negotiated MCP protocol version;
- for protocol versions that require them, validate `Mcp-Method` and `Mcp-Name` headers against the JSON body;
- do not mint hidden server-side sessions for the stateless protocol path;
- reject malformed JSON-RPC and unsupported methods deterministically.

The implementation should support the current stateless MCP protocol while retaining the narrow backwards-compatible request path needed by clients still using initialization-era Streamable HTTP.

## Anonymous access boundary

The remote MCP is intentionally unauthenticated, but open access does **not** mean arbitrary execution.

Allowed public capabilities are read-only and deterministic. Initial tool/resource scope:

- plugin/server metadata and version information;
- current engineering/source-policy guidance bundled with the service;
- project-routing and engineering-invariant guidance;
- optional public npm-compatible metadata lookup only when explicitly requested and safely bounded;
- health/capability discovery required by MCP clients.

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

This preserves the existing local skill as the engineering/reasoning layer while making a safe subset available remotely.

## Abuse and safety controls

Because the endpoint is public:

- cap request body size;
- cap string/array argument sizes;
- restrict any network lookup tool to an explicitly supported public upstream and validated package-name input;
- use bounded upstream timeouts;
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
- do not configure bearer-token, OAuth, or secret environment fields;
- preserve `skills: "./skills/"`;
- keep the existing marketplace entry and installation flow;
- bump the plugin version because the externally observable capability surface changes.

The local validator must fail if the manifest claims an MCP server but `.mcp.json` is absent or malformed.

## Source of truth

The repository remains authoritative for:

- MCP protocol behavior;
- tool/resource schemas;
- bundled guidance returned by the remote service;
- plugin manifest and `.mcp.json`;
- tests and endpoint conformance checks.

The AppDeploy deployment is a hosted build of that contract, not a second independent product specification.

## Verification

Completion requires evidence at four layers:

1. **Local contract tests**
   - JSON-RPC validation;
   - tool/resource schemas;
   - no authentication fields;
   - Origin and protocol-header handling;
   - no write/execution capabilities.

2. **Real deployment tests**
   - anonymous request succeeds without credentials;
   - HTTPS endpoint is reachable;
   - initialize/discovery/list/call behavior works through the deployed URL;
   - GET behavior is correct;
   - invalid Origin/protocol/header/body cases fail correctly.

3. **Plugin packaging validation**
   - current OpenAI plugin manifest contract;
   - `.mcp.json` points at the real deployed endpoint;
   - skill remains installed alongside the MCP server.

4. **Exact-HEAD CI**
   - GitHub Actions tests the final repository HEAD;
   - live integration exercises the deployed endpoint rather than a mock server;
   - `main` remains authoritative.

## Cost constraint

At implementation time, AppDeploy must still provide the required public HTTPS/backend capability on its Free tier. If that changes before deployment, stop using AppDeploy and select another directly controllable $0 host rather than introducing a paid dependency.

The design intentionally uses no database, no hosted AI inference, no paid API, no custom domain, and no authentication provider, minimizing both cost and operational surface.

## Non-goals

This change does not make the public MCP a remote autonomous coding agent. Repository mutation, shell execution, private project access, deployment privileges, and credentialed services remain outside the anonymous endpoint.

The plugin's existing local skill remains capable of guiding full project engineering work in environments where the host itself has appropriate tools and permissions.