# Workflow

## Recommended Order

1. Edit the native `.drawio` file.
2. Keep the `.drawio` file in the repository as the editable source.
3. Export only the artifact formats the user needs.
4. Run SVG lint when the diagram has meaningful routing or text density.
5. Visually inspect the result before you ship it.

## Export Commands

### PNG

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
```

### SVG

```bash
node scripts/export-drawio.mjs architecture.drawio --format svg
```

### PDF

```bash
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

## When To Run Lint

Run lint after SVG export when:

- arrows route around multiple boxes
- labels are long or mixed-language
- boxes are packed tightly
- you need repeatable QA in CI

## Lint Command

```bash
node scripts/check-drawio-svg-overlaps.mjs architecture.drawio.svg
```

## What The Linter Reports

- `edge-edge`
- `edge-rect-border`
- `edge-rect`
- `text-overflow(width)`
- `text-overflow(height)`

## AWS Icon Search

```bash
uv run python scripts/find_aws_icon.py eventbridge
```

Use the helper when diagram work depends on current AWS icon naming and you need a quick repository-local lookup.
