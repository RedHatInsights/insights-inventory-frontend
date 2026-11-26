#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const LAST_RUN_PATH = path.join('test-results', '.last-run.json');
const CTRF_PATH = path.join('playwright-ctrf', 'playwright-ctrf.json');

// An empty --last-failed set makes Playwright throw "No tests found" and fail
// the job. Rerun only when the first step recorded failed test ids. Otherwise
// pass when the CTRF summary shows the suite ran with zero failures, and fail
// when the first step never produced test results.
function decide(lastRun, summary) {
  const failedTests = Array.isArray(lastRun?.failedTests)
    ? lastRun.failedTests
    : [];
  if (failedTests.length > 0) {
    return 'rerun';
  }

  const status = lastRun?.status ?? 'missing';
  const tests = Number(summary?.tests ?? 0);
  const failed = Number(summary?.failed ?? 0);
  const finished = status !== 'timedout' && status !== 'interrupted';

  if (tests > 0 && failed === 0 && finished) {
    return 'skip-pass';
  }

  return 'skip-fail';
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  }
}

function main() {
  const playwrightArgs = process.argv.slice(2);
  const lastRun = readJson(LAST_RUN_PATH);
  const summary = readJson(CTRF_PATH)?.results?.summary ?? null;
  const action = decide(lastRun, summary);
  const status = lastRun?.status ?? 'missing';
  const failedCount = Array.isArray(lastRun?.failedTests)
    ? lastRun.failedTests.length
    : 0;
  const tests = summary?.tests ?? 0;
  const failed = summary?.failed ?? 0;

  if (action === 'rerun') {
    console.log(
      `Rerunning ${failedCount} failed test(s) and reporting to Currents.`,
    );
    setOutput('reran', 'true');
    const result = spawnSync(
      'npx',
      [
        'playwright',
        'test',
        ...playwrightArgs,
        '--last-failed',
        '--pass-with-no-tests',
      ],
      { stdio: 'inherit', env: process.env },
    );
    if (result.error) {
      console.error(result.error.message);
      process.exit(1);
    }
    process.exit(result.status ?? 1);
  }

  setOutput('reran', 'false');

  if (action === 'skip-pass') {
    console.log(
      `First Playwright step recorded no failed tests (last-run status: ${status}). CTRF summary has ${tests} test(s) and ${failed} failure(s). Skipping --last-failed.`,
    );
    process.exit(0);
  }

  console.error(
    `First Playwright step failed without failed tests to rerun (last-run status: ${status}). CTRF summary: tests=${tests}, failed=${failed}. See the "Run front-end Playwright tests" step for the global setup, worker, or timeout error.`,
  );
  process.exit(1);
}

module.exports = { decide };

if (require.main === module) {
  main();
}
