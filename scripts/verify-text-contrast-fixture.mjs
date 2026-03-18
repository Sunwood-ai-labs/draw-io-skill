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

if (result.status === 0) {
  console.error('[verify-text-contrast-fixture] expected the checker to report a text-contrast finding, but it passed');
  process.exitCode = 1;
} else if (!output.includes('text-contrast:')) {
  console.error('[verify-text-contrast-fixture] expected a text-contrast finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('low-contrast-card')) {
  console.error('[verify-text-contrast-fixture] expected low-contrast-card to be mentioned in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-text-contrast-fixture] detected text contrast issues as expected');
}
