# Export And Lint

## Preferred export helper

Use the bundled helper before reaching for raw draw.io CLI flags:

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

The helper:

- locates the draw.io CLI on Windows, macOS, and Linux
- embeds XML in `png`, `svg`, and `pdf`
- defaults PNG export to transparent 2x output
- supports `--delete-source` only when the user explicitly wants embedded-only output

## Output formats

| Format | Embedded XML | Typical use |
|--------|--------------|-------------|
| `.drawio` | n/a | Editable source |
| `png` | Yes | Docs, slides, chat attachments |
| `svg` | Yes | Docs, review, lint input |
| `pdf` | Yes | Review or print |
| `jpg` | No | Lossy fallback |

## SVG linting

Run lint after SVG export:

```bash
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/border-overlap/border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/large-frame-border-overlap/large-frame-border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/shape-border-overlap/shape-border-overlap.drawio.svg
```

Current checks:

- `edge-edge`
- `edge-rect-border` for lines that run along or visibly overlap a box or large frame border
- `edge-shape-border` for lines that run along supported non-rect shape borders such as `document`, `hexagon`, `parallelogram`, and `trapezoid`
- `edge-rect`
- `rect-shape-border` for box or frame borders that run along those supported non-rect shape borders
- `text-overflow(width)`
- `text-overflow(height)`

The repository includes `fixtures/border-overlap/...`, `fixtures/large-frame-border-overlap/...`, `fixtures/shape-border-overlap/...`, and `fixtures/shape-text-overflow/...` so you can regression-test box borders, large section frames, supported non-rect shape borders, and shape-aware text fit separately.

## Practical review rule

Lint helps, but it does not replace visual inspection. Always open the final PNG, SVG, or PDF once routing and labels settle, especially when a `document`, `hexagon`, `parallelogram`, or `trapezoid` sits close to arrows or outer frames.

If your diagram uses swimlanes, outer rounded sections, or other large frames, treat unexpected `edge-rect-border`, `edge-shape-border`, or `rect-shape-border` hits as routing bugs unless the border contact is intentional.
