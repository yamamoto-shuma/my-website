resource "aws_cloudfront_function" "index_html_rewrite" {
  name    = "index-html-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/functions/index_html_rewrite.js")

  lifecycle {
    prevent_destroy = true
  }
}
