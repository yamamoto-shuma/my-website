## ADDED Requirements

### Requirement: 声優クイズデータをS3バケットで管理する
声優クイズデータ（`voice_actors.json` / `titles.json`）はS3バケット（`yamamoto-shuma-my-website-prod`）の `data/vc-quiz/` プレフィックス以下にのみ存在しなければならない（SHALL）。GitHubリポジトリには声優クイズJSONを含めてはならない（SHALL NOT）。

#### Scenario: S3に声優クイズデータが存在する
- **WHEN** S3バケットの `data/vc-quiz/` プレフィックスを確認する
- **THEN** `voice_actors.json` と `titles.json` が存在する

#### Scenario: GitリポジトリにクイズJSONが含まれない
- **WHEN** `git ls-files public/data/vc-quiz/` を実行する
- **THEN** 出力が空である（追跡ファイルなし）

### Requirement: npm scriptsで声優クイズデータのS3同期コマンドを提供する
`package.json` に以下のスクリプトを追加しなければならない（SHALL）。
- `vc-quiz:pull`: S3から `public/data/vc-quiz/` にデータを取得
- `vc-quiz:push`: `public/data/vc-quiz/` からS3にデータをアップロード

#### Scenario: vc-quiz:pullでデータ取得できる
- **WHEN** `npm run vc-quiz:pull` を実行する
- **THEN** `public/data/vc-quiz/` に `voice_actors.json` と `titles.json` がダウンロードされる

#### Scenario: vc-quiz:pushでデータ更新できる
- **WHEN** ローカルでJSONを編集後 `npm run vc-quiz:push` を実行する
- **THEN** 変更がS3の `data/vc-quiz/` プレフィックスに反映される

### Requirement: デプロイ時に声優クイズデータが削除されない
GitHub ActionsのS3 syncコマンドは `data/vc-quiz/*` を除外しなければならない（SHALL）。これによりデプロイが声優クイズデータを削除しない。

#### Scenario: S3 syncが声優クイズデータを除外する
- **WHEN** デプロイワークフローが実行される
- **THEN** `aws s3 sync` コマンドに `--exclude "data/vc-quiz/*"` が含まれており、S3の `data/vc-quiz/` 以下のファイルが削除されない
