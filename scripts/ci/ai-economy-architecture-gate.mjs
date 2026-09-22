import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const json = (relative) => JSON.parse(read(relative));
const fail = (message) => { throw new Error(`AI ECONOMY ARCHITECTURE GATE: ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const requiredDocs = [
  "docs/architecture/CALPQ_AI_ECONOMY_COST_GOVERNANCE.md",
  "docs/adr/ADR-0006-ai-economy-cost-governance.md",
  "docs/contracts/AI_TASK_GATEWAY_PROVIDER_ABSTRACTION.md",
  "docs/contracts/AI_COST_BUDGET_RESERVATION_SETTLEMENT.md",
  "docs/contracts/AI_USAGE_LEDGER_RATE_CARD.md",
  "docs/contracts/AI_ROUTING_CACHE_EVALUATION.md",
  "docs/contracts/AI_OPERATIONAL_CONTROLS_FINOPS.md",
  "docs/contracts/ai/AI_TASK_CONTRACT.schema.json",
  "docs/contracts/ai/PROVIDER_RATE_CARD.schema.json",
  "docs/contracts/ai/AI_USAGE_RECORD.schema.json",
  "docs/planning/AI_ECONOMY_COST_GOVERNANCE_TRACEABILITY.md"
];

const requiredTokens = new Map([
  ["docs/architecture/CALPQ_AI_ECONOMY_COST_GOVERNANCE.md", [
    "UNFUNDED EXTERNAL AI SPEND = 0",
    "DETERMINISTIC BEFORE GENERATIVE AI",
    "DENY_BEFORE_PROVIDER_CALL",
    "AI Cost Attribution Rate = 100%",
    "Budget Reservation",
    "Provider Rate Card Registry",
    "Kill switches"
  ]],
  ["docs/contracts/AI_TASK_GATEWAY_PROVIDER_ABSTRACTION.md", ["AI Task Contract", "DENY_BEFORE_PROVIDER_CALL", "UNLIMITED"]],
  ["docs/contracts/AI_COST_BUDGET_RESERVATION_SETTLEMENT.md", ["PROJECT_PROMOTIONAL_BUDGET", "Subscription/premium never means unlimited external AI", "MINIMUM_CONTRIBUTION_MARGIN"]],
  ["docs/contracts/AI_USAGE_LEDGER_RATE_CARD.md", ["unfundedCost = 0", "AI Cost Attribution Rate = 100%", "never hard-coded"]],
  ["docs/contracts/AI_ROUTING_CACHE_EVALUATION.md", ["PUBLIC_SHARED", "PRIVATE_USER", "Single-flight", "RAG/context minimization"]],
  ["docs/contracts/AI_OPERATIONAL_CONTROLS_FINOPS.md", ["Spend anomaly guard", "all external AI", "Unfunded External AI Spend = 0"]]
]);

const fundingSources = new Set(["USER", "ORGANIZATION", "PARTNER", "PROJECT_PROMOTIONAL_BUDGET"]);

function containsUnlimited(value) {
  if (typeof value === "string") return value.toUpperCase() === "UNLIMITED";
  if (Array.isArray(value)) return value.some(containsUnlimited);
  if (value && typeof value === "object") return Object.values(value).some(containsUnlimited);
  return false;
}

export function validateTask(task) {
  if (!task || typeof task !== "object") return "INVALID_TASK";
  if (containsUnlimited(task)) return "UNLIMITED_BOUND";
  if (task.externalExecution === true) {
    if (!fundingSources.has(task.fundingSource) || typeof task.payerId !== "string" || task.payerId.length === 0) return "NO_PAYER";
    if (!task.maxCost || typeof task.maxCost.amount !== "number" || !Number.isFinite(task.maxCost.amount) || task.maxCost.amount <= 0) return "NO_MAX_COST";
    if (task.budgetReservationRequired !== true) return "NO_BUDGET_RESERVATION";
  }
  const finiteIntegerBounds = ["maxInputUnits", "maxOutputUnits", "maxModelCalls", "maxToolCalls", "maxRetries"];
  for (const key of finiteIntegerBounds) {
    if (!Number.isInteger(task[key]) || task[key] < 0) return "INVALID_BOUND";
  }
  if (!Number.isInteger(task.maxDurationMs) || task.maxDurationMs <= 0) return "INVALID_BOUND";
  if (task.maxAgentSteps != null && (!Number.isInteger(task.maxAgentSteps) || task.maxAgentSteps < 0)) return "INVALID_BOUND";
  if (task.privacyScope !== "PUBLIC" && task.cacheScope === "PUBLIC_SHARED") return "PRIVATE_DATA_PUBLIC_CACHE";
  return null;
}

export function authorizeExternal(task, state) {
  const taskError = validateTask(task);
  if (taskError) return taskError;
  if (task.externalExecution !== true) return null;
  if (state.killSwitchActive) return "KILL_SWITCH_ACTIVE";
  if (state.spendAnomaly) return "SPEND_ANOMALY";
  if (!state.rateCardPresent) return "RATE_CARD_MISSING";
  if (!state.reservationCreated) return "NO_BUDGET_RESERVATION";
  if (typeof state.availableBalance !== "number" || state.availableBalance < task.maxCost.amount) return "INSUFFICIENT_BALANCE";
  if (state.actualCost > task.maxCost.amount) return "MAX_COST_EXCEEDED";
  if (state.modelCalls > task.maxModelCalls) return "MAX_MODEL_CALLS_EXCEEDED";
  if (state.toolCalls > task.maxToolCalls) return "MAX_TOOL_CALLS_EXCEEDED";
  if (state.retries > task.maxRetries) return "RETRY_LIMIT_EXCEEDED";
  if (task.maxAgentSteps != null && state.agentSteps > task.maxAgentSteps) return "AGENT_STEP_LIMIT_EXCEEDED";
  return null;
}

export function validateUsageRecord(record) {
  if (!record || typeof record !== "object") return "INVALID_USAGE";
  if (record.unfundedCost !== 0) return "UNFUNDED_COST";
  if (typeof record.payerId !== "string" || record.payerId.length === 0) return "NO_PAYER";
  if (!fundingSources.has(record.fundingSource)) return "NO_PAYER";
  if (typeof record.budgetReservationId !== "string" || record.budgetReservationId.length === 0) return "NO_BUDGET_RESERVATION";
  return null;
}

function defaultState(task) {
  return {
    rateCardPresent: true,
    reservationCreated: true,
    availableBalance: task.maxCost.amount,
    actualCost: task.maxCost.amount / 2,
    modelCalls: Math.min(1, task.maxModelCalls),
    toolCalls: 0,
    retries: 0,
    agentSteps: 0,
    killSwitchActive: false,
    spendAnomaly: false
  };
}

export function run() {
  let checks = 0;
  for (const file of requiredDocs) {
    assert(fs.existsSync(path.join(root, file)), `missing required artifact: ${file}`);
    checks++;
  }

  for (const [file, tokens] of requiredTokens) {
    const content = read(file);
    for (const token of tokens) {
      assert(content.includes(token), `missing invariant "${token}" in ${file}`);
      checks++;
    }
  }

  const taskSchema = json("docs/contracts/ai/AI_TASK_CONTRACT.schema.json");
  const usageSchema = json("docs/contracts/ai/AI_USAGE_RECORD.schema.json");
  const rateSchema = json("docs/contracts/ai/PROVIDER_RATE_CARD.schema.json");
  assert(taskSchema?.properties?.maxCost, "AI task schema lacks maxCost");
  assert(taskSchema?.properties?.fundingSource, "AI task schema lacks fundingSource");
  assert(usageSchema?.properties?.unfundedCost?.const === 0, "usage schema must constrain unfundedCost to zero");
  assert(rateSchema?.properties?.prices?.properties?.input, "rate card schema lacks input price");
  checks += 4;

  const validTask = json("tests/fixtures/ai-economy/valid-user-funded-task.json");
  assert(validateTask(validTask) === null, "valid funded task rejected");
  assert(authorizeExternal(validTask, defaultState(validTask)) === null, "valid funded task not authorized by architecture fixture");
  checks += 2;

  const fixtureExpectations = [
    ["tests/fixtures/ai-economy/invalid-no-payer-task.json", "NO_PAYER"],
    ["tests/fixtures/ai-economy/invalid-no-max-cost-task.json", "NO_MAX_COST"],
    ["tests/fixtures/ai-economy/invalid-no-reservation-task.json", "NO_BUDGET_RESERVATION"],
    ["tests/fixtures/ai-economy/invalid-private-public-cache-task.json", "PRIVATE_DATA_PUBLIC_CACHE"]
  ];
  for (const [file, expected] of fixtureExpectations) {
    const fixture = json(file);
    assert(fixture.expectedFailure === expected, `fixture expectation mismatch: ${file}`);
    assert(validateTask(fixture) === expected, `negative fixture did not fail closed: ${file}`);
    checks += 2;
  }

  const stateCases = [
    ["INSUFFICIENT_BALANCE", { availableBalance: validTask.maxCost.amount - 0.01 }],
    ["RATE_CARD_MISSING", { rateCardPresent: false }],
    ["MAX_COST_EXCEEDED", { actualCost: validTask.maxCost.amount + 0.01 }],
    ["MAX_MODEL_CALLS_EXCEEDED", { modelCalls: validTask.maxModelCalls + 1 }],
    ["MAX_TOOL_CALLS_EXCEEDED", { toolCalls: validTask.maxToolCalls + 1 }],
    ["RETRY_LIMIT_EXCEEDED", { retries: validTask.maxRetries + 1 }],
    ["KILL_SWITCH_ACTIVE", { killSwitchActive: true }],
    ["SPEND_ANOMALY", { spendAnomaly: true }]
  ];
  for (const [expected, patch] of stateCases) {
    const actual = authorizeExternal(validTask, { ...defaultState(validTask), ...patch });
    assert(actual === expected, `expected ${expected}, got ${actual}`);
    checks++;
  }

  const agentTask = { ...validTask, maxAgentSteps: 2 };
  const agentState = { ...defaultState(agentTask), agentSteps: 3 };
  assert(authorizeExternal(agentTask, agentState) === "AGENT_STEP_LIMIT_EXCEEDED", "agent step limit must stop");
  checks++;

  const validUsage = json("tests/fixtures/ai-economy/valid-usage-record.json");
  const invalidUsage = json("tests/fixtures/ai-economy/invalid-unfunded-usage-record.json");
  assert(validateUsageRecord(validUsage) === null, "valid usage record rejected");
  assert(invalidUsage.expectedFailure === "UNFUNDED_COST", "invalid usage fixture expectation mismatch");
  assert(validateUsageRecord(invalidUsage) === "UNFUNDED_COST", "unfunded usage must be invalid");
  checks += 3;

  const rate = json("tests/fixtures/ai-economy/valid-provider-rate-card.json");
  for (const key of ["rateCardId", "version", "provider", "model", "currency", "validFrom", "verifiedAt", "source", "prices"]) {
    assert(rate[key] != null, `rate-card fixture missing ${key}`);
    checks++;
  }
  assert(rate.prices.input >= 0 && rate.prices.output >= 0, "rate-card prices must be non-negative");
  checks++;

  const architecture = read("docs/architecture/CALPQ_AI_ECONOMY_COST_GOVERNANCE.md");
  const forbiddenDirect = ["FEATURE\n   ↓\nPROVIDER", "unlimited external AI"];
  for (const token of forbiddenDirect) {
    assert(!architecture.includes(token), `forbidden architecture pattern present: ${token}`);
    checks++;
  }

  process.stdout.write(`AI ECONOMY ARCHITECTURE GATE: PASS / ${checks} CHECKS / 14 NEGATIVE FAIL-CLOSED CASES\n`);
  return checks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    run();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
