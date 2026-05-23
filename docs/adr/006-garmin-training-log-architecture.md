# ADR-006: Garminトレーニングログ機能のアーキテクチャ

## ステータス

Accepted

## コンテキスト

`yama-shu.com/garmin` にトライアスロントレーニングログ機能を追加する。この機能は以下の要件を持つ。

- Garmin Connect から取得したアクティビティ（プールスイム・バイク・ラン）の表示
- 各日付に対する good / problem / others のテキストノート記録
- アクティビティとノートをもとにした AI（Gemini API）によるトレーニングアドバイス
- カレンダー形式での日付ナビゲーション

現在のサイト構成（React + Vite + TypeScript の静的サイト、S3/CloudFront ホスティング）にはバックエンドが存在しないため、以下の理由から新たなバックエンド基盤が必要となる。

- Garmin 公式 API（Health API）は企業向け申請が必要なため個人利用は不可。非公式ライブラリ（python-garminconnect）を使用するが、ブラウザから直接呼び出すと CORS エラーが発生するためサーバーサイドでの実行が必要
- 認証情報（Garmin のトークン、Gemini API キー）をフロントエンドに置くことは不可
- ノート（good / problem / others）の永続化先が存在しない

## 決定

### 1. バックエンド構成：Lambda + API Gateway (HTTP API) + DynamoDB

既存の AWS + Terraform 基盤に統合する形で、サーバーレスバックエンドを構築する。

- **Lambda**: 単一の Python Lambda 関数（garmin-api）として実装する。python-garminconnect は Python ライブラリのため Python ランタイムを採用。Garmin API 呼び出し・ノート CRUD・Gemini API 呼び出し・プロフィール管理をすべてこの関数で処理する。Garmin の garth OAuth2 トークン（python-garminconnect の SSO 認証で取得）と Gemini API キーは AWS Secrets Manager から実行時に取得する
- **API Gateway (HTTP API)**: Lambda のエンドポイントを公開。REST API ではなく HTTP API を採用しコストを抑える（$1.00 / 100 万コール vs REST API の $3.50）
- **DynamoDB**: ノート・Garmin データキャッシュ・AI 分析結果・プロフィールを格納

### 2. 認証：Amazon Cognito（Essentials プラン）

- 無料枠が 10,000 MAU / 月と十分に大きく、将来的なユーザー追加にも対応できる
- フロントエンドは React Router の Protected Route で未認証ユーザーを `/garmin/login` にリダイレクト
- MFA は Email ベースとし、SMS による追加コストを避ける

### 3. URL ルーティング：`/garmin/:date`（yyyy-mm-dd 形式）

- SPA 内の状態遷移ではなく個別 URL（例: `/garmin/2026-05-23`）を採用
- ブックマーク・ブラウザ履歴・直リンクが正常に機能する
- React Router v7 で `<Route path="/garmin/:date" />` として実装

### 4. Garmin データ取得：オンデマンド取得 + DynamoDB キャッシュ

- フロントエンドからの API リクエスト受信時、DynamoDB にキャッシュが存在すればそれを返す
- キャッシュがなければ Garmin 非公式 API を呼び出してデータを取得し、DynamoDB に保存する
- **キャッシュ TTL**:
  - 当日の日付: 1 時間（アクティビティが追加される可能性があるため）
  - 過去の日付: TTL なし（永久キャッシュ）。過去のアクティビティは変更されないため再取得不要

### 5. AI 分析：Gemini API、手動トリガー・結果保存

- AI 分析は画面上の「分析を生成」ボタンで手動起動（自動生成は API コスト管理が困難なため）
- モデルは Gemini 2.0 Flash を採用する（Gemini 1.5 Pro 比でコスト効率が高く、個人利用のトレーニングアドバイス生成には十分な品質）
- 分析結果は DynamoDB に保存し、毎回 Gemini API を呼び出さない
- ユーザーはノート更新後に必要と判断した場合のみ再分析できる
- Gemini はトライアスロンのトレーナーとしての役割を担い、以下を含むアドバイスを生成する
  - problem の改善方法
  - others に記載された疑問への回答
  - アクティビティ数値へのコメント（良い点・改善の余地）
  - ネクストアクションの提案
- AI 文脈の精度向上のため、ユーザープロフィール（目標レース・現在の実力値）を `/garmin/profile` で登録し、毎回のプロンプトに含める

## その他の選択肢にしなかった理由

- **Garmin 公式 API（Health API）**: 企業・スタートアップ向けの申請が必要であり、個人の開発者が利用することはできない。そのため Garmin 非公式ライブラリ（python-garminconnect）を採用した
- **Supabase（BaaS）**: DB + Auth + Edge Functions が即日揃う利点はあるが、既存の AWS + Terraform 管理基盤と分散してしまう。マルチクラウド化による運用コストの増加を避け、AWS に統一する
- **Amazon Cognito（Plus プラン）**: 脅威保護・リスクベース認証などの高度な機能を持つが、個人サイト規模では不要かつ追加コストが発生する
- **AI 分析の自動生成（ページ表示時）**: ユーザーが日付ページを開くたびに Gemini API を呼び出すとコストが制御できない。手動トリガーを採用する
- **過去日の Garmin キャッシュに TTL を設定する**: 過去のアクティビティは変更されることがなく、TTL 到来後の再取得は無駄な API 呼び出しとなる。永久キャッシュが最適

## 結果

**ポジティブ:**
- 既存の AWS + Terraform 基盤に統合できるため、インフラが一元管理される
- Cognito の 10,000 MAU 無料枠により、ユーザー増加時も当面コストゼロで対応できる
- DynamoDB の永久キャッシュにより Garmin 非公式 API への依存を最小化できる（API が一時的に不安定でも過去データは表示できる）
- 個人利用（1 ユーザー）の月間コストは Gemini API 利用料（~$0.03/月）のみ

**ネガティブ:**
- Garmin 非公式 API を使用するため、Garmin 側の認証フロー変更により突然動作しなくなるリスクがある
- フロントエンドのみだった構成にバックエンドが加わり、Terraform 管理対象が増加する（DynamoDB 4 テーブル・Cognito User Pool・Lambda 関数・API Gateway・IAM ロール・Secrets Manager）
- Lambda コールドスタートによるレイテンシが発生する可能性がある（Provisioned Concurrency で対応可能だがコスト増）
