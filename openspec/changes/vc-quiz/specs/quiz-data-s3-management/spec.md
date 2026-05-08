## ADDED Requirements

### Requirement: 声優データと作品データをS3バケットで管理する
声優データ（`voice_actors.json`）と作品データ（`titles.json`）はS3バケット（`yamamoto-shuma-my-website-prod`）の `data/vc-quiz/` プレフィックス以下にのみ存在しなければならない（SHALL）。GitHubリポジトリにはこれらのJSONを含めてはならない（SHALL NOT）。

#### Scenario: S3に声優データと作品データが存在する
- **WHEN** S3バケットの `data/vc-quiz/` プレフィックスを確認する
- **THEN** `voice_actors.json` と `titles.json` が存在する

#### Scenario: Gitリポジトリにvc-quizデータが含まれない
- **WHEN** `git ls-files public/data/vc-quiz/` を実行する
- **THEN** 出力が空である（追跡ファイルなし）

### Requirement: npm scriptsで声優データ・作品データのS3同期コマンドを提供する
`package.json` に以下のスクリプトを追加しなければならない（SHALL）。
- `vc-quiz:pull`: S3から `public/data/vc-quiz/` にデータを取得
- `vc-quiz:push`: `public/data/vc-quiz/` からS3にデータをアップロード

#### Scenario: vc-quiz:pullでデータ取得できる
- **WHEN** `npm run vc-quiz:pull` を実行する
- **THEN** `public/data/vc-quiz/` に `voice_actors.json` と `titles.json` がダウンロードされる

#### Scenario: vc-quiz:pushでデータ更新できる
- **WHEN** ローカルでJSONを編集後 `npm run vc-quiz:push` を実行する
- **THEN** 変更がS3の `data/vc-quiz/` プレフィックスに反映される

### Requirement: デプロイ時に声優データ・作品データが削除されない
GitHub ActionsのS3 syncコマンドは `data/vc-quiz/*` を除外しなければならない（SHALL）。これによりデプロイが声優データ・作品データを削除しない。

#### Scenario: S3 syncがvc-quizデータを除外する
- **WHEN** デプロイワークフローが実行される
- **THEN** `aws s3 sync` コマンドに `--exclude "data/vc-quiz/*"` が含まれており、S3の `data/vc-quiz/` 以下のファイルが削除されない

## MODIFIED Requirements

### Requirement: クイズJSONデータをS3バケットで管理する
AWSクイズデータ（各サービスのJSON）はS3バケット（`yamamoto-shuma-my-website-prod`）の `data/aws-quiz/` プレフィックス以下にのみ存在しなければならない（SHALL）。GitHubリポジトリにはAWSクイズJSONを含めてはならない（SHALL NOT）。

#### Scenario: S3にAWSクイズデータが存在する
- **WHEN** S3バケットの `data/aws-quiz/` プレフィックスを確認する
- **THEN** 各サービスのJSONファイルが存在する

#### Scenario: GitリポジトリにクイズJSONが含まれない
- **WHEN** `git ls-files public/data/aws-quiz/` を実行する
- **THEN** 出力が空である（追跡ファイルなし）

### Requirement: npm scriptsでS3同期コマンドを提供する
`package.json` に以下のスクリプトが存在しなければならない（SHALL）。
- `quiz:pull`: S3から `public/data/aws-quiz/` にデータを取得
- `quiz:push`: `public/data/aws-quiz/` からS3にデータをアップロード
- `quiz:invalidate`: CloudFrontキャッシュをインバリデーション

#### Scenario: quiz:pullでデータ取得できる
- **WHEN** `npm run quiz:pull` を実行する
- **THEN** `public/data/aws-quiz/` に全JSONファイルがダウンロードされる

#### Scenario: quiz:pushでデータ更新できる
- **WHEN** ローカルでJSONを編集後 `npm run quiz:push` を実行する
- **THEN** 変更がS3の `data/aws-quiz/` プレフィックスに反映される

#### Scenario: quiz:invalidateでCloudFrontキャッシュが無効化される
- **WHEN** `npm run quiz:invalidate` を実行する
- **THEN** CloudFrontの `/data/aws-quiz/*` パスのキャッシュがインバリデーションされる
