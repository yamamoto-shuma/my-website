## Why

自分が視聴したアニメ作品の声優とキャラクターの紐付けを楽しく学習・定着させるクイズ機能がない。AWS Quizで確立したS3管理・ランタイムfetchパターンを活用して、同様のクイズ機能を声優領域で提供する。

## What Changes

- 声優クイズページ（`/vc-quiz`）を新規追加
  - 作品選択画面（TitleSelector）：出題対象作品のチェックボックス + 問題数設定
  - クイズ画面（VcQuizPage）：正引き/逆引きランダム混在・4択・プログレスバー・回答後解説
  - 結果画面（VcResultPage）：正答率 + 問題一覧
- ナビゲーションに声優クイズリンクを追加（AWS Quizと並列）
- S3バケットに声優クイズ用データを追加（`data/vc-quiz/` プレフィックス）
  - `voice_actors.json`：声優マスタ
  - `titles.json`：作品・キャラクターデータ
- npm scriptsに声優クイズ用S3同期コマンドを追加
- AWS QuizのS3プレフィックスを `data/questions/` から `data/aws-quiz/` に変更（命名規則を `data/{quiz-type}/` 形式に統一）

## Capabilities

### New Capabilities

- `vc-quiz`: 声優クイズ機能（作品選択・出題・採点・結果表示・S3データ管理）

### Modified Capabilities

- `quiz-data-s3-management`: 声優データ（voice_actors.json）・作品データ（titles.json）のS3管理ルールを追加、AWS QuizのS3プレフィックス変更

## Impact

- `src/pages/` に VcQuiz 関連ページを新規追加
- `src/components/` に声優クイズ専用コンポーネントを追加
- `src/App.tsx`（または Router）にルート `/vc-quiz` を追加
- `src/components/Navigation.tsx`（またはヘッダー）に声優クイズリンクを追加
- `package.json` に `vc-quiz:pull` / `vc-quiz:push` スクリプトを追加
- S3バケット `yamamoto-shuma-my-website-prod` の `data/vc-quiz/` プレフィックスを使用
- CI/CDの `--exclude` を `data/aws-quiz/*`（変更）・`data/vc-quiz/*`（追加）に更新
- `src/pages/AwsQuiz.tsx` のfetch URLを `data/aws-quiz/` に更新
