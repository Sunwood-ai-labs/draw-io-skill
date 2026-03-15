import { spawnSync } from 'node:child_process';

const result = spawnSync(
  process.execPath,
  ['scripts/check-drawio-svg-overlaps.mjs', 'fixtures/shape-text-overflow/shape-text-overflow.drawio.svg'],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

if (result.status === 0) {
  console.error('[verify-shape-text-overflow-fixture] expected the checker to report a text overflow, but it passed');
  process.exitCode = 1;
} else if (!output.includes('text-overflow(')) {
  console.error('[verify-shape-text-overflow-fixture] expected a text-overflow finding in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else if (!output.includes('doc-overflow') || !output.includes('hex-overflow') || !output.includes('trap-overflow')) {
  console.error('[verify-shape-text-overflow-fixture] expected doc-overflow, hex-overflow, and trap-overflow to be mentioned in the output');
  console.error(output.trim());
  process.exitCode = 1;
} else {
  console.log('[verify-shape-text-overflow-fixture] detected shape-aware text overflow as expected');
}
