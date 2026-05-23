# Garmin トレーニングログ用 Lambda 関数

locals {
  # Lambda 関数名
  garmin_lambda_name = "garmin-api"

  # DynamoDB テーブル ARN（IAM ポリシードキュメントから直接参照しないための Local 変数）
  garmin_activities_table_arn  = aws_dynamodb_table.garmin_activities.arn
  garmin_notes_table_arn       = aws_dynamodb_table.garmin_notes.arn
  garmin_ai_analysis_table_arn = aws_dynamodb_table.garmin_ai_analysis.arn
  garmin_profiles_table_arn    = aws_dynamodb_table.garmin_profiles.arn

  # Secrets Manager ARN（IAM ポリシードキュメントから直接参照しないための Local 変数）
  garmin_token_secret_arn   = aws_secretsmanager_secret.garmin_token.arn
  gemini_api_key_secret_arn = aws_secretsmanager_secret.gemini_api_key.arn
}

# Lambda デプロイパッケージのアーカイブ
data "archive_file" "garmin_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../lambda/garmin-api/"
  output_path = "${path.module}/../../lambda/garmin-api.zip"
}

# Lambda 実行ロール
resource "aws_iam_role" "garmin_lambda" {
  name               = "garmin-lambda"
  assume_role_policy = data.aws_iam_policy_document.garmin_lambda_assume_role.json

  lifecycle {
    prevent_destroy = true
  }
}

# Lambda 信頼ポリシー
data "aws_iam_policy_document" "garmin_lambda_assume_role" {
  statement {
    sid     = "AllowLambdaAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# AWSLambdaBasicExecutionRole マネージドポリシーのアタッチ
resource "aws_iam_role_policy_attachment" "garmin_lambda_basic_execution" {
  role       = aws_iam_role.garmin_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB CRUD + Secrets Manager 読み取りカスタムポリシー
data "aws_iam_policy_document" "garmin_lambda_custom" {
  statement {
    sid    = "AllowDynamoDBCRUD"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan",
    ]

    resources = [
      local.garmin_activities_table_arn,
      local.garmin_notes_table_arn,
      local.garmin_ai_analysis_table_arn,
      local.garmin_profiles_table_arn,
    ]
  }

  statement {
    sid    = "AllowSecretsManagerRead"
    effect = "Allow"

    actions = ["secretsmanager:GetSecretValue"]

    resources = [
      local.garmin_token_secret_arn,
      local.gemini_api_key_secret_arn,
    ]
  }
}

resource "aws_iam_role_policy" "garmin_lambda_custom" {
  name   = "garmin-lambda-custom-policy"
  role   = aws_iam_role.garmin_lambda.id
  policy = data.aws_iam_policy_document.garmin_lambda_custom.json
}

# Lambda 関数本体
resource "aws_lambda_function" "garmin" {
  function_name = local.garmin_lambda_name
  role          = aws_iam_role.garmin_lambda.arn

  filename         = data.archive_file.garmin_lambda.output_path
  source_code_hash = data.archive_file.garmin_lambda.output_base64sha256

  runtime     = "python3.12"
  handler     = "handler.lambda_handler"
  memory_size = 256
  timeout     = 30

  environment {
    variables = {
      ACTIVITIES_TABLE          = aws_dynamodb_table.garmin_activities.name
      NOTES_TABLE               = aws_dynamodb_table.garmin_notes.name
      AI_ANALYSIS_TABLE         = aws_dynamodb_table.garmin_ai_analysis.name
      PROFILES_TABLE            = aws_dynamodb_table.garmin_profiles.name
      GARMIN_TOKEN_SECRET_ARN   = aws_secretsmanager_secret.garmin_token.arn
      GEMINI_API_KEY_SECRET_ARN = aws_secretsmanager_secret.gemini_api_key.arn
    }
  }
}
