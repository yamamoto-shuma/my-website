## PR1: ドキュメント（ADR・アーキテクチャ図）

- [x] 1.1 `docs/adr/` ディレクトリを作成し、ADRを Markdown で作成する
- [x] 1.2 `docs/architecture/` ディレクトリを作成し、Mermaid記法のアーキテクチャ図を作成する

## PR2: コア配信基盤（S3 + CloudFront）

- [ ] 2.1 `terraform/prod/s3.tf` を作成し、静的コンテンツ用S3バケットリソースを定義する
- [ ] 2.2 パブリックアクセスブロック・バージョニング・SSE-S3暗号化を設定する
- [ ] 2.3 `terraform/prod/cloudfront.tf` を作成し、OACリソースを定義する
- [ ] 2.4 CloudFront Distributionを定義する（オリジン: S3、OAC適用、PriceClass_200）
- [ ] 2.5 HTTPS強制・HTTP→HTTPSリダイレクトを設定する
- [ ] 2.6 デフォルトルートオブジェクト（`index.html`）を設定する
- [ ] 2.7 CloudFront OAC用のS3バケットポリシーを設定する
- [ ] 2.8 `terraform plan` / `terraform apply` を実行してリソースを作成する
- [ ] 2.9 `*.cloudfront.net` のURLでHTTPS配信できることを確認する

## PR3: カスタムドメイン（ACM + Route53）

- [ ] 3.1 `terraform/prod/acm.tf` を作成し、us-east-1プロバイダーエイリアスを `provider.tf` に追加する
- [ ] 3.2 ACM証明書リソースをus-east-1で定義する（DNS検証方式）
- [ ] 3.3 Route53の検証用CNAMEレコードリソースを定義する
- [ ] 3.4 `aws_acm_certificate_validation` リソースで証明書の発行完了を待機する
- [ ] 3.5 `terraform/prod/route53.tf` を作成し、カスタムドメインのHosted Zoneリソースを定義する
- [ ] 3.6 apexドメインからCloudFrontへのAliasレコード（A/AAAA）を定義する
- [ ] 3.7 カスタムドメインとACM証明書をCloudFrontに紐付ける
- [ ] 3.8 `terraform plan` / `terraform apply` を実行してリソースを作成する
- [ ] 3.9 `https://example.com` でHTTPS通信できることを確認する

## PR4: CI/CD（IAM OIDC + GitHub Actions）

- [ ] 4.1 `terraform/prod/iam.tf` を作成し、GitHub OIDC Providerリソースを定義する
- [ ] 4.2 GitHub Actions用IAMロールを定義する（信頼ポリシー: 対象リポジトリ・mainブランチ限定）
- [ ] 4.3 最小権限ポリシー（S3同期・CloudFront Invalidation）をIAMロールにアタッチする
- [ ] 4.4 `terraform plan` / `terraform apply` を実行してIAMリソースを作成する
- [ ] 4.5 `.github/workflows/deploy.yml` を作成し、mainブランチpushをトリガーとするワークフローを定義する
- [ ] 4.6 OIDC認証（`aws-actions/configure-aws-credentials`）を設定する
- [ ] 4.7 `aws s3 sync` で静的ファイルをS3に同期するステップを追加する
- [ ] 4.8 `aws cloudfront create-invalidation --paths "/*"` でキャッシュ無効化するステップを追加する
- [ ] 4.9 テストコミットをmainにpushしてデプロイが自動実行されることを確認する
