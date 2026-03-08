## Context

現在 `terraform/` ディレクトリにはガイドライン（`GUIDELINE.md`）と `.gitignore` のみが存在し、実際のTerraformコードは未作成の状態。

今後 CloudFront や S3（HTML配信用）などのAWSリソースをTerraformで管理するにあたり、stateの保存先を先に確立する必要がある。個人開発・1環境（prod）のみという制約がある。

## Goals / Non-Goals

**Goals:**
- `terraform/bootstrap/` でS3バケット（`my-website-prod-tfstate`）を作成する
- `terraform/prod/` にS3バックエンドを指定した `backend.tf` を配置する
- ガイドライン（`terraform/GUIDELINE.md`）に準拠したコードを書く

**Non-Goals:**
- DynamoDB によるstate locking（個人開発のため不要）
- dev環境の作成（1環境のみ）
- `shared/modules` の作成（1環境のため共通化不要）
- bootstrapのstateをS3へ移行すること（個人開発のためローカルstateで十分）

## Decisions

### ブートストラップアプローチ

**決定**: `terraform/bootstrap/` を独立したルートモジュールとして作成し、ローカルstateで運用する

**理由**: S3バックエンドを使用するためにはS3バケットが事前に存在する必要があるが、そのバケット自体をTerraformで管理したい（鶏と卵問題）。bootstrapをローカルstateで動かすことで、バケット作成→prod環境でS3バックエンドを使用、という順序が成立する。

**代替案**: AWS CLIで手動作成 → 再現性が低くコードとして残らないため不採用

---

### S3バケット構成

**決定**: バージョニング有効、パブリックアクセス全ブロック、SSE-S3暗号化

**理由**:
- バージョニング: state破損・誤操作時の復旧手段として必要
- パブリックアクセスブロック: stateにはAWSリソース情報が含まれるため必須
- 暗号化: SSE-S3（AES256）はデフォルトで有効になっているが明示的に設定

---

### ディレクトリ構成

**決定**: `terraform/bootstrap/`（独立モジュール）と `terraform/prod/`（メイン環境）の2ディレクトリ

**理由**: ガイドラインの推奨構成（dev/prod/shared）に従いつつ、bootstrapを明示的に分離することでその特殊な役割（初回のみ使用）を明確にする

## Risks / Trade-offs

- **bootstrapのstateがローカルにのみ存在する** → PCが故障した場合、bootstrapのstateが失われる。ただし、S3バケット自体は残るため `terraform import` で復旧可能。個人開発の許容リスクとして判断
- **DynamoDBなしのため並行apply時に競合が起きうる** → 個人開発のため実質的に並行applyは発生しない。許容リスク
