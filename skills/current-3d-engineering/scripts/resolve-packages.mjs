#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DEFAULT_PACKAGES = [
  'three',
  '@types/three',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/rapier',
  '@babylonjs/core',
  'playcanvas',
  'cesium',
  '@dimforge/rapier3d',
  '@dimforge/rapier3d-compat',
  '@gltf-transform/core',
  '@gltf-transform/extensions',
  '@gltf-transform/functions',
  '@gltf-transform/cli',
  '@types/webxr',
];

function usage() {
  return `Current 3D package resolver\n\nUsage:\n  node resolve-packages.mjs [options]\n\nOptions:\n  --package <name>   Resolve one package; repeat for more packages\n  --project <path>   Read dependency specs from <path>/package.json\n  --registry <url>   npm registry base URL (default: https://registry.npmjs.org)\n  --json             Emit JSON (default output is a readable table)\n  --help             Show this help\n`;
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

async function fetchMetadata(registry, packageName) {
  const url = `${registry}/${encodeURIComponent(packageName)}`;
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${packageName}: registry returned HTTP ${response.status}`);
  return response.json();
}

function summarize(metadata, installedSpec) {
  const latestTag = metadata['dist-tags']?.latest ?? null;
  const latestStable = highestStable(metadata.versions);
  const latestTagIsPrerelease = latestTag ? !parseStable(latestTag) : null;
  const recommendedVersion = latestTag && !latestTagIsPrerelease ? latestTag : latestStable;
  const versionMetadata = recommendedVersion ? metadata.versions?.[recommendedVersion] : null;

  return {
    name: metadata.name,
    installedSpec: installedSpec ?? null,
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
  console.log('Package\tProject spec\tlatest tag\tstable\trecommended');
  for (const pkg of report.packages) {
    console.log(`${pkg.name}\t${pkg.installedSpec ?? '-'}\t${pkg.latestTag ?? '-'}\t${pkg.latestStable ?? '-'}\t${pkg.recommendedVersion ?? '-'}`);
  }
  if (report.failures.length) {
    console.error('\nFailures:');
    for (const failure of report.failures) console.error(`- ${failure.name}: ${failure.error}`);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const project = await readProjectSpecs(options.project);
  let packageNames = options.packages.length ? options.packages : DEFAULT_PACKAGES;
  if (options.project && options.packages.length === 0) {
    const installedTracked = DEFAULT_PACKAGES.filter((name) => project.specs[name]);
    if (installedTracked.length) packageNames = installedTracked;
  }
  packageNames = [...new Set(packageNames)];

  const packages = [];
  const failures = [];
  for (const packageName of packageNames) {
    try {
      const metadata = await fetchMetadata(options.registry, packageName);
      packages.push(summarize(metadata, project.specs[packageName]));
    } catch (error) {
      failures.push({ name: packageName, error: error instanceof Error ? error.message : String(error) });
    }
  }

  const report = {
    verifiedAt: new Date().toISOString(),
    currentDate: new Date().toISOString().slice(0, 10),
    registry: options.registry,
    projectPackageJson: project.packageJsonPath,
    packages,
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
