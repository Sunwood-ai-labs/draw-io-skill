<p align="center">
  <img src="./assets/draw-io-skill-hero.svg" alt="draw-io-skill hero" width="960">
</p>

<p align="center">
  <strong>日本語</strong> · <a href="./README.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Sunwood-ai-labs/draw-io-skill/actions/workflows/ci.yml/badge.svg"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/github/license/Sunwood-ai-labs/draw-io-skill"></a>
  <img alt="Node" src="https://img.shields.io/badge/node-20%2B-339933">
  <img alt="draw.io" src="https://img.shields.io/badge/draw.io-CLI-orange">
</p>

<p align="center">
  draw.io 図の XML 編集、PNG 出力、SVG の重なり検知、文字はみ出し検知をまとめた再利用可能なスキルです。
</p>

## ✨ 概要

`draw-io-skill` は、エージェントが draw.io 図を扱うときに必要な実務フローをまとめたリポジトリです。

- `.drawio` XML を直接編集するためのガイド
- 透明背景の PNG / SVG 出力
- 矢印重なり、箱貫通、文字 overflow の lint
- AWS アイコン探索とレイアウト指針

## 🚀 クイックスタート

### Codex 系スキルディレクトリへ導入

まずこのリポジトリを任意の作業ディレクトリへ clone してから、スキルディレクトリへ接続します。

#### Windows ジャンクション例

```powershell
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git D:\Prj\draw-io-skill
cmd /c mklink /J C:\Users\YOUR_NAME\.codex\skills\draw-io D:\Prj\draw-io-skill
```

#### Unix シンボリックリンク例

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/Prj/draw-io-skill
ln -s ~/Prj/draw-io-skill ~/.codex/skills/draw-io
```

### 同梱 lint の確認

```bash
npm install
npm run check
```

## 🧰 このスキルでできること

### 図の編集ワークフロー

- `.drawio` XML の安全な編集
- draw.io CLI による PNG / SVG 出力
- 余白、矢印、和文テキスト幅のルール化

### SVG lint

[scripts/check-drawio-svg-overlaps.mjs](./scripts/check-drawio-svg-overlaps.mjs) は次を検知します。

- `edge-edge`: 線どうしの交差や重なり
- `edge-rect`: 線が箱の中を通ってしまうケース
- `text-overflow(width)` / `text-overflow(height)`: `.drawio` を見ながら推定した文字はみ出し

実行例:

```bash
drawio -x -f svg -o docs/diagram.drawio.svg docs/diagram.drawio
node scripts/check-drawio-svg-overlaps.mjs docs/diagram.drawio.svg
```

## 📦 構成

```text
draw-io-skill/
├── README.md
├── README.ja.md
├── SKILL.md
├── LICENSE
├── assets/
│   └── draw-io-skill-hero.svg
├── fixtures/
│   └── basic/
│       ├── basic.drawio
│       └── basic.drawio.svg
├── references/
│   ├── aws-icons.md
│   └── layout-guidelines.md
└── scripts/
    ├── check-drawio-svg-overlaps.mjs
    ├── convert-drawio-to-png.sh
    └── find_aws_icon.py
```

## 🛠 前提

- Node.js 20+
- draw.io CLI
- `find_aws_icon.py` を使う場合は Python

## ✅ 開発チェック

ローカル確認:

```bash
npm run check
```

いまの `check` では次を見ています。

- SVG lint スクリプトの Node 構文チェック
- 同梱 fixture に対する lint 実行

## 🧪 代表コマンド

### PNG 出力

```bash
drawio -x -f png -s 2 -t -o architecture.drawio.png architecture.drawio
```

### SVG 出力

```bash
drawio -x -f svg -o architecture.drawio.svg architecture.drawio
```

### 重なり / overflow 検知

```bash
node scripts/check-drawio-svg-overlaps.mjs architecture.drawio.svg
```

### AWS アイコン検索

```bash
uv run python scripts/find_aws_icon.py lambda
```

## 📘 含まれるガイド

- [SKILL.md](./SKILL.md): エージェント向けスキル本文
- [references/layout-guidelines.md](./references/layout-guidelines.md): レイアウト指針
- [references/aws-icons.md](./references/aws-icons.md): AWS アイコン参照

## 🤝 参考元とクレジット

このリポジトリは `softaworks/agent-toolkit` の `draw-io` スキルを出発点にしつつ、lint と公開向け整備を追加したものです。

参考にしたリポジトリ / ソース:

- [softaworks/agent-toolkit - skills/draw-io/README.md](https://github.com/softaworks/agent-toolkit/blob/main/skills/draw-io/README.md)

## 📄 ライセンス

[MIT](./LICENSE)
