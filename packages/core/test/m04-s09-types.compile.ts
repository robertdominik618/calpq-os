import {
  HistoricalCatalogQueryId,
  HistoricalCatalogVersionQuery,
  HistoricalReplayId,
  HistoricalReplayState,
  HistoricalSnapshotReplay,
  HistoricalVersionQueryState,
  type HistoricalReplayStateCode,
  type HistoricalVersionQueryStateCode,
} from '../src/index.ts';

const queryId = HistoricalCatalogQueryId.from('018f22e2-79b0-7cc3-98c4-dc0c0c0b9901');
const replayId = HistoricalReplayId.from('018f22e2-79b0-7cc3-98c4-dc0c0c0b9902');
void replayId;

const queryState: HistoricalVersionQueryStateCode = HistoricalVersionQueryState.NOT_YET_KNOWN;
const replayState: HistoricalReplayStateCode = HistoricalReplayState.FULL_SNAPSHOT_REPLAYED;
void queryState;
void replayState;

declare const query: HistoricalCatalogVersionQuery;
declare const replay: HistoricalSnapshotReplay;

// @ts-expect-error historical query candidate version list is immutable
query.candidateVersions.push('new-version');

// @ts-expect-error historical replay candidate IDs are immutable
replay.candidateGapEvaluationIds.push('new-gap');

// @ts-expect-error query selection cannot be overwritten
query.selected = null;

// @ts-expect-error uncontrolled historical state is not allowed
const invalidState: HistoricalVersionQueryStateCode = 'USE_CURRENT_VERSION';
void invalidState;

// @ts-expect-error semantic IDs remain distinct
const invalidReplayId: HistoricalReplayId = queryId;
void invalidReplayId;
