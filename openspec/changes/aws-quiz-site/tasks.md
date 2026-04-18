## 1. ADR作成（MWS-007）

- [ ] 1.1 `docs/adr/ADR-004-quiz-site-tech-stack.md` を作成する（技術スタック・ファイル構成・データ設計の選定根拠を記載）

## 2. Reactプロジェクトセットアップ（MWS-008）

- [ ] 2.1 `npm create vite@latest` で React + TypeScript プロジェクトを初期化する
- [ ] 2.2 `vite.config.ts` で `build.outDir` を `public/aws-quiz` に設定する
- [ ] 2.3 `.gitignore` に `public/aws-quiz/` と `node_modules/` を追加する
- [ ] 2.4 `.github/workflows/deploy.yml` に Node.js セットアップ・`npm ci`・`npm run build` のステップを追加する
- [ ] 2.5 `npm run build` でビルドが正常に完了することをローカルで確認する

## 3. クイズUIコンポーネント実装（MWS-009）

- [ ] 3.1 `src/types/quiz.ts` に `Question` 型を定義する
- [ ] 3.2 `src/components/ServiceSelector.tsx` を実装する（Phase・サービス別フィルタリング、問題0件時の開始ボタン無効化）
- [ ] 3.3 `src/components/QuizCard.tsx` を実装する（4択表示、正誤フィードバック、解説表示、次へボタン）
- [ ] 3.4 `src/components/Result.tsx` を実装する（正解数・正答率・サービス別内訳、もう一度ボタン）
- [ ] 3.5 `src/data/questions/` にダミー問題データ（各サービス1問）を配置してローカル動作確認する

## 4. Phase1問題データ作成（MWS-010）

- [ ] 4.1 `src/data/questions/vpc.json` を作成する（VPC問題10問以上、実務レベル）
- [ ] 4.2 `src/data/questions/iam.json` を作成する（IAM問題10問以上、実務レベル）
- [ ] 4.3 `src/data/questions/kms.json` を作成する（KMS問題10問以上、実務レベル）
- [ ] 4.4 ローカルでPhase1の全問題が正しく表示・採点されることを確認する
