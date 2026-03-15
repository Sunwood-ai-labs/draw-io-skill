import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/shape-border-overlap/shape-border-overlap.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.status === 0) {
  console.error('[verify-shape-border-overlap-fixture] expected the checker to report a shape border overlap, but it passed');
  process.exitCode = 1;
} else if (!output.includes('edge-shape-border:')) {
  console.error('[verify-shape-border-overlap-fixture] expected an edge-shape-border finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('rect-shape-border:')) {
  console.error('[verify-shape-border-overlap-fixture] expected a rect-shape-border finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('hex-main') || !output.includes('trap-main') || !output.includes('doc-main')) {
  console.error('[verify-shape-border-overlap-fixture] expected hex-main, trap-main, and doc-main to be mentioned in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-shape-border-overlap-fixture] detected non-rect shape border overlaps as expected');
}
