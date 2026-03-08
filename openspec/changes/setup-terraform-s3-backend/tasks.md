## 1. AWS CLIでS3バケットを作成

- [x] 1.1 AWS CLIで `my-website-prod-tfstate` バケットを ap-northeast-1 に作成する
- [x] 1.2 バケットのバージョニングを有効化する
- [x] 1.3 バケットのパブリックアクセスをすべてブロックする
- [x] 1.4 バケットのSSE-S3暗号化を有効化する
- [x] 1.5 AWSコンソールでバケットの設定が正しいことを確認する

## 2. prod モジュールの作成

- [x] 2.1 `terraform/prod/terraform.tf` を作成（Terraform・AWS Providerのバージョン固定）
- [x] 2.2 `terraform/prod/provider.tf` を作成（ap-northeast-1リージョン設定）
- [x] 2.3 `terraform/prod/backend.tf` を作成（S3バックエンド、`my-website-prod-tfstate` を参照）
- [x] 2.4 `terraform/prod/main.tf` を作成（空のプレースホルダー）

## 3. 動作確認

- [x] 3.1 `terraform/prod/` で `terraform init` を実行し、S3バックエンドへの接続が成功することを確認する
- [x] 3.2 `terraform/prod/` で `terraform plan` を実行し、エラーなく完了することを確認する
