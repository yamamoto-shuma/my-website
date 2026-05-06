## ADDED Requirements

### Requirement: クイズJSONデータをS3バケットで管理する
クイズ問題データ（JSON）はS3バケット（`yamamoto-shuma-my-website-prod`）の `data/questions/` プレフィックス以下にのみ存在しなければならない（SHALL）。GitHubリポジトリにはクイズJSONを含めてはならない（SHALL NOT）。

#### Scenario: S3にクイズデータが存在する
- **WHEN** S3バケットの `data/questions/` プレフィックスを確認する
- **THEN** 各サービスのJSONファイルが存在する

#### Scenario: GitリポジトリにクイズJSONが含まれない
- **WHEN** `git ls-files src/data/questions/ public/data/` を実行する
- **THEN** 出力が空である（追跡ファイルなし）

### Requirement: .gitignoreでクイズデータの流出を防止する
`public/data/` ディレクトリは `.gitignore` に記載されていなければならない（SHALL）。これにより `git add .` 実行時もデータがステージングされない。

#### Scenario: データファイルがgit管理外である
- **WHEN** `public/data/questions/iam.json` が存在する状態で `git status` を実行する
- **THEN** そのファイルがuntracked filesに表示されない（gitignore有効）

### Requirement: npm scriptsでS3同期コマンドを提供する
`package.json` に以下のスクリプトを追加しなければならない（SHALL）。
- `quiz:pull`: S3から `public/data/questions/` にデータを取得
- `quiz:push`: `public/data/questions/` からS3にデータをアップロード
- `quiz:invalidate`: CloudFrontキャッシュをインバリデーション

#### Scenario: quiz:pullでデータ取得できる
- **WHEN** `npm run quiz:pull` を実行する
- **THEN** `public/data/questions/` に全JSONファイルがダウンロードされる

#### Scenario: quiz:pushでデータ更新できる
- **WHEN** ローカルでJSONを編集後 `npm run quiz:push` を実行する
- **THEN** 変更が S3 `data/questions/` プレフィックスに反映される

#### Scenario: quiz:invalidateでCloudFrontキャッシュが無効化される
- **WHEN** `npm run quiz:invalidate` を実行する
- **THEN** CloudFrontの `/data/questions/*` パスのキャッシュがインバリデーションされる

### Requirement: S3 Versioningによるデータ保護
S3バケットでVersioningが有効でなければならない（SHALL）。誤削除・誤上書き時に過去バージョンから復元できる。

#### Scenario: Versioningが有効である
- **WHEN** `terraform/prod/` で `terraform show` を実行しS3バケット設定を確認する
- **THEN** `versioning_configuration.status = "Enabled"` が設定されている
