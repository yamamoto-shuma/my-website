# Garmin トレーニングログ用 Secrets Manager シークレット
# 実際の値は手動で設定する（Terraform 管理外）

# Garmin garth OAuth2 トークン
resource "aws_secretsmanager_secret" "garmin_token" {
  name = "garmin/garmin-token"
}

# Gemini API キー
resource "aws_secretsmanager_secret" "gemini_api_key" {
  name = "garmin/gemini-api-key"
}
