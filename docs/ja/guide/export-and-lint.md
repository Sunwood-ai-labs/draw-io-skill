# Export と lint

## 推奨 export helper

生の draw.io CLI オプションを直接組む前に、まず同梱 helper を使います。

```bash
node scripts/export-drawio.mjs architecture.drawio --format png --open
node scripts/export-drawio.mjs architecture.drawio --format svg
node scripts/export-drawio.mjs architecture.drawio --output architecture.drawio.pdf
```

helper が行うこと:

- Windows / macOS / Linux で draw.io CLI を探索
- `png` / `svg` / `pdf` に埋め込み XML を保持
- PNG は透過 2x export を既定値として使用
- `--delete-source` は埋め込み出力だけを残したいときだけ使う

## 出力フォーマット

| Format | 埋め込み XML | 主な用途 |
|--------|--------------|----------|
| `.drawio` | n/a | 編集用ソース |
| `png` | Yes | docs、スライド、チャット共有 |
| `svg` | Yes | docs、レビュー、lint 入力 |
| `pdf` | Yes | レビュー、印刷 |
| `jpg` | No | 最終手段の lossy 形式 |

## SVG lint

SVG export の後に lint を実行します。

```bash
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/border-overlap/border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/large-frame-border-overlap/large-frame-border-overlap.drawio.svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/shape-border-overlap/shape-border-overlap.drawio.svg
```

現在の検知対象:

- `edge-edge`
- `edge-rect-border` 箱や大きいフレームの枠線に沿う、または重なる線
- `edge-shape-border` `document` / `hexagon` / `parallelogram` / `trapezoid` など、対応する非矩形 shape の枠線に沿う、または重なる線
- `edge-rect`
- `rect-shape-border` 箱やフレームの枠線が、対応する非矩形 shape の枠線に沿う、または重なるケース
- `text-overflow(width)`
- `text-overflow(height)`

`fixtures/border-overlap/...`、`fixtures/large-frame-border-overlap/...`、`fixtures/shape-border-overlap/...`、`fixtures/shape-text-overflow/...` を使い分けることで、細い箱枠、大きいセクション枠、対応する非矩形 shape 枠線、shape-aware な文字はみ出しをそれぞれ回帰テストできます。

## lint 確認用サンプル

リポジトリ内で検証サンプルとして使う場合は、次を参照します。

- `assets/draw-io-skill-structure-shapes.drawio`
- `assets/draw-io-skill-structure-shapes.drawio.png`
- `assets/draw-io-skill-structure-shapes.drawio.svg`

これはリポジトリ構成図の紹介というより、非矩形 shape の余白、枠線接触、lint 後の目視確認を行うためのサンプルです。

見せ方を強めたアイコン付きレイアウト例は [ショーケース](./showcase.md) を参照してください。

## 実運用での確認ルール

lint は有効ですが、目視確認の代わりにはなりません。ルーティングとラベルが固まったら、最後に PNG / SVG / PDF を 1 回は開いて確認します。特に `document` / `hexagon` / `parallelogram` / `trapezoid` が矢印や外枠に近い場合は、見た目も必ず確認します。

swimlane や外枠フレームを使う図では、意図したケースを除き `edge-rect-border`、`edge-shape-border`、`rect-shape-border` を配線バグとして扱うのがおすすめです。
