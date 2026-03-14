<p align="center">
  <img src="./assets/draw-io-skill-penpen-header.webp" alt="Penpen header illustration for draw-io-skill" width="500">
</p>

<h1 align="center">draw-io-skill</h1>

<p align="center">
  <a href="./README.ja.md">Japanese</a> · <strong>English</strong>
</p>

<p align="center">
  <a href="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/github/license/Sunwood-ai-labs/draw-io-skill"></a>
  <img alt="Node" src="https://img.shields.io/badge/node-20%2B-339933">
  <img alt="draw.io" src="https://img.shields.io/badge/draw.io-CLI-orange">
</p>

<p align="center">
  A best-of-both-worlds draw.io skill for Codex, Claude Code, and agent workflows.
</p>

## Overview

`draw-io-skill` combines the strongest parts of three approaches into one reusable repository:

- native `.drawio` authoring and export flow for Claude Code style assistants
- practical XML editing and layout guidance for technical diagrams
- repository-ready SVG linting for overlap, box-border overlap, box penetration, and text overflow

The result is a single skill that helps agents create diagrams, refine them, export them, and catch the layout issues that draw.io itself does not detect.

## Best-Of Workflow

1. Generate or edit a native `.drawio` file.
2. Keep the source diagram as the editable truth for repository work.
3. Export with embedded XML using the bundled exporter when the user wants PNG, SVG, or PDF.
4. Export SVG and run lint when edge routing or label density matters.
5. Visually verify the final diagram even if lint passes.

This keeps the official Claude Code style flow, while preserving the day-to-day repository ergonomics and QA checks that teams need.

## What This Skill Includes

### 1. Native draw.io workflow

- generate and edit real mxGraphModel XML
- use `.drawio`, `.drawio.png`, `.drawio.svg`, and `.drawio.pdf` naming consistently
- keep the exported file editable through embedded XML where supported

### 2. Cross-platform export helper

Use the bundled exporter instead of remembering draw.io CLI flags:

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

The exporter:

- locates the draw.io CLI on Windows, macOS, or Linux
- uses embedded XML for `png`, `svg`, and `pdf`
- defaults to transparent 2x PNG export
- supports optional `--delete-source` cleanup when the user explicitly wants embedded-only output

### 3. SVG linting

The included [scripts/check-drawio-svg-overlaps.mjs](./scripts/check-drawio-svg-overlaps.mjs) checks:

- `edge-edge` crossings and collinear overlaps
- `edge-rect-border` when arrows run along or visibly overlap box borders
- `edge-rect` penetration where arrows travel through boxes
- `text-overflow(width)` and `text-overflow(height)` using the companion `.drawio`

Example:

```bash
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs architecture.drawio.svg
```

### 4. Layout and editing guidance

- spacing rules for boxes, edges, and containers
- Japanese text width guidance
- margin rules for grouped frames and swimlanes
- AWS icon search helpers and layout references

## Installation

### Codex

Clone the repository somewhere stable, then connect it into your Codex skills directory.

#### Windows junction example

```powershell
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git D:\Prj\draw-io-skill
cmd /c mklink /J C:\Users\YOUR_NAME\.codex\skills\draw-io D:\Prj\draw-io-skill
```

#### Unix symlink example

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/Prj/draw-io-skill
ln -s ~/Prj/draw-io-skill ~/.codex/skills/draw-io
```

### Claude Code

Clone the repository directly into a Claude Code skill folder or copy `SKILL.md` into one.

#### Global skill

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/.claude/skills/drawio
```

#### Per-project skill

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git .claude/skills/drawio
```

## Quick Commands

### Validate the bundled scripts

```bash
npm install
npm run check
```

### Export PNG with embedded XML

```bash
node scripts/export-drawio.mjs docs/architecture.drawio --format png
```

### Export SVG for review

```bash
node scripts/export-drawio.mjs docs/architecture.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs docs/architecture.drawio.svg
```

### Search AWS icons

```bash
uv run python scripts/find_aws_icon.py lambda
```

## Output Formats

| Format | Default output | Embedded XML | Notes |
|--------|----------------|--------------|-------|
| `.drawio` | source file | n/a | Native editable XML |
| `png` | `name.drawio.png` | Yes | Default export helper mode, transparent + 2x |
| `svg` | `name.drawio.svg` | Yes | Best format for linting and scalable docs |
| `pdf` | `name.drawio.pdf` | Yes | Good for print and review |
| `jpg` | `name.drawio.jpg` | No | Lossy fallback only |

## Repository Layout

```text
draw-io-skill/
├── README.md
├── README.ja.md
├── SKILL.md
├── LICENSE
├── assets/
│   └── draw-io-skill-hero.svg
├── fixtures/
│   └── basic/
│       ├── basic.drawio
│       └── basic.drawio.svg
├── references/
│   ├── aws-icons.md
│   └── layout-guidelines.md
└── scripts/
    ├── check-drawio-svg-overlaps.mjs
    ├── convert-drawio-to-png.sh
    ├── export-drawio.mjs
    └── find_aws_icon.py
```

## Included Guides

- [SKILL.md](./SKILL.md): the agent-facing skill instructions
- [references/layout-guidelines.md](./references/layout-guidelines.md): layout rules and spacing guidance
- [references/aws-icons.md](./references/aws-icons.md): AWS icon references

## References And Credits

This repository is built as a combined workflow:

- editing and layout guidance inspired by `softaworks/agent-toolkit`
- native Claude Code draw.io flow inspired by `jgraph/drawio-mcp`
- additional repository-oriented lint and export tooling added in this repository

Referenced repositories and sources:

- [softaworks/agent-toolkit - skills/draw-io/README.md](https://github.com/softaworks/agent-toolkit/blob/main/skills/draw-io/README.md)
- [jgraph/drawio-mcp - skill-cli/README.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/README.md)
- [jgraph/drawio-mcp - skill-cli/drawio/SKILL.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/drawio/SKILL.md)
- [draw.io Style Reference](https://www.drawio.com/doc/faq/drawio-style-reference.html)
- [draw.io mxfile XSD](https://www.drawio.com/assets/mxfile.xsd)

## License

[MIT](./LICENSE)
