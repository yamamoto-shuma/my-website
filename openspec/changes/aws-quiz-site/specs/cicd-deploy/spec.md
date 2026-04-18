## MODIFIED Requirements

### Requirement: mainブランチへのpushで自動デプロイが実行される
`main` ブランチへのpushをトリガーとして、GitHub Actionsワークフローが起動し、Reactアプリのビルド・S3への静的ファイル同期・CloudFrontのキャッシュ無効化（`/*`）が実行されなければならない（SHALL）。ビルドはS3同期の前に実行されなければならない（SHALL）。

#### Scenario: mainへのpushでワークフローが起動する
- **WHEN** `main` ブランチにコミットをpushする
- **THEN** GitHub Actionsの `deploy` ワークフローが自動起動する

#### Scenario: npmビルドが実行される
- **WHEN** デプロイワークフローが実行される
- **THEN** `npm ci` と `npm run build` が順に実行され、`public/aws-quiz/` にビルド成果物が出力される

#### Scenario: S3に静的ファイルが同期される
- **WHEN** npmビルドが完了する
- **THEN** `public/` 以下の全ファイル（ビルド成果物を含む）がS3バケットに同期される（削除も含む）

#### Scenario: CloudFrontのキャッシュが全無効化される
- **WHEN** S3同期が完了する
- **THEN** CloudFront Distributionに対して `/*` のInvalidationが実行される

#### Scenario: デプロイ完了後にサイトが更新されている
- **WHEN** Invalidationのステータスが `Completed` になる
- **THEN** カスタムドメインにアクセスすると最新のコンテンツが返される
