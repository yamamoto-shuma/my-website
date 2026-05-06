## MODIFIED Requirements

### Requirement: mainブランチへのpushで自動デプロイが実行される
`main` ブランチへのpushをトリガーとして、GitHub Actionsワークフローが起動し、S3への静的ファイル同期とCloudFrontのキャッシュ無効化（`/*`）が実行されなければならない（SHALL）。S3 syncは `data/questions/*` を除外しなければならない（SHALL）。これによりデプロイがクイズJSONデータを削除しない。

#### Scenario: mainへのpushでワークフローが起動する
- **WHEN** `main` ブランチにコミットをpushする
- **THEN** GitHub Actionsの `deploy` ワークフローが自動起動する

#### Scenario: S3に静的ファイルが同期される
- **WHEN** デプロイワークフローが実行される
- **THEN** リポジトリの静的HTMLファイルがS3バケットに同期される（削除も含む）

#### Scenario: S3 syncがクイズデータを除外する
- **WHEN** デプロイワークフローが実行される
- **THEN** `aws s3 sync` コマンドに `--exclude "data/questions/*"` が含まれており、S3の `data/questions/` 以下のファイルが削除されない

#### Scenario: CloudFrontのキャッシュが全無効化される
- **WHEN** S3同期が完了する
- **THEN** CloudFront Distributionに対して `/*` のInvalidationが実行される

#### Scenario: デプロイ完了後にサイトが更新されている
- **WHEN** Invalidationのステータスが `Completed` になる
- **THEN** カスタムドメインにアクセスすると最新のコンテンツが返される
