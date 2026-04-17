locals {
  github_repo            = "yamamoto-shuma/my-website"
  oidc_provider_arn      = aws_iam_openid_connect_provider.github_actions.arn
  website_s3_bucket_arn  = aws_s3_bucket.my_website.arn
  website_cloudfront_arn = aws_cloudfront_distribution.my_website.arn
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]

  lifecycle {
    prevent_destroy = true
  }
}

data "aws_iam_policy_document" "github_actions_assume_role" {
  statement {
    sid     = "AllowGitHubActionsOIDC"
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${local.github_repo}:ref:refs/heads/main"]
    }
  }
}

data "aws_iam_policy_document" "github_actions_deploy" {
  statement {
    sid    = "AllowS3Sync"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]

    resources = [
      local.website_s3_bucket_arn,
      "${local.website_s3_bucket_arn}/*",
    ]
  }

  statement {
    sid    = "AllowCloudFrontInvalidation"
    effect = "Allow"

    actions = ["cloudfront:CreateInvalidation"]

    resources = [local.website_cloudfront_arn]
  }
}

resource "aws_iam_role" "github_actions_deploy" {
  name               = "github-actions-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume_role.json

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "github-actions-deploy-policy"
  role   = aws_iam_role.github_actions_deploy.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}
