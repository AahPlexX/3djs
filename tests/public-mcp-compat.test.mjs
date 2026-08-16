import test from 'node:test';
import assert from 'node:assert/strict';
import { handleMcpRequest } from '../remote-mcp/appdeploy/backend/mcp-core.js';

test('parameterless tools/call accepts omitted arguments', async () => {
  const response = await handleMcpRequest({
    method: 'POST',
    headers: { host: 'mcp.example.test', 'x-forwarded-host': 'mcp.example.test' },
    body: { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'current_3d_info' } },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body?.result?.isError, false);
  assert.equal(response.body?.result?.structuredContent?.access, 'anonymous-read-only');
});
