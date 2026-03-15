resource "aws_s3_bucket" "my_website" {
  bucket = "my-website-prod"
}

resource "aws_s3_bucket_public_access_block" "my_website" {
  bucket = aws_s3_bucket.my_website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "my_website" {
  bucket = aws_s3_bucket.my_website.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "my_website" {
  bucket = aws_s3_bucket.my_website.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

data "aws_iam_policy_document" "my_website_bucket" {
  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = ["${aws_s3_bucket.my_website.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.my_website.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "my_website" {
  bucket = aws_s3_bucket.my_website.id
  policy = data.aws_iam_policy_document.my_website_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.my_website]
}
