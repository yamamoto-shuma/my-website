## Why

クイズデータ（JSON）がGitHubパブリックリポジトリに存在しており、問題内容が公開状態にある。データをS3にのみ管理することで、GitHub上への流出を防ぎつつ、バージョニングによるデータ保護を実現する。

## What Changes

- クイズJSONデータを既存S3バケット（`yamamoto-shuma-my-website-prod`）の `data/questions/` パスへ移行し、S3をSingle Source of Truthとする
- `public/data/` を `.gitignore` に追加し、データのGitHub流出を防止
- npm scripts にS3同期コマンドを追加（ローカル編集ワークフロー用）
- CI/CDデプロイワークフローの S3 sync に `--exclude "data/questions/*"` を追加（デプロイによるクイズデータ削除防止）

## Capabilities

### New Capabilities

- `quiz-data-s3-management`: S3バケットでクイズJSONを管理する能力。Versioning有効化、.gitignore設定、CLIによる同期ワークフローを含む

### Modified Capabilities

- `static-site-hosting`: CloudFront/S3ホスティング構成において、クイズデータ取得元がGitリポジトリからS3バケットに変わる
- `cicd-deploy`: デプロイワークフローのS3 syncコマンドが `data/questions/*` を除外する必要がある

## Impact

- **React**: データ取得元をS3/CloudFront URLに変更（ビルド時バンドルからランタイムfetchへ）
- **Git**: `public/data/` を `.gitignore` に追加、既存JSONファイルをGit管理から除外
- **CI/CD**: GitHub Actionsのデプロイワークフローに `--exclude "data/questions/*"` 追加
- **ローカル開発**: 編集前後にAWS CLIでS3同期が必要（手動ワークフロー）
- **依存関係**: AWS CLI（開発環境に必須）
