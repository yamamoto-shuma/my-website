## ADDED Requirements

### Requirement: GitHub Actions OIDC用IAMロールが存在する
GitHub ActionsワークフローからAWSリソースを操作するためのIAMロールがTerraformで管理されていなければならない（SHALL）。ロールはGitHub OIDCプロバイダーを信頼し、特定のリポジトリ・ブランチからのみAssumeできるConditionが設定されていなければならない（SHALL）。付与するポリシーは最小権限（S3同期とCloudFront Invalidationのみ）でなければならない（SHALL）。

#### Scenario: IAMロールがOIDCで信頼されている
- **WHEN** Terraformで作成されたIAMロールの信頼ポリシーを確認する
- **THEN** `token.actions.githubusercontent.com` を Issuer とするOIDC条件が設定されている

#### Scenario: 対象リポジトリ・ブランチのみAssumeできる
- **WHEN** 対象外リポジトリからAssumeRoleを試みる
- **THEN** アクセスが拒否される

#### Scenario: IAMロールの権限がS3とCloudFrontに限定されている
- **WHEN** IAMロールにアタッチされたポリシーを確認する
- **THEN** `s3:PutObject`、`s3:DeleteObject`、`s3:ListBucket`、`cloudfront:CreateInvalidation` のみが許可されている

### Requirement: mainブランチへのpushで自動デプロイが実行される
`main` ブランチへのpushをトリガーとして、GitHub Actionsワークフローが起動し、S3への静的ファイル同期とCloudFrontのキャッシュ無効化（`/*`）が実行されなければならない（SHALL）。

#### Scenario: mainへのpushでワークフローが起動する
- **WHEN** `main` ブランチにコミットをpushする
- **THEN** GitHub Actionsの `deploy` ワークフローが自動起動する

#### Scenario: S3に静的ファイルが同期される
- **WHEN** デプロイワークフローが実行される
- **THEN** リポジトリの静的HTMLファイルがS3バケットに同期される（削除も含む）

#### Scenario: CloudFrontのキャッシュが全無効化される
- **WHEN** S3同期が完了する
- **THEN** CloudFront Distributionに対して `/*` のInvalidationが実行される

#### Scenario: デプロイ完了後にサイトが更新されている
- **WHEN** Invalidationのステータスが `Completed` になる
- **THEN** カスタムドメインにアクセスすると最新のコンテンツが返される
