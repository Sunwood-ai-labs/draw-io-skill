import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/text-emphasis/text-emphasis.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.status === 0) {
  console.error('[verify-text-emphasis-fixture] expected the checker to report a text-emphasis finding, but it passed');
  process.exitCode = 1;
} else if (!output.includes('text-emphasis:')) {
  console.error('[verify-text-emphasis-fixture] expected a text-emphasis finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('dark-flat-card')) {
  console.error('[verify-text-emphasis-fixture] expected dark-flat-card to be mentioned in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-text-emphasis-fixture] detected text emphasis issues as expected');
}
