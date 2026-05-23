## 1. インフラ構築（Terraform）

- [ ] 1.1 DynamoDB テーブル 4 本（activities / notes / ai_analysis / profiles）を Terraform で作成する
- [ ] 1.2 Cognito User Pool と User Pool Client（Essentials プラン、Email MFA 有効）を Terraform で作成する
- [ ] 1.3 Garmin トークンと Gemini API キーを AWS Secrets Manager に登録する
- [ ] 1.4 Lambda 実行ロール（DynamoDB 読み書き権限 + Secrets Manager 読み取り権限）を Terraform で作成する
- [ ] 1.5 Lambda 関数（Python ランタイム）を Terraform で作成する
- [ ] 1.6 API Gateway HTTP API と Lambda 統合を Terraform で作成する
- [ ] 1.7 API Gateway に Cognito JWT オーソライザーを設定する
- [ ] 1.8 API Gateway の CORS 設定で `yama-shu.com` を許可する

## 2. バックエンド Lambda 実装

- [ ] 2.1 python-garminconnect でアクティビティを取得する共通処理を実装する（Secrets Manager からトークン取得含む）
- [ ] 2.2 `GET /garmin/activities` ハンドラーを実装する（DynamoDB キャッシュ優先、キャッシュミス時は Garmin API 呼び出し、TTL ロジック含む）
- [ ] 2.3 `GET /garmin/notes/:date` / `PUT /garmin/notes/:date` ハンドラーを実装する
- [ ] 2.4 `GET /garmin/analysis/:date` / `POST /garmin/analysis/:date` ハンドラーを実装する（Gemini API 呼び出し・DynamoDB 保存含む）
- [ ] 2.5 `GET /garmin/profile` / `PUT /garmin/profile` ハンドラーを実装する
- [ ] 2.6 Cognito JWT 検証ミドルウェアを実装する（全エンドポイントに適用）
- [ ] 2.7 Gemini プロンプトを実装する（トライアスロントレーナーとしての role、アクティビティ・ノート・プロフィールを文脈として使用）

## 3. フロントエンド：認証

- [ ] 3.1 Cognito SDK（amazon-cognito-identity-js または AWS Amplify Auth）を追加する
- [ ] 3.2 `/garmin/login` ログインページを実装する（メール + パスワード入力、Email MFA 対応）
- [ ] 3.3 React Router の Protected Route を実装する（未認証時は `/garmin/login` にリダイレクト）
- [ ] 3.4 ログアウト機能を実装する（トークン破棄 + `/garmin/login` リダイレクト）
- [ ] 3.5 アクセストークン自動更新処理を実装する

## 4. フロントエンド：カレンダー画面

- [ ] 4.1 `/garmin` カレンダーページを作成する（月次グリッド表示）
- [ ] 4.2 今日のハイライト表示を実装する
- [ ] 4.3 未来日付のディム表示とクリック無効化を実装する
- [ ] 4.4 前月 / 翌月ナビゲーションを実装する（当月では翌月ボタンを無効化）
- [ ] 4.5 各日付に Swim / Bike / Run アイコンを表示する（API からアクティビティ種別を取得）
- [ ] 4.6 日付クリックで `/garmin/yyyy-mm-dd` に遷移する

## 5. フロントエンド：日付ページ

- [ ] 5.1 `/garmin/:date` 日付ページを作成する
- [ ] 5.2 アクティビティセクションを実装する（複数カード対応、種別ごとの主要指標表示）
- [ ] 5.3 アクティビティなし / 取得失敗のエラー状態を実装する
- [ ] 5.4 ノートセクション（good / problem / others）の閲覧モードを実装する
- [ ] 5.5 編集ボタンで 3 フィールド同時編集モードに切り替える機能を実装する（保存 / キャンセルボタン含む）
- [ ] 5.6 ノートの保存 API 呼び出しを実装する
- [ ] 5.7 AI 分析セクションを実装する（未生成時は「分析を生成」ボタン、生成済みは結果表示 + 「再分析」ボタン）
- [ ] 5.8 AI 分析の生成・再生成 API 呼び出しを実装する（ローディング状態含む）

## 6. フロントエンド：プロフィールページ

- [ ] 6.1 `/garmin/profile` プロフィールページを作成する
- [ ] 6.2 プロフィール入力フォームを実装する（目標レース・現在の実力値など）
- [ ] 6.3 プロフィールの取得・保存 API 呼び出しを実装する

## 7. ルーティング統合

- [ ] 7.1 `App.tsx` に `/garmin`・`/garmin/:date`・`/garmin/profile`・`/garmin/login` ルートを追加する
- [ ] 7.2 Protected Route を `/garmin`・`/garmin/:date`・`/garmin/profile` に適用する

## 8. 動作確認・デプロイ

- [ ] 8.1 ローカル環境でカレンダー → 日付ページ → ノート編集 → AI 分析の一連のフローを確認する
- [ ] 8.2 `npm run build` でビルドエラーがないことを確認する
- [ ] 8.3 GitHub Actions によるデプロイが成功することを確認する
- [ ] 8.4 本番環境（yama-shu.com/garmin）で動作確認する
