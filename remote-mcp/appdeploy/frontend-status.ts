import { api } from '@appdeploy/client';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app root');

root.innerHTML = `
  <main class="shell">
    <section class="hero" aria-labelledby="page-title">
      <p class="eyebrow">Current 3D Engineering</p>
      <h1 id="page-title">Public MCP endpoint</h1>
      <p class="lede">Anonymous HTTPS access to bounded, read-only 3D engineering guidance. No login, OAuth, or API key is required.</p>
      <div class="badges" aria-label="Endpoint properties">
        <span>HTTPS</span><span>No login or API key</span><span>Read-only</span><span>Stateless</span>
      </div>
    </section>

    <section class="panel" aria-labelledby="check-title">
      <div>
        <p class="label">Endpoint</p>
        <code>/api/mcp</code>
      </div>
      <div>
        <h2 id="check-title">Anonymous self-check</h2>
        <p>Runs MCP initialize and tool discovery without credentials.</p>
      </div>
      <button id="run-check" type="button">Run anonymous MCP check</button>
      <p id="status" class="status" role="status" aria-live="polite">Not checked yet.</p>
    </section>

    <section class="details" aria-label="Protocol support">
      <article><strong>2025-11-25</strong><span>Initialization-era Streamable HTTP compatibility</span></article>
      <article><strong>2026-07-28</strong><span>Current stateless MCP protocol support</span></article>
    </section>
  </main>
`;

const button = document.querySelector<HTMLButtonElement>('#run-check');
const status = document.querySelector<HTMLElement>('#status');
if (!button || !status) throw new Error('Missing self-check controls');

button.addEventListener('click', async () => {
  button.disabled = true;
  status.className = 'status pending';
  status.textContent = 'Checking anonymous MCP access…';

  try {
    const initialize = await api.post('/api/mcp', {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'public-status-page', version: '1.0.0' },
      },
    });
    const tools = await api.post('/api/mcp', { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
    const version = initialize.data?.result?.serverInfo?.version;
    const name = initialize.data?.result?.serverInfo?.name;
    const toolCount = Array.isArray(tools.data?.result?.tools) ? tools.data.result.tools.length : -1;
    if (name !== 'current-3d-engineering' || typeof version !== 'string' || toolCount < 0) throw new Error('Unexpected MCP response');

    status.className = 'status ok';
    status.textContent = `MCP online — ${name} v${version} — ${toolCount} read-only tools.`;
  } catch {
    status.className = 'status error';
    status.textContent = 'MCP check failed. The page did not report a false success.';
  } finally {
    button.disabled = false;
  }
});
