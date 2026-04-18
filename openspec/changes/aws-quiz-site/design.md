## Context

現在 `yama-shu.com` は純粋な静的HTML（ビルドプロセスなし）をS3+CloudFrontで配信している。`public/` 以下のファイルを `aws s3 sync` するだけでデプロイが完結するシンプルな構成。

クイズアプリは状態管理（問題の進行、フィルタリング、採点）やコンポーネント再利用が必要なため、フレームワークを導入する。将来のページ追加で技術が混在しないよう、サイト全体（トップページ含む）を統一されたReact構成にする。

## Goals / Non-Goals

**Goals:**
- React + Vite + TypeScript でサイト全体を再構築する（トップページ含む）
- サービス別フィルタリングが動作する4択クイズアプリを実装する
- 問題データを JSON で管理し、追加・編集が容易な設計にする
- 既存の `public/` ディレクトリを廃止し、`dist/` をデプロイ成果物とする
- ADR-004 としてこの技術選定を記録する

**Non-Goals:**
- バックエンド・認証・スコア永続化（ローカルステートのみ）
- モバイルアプリ対応
- Phase別フィルタリング（Phase1のみ実装の間は意味がないため、サービス別のみ）
- Phase1以外の問題データ作成（MWS-010スコープ外）

## Decisions

### D1: フレームワーク — React + Vite + TypeScript（全体統一）

**決定**: サイト全体を React + Vite + TypeScript で構成する。

**理由**:
- クイズの状態管理に React の `useState` が素直にマッチする
- サイト全体を統一することで、将来ページ追加時に技術選定の迷いが生じない
- 既存のトップページはシンプルなHTMLのため、Reactコンポーネントへの移行コストが低い
- TypeScript により問題データのスキーマを型定義で保証できる

**検討した代替案**:
- **`/aws-quiz/` だけReact化**: ビルド変更が最小で済むが、サイト内で技術が混在し、将来の拡張時に一貫性が損なわれる
- **Astro + React Island**: 静的サイト向けとして優秀だが、クイズは全体がインタラクティブなので Island の恩恵が少ない
- **純粋な HTML/CSS/JS**: フィルタリング・状態管理・コンポーネント再利用で保守性が下がる

### D2: ファイル構成

```
my-website/
├── index.html              ← Vite エントリーポイント（ルート）
├── src/
│   ├── main.tsx
│   ├── App.tsx             ← React Router 設定
│   ├── pages/
│   │   ├── Home.tsx        ← 既存 public/index.html を移行
│   │   └── AwsQuiz.tsx     ← クイズアプリのルート
│   ├── components/
│   │   ├── ServiceSelector.tsx   ← サービス選択・フィルタリング
│   │   ├── QuizCard.tsx          ← 問題出題画面（4択）
│   │   └── Result.tsx            ← 結果表示画面
│   ├── data/
│   │   └── questions/
│   │       ├── vpc.json
│   │       ├── iam.json
│   │       └── kms.json
│   └── types/
│       └── quiz.ts
├── static/                 ← Vite の publicDir（静的アセット置き場）
├── dist/                   ← ビルド成果物（.gitignore 対象）
├── package.json
└── vite.config.ts
```

**Vite設定の要点**:
```ts
export default defineConfig({
  publicDir: 'static',       // 静的アセット（旧 public/）
  build: { outDir: 'dist' }, // ビルド成果物
})
```

**既存 `public/` の扱い**:
- `public/index.html` → `src/pages/Home.tsx` に移行
- `public/aws-quiz/index.html` → `src/pages/AwsQuiz.tsx` に置き換え
- `public/` ディレクトリ自体は削除

### D3: Node.js バージョン — Node.js 24 LTS

**決定**: Node.js 24（Active LTS）を使用する。

**理由**: 2026年4月時点での最新安定版（Active LTS）。2027年4月まで Active LTS サポートが続く。

### D4: 問題データスキーマ

```typescript
interface Question {
  id: string;          // "{service}-{連番3桁}" 例: "vpc-001"
  service: string;     // サービス名 例: "VPC", "IAM", "KMS"
  phase: number;       // Phaseの番号（1〜6）※将来のフィルタリング拡張用
  question: string;    // 問題文
  choices: string[];   // 4要素の配列（選択肢）
  answer: number;      // 正解のインデックス（0〜3）
  explanation: string; // 解説文
}
```

サービスごとに JSON ファイルを分割することで、問題追加時の差分が局所化される。

### D5: GitHub Actions 変更

既存の `deploy.yml` への変更：

```yaml
# 追加: S3 sync の前に実行
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '24'
    cache: 'npm'

- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

# 変更: ./public → ./dist
- name: Deploy to S3
  run: aws s3 sync ./dist s3://...
```

## Risks / Trade-offs

- **`dist/` の .gitignore 管理**
  → リスク: ビルド成果物をコミットするとリポジトリが汚染される
  → 対策: `.gitignore` に `dist/` を明示的に追加する（tasks 2.3 で実施）

- **`public/` 削除によるデプロイ先変更**
  → リスク: CI/CD のデプロイ元を変更し忘れると、S3 が空になる
  → 対策: `deploy.yml` の変更と `public/` 削除を同一PRで実施し、ローカルビルド確認後にマージする（tasks 2.4, 2.5 で実施）

- **Node.js CI追加によるデプロイ時間増加**
  → `npm ci` と `npm run build` で約30〜60秒増加する見込み（許容範囲）
  → 対策: `cache: 'npm'` で `node_modules` キャッシュを活用する（tasks 2.4 で設定）
