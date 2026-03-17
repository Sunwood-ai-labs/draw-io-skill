import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/label-rect-overlap/label-rect-overlap.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.status === 0) {
  console.error('[verify-label-rect-fixture] expected the checker to report a label-rect overlap, but it passed');
  process.exitCode = 1;
} else if (!output.includes('label-rect:')) {
  console.error('[verify-label-rect-fixture] expected a label-rect finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('repo-label') || !output.includes('note-box')) {
  console.error('[verify-label-rect-fixture] expected repo-label and note-box to be mentioned in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-label-rect-fixture] detected label-rect overlap as expected');
}
