# Contributing

## ブランチ運用

- `main` に向けて開発ブランチ(`feature/*`, `fix/*`, `chore/*` など)から PR を作成する
- PR は **Rebase and merge** で `main` に統合する
- マージされて `main` に push されると、`.github/workflows/release.yml` が [semantic-release](https://semantic-release.gitbook.io/semantic-release/) を実行し、バージョン bump・`CHANGELOG.md` 更新・`package.json` の version 更新・タグ作成・GitHub Release 作成を自動で行う

## コミットメッセージ規約

rebase-merge では PR 内の各コミットがそのまま `main` の履歴に残り、**個々のコミットメッセージ**がバージョン判定と CHANGELOG 生成の入力になる(PR タイトルではない)。[Conventional Commits](https://www.conventionalcommits.org/) 形式で書くこと。

PR の作成・更新時に `.github/workflows/lint-commits.yml` が [commitlint](https://commitlint.js.org/) で各コミットの形式を自動チェックする。

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

- コミットの本文/フッターに `BREAKING CHANGE:` があるか、`type!:` のように `!` が付いていれば **major** バージョンアップ
- そうでないコミットに `feat:` が1つでもあれば **minor** バージョンアップ
- どちらでもなければ(`fix`/`chore`/`refactor` 等のみ、規約に沿わないコミットのみの場合も含む)**必ず patch** バージョンアップ

この挙動は `.releaserc.json` の `commit-analyzer` プラグインで次のように設定している。

```json
[
  "@semantic-release/commit-analyzer",
  {
    "preset": "conventionalcommits",
    "releaseRules": [
      { "breaking": true, "release": "major" },
      { "type": "feat", "release": "minor" },
      { "release": "patch" }
    ]
  }
]
```

`preset: "conventionalcommits"` の指定が必須点に注意。デフォルトの Angular preset のパーサーは `type!: subject` の `!` 記法を認識できず(`headerPattern` に `!` を許容する構文が無い)、`BREAKING CHANGE:` フッターのみ検知できる状態になってしまう。

3番目のルール(`type` を指定しない = 常にマッチする)により、規約に沿わないコミットも含め、どのコミットにも独自ルールが必ず1つ以上マッチする。`@semantic-release/commit-analyzer` は複数のルールがマッチした場合、最も高いリリースレベル(major > minor > patch)を採用する。

### 規約に沿わないコミット

Conventional Commits 形式に従っていないコミットメッセージは、`CHANGELOG.md` の本文には掲載されない。ただし上記 `releaseRules` の万能マッチにより、バージョンの patch アップ自体は発生する。リリースノートの可読性のため規約に沿った記述を推奨する。

### 心がけること

- 1コミット1トピックにする(各コミットがそのまま CHANGELOG の1行になるため)
- `chore`/`docs` のみの PR でも patch リリースが自動発行される

## CHANGELOG.md の説明文

`CHANGELOG.md` 冒頭のタイトル + 説明文(`# Changelog` から始まる段落)は、`.releaserc.json` の `@semantic-release/changelog` 設定にある `changelogTitle` と完全一致させる必要がある。

`@semantic-release/changelog` は `changelogTitle` と完全一致する先頭部分だけをタイトルとして固定し、新しいリリースエントリをその直後に挿入する。一致しない場合、既存の説明文は「タイトル」として認識されず、新しいリリースエントリの下に押し出されてしまう。

冒頭の文言を変更する場合は、`CHANGELOG.md` と `.releaserc.json` の `changelogTitle` を必ず同時に更新すること。

## Python版(`pyproject.toml`)

リポジトリルートの `pyproject.toml` は同じ運用を [python-semantic-release](https://python-semantic-release.readthedocs.io/) で再現した例。`main` への push で `.github/workflows/release.yml` の `release-python` job(`release-node` の後に実行)が動作する。

- バージョンは `pyproject.toml` の `project.version` に記録
- タグは `python-v${version}` 形式(Node側の `v${version}` とは独立して追跡される)
- CHANGELOG は `CHANGELOG-python.md`(Node側の `CHANGELOG.md` とファイル名を分離)。`<!-- version list -->` コメントが新エントリの挿入位置マーカーになっており、削除すると更新されなくなる

**Node側・Python側は同じコミット履歴を見て同期してバージョンアップする**(`feat:` があれば両方 minor、`BREAKING CHANGE`/`!` があれば両方 major、それ以外は両方 patch)。Node用・Python用の変更を区別せず、リポジトリ全体のコミットで判定される。これは「両方の構成を見比べる」という検証目的に合わせた意図的な設計であり、将来Python側の変更だけを対象にしたい場合は `commit_parser = "conventional-monorepo"` と `path_filters` で独立させる拡張余地がある。

python-semantic-release は `BREAKING CHANGE`/`!` の検知を無効化する設定を持たないため、Node側のような「majorへ絶対に上がらない」仕組みは再現できない(そのため今回はNode側もmajorを有効化して合わせている)。
