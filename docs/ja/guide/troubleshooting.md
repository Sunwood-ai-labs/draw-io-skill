# トラブルシューティング

## draw.io CLI が見つからない

明示的にパスを渡します。

```bash
node scripts/export-drawio.mjs architecture.drawio --drawio "C:\\Program Files\\draw.io\\draw.io.exe"
```

macOS や Linux でも、環境に応じた実行ファイルを `--drawio` で指定できます。

## lint が意図した枠線接触を報告する

`edge-rect-border` は、枠線沿いの矢印が見た目上の事故になりやすいため、あえて厳しめです。

本当に意図した接触なら:

- 線の意図が見た目で分かるようにする
- export 結果を目視確認する
- コミットする図なら、周辺手順に例外として残す

## 文字はみ出しが誤検知に見える

文字チェックはヒューリスティックであり、ピクセル単位の完全一致ではありません。

まずは次を試してください。

- 箱を広げる
- ラベルを短くする
- 改行を明示する
- 日本語を使う図ではフォントを明示する

## docs は build できるのに Pages の見た目が崩れる

もっとも多い原因は GitHub Pages の base パス違いです。

このリポジトリの前提:

- リポジトリ名: `draw-io-skill`
- VitePress base: `/draw-io-skill/`

リポジトリ名を変えた場合は、VitePress の base を更新して再 build してください。

## Python helper が失敗する

helper は `uv` 前提です。

```bash
uv run python scripts/find_aws_icon.py lambda
```

`uv` が入っていない場合は、先に導入してから再実行してください。
