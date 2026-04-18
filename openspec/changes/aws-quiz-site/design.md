## Context

現在 `yama-shu.com` は純粋な静的HTML（ビルドプロセスなし）をS3+CloudFrontで配信している。`public/` 以下のファイルを `aws s3 sync` するだけでデプロイが完結するシンプルな構成。

クイズアプリは状態管理（問題の進行、フィルタリング、採点）やコンポーネント再利用が必要なため、フレームワークを導入する。ビルド成果物は既存の `public/` ディレクトリに出力することで、既存のデプロイフローへの変更を最小化する。

## Goals / Non-Goals

**Goals:**
- React + Vite + TypeScript で4択クイズアプリを実装する
- Phase・サービス別フィルタリングが動作する
- 問題データを JSON で管理し、追加・編集が容易な設計にする
- 既存のデプロイフロー（S3 sync）を活かしつつビルドステップのみ追加する
- ADR-004 としてこの技術選定を記録する

**Non-Goals:**
- バックエンド・認証・スコア永続化（ローカルステートのみ）
- モバイルアプリ対応
- Phase1以外の問題データ作成（MWS-010のスコープ外）

## Decisions

### D1: フレームワーク — React + Vite + TypeScript

**決定**: React + Vite + TypeScript を採用する。

**理由**:
- クイズの状態管理（進行状況・フィルタ・採点）に React の `useState` が素直にマッチする
- Vite の `build.outDir` 設定で既存の `public/aws-quiz/` に出力でき、デプロイ変更が最小
- TypeScript により問題データのスキーマを型定義で保証できる

**検討した代替案**:
- **Astro + React Island**: 静的サイト向けとして優秀だが、クイズは全体がインタラクティブなので Island の恩恵が少ない。学習コストに見合わない
- **純粋な HTML/CSS/JS**: ビルド不要だが、フィルタリング・状態管理・コンポーネント再利用で保守性が下がる
- **Vue 3 / Svelte**: React に対する優位性がこのユースケースでは薄い

### D2: ファイル構成

```
my-website/
├── src/                          # Reactソースコード（新規）
│   ├── components/
│   │   ├── ServiceSelector.tsx   # Phase・サービス選択画面
│   │   ├── QuizCard.tsx          # 問題出題画面（4択）
│   │   └── Result.tsx            # 結果表示画面
│   ├── data/
│   │   └── questions/
│   │       ├── vpc.json
│   │       ├── iam.json
│   │       └── kms.json          # Phase1問題データ
│   ├── types/
│   │   └── quiz.ts               # 問題データスキーマ型定義
│   └── main.tsx
├── public/
│   ├── index.html                # 既存トップページ
│   └── aws-quiz/                 # ビルド成果物（.gitignore対象）
├── package.json
└── vite.config.ts                # build.outDir: 'public/aws-quiz'
```

**理由**: `src/` と `public/` を分離することで、ソースコードと配信物の責務が明確になる。既存の `public/index.html` を壊さない。

### D3: 問題データスキーマ

```typescript
interface Question {
  id: string;          // "vpc-001"
  phase: number;       // 1
  service: string;     // "VPC"
  question: string;    // 問題文
  choices: string[];   // 4択の選択肢（4要素）
  answer: number;      // 正解のインデックス（0〜3）
  explanation: string; // 解説
}
```

サービスごとに JSON ファイルを分割することで、問題追加時の差分が局所化される。

### D4: GitHub Actions 変更

既存の `deploy.yml` に以下を追加（S3 sync の前）：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build
```

`build.outDir` が `public/aws-quiz` なので、既存の `aws s3 sync ./public` でビルド成果物も同期される。

## Risks / Trade-offs

- **`public/aws-quiz/` の .gitignore 管理**: ビルド成果物をコミットしないよう `.gitignore` に追加必須。誤ってコミットするとリポジトリが汚染される → `.gitignore` に明示的に追加して対処
- **初回デプロイ前のビルド成果物不在**: `public/aws-quiz/` が空でも既存サイトには影響しない。CloudFront Function が `/aws-quiz/` を `/aws-quiz/index.html` に解決するため、ビルド後に初めてアクセス可能になる
- **Node.js CI追加によるデプロイ時間増加**: `npm ci` と `npm run build` で約30〜60秒増加する見込み（許容範囲）
