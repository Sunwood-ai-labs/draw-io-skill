---
name: draw-io
description: Create, edit, export, and review draw.io diagrams. Use for native .drawio XML generation, PNG/SVG/PDF export, SVG overlap, border-overlap, label-intrusion, label-rect, short-terminal, and text-overflow linting, layout adjustment, and AWS icon usage.
---

# draw.io Diagram Skill

## 1. Purpose

Use this skill when an agent needs to:

- create a new draw.io diagram as native `.drawio` XML
- edit or refactor an existing `.drawio` file
- export diagrams to `png`, `svg`, `pdf`, or `jpg`
- check routed edges, box- or frame-border overlap, supported non-rect shape border overlap, box penetration, short arrowhead tails, label collisions, or text overflow
- build architecture diagrams with AWS icons

This skill intentionally combines:

- the native draw.io assistant workflow used by Claude Code style tools
- practical XML editing and layout rules from repository use
- repository-ready SVG linting that catches issues draw.io does not flag

### 1.1 Repository structure

The repository layout and bundled workflow pieces are summarized in the diagram below.

![draw-io-skill structure](./assets/draw-io-skill-structure.drawio.png)

The repository also ships:

- an English structure source and exports under `assets/draw-io-skill-structure.drawio*`
- an icon block showcase under `assets/draw-io-skill-structure-icons.drawio*` plus a Japanese-localized companion under `assets/draw-io-skill-structure-icons.ja.drawio*`
- a shape-focused lint review sample under `assets/draw-io-skill-structure-shapes.drawio` with exports at `assets/draw-io-skill-structure-shapes.drawio.png` and `assets/draw-io-skill-structure-shapes.drawio.svg`
- a Japanese-localized companion source and exports under `assets/draw-io-skill-structure.ja.drawio*`
- public showcase pages under `docs/guide/showcase.md` and `docs/ja/guide/showcase.md`
- fixture-based lint coverage under `fixtures/basic`, `fixtures/border-overlap`, `fixtures/large-frame-border-overlap`, `fixtures/shape-border-overlap`, `fixtures/label-rect-overlap`, `fixtures/text-cell-overflow`, and `fixtures/shape-text-overflow`

### 1.2 Repository-local commands

When working inside this repository, these are the main maintenance commands:

```sh
npm install
npm run check
npm run verify
npm ci
npm run docs:build
npm run docs:dev
uv run python -m py_compile scripts/find_aws_icon.py
```

Use them this way:

- `npm run check`: script syntax plus fixture-based lint verification
- `npm run verify`: full repository signoff, including docs build
- `npm run docs:build`: one-shot docs build
- `npm run docs:dev`: interactive docs preview

If you need to attach the repo as a skill in a local assistant environment, the repository docs use these conventions:

- Codex on Windows: junction `C:\Users\YOUR_NAME\.codex\skills\draw-io -> D:\Prj\draw-io-skill`
- Claude Code: clone under `~/.claude/skills/drawio`

### 1.3 Repository QA model

The repository uses three QA layers:

1. syntax checks for the JavaScript tools
2. fixture-based lint verification
3. documentation build validation for the public-facing docs

That keeps the technical tooling and the user-facing docs aligned in CI.

## 2. Default Workflow

Follow this order unless the user asks for something narrower:

1. Create or update the native `.drawio` file first.
2. Keep `.drawio` as the editable source of truth for repository work.
3. If the user asked for an exported artifact, export to `.drawio.png`, `.drawio.svg`, `.drawio.pdf`, or `.drawio.jpg`.
4. If edge routing or label density matters, export SVG and run the lint script.
5. Open or surface the final artifact requested by the user.
6. Even when lint passes, visually verify the result.

If the user only asks for a diagram and does not request a format, stop at the `.drawio` file.

## 3. Basic Rules

- Edit only `.drawio` files directly.
- Do not manually edit generated `.drawio.png`, `.drawio.svg`, or `.drawio.pdf` files.
- Prefer native mxGraphModel XML over Mermaid or CSV conversions.
- Keep source diagrams unless the user explicitly wants embedded-only cleanup after export.
- Use descriptive lowercase filenames with hyphens.

Examples:

- `login-flow.drawio`
- `login-flow.drawio.png`
- `er-diagram.drawio.svg`
- `architecture-overview.drawio.pdf`

## 4. Output Formats

| Format | Embedded XML | Recommended use |
|--------|--------------|-----------------|
| `.drawio` | n/a | Editable source diagram |
| `png` | Yes | Docs, slides, chat attachments |
| `svg` | Yes | Docs, scalable output, lint input |
| `pdf` | Yes | Review and print |
| `jpg` | No | Last-resort lossy export |

For repository workflows, prefer:

- `.drawio` while editing
- `.drawio.svg` when running lint
- `.drawio.png` or `.drawio.svg` for documentation embeds

## 5. Export Commands

### 5.1 Preferred export helper

Use the bundled helper first:

