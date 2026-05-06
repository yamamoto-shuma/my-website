## 1. CI/CDワークフロー修正（前提条件: 別PRとして先にマージすること）

> このグループのタスクは本PRとは独立した別PRで実施し、mainにマージされてから以降の作業に進むこと。

- [ ] 1.1 GitHub Actionsデプロイワークフローの `aws s3 sync` コマンドに `--exclude "data/questions/*"` を追加
- [ ] 1.2 PRをマージ後、手動デプロイを実行してS3の `data/questions/` が削除されないことを確認

## 2. npm scripts追加

- [ ] 2.1 `package.json` に `quiz:pull` スクリプト追加 (`aws s3 sync s3://yamamoto-shuma-my-website-prod/data/questions/ ./public/data/questions/`)
- [ ] 2.2 `package.json` に `quiz:push` スクリプト追加 (`aws s3 sync ./public/data/questions/ s3://yamamoto-shuma-my-website-prod/data/questions/ --delete`)
- [ ] 2.3 `package.json` に `quiz:invalidate` スクリプト追加（`aws cloudfront create-invalidation --distribution-id <ID> --paths "/data/questions/*"`）。Distribution IDは `terraform/prod/outputs.tf` に `cloudfront_distribution_id` を追加して `terraform output` で取得するか、AWS Consoleから確認する

## 3. データ移行準備

- [ ] 3.1 `public/data/questions/` ディレクトリを作成し、`src/data/questions/` の全JSONをコピー
- [ ] 3.2 `npm run quiz:push` でS3に全JSONをアップロード
- [ ] 3.3 `npm run quiz:invalidate` でCloudFrontインバリデーション実行

## 4. React コード変更

- [ ] 4.1 `AwsQuiz.tsx` の全静的import（`import xxxQuestions from '../data/questions/xxx.json'`）を削除
- [ ] 4.2 サービス選択時に該当JSONのみfetchする関数を実装（`fetch('/data/questions/{service}.json')`、サービス未選択時はfetchしない）
- [ ] 4.3 ローディング状態・エラー状態のUI処理を追加
- [ ] 4.4 データ取得成功後にクイズを表示するようコンポーネントを修正

## 5. Git管理除外

- [ ] 5.1 `.gitignore` に `public/data/` を追加
- [ ] 5.2 既存追跡ファイルがある場合 `git rm --cached -r src/data/questions/` で除外
- [ ] 5.3 `src/data/questions/` ディレクトリを削除（Reactコードが参照しなくなった後）

## 6. ドキュメント

- [ ] 6.1 ルートの `README.md` にクイズデータ編集ワークフローを追記（`quiz:pull` / `quiz:push` / `quiz:invalidate` の使い方、新規クローン後の初回セットアップ手順）

## 7. 動作確認

- [ ] 7.1 ローカル開発環境でクイズが正常に表示されることを確認（`npm run dev`）
- [ ] 7.2 ビルド成果物にJSONが含まれないことを確認（`npm run build` 後に `dist/` を確認）
- [ ] 7.3 デプロイ後にCloudFront経由でクイズデータが取得できることを確認
- [ ] 7.4 デプロイ後にS3の `data/questions/` が削除されていないことを確認
- [ ] 7.5 S3 Versioningの確認（Terraformで既設定のため確認のみ）
