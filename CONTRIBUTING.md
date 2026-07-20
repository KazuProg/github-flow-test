# Contributing

## ブランチ運用

- `main` に向けて開発ブランチ(`feature/*`, `fix/*`, `chore/*` など)から PR を作成する
- PR は `main` に統合する。**Rebase and merge** または **Merge commit** を使う(個々のコミットがそのまま `main` の履歴に残り、バージョン判定・CHANGELOG生成の入力になる方式のため)。**Squash and merge** を使う場合は圧縮後のコミットメッセージ自体を Conventional Commits 形式にする必要がある(`lint-commits.yml` は個別コミットのみを検査し、圧縮後メッセージは対象外)
- PR が `main` にマージされると、`.github/workflows/release.yml` が [cocogitto](https://docs.cocogitto.io/) を実行し、バージョン bump・`CHANGELOG.md` 更新・`package.json`/`pyproject.toml` の version 更新・タグ作成・GitHub Release 作成を自動で行う
- リリースさせたくないPRには `no-release` ラベルを付けてマージする(ワークフロー自体は実行されるが、リリース処理だけがスキップされる)

## コミットメッセージ規約

Rebase and merge / Merge commit では PR 内の各コミットがそのまま `main` の履歴に残り、**個々のコミットメッセージ**がバージョン判定と CHANGELOG 生成の入力になる(PR タイトルではない)。[Conventional Commits](https://www.conventionalcommits.org/) 形式で書くこと。

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
- そうでないコミットに `feat:`/`ci:` が1つでもあれば **minor** バージョンアップ
- そうでなくても `fix`/`perf`/`revert`/`refactor`/`build` のいずれかがあれば **patch** バージョンアップ
- `docs`/`style`/`test`/`chore` のみの場合は **バージョンアップされない**(成果物である `package.json`/`pyproject.toml` に実質的な変更が無いため)。この場合コミットはCHANGELOGにも一旦反映されず、次にバンプ対象のコミットが入ったリリースでまとめて反映される
- `ci` は例外的に `feat` と同じ minor バージョンアップ対象にしている。このリポジトリの成果物は実質的に「リリース自動化の仕組みそのもの」であり、CI設定の変更はその成果物への機能追加・更新に相当するため(一般的なプロジェクトでは `ci` をバンプ対象にしないのが標準。導入先での判断基準は [docs/adopt-github-flow.md](docs/adopt-github-flow.md) を参照)

cocogitto は標準設定では `fix`/`feat`/`BREAKING CHANGE` の3つしかバージョンに影響させず、それ以外の型では何もバージョンを上げない。「該当typeが無ければ常にpatch」というcatch-allルールが無いため、成果物に実質的な変更を伴う型のみ `cog.toml` の `[commit_types.<type>]` で `bump_minor`/`bump_patch` を明示している。

```toml
[commit_types.fix]
bump_patch = true

[commit_types.ci]
bump_minor = true

[commit_types.chore]
# bump_patch は付けない(成果物に影響しないため)

# ... 他 perf/revert/refactor/build は bump_patch あり、docs/style/test は無し
```

なお cocogitto は「現在のバージョンが `0.x` の間は BREAKING CHANGE があっても major へ上げない」という SemVer の初期開発規約をハードコードしており、設定で無効化できない。このリポジトリは `1.0.0` 以降で運用しているため、この制約には該当しない。

手動実行(`workflow_dispatch`)では `bump` input で `major`/`minor`/`patch` を明示指定でき、その場合は上記の自動判定ルールを上書きする。既定値の `auto` を選ぶと通常どおり自動判定される。

### 規約に沿わないコミット

Conventional Commits 形式としてパースできないコミットは、cocogitto によって**静的に無視される**(CHANGELOG に載らないだけでなく、バージョンにも一切影響しない)。PR時点で `.github/workflows/lint-commits.yml` の commitlint が形式を強制しているため、main にマージされた時点で規約違反のコミットが混入するリスクは低い。Merge commit で生成される GitHub 標準のマージコミット(例: `Merge pull request #12 from ...`)もこの無視対象に含まれる。

### 心がけること

- 1コミット1トピックにする(各コミットがそのまま CHANGELOG の1行になるため)
- `chore`/`docs`/`style`/`test` のみの PR ではリリースが発行されない(成果物に変更が無いため)。`ci` のみの PR はこのリポジトリでは minor リリース対象になる
- `fixup!`/`squash!` で始まるコミットを含むPRは `no-fixup-commits` チェックで弾かれる。マージ前に `git rebase -i --autosquash` 等で解消すること

## CHANGELOG.md のマーカー

`CHANGELOG.md` には `- - -` という文字列単独の行(cocogitto の区切りマーカー)が必要。cocogitto はこのマーカーを探し、その直後に新しいリリースエントリを挿入する。マーカーが無いと `cog bump` 自体が失敗する。

タイトル・説明文を変更する場合も、このマーカー行より前に置く限り自由に編集してよい(マーカー自体は削除しないこと)。

## CHANGELOG.md の日付

各リリースエントリの日付は cocogitto が `Utc::now()` で生成しており、**UTC** 表記になる。`cog.toml` にタイムゾーンを設定する項目はなく、実行環境(GitHub Actions ランナー等)のタイムゾーン設定にも依存しない。JST基準の日付とは最大9時間のずれが生じうる。

## Node/Python の同期バージョニング

`package.json`(Node)と `pyproject.toml`(Python)は**同じコミット履歴を見て同期してバージョンアップする**(`feat:` があれば両方 minor、`BREAKING CHANGE`/`!` があれば両方 major、それ以外は両方 patch)。タグ・CHANGELOG も Node/Python 共通で単一(`v{version}` タグ、`CHANGELOG.md` 一本)。

両方のマニフェストを1つのバージョンに書き換える処理は [cog.toml](cog.toml) の `pre_bump_hooks` を参照。

Node用・Python用の変更を区別せず、リポジトリ全体のコミットで判定される。これは「両方の構成を見比べる」という検証目的に合わせた意図的な設計であり、将来Python側の変更だけを対象にしたい場合は cocogitto の `[monorepo.packages.*]` 機能で独立させる拡張余地がある(ただし依存関係リゾルバーは Cargo/Maven/Npm のみで Python 未対応)。
