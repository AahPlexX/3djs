#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function usage() {
  return `Current 3D npm metadata helper\n\nUsage:\n  node resolve-npm-packages.mjs --project <path> [options]\n  node resolve-npm-packages.mjs --package <name> [--package <name> ...] [options]\n\nScope:\n  Optional helper for npm-compatible package metadata only.\n  It is not a universal project detector and is not required for non-npm projects.\n\nInput:\n  --package <name>   Resolve any npm registry package name; repeat for more packages\n  --project <path>   Read direct dependency specs from <path>/package.json\n                     Registry-backed specs are queried; non-registry specs are preserved separately\n\nOptions:\n  --registry <url>   npm-compatible registry base URL (default: https://registry.npmjs.org)\n  --json             Emit JSON (default output is a readable table)\n  --help             Show this help\n\nThere is no built-in package allowlist or implicit project-ecosystem selection.\n`;
}

function parseArgs(argv) {
  const options = { packages: [], project: null, registry: 'https://registry.npmjs.org', json: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--package') {
      const value = argv[++i];
      if (!value) throw new Error('--package requires a package name');
      options.packages.push(value);
    } else if (arg === '--project') {
      const value = argv[++i];
      if (!value) throw new Error('--project requires a path');
      options.project = value;
    } else if (arg === '--registry') {
      const value = argv[++i];
      if (!value) throw new Error('--registry requires a URL');
      options.registry = value.replace(/\/$/, '');
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function parseStable(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:\+[^-]+)?$/.exec(version);
  if (!match) return null;
  return { version, parts: match.slice(1, 4).map(Number) };
}

function compareStable(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a.parts[i] !== b.parts[i]) return a.parts[i] - b.parts[i];
  }
  return 0;
}

function highestStable(versions) {
  return Object.keys(versions ?? {})
    .map(parseStable)
    .filter(Boolean)
    .sort(compareStable)
    .at(-1)?.version ?? null;
}

function repositoryUrl(repository) {
  if (!repository) return null;
  if (typeof repository === 'string') return repository;
  return repository.url ?? null;
}

async function readProjectSpecs(projectPath) {
  if (!projectPath) return { packageJsonPath: null, specs: {} };
  const packageJsonPath = resolve(projectPath, 'package.json');
  const parsed = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  return {
    packageJsonPath,
    specs: {
      ...(parsed.dependencies ?? {}),
      ...(parsed.devDependencies ?? {}),
      ...(parsed.peerDependencies ?? {}),
      ...(parsed.optionalDependencies ?? {}),
    },
  };
}

function parseAliasTarget(spec) {
  const value = spec.slice('npm:'.length);
  if (!value) return null;

  if (value.startsWith('@')) {
    const slash = value.indexOf('/');
    if (slash < 2) return null;
    const versionSeparator = value.indexOf('@', slash + 1);
    return versionSeparator === -1 ? value : value.slice(0, versionSeparator);
  }

  const versionSeparator = value.indexOf('@');
  return versionSeparator === -1 ? value : value.slice(0, versionSeparator);
}

function classifyProjectDependency(declaredName, installedSpec) {
  const spec = String(installedSpec ?? '').trim();

  if (spec.startsWith('npm:')) {
    const registryName = parseAliasTarget(spec);
    if (!registryName) {
      return { kind: 'non-registry', declaredName, installedSpec: spec, provenance: 'invalid-npm-alias' };
    }
    return { kind: 'registry', declaredName, registryName, installedSpec: spec, provenance: 'npm-alias' };
  }

  const scheme = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(spec)?.[1];
  if (scheme) {
    return { kind: 'non-registry', declaredName, installedSpec: spec, provenance: `protocol:${scheme.toLowerCase()}` };
  }

  if (/^(?:\.{0,2}\/|~\/|\/)/.test(spec)) {
    return { kind: 'non-registry', declaredName, installedSpec: spec, provenance: 'local-path' };
  }

  if (/^[^/\s]+\/[^/\s]+(?:#.*)?$/.test(spec)) {
    return { kind: 'non-registry', declaredName, installedSpec: spec, provenance: 'vcs-shorthand' };
  }

  return { kind: 'registry', declaredName, registryName: declaredName, installedSpec: spec || null, provenance: 'npm-registry' };
}

async function fetchMetadata(registry, packageName) {
  const url = `${registry}/${encodeURIComponent(packageName)}`;
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`${packageName}: registry returned HTTP ${response.status}`);
  return response.json();
}

