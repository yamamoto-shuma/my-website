## Context

AWS Quizで確立したS3管理・ランタイムfetchパターン（MWS-018）を踏襲して声優クイズを実装する。クイズデータ（voice_actors.json / titles.json）はS3バケットの `data/vc-quiz/` プレフィックスに格納し、ReactがビルドバンドルからJSONを除外した上でランタイムにCloudFront経由でfetchする。

## Goals / Non-Goals

**Goals:**
- 声優クイズ機能（作品選択 → 出題 → 結果）の実装
- 正引き/逆引きランダム混在4択の誤答生成アルゴリズム
- 専用カラーテーマによるUI
- モバイル対応レスポンシブデザイン
- S3データ管理（npm scripts + .gitignore）

**Non-Goals:**
- キャラクター・声優の画像表示
- 外部API（AniList, MyAnimeList等）との連携
- ユーザーアカウント・学習履歴の永続化
- データ自動収集・スクレイピング

## Decisions

### 1. データ構造：voice_actors と titles を分離

**決定**: `voice_actors.json`（声優マスタ）と `titles.json`（作品+キャラクター）を別ファイルで管理。`va_id` で参照。

**理由**: 声優データは複数作品をまたいで共有される。1ファイルにまとめると作品追加のたびに声優プロフィールを重複記述することになり、更新漏れ・不整合のリスクが高い。

### 2. S3プレフィックス命名規則の統一

**決定**: AWS Quizのプレフィックスを `data/questions/` から `data/aws-quiz/` に変更し、VcQuizの `data/vc-quiz/` と命名規則を揃える。

**理由**: `data/questions/` はAWS Quizに固有の命名であり、クイズ種別が増えると区別できなくなる。`data/{quiz-type}/` 形式に統一することで独立性・可読性を確保する。

### 3. 誤答生成アルゴリズム

**正引き（キャラ → 声優）**:
1. 絶対条件：正解声優と同性の声優を候補プールとする
2. 努力条件：`debut_year` が ±3年以内の声優を優先
3. 不足分は同性からランダムで補完（3人確保）

**逆引き（声優 → キャラ）**:
1. 正解キャラ以外のキャラ全体から3つをランダム選択
2. 同一声優が演じるキャラは誤答候補から除外

**決定理由**: 性別一致は最低限の難易度保証。デビュー年近接は「同世代声優」として区別困難な選択肢を生成し学習効果を高める。

### 4. コンポーネント設計

AWS Quizの構造を踏襲しつつ声優クイズ専用ページとして実装：

| AWS Quiz | VcQuiz |
|----------|--------|
| `AwsQuiz.tsx` | `VcQuiz.tsx`（エントリ・状態管理） |
| `ServiceSelector.tsx` | `VcTitleSelector.tsx`（作品選択+問題数） |
| quiz phase | `VcQuizPage.tsx`（出題・プログレスバー） |
| result phase | `VcResultPage.tsx`（結果一覧） |

### 5. テーマカラー

CSS変数でVcQuiz専用テーマを定義し、AWS Quizのテーマ（青系）と独立させる：
- `--vc-primary: #E60012`
- `--vc-accent: #FFD700`
- `--vc-surface: #FFF0F0`

## Risks / Trade-offs

- **初回fetch遅延**: ページ遷移時にvoice_actors.jsonとtitles.jsonを並列fetchするため、データ量が増えるとロード時間が増加する → Loading状態をUIで明示し、将来的にはデータ分割も可能
- **データ整合性**: `va_id` 参照の整合性はJSONの手動管理に依存。typoでキャラクターが孤立してもランタイムまで検知できない → 将来的にJSONバリデーションスクリプトを検討

## Open Questions

- なし（全設計決定済み）
