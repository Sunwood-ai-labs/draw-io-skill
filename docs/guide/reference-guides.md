# Reference Guides

## Repository references

These files stay in the repository as source references:

- [English layout guidelines](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/layout-guidelines.en.md)
- [English AWS icon guide](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/aws-icons.en.md)
- [Japanese layout guidelines](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/layout-guidelines.md)
- [Japanese AWS icon guide](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/aws-icons.md)

## Layout rules worth keeping in mind

- group related components explicitly instead of faking containment
- leave generous whitespace around routed edges and arrowheads
- align diagram flow with a clear left-to-right or top-to-bottom narrative
- widen Japanese labels early rather than squeezing them into boxes

## AWS icon workflow

- prefer official service names over abbreviations
- use `mxgraph.aws4.*` identifiers instead of legacy `aws3`
- search the bundled icon corpus with:

```bash
uv run python scripts/find_aws_icon.py lambda
```

## Skill-facing documentation

- [Agent skill instructions](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/SKILL.md)
- [Main README](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/README.md)
