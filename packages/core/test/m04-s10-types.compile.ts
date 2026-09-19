import type {
  CatalogProvenanceBinding,
  CatalogQueryExplanationGraph,
  GapNavigatorEvaluation,
  HistoricalCatalogVersionQuery,
  HistoricalSnapshotReplay,
  QualificationPathDefinition,
} from '../src/index.ts';

declare const path: QualificationPathDefinition;
declare const binding: CatalogProvenanceBinding;
declare const gap: GapNavigatorEvaluation;
declare const graph: CatalogQueryExplanationGraph;
declare const query: HistoricalCatalogVersionQuery;
declare const replay: HistoricalSnapshotReplay;

// S10 proves that the integrated S01-S09 objects remain read-only at compile time.
// @ts-expect-error QualificationPathDefinition identity/version is immutable.
path.version = path.version;
// @ts-expect-error QualificationPathDefinition steps are readonly.
path.steps.push(path.steps[0]!);
// @ts-expect-error Catalog provenance source snapshots are readonly.
binding.sourceReferences.push(binding.sourceReferences[0]!);
// @ts-expect-error Gap evaluation items are readonly.
gap.items.push(gap.items[0]!);
// @ts-expect-error Gap evaluation state cannot be rewritten by integration code.
gap.complete = true;
// @ts-expect-error Explanation graph nodes are readonly.
graph.nodes.push(graph.nodes[0]!);
// @ts-expect-error Historical query selected result is immutable.
query.selected = null;
// @ts-expect-error Historical replay cannot replace stored gap snapshots.
replay.gapSnapshot = null;

void path;
void binding;
void gap;
void graph;
void query;
void replay;
