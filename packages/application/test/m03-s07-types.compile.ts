import type { SubjectReference } from '../../core/src/index.ts';
import {
  ApprovedSearchQueryModel,
  IntentSearchIntent,
  IntentSearchQuery,
  IntentSearchReadModel,
} from '../src/index.ts';

declare const subject: SubjectReference;
declare const models: readonly ApprovedSearchQueryModel[];

const query = IntentSearchQuery.create({
  subject,
  intent: IntentSearchIntent.CREDENTIAL,
  terms: ['credential-definition'],
  limit: 10,
});
const result = IntentSearchReadModel.search({ query, models });

const searchAuthority: false = result.searchAuthority;
const rankingAuthority: false = result.rankingAuthority;
const decisionAuthority: false = result.decisionAuthority;
const authorizationAuthority: false = result.authorizationAuthority;
const queryAuthority: false = query.searchAuthority;

void searchAuthority;
void rankingAuthority;
void decisionAuthority;
void authorizationAuthority;
void queryAuthority;

// @ts-expect-error search result root is immutable
result.resultCount = 999;

// @ts-expect-error search hits are immutable
result.hits.push(result.hits[0]!);

// @ts-expect-error query intent is immutable
query.intent = IntentSearchIntent.EVIDENCE;

// @ts-expect-error controlled intent required
IntentSearchQuery.create({ subject, intent: 'FREE_FORM', terms: ['x'] });

// @ts-expect-error approved query models required
IntentSearchReadModel.search({ query, models: [{}] });
