## 1. bootstrap モジュールの作成

- [ ] 1.1 `terraform/bootstrap/terraform.tf` を作成（Terraform・AWS Providerのバージョン固定）
- [ ] 1.2 `terraform/bootstrap/provider.tf` を作成（ap-northeast-1リージョン設定）
- [ ] 1.3 `terraform/bootstrap/main.tf` を作成（`my-website-prod-tfstate` S3バケット定義、バージョニング・パブリックアクセスブロック・暗号化を設定）

## 2. bootstrap の実行

- [ ] 2.1 `terraform/bootstrap/` で `terraform init` を実行し、初期化が成功することを確認する
- [ ] 2.2 `terraform/bootstrap/` で `terraform plan` を実行し、差分が正しいことを確認する
- [ ] 2.3 `terraform/bootstrap/` で `terraform apply` を実行し、S3バケットが作成されることをAWSコンソールで確認する

## 3. prod モジュールの作成

- [ ] 3.1 `terraform/prod/terraform.tf` を作成（Terraform・AWS Providerのバージョン固定）
- [ ] 3.2 `terraform/prod/provider.tf` を作成（ap-northeast-1リージョン設定）
- [ ] 3.3 `terraform/prod/backend.tf` を作成（S3バックエンド、`my-website-prod-tfstate` を参照）
- [ ] 3.4 `terraform/prod/main.tf` を作成（空のプレースホルダー）

## 4. prod の動作確認

- [ ] 4.1 `terraform/prod/` で `terraform init` を実行し、S3バックエンドへの接続が成功することを確認する
- [ ] 4.2 `terraform/prod/` で `terraform plan` を実行し、エラーなく完了することを確認する
