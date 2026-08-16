#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  '.codex-plugin/plugin.json',
  '.mcp.json',
  '.agents/plugins/marketplace.json',
  'skills/current-3d-engineering/SKILL.md',
  'skills/current-3d-engineering/references/source-policy.md',
  'skills/current-3d-engineering/references/project-routing.md',
  'skills/current-3d-engineering/references/engineering-invariants.md',
  'skills/current-3d-engineering/scripts/resolve-npm-packages.mjs',
  'remote-mcp/appdeploy/backend/mcp-core.js',
  'remote-mcp/appdeploy/backend/guidance.js',
  'tests/plugin.test.mjs',
  'tests/universality.test.mjs',
  'tests/public-mcp.test.mjs',
  'tests/public-mcp-compat.test.mjs',
  'tests/public-mcp-live.test.mjs',
];

for (const file of requiredFiles) await access(file);

await access('skills/current-3d-engineering/scripts/resolve-packages.mjs')
  .then(() => { throw new Error('ambiguous legacy resolver path must not exist'); })
  .catch((error) => {
    if (error?.message === 'ambiguous legacy resolver path must not exist') throw error;
    if (error?.code !== 'ENOENT') throw error;
  });

const manifest = JSON.parse(await readFile('.codex-plugin/plugin.json', 'utf8'));
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name)) throw new Error('plugin name must be stable kebab-case');
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error('plugin version must be semantic x.y.z');
if (manifest.version !== packageJson.version) throw new Error('plugin and package versions must match');
if (manifest.skills !== './skills/') throw new Error('manifest skills path must be ./skills/');
if (manifest.mcpServers !== './.mcp.json') throw new Error('manifest mcpServers path must be ./.mcp.json');

const mcpConfig = JSON.parse(await readFile('.mcp.json', 'utf8'));
if (!mcpConfig || typeof mcpConfig !== 'object' || Array.isArray(mcpConfig)) throw new Error('.mcp.json must contain an object');
const mcpEntries = Object.entries(mcpConfig.mcpServers ?? {});
if (mcpEntries.length === 0) throw new Error('.mcp.json must expose at least one MCP server');
for (const [serverName, server] of mcpEntries) {
  if (!/^[a-z0-9_]+$/.test(serverName)) throw new Error(`MCP server key must use lowercase letters, digits, or underscores: ${serverName}`);
  if (!server || typeof server !== 'object' || Array.isArray(server)) throw new Error(`MCP server ${serverName} must be an object`);
  if (server.type !== 'http') throw new Error(`MCP server ${serverName} must use type http`);
  if (typeof server.url !== 'string' || !/^https:\/\//.test(server.url)) throw new Error(`MCP server ${serverName} must use an HTTPS URL`);
  const parsedUrl = new URL(server.url);
  if (!parsedUrl.pathname.endsWith('/api/mcp')) throw new Error(`MCP server ${serverName} URL path must end with /api/mcp`);
  if (['localhost', '127.0.0.1', '::1'].includes(parsedUrl.hostname)) throw new Error(`MCP server ${serverName} must not use a loopback endpoint`);
  const allowedServerFields = new Set(['type', 'url']);
  const unsupported = Object.keys(server).filter((key) => !allowedServerFields.has(key));
  if (unsupported.length) throw new Error(`MCP server ${serverName} contains unsupported or credential-bearing fields: ${unsupported.join(', ')}`);
}

if (!manifest.interface || typeof manifest.interface !== 'object' || Array.isArray(manifest.interface)) {
  throw new Error('manifest interface object is required');
}

const requiredInterfaceStrings = ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category'];
for (const field of requiredInterfaceStrings) {
  if (typeof manifest.interface[field] !== 'string' || !manifest.interface[field].trim()) {
    throw new Error(`manifest interface.${field} must be a non-empty string`);
  }
}

const defaultPrompt = manifest.interface.defaultPrompt ?? manifest.interface.default_prompt;
const validDefaultPrompt =
  (typeof defaultPrompt === 'string' && defaultPrompt.trim().length > 0)
  || (Array.isArray(defaultPrompt)
    && defaultPrompt.length > 0
    && defaultPrompt.every((value) => typeof value === 'string' && value.trim().length > 0));
if (!validDefaultPrompt) throw new Error('manifest interface defaultPrompt/default_prompt must be a non-empty string or list of non-empty strings');

const capabilities = manifest.interface.capabilities;
if (!Array.isArray(capabilities)
  || capabilities.length === 0
  || capabilities.some((value) => typeof value !== 'string' || !value.trim())) {
  throw new Error('manifest interface.capabilities must be a non-empty list of non-empty strings');
}

const skill = await readFile('skills/current-3d-engineering/SKILL.md', 'utf8');
if (!skill.startsWith('---\nname: current-3d-engineering\ndescription: Use when ')) throw new Error('skill frontmatter is not discoverable');
if (!skill.includes('references/project-routing.md')) throw new Error('skill must delegate project routing to the generic routing reference');
if (!skill.includes('references/engineering-invariants.md')) throw new Error('skill must delegate reusable correctness rules to engineering invariants');
if (!skill.includes('resolve-npm-packages.mjs')) throw new Error('skill must scope the optional npm metadata helper explicitly');
if (!/provenance/i.test(skill)) throw new Error('skill must route dependency research from discovered provenance');
if (/\$\{PLUGIN_ROOT\}|\$PLUGIN_ROOT/.test(skill)) throw new Error('skill bundled-script instructions must not depend on PLUGIN_ROOT');

const discovery = [manifest.description, manifest.interface.shortDescription, manifest.interface.longDescription].join('\n');
if (/JavaScript|TypeScript|3D web engineering/i.test(discovery)) throw new Error('plugin discovery metadata must not restrict project eligibility by language or web runtime');

const marketplace = JSON.parse(await readFile('.agents/plugins/marketplace.json', 'utf8'));
const entry = marketplace.plugins?.find((plugin) => plugin.name === manifest.name);
if (!entry) throw new Error('marketplace does not expose plugin');
if (entry.source?.path !== './') throw new Error('root plugin marketplace path must be ./');

console.log(`Plugin structure valid: ${manifest.name}@${manifest.version}; architecture=project-first,provenance-first; remote-mcp=anonymous-read-only`);
