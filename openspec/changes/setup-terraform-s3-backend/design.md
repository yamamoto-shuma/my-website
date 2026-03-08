## Context

現在 `terraform/` ディレクトリにはガイドライン（`GUIDELINE.md`）と `.gitignore` のみが存在し、実際のTerraformコードは未作成の状態。

今後 CloudFront や S3（HTML配信用）などのAWSリソースをTerraformで管理するにあたり、stateの保存先を先に確立する必要がある。個人開発・1環境（prod）のみという制約がある。

## Goals / Non-Goals

**Goals:**
- AWS CLIでS3バケット（`my-website-prod-tfstate`）を作成する
- `terraform/prod/` にS3バックエンドを指定した `backend.tf` を配置する
- ガイドライン（`terraform/GUIDELINE.md`）に準拠したコードを書く

**Non-Goals:**
- DynamoDB によるstate locking（個人開発のため不要）
- dev環境の作成（1環境のみ）
- `shared/modules` の作成（1環境のため共通化不要）
- S3バケット作成をTerraformで管理すること（bootstrapモジュールは作成しない）

## Decisions

### S3バケット作成方法

**決定**: AWS CLIで手動作成する

**理由**: 個人開発・1人運用のため再現性よりシンプルさを優先する。bootstrapモジュールは管理コストに対して得られる恩恵が小さい。

**代替案**: `terraform/bootstrap/` モジュールで管理 → 個人開発では過剰なため不採用

---

### S3バケット構成

**決定**: バージョニング有効、パブリックアクセス全ブロック、SSE-S3暗号化

**理由**:
- バージョニング: state破損・誤操作時の復旧手段として必要
- パブリックアクセスブロック: stateにはAWSリソース情報が含まれるため必須
- 暗号化: SSE-S3（AES256）はデフォルトで有効になっているが明示的に設定

---

### ディレクトリ構成

**決定**: `terraform/prod/` のみ（bootstrapディレクトリなし）

**理由**: S3バケットをAWS CLIで作成するため、bootstrapディレクトリが不要になる。ガイドラインの推奨構成に沿いつつシンプルに保つ。

## Risks / Trade-offs

- **S3バケット作成手順がコードとして残らない** → AWS CLIコマンドをREADMEに記載することで手順を文書化し、再現性を担保する
- **DynamoDBなしのため並行apply時に競合が起きうる** → 個人開発のため実質的に並行applyは発生しない。許容リスク
