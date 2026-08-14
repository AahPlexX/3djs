#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  '.codex-plugin/plugin.json',
  '.agents/plugins/marketplace.json',
  'skills/current-3d-engineering/SKILL.md',
  'skills/current-3d-engineering/references/source-policy.md',
  'skills/current-3d-engineering/references/project-routing.md',
  'skills/current-3d-engineering/references/engineering-invariants.md',
  'skills/current-3d-engineering/scripts/resolve-packages.mjs',
  'tests/plugin.test.mjs',
];

for (const file of requiredFiles) await access(file);

const manifest = JSON.parse(await readFile('.codex-plugin/plugin.json', 'utf8'));
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(manifest.name)) throw new Error('plugin name must be stable kebab-case');
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error('plugin version must be semantic x.y.z');
if (manifest.skills !== './skills/') throw new Error('manifest skills path must be ./skills/');
if ('mcpServers' in manifest) throw new Error('skill-only plugin must not advertise an unimplemented MCP server');

const skill = await readFile('skills/current-3d-engineering/SKILL.md', 'utf8');
if (!skill.startsWith('---\nname: current-3d-engineering\ndescription: Use when ')) throw new Error('skill frontmatter is not discoverable');
if (!skill.includes('references/project-routing.md')) throw new Error('skill must delegate project routing to the generic routing reference');
if (!skill.includes('references/engineering-invariants.md')) throw new Error('skill must delegate reusable correctness rules to engineering invariants');

const marketplace = JSON.parse(await readFile('.agents/plugins/marketplace.json', 'utf8'));
const entry = marketplace.plugins?.find((plugin) => plugin.name === manifest.name);
if (!entry) throw new Error('marketplace does not expose plugin');
if (entry.source?.path !== './') throw new Error('root plugin marketplace path must be ./');

console.log(`Plugin structure valid: ${manifest.name}@${manifest.version}; architecture=project-first`);
