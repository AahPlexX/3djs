import { GUIDANCE_LIST, GUIDANCE_RESOURCES } from './guidance.js';

const SERVER_NAME = 'current-3d-engineering';
const SERVER_VERSION = '1.4.0';
const LEGACY_VERSION = '2025-11-25';
const MODERN_VERSION = '2026-07-28';
const MAX_REQUEST_BYTES = 64 * 1024;
const CACHE_TTL_MS = 5 * 60 * 1000;
const JSON_HEADERS = Object.freeze({ 'content-type': 'application/json; charset=utf-8' });

const TOOLS = Object.freeze([
  Object.freeze({
    name: 'current_3d_info',
    title: 'Current 3D Engineering Info',
    description: 'Return public server and plugin metadata for Current 3D Engineering.',
    inputSchema: Object.freeze({ type: 'object', additionalProperties: false }),
  }),
  Object.freeze({
    name: 'current_3d_guidance',
    title: 'Current 3D Engineering Guidance',
    description: 'Return bundled Current 3D Engineering guidance by resource URI.',
    inputSchema: Object.freeze({
      type: 'object',
      properties: Object.freeze({ uri: Object.freeze({ type: 'string' }) }),
      required: Object.freeze(['uri']),
      additionalProperties: false,
    }),
  }),
]);

function normalizeHeaders(headers = {}) {
  const normalized = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (value == null) continue;
    normalized[String(key).toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value);
  }
  return normalized;
}

function jsonResponse(id, result, modern = false, cacheable = false) {
  const payload = modern
    ? {
        ...result,
        resultType: 'complete',
        ...(cacheable ? { ttlMs: CACHE_TTL_MS, cacheScope: 'public' } : {}),
        _meta: {
          ...(result?._meta ?? {}),
          'io.modelcontextprotocol/serverInfo': { name: SERVER_NAME, version: SERVER_VERSION },
        },
      }
    : result;
  return {
    statusCode: 200,
    headers: { ...JSON_HEADERS },
    body: { jsonrpc: '2.0', id, result: payload },
  };
}

function errorResponse(id, code, message, statusCode = 400, data) {
  return {
    statusCode,
    headers: { ...JSON_HEADERS },
    body: {
      jsonrpc: '2.0',
      id: id ?? null,
      error: {
        code,
        message,
        ...(data === undefined ? {} : { data }),
      },
    },
  };
}

function noContent(statusCode = 202, headers = {}) {
  return { statusCode, headers, body: null };
}

function requestSize(body) {
  try {
    return new TextEncoder().encode(JSON.stringify(body)).byteLength;
  } catch {
    return Infinity;
  }
}

function validOrigin(headers) {
  const origin = headers.origin;
  if (!origin) return true;
  const expectedHost = (headers['x-forwarded-host'] || headers.host || '').split(',')[0].trim().toLowerCase();
  if (!expectedHost) return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'https:' && parsed.host.toLowerCase() === expectedHost;
  } catch {
    return false;
  }
}

function isJsonRpcRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if (body.jsonrpc !== '2.0' || typeof body.method !== 'string' || !body.method) return false;
  if ('id' in body && !['string', 'number'].includes(typeof body.id) && body.id !== null) return false;
  if ('params' in body && (body.params == null || typeof body.params !== 'object' || Array.isArray(body.params))) return false;
  return true;
}

function requestMeta(body) {
  return body?.params?._meta && typeof body.params._meta === 'object' && !Array.isArray(body.params._meta)
    ? body.params._meta
    : {};
}

function detectModern(headers, body) {
  return body?.method === 'server/discover'
    || Boolean(headers['mcp-protocol-version'])
    || Boolean(requestMeta(body)['io.modelcontextprotocol/protocolVersion']);
}

function validateModernEnvelope(headers, body) {
  const meta = requestMeta(body);
  const bodyVersion = meta['io.modelcontextprotocol/protocolVersion'];
  const headerVersion = headers['mcp-protocol-version'];

  if (headerVersion !== bodyVersion) {
    return errorResponse(body?.id, -32020, 'MCP protocol header does not match the request body.', 400);
  }
  if (headerVersion !== MODERN_VERSION) {
    return errorResponse(body?.id, -32022, `Unsupported MCP protocol version: ${headerVersion || bodyVersion || 'missing'}.`, 400, {
      supportedVersions: [MODERN_VERSION, LEGACY_VERSION],
    });
  }
  if (!meta['io.modelcontextprotocol/clientCapabilities'] || typeof meta['io.modelcontextprotocol/clientCapabilities'] !== 'object') {
    return errorResponse(body?.id, -32602, 'Modern MCP requests require clientCapabilities metadata.', 400);
  }
  if (headers['mcp-method'] !== body.method) {
    return errorResponse(body?.id, -32020, 'Mcp-Method header does not match the request body.', 400);
  }

  let expectedName;
  if (body.method === 'tools/call' || body.method === 'prompts/get') expectedName = body.params?.name;
  if (body.method === 'resources/read') expectedName = body.params?.uri;
  if (expectedName !== undefined && headers['mcp-name'] !== String(expectedName)) {
    return errorResponse(body?.id, -32020, 'Mcp-Name header does not match the request body.', 400);
  }
  return null;
}

