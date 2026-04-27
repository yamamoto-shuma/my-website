## ADDED Requirements

### Requirement: 問題データがJSONスキーマに従って管理される
全ての問題データは定められたJSONスキーマに従わなければならない（SHALL）。型フィールド（id・service・phase・question・choices・explanation）の違反はTypeScriptの型エラーとして検出される。choices の4要素はTypeScriptの型では強制できないため、データ管理上の規約として運用する（SHALL）。

```typescript
interface Choice {
  text: string;         // 選択肢のテキスト
  correct: boolean;     // 正解かどうか（正解は true、不正解は false）
}

interface Question {
  id: string;           // "{service}-{連番3桁}" 例: "vpc-001"
  phase: number;        // Phaseの番号（1〜6）
  service: string;      // サービス名 例: "VPC", "IAM", "KMS"
  question: string;     // 問題文
  choices: Choice[];    // 4要素の配列（correct: true の要素を先頭に記載する規約）
  explanation: string;  // 解説文
  reference?: string;   // AWS公式ドキュメントのURL（省略可）
}
```

#### Scenario: 正しいスキーマのデータを追加する
- **WHEN** 上記スキーマに従ったJSONを `src/data/questions/<service>.json` に追加する
- **THEN** TypeScriptのビルドがエラーなく完了する

#### Scenario: 選択肢数・記載順の管理規約
- **WHEN** 問題データを追加する
- **THEN** `choices` は必ず4要素とし、`correct: true` の要素を先頭に記載する（TypeScriptの型では強制できないため、データ管理上の規約として運用する）

### Requirement: 問題データがサービス別・Phase別に管理される
問題データはサービスごとにJSONファイルに分割して `src/data/questions/` 以下に配置しなければならない（SHALL）。各ファイルには当該サービスの問題のみを含まなければならない（SHALL）。

#### Scenario: サービスの問題ファイルが分割されている
- **WHEN** `src/data/questions/` を参照する
- **THEN** サービスごと（例: `vpc.json`, `iam.json`）にファイルが存在する

#### Scenario: phaseフィールドがPhaseグループ表示に利用される
- **WHEN** 問題データの `phase` フィールドを参照する
- **THEN** `phase: 1〜4` のように数値で識別でき、`PHASE_GROUPS` 定数とサービス名の一致によってUIのPhaseブロック表示に利用される

### Requirement: Phase1の問題データが充実している
VPC・IAM・KMSの各サービスについて、実務レベルの問題が各10問以上作成されていなければならない（SHALL）。

#### Scenario: 各サービスの問題数が充足している
- **WHEN** Phase1の問題データを読み込む
- **THEN** VPC・IAM・KMSそれぞれ10問以上存在する

### Requirement: Phase2の問題データが充実している
EC2・Auto Scaling・EBS・ECS・Lambdaの各サービスについて、実務レベルの問題が各10問以上作成されていなければならない（SHALL）。

#### Scenario: 各サービスの問題数が充足している
- **WHEN** Phase2の問題データを読み込む
- **THEN** EC2・Auto Scaling・EBS・ECS・Lambdaそれぞれ10問以上存在する

### Requirement: Phase3の問題データが充実している
ALB/NLB・Route 53・CloudFront・API Gatewayの各サービスについて、実務レベルの問題が各10問以上作成されていなければならない（SHALL）。

#### Scenario: 各サービスの問題数が充足している
- **WHEN** Phase3の問題データを読み込む
- **THEN** ALB/NLB・Route 53・CloudFront・API Gatewayそれぞれ10問以上存在する

### Requirement: Phase4の問題データが充実している
S3・EFS・Aurora・DynamoDBの各サービスについて、実務レベルの問題が各10問以上作成されていなければならない（SHALL）。

#### Scenario: 各サービスの問題数が充足している
- **WHEN** Phase4の問題データを読み込む
- **THEN** S3・EFS・Aurora・DynamoDBそれぞれ10問以上存在する

### Requirement: Phase5の問題データが充実している
WAF・Secrets Manager・CloudWatch・CloudTrailの各サービスについて、実務レベルの問題が各10問以上作成されていなければならない（SHALL）。

#### Scenario: 各サービスの問題数が充足している
- **WHEN** Phase5の問題データを読み込む
- **THEN** WAF・Secrets Manager・CloudWatch・CloudTrailそれぞれ10問以上存在する

### Requirement: Phase6の問題データが充実している
SQS・SNS・EventBridge・Step Functionsの各サービスについて、実務レベルの問題が各10問以上作成されていなければならない（SHALL）。

#### Scenario: 各サービスの問題数が充足している
- **WHEN** Phase6の問題データを読み込む
- **THEN** SQS・SNS・EventBridge・Step Functionsそれぞれ10問以上存在する
