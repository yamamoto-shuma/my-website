## ADDED Requirements

### Requirement: S3バケットがstate保存先として存在する
`my-website-prod-tfstate` という名前のS3バケットが ap-northeast-1 リージョンに存在し、Terraformのstateを安全に保存できる状態でなければならない。バケットはバージョニング有効、パブリックアクセス全ブロック、SSE-S3暗号化が設定されていなければならない（SHALL）。

#### Scenario: バケットが正しい設定で作成される
- **WHEN** `terraform/bootstrap/` で `terraform apply` を実行する
- **THEN** `my-website-prod-tfstate` バケットが ap-northeast-1 に作成され、バージョニングが有効、パブリックアクセスがブロック、暗号化がSSE-S3で設定されている

#### Scenario: バケット名が命名規則に従っている
- **WHEN** S3バケットのリソース定義を確認する
- **THEN** バケット名が `{プロジェクト名}-{環境}-tfstate` の形式（`my-website-prod-tfstate`）になっている

### Requirement: prod環境がS3バックエンドを使用する
`terraform/prod/` の `backend.tf` に S3バックエンドが設定されており、`terraform init` 実行後にstateがS3に保存されなければならない（SHALL）。

#### Scenario: backend.tf が正しいバケットを参照する
- **WHEN** `terraform/prod/backend.tf` を確認する
- **THEN** `bucket = "my-website-prod-tfstate"`、`region = "ap-northeast-1"` が設定されている

#### Scenario: terraform init が成功する
- **WHEN** `terraform/prod/` で `terraform init` を実行する
- **THEN** エラーなく初期化が完了し、S3バックエンドへの接続が確立される

### Requirement: ガイドライン準拠のコードである
`terraform/GUIDELINE.md` に定められたコーディング規約に従ったコードでなければならない（SHALL）。

#### Scenario: バージョンがパッチバージョンまで固定されている
- **WHEN** `terraform.tf` の `required_providers` を確認する
- **THEN** TerraformおよびAWS Providerのバージョンがパッチバージョンまで完全一致で固定されている（例: `= 1.10.5`）

#### Scenario: 命名規則がアンダースコア区切りである
- **WHEN** リソース定義を確認する
- **THEN** リソース名がアンダースコア区切り（snake_case）で記述されている
