# Contributing

## ブランチ運用

- `main` に向けて開発ブランチ(`feature/*`, `fix/*`, `chore/*` など)から PR を作成する
- PR は **Rebase and merge** で `main` に統合する
- マージされると `.github/workflows/release.yml` が自動でバージョン bump・CHANGELOG 更新・タグ作成・GitHub Release 作成を行う

## コミットメッセージ規約

rebase-merge では PR 内の各コミットがそのまま `main` の履歴に残り、**個々のコミットメッセージ**がバージョン判定と CHANGELOG 生成の入力になる(PR タイトルではない)。[Conventional Commits](https://www.conventionalcommits.org/) 形式で書くこと。

```
<type>(<scope>): <subject>
```

`<scope>` は省略可。

### type 一覧

| type | 意味 | CHANGELOG 見出し |
| --- | --- | --- |
| `feat` | 新機能 | Features |
| `fix` | バグ修正 | Bug Fixes |
| `perf` | パフォーマンス改善 | Performance Improvements |
| `revert` | 過去コミットの取り消し | Reverts |
| `refactor` | 機能変更を伴わないコード整理 | Code Refactoring |
| `docs` | ドキュメントのみの変更 | Documentation |
| `style` | フォーマット等の変更(ロジック変更なし) | Styles |
| `test` | テストの追加・修正 | Tests |
| `build` | ビルドシステム・依存関係の変更 | Build System |
| `ci` | CI 設定の変更 | Continuous Integration |
| `chore` | 上記に該当しない雑多な変更 | Chores |

### バージョン bump のルール

- PR 内のコミットに `feat:` が1つでもあれば **minor** バージョンアップ
- なければ(`fix`/`chore`/`refactor` 等のみ)**patch** バージョンアップ
- メジャーバージョンの自動アップは非対応

### 規約に沿わないコミット

Conventional Commits 形式に従っていないコミットメッセージは、CHANGELOG の `Other Changes` にそのままの文言で掲載される。判定・生成に支障はないが、リリースノートの可読性のため規約に沿った記述を推奨する。

### 心がけること

- 1コミット1トピックにする(各コミットがそのまま CHANGELOG の1行になるため)
- `chore`/`docs` のみの PR でも patch リリースが自動発行される
