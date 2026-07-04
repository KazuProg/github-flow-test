# Contributing

## ブランチ運用

- `main` に向けて開発ブランチ(`feature/*`, `fix/*`, `chore/*` など)から PR を作成する
- PR は **Rebase and merge** で `main` に統合する
- マージされて `main` に push されると、`.github/workflows/release.yml` が [semantic-release](https://semantic-release.gitbook.io/semantic-release/) を実行し、バージョン bump・`CHANGELOG.md` 更新・`package.json` の version 更新・タグ作成・GitHub Release 作成を自動で行う

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

- マージされたコミットに `feat:` が1つでもあれば **minor** バージョンアップ
- なければ(`fix`/`chore`/`refactor` 等のみ、規約に沿わないコミットのみの場合も含む)**必ず patch** バージョンアップ
- メジャーバージョンの自動アップは非対応(`BREAKING CHANGE` フッターや `!` が付いていても patch までしか上がらない)

この挙動は `.releaserc.json` の `releaseRules` を以下のように最小構成にすることで実現している。

```json
"releaseRules": [
  { "type": "feat", "release": "minor" },
  { "release": "patch" }
]
```

`@semantic-release/commit-analyzer` はカスタム `releaseRules` に1つもマッチしなかった場合のみ `BREAKING CHANGE → major` を含むデフォルトルールにフォールバックする。上記の2番目のルール(`type` を指定しない = 常にマッチする)を用意しておくことで、あらゆるコミットに独自ルールが必ず1つはマッチする状態になり、デフォルトルールへのフォールバック(=majorへの昇格)が構造的に起きなくなる。

### 規約に沿わないコミット

Conventional Commits 形式に従っていないコミットメッセージは、`CHANGELOG.md` の本文には掲載されない。ただし上記 `releaseRules` の万能マッチにより、バージョンの patch アップ自体は発生する。リリースノートの可読性のため規約に沿った記述を推奨する。

### 心がけること

- 1コミット1トピックにする(各コミットがそのまま CHANGELOG の1行になるため)
- `chore`/`docs` のみの PR でも patch リリースが自動発行される

## CHANGELOG.md の説明文

`CHANGELOG.md` 冒頭のタイトル + 説明文(`# Changelog` から始まる段落)は、`.releaserc.json` の `@semantic-release/changelog` 設定にある `changelogTitle` と完全一致させる必要がある。

`@semantic-release/changelog` は `changelogTitle` と完全一致する先頭部分だけをタイトルとして固定し、新しいリリースエントリをその直後に挿入する。一致しない場合、既存の説明文は「タイトル」として認識されず、新しいリリースエントリの下に押し出されてしまう。

冒頭の文言を変更する場合は、`CHANGELOG.md` と `.releaserc.json` の `changelogTitle` を必ず同時に更新すること。
