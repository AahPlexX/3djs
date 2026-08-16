import { router } from '@appdeploy/sdk';
import { handleMcpRequest } from './mcp-core.js';

function normalizeEventHeaders(event: unknown): Record<string, string> {
  if (!event || typeof event !== 'object') return {};
  const raw = (event as { headers?: unknown }).headers;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value == null) continue;
    headers[key] = String(value);
  }
  return headers;
}

async function reply(method: 'GET' | 'POST', event: unknown, body: unknown) {
  const outcome = await handleMcpRequest({
    method,
    headers: normalizeEventHeaders(event),
    body,
  });

  return {
    statusCode: outcome.statusCode,
    headers: outcome.headers,
    body: outcome.body == null ? '' : JSON.stringify(outcome.body),
  };
}

export const handler = router({
  'GET /api/mcp': [async ({ event }) => reply('GET', event, null)],
  'POST /api/mcp': [async ({ event, body }) => reply('POST', event, body)],
});
