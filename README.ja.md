<p align="center">
  <img src="./assets/draw-io-skill-penpen-header.webp" alt="draw-io-skill の Penpen ヘッダー画像" width="320">
</p>

<h1 align="center">draw-io-skill</h1>

<p align="center">
  <a href="./README.md">English</a> · <strong>日本語</strong>
</p>

<p align="center">
  <a href="https://sunwood-ai-labs.github.io/draw-io-skill/ja/"><img alt="Docs" src="https://img.shields.io/badge/docs-GitHub%20Pages-1f6feb"></a>
  <a href="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/github/license/Sunwood-ai-labs/draw-io-skill"></a>
  <img alt="Node" src="https://img.shields.io/badge/node-20%2B-339933">
  <img alt="draw.io" src="https://img.shields.io/badge/draw.io-native%20XML-f97316">
</p>

<p align="center">
  Codex、Claude Code、リポジトリ運用でそのまま使える、native <code>.drawio</code> 中心の draw.io スキルです。
</p>

## ✨ 概要

`draw-io-skill` は、diagram 作成の実務で必要になりやすい 3 つを 1 つにまとめたリポジトリです。

- native `.drawio` を直接編集するワークフロー
- `png` / `svg` / `pdf` / `jpg` への export helper
- 線の交差、枠線重なり、非矩形 shape の枠線重なり、箱貫通、文字はみ出しを検知する SVG lint

作る、整える、書き出す、崩れを見つける、までをリポジトリの中で一続きに扱えるようにしています。

## 🚀 クイックスタート

まずは同梱 fixture を使ってローカル確認できます。

```bash
npm ci
npm ci
npm run verify
node scripts/export-drawio.mjs fixtures/basic/basic.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
uv run python scripts/find_aws_icon.py lambda
```

ドキュメントサイトだけを build したい場合:

```bash
npm ci
npm run docs:build
```

## 🧭 基本フロー

1. native `.drawio` を作成または更新する
2. `.drawio` を編集用ソースとして残す
3. `png` / `svg` / `pdf` が必要なら埋め込み XML 付きで export する
4. 線のルーティングやラベル密度が高い図では SVG lint を走らせる
5. 公開前に最後は目視で確認する

<p align="center">
  <img src="./assets/draw-io-skill-structure.ja.drawio.png" alt="draw-io-skill の日本語構成図" width="960">
</p>

日本語向けの編集用ソースと書き出し済みアセットは
`assets/draw-io-skill-structure.ja.drawio`、
`assets/draw-io-skill-structure.ja.drawio.png`、
`assets/draw-io-skill-structure.ja.drawio.svg`
にあります。英語版は従来どおり `assets/draw-io-skill-structure.drawio` 系を参照してください。

## 🖼️ ショーケース用サンプル

ショーケース寄りに見せたいときは、次の同梱サンプルを起点にするのがおすすめです。

- `assets/draw-io-skill-structure.drawio*` はリポジトリ構成の導入向け
- `assets/draw-io-skill-structure-shapes.drawio*` は非矩形 shape を含む lint / 目視確認向け
- `assets/draw-io-skill-structure-icons.drawio*` は AWS アイコンガイドや `uv run python scripts/find_aws_icon.py` と相性のよい、見せ方重視のアイコン付きブロック例

ガイド付きの紹介は [`docs/ja/guide/showcase.md`](./docs/ja/guide/showcase.md) にまとめています。

## 🛠️ 含まれるもの

### native draw.io ワークフロー

- `mxGraphModel` XML を直接扱える
- `.drawio.<format>` 命名を統一できる
- 対応形式では埋め込み XML 付き export を使える

### export helper

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

Windows / macOS / Linux の draw.io CLI 検出、PNG の透明背景 2x export、必要時のみの `--delete-source` に対応しています。

### SVG lint

```bash
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/border-overlap/border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/large-frame-border-overlap/large-frame-border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/shape-border-overlap/shape-border-overlap.drawio.svg
```

検知対象:

- `edge-edge`
- `edge-rect-border` 箱や大きいフレームの枠線に沿う、または重なる線
- `edge-shape-border` `document` / `hexagon` / `parallelogram` / `trapezoid` など、対応する非矩形 shape の枠線に沿う、または重なる線
- `edge-rect`
- `rect-shape-border` 箱やフレームの枠線が、対応する非矩形 shape の枠線に沿う、または重なるケース
- `text-overflow(width)`
- `text-overflow(height)`

