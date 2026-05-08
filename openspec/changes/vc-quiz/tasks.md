## 1. 設定・インフラ

- [ ] 1.1 `.gitignore` に `public/data/vc-quiz/` が含まれているか確認（既に `public/data/` が対象なら不要）
- [ ] 1.2 `package.json` に `vc-quiz:pull`・`vc-quiz:push` スクリプトを追加
- [ ] 1.3 `.github/workflows/deploy.yml` の `aws s3 sync` に `--exclude "data/vc-quiz/*"` を追加

## 2. 型定義

- [ ] 2.1 `src/types/vcQuiz.ts` を作成し、`VoiceActor`・`Title`・`Character`・`VcQuestion` 型を定義

## 3. クイズロジック

- [ ] 3.1 `src/lib/vcQuizLogic.ts` を作成し、誤答生成アルゴリズムを実装（正引き：同性+デビュー年±3年優先 / 逆引き：同声優除外）
- [ ] 3.2 正引き・逆引きランダム混在の問題生成関数を実装（重複なし、指定問題数でシャッフル）

## 4. コンポーネント実装

- [ ] 4.1 `src/components/VcTitleSelector.tsx` を実装（作品チェックボックス一覧・全選択/全解除・問題数設定・開始ボタン）
- [ ] 4.2 `src/components/VcQuizPage.tsx` を実装（4択ボタン・プログレスバー・回答後フィードバック＋声優プロフィール・次へボタン）
- [ ] 4.3 `src/components/VcResultPage.tsx` を実装（正答率・問題一覧・もう一度ボタン）

## 5. ページ・ルーティング・ナビゲーション

- [ ] 5.1 `src/pages/VcQuiz.tsx` を作成（フェーズ管理：selector → loading → quiz → result）
- [ ] 5.2 `src/App.tsx`（またはRouterファイル）に `/vc-quiz` ルートを追加
- [ ] 5.3 ナビゲーションコンポーネントに声優クイズリンクを追加（AWS Quizと並列）

## 6. スタイリング

- [ ] 6.1 VcQuiz専用CSS変数（`--vc-primary: #E60012`・`--vc-accent: #FFD700`・`--vc-surface: #FFF0F0`）をCSSファイルに定義
- [ ] 6.2 各コンポーネントにジャンプ配色テーマを適用（VcTitleSelector・VcQuizPage・VcResultPage）
- [ ] 6.3 モバイルレスポンシブ対応（375px以上で選択肢縦並び・タップ可能サイズ確認）

## 7. サンプルデータ作成・S3アップロード

- [ ] 7.1 `public/data/vc-quiz/voice_actors.json` にサンプル声優データを5〜10件作成
- [ ] 7.2 `public/data/vc-quiz/titles.json` にサンプル作品データを3〜5件作成（各2〜4キャラ）
- [ ] 7.3 `npm run vc-quiz:push` で S3 にアップロード

## 8. 動作確認

- [ ] 8.1 `npm run dev` でローカル起動し、作品選択→出題→結果の全フローを確認
- [ ] 8.2 正引き・逆引きが混在出題されること、誤答の同性条件を確認
- [ ] 8.3 Chrome DevTools でモバイル表示（375px）を確認
- [ ] 8.4 `npm run build` でビルドエラーがないことを確認
