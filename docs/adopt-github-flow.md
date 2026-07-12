# GitHub Flow + 自動リリース導入ガイド

このリポジトリで検証している「単一 `main` ブランチ + Conventional Commits + [cocogitto](https://docs.cocogitto.io/) による全自動リリース」の仕組みを、別リポジトリに導入する際の手順書。このリポジトリを渡された状態で作業する前提でまとめている。

コミット規約・バージョン bump ルールの詳細は [CONTRIBUTING.md](../CONTRIBUTING.md) を参照。設計判断の理由は「既知の落とし穴」節にまとめている。このガイドでは「導入時に何をすべきか」に絞る。

## 前提条件

- GitHub でホストされたリポジトリで、`main`(または任意の1本)を唯一の長命ブランチとして運用できる
- PR のマージ方式を **Rebase and merge** または **Merge commit** に統一できる(個々のコミットが `main` の履歴に残る方式であることが必須)。**Squash and merge** を使う場合は圧縮後のコミットメッセージ自体を Conventional Commits 形式にする必要がある(詳細は [CONTRIBUTING.md](../CONTRIBUTING.md) を参照)
- ブランチ保護で Required status checks を設定できる権限がある
- (任意)このリポジトリと同様に「PR経由の変更のみ許可」を強制する場合は、Rulesets作成・Deploy Key登録・Secrets設定を行えるリポジトリ管理者権限が必要(「GitHubリポジトリ設定」節を参照)

## コピーするファイル

| ファイル | 対応 |
| --- | --- |
| [`cog.toml`](../cog.toml) | 要カスタマイズ(後述) |
| [`.github/workflows/lint-commits.yml`](../.github/workflows/lint-commits.yml) | 言語非依存。そのままコピー可。commitlint は `package.json` の依存に持たせず、workflow 側で `npx --package` を使って都度オンデマンド取得している(CI 専用ツールをマニフェストに残さない設計) |
| [`.github/workflows/release.yml`](../.github/workflows/release.yml) | 言語非依存。そのままコピー可 |
| `CHANGELOG.md` | 新規作成。`- - -` という行単独のマーカーが必須(無いと `cog bump` が失敗する) |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) のブランチ運用・コミット規約セクション | 対象リポジトリ向けに文言調整して転記 |
| [`.github/workflows/no-fixup-commits.yml`](../.github/workflows/no-fixup-commits.yml) | 言語非依存。`No Fixup Commits` ルールセット(後述)を使う場合のみ必要 |
| [`.github/workflows/bump-level-label.yml`](../.github/workflows/bump-level-label.yml) | 言語非依存。PRにbumpレベルのラベルを自動付与する任意機能。無くても release workflow は動く |
| [`scripts/create-labels.sh`](../scripts/create-labels.sh) | `bump-level-label.yml` と `release.yml` の `no-release` スキップが参照する4ラベル(`major-update`/`minor-update`/`patch-update`/`no-release`)を作成する。導入時に1回実行する |

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

### 複数マニフェストを独立してバージョニングしたい場合

`pre_bump_hooks` で複数マニフェストを書き換える構成は、リポジトリ全体のコミット履歴で単一のバージョンを算出し、対象マニフェスト全部に同じ番号を書き込む(= 常にロックステップで動く)。パッケージごとに別々のバージョン・タグ・CHANGELOG で独立運用したい場合の制約は [CONTRIBUTING.md](../CONTRIBUTING.md) の「Node/Python の同期バージョニング」節を参照。

## GitHubリポジトリ設定(ファイルとしてコピーできないもの)

ここまでの「コピーするファイル」はすべてリポジトリ内のファイルだが、このリポジトリは追加で2つのGitHub Rulesetsを `main` に設定している。Rulesetsはリポジトリのファイルではなく GitHub 側の設定(Settings → Rules → Rulesets)のため、ファイルをコピーするだけでは再現できない。厳格な保護が不要なら、この節はスキップしてよい(release workflow 自体はブランチ保護が無くても動く)。

### 1. PR必須ルールセット

```json
{
  "name": "Default Branch Protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "exclude": [], "include": ["~DEFAULT_BRANCH"] } },
  "rules": [
    { "type": "creation" },
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": true,
        "required_reviewers": [],
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["rebase"]
      }
    }
  ]
}
```

### 2. no-fixup-commits必須チェックルールセット

`.github/workflows/no-fixup-commits.yml` をコピー済みであることが前提。

```json
{
  "name": "No Fixup Commits",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "exclude": [], "include": ["~DEFAULT_BRANCH"] } },
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "do_not_enforce_on_create": true,
        "required_status_checks": [{ "context": "no-fixup-commits" }]
      }
    }
  ]
}
```

上記2つのJSONをそれぞれファイルに保存し、以下で作成する:

```bash
gh api --method POST repos/<owner>/<repo>/rulesets --input default-branch-protection.json
gh api --method POST repos/<owner>/<repo>/rulesets --input no-fixup-commits.json
```

### 3. cocogittoの直接pushを通すDeploy Key

上記2つのルールセットは `main` への直接pushも拒否する(`GITHUB_TOKEN` にはbypassする手段が無い)。cocogittoの `post_bump_hooks` による `git push` を通すには、write権限付きのSSH Deploy Keyを両ルールセットのbypass actorとして登録する。

