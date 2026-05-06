## Context

現在、クイズデータ（24個のJSON）が `src/data/questions/` にあり、ビルド時に静的importでバンドルされる。これによりGitHubパブリックリポジトリに問題内容が全公開されている。

S3バケット（`yamamoto-shuma-my-website-prod`）はすでにVersioning有効・CloudFront OAC配信済み。追加インフラ不要。

## Goals / Non-Goals

**Goals:**
- クイズJSONをS3のみで管理し、GitHubから除外
- ReactがランタイムでS3/CloudFront経由fetchする構成に変更
- ローカル編集 → S3同期の手動ワークフロー確立
- 誤削除/誤上書き時のS3 Versioning復元

**Non-Goals:**
- 認証・アクセス制御（CloudFront経由で公開URL）
- CI/CDによる自動同期
- データ編集UIの実装
- 新規S3バケットの作成（既存バケットを流用）

## Decisions

### 1. データ配信: CloudFront経由（直接S3アクセスなし）

既存CloudFront Distributionの同一ドメイン（`/data/questions/*.json`）で配信。
- S3バケットはプライベート。OAC経由のみ許可（既設定）
- ReactはCloudFrontドメインの相対パスでfetch → CORS不要
- 代替案: 別バケットでPublic公開 → 却下（セキュリティ複雑化）

### 2. データロード: サービス別fetch（ファイル分割維持）

現在の24ファイル構成を維持。`/data/questions/{service}.json` でサービス毎にfetch。
- 代替案: 全結合JSONを1ファイルで配信 → 却下（初回ロード遅延・部分更新困難）
- 代替案: manifest.jsonで動的解決 → 却下（今回のスコープ外・過剰設計）

### 3. ローカルデータ置き場: `public/data/questions/`

Viteは `public/` をビルド成果物にコピーするが、GitignoreでGit管理外にする。
- S3同期先はS3の `data/questions/` プレフィックス
- Reactはビルド時import不要。`fetch('/data/questions/{service}.json')` で取得
- 現在の `src/data/questions/` は削除（ビルドから除外）

### 4. S3 Versioning: 追加設定不要

既存 `s3.tf` で `versioning_configuration { status = "Enabled" }` 設定済み。Terraform変更なし。

### 5. 同期ツール: npm scripts

`package.json` に `quiz:pull` / `quiz:push` を追加。Makefileより依存関係が少なく、開発者全員がnode環境を持つ前提が成立。

## Risks / Trade-offs

- **ネットワーク依存** → ローカル開発時はS3から取得不要（`public/data/` にファイルがあればVite dev serverが配信）。開発時はS3からpullしてから作業する手順で対応
- **CloudFrontキャッシュ** → 更新後にキャッシュが残る可能性。S3 push後にCloudFrontインバリデーション手順を追加（npm scriptに含める）
- **gitignore漏れ** → `.gitignore` 追加後、既存追跡ファイルを `git rm --cached` で除外が必要
- **初回移行時のデータ欠落** → S3 push前にS3にデータがないとクイズ不能。移行手順で先にpushする

## Migration Plan

1. `public/data/questions/` ディレクトリ作成
2. `src/data/questions/` の全JSONを `public/data/questions/` にコピー
3. S3にデータをpush（`npm run quiz:push`）
4. CloudFrontインバリデーション実行
5. Reactコードをランタイムfetchへリファクタ
6. `.gitignore` に `public/data/` 追加
7. `git rm --cached` で既存追跡ファイルを除外
8. `src/data/questions/` 削除
9. デプロイ・動作確認

**ロールバック**: `git revert` + S3データはVersioningで復元可能

## Open Questions

- CloudFrontインバリデーションを毎回手動で行うか、npm scriptに含めるか（→ 含める方針で実装。AWS CLIでインバリデーション可能）
- `public/data/` をgitignoreした場合、ローカルに `public/data/` が存在しない新規クローン時の開発フローを整備するか（→ READMEに `npm run quiz:pull` 手順を記載する方針）
