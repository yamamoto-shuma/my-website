## 1. S3バケット（静的コンテンツ用）

- [ ] 1.1 `terraform/prod/s3.tf` を作成し、静的コンテンツ用S3バケットリソースを定義する
- [ ] 1.2 パブリックアクセスブロック・バージョニング・SSE-S3暗号化を設定する
- [ ] 1.3 CloudFront OAC用のバケットポリシーを設定する（OAC作成後に依存）

## 2. ACM証明書（us-east-1）

- [ ] 2.1 `terraform/prod/acm.tf` を作成し、us-east-1プロバイダーエイリアスを `provider.tf` に追加する
- [ ] 2.2 ACM証明書リソースをus-east-1で定義する（DNS検証方式）
- [ ] 2.3 Route53の検証用CNAMEレコードリソースを定義する
- [ ] 2.4 `aws_acm_certificate_validation` リソースで証明書の発行完了を待機する

## 3. Route53

- [ ] 3.1 `terraform/prod/route53.tf` を作成し、カスタムドメインのHosted Zoneリソースを定義する
- [ ] 3.2 apexドメインからCloudFrontへのAliasレコード（A/AAAA）を定義する（CloudFront作成後に依存）

## 4. CloudFront Distribution

- [ ] 4.1 `terraform/prod/cloudfront.tf` を作成し、OACリソースを定義する
- [ ] 4.2 CloudFront Distributionを定義する（オリジン: S3、OAC適用、PriceClass_200）
- [ ] 4.3 HTTPS強制・HTTP→HTTPSリダイレクトを設定する
- [ ] 4.4 デフォルトルートオブジェクト（`index.html`）を設定する
- [ ] 4.5 カスタムドメインとACM証明書をCloudFrontに紐付ける

## 5. IAM（GitHub Actions OIDC）

- [ ] 5.1 `terraform/prod/iam.tf` を作成し、GitHub OIDC Providerリソースを定義する
- [ ] 5.2 GitHub Actions用IAMロールを定義する（信頼ポリシー: 対象リポジトリ・mainブランチ限定）
- [ ] 5.3 最小権限ポリシー（S3同期・CloudFront Invalidation）をIAMロールにアタッチする

## 6. Terraformの適用と検証

- [ ] 6.1 `terraform/prod/` で `terraform plan` を実行してリソース差分を確認する
- [ ] 6.2 `terraform apply` を実行してリソースを作成する
- [ ] 6.3 カスタムドメインでHTTPS通信できることを確認する
- [ ] 6.4 CloudFront経由でS3コンテンツが配信されることを確認する

## 7. GitHub Actionsデプロイワークフロー

- [ ] 7.1 `.github/workflows/deploy.yml` を作成し、mainブランチpushをトリガーとするワークフローを定義する
- [ ] 7.2 OIDC認証（`aws-actions/configure-aws-credentials`）を設定する
- [ ] 7.3 `aws s3 sync` で静的ファイルをS3に同期するステップを追加する
- [ ] 7.4 `aws cloudfront create-invalidation --paths "/*"` でキャッシュ無効化するステップを追加する
- [ ] 7.5 テストコミットをmainにpushしてデプロイが自動実行されることを確認する

## 8. ADRとアーキテクチャ図

- [ ] 8.1 `docs/adr/` ディレクトリを作成し、ADRを Markdown で作成する
- [ ] 8.2 `docs/architecture/` ディレクトリを作成し、Mermaid記法のアーキテクチャ図を作成する
