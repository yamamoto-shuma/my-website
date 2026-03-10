# ADR-003: CI/CDにGitHub Actions + OIDCを採用する

## ステータス

Accepted

## コンテキスト

静的HTMLコンテンツをS3にアップロードし、CloudFrontのキャッシュを無効化するデプロイ作業を自動化する必要がある。リポジトリはGitHub（Userリポジトリ）で管理している。

AWSリソースを操作するための認証方式として以下の選択肢がある。

- **IAMユーザー + アクセスキー**: 長期クレデンシャルをGitHub Secretsに保存する方式
- **OIDC（OpenID Connect）**: GitHub ActionsからAWS IAMロールを一時的にAssumeする方式

## 決定

**GitHub Actions + OIDC** を採用する。

- トリガー: `main` ブランチへのpush
- 認証: GitHub OIDC Provider経由でIAMロールをAssume
  - subject claim: `repo:yamamoto-shuma/my-website:ref:refs/heads/main`
- デプロイ内容: `aws s3 sync` によるS3同期 + CloudFront `/*` の全キャッシュ無効化
- IAMロールの権限: `s3:PutObject`、`s3:DeleteObject`、`s3:ListBucket`、`cloudfront:CreateInvalidation` のみ

## その他の選択肢にしなかった理由

- **IAMユーザー + アクセスキー**: 長期クレデンシャルをGitHub Secretsに保存するため、キー漏洩時の影響範囲が大きい。定期的なキーローテーションも運用負荷になる
- **AWS CodePipeline**: AWSネイティブで統一できるが、GitHubとの連携設定が複雑になりコストも増加する。GitHub Actionsと比べて優位性がない
- **手動デプロイ（aws cliを手元で実行）**: 作業が属人化し、デプロイ忘れやヒューマンエラーのリスクがある

## 結果

**ポジティブ:**
- 長期クレデンシャルを一切保存しないためシークレット漏洩リスクがない
- IAMロールのConditionで対象リポジトリ・ブランチを限定でき、最小権限を徹底できる
- GitHub ActionsはGitHubリポジトリと親和性が高く、追加のCIサービスが不要

**ネガティブ:**
- 初期設定にIAM OIDC ProviderとIAMロールのTerraform定義が必要
- IAMアクセスキー方式と比べてセットアップのステップが多い
