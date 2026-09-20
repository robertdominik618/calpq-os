import assert from 'node:assert/strict';
import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

export const manifest = Object.freeze([
  'm05-s01-multi-channel-intake.test.ts',
  'm05-s02-original-archive.test.ts',
  'm05-s03-derived-extraction.test.ts',
  'm05-s04-extraction-review.test.ts',
  'm05-s05-security-quarantine.test.ts',
  'm05-s06-trust-registry.test.ts',
  'm05-s07-verification-route-registry.test.ts',
  'm05-s08-human-review.test.ts',
  'm05-s09-archive-lifecycle.test.ts',
  'm05-s10-integration.test.ts',
].map(file => `packages/application/test/${file}`));

export function validateManifest(files) {
  assert(Array.isArray(files) && files.length > 0, 'Empty runtime manifest');
  assert(files.every(file => typeof file === 'string' && /^packages\/application\/test\/m05-s\d{2}-[a-z-]+\.test\.ts$/.test(file)), 'Unexpected runtime path');
  assert.equal(new Set(files).size, files.length, 'Duplicate runtime suite execution');
}
export function validateTap(tap, ids) {
  assert(ids.length > 0 && new Set(ids).size === ids.length, 'Expected test identities must be unique and nonempty');
  const counts = {};
  for (const key of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const values = [...tap.matchAll(new RegExp(`^# ${key} (\\d+)$`, 'gm'))];
    assert.equal(values.length, 1, `Missing or ambiguous TAP ${key} summary`);
    counts[key] = Number(values[0][1]);
  }
  assert.equal(counts.tests, ids.length, 'TAP count differs from declared scenario identities');
  assert.equal(counts.pass, ids.length, 'Not every declared scenario passed');
  for (const key of ['fail', 'cancelled', 'skipped', 'todo']) assert.equal(counts[key], 0, `Nonzero TAP ${key}`);
  const executed = [...tap.matchAll(/^ok \d+ - (M05S\d{2}-\d{2})\b/gm)].map(match => match[1]).sort();
  assert.deepEqual(executed, [...ids].sort(), 'Executed identities differ from declared scenarios');
  return Object.freeze(counts);
}
function git(...args) { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
export function main() {
  process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
  validateManifest(manifest);
  assert.equal(manifest.length, 10);
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'Runtime evidence requires a clean tracked checkout');
  const head = git('rev-parse', 'HEAD'), tree = git('rev-parse', 'HEAD^{tree}');
  const records = [];
  let failed = false;
  console.log(`M05 RUNTIME LEDGER START head=${head} tree=${tree} node=${process.version}`);
  for (const [index, file] of manifest.entries()) {
    const source = readFileSync(file, 'utf8');
    const prefix = `M05S${String(index + 1).padStart(2, '0')}`;
    const ids = [...source.matchAll(new RegExp(`^test\\(['\"](${prefix}-\\d{2})\\b`, 'gm'))].map(match => match[1]);
    assert(ids.length > 0, `No mandatory scenarios in ${file}`);
    assert(!/\btest\.(only|skip|todo)\s*\(/.test(source), `Disabled/exclusive scenario in ${file}`);
    console.log(`[${index + 1}/10] RUN ${prefix} ${ids.length} scenarios (${file})`);
    const started = performance.now();
    const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], {
      encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024,
    });
    const elapsedMs = Math.round(performance.now() - started);
    try {
      if (result.error) throw result.error;
      assert.equal(result.status, 0, `${prefix} exited unsuccessfully`);
      const counts = validateTap(result.stdout, ids);
      records.push({ suite: prefix, file, status: 'PASS', ids, ...counts, elapsedMs });
      console.log(`[${index + 1}/10] PASS ${prefix} ${counts.pass}/${counts.tests} (${elapsedMs} ms)`);
    } catch (error) {
      failed = true;
      records.push({ suite: prefix, file, status: 'FAIL', expected: ids.length, elapsedMs, error: String(error) });
      console.error(`[${index + 1}/10] FAIL ${prefix}\n${String(result.stdout ?? '').slice(-16000)}\n${String(result.stderr ?? '').slice(-4000)}\n${error}`);
    }
  }
  assert.equal(git('rev-parse', 'HEAD'), head, 'Checkout moved during evidence');
  assert.equal(git('rev-parse', 'HEAD^{tree}'), tree, 'Tree moved during evidence');
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'Tests changed tracked files');
  const ledger = { schema: 'calpq.m05.runtime-ledger.v1', head, tree, node: process.version,
    suiteCount: records.length, passedSuites: records.filter(record => record.status === 'PASS').length,
    passedTests: records.reduce((sum, record) => sum + (record.pass ?? 0), 0),
    status: failed ? 'FAIL' : 'PASS', scope: 'S01-S10 runtime composition; standalone shell guards and full PR matrix remain required', records };
  console.log(`M05_RUNTIME_LEDGER=${JSON.stringify(ledger)}`);
  if (process.env.RUNNER_TEMP) writeFileSync(join(process.env.RUNNER_TEMP, 'm05-runtime-ledger.json'), JSON.stringify(ledger, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `## M05 S01–S10 runtime ledger\n\nHead: \`${head}\`\n\n${ledger.passedSuites}/${ledger.suiteCount} suites; ${ledger.passedTests} passed scenarios. Status: **${ledger.status}**.\n\n| Suite | Status | Tests | Runtime (ms) |\n|---|---|---:|---:|\n` + records.map(record => `| ${record.suite} | ${record.status} | ${record.pass ?? 0} | ${record.elapsedMs} |`).join('\n') + '\n\nStandalone guards and full current-head PR workflow matrix are separate required evidence.\n');
  if (failed) process.exitCode = 1;
  return ledger;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
