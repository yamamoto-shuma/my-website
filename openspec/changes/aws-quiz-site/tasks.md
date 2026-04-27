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

- [x] 3.1 `src/types/quiz.ts` に `Question` 型を定義する
- [x] 3.2 `src/components/ServiceSelector.tsx` を実装する（サービス別フィルタリング、問題0件時の開始ボタン無効化）
- [x] 3.3 `src/components/QuizCard.tsx` を実装する（4択表示、正誤フィードバック、解説表示、次へボタン）
- [x] 3.4 `src/components/Result.tsx` を実装する（正解数・正答率・サービス別内訳、もう一度ボタン、サービス選択に戻るボタン）
- [x] 3.5 `src/data/questions/` にダミー問題データ（各サービス1問）を配置してローカル動作確認する

## 4. Phase1問題データ作成（MWS-010）

- [x] 4.1 `src/data/questions/vpc.json` を作成する（VPC問題10問以上、実務レベル）
- [x] 4.2 `src/data/questions/iam.json` を作成する（IAM問題10問以上、実務レベル）
- [x] 4.3 `src/data/questions/kms.json` を作成する（KMS問題10問以上、実務レベル）
- [x] 4.4 ローカルでPhase1の全問題が正しく表示・採点されることを確認する

## 5. Phase1レビュー改善 + Phase2問題データ作成（MWS-011）

- [x] 5.1 VPC・IAM・KMSの全問題を3ラウンドのレビューで品質改善する（試験トリビア・数値暗記を実務・設計判断問題に差し替え）
- [x] 5.2 `src/data/questions/ec2.json` を作成する（EC2問題10問以上、実務レベル）
- [x] 5.3 `src/data/questions/autoscaling.json` を作成する（Auto Scaling問題10問以上、実務レベル）
- [x] 5.4 `src/data/questions/ebs.json` を作成する（EBS問題10問以上、実務レベル）
- [x] 5.5 `src/data/questions/ecs.json` を作成する（ECS問題10問以上、実務レベル）
- [x] 5.6 `src/data/questions/lambda.json` を作成する（Lambda問題10問以上、実務レベル）
- [x] 5.7 Phase2各サービスの問題を3ラウンドのレビューで品質確認する

## 6. Phase3問題データ作成（MWS-012）

- [x] 6.1 `src/data/questions/alb-nlb.json` を作成する（ALB/NLB問題10問以上、実務レベル）
- [x] 6.2 `src/data/questions/route53.json` を作成する（Route 53問題10問以上、実務レベル）
- [x] 6.3 `src/data/questions/cloudfront.json` を作成する（CloudFront問題10問以上、実務レベル）
- [x] 6.4 `src/data/questions/api-gateway.json` を作成する（API Gateway問題10問以上、実務レベル）
- [x] 6.5 Phase3各サービスの問題を3ラウンドのレビューで品質確認する

## 7. Phase4問題データ作成 + Phase別UIグループ化（MWS-013）

- [x] 7.1 `src/data/questions/s3.json` を作成する（S3問題10問以上、実務レベル）
- [x] 7.2 `src/data/questions/efs.json` を作成する（EFS問題10問以上、実務レベル）
- [x] 7.3 `src/data/questions/aurora.json` を作成する（Aurora問題10問以上、実務レベル）
- [x] 7.4 `src/data/questions/dynamodb.json` を作成する（DynamoDB問題10問以上、実務レベル）
- [x] 7.5 `src/components/ServiceSelector.tsx` をPhaseブロック別表示に変更する（`phaseGroups` propsに変更、Phase別ヘッダー・一括選択/解除ボタン追加）
- [x] 7.6 `src/pages/AwsQuiz.tsx` に `PHASE_GROUPS` 定数を定義しPhase4インポートを追加する
- [x] 7.7 Phase4各サービスの問題を3ラウンドのレビューで品質確認する（factual errorを含む選択肢を修正）

## 8. Phase5問題データ作成（MWS-014）

- [x] 8.1 `src/data/questions/waf.json` を作成する（WAF問題11問、実務レベル）
- [x] 8.2 `src/data/questions/secrets-manager.json` を作成する（Secrets Manager問題11問、実務レベル）
- [x] 8.3 `src/data/questions/cloudwatch.json` を作成する（CloudWatch問題11問、実務レベル）
- [x] 8.4 `src/data/questions/cloudtrail.json` を作成する（CloudTrail問題11問、実務レベル）
- [x] 8.5 `src/pages/AwsQuiz.tsx` にPhase5インポートとPHASE_GROUPSエントリを追加する
- [x] 8.6 Phase5各サービスの問題を3ラウンドのレビューで品質確認する（secrets-manager-003の誤記を修正）

## 9. Phase6問題データ作成（MWS-015）

- [ ] 9.1 `src/data/questions/sqs.json` を作成する（SQS問題11問、実務レベル）
- [ ] 9.2 `src/data/questions/sns.json` を作成する（SNS問題11問、実務レベル）
- [ ] 9.3 `src/data/questions/eventbridge.json` を作成する（EventBridge問題11問、実務レベル）
- [ ] 9.4 `src/data/questions/step-functions.json` を作成する（Step Functions問題11問、実務レベル）
- [ ] 9.5 `src/pages/AwsQuiz.tsx` にPhase6インポートとPHASE_GROUPSエントリを追加する
- [ ] 9.6 Phase6各サービスの問題を3ラウンドのレビューで品質確認する
