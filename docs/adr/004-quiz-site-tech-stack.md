# ADR-004: クイズサイトの技術スタックにReact + Vite + TypeScriptを採用する

## ステータス

Accepted

## コンテキスト

`yama-shu.com` にAWSクイズアプリを追加するにあたり、フロントエンドの技術スタックを選定する必要がある。クイズアプリには以下の要件がある。

- 問題の進行・フィルタリング・採点などのインタラクティブな状態管理
- サービス別フィルタリング（複数選択）
- コンポーネントの再利用（問題カード・結果表示等）
- 問題データをJSONで管理し、追加・編集が容易であること

また、サイト全体（トップページ含む）の技術スタックを統一するかどうかの判断も必要。

## 決定

サイト全体を **React + Vite + TypeScript** で再構築する。

- **React**: `useState` によるシンプルな状態管理でクイズの進行・採点を実装する
- **Vite**: 高速なビルドツール。`build.outDir: 'dist'`、`publicDir: 'static'` を設定し、S3へのデプロイ対象を `dist/` とする
- **TypeScript**: 問題データのスキーマを型定義で保証する
- **React Router**: `/`（トップページ）と `/aws-quiz`（クイズ）のルーティングを管理する
- **Node.js 22 LTS**: 2026年4月時点での最新安定版（Active LTS）

### ファイル構成

```
my-website/
├── index.html              ← Vite エントリーポイント
├── src/
│   ├── main.tsx
│   ├── App.tsx             ← React Router 設定
│   ├── pages/
│   │   ├── Home.tsx        ← トップページ（旧 public/index.html を移行）
│   │   └── AwsQuiz.tsx     ← クイズアプリのルート
│   ├── components/
│   │   ├── ServiceSelector.tsx
│   │   ├── QuizCard.tsx
│   │   └── Result.tsx
│   ├── data/
│   │   └── questions/      ← サービス別 JSON ファイル
│   └── types/
│       └── quiz.ts
├── static/                 ← 静的アセット（Vite の publicDir）
├── dist/                   ← ビルド成果物（.gitignore 対象）
├── package.json
└── vite.config.ts
```

### 問題データスキーマ

```typescript
interface Question {
  id: string;          // "{service}-{連番3桁}" 例: "vpc-001"
  service: string;     // サービス名 例: "VPC", "IAM", "KMS"
  phase: number;       // Phase番号（将来のフィルタリング拡張用）
  question: string;    // 問題文
  choices: string[];   // 4要素の配列
  answer: number;      // 正解のインデックス（0〜3）
  explanation: string; // 解説文
}
```

サービスごとにJSONファイルを分割し（`vpc.json`, `iam.json` 等）、問題追加時の差分を局所化する。

## その他の選択肢にしなかった理由

- **`/aws-quiz/` だけReact化（部分導入）**: ビルド変更が最小で済むが、サイト内で技術が混在し、将来のページ追加時に一貫性が損なわれる。新規開発で規模が小さいため、全体統一のコストが低い
- **Astro + React Island**: 静的コンテンツ主体のサイトに向いているが、クイズは全体がインタラクティブなため Island アーキテクチャの恩恵が少ない。学習コストに見合わない
- **純粋な HTML/CSS/JS（ビルドなし）**: フィルタリング・採点・コンポーネント再利用で保守性が下がる。状態管理を自前で実装するコストが高い

## 結果

**ポジティブ:**
- サイト全体の技術スタックが統一され、将来ページ追加時の判断コストがゼロになる
- TypeScriptによる問題データスキーマ検証で、データ不整合をビルド時に検出できる
- Viteの高速HMRにより開発体験が良好

**ネガティブ:**
- GitHub Actions のデプロイにビルドステップ（約30〜60秒）が追加される（`cache: 'npm'` で緩和）
- 既存の `public/index.html` をReactコンポーネントに移行する作業が必要（ただし内容がシンプルなため影響は軽微）
- ビルド成果物（`dist/`）の `.gitignore` 管理が必要
