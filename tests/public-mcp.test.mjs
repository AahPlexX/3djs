import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const coreUrl = new URL('../remote-mcp/appdeploy/backend/mcp-core.js', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));

async function loadCore() {
  try {
    return await import(coreUrl.href);
  } catch {
    return null;
  }
}

async function tryReadJson(path) {
  try {
    return await readJson(path);
  } catch {
    return null;
  }
}

const sameHostHeaders = {
  host: 'mcp.example.test',
  'x-forwarded-host': 'mcp.example.test',
  'x-forwarded-proto': 'https',
};

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

function modernEnvelope(id, method, params = {}) {
  return {
    jsonrpc: '2.0',
    id,
    method,
    params: {
      ...params,
      _meta: {
        ...(params._meta ?? {}),
        'io.modelcontextprotocol/protocolVersion': '2026-07-28',
      },
    },
  };
}

function modernHeaders(method, name) {
  return {
    ...sameHostHeaders,
    'mcp-protocol-version': '2026-07-28',
    'mcp-method': method,
    ...(name ? { 'mcp-name': name } : {}),
  };
}

async function request({ method = 'POST', headers = sameHostHeaders, body = legacyInitialize } = {}) {
  const core = await loadCore();
  assert.ok(core, 'public MCP protocol core must exist');
  assert.equal(typeof core.handleMcpRequest, 'function', 'protocol core must export handleMcpRequest');
  return core.handleMcpRequest({ method, headers, body });
}

function assertJsonRpcError(response, code) {
  assert.equal(typeof response.body, 'object');
  assert.equal(response.body?.jsonrpc, '2.0');
  assert.equal(response.body?.error?.code, code);
  assert.equal('stack' in (response.body?.error ?? {}), false);
}

test('hybrid plugin packaging requires a real anonymous HTTPS remote MCP', async () => {
  const manifest = await readJson('.codex-plugin/plugin.json');
  const mcpConfig = await tryReadJson('.mcp.json');

  assert.equal(manifest.version, '1.4.0');
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.mcpServers, './.mcp.json');
  assert.ok(mcpConfig, '.mcp.json must exist once the plugin advertises a remote MCP');

  const entries = Object.entries(mcpConfig?.mcpServers ?? {});
  assert.equal(entries.length, 1);
  const [serverName, server] = entries[0];
  assert.equal(serverName, 'current_3d_engineering');
  assert.equal(server.type, 'http');
  assert.match(server.url, /^https:\/\/.+\/api\/mcp$/);

  const forbiddenKeys = new Set(['authorization', 'bearer', 'oauth', 'token', 'secret', 'env', 'headers']);
  for (const key of Object.keys(server)) {
    assert.equal(forbiddenKeys.has(key.toLowerCase()), false, `remote MCP config must not require ${key}`);
  }
});

test('legacy initialize is anonymous, stateless, and advertises only read-only capabilities', async () => {
  const response = await request();
  assert.equal(response.statusCode, 200);
  assert.match(String(response.headers?.['content-type'] ?? ''), /application\/json/i);
  assert.equal(response.body?.jsonrpc, '2.0');
  assert.equal(response.body?.id, 1);
  assert.equal(response.body?.result?.protocolVersion, '2025-11-25');
  assert.equal(typeof response.body?.result?.serverInfo?.name, 'string');
  assert.equal(typeof response.body?.result?.serverInfo?.version, 'string');
  assert.deepEqual(Object.keys(response.body?.result?.capabilities ?? {}).sort(), ['resources', 'tools']);
  assert.equal(response.headers?.['mcp-session-id'], undefined);
  assert.equal(response.headers?.['www-authenticate'], undefined);
});

test('legacy initialized notification returns 202 with no response body', async () => {
  const response = await request({
    body: { jsonrpc: '2.0', method: 'notifications/initialized', params: {} },
  });
  assert.equal(response.statusCode, 202);
  assert.equal(response.body, null);
});

test('GET refuses an unused server-initiated SSE stream', async () => {
  const response = await request({ method: 'GET', body: null });
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers?.allow, 'POST');
});

