# Third Universality Stress Audit Design

## Goal

Stress Current 3D Engineering again as a universal 3D/graphics engineering plugin and correct only generalized architectural defects. Temporary project probes may expose failures, but no probe, persona, engine, language, package manager, build system, or project type may become runtime routing logic.

## Confirmed defects from the fresh audit

1. **Skill-host portability:** the skill currently invokes its bundled npm helper through `${PLUGIN_ROOT}` even though bundled skill scripts must be referenced relative to the skill root. Plugin behavior must not depend on an undocumented host environment variable.
2. **Current Codex manifest validation:** the local validator does not enforce the current required `interface.category` field, so it can report success for a manifest that current Codex plugin validation rejects.
3. **Developer-state preservation:** project-first work must treat existing uncommitted/unsaved developer changes as project truth and must not reset, clean, overwrite, regenerate, or otherwise destroy unrelated work.
4. **Project materialization/completeness:** absence of a file, asset, dependency, module, or generated artifact is not reliable evidence until the agent checks whether the working copy is partial, sparse, uninitialized, pointer-only, externally synchronized, or awaiting a project-defined restore/import/generation step.
5. **Execution trust and side effects:** repository build/install/generator/editor scripts are executable code. The plugin must inspect commands and understand material filesystem, network, credential, install-hook, signing, deployment, or destructive side effects before execution, especially in unfamiliar or untrusted projects.
6. **Persisted 3D data compatibility:** source-code compatibility alone is insufficient when scenes, assets, saves, caches, serialized editor state, schemas, binary formats, units, coordinate systems, handedness, axes, color spaces, animation/skeleton data, or generated content cross versions/tools. Destructive or lossy migrations require ownership, compatibility, backup/reproducibility, and fidelity verification.
7. **npm helper semantics:** a registry-derived stable version is a metadata candidate, not a compatibility recommendation. The helper must not label it `recommendedVersion`. Its private/scoped-registry behavior must also be described truthfully: a simple `--registry` URL is not full `.npmrc` scope/auth/proxy/certificate semantics.
8. **Installation documentation:** marketplace registration alone is not plugin installation. Documentation must include the current plugin-add step and avoid implying that listing marketplaces proves the plugin is installed.

## Architecture

Keep the universal core as project-first and provenance-first. Add generalized invariants for state preservation, materialization, execution trust, and persisted-data semantics. Keep ecosystem-specific utilities optional and explicitly scoped; for npm, preserve real public-registry integration while renaming compatibility-suggestive output to neutral registry-candidate terminology.

Packaging validation must track the current Codex ingestion contract closely enough that `npm run verify` cannot claim success while required manifest fields are missing. Installation documentation should follow current Codex marketplace/plugin separation: configure a marketplace source when needed, then install the named plugin from that marketplace.

## Safety and universality rules

- Never encode the temporary stress probes as scenarios, personas, project detectors, or supported-technology tables.
- Never infer project absence from an incomplete working copy.
- Never destroy or silently replace unrelated developer changes.
- Never run unfamiliar repository code solely because a build command exists; inspect material side effects and required trust/credentials first.
- Never call a registry-selected version a compatibility recommendation without project-level compatibility evidence.
- Never claim a migration preserves 3D content without checking the semantics the project actually depends on.
- Never make a public-registry helper responsible for private/scoped npm configuration it does not implement.

## Validation strategy

Use TDD. Add property tests that fail on the current v1.2.0 tree for each confirmed defect. The red CI run must show failures caused by the old assumptions, while existing real npm endpoint tests remain passing. Then implement the smallest generalized corrections and require the complete suite and structure validation to pass.

The final gate must run on the exact final `main` HEAD and verify:

- current required plugin interface metadata;
- skill-root-relative bundled-script instructions;
- developer-state/materialization/execution-trust/persisted-data invariants;
- neutral npm registry-candidate semantics and truthful registry scope;
- complete current install instructions;
- no scenarios/personas/allowlists introduced;
- live public npm integration still succeeds;
- `main` remains the sole authoritative branch.
