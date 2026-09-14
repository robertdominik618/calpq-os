# CALPQ M10 Execution Package — Intelligence Layer & Guided Decisions

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`

## Objective
Add AI-assisted guidance, simulation and search on top of deterministic CALPQ truth without granting models authority over governed evidence or decisions.

## Delivery slices
1. AI provider-neutral request/response boundary.
2. Retrieval over approved CALPQ read models and source references.
3. Next Best Action generation from deterministic eligible actions.
4. What-if simulator using governed hypothetical inputs and clearly isolated simulated outcomes.
5. Conversational guidance over Passport, gaps, lifecycle and regulatory impacts.
6. Explanation generation from stable reason/source/evidence codes.
7. Semantic/intent search over governed catalog and user projections.
8. Document-assistance workflows that output proposals, not verified facts.
9. Human-review support and reviewer summarization with provenance links.
10. M10 integration evidence for hallucination resistance, authority boundaries and fallback behavior.

## Ownership
M10 owns assistance, ranking, explanation, search and simulation UX/application logic. Deterministic Core/Application decisions remain authoritative.

## Definition of Done
- AI output is always distinguishable from authoritative CALPQ state;
- Next Best Action is constrained to valid governed actions;
- What-if results are explicitly hypothetical and never persisted as real decisions without governed transition;
- material explanations include source/reason references;
- provider outage degrades assistance, not domain truth;
- prompt/provider changes cannot silently alter stored legal conclusions.

## Stop conditions
Stop if AI self-verifies evidence, mutates eligibility/authorization, produces uncited material legal conclusions, bypasses human review policy, or simulation data contaminates real state.