test('legacy tools and resources expose only deterministic read-only guidance', async () => {
  const tools = await request({ body: { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} } });
  assert.equal(tools.statusCode, 200);
  const toolNames = tools.body?.result?.tools?.map((entry) => entry.name).sort();
  assert.deepEqual(toolNames, ['current_3d_guidance', 'current_3d_info']);

  const prohibited = /write|delete|shell|exec|deploy|github|proxy|fetch[_-]?url|credential|secret|script/i;
  for (const tool of tools.body.result.tools) {
    assert.doesNotMatch(`${tool.name} ${tool.description ?? ''}`, prohibited);
  }

  const info = await request({
    body: { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'current_3d_info', arguments: {} } },
  });
  assert.equal(info.statusCode, 200);
  assert.equal(info.body?.result?.isError, false);
  assert.equal(info.body?.result?.structuredContent?.access, 'anonymous-read-only');

  const resources = await request({ body: { jsonrpc: '2.0', id: 4, method: 'resources/list', params: {} } });
  const uris = resources.body?.result?.resources?.map((entry) => entry.uri).sort();
  assert.deepEqual(uris, [
    'current-3d://engineering-invariants',
    'current-3d://project-routing',
    'current-3d://skill',
    'current-3d://source-policy',
  ]);

  const read = await request({
    body: { jsonrpc: '2.0', id: 5, method: 'resources/read', params: { uri: 'current-3d://source-policy' } },
  });
  assert.equal(read.statusCode, 200);
  assert.match(read.body?.result?.contents?.[0]?.text ?? '', /Current-source policy/);
});

test('unknown or malformed legacy requests fail deterministically without stack disclosure', async () => {
  const unknown = await request({ body: { jsonrpc: '2.0', id: 6, method: 'dangerous/write', params: {} } });
  assertJsonRpcError(unknown, -32601);

  const malformed = await request({ body: { id: 7, method: 'tools/list', params: {} } });
  assertJsonRpcError(malformed, -32600);
});

test('invalid Origin is rejected with HTTP 403 when Origin is supplied', async () => {
  const response = await request({
    headers: { ...sameHostHeaders, origin: 'https://attacker.example' },
  });
  assert.equal(response.statusCode, 403);
});

test('modern discovery requires protocol metadata and returns complete public-cacheable results', async () => {
  const body = modernEnvelope(8, 'server/discover');
  const response = await request({ headers: modernHeaders('server/discover'), body });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body?.result?.resultType, 'complete');
  assert.ok(Array.isArray(response.body?.result?.supportedVersions));
  assert.ok(response.body.result.supportedVersions.includes('2026-07-28'));
  assert.equal(response.body?.result?.cacheScope, 'public');
  assert.ok(Number.isInteger(response.body?.result?.ttlMs) && response.body.result.ttlMs > 0);
  assert.equal(response.body?.result?._meta?.['io.modelcontextprotocol/serverInfo']?.name, 'current-3d-engineering');
});

test('modern named calls require Mcp-Name to match the JSON body', async () => {
  const body = modernEnvelope(9, 'tools/call', { name: 'current_3d_info', arguments: {} });
  const valid = await request({ headers: modernHeaders('tools/call', 'current_3d_info'), body });
  assert.equal(valid.statusCode, 200);
  assert.equal(valid.body?.result?.resultType, 'complete');

  const mismatch = await request({ headers: modernHeaders('tools/call', 'current_3d_guidance'), body });
  assert.equal(mismatch.statusCode, 400);
  assertJsonRpcError(mismatch, -32020);
});

test('modern Mcp-Method mismatch returns the protocol header-mismatch error', async () => {
  const body = modernEnvelope(10, 'tools/list');
  const response = await request({ headers: modernHeaders('resources/list'), body });
  assert.equal(response.statusCode, 400);
  assertJsonRpcError(response, -32020);
});

test('unsupported modern protocol version is rejected with -32022', async () => {
  const body = modernEnvelope(11, 'tools/list');
  body.params._meta['io.modelcontextprotocol/protocolVersion'] = '2099-01-01';
  const response = await request({
    headers: {
      ...sameHostHeaders,
      'mcp-protocol-version': '2099-01-01',
      'mcp-method': 'tools/list',
    },
    body,
  });
  assertJsonRpcError(response, -32022);
});

test('modern resources/read requires Mcp-Name to equal params.uri', async () => {
  const body = modernEnvelope(12, 'resources/read', { uri: 'current-3d://skill' });
  const valid = await request({ headers: modernHeaders('resources/read', 'current-3d://skill'), body });
  assert.equal(valid.statusCode, 200);
  assert.equal(valid.body?.result?.resultType, 'complete');

  const invalid = await request({ headers: modernHeaders('resources/read', 'current-3d://source-policy'), body });
  assert.equal(invalid.statusCode, 400);
  assertJsonRpcError(invalid, -32020);
});

test('protocol core enforces a bounded request size', async () => {
  const response = await request({
    body: {
      jsonrpc: '2.0',
      id: 13,
      method: 'tools/call',
      params: { name: 'current_3d_guidance', arguments: { uri: `current-3d://${'x'.repeat(70_000)}` } },
    },
  });
  assert.equal(response.statusCode, 413);
});
