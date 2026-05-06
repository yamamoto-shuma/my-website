## 1. データ移行準備

- [ ] 1.1 `public/data/questions/` ディレクトリを作成し、`src/data/questions/` の全JSONをコピー
- [ ] 1.2 S3に全JSONをアップロード (`aws s3 sync ./public/data/questions/ s3://yamamoto-shuma-my-website-prod/data/questions/`)
- [ ] 1.3 CloudFrontインバリデーション実行 (`/data/questions/*`)

## 2. npm scripts追加

- [ ] 2.1 `package.json` に `quiz:pull` スクリプト追加 (`aws s3 sync s3://yamamoto-shuma-my-website-prod/data/questions/ ./public/data/questions/`)
- [ ] 2.2 `package.json` に `quiz:push` スクリプト追加 (`aws s3 sync ./public/data/questions/ s3://yamamoto-shuma-my-website-prod/data/questions/ --delete`)
- [ ] 2.3 `package.json` に `quiz:invalidate` スクリプト追加 (CloudFrontインバリデーションコマンド)

## 3. React コード変更

- [ ] 3.1 `AwsQuiz.tsx` の全静的import（`import xxxQuestions from '../data/questions/xxx.json'`）を削除
- [ ] 3.2 サービス別にfetchする関数を実装（`fetch('/data/questions/{service}.json')`）
- [ ] 3.3 ローディング状態・エラー状態のUI処理を追加
- [ ] 3.4 データ取得成功後にクイズを表示するようコンポーネントを修正

## 4. Git管理除外

- [ ] 4.1 `.gitignore` に `public/data/` を追加
- [ ] 4.2 既存追跡ファイルがある場合 `git rm --cached -r src/data/questions/` で除外
- [ ] 4.3 `src/data/questions/` ディレクトリを削除（Reactコードが参照しなくなった後）

## 5. 動作確認

- [ ] 5.1 ローカル開発環境でクイズが正常に表示されることを確認（`npm run dev`）
- [ ] 5.2 ビルド成果物にJSONが含まれないことを確認（`npm run build` 後に `dist/` を確認）
- [ ] 5.3 デプロイ後にCloudFront経由でクイズデータが取得できることを確認
- [ ] 5.4 S3 Versioningの確認（Terraformで既設定のため確認のみ）
