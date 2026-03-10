## Why

個人ウェブサイトを公開するためのインフラが存在しない。Terraformのステート管理基盤（MWS-001）が整ったため、次のステップとして静的サイト配信のアーキテクチャを構築する。

## What Changes

- S3バケット（静的コンテンツ格納用、プライベート）を新規作成
- CloudFront DistributionをOAC経由でS3をオリジンとして新規作成
- ACM証明書（us-east-1）を新規作成し、カスタムドメインのHTTPSを有効化
- Route53 Hosted ZoneにCloudFrontへのAliasレコード（A/AAAA）を追加
- GitHub Actions OIDC連携用IAMロールを新規作成
- GitHub ActionsワークフローでS3デプロイ + CloudFrontキャッシュ無効化を自動化

## Capabilities

### New Capabilities

- `static-site-hosting`: S3+CloudFrontによる静的HTML配信基盤（OAC、PriceClass_200、カスタムドメイン、HTTPS）
- `dns-and-tls`: Route53ホストゾーンとACM証明書によるカスタムドメイン・TLS管理
- `cicd-deploy`: GitHub Actions + OIDC認証によるmainブランチpush時の自動デプロイ（S3同期 + CloudFront全無効化）

### Modified Capabilities

（なし）

## Impact

- **Terraform**: `terraform/prod/` に各リソースのtfファイルを追加
- **GitHub Actions**: `.github/workflows/deploy.yml` を新規作成
- **AWS リソース**: S3、CloudFront、ACM（us-east-1）、Route53、IAM Role が新規作成される
- **コスト**: CloudFront転送量・Route53ホストゾーン（$0.50/月）・ACM（無料）が発生
