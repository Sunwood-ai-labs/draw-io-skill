---
name: draw-io
description: Create, edit, export, and review draw.io diagrams. Use for native .drawio XML generation, PNG/SVG/PDF export, SVG overlap, border-overlap, and text-overflow linting, layout adjustment, and AWS icon usage.
---

# draw.io Diagram Skill

## 1. Purpose

Use this skill when an agent needs to:

- create a new draw.io diagram as native `.drawio` XML
- edit or refactor an existing `.drawio` file
- export diagrams to `png`, `svg`, `pdf`, or `jpg`
- check routed edges, box-border overlap, box penetration, or text overflow
- build architecture diagrams with AWS icons

This skill intentionally combines:

- the native draw.io assistant workflow used by Claude Code style tools
- the practical XML editing and layout rules from mature repository usage
- repository-ready SVG linting that catches issues draw.io does not flag

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

### 5.1. Preferred export helper

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
- supports optional `--delete-source` when the user explicitly wants only the embedded export

### 5.2. Manual draw.io CLI export

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

### 5.3. Legacy PNG helper

For existing pre-commit or shell workflows, the original helper remains available:

```sh
bash scripts/convert-drawio-to-png.sh architecture.drawio
```

## 6. SVG Linting

After exporting SVG, run the bundled lint:

```sh
node scripts/check-drawio-svg-overlaps.mjs architecture.drawio.svg
```

The lint script currently checks:

- `edge-edge`: edge crossings and collinear overlaps
- `edge-rect-border`: lines that run along or visibly overlap a box border
- `edge-rect`: lines penetrating boxes
- `text-overflow(width)`: text likely too wide for its box
- `text-overflow(height)`: text likely too tall for its box

Notes:

- Input may be either `.drawio` or `.drawio.svg`
- Text overflow detection is heuristic, not pixel-perfect
- Lint passing does not replace visual verification

## 7. XML And Layout Rules

### 7.1. Required XML structure

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

### 7.2. Edge geometry is mandatory

Every edge cell must contain geometry:

```xml
<mxCell id="e1" edge="1" parent="1" source="a" target="b" style="edgeStyle=orthogonalEdgeStyle;">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

Never use self-closing edge cells.

### 7.3. Font settings

For diagrams with Japanese text or slide usage, set the font family explicitly:

```xml
<mxGraphModel defaultFontFamily="Noto Sans JP" ...>
```

Also set `fontFamily` in text styles:

```xml
style="text;html=1;fontSize=18;fontFamily=Noto Sans JP;"
```

### 7.4. Spacing and routing

- Space nodes generously. Prefer about 200px horizontal and 120px vertical gaps for routed diagrams.
- Leave at least 20px of straight segment near arrowheads.
- Use `edgeStyle=orthogonalEdgeStyle` for most technical diagrams.
- Add explicit waypoints when auto-routing produces overlap or awkward bends.
- Align to a coarse grid when possible.

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

### 7.5. Containers and groups

Do not fake containment by simply placing boxes on top of bigger boxes.

- Use `parent="containerId"` for child elements.
- Use `swimlane` when the container needs a visible title bar.
- Use `group;pointerEvents=0;` for invisible containers.
- Add `container=1;pointerEvents=0;` when using a custom shape as a container.

### 7.6. Japanese text width

Allow roughly 30 to 40px per Japanese character.

```xml
<mxGeometry x="140" y="60" width="400" height="40" />
```

If text is mixed Japanese and English, err on the wider side.

### 7.7. Backgrounds, frames, and margins

- Prefer transparent backgrounds over hard-coded white backgrounds.
- Inside rounded frames or swimlanes, keep at least 30px margin from the boundary.
- Account for stroke width and rounded corners.
- Verify that titles and labels do not sit too close to frame edges.

### 7.8. Labels and line breaks

- Use one line for short service names when possible.
- Use `&lt;br&gt;` for intentional two-line labels.
- Shorten redundant wording instead of forcing cramped boxes.

### 7.9. Metadata and progressive disclosure

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
- remove unnecessary decorative icons that do not add meaning

Search icons with:

```sh
uv run python scripts/find_aws_icon.py ec2
uv run python scripts/find_aws_icon.py lambda
```

## 9. Checklist

- [ ] Diagram source is a valid `.drawio` file
- [ ] Export filenames use `.drawio.<format>` when exported
- [ ] Edge cells contain `<mxGeometry relative="1" as="geometry"/>`
- [ ] Fonts are explicit when Japanese text is involved
- [ ] No hard-coded white page background unless the user asked for it
- [ ] Containers have enough internal margin
- [ ] Edge routing is visually clear and leaves room for arrowheads
- [ ] SVG lint passes for routing-heavy diagrams
- [ ] No `edge-rect-border` findings remain unless a border overlap is explicitly intentional
- [ ] No `text-overflow(width)` or `text-overflow(height)` findings remain
- [ ] Final PNG/SVG/PDF was visually checked

## 10. References

- [README.md](README.md)
- [references/layout-guidelines.md](references/layout-guidelines.md)
- [references/aws-icons.md](references/aws-icons.md)
- [draw.io Style Reference](https://www.drawio.com/doc/faq/drawio-style-reference.html)
- [draw.io mxfile XSD](https://www.drawio.com/assets/mxfile.xsd)

## 11. References And Credits

This local version is intentionally a blended skill:

- editing and layout guidance inspired by `softaworks/agent-toolkit`
- native assistant workflow and export conventions inspired by `jgraph/drawio-mcp`
- SVG linting and repository-ready QA extensions added in this repository

Referenced repositories and sources:

- [softaworks/agent-toolkit - skills/draw-io/README.md](https://github.com/softaworks/agent-toolkit/blob/main/skills/draw-io/README.md)
- [jgraph/drawio-mcp - skill-cli/README.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/README.md)
- [jgraph/drawio-mcp - skill-cli/drawio/SKILL.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/drawio/SKILL.md)
