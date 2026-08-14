import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
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

test('repository provides CI and offline structure verification', async () => {
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

const resolverPath = new URL('../skills/current-3d-engineering/scripts/resolve-packages.mjs', import.meta.url).pathname;
const publicRegistry = 'https://registry.npmjs.org';

async function runResolver(packageNames) {
  const args = [resolverPath, '--registry', publicRegistry, '--json'];
  for (const packageName of packageNames) args.push('--package', packageName);

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0
      ? resolve(JSON.parse(stdout))
      : reject(new Error(stderr || stdout || `resolver exited ${code}`)));
  });
}

async function fetchPublishedLatest(packageName) {
  const url = `${publicRegistry}/${encodeURIComponent(packageName)}/latest`;
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest = await response.json();
      assert.equal(manifest.name, packageName);
      assert.match(manifest.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/);
      return manifest;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 250));
    }
  }

  throw new Error(`${packageName}: public npm registry request failed after 3 attempts`, { cause: lastError });
}

test('tracked 3D packages resolve through the public npm registry', async () => {
  const manifests = [];
  for (const packageName of REQUIRED_PACKAGES) manifests.push(await fetchPublishedLatest(packageName));
  assert.equal(manifests.length, REQUIRED_PACKAGES.length);
});

test('package resolver agrees with live npm manifests end to end', async () => {
  const packageNames = ['three', '@react-three/fiber', 'cesium'];
  const liveManifests = await Promise.all(packageNames.map(fetchPublishedLatest));
  const report = await runResolver(packageNames);

  assert.equal(report.registry, publicRegistry);
  assert.deepEqual(report.failures, []);
  assert.equal(report.packages.length, packageNames.length);

  for (const [index, packageName] of packageNames.entries()) {
    const resolved = report.packages.find((entry) => entry.name === packageName);
    assert.ok(resolved, `resolver omitted ${packageName}`);
    assert.equal(resolved.latestTag, liveManifests[index].version, `${packageName}: resolver disagrees with npm latest tag`);
    assert.ok(resolved.latestStable, `${packageName}: no stable release was discovered`);
    assert.match(resolved.latestStable, /^\d+\.\d+\.\d+(?:\+[0-9A-Za-z.-]+)?$/);
    assert.match(resolved.recommendedVersion, /^\d+\.\d+\.\d+(?:\+[0-9A-Za-z.-]+)?$/);
  }

  const fiber = report.packages.find((entry) => entry.name === '@react-three/fiber');
  assert.ok(Object.keys(fiber.peerDependencies).length > 0, 'R3F peer dependency metadata must come from the live selected release');
});

test('integration suite contains no loopback registry replacement', async () => {
  const current = await readText('tests/plugin.test.mjs');
  for (const marker of ['127.0.0' + '.1', 'local' + 'host', "from 'node:" + "http'", 'create' + 'Server(']) {
    assert.ok(!current.includes(marker), `simulated endpoint marker remains: ${marker}`);
  }
});
