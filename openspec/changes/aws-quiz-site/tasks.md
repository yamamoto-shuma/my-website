## 1. ADR作成（MWS-007）

- [x] 1.1 `docs/adr/004-quiz-site-tech-stack.md` を作成する（技術スタック・全体React化・ファイル構成・データ設計の選定根拠を記載）

## 2. Reactプロジェクトセットアップ（MWS-008）

- [x] 2.1 `npm create vite@latest` で React + TypeScript プロジェクトを初期化する（Node.js 24 LTS）
- [x] 2.2 `vite.config.ts` で `publicDir: 'static'`、`build.outDir: 'dist'` を設定する
- [x] 2.3 `.gitignore` に `dist/` を追加する
- [x] 2.4 `.github/workflows/deploy.yml` に Node.js 24 セットアップ・`npm ci`・`npm run build` のステップを追加し、sync元を `./public` から `./dist` に変更する（`cache: 'npm'` を設定してCIキャッシュを有効化する）
- [x] 2.5 既存の `public/index.html` を `src/pages/Home.tsx` に移行し、`public/` ディレクトリを削除する
- [x] 2.6 React Router を設定し、`/` → `Home`、`/aws-quiz` → `AwsQuiz` のルーティングを実装する
- [x] 2.7 `npm run build` でビルドが正常に完了し、`dist/` に成果物が出力されることをローカルで確認する

## 3. クイズUIコンポーネント実装（MWS-009）

- [ ] 3.1 `src/types/quiz.ts` に `Question` 型を定義する
- [ ] 3.2 `src/components/ServiceSelector.tsx` を実装する（サービス別フィルタリング、問題0件時の開始ボタン無効化）
- [ ] 3.3 `src/components/QuizCard.tsx` を実装する（4択表示、正誤フィードバック、解説表示、次へボタン）
- [ ] 3.4 `src/components/Result.tsx` を実装する（正解数・正答率・サービス別内訳、もう一度ボタン）
- [ ] 3.5 `src/data/questions/` にダミー問題データ（各サービス1問）を配置してローカル動作確認する

## 4. Phase1問題データ作成（MWS-010）

- [ ] 4.1 `src/data/questions/vpc.json` を作成する（VPC問題10問以上、実務レベル）
- [ ] 4.2 `src/data/questions/iam.json` を作成する（IAM問題10問以上、実務レベル）
- [ ] 4.3 `src/data/questions/kms.json` を作成する（KMS問題10問以上、実務レベル）
- [ ] 4.4 ローカルでPhase1の全問題が正しく表示・採点されることを確認する
