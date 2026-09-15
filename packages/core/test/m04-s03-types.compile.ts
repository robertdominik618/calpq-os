import type {
  GovernedRequirementSetVersion,
  RequirementSetVersionSelection,
} from '../src/index.ts';

declare const version: GovernedRequirementSetVersion;
declare const selection: RequirementSetVersionSelection;

// @ts-expect-error governed root fields are readonly
version.version = version.version;
// @ts-expect-error governed requirement definitions are readonly
version.requirementDefinitions.push(version.requirementDefinitions[0]!);
// @ts-expect-error governed source references are readonly
version.sourceReferenceIds.push(version.sourceReferenceIds[0]!);
// @ts-expect-error selection state is readonly
selection.state = selection.state;
// @ts-expect-error ambiguity candidate versions are readonly
selection.candidateVersions.push('rewrite');
// @ts-expect-error selected version reference is readonly
selection.selected = null;
