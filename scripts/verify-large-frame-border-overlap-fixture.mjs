import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/large-frame-border-overlap/large-frame-border-overlap.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.status === 0) {
  console.error('[verify-large-frame-border-overlap-fixture] expected the checker to report a frame border overlap, but it passed');
  process.exitCode = 1;
} else if (!output.includes('edge-rect-border:')) {
  console.error('[verify-large-frame-border-overlap-fixture] expected an edge-rect-border finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('frame-main')) {
  console.error('[verify-large-frame-border-overlap-fixture] expected the frame-main rect to be mentioned in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-large-frame-border-overlap-fixture] detected frame edge-rect-border as expected');
}
