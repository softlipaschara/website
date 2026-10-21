import fs from 'node:fs';
import path from 'node:path';
import { MEDIA_OUT, PLAN_PATH, ROOT, buildPlan } from './lib.mjs';

const result = buildPlan();
const portablePlan = {
  generatedAt: new Date().toISOString(),
  references: result.references,
  ready: result.ready,
  allowedMissing: result.allowedMissing,
  missing: result.missing,
  plan: result.plan.map((entry) => ({
    ...entry,
    source: entry.source ? path.relative(ROOT, entry.source) : undefined,
  })),
};

fs.writeFileSync(PLAN_PATH, `${JSON.stringify(portablePlan, null, 2)}\n`);

console.log(`References: ${result.references}`);
console.log(`Ready: ${result.ready}`);
console.log(`Allowed missing: ${result.allowedMissing}`);
console.log(`Unexpected missing: ${result.missing.length}`);

for (const entry of result.plan) {
  if (entry.status === 'allowed-missing') {
    console.log(`ALLOWED MISSING ${entry.key}`);
  }
}
for (const key of result.missing) {
  console.log(`MISSING ${key}`);
}

if (result.missing.length > 0) {
  process.exitCode = 1;
}

if (process.argv.includes('--check')) {
  const missingOutputs = [];
  for (const entry of result.plan) {
    if (entry.status !== 'ready') {
      continue;
    }
    for (const output of entry.outputs ?? []) {
      const outputPath = path.join(MEDIA_OUT, output.key);
      if (!fs.existsSync(outputPath)) {
        missingOutputs.push(output.key);
      }
    }
  }
  if (missingOutputs.length > 0) {
    console.log(`Missing outputs: ${missingOutputs.length}`);
    for (const key of missingOutputs) {
      console.log(`MISSING OUTPUT ${key}`);
    }
    process.exitCode = 1;
  } else {
    console.log('All planned outputs exist.');
  }
}
