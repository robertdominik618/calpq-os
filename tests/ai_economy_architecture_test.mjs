import { run } from "../scripts/ci/ai-economy-architecture-gate.mjs";

const checks = run();
if (!Number.isInteger(checks) || checks < 40) {
  throw new Error(`AI ECONOMY TEST: expected at least 40 checks, got ${checks}`);
}
process.stdout.write("AI ECONOMY TEST: PASS\n");
