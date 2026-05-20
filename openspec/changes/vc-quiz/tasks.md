## 1. AWS Quiz S3プレフィックス変更（data/questions/ → data/aws-quiz/）

- [x] 1.1 `package.json` の `quiz:pull`・`quiz:push` スクリプトのS3パスと `quiz:invalidate` の `--paths` を `data/aws-quiz/` に更新
- [x] 1.2 `.github/workflows/deploy.yml` の `--exclude "data/questions/*"` を `--exclude "data/aws-quiz/*"` に更新
- [x] 1.3 `src/pages/AwsQuiz.tsx` のfetch URLを `/data/questions/` から `/data/aws-quiz/` に更新
- [x] 1.4 S3バケットのデータを `data/questions/` から `data/aws-quiz/` に移動（`aws s3 sync`）
- [x] 1.5 `README.md` のAWS Quizデータ管理手順のS3パスを更新

## 2. VcQuiz 設定・インフラ

- [x] 2.1 `.gitignore` に `public/data/vc-quiz/` が含まれているか確認（既に `public/data/` が対象なら不要）
- [x] 2.2 `package.json` に `vc-quiz:pull`・`vc-quiz:push` スクリプトを追加
- [x] 2.3 `.github/workflows/deploy.yml` の `aws s3 sync` に `--exclude "data/vc-quiz/*"` を追加

## 3. 型定義

- [x] 3.1 `src/types/vcQuiz.ts` を作成し、`VoiceActor`・`Title`・`Character`・`VcQuestion` 型を定義

## 4. クイズロジック

- [x] 4.1 `src/lib/vcQuizLogic.ts` を作成し、誤答生成アルゴリズムを実装（正引き：同性+デビュー年±3年優先 / 逆引き：同声優除外）
- [x] 4.2 正引き・逆引きランダム混在の問題生成関数を実装（重複なし、指定問題数でシャッフル）

## 5. コンポーネント実装

- [x] 5.1 `src/components/VcTitleSelector.tsx` を実装（作品チェックボックス一覧・全選択/全解除・問題数設定・開始ボタン）
- [x] 5.2 `src/components/VcQuizPage.tsx` を実装（4択ボタン・プログレスバー・回答後フィードバック＋声優プロフィール・次へボタン）
- [x] 5.3 `src/components/VcResultPage.tsx` を実装（正答率・問題一覧・もう一度ボタン）

## 6. ページ・ルーティング・ナビゲーション

- [x] 6.1 `src/pages/VcQuiz.tsx` を作成（フェーズ管理：selector → loading → quiz → result）
- [x] 6.2 `src/App.tsx`（またはRouterファイル）に `/vc-quiz` ルートを追加
- [x] 6.3 ナビゲーションコンポーネントに声優クイズリンクを追加（AWS Quizと並列）

## 7. スタイリング

- [x] 7.1 VcQuiz専用CSS変数（`--vc-primary: #E60012`・`--vc-accent: #FFD700`・`--vc-surface: #FFF0F0`）をCSSファイルに定義
- [x] 7.2 各コンポーネントにカラーテーマを適用（VcTitleSelector・VcQuizPage・VcResultPage）
- [x] 7.3 モバイルレスポンシブ対応（375px以上で選択肢縦並び・タップ可能サイズ確認）

## 8. データ作成・S3アップロード

- [x] 8.1 `static/data/vc-quiz/voice_actors.csv` に声優データを作成（22件）
- [x] 8.2 `static/data/vc-quiz/titles.csv` に作品データを作成（進撃の巨人のみ）
- [x] 8.3 `static/data/vc-quiz/characters.csv` に中間テーブルを作成（進撃の巨人15キャラ）
- [x] 8.4 `npm run vc-quiz:push` で S3 にアップロード

## 10. CSVへのデータ形式移行

- [x] 10.1 JSONからCSV3ファイル正規化構成に変更（voice_actors.csv / titles.csv / characters.csv）
- [x] 10.2 `src/pages/VcQuiz.tsx` のfetch処理をCSVパース対応に更新（`parseCSV` 関数 + 3ファイルfetch + JOIN処理）
- [ ] 10.3 旧JSONファイル（voice_actors.json / titles.json）をS3から削除
- [ ] 10.4 S3に新CSVファイルをアップロード（`npm run vc-quiz:push`）

## 11. birthday対応・年齢表示

- [x] 11.1 `src/types/vcQuiz.ts` の `VoiceActor.debut_year: number` を `birthday: string` に変更
- [x] 11.2 `src/pages/VcQuiz.tsx` のCSVパースを `birthday: r.birthday` に更新
- [x] 11.3 `src/lib/vcQuizLogic.ts` の誤答アルゴリズムを `birthday` の生年ベースに更新（生年不明はスキップ）
- [x] 11.4 `src/components/VcQuizPage.tsx` に `formatAge` 関数を実装（`{age}歳（{date}）` / `年齢非公表（{date}）` / `年齢非公表`）
- [x] 11.5 `voice_actors.csv` の `debut_year` 列を `birthday`（`yyyy/mm/dd`形式）に変更

## 9. 動作確認

- [ ] 9.1 `npm run dev` でローカル起動し、作品選択→出題→結果の全フローを確認
- [ ] 9.2 正引き・逆引きが混在出題されること、誤答の同性条件を確認
- [ ] 9.3 Chrome DevTools でモバイル表示（375px）を確認
- [x] 9.4 `npm run build` でビルドエラーがないことを確認（静的ファイルは static/ に配置）
- [ ] 9.5 AWS Quizが `data/aws-quiz/` から正常にfetchできることを確認
