# Public Streamable MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add and deploy a real anonymous HTTPS Streamable HTTP MCP companion for `current-3d-engineering`, then wire it into the existing plugin without adding authentication, paid AI/API dependencies, write/execution authority, or ecosystem-specific routing.

**Architecture:** Keep the existing skill as the local project-first/provenance-first engineering layer. Add a stateless read-only MCP protocol core whose canonical source lives in this repository, deploy that core through an AppDeploy Free HTTPS backend, and package the deployed URL through `.mcp.json` plus the Codex plugin manifest. Support current stateless MCP `2026-07-28` while retaining the narrow `2025-11-25` initialization-era Streamable HTTP path needed by current clients.

**Tech Stack:** MCP Streamable HTTP + JSON-RPC 2.0, Node.js ESM, TypeScript AppDeploy adapter, `node:test`, OpenAI/Codex plugin JSON, GitHub Actions, AppDeploy Free.

## Global Constraints

- Public HTTPS endpoint.
- No end-user login, OAuth, bearer token, API key, authentication secret, or private credential flow.
- No paid AI/API dependency and no mandatory recurring hosting cost at current provider pricing.
- No database, LLM invocation, arbitrary URL proxying, arbitrary code execution, shell/process execution, filesystem mutation, GitHub mutation, deployment action, or credentialed/private upstream service in the public MCP.
- Anonymous capabilities remain deterministic, bounded, and read-only.
- Preserve the existing project-first, provenance-first skill architecture and universal 3D/graphics project eligibility.
- Repository files are the source of truth for protocol behavior, schemas, bundled guidance, tests, manifest, and `.mcp.json`.
- The live deployment must be tested as a real external HTTPS integration; mocks cannot prove deployment success.
- `main` remains the sole authoritative branch.

---

### Task 1: Add red MCP protocol and packaging contracts

**Files:**
- Create: `tests/public-mcp.test.mjs`
- Modify: `tests/plugin.test.mjs`

**Interfaces:**
- Consumes: approved public-MCP design, current plugin manifest, current MCP transport contracts.
- Produces: failing tests that define the protocol core API and hybrid plugin packaging before implementation exists.

- [ ] **Step 1: Write failing protocol-core tests**

Create `tests/public-mcp.test.mjs` importing `handleMcpRequest` from `remote-mcp/appdeploy/backend/mcp-core.js`. Require the function to accept `{ method, headers, body }` and return `{ statusCode, headers, body }`.

Cover these contracts:

```js
const legacyInitialize = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'contract-test', version: '1.0.0' },
  },
};
```

- legacy anonymous `initialize` succeeds without auth/session credentials;
- `notifications/initialized` returns `202`;
- `tools/list`, `tools/call`, `resources/list`, and `resources/read` are read-only and deterministic;
- `GET` returns `405` because the server does not provide a server-initiated SSE stream;
- invalid JSON-RPC/unsupported methods return structured errors without stack traces;
- invalid `Origin` is rejected with `403` when an Origin header is present;
- modern `2026-07-28` requests require matching `MCP-Protocol-Version` and `Mcp-Method` headers;
- modern `tools/call` and `resources/read` require matching `Mcp-Name` headers;
- modern header/body mismatch returns MCP header-mismatch error code `-32020`;
- unsupported modern protocol version returns `-32022`;
- modern successful results carry `resultType: "complete"`, public cache metadata where the method is cacheable, and server identity metadata under `_meta['io.modelcontextprotocol/serverInfo']`;
- no method exposes writes, shell/process execution, arbitrary URL fetching, deployment, GitHub mutation, credentials, or user-supplied executable code.

- [ ] **Step 2: Write failing hybrid-packaging tests**

Change the plugin packaging test so the future state requires:

```js
assert.equal(manifest.mcpServers, './.mcp.json');
assert.equal(manifest.skills, './skills/');
assert.equal(manifest.version, '1.4.0');
```

Require `.mcp.json` to contain a remote MCP entry with `type: "http"`, an `https://` URL ending in `/api/mcp`, and no bearer-token, OAuth, authorization-header, secret, or environment-variable configuration.

