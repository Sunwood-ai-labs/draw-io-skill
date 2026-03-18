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
node scripts/check-drawio-svg-overlaps.mjs fixtures/label-rect-overlap/label-rect-overlap.drawio
node scripts/check-drawio-svg-overlaps.mjs fixtures/text-cell-overflow/text-cell-overflow.drawio
node scripts/check-drawio-svg-overlaps.mjs fixtures/text-contrast/text-contrast.drawio
node scripts/check-drawio-svg-overlaps.mjs fixtures/text-emphasis/text-emphasis.drawio
```

現在の検知対象:

- `edge-edge`
- `edge-rect-border` 箱や大きいフレームの枠線に沿う、または重なる線
- `edge-shape-border` `document` / `hexagon` / `parallelogram` / `trapezoid` など、対応する非矩形 shape の枠線に沿う、または重なる線
- `edge-rect`
- `edge-terminal` 最後の曲がり角から矢印先端までの直線が短すぎるケース
- `edge-label` 配線がラベル文字の領域を突っ切るケース
- `label-rect` ラベル文字の領域に別の箱やカードが食い込むケース
- `rect-shape-border` 箱やフレームの枠線が、対応する非矩形 shape の枠線に沿う、または重なるケース
- `text-contrast` 明示された背景色に対して文字色の差が小さすぎるケース
- `text-emphasis` 暗色のコンパクトなカードで、見出しと本文が 1 つの密な塊として見えるケース
- `text-overflow(width)`
- `text-overflow(height)`

checker は `.drawio` と `.drawio.svg` の両方を受け付けます。`.drawio` を直接渡した場合は companion の draw.io geometry も読むので、`label-rect` と文字フィット判定が編集ソースに近い形で行われます。

`fixtures/border-overlap/...`、`fixtures/large-frame-border-overlap/...`、`fixtures/shape-border-overlap/...`、`fixtures/label-rect-overlap/...`、`fixtures/text-cell-overflow/...`、`fixtures/text-contrast/...`、`fixtures/text-emphasis/...`、`fixtures/shape-text-overflow/...` を使い分けることで、細い箱枠、大きいセクション枠、対応する非矩形 shape 枠線、label-box 重なり、text cell の文字はみ出し、低コントラスト文字、暗色カードの文字階層不足、shape-aware な文字はみ出しをそれぞれ回帰テストできます。`edge-terminal`、`edge-label`、`label-rect`、`text-emphasis` は、export 後に起きやすい「矢印先端のちょい線」「ラベル文字の突っ切り」「注釈 box がラベルにかぶさる」「暗色カードで見出しと本文が溶ける」を拾うための追加ヒューリスティクスです。

リポジトリルートの `npm run verify` は、これらの fixture を回したあとに docs site まで build するので、公開前や skill 更新前のフル確認に向いています。

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

`edge-terminal` が出たら、最後の曲がり角をターゲットから離すか、矢印先端の手前に 20px 以上の直線区間を確保するのがおすすめです。`edge-label` が出たら、配線を逃がすか、ラベル位置をずらして文字の余白を確保してください。

`label-rect` が出たら、レイヤー順でごまかさず、注釈 box 側かラベル側を動かして重なりを解消するのがおすすめです。

`text-contrast` が出たら、背景と文字の実コントラストを上げます。質感やノイズで誤魔化さず、まず色差を広げます。

`text-emphasis` が出たら、見出し chip を分ける、本文を別 text cell にする、余白を増やす、などで階層を強めるのがおすすめです。
