# my-website

## AWSクイズデータ管理

AWSクイズ問題データ（JSON）はS3バケット（`yamamoto-shuma-my-website-prod/data/aws-quiz/`）で管理しており、このリポジトリには含まれていません。

### 初回セットアップ（新規クローン後）

```bash
npm run quiz:pull
```

### クイズデータの編集ワークフロー

1. **データ取得**（編集前に必ず実行）
   ```bash
   npm run quiz:pull
   ```

2. **JSONファイルを編集**
   `static/data/aws-quiz/<service>.json` を直接編集します。

3. **S3にアップロード**
   ```bash
   npm run quiz:push
   ```

4. **CloudFrontキャッシュをクリア**
   ```bash
   export CLOUDFRONT_DISTRIBUTION_ID=E3LINM8ORJKA3Z
   npm run quiz:invalidate
   ```

> 誤って削除・上書きした場合はS3 Versioningで復元できます。

## 声優クイズデータ管理

声優データ（voice_actors.json）と作品データ（titles.json）はS3バケット（`yamamoto-shuma-my-website-prod/data/vc-quiz/`）で管理しており、このリポジトリには含まれていません。

### 初回セットアップ（新規クローン後）

```bash
npm run vc-quiz:pull
```

### 声優クイズデータの編集ワークフロー

1. **データ取得**（編集前に必ず実行）
   ```bash
   npm run vc-quiz:pull
   ```

2. **JSONファイルを編集**
   - `static/data/vc-quiz/voice_actors.json`：声優マスタ
   - `static/data/vc-quiz/titles.json`：作品・キャラクターデータ

3. **S3にアップロード**
   ```bash
   npm run vc-quiz:push
   ```

> 誤って削除・上書きした場合はS3 Versioningで復元できます。
