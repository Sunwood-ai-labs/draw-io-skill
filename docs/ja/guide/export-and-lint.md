# Export と lint

## 推奨 export helper

まずは生の draw.io CLI ではなく、同梱 helper を使います。

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

helper が行うこと:

- Windows / macOS / Linux で draw.io CLI を検出
- `png` / `svg` / `pdf` に埋め込み XML を付与
- PNG は透明背景 2x export を既定にする
- `--delete-source` は明示指定時だけ使う

## 出力フォーマット

| Format | 埋め込み XML | 用途 |
|--------|--------------|------|
| `.drawio` | n/a | 編集用ソース |
| `png` | Yes | docs、スライド、チャット添付 |
| `svg` | Yes | docs、レビュー、lint 入力 |
| `pdf` | Yes | レビュー、印刷 |
| `jpg` | No | 劣化ありの fallback |

## SVG lint

SVG export 後に lint を実行します。

```bash
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/border-overlap/border-overlap.drawio.svg
```

現在の検知対象:

- `edge-edge`
- `edge-rect-border`
- `edge-rect`
- `text-overflow(width)`
- `text-overflow(height)`

## 実務上の確認ルール

lint は補助であり、最終確認の代わりではありません。ルーティングとラベルが固まったら、最後に PNG / SVG / PDF を 1 回は目視します。
