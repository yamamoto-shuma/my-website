# Garmin トレーニングログ用 HTTP API (API Gateway v2)

locals {
  # Cognito JWT 発行者 URL（Data Source から直接参照しないための Local 変数）
  cognito_user_pool_id        = aws_cognito_user_pool.garmin.id
  cognito_user_pool_client_id = aws_cognito_user_pool_client.garmin.id
  garmin_lambda_invoke_arn    = aws_lambda_function.garmin.invoke_arn
  garmin_lambda_function_name = aws_lambda_function.garmin.function_name

  # JWT 発行者 URL
  cognito_issuer_url = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${local.cognito_user_pool_id}"

  # CORS 許可オリジン
  cors_allow_origins = [
    "https://yama-shu.com",
    "http://localhost:5173",
  ]
}

# HTTP API
resource "aws_apigatewayv2_api" "garmin" {
  name          = "garmin-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = local.cors_allow_origins
    allow_headers = ["content-type", "authorization"]
    allow_methods = ["GET", "PUT", "POST", "OPTIONS"]
  }
}

# JWT オーソライザー（Cognito）
resource "aws_apigatewayv2_authorizer" "garmin" {
  api_id           = aws_apigatewayv2_api.garmin.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "garmin-cognito-authorizer"

  jwt_configuration {
    audience = [local.cognito_user_pool_client_id]
    issuer   = local.cognito_issuer_url
  }
}

# Lambda インテグレーション（AWS_PROXY）
resource "aws_apigatewayv2_integration" "garmin" {
  api_id                 = aws_apigatewayv2_api.garmin.id
  integration_type       = "AWS_PROXY"
  integration_uri        = local.garmin_lambda_invoke_arn
  payload_format_version = "2.0"
}

# ルート: GET /garmin/activities/{date}
resource "aws_apigatewayv2_route" "garmin_get_activities" {
  api_id             = aws_apigatewayv2_api.garmin.id
  route_key          = "GET /garmin/activities/{date}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.garmin.id
  target             = "integrations/${aws_apigatewayv2_integration.garmin.id}"
}

# ルート: GET /garmin/notes/{date}
resource "aws_apigatewayv2_route" "garmin_get_notes" {
  api_id             = aws_apigatewayv2_api.garmin.id
  route_key          = "GET /garmin/notes/{date}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.garmin.id
  target             = "integrations/${aws_apigatewayv2_integration.garmin.id}"
}

# ルート: PUT /garmin/notes/{date}
resource "aws_apigatewayv2_route" "garmin_put_notes" {
  api_id             = aws_apigatewayv2_api.garmin.id
  route_key          = "PUT /garmin/notes/{date}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.garmin.id
  target             = "integrations/${aws_apigatewayv2_integration.garmin.id}"
}

# ルート: GET /garmin/analysis/{date}
resource "aws_apigatewayv2_route" "garmin_get_analysis" {
  api_id             = aws_apigatewayv2_api.garmin.id
  route_key          = "GET /garmin/analysis/{date}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.garmin.id
  target             = "integrations/${aws_apigatewayv2_integration.garmin.id}"
}

# ルート: POST /garmin/analysis/{date}
resource "aws_apigatewayv2_route" "garmin_post_analysis" {
  api_id             = aws_apigatewayv2_api.garmin.id
  route_key          = "POST /garmin/analysis/{date}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.garmin.id
  target             = "integrations/${aws_apigatewayv2_integration.garmin.id}"
}

# ルート: GET /garmin/profile
resource "aws_apigatewayv2_route" "garmin_get_profile" {
  api_id             = aws_apigatewayv2_api.garmin.id
  route_key          = "GET /garmin/profile"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.garmin.id
  target             = "integrations/${aws_apigatewayv2_integration.garmin.id}"
}

# ルート: PUT /garmin/profile
resource "aws_apigatewayv2_route" "garmin_put_profile" {
  api_id             = aws_apigatewayv2_api.garmin.id
  route_key          = "PUT /garmin/profile"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.garmin.id
  target             = "integrations/${aws_apigatewayv2_integration.garmin.id}"
}

# デフォルトステージ（自動デプロイ）
resource "aws_apigatewayv2_stage" "garmin" {
  api_id      = aws_apigatewayv2_api.garmin.id
  name        = "$default"
  auto_deploy = true
}

# Lambda への API Gateway 呼び出し許可
resource "aws_lambda_permission" "garmin_apigateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = local.garmin_lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.garmin.execution_arn}/*/*"
}
