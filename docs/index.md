---
layout: home
title: draw-io-skill
titleTemplate: false

hero:
  name: draw-io-skill
  text: Native draw.io workflows for agent teams
  tagline: Edit real .drawio files, export with embedded XML, and lint SVG output before it lands in docs, issues, or PRs.
  image:
    src: https://raw.githubusercontent.com/Sunwood-ai-labs/draw-io-skill/refs/heads/main/assets/draw-io-skill-penpen-header.webp
    alt: Penpen header illustration for draw-io-skill
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/Sunwood-ai-labs/draw-io-skill
    - theme: alt
      text: 日本語
      link: /ja/

features:
  - title: Native .drawio first
    details: Keep editable mxGraphModel XML as the source of truth instead of treating exports as the working file.
  - title: Cross-platform exports
    details: Use one helper for PNG, SVG, PDF, and JPG output with embedded XML where draw.io supports it.
  - title: Repository-ready linting
    details: Detect edge crossings, border overlap, box penetration, and text overflow before diagrams get shared.
---

## What is in this repo?

- a reusable `SKILL.md` for Codex and Claude Code style agents
- export tooling under [`scripts/`](https://github.com/Sunwood-ai-labs/draw-io-skill/tree/main/scripts)
- bundled fixtures for quick verification
- English and Japanese onboarding guides

## Useful links

- [Getting Started](/guide/getting-started)
- [Architecture](/guide/architecture)
- [Workflow](/guide/workflow)
- [Export And Lint](/guide/export-and-lint)
- [Reference Guides](/guide/reference-guides)
- [Troubleshooting](/guide/troubleshooting)
