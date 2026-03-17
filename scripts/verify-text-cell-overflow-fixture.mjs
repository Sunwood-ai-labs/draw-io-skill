import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/text-cell-overflow/text-cell-overflow.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.status === 0) {
  console.error('[verify-text-cell-overflow-fixture] expected the checker to report a text overflow, but it passed');
  process.exitCode = 1;
} else if (!output.includes('text-overflow(')) {
  console.error('[verify-text-cell-overflow-fixture] expected a text-overflow finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('text-nowrap-overflow') || !output.includes('text-multiline-overflow')) {
  console.error('[verify-text-cell-overflow-fixture] expected text-nowrap-overflow and text-multiline-overflow to be mentioned in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-text-cell-overflow-fixture] detected text-cell overflow as expected');
}
