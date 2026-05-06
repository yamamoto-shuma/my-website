## Context

現在、クイズデータ（各サービスのJSON）が `src/data/questions/` にあり、ビルド時に静的importでバンドルされる。これによりGitHubパブリックリポジトリに問題内容が全公開されている。

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

### 1. クイズデータ置き場: 既存バケットのパス分離（別バケット新設なし）

既存バケット `yamamoto-shuma-my-website-prod` の `data/questions/` プレフィックスにクイズJSONを格納。
- 既存バケットはすでにVersioning有効・CloudFront OAC設定済み → 追加インフラ不要
- CloudFront設定変更不要（同一オリジン・同一ドメインで `/data/questions/*` が通る）
- 代替案: 別バケット新設 → 却下（OAC追加・CloudFrontオリジン追加・Terraform増加のコストに対してメリット薄）
- トレードオフ: CI/CDの `aws s3 sync --delete` がクイズデータを削除するリスク → Decision 6で対処

### 2. データ配信: CloudFront経由（直接S3アクセスなし）

既存CloudFront Distributionの同一ドメイン（`/data/questions/*.json`）で配信。
- S3バケットはプライベート。OAC経由のみ許可（既設定）
- ReactはCloudFrontドメインの相対パスでfetch → CORS不要
- 代替案: 別バケットでPublic公開 → 却下（セキュリティ複雑化）

### 3. データロード: サービス別fetch（ファイル分割維持）

現在のファイル構成を維持。`/data/questions/{service}.json` でサービス毎にfetch。
- 代替案: 全結合JSONを1ファイルで配信 → 却下（初回ロード遅延・部分更新困難）
- 代替案: manifest.jsonで動的解決 → 却下（今回のスコープ外・過剰設計）

### 4. ローカルデータ置き場: `public/data/questions/`

Viteは `public/` をビルド成果物にコピーするが、GitignoreでGit管理外にする。
- S3同期先はS3の `data/questions/` プレフィックス
- Reactはビルド時import不要。`fetch('/data/questions/{service}.json')` で取得
- 現在の `src/data/questions/` は削除（ビルドから除外）

### 5. S3 Versioning: 追加設定不要

既存 `s3.tf` で `versioning_configuration { status = "Enabled" }` 設定済み。Terraform変更なし。

### 6. CI/CDデプロイワークフローのクイズデータ除外

GitHub Actionsのデプロイワークフロー（`aws s3 sync ... --delete`）に `--exclude "data/questions/*"` を追加。
- これがないとデプロイのたびにS3の `data/questions/` 以下が全削除される
- S3 Versioningで復元は可能だが手動作業が発生するため、除外設定で防止する

### 7. 同期ツール: npm scripts

`package.json` に `quiz:pull` / `quiz:push` を追加。Makefileより依存関係が少なく、開発者全員がnode環境を持つ前提が成立。

## Risks / Trade-offs

- **CI/CDによるデータ削除** → `aws s3 sync --delete` がクイズJSONを消す。`--exclude "data/questions/*"` で対処（Decision 6）
- **ネットワーク依存** → ローカル開発時はS3から取得不要（`public/data/` にファイルがあればVite dev serverが配信）。開発時はS3からpullしてから作業する手順で対応
- **CloudFrontキャッシュ** → 更新後にキャッシュが残る可能性。S3 push後にCloudFrontインバリデーション手順を追加（npm scriptに含める）
- **gitignore漏れ** → `.gitignore` 追加後、既存追跡ファイルを `git rm --cached` で除外が必要
- **初回移行時のデータ欠落** → S3 push前にS3にデータがないとクイズ不能。移行手順で先にpushする

## Migration Plan

1. GitHub Actionsワークフローの S3 sync に `--exclude "data/questions/*"` を追加（先にCI/CDを修正しないとデータが消える）
2. `public/data/questions/` ディレクトリ作成
3. `src/data/questions/` の全JSONを `public/data/questions/` にコピー
4. S3にデータをpush（`npm run quiz:push`）
5. CloudFrontインバリデーション実行
6. Reactコードをランタイムfetchへリファクタ
7. `.gitignore` に `public/data/` 追加
8. `git rm --cached` で既存追跡ファイルを除外
9. `src/data/questions/` 削除
10. デプロイ・動作確認（CI/CDが `--exclude` 付きで動作することを確認）

**ロールバック**: `git revert` + S3データはVersioningで復元可能

## Resolved Questions

- CloudFrontインバリデーションを毎回手動で行うか、npm scriptに含めるか → **npm scriptに含める**（`quiz:invalidate` として追加。Decision 7参照）
- `public/data/` をgitignoreした場合、新規クローン後の開発フローをどうするか → **READMEに記載する**（`npm run quiz:pull` 手順を追記。tasks.md 6.1参照）