```bash
# 1. 鍵ペアを生成
ssh-keygen -t ed25519 -N "" -f release-deploy-key -C "release-bot@<repo>"

# 2. write権限付きでDeploy Keyとして登録(idを控える)
gh api repos/<owner>/<repo>/keys -f title="release-bot" -f key="$(cat release-deploy-key.pub)" -F read_only=false

# 3. 秘密鍵をrepository secretとして保存
gh secret set RELEASE_DEPLOY_KEY --repo <owner>/<repo> < release-deploy-key

# 4. 鍵ペアのローカルコピーを削除
rm -f release-deploy-key release-deploy-key.pub
```

その後、両ルールセットの `bypass_actors` に以下を追加する(既存の `rules`/`conditions` は変更せず、`bypass_actors` フィールドだけ追加した全体を `PUT` で送る):

```json
{ "actor_type": "DeployKey", "actor_id": null, "bypass_mode": "always" }
```

最後に、`release.yml` の `Checkout` ステップに `ssh-key: ${{ secrets.RELEASE_DEPLOY_KEY }}` を指定する(このリポジトリの `release.yml` は既にこの設定済みなので、そのままコピーすれば反映される)。

## カスタマイズが必要な設定値

- `tag_prefix`: タグの接頭辞
- `[changelog] owner` / `repository`: GitHub の org/repo 名
- `[commit_types.<type>] bump_patch` / `bump_minor`: どの type を成果物のバージョンに影響する変更とみなすかは、対象プロジェクトの性質に応じて type ごとに見直す(catch-all ルールが無いため、無指定の型は静的にバンプ対象外になる)。例えばこのリポジトリでは `ci` の変更自体が実質的な成果物(リリース自動化の仕組み)への機能追加・更新とみなし `bump_minor = true` にしているが、CI設定がリリース物と無関係な一般的なプロジェクトでは `ci` を対象外にするのが標準的
- `branch_whitelist`: リリース対象ブランチ

## 既知の落とし穴

- catch-all のバンプルールが無い。型ごとに `bump_patch`/`bump_minor` を明示しない限りバージョンは上がらない
- 現在のバージョンの major が `0` の間は `BREAKING CHANGE`/`!` があっても major bump されない(cocogitto にハードコードされており設定で無効化できない)。`1.0.0` から運用を始めるとこの制約を回避できる
- `CHANGELOG.md` に `- - -` マーカー行が無いと `cog bump` 自体が失敗する
- マージ方式(Rebase and merge / Merge commit / Squash and merge のいずれでも)によらず、PR の `head.sha` と `main` にマージされた後のコミット SHA は一致しない。release workflow を `pull_request: closed` でトリガーする場合、`actions/checkout` で明示的に `ref: main` を指定し、リリース有無の判定も `github.sha` ではなくワークフロー内で記録した pre-bump HEAD との比較で行う
- release workflow を `push: branches: [main]` トリガーにすると、cocogitto の bump commit 自身が同じ workflow を再トリガーする。これを防ぐために bump commit へ GitHub 標準の `[skip ci]` キーワードを付ける対処は別の問題を生む: `[skip ci]` はそのコミットに対する **全 workflow の check run** を抑制してしまう(特定の workflow だけを止められない)ため、「このコミットだけ CI をスキップしたい」と「必須ステータスチェックとして運用したい」が両立しなくなり、チェックが一度も report されないまま PR がブロックされ続ける。`pull_request: types: [closed]` + `github.event.pull_request.merged == true` ガードに切り替えれば、bump commit の `git push` はこのトリガー条件に一致しないため再トリガー自体が起きず、`[skip ci]` も不要になる
- 外部 CD(デプロイ先のプラットフォーム等)を連携させる場合、`main` への push ではなく `release: published` イベントをトリガーにする。PR のマージコミットと cocogitto の bump commit は別々に `main` へ push されるため、push トリガーだと1回のリリースで2回デプロイが走る
- `pull_request: closed` トリガーは `startup_failure` のような GitHub 側の起動エラーが起きても re-run できない。手動での復旧手段として `workflow_dispatch` を併設し、job の `if:` 条件は `github.event_name == 'workflow_dispatch'` を先頭に OR で追加する(`workflow_dispatch` イベントには `github.event.pull_request` が存在しないため、既存条件のままだと手動実行時に job がスキップされる)
- 対象リポジトリの `main` に「PR経由の変更のみ許可」等のブランチ保護ルールセットが設定されている場合、cocogittoの `post_bump_hooks` による直接pushは `GITHUB_TOKEN` では拒否される。対応手順は「GitHubリポジトリ設定(ファイルとしてコピーできないもの)」節を参照

## 導入後の検証手順

- `cog bump --auto` の挙動を、実際の CI に載せる前に scratch git repo で検証する。cocogitto の挙動(bump ルール・CHANGELOG 挿入・hooks)には非自明な癖があるため、本番相当の設定を信用する前に使い捨てリポジトリで確認する。[cocogitto releases](https://github.com/cocogitto/cocogitto/releases) から `cog` バイナリ(`x86_64-unknown-linux-musl` tarball が Linux コンテナ内で追加セットアップ無しに動く)を取得し、検証したい型のコミットを積んだ使い捨てリポジトリで `cog bump --auto` を実行する
- `scripts/create-labels.sh` を実行し、`major-update`/`minor-update`/`patch-update`/`no-release` の4ラベルを作成する(`bump-level-label.yml` を導入しない場合は `no-release` のみで足りる)
- ブランチ保護の Required status checks に release workflow のジョブを追加する(`no-release` ラベル付き PR でもジョブ自体は成功で完了する設計のため、必須チェックとして運用しても問題ない)
