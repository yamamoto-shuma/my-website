## Context

MWS-001でTerraformのS3バックエンドが整備された。本変更では個人ウェブサイトの静的コンテンツを配信するためのAWSインフラを構築する。コンテンツは純粋な静的HTML、訪問者は主に日本国内を想定する。すべてのリソースはTerraform（`terraform/prod/`）で管理し、静的HTMLコンテンツのS3へのアップロードはGitHub Actionsで自動化する。

## Goals / Non-Goals

**Goals:**
- S3+CloudFrontによる静的HTMLの安全な配信（S3はパブリックアクセス全ブロック）
- カスタムドメイン（apex）でのHTTPS配信
- mainブランチへのpushで自動デプロイされるCI/CDパイプライン
- すべてのインフラをTerraformで管理

**Non-Goals:**
- サーバーサイドレンダリング・API・データベースの導入
- www サブドメインの対応
- WAF・Shield Advanced の導入
- ステージング環境の構築（prod のみ）

## Decisions

### S3 アクセス制御: OAC を採用

**決定**: CloudFrontからS3へのアクセスにOAC（Origin Access Control）を使用する。

**理由**: AWSが2022年にリリースしたOACはOAI（Origin Access Identity）の後継で、SigV4署名によりSSE-KMS等の高度なS3機能にも対応する。AWSはOAIをdeprecated方向に誘導しており、新規構築においてOACの選択が妥当。

**代替案**: OAI → 旧方式のため不採用。

---

### CloudFront Price Class: PriceClass_200

**決定**: `PriceClass_200`（北米・欧州・アジア・中東・アフリカ）を採用。

**理由**: 訪問者は主に日本（ap-northeast-1 エッジ）からのアクセスを想定。`PriceClass_100`（北米・欧州のみ）では東京エッジが含まれず遅延が増大する。`PriceClass_All` と比較してコスト差は軽微だが、南米・オーストラリアは対象外で十分。

---

### DNS: apex ドメインのみ（www なし）

**決定**: `example.com`（apex）のみ対応し、`www.example.com` は対応しない。

**理由**: 個人サイトとしてシンプルな構成を優先。Route53のAliasレコードを使えばapexドメインをCloudFrontに向けられる（CNAMEはapexに使用不可なためAlias必須）。

---

### TLS証明書: ACM（us-east-1）

**決定**: ACM証明書をus-east-1リージョンに作成する。

**理由**: CloudFrontはACM証明書のリージョンとして us-east-1 を必須とするAWSの制約がある。ap-northeast-1 で作成した証明書はCloudFrontに適用できない。

---

### GitHub Actions 認証: OIDC

**決定**: GitHub ActionsからAWSを操作する認証にOIDCを採用する。

**理由**: 長期的なIAMアクセスキーをGitHub Secretsに保存する方式はキー漏洩リスクがある。OIDCを使うことで一時クレデンシャルのみを使用し、シークレット管理が不要になる。

---

### CloudFront Invalidation: `/*`（全無効化）

**決定**: デプロイ時は `/*` で全キャッシュを無効化する。

**理由**: 個人サイトで更新頻度が低いため、変更ファイルのみを特定する複雑な実装は不要。月1,000パスは無料枠内で収まる想定。

## Risks / Trade-offs

- **ACM証明書のDNS検証**: Route53にCNAMEレコードを追加して証明書を検証する必要があり、Terraform apply の順序依存がある（ACM → Route53検証 → CloudFront）。Terraformの `aws_acm_certificate_validation` リソースで対処する。
- **CloudFrontのキャッシュ**: `/*` 無効化でもデプロイ後のキャッシュが完全に切れるまで数分かかる場合がある → 許容範囲。
- **コスト攻撃**: WAFなしのためL7レベルの大量リクエストで転送量コストが増加するリスクがある → Shield Standard（無料・標準付帯）でL3/L4は防護。AWSのBilling Alertを設定して異常検知する。

## Open Questions

- カスタムドメイン名: 未定（PR3実装時に確定する）
- GitHub OIDC Condition: Userリポジトリのため、IAMロールの信頼ポリシーのConditionは `repo:yamamoto-shuma/my-website:ref:refs/heads/main` を使用する