```sh
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

What it does:

- locates the draw.io CLI on Windows, macOS, or Linux
- uses embedded XML for `png`, `svg`, and `pdf`
- defaults to transparent 2x PNG export
- supports explicit `--drawio <path>` when automatic CLI discovery fails
- supports optional `--delete-source` when the user explicitly wants only the embedded export

If draw.io CLI discovery fails, rerun with an explicit executable path:

```sh
node scripts/export-drawio.mjs architecture.drawio --drawio "C:\\Program Files\\draw.io\\draw.io.exe" --format svg
```

On macOS or Linux, point `--drawio` at the installed executable for that environment.

### 5.2 Manual draw.io CLI export

If needed, call draw.io directly:

```sh
drawio -x -f png -e -s 2 -t -b 10 -o architecture.drawio.png architecture.drawio
drawio -x -f svg -e -b 10 -o architecture.drawio.svg architecture.drawio
drawio -x -f pdf -e -b 10 -o architecture.drawio.pdf architecture.drawio
drawio -x -f jpg -b 10 -o architecture.drawio.jpg architecture.drawio
```

Key flags:

- `-x`: export mode
- `-f`: output format
- `-e`: embed diagram XML in png/svg/pdf
- `-o`: output file path
- `-b`: border width
- `-t`: transparent background for PNG
- `-s`: scale factor
- `-a`: all pages for PDF
- `-p`: page index (1-based)

### 5.3 Legacy PNG helper

For existing shell workflows, the original helper remains available:

```sh
bash scripts/convert-drawio-to-png.sh architecture.drawio
```

## 6. SVG Linting

After exporting SVG, run the bundled lint:

```sh
node scripts/check-drawio-svg-overlaps.mjs architecture.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/border-overlap/border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/large-frame-border-overlap/large-frame-border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/shape-border-overlap/shape-border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/label-rect-overlap/label-rect-overlap.drawio
node scripts/check-drawio-svg-overlaps.mjs fixtures/text-cell-overflow/text-cell-overflow.drawio
```

The lint script currently checks:

- `edge-edge`: edge crossings and collinear overlaps
- `edge-rect-border`: lines that run along or visibly overlap a box or large frame border
- `edge-shape-border`: lines that run along supported non-rect shape borders such as `document`, `hexagon`, `parallelogram`, and `trapezoid`
- `edge-rect`: lines penetrating boxes
- `edge-terminal`: final arrow runs that are too short after the last bend
- `edge-label`: routed lines crossing label text boxes
- `label-rect`: label text boxes colliding with another box or card
- `rect-shape-border`: box or frame borders that run along those supported non-rect shape borders
- `text-overflow(width)`: text likely too wide for its box
- `text-overflow(height)`: text likely too tall for its box

Notes:

- input may be either `.drawio` or `.drawio.svg`
- when the input is `.drawio`, the checker also reads the companion draw.io geometry so `label-rect` and text-fit checks stay aligned with the editable source
- text overflow detection is heuristic, not pixel-perfect
- bundled fixtures cover simple box-border overlap, large frame-border overlap, supported non-rect shape border overlap, label-box collisions, text-cell overflow, and shape-aware text overflow
- `edge-terminal`, `edge-label`, and `label-rect` are heuristic checks intended to catch the common "tiny arrowhead tail", "line through label", and "note card covering a label" draw.io failures seen in repository diagrams
- lint passing does not replace visual verification

When investigating findings:

- if `edge-rect-border`, `edge-shape-border`, or `rect-shape-border` is intentional, keep the routing obvious, visually review the output, and document the exception in the surrounding workflow
- if `edge-terminal` fires, add a longer straight segment before the arrowhead or move the last bend farther away from the target
- if `edge-label` fires, reroute the edge or move the label so the text keeps clean breathing room
- if `label-rect` fires, move the note/card/box or shift the label so they no longer partially overlap
- if `text-overflow` looks like a false positive, first try widening the box, shortening the label, adding an intentional line break, or setting explicit fonts

## 7. XML And Layout Rules

### 7.1 Required XML structure

Every diagram must use native mxGraphModel XML:

```xml
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
  </root>
</mxGraphModel>
```

All normal diagram cells should live under `parent="1"` unless you intentionally use container parents.

### 7.2 Edge geometry is mandatory

Every edge cell must contain geometry:

```xml
<mxCell id="e1" edge="1" parent="1" source="a" target="b" style="edgeStyle=orthogonalEdgeStyle;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

Never use self-closing edge cells.

### 7.3 Font settings

For diagrams with Japanese text or slide usage, set the font family explicitly:

```xml
<mxGraphModel defaultFontFamily="Noto Sans JP" ...>
```

Also set `fontFamily` in text styles:

```xml
style="text;html=1;fontSize=18;fontFamily=Noto Sans JP;"
```

### 7.4 Spacing and routing

- space nodes generously; prefer about 200px horizontal and 120px vertical gaps for routed diagrams
- leave at least 20px of straight segment near arrowheads
- use `edgeStyle=orthogonalEdgeStyle` for most technical diagrams
- add explicit waypoints when auto-routing produces overlap or awkward bends
- when using large outer frames or swimlanes, keep routed segments off the frame stroke and use the gutter between the frame and child boxes instead
- align to a coarse grid when possible

