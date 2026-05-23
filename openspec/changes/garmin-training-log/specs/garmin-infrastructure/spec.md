## ADDED Requirements

### Requirement: Cognito User Pool を Terraform で管理する
Amazon Cognito User Pool（Essentials プラン）を Terraform で作成・管理する。

#### Scenario: Cognito リソースの作成
- **WHEN** Terraform apply を実行する
- **THEN** Cognito User Pool と User Pool Client が作成される

#### Scenario: Email MFA の設定
- **WHEN** Cognito User Pool が作成される
- **THEN** Email MFA が有効化されている

### Requirement: DynamoDB テーブル 4 本を Terraform で管理する
activities / notes / ai_analysis / profiles の 4 テーブルを作成する。課金モードはオンデマンドとする。

#### Scenario: テーブルの作成
- **WHEN** Terraform apply を実行する
- **THEN** 4 本の DynamoDB テーブルが作成される

#### Scenario: activities テーブルのキー設計
- **WHEN** activities テーブルが作成される
- **THEN** パーティションキーは `userId`（String）、ソートキーは `date`（String）である

#### Scenario: notes テーブルのキー設計
- **WHEN** notes テーブルが作成される
- **THEN** パーティションキーは `userId`（String）、ソートキーは `date`（String）である

#### Scenario: ai_analysis テーブルのキー設計
- **WHEN** ai_analysis テーブルが作成される
- **THEN** パーティションキーは `userId`（String）、ソートキーは `date`（String）である

#### Scenario: profiles テーブルのキー設計
- **WHEN** profiles テーブルが作成される
- **THEN** パーティションキーは `userId`（String）である

### Requirement: Lambda 関数を Terraform で管理する
Python ランタイムの Lambda 関数として各 API ハンドラーを管理する。Garmin トークンと Gemini API キーは Secrets Manager から取得する。

#### Scenario: Lambda 関数の作成
- **WHEN** Terraform apply を実行する
- **THEN** garmin-api Lambda 関数が作成される

#### Scenario: 環境変数と権限
- **WHEN** Lambda 関数が実行される
- **THEN** Secrets Manager から Garmin トークンと Gemini API キーを取得できる
- **THEN** 4 本の DynamoDB テーブルへの読み書き権限を持つ

### Requirement: API Gateway (HTTP API) を Terraform で管理する
Lambda と統合した API Gateway HTTP API を作成する。CORS を設定しフロントエンドドメイン（yama-shu.com）からのリクエストを許可する。

#### Scenario: API Gateway の作成
- **WHEN** Terraform apply を実行する
- **THEN** HTTP API が作成され Lambda との統合が設定される

#### Scenario: Cognito JWT オーソライザーの設定
- **WHEN** API Gateway が作成される
- **THEN** Cognito User Pool を参照する JWT オーソライザーが設定され、保護ルートで認証が強制される
