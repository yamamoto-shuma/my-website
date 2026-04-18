## Why

`yama-shu.com` は現在プレースホルダーページのみの静的サイトであり、コンテンツとして価値を提供できていない。AWSの実務スキル向上を目的としたインタラクティブなクイズサイトを構築することで、学習コンテンツとしての価値を持たせる。

## What Changes

- `public/aws-quiz/` 以下に React + Vite + TypeScript で構築したクイズアプリを追加する
- `src/` ディレクトリを新設し、Reactのソースコードを管理する
- GitHub Actions の deploy ワークフローに npm ビルドステップを追加する（**BREAKING**: ビルドなしのデプロイから変更）
- Phase1（VPC・IAM・KMS）の問題データを JSON 形式で追加する

## Capabilities

### New Capabilities

- `aws-quiz`: AWSサービスを対象とした4択クイズアプリ。Phase・サービス別フィルタリング、問題出題、結果表示の3画面で構成される
- `quiz-question-data`: クイズ問題データ管理の仕様。JSON スキーマ定義・Phase/サービス別ファイル構成・問題の追加ルールを定める

### Modified Capabilities

- `cicd-deploy`: デプロイ前に `npm ci && npm run build` を実行するステップを追加する

## Impact

- `src/` : Reactソースコード（新規）
- `public/aws-quiz/` : ビルド成果物（`.gitignore` 対象）
- `.github/workflows/deploy.yml` : ビルドステップ追加
- `package.json`, `vite.config.ts` : 新規追加
