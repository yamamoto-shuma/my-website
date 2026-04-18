## ADDED Requirements

### Requirement: 問題データがJSONスキーマに従って管理される
全ての問題データは定められたJSONスキーマに従わなければならない（SHALL）。スキーマに違反するデータはTypeScriptの型エラーとして検出されなければならない（SHALL）。

```typescript
interface Question {
  id: string;          // "{service}-{連番3桁}" 例: "vpc-001"
  phase: number;       // Phaseの番号（1〜6）
  service: string;     // サービス名 例: "VPC", "IAM", "KMS"
  question: string;    // 問題文
  choices: string[];   // 4要素の配列（選択肢）
  answer: number;      // 正解のインデックス（0〜3）
  explanation: string; // 解説文
}
```

#### Scenario: 正しいスキーマのデータを追加する
- **WHEN** 上記スキーマに従ったJSONを `src/data/questions/<service>.json` に追加する
- **THEN** TypeScriptのビルドがエラーなく完了する

#### Scenario: スキーマに違反するデータを追加する
- **WHEN** `choices` が4要素でないデータを追加する
- **THEN** TypeScriptがビルドエラーを出力する

### Requirement: 問題データがサービス別・Phase別に管理される
問題データはサービスごとにJSONファイルに分割して `src/data/questions/` 以下に配置しなければならない（SHALL）。各ファイルには当該サービスの問題のみを含まなければならない（SHALL）。

#### Scenario: サービスの問題ファイルが分割されている
- **WHEN** `src/data/questions/` を参照する
- **THEN** サービスごと（例: `vpc.json`, `iam.json`）にファイルが存在する

#### Scenario: Phaseでフィルタリングできる
- **WHEN** Phase1の問題のみを取得する処理を実行する
- **THEN** `phase: 1` のデータのみが返される

### Requirement: Phase1の問題データが充実している
VPC・IAM・KMSの各サービスについて、実務レベルの問題が各10問以上作成されていなければならない（SHALL）。

#### Scenario: 各サービスの問題数が充足している
- **WHEN** Phase1の問題データを読み込む
- **THEN** VPC・IAM・KMSそれぞれ10問以上存在する
