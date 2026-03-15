---
layout: home
title: draw-io-skill
titleTemplate: false

hero:
  name: draw-io-skill
  text: エージェント向け native draw.io ワークフロー
  tagline: 実際の .drawio を編集し、XML 埋め込み export と SVG lint までを docs や PR に載せる前に確認できます。
  image:
    src: https://raw.githubusercontent.com/Sunwood-ai-labs/draw-io-skill/refs/heads/main/assets/draw-io-skill-penpen-header.webp
    alt: draw-io-skill の Penpen ヘッダー画像
  actions:
    - theme: brand
      text: はじめに
      link: /ja/guide/getting-started
    - theme: alt
      text: ショーケース
      link: /ja/guide/showcase
    - theme: alt
      text: GitHub
      link: https://github.com/Sunwood-ai-labs/draw-io-skill
    - theme: alt
      text: English
      link: /

features:
  - title: native .drawio を起点に
    details: export 結果ではなく、編集可能な mxGraphModel XML をソースとして保てます。
  - title: cross-platform export
    details: PNG、SVG、PDF、JPG を 1 つの helper から扱えます。
  - title: リポジトリ向け lint
    details: 交差、境界重なり、貫通、テキストあふれを共有前に検出できます。
---

## このリポジトリに入っているもの

- Codex / Claude Code 向けの `SKILL.md`
- [`scripts/`](https://github.com/Sunwood-ai-labs/draw-io-skill/tree/main/scripts) 配下の export / lint ツール
- すぐに検証できる fixture
- 英語と日本語のオンボーディングガイド

## ショーケースの見どころ

- [リポジトリ構成の全体図](/ja/guide/showcase#repository-structure-overview)
- [lint レビュー用の shape サンプル](/ja/guide/showcase#lint-review-sample)
- [アイコン中心のブロック例](/ja/guide/showcase#icon-block-sample)
- [AWS 向けレイアウトの例](/ja/guide/showcase#aws-ready-layout-pattern)

## 主なリンク

- [はじめに](/ja/guide/getting-started)
- [ショーケース](/ja/guide/showcase)
- [アーキテクチャ](/ja/guide/architecture)
- [ワークフロー](/ja/guide/workflow)
- [Export と lint](/ja/guide/export-and-lint)
- [Reference ガイド](/ja/guide/reference-guides)
- [トラブルシューティング](/ja/guide/troubleshooting)
- [v0.2.0 リリースノート](/ja/guide/releases/v0.2.0)
- [v0.1.0 リリースノート](/ja/guide/releases/v0.1.0)
