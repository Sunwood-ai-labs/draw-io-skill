import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/border-overlap/border-overlap.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.status === 0) {
  console.error('[verify-border-overlap-fixture] expected the checker to report a border overlap, but it passed');
  process.exitCode = 1;
} else if (!output.includes('edge-rect-border:')) {
  console.error('[verify-border-overlap-fixture] expected an edge-rect-border finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-border-overlap-fixture] detected edge-rect-border as expected');
}
