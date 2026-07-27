# Engineering Loop

A minimal act → verify → decide loop: given a failing test, it asks Claude to patch the source, re-runs the test, and repeats until the suite passes or a bound is hit.

## Run it

```bash
cd engineering-loop
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY
npm start
```

To reset the seeded bugs and run again (e.g. to rehearse or re-demo):

```bash
npm run reset
npm start
```

## Design

The loop has three states per iteration: **VERIFY** (run `calculate.test.js` under jest with `--bail=1`, so only the first failing assertion is ever surfaced), **DECIDE** (stop successfully if jest exits 0; otherwise check the iteration count and elapsed time against the bounds before continuing), and **ACT** (send the current source, the test file, and the captured failure output to Claude, parse the returned code out of its fenced block, syntax- and sanity-check it, and atomically write it over the target file). The verification signal is jest's exit code plus its captured output — the next action is never guessed, it's driven by what the test run actually reported. There are two independent stop conditions: success (all tests green) and a bound (5 iterations or 60 seconds of wall-clock time, whichever comes first), plus a soft floor where a malformed model response or API error is logged and counted against the iteration budget instead of crashing the loop.
