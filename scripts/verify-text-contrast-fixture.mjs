import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/text-contrast/text-contrast.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
const contrastLines = output
  .split(/\r?\n/)
  .filter((line) => line.includes('text-contrast:'));
const expectedFailIds = [
  'low-contrast-card',
  'small-text-threshold-card',
  'inherited-low-contrast-label-text',
];
const expectedPassIds = [
  'large-text-threshold-card',
  'readable-card',
];

if (result.status === 0) {
  console.error('[verify-text-contrast-fixture] expected the checker to report a text-contrast finding, but it passed');
  process.exitCode = 1;
} else if (!output.includes('text-contrast:')) {
  console.error('[verify-text-contrast-fixture] expected a text-contrast finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (contrastLines.length !== expectedFailIds.length) {
  console.error(`[verify-text-contrast-fixture] expected ${expectedFailIds.length} text-contrast findings, got ${contrastLines.length}`);
  console.error(output.trim());
  process.exitCode = 1;
} else if (expectedFailIds.some((cellId) => !output.includes(cellId))) {
  console.error(`[verify-text-contrast-fixture] expected all failing IDs to be mentioned: ${expectedFailIds.join(', ')}`);
  console.error(output.trim());
  process.exitCode = 1;
} else if (expectedPassIds.some((cellId) => output.includes(cellId))) {
  console.error(`[verify-text-contrast-fixture] expected passing IDs to stay quiet: ${expectedPassIds.join(', ')}`);
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-text-contrast-fixture] detected text contrast issues as expected');
}
