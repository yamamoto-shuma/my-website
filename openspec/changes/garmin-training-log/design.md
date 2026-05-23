## Context

現在の `yama-shu.com` は React + Vite + TypeScript による完全静的 SPA で、S3 + CloudFront でホスティングされている。バックエンドは存在せず、外部 API 呼び出しやデータ永続化の仕組みがない。

今回追加する Garmin トレーニングログ機能では以下が必要になる。

- Garmin 非公式 API の呼び出し（CORS・認証情報保護のためブラウザから直接は不可）
- ノートデータの永続化
- Gemini API キーの秘匿
- ユーザー認証

インフラは既存の AWS + Terraform 管理基盤に統合する方針とする。

## Goals / Non-Goals

**Goals:**
- Garmin アクティビティデータの取得・表示（プールスイム / バイク / ラン）
- 日次ノート（good / problem / others）の記録と閲覧
- Gemini API による AI トレーニングアドバイスの生成・保存
- カレンダー UI での月次トレーニング履歴の可視化
- Cognito による認証（Protected Route）
- 既存の AWS + Terraform 基盤への統合

**Non-Goals:**
- Garmin 公式 API（Health API）への対応（企業向け申請が必要なため除外）
- 複数ユーザー間のデータ共有・ソーシャル機能
- アクティビティデータの手動編集
- リアルタイム Garmin データ同期（バックグラウンド cron 等）

## Decisions

### D1: バックエンド構成 — Lambda + API Gateway (HTTP API) + DynamoDB

既存の AWS + Terraform 基盤に統合し、インフラを一元管理する。

| 選択肢 | 理由 |
|--------|------|
| **Lambda + API Gateway + DynamoDB** ✅ | 既存 AWS 基盤に統合。DynamoDB は無料枠が大きく個人利用コストがほぼゼロ |
| Supabase | 構築速度は速いが AWS と分散し運用が複雑化する |

HTTP API を採用（REST API 比 1/3.5 のコスト）。

### D2: 認証 — Amazon Cognito Essentials プラン

| 選択肢 | 理由 |
|--------|------|
| **Cognito Essentials** ✅ | 10,000 MAU/月無料。将来のユーザー拡張にも対応できる |
| 自前 JWT 認証 | 実装・運用コストが高い。セキュリティリスクがある |
| Cognito Plus | 脅威保護機能が追加されるが個人サイト規模では不要かつコスト増 |

MFA は Email ベース（SMS は SNS 追加料金が発生するため）。

### D3: Garmin データ取得 — オンデマンド取得 + DynamoDB キャッシュ

Garmin 非公式 API は python-garminconnect ライブラリ（Lambda の Python ランタイム）で呼び出す。

キャッシュ TTL 設計：

| 日付種別 | TTL | 理由 |
|---------|-----|------|
| 当日 | 1 時間 | アクティビティが追加される可能性がある |
| 過去日 | なし（永久） | 過去のアクティビティは変更されない。無駄な再取得を防ぐ |

### D4: AI 分析 — Gemini API、手動トリガー・結果保存

| 設計選択 | 理由 |
|---------|------|
| 手動ボタンで生成 | 自動生成はページ閲覧のたびに Gemini API を呼び出しコスト管理が困難 |
| 結果を DynamoDB に保存 | 毎回 API 呼び出しを回避。再表示が高速 |
| 再分析ボタンを表示 | ノート更新後の再分析はユーザーが判断する |

Gemini モデル: Gemini 2.0 Flash（コスト効率が高い）

プロンプト構成：システムプロンプト（トライアスロントレーナーとしての役割）+ ユーザープロフィール + アクティビティデータ + ノート内容

### D5: URL ルーティング — `/garmin/:date`（yyyy-mm-dd）

SPA 内状態遷移ではなく独立 URL を採用。

| 選択肢 | 理由 |
|--------|------|
| **`/garmin/:date`** ✅ | ブックマーク・ブラウザ履歴・直リンクが正常に機能する |
| SPA 内 state 遷移 | URL が変わらずブックマークや共有が不可能 |

React Router v7 の `<Route path="/garmin/:date" />` で実装。

## Risks / Trade-offs

- **[Garmin 非公式 API の不安定性]** → Garmin 側の認証フロー変更で突然動作しなくなるリスクがある。過去日の永久キャッシュにより影響を限定的に保つ。python-garminconnect の garth 依存部分を定期的に更新する
- **[Lambda コールドスタート]** → 初回リクエストのレイテンシが 1〜3 秒程度発生する可能性がある。個人利用であれば許容範囲。必要に応じて Provisioned Concurrency で対応
- **[DynamoDB オンデマンドコスト]** → トラフィックが急増した場合のコスト予測が難しい。Billing Alert を設定して上限超過を検知する
- **[Gemini API のレスポンス品質]** → プロフィール情報が不十分だとアドバイスが抽象的になる。プロフィール入力を必須に近い形で促す UX を設ける

## Migration Plan

1. Terraform で DynamoDB・Cognito・Lambda・API Gateway を新設（既存リソースへの影響なし）
2. フロントエンドに `/garmin` ルートを追加（既存ルートへの影響なし）
3. Garmin トークンを AWS Secrets Manager に登録
4. Gemini API キーを AWS Secrets Manager に登録
5. 動作確認後に `/garmin` をメインナビゲーションに追加

ロールバック：Terraform destroy で新設リソースのみ削除可能。既存の静的サイトに影響なし。

## Open Questions

- （なし。設計レビュー済み）
