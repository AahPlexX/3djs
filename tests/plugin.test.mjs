import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));
const resolverPath = new URL('../skills/current-3d-engineering/scripts/resolve-npm-packages.mjs', import.meta.url).pathname;
const publicRegistry = 'https://registry.npmjs.org';

async function runResolverRaw(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [resolverPath, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function runResolver({ packageNames = [], projectPath = null } = {}) {
  const args = ['--registry', publicRegistry, '--json'];
  if (projectPath) args.push('--project', projectPath);
  for (const packageName of packageNames) args.push('--package', packageName);
  const result = await runResolverRaw(args);
  if (result.code !== 0) throw new Error(result.stderr || result.stdout || `resolver exited ${result.code}`);
  return JSON.parse(result.stdout);
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

async function collectFiles(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directoryUrl);
    if (entry.isDirectory()) files.push(...await collectFiles(child));
    else files.push(child);
  }
  return files;
}

test('plugin manifest is a skill-only Codex plugin with stable metadata', async () => {
  const manifest = await readJson('.codex-plugin/plugin.json');
  assert.equal(manifest.name, 'current-3d-engineering');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.repository, 'https://github.com/AahPlexX/3djs');
  assert.ok(manifest.interface?.category);
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

test('skill is project-first and delegates generic references plus an optional npm helper', async () => {
  const skill = await readText('skills/current-3d-engineering/SKILL.md');
  assert.match(skill, /^---\nname: current-3d-engineering\ndescription: Use when /);
  assert.match(skill, /references\/source-policy\.md/);
  assert.match(skill, /references\/project-routing\.md/);
  assert.match(skill, /references\/engineering-invariants\.md/);
  assert.match(skill, /scripts\/resolve-npm-packages\.mjs/);
  assert.match(skill, /optional/i);
  assert.match(skill, /provenance/i);
  assert.match(skill, /current date/i);
  assert.match(skill, /never infer/i);
  assert.doesNotMatch(skill, /references\/scenarios\.md|scenario id|primaryScenario/i);
});

test('source policy requires authoritative provenance-first evidence and bans weak defaults', async () => {
  const policy = (await readText('skills/current-3d-engineering/references/source-policy.md')).toLowerCase();
  for (const expected of ['provenance', 'registry', 'version-control', 'sdk', 'upstream', 'conflict']) {
    assert.ok(policy.includes(expected), `missing evidence rule: ${expected}`);
  }
  for (const prohibited of ['reddit.com', 'medium.com', 'wikipedia.org']) {
    assert.ok(policy.includes(prohibited), `missing prohibited-source rule: ${prohibited}`);
  }
  assert.match(policy, /semantic versioning|semantic-version/i);
  assert.match(policy, /not.*universal|not globally mandatory/i);
});

test('active plugin tree contains no encoded workflow, persona, or legacy universal-resolver contracts', async () => {
  for (const obsoletePath of [
    'tests/scenarios.json',
    'tests/developer-journeys.json',
    'skills/current-3d-engineering/references/scenarios.md',
    'skills/current-3d-engineering/references/library-routing.md',
    'skills/current-3d-engineering/scripts/resolve-packages.mjs',
  ]) {
    await assert.rejects(access(new URL(obsoletePath, root)), `obsolete encoded/ambiguous contract still exists: ${obsoletePath}`);
  }

  const files = [
    ...await collectFiles(new URL('../skills/current-3d-engineering/', import.meta.url)),
    ...await collectFiles(new URL('./', import.meta.url)),
  ];
  const prohibited = [/\bS\d{2}-[a-z0-9-]+\b/i, /primaryScenario/, /developer-journeys\.json/, /tests\/scenarios\.json/, /references\/scenarios\.md/];
  for (const file of files) {
    if (file.pathname.endsWith('/tests/plugin.test.mjs')) continue;
    if (!/\.(?:md|mjs|json)$/.test(file.pathname)) continue;
    const text = await readFile(file, 'utf8');
    for (const pattern of prohibited) assert.doesNotMatch(text, pattern, `${file.pathname} contains encoded workflow/persona contract`);
  }
});

test('npm helper has no recognized-package allowlist', async () => {
  const resolver = await readText('skills/current-3d-engineering/scripts/resolve-npm-packages.mjs');
  assert.doesNotMatch(resolver, /DEFAULT_PACKAGES|REQUIRED_PACKAGES|SUPPORTED_PACKAGES/);
  for (const previouslyCuratedName of ['@react-three/fiber', '@babylonjs/core', 'playcanvas', 'cesium', '@gltf-transform/core']) {
    assert.ok(!resolver.includes(`'${previouslyCuratedName}'`) && !resolver.includes(`"${previouslyCuratedName}"`), `resolver hardcodes ${previouslyCuratedName}`);
  }
  assert.match(resolver, /registry\.npmjs\.org/);
  assert.match(resolver, /dist-tags/);
  assert.match(resolver, /classifyProjectDependency/);
  assert.doesNotMatch(resolver, /latest\s*:\s*["']\d/);
});

test('npm helper requires actual npm package/project input instead of silently choosing an ecosystem', async () => {
  const result = await runResolverRaw(['--json']);
  assert.notEqual(result.code, 0);
  assert.match(`${result.stderr}\n${result.stdout}`, /--package|--project/i);
});

test('explicit arbitrary npm package names resolve through the public npm registry', async () => {
  const packageNames = ['ogl', 'typescript'];
  const report = await runResolver({ packageNames });
  assert.deepEqual(report.failures, []);
  assert.deepEqual(new Set(report.packages.map((entry) => entry.registryName)), new Set(packageNames));
});

test('npm project mode resolves every registry-backed direct dependency section without a package allowlist', async () => {
  const projectPath = await mkdtemp(join(tmpdir(), 'current-3d-project-'));
  try {
    const specs = {
      dependencies: { ogl: '^1.0.0' },
      devDependencies: { typescript: '^5.0.0' },
      peerDependencies: { '@types/webxr': '^0.5.0' },
      optionalDependencies: {},
    };
    await writeFile(join(projectPath, 'package.json'), JSON.stringify({ name: 'resolver-property-test', private: true, ...specs }, null, 2));
    const allSpecs = { ...specs.dependencies, ...specs.devDependencies, ...specs.peerDependencies, ...specs.optionalDependencies };
    const expected = Object.keys(allSpecs);
    const report = await runResolver({ projectPath });
    assert.deepEqual(report.failures, []);
    assert.deepEqual(report.nonRegistryDependencies, []);
    assert.deepEqual(new Set(report.packages.map((entry) => entry.declaredName)), new Set(expected));
    for (const entry of report.packages) assert.equal(entry.installedSpec, allSpecs[entry.declaredName]);
  } finally {
    await rm(projectPath, { recursive: true, force: true });
  }
});

test('npm helper agrees with independent live npm manifests end to end', async () => {
  const packageNames = ['ogl', 'typescript'];
  const liveManifests = await Promise.all(packageNames.map(fetchPublishedLatest));
  const report = await runResolver({ packageNames });

  assert.equal(report.registry, publicRegistry);
  assert.deepEqual(report.failures, []);
  assert.equal(report.packages.length, packageNames.length);

  for (const [index, packageName] of packageNames.entries()) {
    const resolved = report.packages.find((entry) => entry.registryName === packageName);
    assert.ok(resolved, `resolver omitted ${packageName}`);
    assert.equal(resolved.latestTag, liveManifests[index].version, `${packageName}: resolver disagrees with npm latest tag`);
    assert.ok(resolved.latestStable, `${packageName}: no stable release was discovered`);
    assert.match(resolved.latestStable, /^\d+\.\d+\.\d+(?:\+[0-9A-Za-z.-]+)?$/);
    assert.match(resolved.registryCandidateVersion, /^\d+\.\d+\.\d+(?:\+[0-9A-Za-z.-]+)?$/);
    assert.equal('recommendedVersion' in resolved, false);
  }
});

test('structure validator is generic, provenance-first, and requires the scoped npm helper', async () => {
  const validator = await readText('skills/current-3d-engineering/scripts/validate-plugin.mjs');
  assert.match(validator, /project-routing\.md/);
  assert.match(validator, /engineering-invariants\.md/);
  assert.match(validator, /resolve-npm-packages\.mjs/);
  assert.match(validator, /provenance/i);
  assert.match(validator, /category/);
  assert.doesNotMatch(validator, /scenarios\.json|scenarios\.md|scenario count|scenarios=/i);
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

test('all active reference files are intentionally scoped and non-empty', async () => {
  const dir = new URL('skills/current-3d-engineering/references/', root);
  const files = (await readdir(dir)).filter((name) => name.endsWith('.md'));
  assert.ok(files.length >= 3);
  for (const file of files) {
    const text = await readFile(new URL(file, dir), 'utf8');
    assert.ok(text.trim().length > 200, `${file} is unexpectedly thin`);
  }
});

test('integration suite contains no loopback registry replacement', async () => {
  const files = [await readText('tests/plugin.test.mjs'), await readText('tests/universality.test.mjs')];
  for (const current of files) {
    for (const marker of ['127.0.0' + '.1', 'local' + 'host', "from 'node:" + "http'", 'create' + 'Server(']) {
      assert.ok(!current.includes(marker), `simulated endpoint marker remains: ${marker}`);
    }
  }
});
