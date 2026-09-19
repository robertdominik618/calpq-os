import type {
  CatalogProvenanceTarget,
  CatalogProvenanceTargetKind,
  CatalogSourceSnapshot,
  SourceReference,
} from '../src/index.ts';
import { CatalogProvenanceBinding } from '../src/index.ts';

declare const binding: CatalogProvenanceBinding;

const kind: CatalogProvenanceTargetKind = binding.targetKind;
const target: CatalogProvenanceTarget = binding.target;
const sources: readonly SourceReference[] = binding.sourceReferences;
const required = binding.requiredSourceIds;
const verified: boolean = binding.allSourcesVerified();
const review: boolean = binding.requiresSourceReview();
const json: Record<string, unknown> = binding.toJSON();

void kind;
void target;
void sources;
void required;
void verified;
void review;
void json;

declare const snapshot: CatalogSourceSnapshot;
const sourceVersion: string = snapshot.version;
void sourceVersion;

// @ts-expect-error target kind is a controlled union.
const invalidKind: CatalogProvenanceTargetKind = 'UNKNOWN';
// @ts-expect-error binding root fields are readonly.
binding.targetId = 'rewritten';
// @ts-expect-error source collection is readonly.
binding.sourceReferences.push({} as SourceReference);
// @ts-expect-error required source identities are readonly.
binding.requiredSourceIds.length = 0;
