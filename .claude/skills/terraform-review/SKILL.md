---
name: terraform-review
description: Review Terraform code against the project guidelines (terraform/GUIDELINE.md). Use when the user wants to check whether Terraform code complies with the project coding standards.
license: MIT
metadata:
  author: project
  version: "1.0"
---

# Terraform ガイドラインレビュー

`terraform/GUIDELINE.md` に基づき、Terraformコードをレビューする。

## 手順

1. `terraform/GUIDELINE.md` を読み込み、最新のガイドライン内容を把握する
2. レビュー対象の `.tf` ファイルを特定する
   - 引数でファイルやディレクトリが指定された場合はその範囲のみ
   - 指定がなければ `terraform/` 配下の全 `.tf` ファイルを対象とする
3. 各ファイルを読み込み、下記チェックリストに沿って違反を洗い出す
4. 結果をレポート形式でまとめる
5. 現在のブランチに紐づくPRにレビュー結果をコメントとして投稿する
   ```bash
   gh pr comment --body "$(cat <<'EOF'
   {レポート内容}
   EOF
   )"
   ```
   - PRが存在しない場合はその旨をユーザーに伝え、レポートをターミナルに出力するだけにする
   - `gh pr comment` がエラーになった場合は `gh api` で代替する

## チェックリスト

### 命名規則
- [ ] リソース名・変数名はアンダースコア区切りか（例: `example_variable_name`）
- [ ] リソース種別がリソース名に含まれていないか（例: `aws_s3_bucket "bucket"` は NG、`aws_s3_bucket "example"` は OK）
- [ ] リソースタイプと名前が二重引用符で囲まれているか

### コメント
- [ ] コメントに `//` や `/* */` ではなく `#` を使っているか

### 変数
- [ ] Input Variables には全て `type` と `description` が定義されているか
- [ ] ファイル内で閉じる値は Local Values を使っているか（外部インプット不要なのに `variable` を使っていないか）

### コレクション型
- [ ] `tuple` を使っていないか（代わりに `list`, `map`, `object` を使う）
- [ ] `list`, `list(any)` を使っていないか（`list(string)` 等の型宣言をする）
- [ ] `map`, `map(any)` を使っていないか（`map(string)` 等の型宣言をする）
- [ ] 値の型が固定できない箇所で `map` ではなく `object` を使っているか
- [ ] モジュールの引数に `map` ではなく `object` を使っているか

### any型
- [ ] `any` 型を使っていないか（具体的な型で代替できないか確認）

### リソース属性参照
- [ ] ARNやIDなどをハードコードせず、リソース属性参照（`resource_type.resource_name.attribute`）を使っているか

### countとfor_each
- [ ] `count` ではなく `for_each` を使っているか
- [ ] `count` の使用がリソース作成有無（0/1）の場合のみに限定されているか
- [ ] `for_each` のキーに `known after apply` の値を使っていないか

### タグ（AWS）
- [ ] プロジェクト共通タグは Provider 側（`default_tags`）で定義されているか
- [ ] 個別リソースへのタグ上書きは最小限か

### IAM Policy（AWS）
- [ ] IAM Policy は Data Source の `aws_iam_policy_document` を使っているか（JSON 直書きをしていないか）

### Data Source
- [ ] Data Source の引数に他のリソースを直接参照していないか（Local Values 経由にする）

### スタンドアローンリソース vs インライン
- [ ] スタンドアローンリソースを優先しているか（インラインブロックを避けているか）

### 削除保護
- [ ] 重要リソースに `enable_deletion_protection` または `deletion_protection` が有効化されているか

### リソース宣言順
- [ ] 依存関係のある場合、親リソースを先に宣言しているか

### リソースパラメータ順
各リソースブロック内のパラメータ順が以下になっているか
1. `count` / `for_each`
2. ノンブロックパラメータ（マニュアル記載順）
3. ブロックパラメータ
4. `lifecycle`
5. `depends_on`
6. タグ等の全リソース共通パラメータ

### シンボリックリンク
- [ ] シンボリックリンクしているファイルが `terraform.tf` と `providers.tf` のみか
- [ ] シンボリックリンクの元ファイルがルートフォルダまたは `shared` フォルダにあるか

### モジュール
- [ ] 入力パラメータ数を最小限に抑えているか
- [ ] 入力パラメータにデフォルト値が設定されているか（誤ったリソース作成の可能性がある場合は必須入力でも可）
- [ ] サードパーティモジュールを使用していないか

### カスタムメッセージ（バリデーション）
- [ ] `variable` に `validation` ブロックが設定されているか
- [ ] `precondition` / `postcondition` はモジュール内で適切に使われているか

### バージョニング
- [ ] `required_version` がパッチバージョンまで固定されているか（例: `= 1.10.3`）
- [ ] Provider の `version` がパッチバージョンまで固定されているか（`~>` ではなく `=` を使う）

### ディレクトリ構成
- [ ] 推奨構成（`dev/`, `prod/`, `shared/modules/`）に従っているか
- [ ] 各ディレクトリに `main.tf`, `variables.tf`, `outputs.tf`, `terraform.tf`, `provider.tf` が揃っているか

---

## レポート形式

レビュー結果は以下の形式で出力する。

```
## Terraform ガイドラインレビュー結果

### サマリー
- 対象ファイル数: X
- 違反件数: Y（重大: A / 軽微: B）

### 違反一覧

#### [重大] ファイル名:行番号
- **カテゴリ**: 命名規則 / 変数 / etc.
- **ガイドライン**: 該当するガイドラインの内容
- **問題**: 何が違反しているか
- **修正案**: どう直すべきか

#### [軽微] ファイル名:行番号
...

### 準拠項目
- 問題のなかった主要なチェック項目を列挙
```

重大・軽微の分類基準:
- **重大**: セキュリティリスク（削除保護なし、any型の多用）、バージョン未固定、サードパーティモジュール使用、ハードコード
- **軽微**: 命名規則の軽微な違反、パラメータ順序、コメントスタイル
