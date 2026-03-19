# ショーケース

`draw-io-skill` には、用途の違うサンプル図をいくつか同梱しています。リポジトリ説明用、lint 確認用、見せ方を強めたアイコン付きレイアウト用を分けて持っているので、内向きの作業図ではなくショーケース寄りに見せたいときの土台として使えます。

## リポジトリ構成の全体図

![draw-io-skill の構成図](../../../assets/draw-io-skill-structure.ja.drawio.png)

リポジトリのまとまりや、主要な workflow surface のつながりを説明したいときに使うサンプルです。

- `assets/draw-io-skill-structure.drawio`
- `assets/draw-io-skill-structure.drawio.png`
- `assets/draw-io-skill-structure.drawio.svg`
- `assets/draw-io-skill-structure.ja.drawio`
- `assets/draw-io-skill-structure.ja.drawio.png`
- `assets/draw-io-skill-structure.ja.drawio.svg`

## lint 確認用サンプル

![shape-aware lint 確認用サンプル](../../../assets/draw-io-skill-structure-shapes.drawio.png)

SVG export 後に、線の混み具合、文字の収まり、非矩形 shape の周辺を重点的に確認したいときに使うサンプルです。

- `document` / `hexagon` / `parallelogram` / `trapezoid` の文字配置を目視しやすい
- 矢印と shape、外枠と shape の接触を lint 後に見直しやすい
- `fixtures/shape-border-overlap` と `fixtures/shape-text-overflow` の回帰確認と組み合わせやすい

アセット:

- `assets/draw-io-skill-structure-shapes.drawio`
- `assets/draw-io-skill-structure-shapes.drawio.png`
- `assets/draw-io-skill-structure-shapes.drawio.svg`

## アイコン付きブロック例

![ブロックアイコン例](../../../assets/draw-io-skill-structure-icons.ja.drawio.png)

同じ流れを、各ブロックに役割アイコンを持たせた見せ方へ作り替えたサンプルです。編集可能な `.drawio` を保ったまま、資料や README で見栄えを上げたいときのたたき台として使えます。

- `assets/draw-io-skill-structure-icons.drawio`
- `assets/draw-io-skill-structure-icons.drawio.png`
- `assets/draw-io-skill-structure-icons.drawio.svg`
- `assets/draw-io-skill-structure-icons.ja.drawio`
- `assets/draw-io-skill-structure-icons.ja.drawio.png`
- `assets/draw-io-skill-structure-icons.ja.drawio.svg`

## AWS 構成図へ広げるときの土台

このリポジトリには、固定の AWS 構成図を 1 枚だけ置いているわけではありませんが、AWS 図へ広げやすい材料はそろっています。

- `references/aws-icons.md`
- `scripts/find_aws_icon.py`
- `assets/draw-io-skill-structure-icons.drawio*`

ショーケース寄りの AWS 構成図を作りたいときは、まずブロックアイコン例を土台にして、各ブロックを `Route 53` と `CloudFront`、`API Gateway` と `Lambda`、`S3` と `DynamoDB` のようなサービス群へ置き換えるのがおすすめです。書き出しと lint の流れは [Export と lint](./export-and-lint.md) をそのまま使えます。

### 外部例のリンク

編集用ソースと公開用 SVG がそろっている外部リポジトリの実例として、`onizuka-game-agi-co` の次の組み合わせも参照できます。

- [`onizuka-game-agi-aws-architecture.drawio`](https://github.com/onizuka-agi-co/onizuka-game-agi-co/blob/main/docs/onizuka-game-agi-aws-architecture.drawio)
- [`onizuka-game-agi-aws-architecture.drawio.svg`](https://github.com/onizuka-agi-co/onizuka-game-agi-co/blob/main/docs/onizuka-game-agi-aws-architecture.drawio.svg)

ローカル同梱サンプルと見比べながら、実運用寄りの AWS 構成図が `.drawio` と `.svg` でどう並ぶかを確認したいときの参考になります。

### 短い prompt

```text
AWS reference-style icon view のテイストで native draw.io 図を作って。ライトテーマ、濃紺タイトルバー、シアンのアクセント、白いカード、公式 AWS アイコン、Noto Sans JP、orthogonal routing、そして AWS は local/GitHub/workflow を見せるための視覚比喩だと注記を入れて。
```
