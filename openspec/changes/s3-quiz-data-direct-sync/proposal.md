## Why

クイズデータ（JSON）がGitHubパブリックリポジトリに存在しており、問題内容が公開状態にある。データをS3にのみ管理することで、GitHub上への流出を防ぎつつ、バージョニングによるデータ保護を実現する。

## What Changes

- クイズJSONデータをS3バケットへ移行し、S3をSingle Source of Truthとする
- S3バケットでVersioningを有効化（誤上書き・誤削除からの復元を可能に）
- `public/data/` を `.gitignore` に追加し、データのGitHub流出を防止
- Makefile または npm scripts にS3同期コマンドを追加（ローカル編集ワークフロー用）
- Terraform (`s3.tf`) にVersioning設定を追加

## Capabilities

### New Capabilities

- `quiz-data-s3-management`: S3バケットでクイズJSONを管理する能力。Versioning有効化、.gitignore設定、CLIによる同期ワークフローを含む

### Modified Capabilities

- `static-site-hosting`: CloudFront/S3ホスティング構成において、クイズデータ取得元がGitリポジトリからS3バケットに変わる

## Impact

- **Terraform**: `s3.tf` にVersioning設定追加
- **React**: データ取得元をS3 URLに変更（ビルド時にバンドルするのではなく、ランタイムでfetch）
- **Git**: `public/data/` を `.gitignore` に追加、既存JSONファイルをGit管理から除外
- **ローカル開発**: 編集前後にAWS CLIでS3同期が必要（手動ワークフロー）
- **依存関係**: AWS CLI（開発環境に必須）
