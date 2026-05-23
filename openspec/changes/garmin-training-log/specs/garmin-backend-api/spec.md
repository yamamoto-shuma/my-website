## ADDED Requirements

### Requirement: アクティビティ取得 API はキャッシュを優先して返す
`GET /garmin/activities/:date` はまず DynamoDB キャッシュを確認し、存在する場合はキャッシュを返す。存在しない場合は Garmin 非公式 API から取得して DynamoDB に保存してから返す。

#### Scenario: キャッシュヒット
- **WHEN** DynamoDB に対象日付のキャッシュが存在する
- **THEN** API はキャッシュデータをそのまま返す（Garmin API を呼び出さない）

#### Scenario: キャッシュミス（当日）
- **WHEN** 当日のデータがキャッシュに存在しない
- **THEN** API は Garmin API を呼び出してデータを取得し、TTL 1 時間でキャッシュに保存して返す

#### Scenario: キャッシュミス（過去日）
- **WHEN** 過去日のデータがキャッシュに存在しない
- **THEN** API は Garmin API を呼び出してデータを取得し、TTL なし（永久）でキャッシュに保存して返す

#### Scenario: Garmin API 呼び出し失敗
- **WHEN** Garmin API の呼び出しが失敗する
- **THEN** API は HTTP 503 を返す

### Requirement: ノート CRUD API を提供する
`/garmin/notes/:date` エンドポイントでノートの取得・保存を提供する。

#### Scenario: ノートの取得
- **WHEN** `GET /garmin/notes/:date` にリクエストする
- **THEN** API は該当日付のノート（good / problem / others）を返す。存在しない場合は空のオブジェクトを返す

#### Scenario: ノートの保存
- **WHEN** `PUT /garmin/notes/:date` に good / problem / others を含む本文でリクエストする
- **THEN** API はノートを DynamoDB に保存し HTTP 200 を返す

### Requirement: AI 分析 API を提供する
`/garmin/analysis/:date` エンドポイントで AI 分析の生成・取得を提供する。

#### Scenario: 保存済み分析の取得
- **WHEN** `GET /garmin/analysis/:date` にリクエストし保存済みデータが存在する
- **THEN** API は保存済みの分析テキストを返す

#### Scenario: 保存済みデータが存在しない場合
- **WHEN** `GET /garmin/analysis/:date` にリクエストし保存済みデータが存在しない
- **THEN** API は HTTP 404 を返す

#### Scenario: AI 分析の生成
- **WHEN** `POST /garmin/analysis/:date` にリクエストする
- **THEN** API はアクティビティ・ノート・プロフィールを取得して Gemini API を呼び出し、結果を DynamoDB に保存して返す

#### Scenario: Gemini API 呼び出し失敗
- **WHEN** Gemini API の呼び出しが失敗する
- **THEN** API は HTTP 503 を返す

### Requirement: プロフィール API を提供する
`/garmin/profile` エンドポイントでプロフィールの取得・保存を提供する。

#### Scenario: プロフィールの取得
- **WHEN** `GET /garmin/profile` にリクエストする
- **THEN** API は保存済みプロフィールを返す。存在しない場合は空のオブジェクトを返す

#### Scenario: プロフィールの保存
- **WHEN** `PUT /garmin/profile` にプロフィールデータを含む本文でリクエストする
- **THEN** API はプロフィールを DynamoDB に保存し HTTP 200 を返す

### Requirement: すべての API エンドポイントは認証済みリクエストのみ受け付ける
Cognito の JWT トークン（Authorization ヘッダー）を検証する。

#### Scenario: 未認証リクエスト
- **WHEN** Authorization ヘッダーなしまたは無効なトークンでリクエストする
- **THEN** API は HTTP 401 を返す
