## Why

Terraformのstateをローカルファイルのままにすると、誤って削除した場合の復旧ができない。S3をリモートバックエンドとして使用することで、stateを安全かつ永続的に管理する基盤を整える。

## What Changes

- AWS CLIを使用してstate管理用のS3バケット（`my-website-prod-tfstate`）を手動作成する
- `terraform/prod/` ルートモジュールを新規作成し、S3バックエンドを指定した `backend.tf` を配置する

## Capabilities

### New Capabilities

- `terraform-state-backend`: Terraform stateをS3で管理するためのバックエンド設定（AWS CLIによるS3バケット作成 + prod環境のbackend.tf）

### Modified Capabilities

（なし）

## Impact

- `terraform/prod/` ディレクトリが新規追加される
- AWSリソース作成はAWS CLIで行うため、bootstrapディレクトリは不要
- AWSリソース: S3バケット（`my-website-prod-tfstate`、ap-northeast-1）が作成される
- 今後の全Terraformリソース（CloudFront、S3 for HTML等）は `terraform/prod/` 配下に追加していく
