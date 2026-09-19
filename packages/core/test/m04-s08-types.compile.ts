import {
  CatalogQueryExplanationGraph,
  ExplanationClassification,
  ExplanationGraphId,
  ExplanationNodeKind,
  type ExplanationClassificationCode,
  type ExplanationGraphNode,
} from '../src/index.ts';

const id = ExplanationGraphId.from('018f22e2-79b0-7cc3-98c4-dc0c0c0b8901');
void id;

const classification: ExplanationClassificationCode = ExplanationClassification.EXPLAINED;
void classification;

declare const graph: CatalogQueryExplanationGraph;
declare const node: ExplanationGraphNode;

// @ts-expect-error explanation graph nodes are immutable
graph.nodes.push(node);

// @ts-expect-error graph classification is derived and immutable
graph.classification = ExplanationClassification.REVIEW_REQUIRED;

// @ts-expect-error node references are immutable
node.referenceId = 'mutated';

// @ts-expect-error uncontrolled explanation classification is forbidden
const invalidClassification: ExplanationClassificationCode = 'AUTO_APPROVED';
void invalidClassification;

const sourceKind = ExplanationNodeKind.SOURCE;
void sourceKind;