- [ ] **Step 3: Run the focused tests and prove the red state**

Run:

```bash
node --test tests/public-mcp.test.mjs tests/plugin.test.mjs
```

Expected: failure because the protocol core and `.mcp.json` do not yet exist and the manifest still describes v1.3.0 skill-only packaging.

- [ ] **Step 4: Commit the red contracts**

Commit the failing test state on `main` with a message equivalent to:

```text
test: define public MCP contracts
```

Record the resulting exact commit and GitHub Actions red run in the implementation ledger.

### Task 2: Implement the stateless read-only MCP protocol core

**Files:**
- Create: `remote-mcp/appdeploy/backend/guidance.js`
- Create: `remote-mcp/appdeploy/backend/mcp-core.js`
- Test: `tests/public-mcp.test.mjs`

**Interfaces:**
- Consumes: JSON-RPC request metadata plus bundled plugin guidance.
- Produces: `handleMcpRequest({ method, headers, body }) -> Promise<{ statusCode: number, headers: Record<string,string>, body: unknown | null }>`.

- [ ] **Step 1: Bundle canonical read-only guidance**

Create `guidance.js` exporting immutable resource records for:

```text
current-3d://skill
current-3d://source-policy
current-3d://project-routing
current-3d://engineering-invariants
```

The exported text must match the corresponding repository Markdown files exactly so tests can detect drift. Do not fetch GitHub at runtime.

- [ ] **Step 2: Implement bounded transport validation**

Implement in `mcp-core.js`:

- accepted methods: `POST` and `GET` only;
- `GET` -> `405` with `Allow: POST`;
- serialized request cap of 64 KiB;
- JSON-RPC object validation;
- Origin validation: absent Origin is accepted; when present, require a valid HTTPS origin whose host matches the forwarded/request host supplied by the adapter;
- deterministic JSON-RPC error payloads with no internal stack traces;
- no session persistence.

- [ ] **Step 3: Implement the legacy `2025-11-25` path**

Support:

```text
initialize
notifications/initialized
ping
tools/list
tools/call
resources/list
resources/read
```

`initialize` must negotiate only supported versions and return `serverInfo`, `capabilities`, and instructions. Notifications return `202` and no body. The read-only tools must expose only server/plugin metadata and bundled guidance lookup.

- [ ] **Step 4: Implement the modern `2026-07-28` path**

Require `MCP-Protocol-Version: 2026-07-28` and exact `Mcp-Method` agreement. Require `Mcp-Name` only for named methods such as `tools/call` and `resources/read`, matched to `params.name` or `params.uri` respectively.

Support `server/discover`, `ping`, `tools/list`, `tools/call`, `resources/list`, and `resources/read`. Successful modern responses must use `resultType: "complete"`; cacheable read-only results use a bounded `ttlMs` and `cacheScope: "public"`; server identity is emitted in `_meta['io.modelcontextprotocol/serverInfo']`.

- [ ] **Step 5: Keep the public tool surface read-only**

Initial tool set:

```text
current_3d_info
current_3d_guidance
```

`current_3d_info` returns plugin/server/protocol/read-only metadata. `current_3d_guidance` accepts one bundled `current-3d://...` URI and returns that resource. Do not add npm/network lookup in this release; the approved design marked it optional and it would enlarge the anonymous abuse surface without being needed for open access.

- [ ] **Step 6: Run protocol-core tests to green**

Run:

```bash
node --test tests/public-mcp.test.mjs
```

Expected: all protocol-core tests pass while packaging tests remain red until the real deployment URL exists.

- [ ] **Step 7: Commit the protocol core**

Commit with a message equivalent to:

```text
feat: add stateless public MCP core
```

### Task 3: Add the AppDeploy HTTPS adapter and deploy the real endpoint

**Files:**
- Create: `remote-mcp/appdeploy/backend/index.ts`
- Create: `remote-mcp/appdeploy/frontend-status.ts`
- Create: `remote-mcp/appdeploy/tests/tests.txt`
- Deploy copies to AppDeploy: `backend/index.ts`, `backend/mcp-core.js`, `backend/guidance.js`, frontend template diffs, `tests/tests.txt`

