# GitHub Flow + 自動リリース導入ガイド

このリポジトリで検証している「単一 `main` ブランチ + Conventional Commits + [cocogitto](https://docs.cocogitto.io/) による全自動リリース」の仕組みを、別リポジトリに導入する際の手順書。このリポジトリを渡された状態で作業する前提でまとめている。

コミット規約・バージョン bump ルールの詳細は [CONTRIBUTING.md](../CONTRIBUTING.md) を参照。設計判断の理由は「既知の落とし穴」節にまとめている。このガイドでは「導入時に何をすべきか」に絞る。

## 前提条件

- GitHub でホストされたリポジトリで、`main`(または任意の1本)を唯一の長命ブランチとして運用できる
- PR のマージ方式を **Rebase and merge** に統一できる。Squash/Merge commit だと個々のコミットメッセージがバージョン判定・CHANGELOG 生成の入力にならず、この設計の前提が崩れる
- ブランチ保護で Required status checks を設定できる権限がある

## コピーするファイル

| ファイル | 対応 |
| --- | --- |
| [`cog.toml`](../cog.toml) | 要カスタマイズ(後述) |
| [`.github/workflows/lint-commits.yml`](../.github/workflows/lint-commits.yml) | 言語非依存。そのままコピー可 |
| [`.github/workflows/release.yml`](../.github/workflows/release.yml) | 言語非依存。そのままコピー可 |
| `CHANGELOG.md` | 新規作成。`- - -` という行単独のマーカーが必須(無いと `cog bump` が失敗する) |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) のブランチ運用・コミット規約セクション | 対象リポジトリ向けに文言調整して転記 |

## pre_bump_hooks: 対象プロジェクトごとのバージョン書き換え

`pre_bump_hooks` は cocogitto が解釈しない任意のシェルコマンド列で、バージョン文字列をどこにどう書き込むかは完全にフック側に委ねられている。対象マニフェストを書き換えられるコマンドを1行足せば、どの言語・ツールにも同じ考え方で対応できる。

優先順位は次の通り: そのマニフェストを扱う専用 CLI にバージョン書き換えコマンドがあればそれを使う(付随ファイルとの整合を CLI 側が保証してくれるため)。専用コマンドが無ければ `sed` 等での直接書き換えで代替する。

### Node.js (`package.json`)

```toml
pre_bump_hooks = [
  "npm version {{version}} --no-git-tag-version --allow-same-version",
]
```

### Python, ロックファイル無し(`pyproject.toml` のみ)

```toml
pre_bump_hooks = [
  "sed -i 's/^version = \".*\"$/version = \"{{version}}\"/' pyproject.toml",
]
```

### Python + uv(`uv.lock` を持つ場合)

```toml
pre_bump_hooks = [
  "uv version {{version}}",
]
```

`uv.lock` はロック対象プロジェクト自身のバージョンも `[[package]]` エントリとして保持している。`sed` で `pyproject.toml` だけ書き換えると `uv.lock` 側の記載が古いまま残り、`uv lock --check` や `uv sync --locked`/`--frozen` を使う CI ではハードエラーになる。`uv version {{version}}`(フラグ無し)は `pyproject.toml` の更新と `uv.lock` の再同期を1コマンドで行うため、こちらを使う。`--frozen` フラグを付けると `uv.lock` が再同期されずに残ってしまうため付けない。

### 汎用(単純な `VERSION` ファイル)

```toml
pre_bump_hooks = [
  "echo -n \"{{version}}\" > VERSION",
]
```

## カスタマイズが必要な設定値

- `tag_prefix`: タグの接頭辞
- `[changelog] owner` / `repository`: GitHub の org/repo 名
- `[commit_types.<type>] bump_patch` / `bump_minor`: 成果物に実質的な変更を伴う型のみ明示的に付与する(catch-all ルールが無いため、無指定の型は静的にバンプ対象外になる)
- `branch_whitelist`: リリース対象ブランチ

## 既知の落とし穴

- catch-all のバンプルールが無い。型ごとに `bump_patch`/`bump_minor` を明示しない限りバージョンは上がらない
- 現在のバージョンの major が `0` の間は `BREAKING CHANGE`/`!` があっても major bump されない(cocogitto にハードコードされており設定で無効化できない)。`1.0.0` から運用を始めるとこの制約を回避できる
- `CHANGELOG.md` に `- - -` マーカー行が無いと `cog bump` 自体が失敗する
- Rebase and merge では、PR の `head.sha` と `main` にマージされた後のコミット SHA が一致しない。release workflow を `pull_request: closed` でトリガーする場合、`actions/checkout` で明示的に `ref: main` を指定し、リリース有無の判定も `github.sha` ではなくワークフロー内で記録した pre-bump HEAD との比較で行う
- release workflow を `push: branches: [main]` トリガーにすると、cocogitto の bump commit 自身が同じ workflow を再トリガーする。`pull_request: types: [closed]` + `github.event.pull_request.merged == true` ガードにすることで回避でき、bump commit に `[skip ci]` を付ける必要も無くなる
- 外部 CD(デプロイ先のプラットフォーム等)を連携させる場合、`main` への push ではなく `release: published` イベントをトリガーにする。PR のマージコミットと cocogitto の bump commit は別々に `main` へ push されるため、push トリガーだと1回のリリースで2回デプロイが走る

## 導入後の検証手順

- `cog bump --auto` の挙動を、実際の CI に載せる前に scratch git repo で検証する。cocogitto の挙動(bump ルール・CHANGELOG 挿入・hooks)には非自明な癖があるため、本番相当の設定を信用する前に使い捨てリポジトリで確認する。[cocogitto releases](https://github.com/cocogitto/cocogitto/releases) から `cog` バイナリ(`x86_64-unknown-linux-musl` tarball が Linux コンテナ内で追加セットアップ無しに動く)を取得し、検証したい型のコミットを積んだ使い捨てリポジトリで `cog bump --auto` を実行する
- GitHub リポジトリに `no-release` ラベルを作成する
- ブランチ保護の Required status checks に release workflow のジョブを追加する(`no-release` ラベル付き PR でもジョブ自体は成功で完了する設計のため、必須チェックとして運用しても問題ない)
