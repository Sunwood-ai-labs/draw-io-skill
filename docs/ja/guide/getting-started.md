# はじめに

## このリポジトリでできること

`draw-io-skill` は、スキルとして再利用しつつ、通常のリポジトリ運用でもそのまま使えることを狙っています。

- native `.drawio` を直接編集する
- draw.io CLI の細かいフラグを覚えずに export する
- 公開前に SVG lint を走らせる

## ローカルセットアップ

```bash
npm install
uv run python -m py_compile scripts/find_aws_icon.py
```

## 同梱チェックを動かす

```bash
npm run check
node scripts/export-drawio.mjs fixtures/basic/basic.drawio --format svg
node scripts/check-drawio-svg-overlaps.mjs fixtures/basic/basic.drawio.svg
```

## スキルとして接続する

### Codex on Windows

```powershell
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git D:\Prj\draw-io-skill
cmd /c mklink /J C:\Users\YOUR_NAME\.codex\skills\draw-io D:\Prj\draw-io-skill
```

### Claude Code

```bash
git clone https://github.com/Sunwood-ai-labs/draw-io-skill.git ~/.claude/skills/drawio
```

## ドキュメントをローカル build する

```bash
npm ci
npm run docs:build
```

対話プレビュー:

```bash
npm run docs:dev
```