**Interfaces:**
- Consumes: AppDeploy router context and `handleMcpRequest`.
- Produces: a public HTTPS `/api/mcp` endpoint and a small public status page whose self-check exercises anonymous MCP initialization/listing.

- [ ] **Step 1: Implement the AppDeploy adapter**

Use `router`, `json`, and the platform response contract from `@appdeploy/sdk`; do not add authentication middleware, database access, AI, secrets, storage, realtime, or paid integrations.

The adapter must:

- route both `GET /api/mcp` and `POST /api/mcp` into the protocol core;
- normalize request headers without reflecting secrets;
- pass host/forwarded-host information needed for Origin validation;
- preserve JSON-RPC status/body/content-type returned by the core.

- [ ] **Step 2: Implement a minimal public status/self-check surface**

The frontend must clearly state that the MCP endpoint is public, anonymous, HTTPS, and read-only. Its self-check uses the AppDeploy client API to perform a legacy anonymous `initialize` followed by `tools/list` and visibly reports the server version and read-only tool count.

This frontend is operational observability, not a second product UI.

- [ ] **Step 3: Define AppDeploy user-visible QA tests**

`remote-mcp/appdeploy/tests/tests.txt` must contain 3 independent tests with exactly one `[sanity]` marker:

1. `[sanity]` run the anonymous MCP self-check on desktop and verify an online/server-version/tool-count result;
2. verify on mobile that the page clearly states no login/API key and read-only access;
3. verify the endpoint/status surface presents a visible failure rather than false success if the MCP call is faulted.

Each test includes `Viewport`, `Covers`, `Description`, `Steps`, and `Expected`; the failure case uses AppDeploy QA Faults against `/api/mcp`.

- [ ] **Step 4: Re-check AppDeploy Free suitability immediately before deployment**

Confirm the connected AppDeploy account still permits the required public HTTPS frontend+backend deployment without a paid plan, credit-card requirement, paid AI dependency, auth requirement, or paid downstream service. If this has changed, do not deploy a paid dependency; select another directly controllable $0 host that satisfies the approved design.

- [ ] **Step 5: Deploy once preflight passes**

Create a new AppDeploy app named `Current 3D Engineering MCP` using `frontend+backend` with the `html-static` template. Send only template diffs, new backend files, and the complete `tests/tests.txt` replacement required by AppDeploy.

- [ ] **Step 6: Poll deployment and repair platform/QA failures in-session**

Continue `get_app_status` checks until terminal `ready` or `failed`. If validation, runtime, or E2E errors occur, inspect the deployed source/QA evidence, fix all discovered errors together, and redeploy up to the platform-authorized retry limit.

- [ ] **Step 7: Capture the canonical live endpoint**

Set `PUBLIC_MCP_URL` to the successful deployment's real HTTPS `/api/mcp` URL. This exact URL is the value consumed by Task 4 and the live integration tests in Task 5.

### Task 4: Convert the plugin to hybrid skill + remote MCP packaging

