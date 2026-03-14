<p align="center">
  <img src="./assets/draw-io-skill-penpen-header.webp" alt="draw-io-skill のヘッダーイラスト Penpen" width="960">
</p>

<h1 align="center">draw-io-skill</h1>

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
  Codex と Claude Code の両方で使いやすい、全部のいいところどりを目指した draw.io スキルです。
</p>

## 概要

`draw-io-skill` は、3つの良さを1つにまとめたスキルリポジトリです。

- Claude Code 系で使いやすい native `.drawio` 生成 / export フロー
- 実務で使いやすい XML 編集とレイアウト指針
- リポジトリ運用向けの SVG lint による重なり / 枠線重なり / 箱貫通 / 文字はみ出し検知

図を作る、整える、書き出す、崩れを見つける、までを一続きで扱えるようにしています。

## ベストプラクティスの流れ

1. native な `.drawio` を作成または編集する
2. リポジトリ運用では `.drawio` を編集用ソースとして残す
3. PNG / SVG / PDF が必要なら、埋め込み XML 付きで export する
4. 線のルーティングやラベル密度が高い図は、SVG export 後に lint する
5. lint が通っても最後は見た目を確認する

これで、公式寄りの生成フローと、実務で必要な編集・QA の両方をカバーできます。

## このスキルに入っているもの

### 1. native draw.io ワークフロー

- mxGraphModel XML をそのまま扱う
- `.drawio`、`.drawio.png`、`.drawio.svg`、`.drawio.pdf` を一貫した命名で扱う
- `png` / `svg` / `pdf` では埋め込み XML により draw.io で再編集しやすくする

### 2. cross-platform export helper

draw.io CLI の細かいフラグを毎回覚えなくてよいように、export helper を同梱しています。

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

この helper は次をやります。

- Windows / macOS / Linux で draw.io CLI を探す
- `png` / `svg` / `pdf` では埋め込み XML を有効にする
- PNG は透明背景 + 2x scale をデフォルトにする
- 明示されたときだけ `--delete-source` で source を消す

### 3. SVG lint

[scripts/check-drawio-svg-overlaps.mjs](./scripts/check-drawio-svg-overlaps.mjs) は次を検知します。

- `edge-edge`: 線どうしの交差や重なり
- `edge-rect-border`: 矢印が箱の枠線をなぞる、または視覚的に重なるケース
- `edge-rect`: 線が箱の中を通るケース
- `text-overflow(width)` / `text-overflow(height)`: `.drawio` を見ながら推定する文字はみ出し

実行例:

```bash
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs architecture.drawio.svg
```

### 4. レイアウトと編集ガイド

- 箱、線、コンテナの間隔ルール
- 日本語テキスト幅の考え方
- グループ枠や swimlane の内側余白ルール
- AWS アイコン探索とレイアウト参照

## インストール

### Codex

任意の安定した場所に clone してから、Codex の skills ディレクトリへ接続します。

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

### Claude Code

Claude Code では、そのまま skills フォルダへ clone するか、`SKILL.md` を配置して使えます。

#### グローバルスキル

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/.claude/skills/drawio
```

#### プロジェクトごとのスキル

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git .claude/skills/drawio
```

## クイックコマンド

### 同梱スクリプトの確認

```bash
npm install
npm run check
```

### 埋め込み XML 付き PNG export

```bash
node scripts/export-drawio.mjs docs/architecture.drawio --format png
```

### SVG export と review

```bash
node scripts/export-drawio.mjs docs/architecture.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs docs/architecture.drawio.svg
```

### AWS アイコン検索

```bash
uv run python scripts/find_aws_icon.py lambda
```

## 出力フォーマット

| Format | デフォルト出力 | 埋め込み XML | メモ |
|--------|----------------|--------------|------|
| `.drawio` | source file | n/a | native 編集ソース |
| `png` | `name.drawio.png` | Yes | helper のデフォルト export。透明背景 + 2x |
| `svg` | `name.drawio.svg` | Yes | lint と docs 表示に最適 |
| `pdf` | `name.drawio.pdf` | Yes | レビューや印刷向け |
| `jpg` | `name.drawio.jpg` | No | 劣化ありの簡易 fallback |

## リポジトリ構成

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
    ├── export-drawio.mjs
    └── find_aws_icon.py
```

## 含まれるガイド

- [SKILL.md](./SKILL.md): エージェント向けスキル本文
- [references/layout-guidelines.md](./references/layout-guidelines.md): レイアウトと余白の指針
- [references/aws-icons.md](./references/aws-icons.md): AWS アイコン参照

## 参考元とクレジット

このリポジトリは、次の良さを組み合わせて作っています。

- `softaworks/agent-toolkit` の編集・レイアウト指針
- `jgraph/drawio-mcp` の Claude Code 向け native draw.io フロー
- このリポジトリ独自の lint / export / 公開向け整備

参考にしたリポジトリ / ソース:

- [softaworks/agent-toolkit - skills/draw-io/README.md](https://github.com/softaworks/agent-toolkit/blob/main/skills/draw-io/README.md)
- [jgraph/drawio-mcp - skill-cli/README.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/README.md)
- [jgraph/drawio-mcp - skill-cli/drawio/SKILL.md](https://github.com/jgraph/drawio-mcp/blob/main/skill-cli/drawio/SKILL.md)
- [draw.io Style Reference](https://www.drawio.com/doc/faq/drawio-style-reference.html)
- [draw.io mxfile XSD](https://www.drawio.com/assets/mxfile.xsd)

## ライセンス

[MIT](./LICENSE)
