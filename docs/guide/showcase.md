# Showcase

`draw-io-skill` ships a few sample diagrams with different jobs: repository onboarding, lint review, and icon-rich presentation. Treat them as copyable starting points when you want a diagram set to feel more like a showcase than an internal scratchpad.

## Repository Structure Overview

![Repository structure overview](../../assets/draw-io-skill-structure.drawio.png)

Use this sample when you want to explain how the repository is organized and how the main workflow surfaces connect.

- `assets/draw-io-skill-structure.drawio`
- `assets/draw-io-skill-structure.drawio.png`
- `assets/draw-io-skill-structure.drawio.svg`
- `assets/draw-io-skill-structure.ja.drawio`
- `assets/draw-io-skill-structure.ja.drawio.png`
- `assets/draw-io-skill-structure.ja.drawio.svg`

## Lint Review Sample

![Shape-aware lint review sample](../../assets/draw-io-skill-structure-shapes.drawio.png)

Use this sample when routing density, text fit, or non-rect shapes need extra care after SVG export.

- `document`, `hexagon`, `parallelogram`, and `trapezoid` labels stay easy to review
- arrow-to-shape and frame-to-shape contact is easier to catch visually after lint
- the sample pairs well with the fixture-based checks in `fixtures/shape-border-overlap` and `fixtures/shape-text-overflow`

Assets:

- `assets/draw-io-skill-structure-shapes.drawio`
- `assets/draw-io-skill-structure-shapes.drawio.png`
- `assets/draw-io-skill-structure-shapes.drawio.svg`

## Icon Block Sample

![Icon block showcase sample](../../assets/draw-io-skill-structure-icons.drawio.png)

This sample rebuilds the same flow with role icons embedded inside each block. It is useful when a diagram needs a more polished, presentation-friendly look without losing the editable `.drawio` source.

- `assets/draw-io-skill-structure-icons.drawio`
- `assets/draw-io-skill-structure-icons.drawio.png`
- `assets/draw-io-skill-structure-icons.drawio.svg`
- `assets/draw-io-skill-structure-icons.ja.drawio`
- `assets/draw-io-skill-structure-icons.ja.drawio.png`
- `assets/draw-io-skill-structure-icons.ja.drawio.svg`

## AWS-Ready Layout Pattern

The repository does not ship a single fixed AWS topology, but it does include the parts you need to build one quickly:

- `references/aws-icons.en.md`
- `scripts/find_aws_icon.py`
- `assets/draw-io-skill-structure-icons.drawio*`

Start from the icon block sample when you want a showcase-style architecture diagram. Replace the existing role icons or blocks with service groups such as `Route 53` and `CloudFront`, `API Gateway` and `Lambda`, or `S3` and `DynamoDB`, then run the normal export and SVG lint flow from [Export And Lint](./export-and-lint.md).
