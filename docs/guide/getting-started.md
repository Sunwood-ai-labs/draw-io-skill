# Getting Started

## What this repository gives you

`draw-io-skill` is meant to be installed as a reusable skill repository and to stay useful inside a normal codebase.

- edit native `.drawio` files directly
- export diagrams without remembering draw.io CLI flags
- lint SVG output before publishing diagrams

## Install locally

```bash
npm install
uv run python -m py_compile scripts/find_aws_icon.py
```

## Run the bundled checks

```bash
npm run check
node scripts/export-drawio.mjs fixtures/basic/basic.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
```

## Attach as a skill

### Codex on Windows

```powershell
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git D:\Prj\draw-io-skill
cmd /c mklink /J C:\Users\YOUR_NAME\.codex\skills\draw-io D:\Prj\draw-io-skill
```

### Claude Code

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/.claude/skills/drawio
```

## Build the docs locally

```bash
npm run docs:install
npm run docs:build
```

For interactive preview:

```bash
npm run docs:dev
```
