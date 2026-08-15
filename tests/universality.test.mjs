import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));
const newResolver = new URL('../skills/current-3d-engineering/scripts/resolve-npm-packages.mjs', import.meta.url);
const oldResolver = new URL('../skills/current-3d-engineering/scripts/resolve-packages.mjs', import.meta.url);
const publicRegistry = 'https://registry.npmjs.org';

async function existingResolverPath() {
  try {
    await access(newResolver);
    return newResolver.pathname;
  } catch {
    return oldResolver.pathname;
  }
}

async function runResolverRaw(args = []) {
  const resolverPath = await existingResolverPath();
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

test('plugin discovery is not restricted to JavaScript, TypeScript, browser, or web projects', async () => {
  const manifest = await readJson('.codex-plugin/plugin.json');
  const skill = await readText('skills/current-3d-engineering/SKILL.md');
  const discoveryText = [
    manifest.description,
    manifest.interface?.shortDescription,
    manifest.interface?.longDescription,
    skill.split('---')[1],
  ].join('\n').toLowerCase();

  assert.doesNotMatch(discoveryText, /javascript|typescript|3d web|web engineering|browser-only/);
  assert.match(discoveryText, /3d|graphics/);
  assert.match(skill, /any language|arbitrary language|language.*runtime|runtime.*toolchain/i);
});

test('source policy chooses authoritative evidence from discovered provenance instead of assuming npm', async () => {
  const policy = await readText('skills/current-3d-engineering/references/source-policy.md');
  assert.match(policy, /provenance/i);
  assert.match(policy, /registry|index/i);
  assert.match(policy, /version control|\bVCS\b|repository revision/i);
  assert.match(policy, /SDK|engine|editor/i);
  assert.match(policy, /local|vendored|system/i);
  assert.doesNotMatch(policy, /Read the project's `package\.json`/i);
  assert.doesNotMatch(policy, /Stable is a semantic version/i);
});

test('project routing covers arbitrary project structures and ownership boundaries without ecosystem eligibility gates', async () => {
  const routing = await readText('skills/current-3d-engineering/references/project-routing.md');
  for (const property of [
    /workspace|subproject|module boundary/i,
    /polyglot|multiple languages/i,
    /generated/i,
    /editor-managed|engine-managed/i,
    /toolchain/i,
    /SDK/i,
    /native/i,
    /vendored/i,
  ]) assert.match(routing, property);

  assert.match(routing, /unknown technology/i);
  assert.match(routing, /do not.*support.*list|no.*support.*list|not.*support.*list/i);
});

test('engineering invariants include compiled, native, generated, shader-build, and hardware compatibility when applicable', async () => {
  const invariants = await readText('skills/current-3d-engineering/references/engineering-invariants.md');
  for (const property of [
    /compiler|interpreter/i,
    /SDK/i,
    /ABI/i,
    /link/i,
    /architecture|target triple/i,
    /shader.*compil|compil.*shader/i,
    /generated|editor-managed/i,
    /driver/i,
  ]) assert.match(invariants, property);
});

test('npm resolver is explicitly scoped and optional rather than the universal project resolver', async () => {
  await access(newResolver);
  await assert.rejects(access(oldResolver), 'old ambiguous resolver path must be removed');
  const helper = await readFile(newResolver, 'utf8');
  const skill = await readText('skills/current-3d-engineering/SKILL.md');
  assert.match(helper, /npm/i);
  assert.match(skill, /optional/i);
  assert.match(skill, /resolve-npm-packages\.mjs/);
  assert.doesNotMatch(skill, /scripts\/resolve-packages\.mjs/);
});

test('npm project mode preserves non-registry dependency provenance and resolves npm aliases', async () => {
  const projectPath = await mkdtemp(join(tmpdir(), 'current-3d-universal-'));
  try {
    const packageJson = {
      name: 'universality-property-test',
      private: true,
      dependencies: {
        typescript: '^5.0.0',
        'render-alias': 'npm:ogl@^1.0.0',
        'local-workspace-renderer': 'workspace:*',
        'local-file-renderer': 'file:../renderer',
        'git-renderer': 'git+https://github.com/mrdoob/three.js.git#master',
      },
    };
    await writeFile(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

    const result = await runResolverRaw(['--project', projectPath, '--registry', publicRegistry, '--json']);
    assert.equal(result.code, 0, result.stderr || result.stdout);
    const report = JSON.parse(result.stdout);
    assert.deepEqual(report.failures, []);

    const byDeclaredName = new Map(report.packages.map((entry) => [entry.declaredName ?? entry.name, entry]));
    assert.equal(byDeclaredName.get('typescript')?.registryName ?? byDeclaredName.get('typescript')?.name, 'typescript');
    assert.equal(byDeclaredName.get('render-alias')?.registryName, 'ogl');
    assert.equal(byDeclaredName.get('render-alias')?.installedSpec, 'npm:ogl@^1.0.0');

    const nonRegistry = new Map(report.nonRegistryDependencies.map((entry) => [entry.declaredName, entry]));
    assert.equal(nonRegistry.get('local-workspace-renderer')?.installedSpec, 'workspace:*');
    assert.equal(nonRegistry.get('local-file-renderer')?.installedSpec, 'file:../renderer');
    assert.equal(nonRegistry.get('git-renderer')?.installedSpec, 'git+https://github.com/mrdoob/three.js.git#master');
  } finally {
    await rm(projectPath, { recursive: true, force: true });
  }
});

test('npm helper still validates arbitrary registry packages against the real public npm registry', async () => {
  const result = await runResolverRaw(['--package', 'ogl', '--registry', publicRegistry, '--json']);
  assert.equal(result.code, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.failures, []);
  assert.equal(report.packages.length, 1);
  assert.equal(report.packages[0].registryName ?? report.packages[0].name, 'ogl');
  assert.match(report.packages[0].recommendedVersion, /^\d+\.\d+\.\d+/);
});

test('plugin manifest and local validator enforce current required interface metadata', async () => {
  const manifest = await readJson('.codex-plugin/plugin.json');
  const validator = await readText('skills/current-3d-engineering/scripts/validate-plugin.mjs');
  for (const field of ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category']) {
    assert.equal(typeof manifest.interface?.[field], 'string', `interface.${field} must be a string`);
    assert.ok(manifest.interface[field].trim(), `interface.${field} must be non-empty`);
    assert.match(validator, new RegExp(field));
  }
  assert.ok(Array.isArray(manifest.interface?.defaultPrompt) && manifest.interface.defaultPrompt.length > 0);
  assert.ok(Array.isArray(manifest.interface?.capabilities) && manifest.interface.capabilities.length > 0);
  assert.match(validator, /defaultPrompt|default_prompt/);
  assert.match(validator, /capabilities/);
});

test('bundled helper invocation is skill-root-relative and host-variable independent', async () => {
  const skill = await readText('skills/current-3d-engineering/SKILL.md');
  assert.doesNotMatch(skill, /\$\{PLUGIN_ROOT\}|\$PLUGIN_ROOT/);
  assert.match(skill, /node\s+["']?scripts\/resolve-npm-packages\.mjs["']?/);
});

test('universal routing preserves developer work and does not assume a complete working copy', async () => {
  const routing = await readText('skills/current-3d-engineering/references/project-routing.md');
  const invariants = await readText('skills/current-3d-engineering/references/engineering-invariants.md');
  const combined = `${routing}\n${invariants}`;
  assert.match(combined, /uncommitted|unsaved|developer changes|working[- ]tree|working copy/i);
  assert.match(combined, /preserve|do not.*overwrite|do not.*reset|do not.*clean/i);
  assert.match(combined, /partial|sparse|materializ|submodule|large file|pointer/i);
  assert.match(combined, /missing|absence/i);
});

test('universal execution policy treats project commands as executable code with material side effects', async () => {
  const policy = await readText('skills/current-3d-engineering/references/source-policy.md');
  const invariants = await readText('skills/current-3d-engineering/references/engineering-invariants.md');
  const combined = `${policy}\n${invariants}`;
  assert.match(combined, /untrusted|trust boundary|executable code|inspect.*script|inspect.*command/i);
  assert.match(combined, /side effect|filesystem|network|credential|install hook|postinstall/i);
  assert.match(combined, /secret|credential/i);
});

test('3D data and content migrations preserve serialized semantic compatibility when applicable', async () => {
  const invariants = await readText('skills/current-3d-engineering/references/engineering-invariants.md');
  assert.match(invariants, /serializ|schema|migration/i);
  assert.match(invariants, /unit|scale/i);
  assert.match(invariants, /handedness|coordinate|up[- ]axis|axis convention/i);
  assert.match(invariants, /color space|colour space|transfer function/i);
  assert.match(invariants, /backup|reversible|round[- ]trip|lossy|destructive/i);
});

test('npm metadata exposes a registry candidate rather than a compatibility recommendation', async () => {
  const helper = await readFile(newResolver, 'utf8');
  const readme = await readText('README.md');
  assert.match(helper, /registryCandidateVersion/);
  assert.doesNotMatch(helper, /recommendedVersion/);
  assert.match(readme, /registry candidate/i);
  assert.match(readme, /not.*compatibility recommendation|does not.*recommend.*compatib|candidate.*not.*compatib/i);
});

test('npm helper documentation does not pretend to implement full private or scoped npm configuration', async () => {
  const readme = await readText('README.md');
  const skill = await readText('skills/current-3d-engineering/SKILL.md');
  const combined = `${readme}\n${skill}`;
  assert.match(combined, /\.npmrc/i);
  assert.match(combined, /scoped registry|scope.*registry/i);
  assert.match(combined, /auth|token|certificate|proxy/i);
  assert.match(combined, /does not|not.*implement|use.*npm.*config|project.*npm.*tool/i);
});

test('installation instructions separate marketplace registration from plugin installation', async () => {
  const readme = await readText('README.md');
  assert.match(readme, /codex plugin marketplace add/);
  assert.match(readme, /codex plugin add current-3d-engineering@aahplexx-3djs/);
  assert.match(readme, /codex plugin list/);
});
