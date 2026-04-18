## Why

`yama-shu.com` は現在プレースホルダーページのみの静的サイトであり、コンテンツとして価値を提供できていない。AWSの実務スキル向上を目的としたインタラクティブなクイズサイトを構築することで、学習コンテンツとしての価値を持たせる。

## What Changes

- サイト全体（`yama-shu.com/` および `/aws-quiz/`）を React + Vite + TypeScript で再構築する
- `src/` ディレクトリを新設し、React のソースコードを管理する
- ビルド成果物を `dist/` に出力し、デプロイ対象を `./public` から `./dist` に変更する
- GitHub Actions の deploy ワークフローに npm ビルドステップを追加し、デプロイ元を `./dist` に変更する（**BREAKING**）
- 既存の `public/index.html`（トップページ）を React コンポーネントとして移行する
- Phase1（VPC・IAM・KMS）の問題データを JSON 形式で追加する（MWS-010 のスコープ）

## Capabilities

### New Capabilities

- `aws-quiz`: AWSサービスを対象とした4択クイズアプリ。サービス別フィルタリング、問題出題、結果表示の3画面で構成される
- `quiz-question-data`: クイズ問題データ管理の仕様。JSON スキーマ定義・サービス別ファイル構成・問題の追加ルールを定める

### Modified Capabilities

- `cicd-deploy`: ビルドステップ（Node.js 22 LTS, `npm ci`, `npm run build`）を追加し、デプロイ元を `./public` から `./dist` に変更する

## Impact

- `src/` : Reactソースコード（新規）
- `dist/` : ビルド成果物（`.gitignore` 対象、新規）
- `public/` : 削除（既存の静的ファイルはReactコンポーネントに移行）
- `.github/workflows/deploy.yml` : ビルドステップ追加・sync元変更
- `package.json`, `vite.config.ts`, `index.html` : 新規追加
