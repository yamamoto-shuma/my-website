# Terraform

Terraformの実装では必ずガイドライン（`terraform/GUIDELINE.md`）に準拠してください。

# レビュー

レビューの際は以下のスキルを順番に使用してください

1. まずは`terraform-review`でガイドラインの違反がないかレビューする
2. 次に`my-claude-code-plugin:revpr`で実装の中身をレビューする
3. 2つのレビュー結果を踏まえて、対応すべきレビューと推奨度をユーザに提示する
