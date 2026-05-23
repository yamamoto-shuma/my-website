## Why

トライアスロンのトレーニングを記録・振り返るための専用ページが存在しないため、練習後の気づきや課題が散逸している。Garmin デバイスで収集した客観的なアクティビティデータと主観的なノートを一元管理し、AI によるコーチングアドバイスを受けられる仕組みを `yama-shu.com/garmin` に構築する。

## What Changes

- **新規**: `/garmin` カレンダー画面（月次表示、Swim/Bike/Run アイコン、今日ハイライト、未来日ディム）
- **新規**: `/garmin/:date` 日付詳細ページ（アクティビティ表示 / good・problem・others ノート / AI 分析）
- **新規**: `/garmin/profile` プロフィール設定ページ（AI 文脈用：目標レース・現在の実力値）
- **新規**: `/garmin/login` ログインページ（Cognito 認証）
- **新規**: バックエンド API（Lambda + API Gateway HTTP API）
  - Garmin 非公式 API からのアクティビティ取得・DynamoDB キャッシュ
  - ノート（good / problem / others）の CRUD
  - Gemini API を使った AI 分析生成・保存
- **新規**: AWS インフラ（Cognito User Pool、Lambda、API Gateway、DynamoDB 4 テーブル）

## Capabilities

### New Capabilities

- `garmin-design-system`: Garmin Connect 公式アプリの配色・雰囲気をベースにしたデザインシステム（カラーパレット・タイポグラフィ・コンポーネント仕様）
- `garmin-calendar`: カレンダー画面でトレーニング履歴を月次で可視化する
- `garmin-daily-log`: 日付ページでアクティビティ表示・ノート記録・AI 分析を行う
- `garmin-auth`: Cognito による認証（Protected Route、ログイン / ログアウト）
- `garmin-backend-api`: Lambda + API Gateway による Garmin データ取得・ノート CRUD・AI 分析のバックエンド API
- `garmin-infrastructure`: Cognito / Lambda / API Gateway / DynamoDB の Terraform 管理インフラ

### Modified Capabilities

（なし）

## Impact

- **フロントエンド**: `src/pages/` と `src/App.tsx` に新規ルート追加。React Router v7 の Protected Route 実装が必要
- **インフラ**: 現行の静的サイト（S3 + CloudFront）に加え、Lambda・API Gateway・DynamoDB・Cognito を新設。`terraform/prod/` 配下に追加
- **外部依存**: Garmin 非公式 API（python-garminconnect）、Gemini API
- **コスト**: 個人利用時は月額 ~$0.03（Gemini API のみ）。Cognito は 10,000 MAU まで無料
