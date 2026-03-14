# Troubleshooting

## draw.io CLI Is Not Found

Use the explicit path option:

```bash
node scripts/export-drawio.mjs architecture.drawio --drawio "C:\\Program Files\\draw.io\\draw.io.exe"
```

If you are on macOS or Linux, point `--drawio` at the installed executable for your environment.

## Lint Reports Border Contact You Expected

`edge-rect-border` is intentionally strict because border-hugging arrows usually look accidental in technical diagrams.

If the contact is truly intentional:

- keep the routing obvious
- visually review the output
- document the exception in the surrounding workflow if the diagram is committed

## Text Overflow Looks Like A False Positive

The text check is heuristic, not pixel-perfect.

Try one of these first:

- widen the box
- shorten the label
- add an intentional line break
- set explicit fonts when Japanese text is involved

## Docs Build But Pages Styling Looks Broken

The most common issue is the GitHub Pages base path.

This repository expects:

- repository name: `draw-io-skill`
- VitePress base: `/draw-io-skill/`

If the repo is renamed, update the VitePress base and rebuild.

## Python Helper Fails

The helper expects `uv`:

```bash
uv run python scripts/find_aws_icon.py lambda
```

If `uv` is missing, install it first and rerun the command.
