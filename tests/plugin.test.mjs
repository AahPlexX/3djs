import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));

const REQUIRED_SCENARIO_FIELDS = ['id', 'title', 'request', 'doneWhen'];
const REQUIRED_PACKAGES = [
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  '@babylonjs/core',
  'playcanvas',
  'cesium',
  '@dimforge/rapier3d',
  '@gltf-transform/core',
];

test('plugin manifest is a skill-only Codex plugin with stable metadata', async () => {
  const manifest = await readJson('.codex-plugin/plugin.json');
  assert.equal(manifest.name, 'current-3d-engineering');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.repository, 'https://github.com/AahPlexX/3djs');
  assert.ok(!('mcpServers' in manifest), 'MCP must not be declared unless one is actually implemented');
});

test('repo marketplace exposes the root plugin for ChatGPT/Codex installation', async () => {
  const marketplace = await readJson('.agents/plugins/marketplace.json');
  assert.equal(marketplace.name, 'aahplexx-3djs');
  assert.equal(marketplace.plugins.length, 1);
  const entry = marketplace.plugins[0];
  assert.equal(entry.name, 'current-3d-engineering');
  assert.equal(entry.source.source, 'local');
  assert.equal(entry.source.path, './');
  assert.equal(entry.policy.installation, 'AVAILABLE');
  assert.equal(entry.policy.authentication, 'ON_INSTALL');
  assert.ok(entry.category);
});

test('skill is discoverable and delegates heavy reference material', async () => {
  const skill = await readText('skills/current-3d-engineering/SKILL.md');
  assert.match(skill, /^---\nname: current-3d-engineering\ndescription: Use when /);
  assert.match(skill, /references\/source-policy\.md/);
  assert.match(skill, /references\/library-routing\.md/);
  assert.match(skill, /references\/scenarios\.md/);
  assert.match(skill, /scripts\/resolve-packages\.mjs/);
  assert.match(skill, /current date/i);
  assert.match(skill, /never infer/i);
});

test('source policy requires authoritative current sources and bans weak defaults', async () => {
  const policy = (await readText('skills/current-3d-engineering/references/source-policy.md')).toLowerCase();
  for (const expected of ['registry.npmjs.org', 'developer.mozilla.org', 'w3.org', 'khronos.org']) {
    assert.ok(policy.includes(expected), `missing authoritative source: ${expected}`);
  }
  for (const prohibited of ['reddit.com', 'medium.com', 'wikipedia.org']) {
    assert.ok(policy.includes(prohibited), `missing prohibited-source rule: ${prohibited}`);
  }
  assert.match(policy, /conflict/i);
  assert.match(policy, /prerelease/i);
});

test('scenario catalog contains at least ten complete real-world flows', async () => {
  const scenarios = await readJson('tests/scenarios.json');
  assert.ok(Array.isArray(scenarios));
  assert.ok(scenarios.length >= 10, `expected >=10 scenarios, got ${scenarios.length}`);
  const ids = new Set();
  for (const scenario of scenarios) {
    for (const field of REQUIRED_SCENARIO_FIELDS) assert.ok(scenario[field], `${scenario.id ?? 'unknown'} missing ${field}`);
    assert.ok(Array.isArray(scenario.doneWhen) && scenario.doneWhen.length >= 4, `${scenario.id} needs >=4 completion checks`);
    assert.ok(!ids.has(scenario.id), `duplicate scenario id ${scenario.id}`);
    ids.add(scenario.id);
  }
});

test('human scenario reference mirrors every executable scenario id', async () => {
  const scenarios = await readJson('tests/scenarios.json');
  const reference = await readText('skills/current-3d-engineering/references/scenarios.md');
  for (const scenario of scenarios) assert.ok(reference.includes(`\`${scenario.id}\``), `reference missing ${scenario.id}`);
});

test('package resolver tracks the core ecosystem without hardcoded latest versions', async () => {
  const resolver = await readText('skills/current-3d-engineering/scripts/resolve-packages.mjs');
  for (const packageName of REQUIRED_PACKAGES) assert.ok(resolver.includes(packageName), `resolver missing ${packageName}`);
  assert.match(resolver, /registry\.npmjs\.org/);
  assert.match(resolver, /dist-tags/);
  assert.doesNotMatch(resolver, /latest\s*:\s*["']\d/);
});

test('repository provides CI and deterministic offline verification', async () => {
  const packageJson = await readJson('package.json');
  assert.equal(packageJson.private, true);
  assert.ok(packageJson.scripts?.test);
  assert.ok(packageJson.scripts?.verify);
  const workflow = await readText('.github/workflows/ci.yml');
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run verify/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:/);
});

test('all reference files are intentionally scoped and non-empty', async () => {
  const dir = new URL('skills/current-3d-engineering/references/', root);
  const files = (await readdir(dir)).filter((name) => name.endsWith('.md'));
  assert.ok(files.length >= 3);
  for (const file of files) {
    const text = await readFile(join(dir.pathname, file), 'utf8');
    assert.ok(text.trim().length > 200, `${file} is unexpectedly thin`);
  }
});

test('package resolver resolves latest stable and peer metadata end to end', async () => {
  const metadata = {
    name: 'three',
    'dist-tags': { latest: '2.0.0-beta.1', next: '2.0.0-beta.1' },
    versions: {
      '1.9.0': { name: 'three', version: '1.9.0', peerDependencies: { react: '^19.0.0' }, engines: { node: '>=20' } },
      '1.10.0': { name: 'three', version: '1.10.0', peerDependencies: { react: '^19.0.0' }, engines: { node: '>=20' } },
      '2.0.0-beta.1': { name: 'three', version: '2.0.0-beta.1' },
    },
  };

  const server = createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(metadata));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const registry = `http://127.0.0.1:${address.port}`;

  const output = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      new URL('../skills/current-3d-engineering/scripts/resolve-packages.mjs', import.meta.url).pathname,
      '--registry', registry,
      '--package', 'three',
      '--json',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr || `resolver exited ${code}`)));
  }).finally(() => new Promise((resolve) => server.close(resolve)));

  const parsed = JSON.parse(output);
  assert.equal(parsed.packages[0].latestTag, '2.0.0-beta.1');
  assert.equal(parsed.packages[0].latestStable, '1.10.0');
  assert.equal(parsed.packages[0].recommendedVersion, '1.10.0');
  assert.deepEqual(parsed.packages[0].peerDependencies, { react: '^19.0.0' });
  assert.equal(parsed.packages[0].latestTagIsPrerelease, true);
});
