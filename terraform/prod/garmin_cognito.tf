# Garmin トレーニングログ用 Cognito ユーザープール

resource "aws_cognito_user_pool" "garmin" {
  name = "garmin-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  mfa_configuration = "OPTIONAL"

  email_mfa_configuration {
    message = "認証コードは {####} です。このコードは10分間有効です。"
    subject = "【yama-shu.com】メール認証コード"
  }

  password_policy {
    minimum_length    = 8
    require_numbers   = true
    require_symbols   = false
    require_uppercase = false
    require_lowercase = false
  }

  lifecycle {
    prevent_destroy = true
  }
}

# ウェブクライアント（フロントエンド用）
resource "aws_cognito_user_pool_client" "garmin" {
  name         = "garmin-web-client"
  user_pool_id = aws_cognito_user_pool.garmin.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
  ]
}
