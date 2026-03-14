<p align="center">
  <img src="./assets/draw-io-skill-hero.svg" alt="draw-io-skill hero banner" width="960">
</p>

<h1 align="center">draw-io-skill</h1>

<p align="center">
  <strong>English</strong> · <a href="./README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="https://sunwood-ai-labs.github.io/draw-io-skill/"><img alt="Docs" src="https://img.shields.io/badge/docs-GitHub%20Pages-1f6feb"></a>
  <a href="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/github/license/Sunwood-ai-labs/draw-io-skill"></a>
  <img alt="Node" src="https://img.shields.io/badge/node-20%2B-339933">
  <img alt="draw.io" src="https://img.shields.io/badge/draw.io-native%20XML-f97316">
</p>

<p align="center">
  Native <code>.drawio</code> authoring, cross-platform export helpers, and SVG linting for Codex, Claude Code, and repository workflows.
</p>

## ✨ Overview

`draw-io-skill` packages the most useful parts of three diagram workflows into one repository:

- native `.drawio` editing for assistant-driven diagram generation
- export helpers for `png`, `svg`, `pdf`, and `jpg`
- SVG linting for crossings, border overlap, box penetration, and text overflow

It is meant to be practical in a real repository: editable source stays in `.drawio`, exports stay reproducible, and routing defects can be caught before a diagram lands in docs or a PR.

## 🚀 Quick Start

Install the local tooling, export a bundled fixture, then run the linter:

```bash
npm ci
npm run docs:install
npm run verify
node scripts/export-drawio.mjs fixtures/basic/basic.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
uv run python scripts/find_aws_icon.py lambda
```

If you only want to rebuild the documentation site:

```bash
npm run docs:install
npm run docs:build
```

## 🧭 Workflow

1. Create or update the native `.drawio` source.
2. Keep `.drawio` as the editable source of truth.
3. Export with embedded XML when you need `png`, `svg`, or `pdf`.
4. Run SVG lint when routing density or label fit matters.
5. Visually verify the final result before publishing.

<p align="center">
  <img src="./assets/draw-io-skill-structure.drawio.png" alt="Repository structure diagram for draw-io-skill" width="960">
</p>

## 🛠️ What You Get

### Native draw.io workflow

- real `mxGraphModel` XML editing
- consistent `.drawio.<format>` naming
- embedded XML exports where draw.io supports it

### Export helper

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

The helper locates the draw.io CLI across Windows, macOS, and Linux, defaults PNG export to transparent 2x output, and supports optional `--delete-source` cleanup only when requested explicitly.

### SVG linting

```bash
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/border-overlap/border-overlap.drawio.svg
```

The linter checks:

- `edge-edge`
- `edge-rect-border`
- `edge-rect`
- `text-overflow(width)`
- `text-overflow(height)`

## 📦 Installation

### Codex

```powershell
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git D:\Prj\draw-io-skill
cmd /c mklink /J C:\Users\YOUR_NAME\.codex\skills\draw-io D:\Prj\draw-io-skill
```

### Claude Code

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/.claude/skills/drawio
```

## 📚 Documentation

- [GitHub Pages documentation](https://sunwood-ai-labs.github.io/draw-io-skill/)
- [Getting started guide](./docs/guide/getting-started.md)
- [Workflow guide](./docs/guide/workflow.md)
- [Architecture guide](./docs/guide/architecture.md)
- [Export and lint guide](./docs/guide/export-and-lint.md)
- [Reference guide index](./docs/guide/reference-guides.md)
- [Troubleshooting guide](./docs/guide/troubleshooting.md)
- [English layout guidelines](./references/layout-guidelines.en.md)
- [English AWS icon guide](./references/aws-icons.en.md)
- [Agent skill instructions](./SKILL.md)

## 🗂️ Repository Layout

```text
draw-io-skill/
├── README.md
├── README.ja.md
├── SKILL.md
├── LICENSE
├── assets/
│   ├── draw-io-skill-hero.svg
│   ├── draw-io-skill-icon.svg
│   ├── draw-io-skill-penpen-header.webp
│   ├── draw-io-skill-structure.drawio
│   ├── draw-io-skill-structure.drawio.png
│   └── draw-io-skill-structure.drawio.svg
├── docs/
│   ├── .vitepress/
│   ├── guide/
│   ├── ja/
│   └── public/
├── fixtures/
│   ├── basic/
│   └── border-overlap/
├── references/
│   ├── aws-icons.en.md
│   ├── aws-icons.md
│   ├── layout-guidelines.en.md
│   └── layout-guidelines.md
└── scripts/
    ├── check-drawio-svg-overlaps.mjs
    ├── convert-drawio-to-png.sh
    ├── export-drawio.mjs
    ├── find_aws_icon.py
    └── verify-border-overlap-fixture.mjs
```

## 🙏 References And Credits

This repository blends ideas from:

- `softaworks/agent-toolkit` for layout and editing guidance
- `jgraph/drawio-mcp` for native draw.io assistant workflows
- repository-focused linting and export tooling added here

Referenced sources:

- [softaworks/agent-toolkit - skills/draw-io/README.md](https://github.com/softaworks/agent-toolkit/blob/main/skills/draw-io/README.md)
- [jgraph/drawio-mcp - skill-cli/README.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/README.md)
- [jgraph/drawio-mcp - skill-cli/drawio/SKILL.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/drawio/SKILL.md)
- [draw.io Style Reference](https://www.drawio.com/doc/faq/drawio-style-reference.html)
- [draw.io mxfile XSD](https://www.drawio.com/assets/mxfile.xsd)

## 📄 License

[MIT](./LICENSE)
