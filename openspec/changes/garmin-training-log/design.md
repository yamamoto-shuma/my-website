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
- Garmin アクティビティデータの取得・表示（スイム / バイク / ラン）
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

DynamoDB テーブルのキー設計：activities / notes / ai_analysis は `userId`（PK, String）+ `date`（SK, String, yyyy-mm-dd）の複合キー。profiles は `userId`（PK, String）のみ。

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

### D6: フロントエンド Cognito クライアントライブラリ — amazon-cognito-identity-js

| 選択肢 | 理由 |
|--------|------|
| **amazon-cognito-identity-js** ✅ | Cognito 専用の軽量ライブラリ。必要な機能（ログイン・MFA・トークンリフレッシュ）を過不足なく提供する |
| AWS Amplify Auth | Cognito 操作は可能だが、Amplify 全体の依存（数 MB）を引き込むため本プロジェクトには過剰 |

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

## UI デザインシステム

### カラーパレット

| トークン名 | 値 | 用途 |
|-----------|-----|------|
| `--color-bg` | `#000000` | ページ背景（純黒） |
| `--color-surface` | `#1A1A1A` | カード・セクション背景 |
| `--color-surface-elevated` | `#2C2C2E` | 入力フィールド・モーダル |
| `--color-primary` | `#2B9DF5` | アイコン・ボタン・アクティブ状態（Garmin Blue） |
| `--color-activity-run` | `#E8921A` | ランアクティビティカード（オレンジ） |
| `--color-activity-run-end` | `#F5A623` | ランカードグラデーション終端 |
| `--color-activity-swim` | `#2B9DF5` | スイムアクティビティカード（ブルー） |
| `--color-activity-bike` | `#FF8C00` | バイクアクティビティカード（アンバー） |
| `--color-text-primary` | `#FFFFFF` | 主要テキスト |
| `--color-text-secondary` | `#9E9E9E` | ラベル・補足テキスト |
| `--color-divider` | `#2C2C2E` | 区切り線 |
| `--color-tag-border` | `#4A4A4E` | タグ・チップの枠線 |

### タイポグラフィ

| 用途 | サイズ | ウェイト | 備考 |
|------|--------|---------|------|
| メトリクス値（大） | 48px | Bold | 距離・心拍・ペースなどの主要数値 |
| メトリクス単位 | 16px | Regular | 数値の右に添える（mi, bpm, /km） |
| メトリクスラベル | 12px | Regular | 数値下のラベル（`--color-text-secondary`） |
| ページタイトル | 22px | Bold | アクティビティ名・セクション見出し |
| セクションヘッダー | 18px | Medium | good / problem / others 等 |
| ボディテキスト | 14px | Regular | ノート本文・AI 分析テキスト |
| キャプション | 12px | Regular | 補足情報 |

### コンポーネントパターン

#### アクティビティカード

- 背景: `--color-surface`、角丸 `12px`
- 上部アクセント: アクティビティ種別カラーの左ボーダー（4px）またはグラデーションヘッダー
  - ラン: `linear-gradient(135deg, #E8921A, #F5A623)`
  - スイム: `--color-activity-swim`
  - バイク: `--color-activity-bike`
- 主要メトリクス: 左半分に距離（48px Bold）、右半分に補助指標（2列グリッド）
- 区切り線: `--color-divider`（1px solid）

#### メトリクスセル（2列グリッド）

```
[値 + 単位]    [値 + 単位]
[ラベル  ]    [ラベル  ]
─────────────────────────
[値 + 単位]    [値 + 単位]
[ラベル  ]    [ラベル  ]
```

#### タグ / チップ

- ボーダー: 1px solid `--color-tag-border`
- 角丸: `4px`
- テキスト: 12px、uppercase、`--color-text-secondary`
- 背景: 透明

#### ボタン

- プライマリ: 背景 `--color-primary`、白テキスト、角丸 `6px`
- アウトライン: ボーダー `--color-primary`、`--color-primary` テキスト、背景透明
- 危険操作: ボーダー `#FF3B30`、`#FF3B30` テキスト

#### リストアイテム（アイコン付き）

- アイコン: `--color-primary` 背景の円（36px）+ 白アイコン
- タイトル: 16px、`--color-text-primary`
- サブタイトル: 12px、`--color-text-secondary`
- 右端: シェブロン（`>`）、`--color-text-secondary`

### D7: CSS 変数と Tailwind の方針

| 選択肢 | 理由 |
|--------|------|
| **CSS カスタムプロパティ（CSS 変数）+ Tailwind 任意値** ✅ | 既存プロジェクトに Tailwind がなく導入コストが高い。CSS 変数で十分なスコープを管理できる |
| Tailwind CSS v4 のフル導入 | デザイントークン管理は便利だが、既存コードベースへの影響が大きい |

`src/styles/garmin-tokens.css` にカスタムプロパティを定義し、`src/index.css` で import する。

## Open Questions

- （なし。設計レビュー済み）
