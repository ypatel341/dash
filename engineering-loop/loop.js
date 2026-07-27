require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');
const Anthropic = require('@anthropic-ai/sdk');

const TARGET_DIR = path.join(__dirname, 'target');
const SOURCE_FILE = path.join(TARGET_DIR, 'calculate.js');
const TEST_FILE = path.join(TARGET_DIR, 'calculate.test.js');
const MAX_ITERATIONS = 5;
const TIMEOUT_MS = 60_000;
const MODEL = 'claude-sonnet-5';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function resolveJestBin() {
  const pkgPath = require.resolve('jest/package.json', { paths: [__dirname] });
  const pkg = require(pkgPath);
  return path.join(path.dirname(pkgPath), pkg.bin);
}

function runTests() {
  const jestBin = resolveJestBin();
  const result = spawnSync(
    process.execPath,
    [jestBin, '--colors=false', 'calculate.test.js'],
    { cwd: TARGET_DIR, encoding: 'utf8', timeout: 20_000, maxBuffer: 10 * 1024 * 1024 }
  );

  if (result.error) {
    return { passed: false, output: `spawn error: ${result.error.message}` };
  }
  const timedOut = result.status === null && result.signal !== null;
  if (timedOut) {
    return { passed: false, output: 'jest run timed out after 20s' };
  }
  return { passed: result.status === 0, output: (result.stdout || '') + (result.stderr || '') };
}

// Jest reports every failing assertion in the file at once, not just the first —
// `--bail` only stops after N failing *suites*, which doesn't help within a single
// file. To force the loop through more than one round instead of letting the model
// see (and possibly fix) every bug in one shot, we only ever forward the first
// failure block to the actor.
function firstFailureBlock(output) {
  const parts = output.split(/\n {2}● /);
  if (parts.length < 2) return output;
  return `  ● ${parts[1]}`.trim();
}

function extractCode(responseText) {
  const fenceRe = /```(?:javascript|js)?\r?\n([\s\S]*?)```/;
  const match = responseText.match(fenceRe);
  return (match ? match[1] : responseText).trim();
}

function isValidCandidate(code) {
  if (!code || code.length < 20) return false;
  try {
    new vm.Script(code, { filename: 'candidate.js' });
  } catch {
    return false;
  }
  return (
    code.includes('module.exports') &&
    code.includes('calculateDiscountedPrice') &&
    code.includes('calculateAverage')
  );
}

async function getPatch(sourceCode, testCode, failureOutput) {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    timeout: 15_000,
    messages: [
      {
        role: 'user',
        content:
          'The source file below has exactly one currently-failing jest test, shown at the ' +
          'bottom. Fix ONLY the specific bug causing that one failing test. Leave every other ' +
          'function byte-for-byte identical, even if it looks suspicious to you — it is covered ' +
          'by its own passing test and is out of scope for this fix. Return the COMPLETE ' +
          'corrected contents of the source file as a single fenced javascript code block, ' +
          'with no prose before or after the code block.\n\n' +
          `--- calculate.js ---\n${sourceCode}\n\n` +
          `--- calculate.test.js ---\n${testCode}\n\n` +
          `--- the one failing test ---\n${failureOutput}\n`,
      },
    ],
  });
  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return extractCode(text);
}

function writeSourceAtomic(code) {
  const tmpFile = `${SOURCE_FILE}.tmp`;
  fs.writeFileSync(tmpFile, code);
  fs.renameSync(tmpFile, SOURCE_FILE);
}

async function main() {
  const startTime = Date.now();

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    console.log(`\n--- iteration ${iteration} ---`);

    console.log('[VERIFY] running jest...');
    const { passed, output } = runTests();

    if (passed) {
      console.log('[DECIDE] all tests pass. stopping: SUCCESS.');
      process.exit(0);
    }

    console.log('[VERIFY] failure:');
    console.log(output.split('\n').slice(0, 20).join('\n'));

    const elapsed = Date.now() - startTime;
    if (elapsed > TIMEOUT_MS) {
      console.log(`[DECIDE] ${elapsed}ms elapsed, exceeds ${TIMEOUT_MS}ms timeout. stopping: BOUNDED FAILURE.`);
      process.exit(1);
    }

    console.log('[DECIDE] test failed, under budget. continuing to ACT.');
    console.log('[ACT] asking Claude for a patch...');

    let candidate;
    try {
      const sourceCode = fs.readFileSync(SOURCE_FILE, 'utf8');
      const testCode = fs.readFileSync(TEST_FILE, 'utf8');
      candidate = await getPatch(sourceCode, testCode, firstFailureBlock(output));
    } catch (err) {
      console.log(`[ACT] API call failed (${err.message}). treating as a failed round.`);
      continue;
    }

    if (!isValidCandidate(candidate)) {
      console.log('[ACT] model output failed validation, discarding. treating as a failed round.');
      continue;
    }

    writeSourceAtomic(candidate);
    console.log('[ACT] patch applied.');
  }

  const elapsed = Date.now() - startTime;
  console.log(`\n[DECIDE] max iterations (${MAX_ITERATIONS}) reached after ${elapsed}ms. stopping: BOUNDED FAILURE.`);
  process.exit(1);
}

main();
