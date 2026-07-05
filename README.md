# github-flow-test

[![Release](https://github.com/KazuProg/github-flow-test/actions/workflows/release.yml/badge.svg)](https://github.com/KazuProg/github-flow-test/actions/workflows/release.yml)

GitHub Flow + Conventional Commits ベースの自動リリース検証用リポジトリ。

自動リリース(バージョン bump・CHANGELOG 更新・タグ・GitHub Release 作成)は [cocogitto](https://docs.cocogitto.io/) で行っている。

コミットメッセージ規約は [CONTRIBUTING.md](CONTRIBUTING.md) を参照。

## このリポジトリで検証していること

- CI専用ツール(linter等)は `package.json`/`pyproject.toml` に依存として持たせず、`.github/workflows/*.yml` 側でオンデマンド取得して完結させる
- プロジェクト・設定ファイルへの介入を必要最小限に保つ
- `main` への直接pushを行わず、必ずブランチ + PR経由でマージする
- 成果物(`package.json`/`pyproject.toml` のバージョン)に実質的な変更が無いコミット種別(`ci`/`docs`/`style`/`test`/`chore`)ではリリースを発行しない
- リリースさせたくないPRには `no-release` ラベルを付けてマージすることでリリース処理だけをスキップできる(コミットメッセージへの予約語混入は不要。他のワークフローの必須チェックにも影響しない)