function summarize(metadata, dependency) {
  const latestTag = metadata['dist-tags']?.latest ?? null;
  const latestStable = highestStable(metadata.versions);
  const latestTagIsPrerelease = latestTag ? !parseStable(latestTag) : null;
  const recommendedVersion = latestTag && !latestTagIsPrerelease ? latestTag : latestStable;
  const versionMetadata = recommendedVersion ? metadata.versions?.[recommendedVersion] : null;

  return {
    name: metadata.name,
    declaredName: dependency.declaredName,
    registryName: dependency.registryName,
    installedSpec: dependency.installedSpec ?? null,
    provenance: dependency.provenance,
    latestTag,
    latestTagIsPrerelease,
    latestStable,
    recommendedVersion,
    deprecated: versionMetadata?.deprecated ?? null,
    peerDependencies: versionMetadata?.peerDependencies ?? {},
    engines: versionMetadata?.engines ?? {},
    homepage: versionMetadata?.homepage ?? metadata.homepage ?? null,
    repository: repositoryUrl(versionMetadata?.repository ?? metadata.repository),
  };
}

function printTable(report) {
  console.log(`Verified: ${report.verifiedAt}`);
  console.log(`Registry: ${report.registry}`);
  if (report.projectPackageJson) console.log(`Project: ${report.projectPackageJson}`);
  console.log('');
  console.log('Declared\tRegistry package\tProject spec\tlatest tag\tstable\trecommended');
  for (const pkg of report.packages) {
    console.log(`${pkg.declaredName}\t${pkg.registryName}\t${pkg.installedSpec ?? '-'}\t${pkg.latestTag ?? '-'}\t${pkg.latestStable ?? '-'}\t${pkg.recommendedVersion ?? '-'}`);
  }
  if (report.nonRegistryDependencies.length) {
    console.log('\nNon-registry dependency specs:');
    for (const entry of report.nonRegistryDependencies) {
      console.log(`- ${entry.declaredName}: ${entry.installedSpec} (${entry.provenance})`);
    }
  }
  if (report.failures.length) {
    console.error('\nRegistry failures:');
    for (const failure of report.failures) {
      console.error(`- ${failure.declaredName}${failure.registryName !== failure.declaredName ? ` -> ${failure.registryName}` : ''}: ${failure.error}`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const project = await readProjectSpecs(options.project);
  let dependencies;

  if (options.packages.length) {
    dependencies = [...new Set(options.packages)].map((name) => ({
      kind: 'registry',
      declaredName: name,
      registryName: name,
      installedSpec: project.specs[name] ?? null,
      provenance: 'explicit-npm-registry',
    }));
  } else {
    dependencies = Object.entries(project.specs).map(([name, spec]) => classifyProjectDependency(name, spec));
  }

  if (dependencies.length === 0) {
    throw new Error('No npm metadata inputs. Provide --package <name> or --project <path> with declared dependencies.');
  }

  const registryDependencies = dependencies.filter((entry) => entry.kind === 'registry');
  const nonRegistryDependencies = dependencies
    .filter((entry) => entry.kind !== 'registry')
    .map(({ declaredName, installedSpec, provenance }) => ({ declaredName, installedSpec, provenance }));

  const packages = [];
  const failures = [];
  for (const dependency of registryDependencies) {
    try {
      const metadata = await fetchMetadata(options.registry, dependency.registryName);
      packages.push(summarize(metadata, dependency));
    } catch (error) {
      failures.push({
        declaredName: dependency.declaredName,
        registryName: dependency.registryName,
        installedSpec: dependency.installedSpec ?? null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const report = {
    verifiedAt: new Date().toISOString(),
    currentDate: new Date().toISOString().slice(0, 10),
    scope: 'npm-compatible registry metadata',
    registry: options.registry,
    projectPackageJson: project.packageJsonPath,
    packages,
    nonRegistryDependencies,
    failures,
  };

  if (options.json) console.log(JSON.stringify(report, null, 2));
  else printTable(report);

  if (failures.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
