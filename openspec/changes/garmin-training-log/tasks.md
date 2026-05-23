## 0. デザインシステム基盤

- [x] 0.1 `src/styles/garmin-tokens.css` を作成し、カラートークン（`--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-primary`, `--color-activity-run`, `--color-activity-run-end`, `--color-activity-swim`, `--color-activity-bike`, `--color-text-primary`, `--color-text-secondary`, `--color-divider`, `--color-tag-border`）を定義する
- [x] 0.2 `src/index.css` で `garmin-tokens.css` を import する
- [x] 0.3 アクティビティカードの共通コンポーネント（`ActivityCard`）を作成する（種別ごとのアクセントカラー・48px メトリクス値・2 列グリッド・区切り線レイアウト）
- [x] 0.4 プライマリボタン・アウトラインボタンの共通スタイルを定義する（Garmin Blue ベース）

## 1. インフラ構築（Terraform）

- [x] 1.1 DynamoDB テーブル 4 本（activities / notes / ai_analysis / profiles）を Terraform で作成する
- [x] 1.2 Cognito User Pool と User Pool Client（Essentials プラン、Email MFA 有効）を Terraform で作成する
- [x] 1.3 Secrets Manager シークレットリソースを Terraform で作成する（garmin-token・gemini-api-key の 2 エントリ。値は空で作成し、Terraform apply 後に AWS CLI または コンソールで手動設定する）
- [x] 1.4 Lambda 実行ロール（DynamoDB 読み書き権限 + Secrets Manager 読み取り権限）を Terraform で作成する
- [x] 1.5 Lambda 関数（Python ランタイム）を Terraform で作成する
- [x] 1.6 API Gateway HTTP API と Lambda 統合を Terraform で作成する
- [x] 1.7 API Gateway に Cognito JWT オーソライザーを設定する
- [x] 1.8 API Gateway の CORS 設定で `yama-shu.com` を許可する

## 2. バックエンド Lambda 実装

- [x] 2.1 python-garminconnect でアクティビティを取得する共通処理を実装する（Secrets Manager からトークン取得含む）
- [x] 2.2 `GET /garmin/activities/:date` ハンドラーを実装する（DynamoDB キャッシュ優先、キャッシュミス時は Garmin API 呼び出し、TTL ロジック含む）
- [x] 2.3 `GET /garmin/notes/:date` / `PUT /garmin/notes/:date` ハンドラーを実装する
- [x] 2.4 `GET /garmin/analysis/:date` / `POST /garmin/analysis/:date` ハンドラーを実装する（Gemini API 呼び出し・DynamoDB 保存含む）
- [x] 2.5 `GET /garmin/profile` / `PUT /garmin/profile` ハンドラーを実装する
- [x] 2.6 Lambda ハンドラーで userId を取得する処理を実装する（API Gateway の Cognito オーソライザーが検証済みのため、`event.requestContext.authorizer.jwt.claims.sub` から取得するのみ）
- [x] 2.7 Gemini プロンプトを実装する（トライアスロントレーナーとしての role、アクティビティ・ノート・プロフィールを文脈として使用）

## 3. フロントエンド：認証

- [x] 3.1 `amazon-cognito-identity-js` を追加する（AWS Amplify Auth は依存が重いため不採用）
- [x] 3.2 `/garmin/login` ログインページを実装する（メール + パスワード入力、Email MFA 対応）
- [x] 3.3 React Router の Protected Route を実装する（未認証時は `/garmin/login` にリダイレクト）
- [x] 3.4 ログアウト機能を実装する（トークン破棄 + `/garmin/login` リダイレクト）
- [x] 3.5 アクセストークン自動更新処理を実装する

## 4. フロントエンド：カレンダー画面

- [x] 4.1 `/garmin` カレンダーページを作成する（月次グリッド表示）
- [x] 4.2 今日のハイライト表示を実装する
- [x] 4.3 未来日付のディム表示とクリック無効化を実装する
- [x] 4.4 前月 / 翌月ナビゲーションを実装する（当月では翌月ボタンを無効化）
- [x] 4.5 各日付に Swim / Bike / Run アイコンを表示する（API からアクティビティ種別を取得）
- [x] 4.6 日付クリックで `/garmin/yyyy-mm-dd` に遷移する

## 5. フロントエンド：日付ページ

- [x] 5.1 `/garmin/:date` 日付ページを作成する
- [x] 5.2 アクティビティセクションを実装する（複数カード対応、種別ごとの主要指標表示）
- [x] 5.3 アクティビティなし / 取得失敗のエラー状態を実装する
- [x] 5.4 ノートセクション（good / problem / others）の閲覧モードを実装する
- [x] 5.5 編集ボタンで 3 フィールド同時編集モードに切り替える機能を実装する（保存 / キャンセルボタン含む）
- [x] 5.6 ノートの保存 API 呼び出しを実装する
- [x] 5.7 AI 分析セクションを実装する（未生成時は「分析を生成」ボタン、生成済みは結果表示 + 「再分析」ボタン）
- [x] 5.8 AI 分析の生成・再生成 API 呼び出しを実装する（ローディング状態含む）

## 6. フロントエンド：プロフィールページ

- [x] 6.1 `/garmin/profile` プロフィールページを作成する
- [x] 6.2 プロフィール入力フォームを実装する（目標レース・現在の実力値など）
- [x] 6.3 プロフィールの取得・保存 API 呼び出しを実装する

## 7. ルーティング統合

- [x] 7.1 `App.tsx` に `/garmin`・`/garmin/:date`・`/garmin/profile`・`/garmin/login` ルートを追加する
- [x] 7.2 Protected Route を `/garmin`・`/garmin/:date`・`/garmin/profile` に適用する

## 8. 動作確認・デプロイ

- [ ] 8.1 ローカル環境でカレンダー → 日付ページ → ノート編集 → AI 分析の一連のフローを確認する
- [x] 8.2 `npm run build` でビルドエラーがないことを確認する
- [ ] 8.3 GitHub Actions によるデプロイが成功することを確認する
- [ ] 8.4 本番環境（yama-shu.com/garmin）で動作確認する
