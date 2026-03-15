---
layout: home
title: draw-io-skill
titleTemplate: false

hero:
  name: draw-io-skill
  text: エージェント向け native draw.io ワークフロー
  tagline: 実際の .drawio を編集し、埋め込み XML 付きで export し、公開前に SVG lint で崩れを拾えるようにします。
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
  - title: native .drawio 優先
    details: export 物ではなく mxGraphModel XML を編集用ソースとして保ちます。
  - title: cross-platform export
    details: PNG、SVG、PDF、JPG を 1 つの helper で扱えます。
  - title: リポジトリ向け lint
    details: 線の交差、枠線重なり、箱貫通、文字はみ出しを公開前に検知できます。
---

## このリポジトリに入っているもの

- Codex / Claude Code 向けの `SKILL.md`
- [`scripts/`](https://github.com/Sunwood-ai-labs/draw-io-skill/tree/main/scripts) 配下の export / lint ツール
- 動作確認用 fixture
- 英語と日本語のガイド

## ショーケース導線

- [リポジトリ構成の全体図](/ja/guide/showcase#リポジトリ構成の全体図)
- [lint 確認用サンプル](/ja/guide/showcase#lint-確認用サンプル)
- [アイコン付きブロック例](/ja/guide/showcase#アイコン付きブロック例)
- [AWS 構成図へ広げるときの土台](/ja/guide/showcase#aws-構成図へ広げるときの土台)

## 主要リンク

- [はじめに](/ja/guide/getting-started)
- [ショーケース](/ja/guide/showcase)
- [アーキテクチャ](/ja/guide/architecture)
- [ワークフロー](/ja/guide/workflow)
- [Export と lint](/ja/guide/export-and-lint)
- [Reference ガイド](/ja/guide/reference-guides)
- [トラブルシューティング](/ja/guide/troubleshooting)
