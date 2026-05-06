# my-website

## クイズデータ管理

クイズ問題データ（JSON）はS3バケット（`yamamoto-shuma-my-website-prod/data/questions/`）で管理しており、このリポジトリには含まれていません。

### 初回セットアップ（新規クローン後）

```bash
npm run quiz:pull
```

これで `public/data/questions/` にJSONファイルがダウンロードされます。
ローカル開発（`npm run dev`）はこのファイルを参照します。

### クイズデータの編集ワークフロー

1. **データ取得**（編集前に必ず実行）
   ```bash
   npm run quiz:pull
   ```

2. **JSONファイルを編集**
   `public/data/questions/<service>.json` を直接編集します。

3. **S3にアップロード**
   ```bash
   npm run quiz:push
   ```

4. **CloudFrontキャッシュをクリア**
   ```bash
   export CLOUDFRONT_DISTRIBUTION_ID=<Distribution ID>
   npm run quiz:invalidate
   ```
   Distribution IDは `cd terraform/prod && terraform output cloudfront_distribution_id` で確認できます。

> `public/data/` は `.gitignore` に追加済みです。`git add .` しても誤ってコミットされることはありません。