**Files:**
- Create: `.mcp.json`
- Modify: `.codex-plugin/plugin.json`
- Modify: `package.json`
- Modify: `skills/current-3d-engineering/scripts/validate-plugin.mjs`
- Modify: `tests/plugin.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Consumes: `PUBLIC_MCP_URL` from Task 3.
- Produces: installable v1.4.0 hybrid plugin whose remote MCP requires no user credentials.

- [ ] **Step 1: Create `.mcp.json` with the deployed endpoint**

Use the current OpenAI-supported remote HTTP server shape:

```json
{
  "mcpServers": {
    "current_3d_engineering": {
      "type": "http",
      "url": "PUBLIC_MCP_URL"
    }
  }
}
```

Replace `PUBLIC_MCP_URL` with the exact real deployment URL before committing. Do not add headers, bearer-token env names, OAuth configuration, secrets, or command-based local servers.

- [ ] **Step 2: Update manifest/version metadata**

Set `.codex-plugin/plugin.json` to version `1.4.0` and add:

```json
"mcpServers": "./.mcp.json"
```

Preserve `"skills": "./skills/"` and all universal discovery metadata. Set `package.json` version to `1.4.0`.

- [ ] **Step 3: Make the local validator verify the hybrid contract**

The validator must require `.mcp.json`, require the manifest path `./.mcp.json`, require at least one `type: "http"` HTTPS server, and reject credential/auth fields or non-HTTPS endpoint URLs. Remove the old skill-only rejection.

- [ ] **Step 4: Update plugin tests and documentation**

Make packaging tests require v1.4.0 hybrid behavior. Add README sections covering:

- public HTTPS MCP URL;
- no login/OAuth/API key;
- read-only anonymous boundary;
- supported modern + legacy MCP compatibility;
- no paid AI/API/database dependency;
- the existing skill remains the full local engineering layer;
- installation remains marketplace add -> plugin add -> plugin list.

Avoid hard-coding a total test count in prose when the suite can grow.

- [ ] **Step 5: Run repository tests and structure validation**

Run:

```bash
npm test
npm run verify
```

Expected: packaging and protocol tests pass, including existing live npm integration.

- [ ] **Step 6: Commit hybrid packaging**

Commit with a message equivalent to:

```text
feat: publish anonymous remote MCP
```

### Task 5: Add real live-endpoint conformance and exact-HEAD CI evidence

**Files:**
- Create: `tests/public-mcp-live.test.mjs`
- Modify: `.github/workflows/ci.yml`
- Create: `research/2026-08-16.md`
- Modify: `docs/superpowers/plans/2026-08-16-public-streamable-mcp.md`

**Interfaces:**
- Consumes: `.mcp.json` live HTTPS URL and final v1.4.0 repository state.
- Produces: real anonymous deployment evidence, current-protocol research record, and exact-HEAD CI proof.

- [ ] **Step 1: Add live anonymous endpoint tests**

Read the URL from `.mcp.json`; never duplicate it as a second hard-coded source. Exercise the actual deployed service with built-in `fetch` and bounded timeouts.

Require:

- HTTPS URL;
- `GET` -> `405`;
- legacy anonymous `initialize` succeeds without authorization headers;
- legacy `tools/list` and a read-only `tools/call` succeed;
- modern `server/discover` and `tools/list` succeed with required protocol/method metadata;
- modern named call succeeds with matching `Mcp-Name`;
- invalid Origin returns `403`;
- header/name mismatches are rejected;
- responses do not challenge for bearer/OAuth credentials and do not issue a hidden session requirement.

- [ ] **Step 2: Make CI describe both contract and live-endpoint verification**

Keep one minimal `main`/PR workflow. Update the test step label to make clear that `npm test` now includes universal contracts, live npm metadata, and the real deployed MCP endpoint. Do not add redundant workflows.

- [ ] **Step 3: Record current authoritative protocol/packaging evidence**

Create `research/2026-08-16.md` recording only dated evidence and implementation decisions:

- MCP `2026-07-28` stateless protocol and Streamable HTTP header rules;
- compatibility need for `2025-11-25` initialization-era clients;
- current OpenAI/Codex `.mcp.json` remote HTTP shape and plugin `mcpServers` path;
- AppDeploy host/cost/auth constraints verified at deployment time;
- live endpoint verification result.

State explicitly that dated facts must be re-verified for future releases.

- [ ] **Step 4: Run the full suite locally where the environment permits**

Run:

```bash
npm test
npm run verify
```

If the current container cannot reach external services, do not replace live tests with mocks; rely on the GitHub Actions run for external integration proof and disclose the local network limitation.

- [ ] **Step 5: Commit the live verification gate**

Commit with a message equivalent to:

```text
test: verify live public MCP endpoint
```

- [ ] **Step 6: Verify the exact final HEAD in GitHub Actions**

Fetch the workflow run associated with the exact final `main` commit. Require all tests and plugin validation to complete successfully. Inspect job logs rather than inferring success from a pushed commit alone.

- [ ] **Step 7: Confirm branch topology and close the ledger**

Confirm only the authorized `main` branch is authoritative and no audit/implementation branch was left behind. Mark every plan checkbox complete only after the corresponding evidence exists, then commit the ledger-closing documentation change and verify that exact closing HEAD also passes CI.
