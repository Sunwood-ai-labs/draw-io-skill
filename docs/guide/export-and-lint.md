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
- `edge-terminal` for final arrow runs that become too short after the last bend
- `edge-label` for routed lines that cross label text boxes
- `label-rect` for label text boxes that collide with another box or card
- `rect-shape-border` for box or frame borders that run along those supported non-rect shape borders
- `text-overflow(width)`
- `text-overflow(height)`

The repository includes `fixtures/border-overlap/...`, `fixtures/large-frame-border-overlap/...`, `fixtures/shape-border-overlap/...`, `fixtures/label-rect-overlap/...`, and `fixtures/shape-text-overflow/...` so you can regression-test box borders, large section frames, supported non-rect shape borders, label-box collisions, and shape-aware text fit separately. `edge-terminal`, `edge-label`, and `label-rect` are heuristic checks for the common exported-diagram failures where an arrowhead gets only a tiny final run, a route slices through label text, or a note card drifts up into a label.

## Lint Review Sample

For a repository-local verification sample, use:

- `assets/draw-io-skill-structure-shapes.drawio`
- `assets/draw-io-skill-structure-shapes.drawio.png`
- `assets/draw-io-skill-structure-shapes.drawio.svg`

This sample is meant for checking non-rect shape spacing, border contact, and post-lint visual review rather than for introducing the repository architecture.

If you also want a more presentation-oriented, icon-rich example, see [Showcase](./showcase.md).

## Practical review rule

Lint helps, but it does not replace visual inspection. Always open the final PNG, SVG, or PDF once routing and labels settle, especially when a `document`, `hexagon`, `parallelogram`, or `trapezoid` sits close to arrows or outer frames.

If your diagram uses swimlanes, outer rounded sections, or other large frames, treat unexpected `edge-rect-border`, `edge-shape-border`, or `rect-shape-border` hits as routing bugs unless the border contact is intentional.

When `edge-terminal` fires, move the last bend farther away from the target or add a longer straight run before the arrowhead. When `edge-label` fires, reroute the edge or move the label so the text keeps visible breathing room.

When `label-rect` fires, treat it as a layout collision: move the note/card/box or move the label so the overlap disappears instead of relying on layering.
