# アーキテクチャ

## リポジトリの主要サーフェス

![リポジトリ構成の概要](../../../assets/draw-io-skill-structure.ja.drawio.png)

日本語版の編集用ソースは
`../../../assets/draw-io-skill-structure.ja.drawio`
です。英語版が必要な場合は `../../../assets/draw-io-skill-structure.drawio` を参照してください。

lint 確認用やアイコン付きの見せ方サンプルは [ショーケース](./showcase.md) にまとめています。

## コアファイル

| パス | 役割 |
|------|------|
| `SKILL.md` | 図の作成、export、検証を行うためのエージェント向け手順 |
| `scripts/export-drawio.mjs` | draw.io CLI を包むクロスプラットフォーム helper |
| `scripts/check-drawio-svg-overlaps.mjs` | 重なり、枠線接触、箱貫通、文字はみ出しを検知する SVG lint |
| `scripts/find_aws_icon.py` | `uv` 経由で動かす AWS アイコン検索 helper |
| `fixtures/basic` | 正常系 lint 結果を確認する baseline fixture |
| `fixtures/border-overlap` | 枠線接触検知の回帰確認 fixture |
| `fixtures/shape-border-overlap` | 対応する非矩形 shape の枠線接触検知を確認する回帰 fixture |
| `references/layout-guidelines.md` | 箱、間隔、コンテナに関する実務指針 |
| `references/aws-icons.md` | AWS アイコン参照資料 |

## source と export を分けている理由

- `.drawio` が編集の正本
- export 物は再生成可能な成果物
- 埋め込み XML により export 後も再編集しやすい

この分離により、図の差分管理、再生成、レビューがしやすくなります。

## QA 戦略

このリポジトリは 3 層で QA を行います。

1. JavaScript ツールの構文確認
2. fixture ベースの lint 回帰確認
3. 公開ドキュメントサイトの build 検証

技術的なツール群と公開ドキュメントが CI で同じ基準に揃う構成です。
