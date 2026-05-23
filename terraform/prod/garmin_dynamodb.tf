# Garmin トレーニングログ用 DynamoDB テーブル群

data "aws_region" "current" {}

locals {
  # TTL 属性名（activities, notes, ai_analysis テーブル共通）
  ttl_attribute = "ttl"
}

# アクティビティテーブル（Garmin から取得した運動データ）
resource "aws_dynamodb_table" "garmin_activities" {
  name         = "garmin_activities"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "date"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  ttl {
    attribute_name = local.ttl_attribute
    enabled        = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# ノートテーブル（ユーザーが記録したメモ）
resource "aws_dynamodb_table" "garmin_notes" {
  name         = "garmin_notes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "date"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  ttl {
    attribute_name = local.ttl_attribute
    enabled        = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# AI 分析テーブル（Gemini による分析結果）
resource "aws_dynamodb_table" "garmin_ai_analysis" {
  name         = "garmin_ai_analysis"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "date"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  ttl {
    attribute_name = local.ttl_attribute
    enabled        = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

# プロファイルテーブル（ユーザープロファイル情報）
resource "aws_dynamodb_table" "garmin_profiles" {
  name         = "garmin_profiles"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
  }
}
