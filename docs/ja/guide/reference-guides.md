# Reference ガイド

## リポジトリ内の参照資料

参照資料のソースはリポジトリ内に置いています。

- [英語レイアウトガイドライン](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/layout-guidelines.en.md)
- [英語 AWS アイコンガイド](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/aws-icons.en.md)
- [日本語レイアウトガイドライン](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/layout-guidelines.md)
- [日本語 AWS アイコンガイド](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/references/aws-icons.md)

## 押さえておきたいレイアウト指針

- 関連要素は明示的にグループ化する
- 矢印の曲がりと矢じり周辺に十分な余白を残す
- 左から右、または上から下の流れを決めて配置する
- 日本語ラベルは早めに広めの幅を確保する

## AWS アイコン運用

- 略称ではなく正式なサービス名を優先する
- legacy の `aws3` ではなく `mxgraph.aws4.*` を使う
- 同梱の検索 helper は次のように使えます

```bash
uv run python scripts/find_aws_icon.py lambda
```

## スキル向けドキュメント

- [エージェント向け SKILL.md](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/SKILL.md)
- [README.md](https://github.com/Sunwood-ai-labs/draw-io-skill/blob/main/README.md)