function resourceList() {
  return GUIDANCE_LIST.map(({ uri, name, description, mimeType }) => ({ uri, name, description, mimeType }));
}

function toolResultFor(name, args) {
  if (name === 'current_3d_info') {
    const structuredContent = {
      name: SERVER_NAME,
      version: SERVER_VERSION,
      access: 'anonymous-read-only',
      protocols: [LEGACY_VERSION, MODERN_VERSION],
      authenticationRequired: false,
      statefulSessionRequired: false,
      tools: TOOLS.map((tool) => tool.name),
      resources: GUIDANCE_LIST.map((resource) => resource.uri),
    };
    return {
      isError: false,
      content: [{ type: 'text', text: JSON.stringify(structuredContent, null, 2) }],
      structuredContent,
    };
  }

  if (name === 'current_3d_guidance') {
    const uri = args?.uri;
    if (typeof uri !== 'string' || !GUIDANCE_RESOURCES[uri]) return null;
    const resource = GUIDANCE_RESOURCES[uri];
    return {
      isError: false,
      content: [{ type: 'text', text: resource.text }],
      structuredContent: { uri: resource.uri, name: resource.name, mimeType: resource.mimeType },
    };
  }
  return null;
}

function methodResult(body, modern) {
  const { method, params = {}, id } = body;

  if (!modern && method === 'initialize') {
    if (params.protocolVersion !== LEGACY_VERSION) {
      return errorResponse(id, -32602, `Unsupported legacy MCP protocol version: ${params.protocolVersion ?? 'missing'}.`, 400, {
        supportedVersions: [LEGACY_VERSION, MODERN_VERSION],
      });
    }
    return jsonResponse(id, {
      protocolVersion: LEGACY_VERSION,
      capabilities: { tools: {}, resources: {} },
      serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      instructions: 'Read-only Current 3D Engineering guidance. No authentication is required.',
    });
  }

  if (!modern && method === 'notifications/initialized') return noContent(202);
  if (!modern && !('id' in body)) return noContent(202);

  if (method === 'ping') return jsonResponse(id, {}, modern, false);

  if (modern && method === 'server/discover') {
    return jsonResponse(id, {
      supportedVersions: [MODERN_VERSION],
      capabilities: { tools: {}, resources: {} },
      instructions: 'Read-only Current 3D Engineering guidance. No authentication is required.',
    }, true, true);
  }

  if (method === 'tools/list') return jsonResponse(id, { tools: TOOLS }, modern, modern);

  if (method === 'tools/call') {
    const args = params.arguments ?? {};
    if (!params || typeof params.name !== 'string' || typeof args !== 'object' || Array.isArray(args)) {
      return errorResponse(id, -32602, 'Invalid tool call parameters.', 400);
    }
    const result = toolResultFor(params.name, args);
    if (!result) return errorResponse(id, -32602, 'Unknown tool or invalid tool arguments.', 400);
    return jsonResponse(id, result, modern, false);
  }

  if (method === 'resources/list') return jsonResponse(id, { resources: resourceList() }, modern, modern);

  if (method === 'resources/read') {
    if (!params || typeof params.uri !== 'string' || !GUIDANCE_RESOURCES[params.uri]) {
      return errorResponse(id, -32602, 'Unknown or invalid resource URI.', 400);
    }
    const resource = GUIDANCE_RESOURCES[params.uri];
    return jsonResponse(id, {
      contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: resource.text }],
    }, modern, modern);
  }

  return errorResponse(id, -32601, `Method not found: ${method}.`, 400);
}

export async function handleMcpRequest({ method = 'POST', headers = {}, body = null } = {}) {
  const normalizedHeaders = normalizeHeaders(headers);
  const httpMethod = String(method || 'POST').toUpperCase();

  if (!validOrigin(normalizedHeaders)) return errorResponse(body?.id, -32600, 'Invalid Origin.', 403);
  if (httpMethod === 'GET') return noContent(405, { allow: 'POST' });
  if (httpMethod !== 'POST') return noContent(405, { allow: 'POST' });
  if (requestSize(body) > MAX_REQUEST_BYTES) return errorResponse(body?.id, -32600, 'Request body is too large.', 413);
  if (!isJsonRpcRequest(body)) return errorResponse(body?.id, -32600, 'Invalid JSON-RPC request.', 400);

  const modern = detectModern(normalizedHeaders, body);
  if (modern) {
    const envelopeError = validateModernEnvelope(normalizedHeaders, body);
    if (envelopeError) return envelopeError;
  }

  return methodResult(body, modern);
}

export const PUBLIC_MCP_METADATA = Object.freeze({
  name: SERVER_NAME,
  version: SERVER_VERSION,
  access: 'anonymous-read-only',
  protocols: Object.freeze([LEGACY_VERSION, MODERN_VERSION]),
  maxRequestBytes: MAX_REQUEST_BYTES,
});