リポジトリには、通常の箱枠重なり用 `fixtures/border-overlap/...`、大きいセクション枠用 `fixtures/large-frame-border-overlap/...`、非矩形 shape 枠線用 `fixtures/shape-border-overlap/...`、shape-aware な文字はみ出し用 `fixtures/shape-text-overflow/...` の回帰 fixture が含まれています。CI で配線崩れを拾いたいときに使えます。

リポジトリ内で lint や目視確認のサンプルとして使う場合は
`assets/draw-io-skill-structure-shapes.drawio`、
`assets/draw-io-skill-structure-shapes.drawio.png`、
`assets/draw-io-skill-structure-shapes.drawio.svg`
を参照してください。

見せ方を強めた資料向けサンプルとしては
`assets/draw-io-skill-structure-icons.drawio`、
`assets/draw-io-skill-structure-icons.drawio.png`、
`assets/draw-io-skill-structure-icons.drawio.svg`
も利用できます。

## 📦 インストール

### Codex

```powershell
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git D:\Prj\draw-io-skill
cmd /c mklink /J C:\Users\YOUR_NAME\.codex\skills\draw-io D:\Prj\draw-io-skill
```

### Claude Code

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/.claude/skills/drawio
```

## 📚 ドキュメント

- [GitHub Pages ドキュメント](https://sunwood-ai-labs.github.io/draw-io-skill/ja/)
- [はじめに](./docs/ja/guide/getting-started.md)
- [ショーケース](./docs/ja/guide/showcase.md)
- [ワークフローガイド](./docs/ja/guide/workflow.md)
- [アーキテクチャガイド](./docs/ja/guide/architecture.md)
- [Export と lint](./docs/ja/guide/export-and-lint.md)
- [Reference ガイド](./docs/ja/guide/reference-guides.md)
- [トラブルシューティング](./docs/ja/guide/troubleshooting.md)
- [レイアウトガイドライン](./references/layout-guidelines.md)
- [AWS アイコンガイド](./references/aws-icons.md)
- [エージェント向けスキル本文](./SKILL.md)

## 🗂️ リポジトリ構成

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
│   ├── draw-io-skill-structure.drawio.svg
│   ├── draw-io-skill-structure-icons.drawio
│   ├── draw-io-skill-structure-icons.drawio.png
│   ├── draw-io-skill-structure-icons.drawio.svg
│   ├── draw-io-skill-structure-icons.ja.drawio
│   ├── draw-io-skill-structure-icons.ja.drawio.png
│   ├── draw-io-skill-structure-icons.ja.drawio.svg
│   ├── draw-io-skill-structure-shapes.drawio
│   ├── draw-io-skill-structure-shapes.drawio.png
│   ├── draw-io-skill-structure-shapes.drawio.svg
│   ├── draw-io-skill-structure.ja.drawio
│   ├── draw-io-skill-structure.ja.drawio.png
│   └── draw-io-skill-structure.ja.drawio.svg
├── docs/
│   ├── .vitepress/
│   ├── guide/
│   ├── ja/
│   └── public/
├── fixtures/
│   ├── basic/
│   ├── border-overlap/
│   ├── large-frame-border-overlap/
│   ├── shape-border-overlap/
│   └── shape-text-overflow/
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

## 🙏 参考元とクレジット

このリポジトリは、次の強みを組み合わせています。

- `softaworks/agent-toolkit` のレイアウト・編集指針
- `jgraph/drawio-mcp` の native draw.io ワークフロー
- このリポジトリで追加した lint / export / 公開向け整備

参考にしたソース:

- [softaworks/agent-toolkit - skills/draw-io/README.md](https://github.com/softaworks/agent-toolkit/blob/main/skills/draw-io/README.md)
- [jgraph/drawio-mcp - skill-cli/README.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/README.md)
- [jgraph/drawio-mcp - skill-cli/drawio/SKILL.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/drawio/SKILL.md)
- [draw.io Style Reference](https://www.drawio.com/doc/faq/drawio-style-reference.html)
- [draw.io mxfile XSD](https://www.drawio.com/assets/mxfile.xsd)

## 📄 ライセンス

[MIT](./LICENSE)
