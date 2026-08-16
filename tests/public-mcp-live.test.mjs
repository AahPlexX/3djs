import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const mcpConfig = JSON.parse(await readFile(new URL('../.mcp.json', import.meta.url), 'utf8'));
const endpoint = mcpConfig.mcpServers?.current_3d_engineering?.url;

assert.equal(typeof endpoint, 'string', '.mcp.json must provide the canonical public MCP URL');
const endpointUrl = new URL(endpoint);
assert.equal(endpointUrl.protocol, 'https:');
assert.equal(endpointUrl.pathname, '/api/mcp');

const LEGACY_VERSION = '2025-11-25';
const MODERN_VERSION = '2026-07-28';

async function fetchLive(init = {}, { retry5xx = true } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        ...init,
        signal: AbortSignal.timeout(20_000),
      });
      if (retry5xx && response.status >= 500 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 350));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 350));
        continue;
      }
    }
  }
  throw new Error('live public MCP endpoint was unreachable after 3 attempts', { cause: lastError });
}

async function postJson(body, headers = {}) {
  return fetchLive({
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

async function jsonBody(response) {
  const text = await response.text();
  assert.ok(text, `expected JSON response body for HTTP ${response.status}`);
  return JSON.parse(text);
}

function modernEnvelope(id, method, params = {}) {
  return {
    jsonrpc: '2.0',
    id,
    method,
    params: {
      ...params,
      _meta: {
        ...(params._meta ?? {}),
        'io.modelcontextprotocol/protocolVersion': MODERN_VERSION,
        'io.modelcontextprotocol/clientCapabilities': {},
        'io.modelcontextprotocol/clientInfo': { name: 'github-live-conformance', version: '1.0.0' },
      },
    },
  };
}

function modernHeaders(method, name) {
  return {
    'MCP-Protocol-Version': MODERN_VERSION,
    'Mcp-Method': method,
    ...(name ? { 'Mcp-Name': name } : {}),
  };
}

test('live MCP URL is HTTPS and GET correctly refuses an unused SSE stream', async () => {
  const response = await fetchLive({ method: 'GET', headers: { accept: 'text/event-stream' } }, { retry5xx: false });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
  assert.equal(response.headers.get('www-authenticate'), null);
});

test('live legacy MCP initializes anonymously and exposes the bounded read-only surface', async () => {
  const initialize = await postJson({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: LEGACY_VERSION,
      capabilities: {},
      clientInfo: { name: 'github-live-conformance', version: '1.0.0' },
    },
  });
  assert.equal(initialize.status, 200);
  assert.equal(initialize.headers.get('www-authenticate'), null);
  assert.equal(initialize.headers.get('mcp-session-id'), null);
  const initialized = await jsonBody(initialize);
  assert.equal(initialized.result?.protocolVersion, LEGACY_VERSION);
  assert.equal(initialized.result?.serverInfo?.name, 'current-3d-engineering');
  assert.equal(initialized.result?.serverInfo?.version, '1.4.0');

  const toolsResponse = await postJson({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  assert.equal(toolsResponse.status, 200);
  const tools = await jsonBody(toolsResponse);
  assert.deepEqual(tools.result?.tools?.map((tool) => tool.name).sort(), ['current_3d_guidance', 'current_3d_info']);

  const infoResponse = await postJson({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'current_3d_info' } });
  assert.equal(infoResponse.status, 200);
  const info = await jsonBody(infoResponse);
  assert.equal(info.result?.isError, false);
  assert.equal(info.result?.structuredContent?.access, 'anonymous-read-only');
  assert.equal(info.result?.structuredContent?.authenticationRequired, false);
  assert.equal(info.result?.structuredContent?.statefulSessionRequired, false);
});

test('live modern MCP discovery, listing, and named calls obey 2026-07-28 request metadata', async () => {
  const discoverResponse = await postJson(
    modernEnvelope(10, 'server/discover'),
    modernHeaders('server/discover'),
  );
  assert.equal(discoverResponse.status, 200);
  const discover = await jsonBody(discoverResponse);
  assert.equal(discover.result?.resultType, 'complete');
  assert.ok(discover.result?.supportedVersions?.includes(MODERN_VERSION));
  assert.equal(discover.result?.cacheScope, 'public');
  assert.equal(discover.result?._meta?.['io.modelcontextprotocol/serverInfo']?.name, 'current-3d-engineering');

  const listResponse = await postJson(
    modernEnvelope(11, 'tools/list'),
    modernHeaders('tools/list'),
  );
  assert.equal(listResponse.status, 200);
  const list = await jsonBody(listResponse);
  assert.equal(list.result?.resultType, 'complete');
  assert.deepEqual(list.result?.tools?.map((tool) => tool.name).sort(), ['current_3d_guidance', 'current_3d_info']);

  const callResponse = await postJson(
    modernEnvelope(12, 'tools/call', { name: 'current_3d_info' }),
    modernHeaders('tools/call', 'current_3d_info'),
  );
  assert.equal(callResponse.status, 200);
  const call = await jsonBody(callResponse);
  assert.equal(call.result?.resultType, 'complete');
  assert.equal(call.result?.structuredContent?.access, 'anonymous-read-only');
});

test('live MCP rejects cross-origin and modern header/body mismatches', async () => {
  const originResponse = await postJson(
    { jsonrpc: '2.0', id: 20, method: 'tools/list', params: {} },
    { Origin: 'https://invalid.example' },
  );
  assert.equal(originResponse.status, 403);

  const mismatchResponse = await postJson(
    modernEnvelope(21, 'tools/call', { name: 'current_3d_info' }),
    modernHeaders('tools/call', 'current_3d_guidance'),
  );
  assert.equal(mismatchResponse.status, 400);
  const mismatch = await jsonBody(mismatchResponse);
  assert.equal(mismatch.error?.code, -32020);
});