Example with waypoints:

```xml
<mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=1;jettySize=auto;" edge="1" parent="1" source="a" target="b">
  <mxGeometry relative="1" as="geometry">
    <Array as="points">
      <mxPoint x="300" y="150"/>
      <mxPoint x="300" y="250"/>
    </Array>
  </mxGeometry>
</mxCell>
```

### 7.5 Containers and groups

Do not fake containment by simply placing boxes on top of bigger boxes.

- use `parent="containerId"` for child elements
- use `swimlane` when the container needs a visible title bar
- use `group;pointerEvents=0;` for invisible containers
- add `container=1;pointerEvents=0;` when using a custom shape as a container

### 7.6 Japanese text width

Allow roughly 30 to 40px per Japanese character.

```xml
<mxGeometry x="140" y="60" width="400" height="40" />
```

If text is mixed Japanese and English, err on the wider side.

### 7.7 Backgrounds, frames, and margins

- prefer transparent backgrounds over hard-coded white backgrounds
- inside rounded frames or swimlanes, keep at least 30px margin from the boundary
- account for stroke width and rounded corners
- verify that titles and labels do not sit too close to frame edges

### 7.8 Labels and line breaks

- use one line for short service names when possible
- use `&lt;br&gt;` for intentional two-line labels
- shorten redundant wording instead of forcing cramped boxes

### 7.9 Metadata and progressive disclosure

When appropriate, include title, description, last updated, author, or version.

Split complex systems into multiple diagrams when one canvas becomes dense:

- context diagram
- system diagram
- component diagram
- deployment diagram
- data flow diagram
- sequence diagram

## 8. AWS Icon Workflow

When working on AWS diagrams:

- use the latest official icon naming where possible
- prefer current `mxgraph.aws4.*` icon references
- remove decorative icons that do not add meaning

Search icons with:

```sh
uv run python scripts/find_aws_icon.py ec2
uv run python scripts/find_aws_icon.py lambda
```

## 9. Checklist

- [ ] diagram source is a valid `.drawio` file
- [ ] export filenames use `.drawio.<format>` when exported
- [ ] edge cells contain `<mxGeometry relative="1" as="geometry"/>`
- [ ] fonts are explicit when Japanese text is involved
- [ ] no hard-coded white page background unless the user asked for it
- [ ] containers have enough internal margin
- [ ] edge routing is visually clear and leaves room for arrowheads
- [ ] SVG lint passes for routing-heavy diagrams
- [ ] no `edge-terminal` findings remain unless a tiny terminal run is intentionally accepted
- [ ] no `edge-label` or `label-rect` findings remain
- [ ] no `edge-rect-border` findings remain unless a box or frame border overlap is intentionally accepted
- [ ] no `edge-shape-border` or `rect-shape-border` findings remain unless a supported non-rect border contact is intentionally accepted
- [ ] no `text-overflow(width)` or `text-overflow(height)` findings remain
- [ ] final PNG/SVG/PDF was visually checked

## 10. Repository Docs

For repo-facing documentation and onboarding:

- [README.md](./README.md)
- [README.ja.md](./README.ja.md)
- [docs/guide/getting-started.md](./docs/guide/getting-started.md)
- [docs/guide/workflow.md](./docs/guide/workflow.md)
- [docs/guide/architecture.md](./docs/guide/architecture.md)
- [docs/guide/troubleshooting.md](./docs/guide/troubleshooting.md)
- [docs/ja/guide/getting-started.md](./docs/ja/guide/getting-started.md)
- [docs/ja/guide/workflow.md](./docs/ja/guide/workflow.md)
- [docs/ja/guide/architecture.md](./docs/ja/guide/architecture.md)
- [docs/ja/guide/troubleshooting.md](./docs/ja/guide/troubleshooting.md)
- [references/layout-guidelines.en.md](./references/layout-guidelines.en.md)
- [references/aws-icons.en.md](./references/aws-icons.en.md)

Docs-specific repo note:

- if GitHub Pages styling breaks after a repo rename, verify the VitePress base still matches `/draw-io-skill/`

## 11. References And Credits

This local version is intentionally a blended skill:

- editing and layout guidance inspired by `softaworks/agent-toolkit`
- native assistant workflow and export conventions inspired by `jgraph/drawio-mcp`
- SVG linting and repository-ready QA extensions added in this repository

Referenced repositories and sources:

- [softaworks/agent-toolkit - skills/draw-io/README.md](https://github.com/softaworks/agent-toolkit/blob/main/skills/draw-io/README.md)
- [jgraph/drawio-mcp - skill-cli/README.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/README.md)
- [jgraph/drawio-mcp - skill-cli/drawio/SKILL.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/drawio/SKILL.md)
- [draw.io Style Reference](https://www.drawio.com/doc/faq/drawio-style-reference.html)
- [draw.io mxfile XSD](https://www.drawio.com/assets/mxfile.xsd)
