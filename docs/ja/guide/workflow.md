# ワークフロー

## 推奨順序

1. まず native `.drawio` を編集する
2. リポジトリには `.drawio` を編集用ソースとして残す
3. 必要な形式だけを export する
4. 線やラベルが複雑な図では SVG lint を実行する
5. 最後に見た目を確認してから共有する

## export コマンド

### PNG

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
```

### SVG

```bash
node scripts/export-drawio.mjs architecture.drawio --format svg
```

### PDF

```bash
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

## lint を実行すべき場面

- 矢印が複数の箱を回り込む
- ラベルが長い、または多言語混在
- 箱が密集している
- CI で再現可能な QA を入れたい

## lint コマンド

```bash
node scripts/check-drawio-svg-overlaps.mjs architecture.drawio.svg
```

## lint が報告する内容

- `edge-edge`
- `edge-rect-border`
- `edge-rect`
- `text-overflow(width)`
- `text-overflow(height)`

## AWS アイコン検索

```bash
uv run python scripts/find_aws_icon.py eventbridge
```

AWS 図を作るときに、現在のアイコン名をリポジトリ内で素早く探したい場合に使います。
