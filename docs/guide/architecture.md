# Architecture

## Repository Surfaces

![Repository structure overview](../../assets/draw-io-skill-structure.drawio.png)

For Japanese-facing docs or slides, use the localized companion source at
`../../assets/draw-io-skill-structure.ja.drawio`
and the exported assets beside it.

## Core Files

| Path | Purpose |
|------|---------|
| `SKILL.md` | Agent-facing instructions for creating, exporting, and checking diagrams |
| `scripts/export-drawio.mjs` | Cross-platform wrapper around the draw.io CLI |
| `scripts/check-drawio-svg-overlaps.mjs` | SVG linting for overlaps, border contact, penetration, and text overflow |
| `scripts/find_aws_icon.py` | AWS icon search helper run through `uv` |
| `fixtures/basic` | Baseline fixture for a clean lint result |
| `fixtures/border-overlap` | Regression fixture for border-contact detection |
| `references/layout-guidelines.md` | Practical layout rules for boxes, spacing, and containers |
| `references/aws-icons.md` | AWS icon lookup reference material |

## Why The Repository Keeps Both Source And Export Concepts

- `.drawio` is the editable truth
- exported artifacts are disposable outputs
- embedded XML keeps exports useful without replacing the source file

That split makes it easier to version diagrams, regenerate outputs, and review changes without losing editability.

## QA Strategy

The repo uses three layers of QA:

1. script syntax checks for the JavaScript tools
2. fixture-based lint verification
3. documentation build validation for the public-facing site

This keeps the technical tooling and the human-facing documentation aligned in CI.
