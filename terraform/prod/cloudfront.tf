resource "aws_cloudfront_origin_access_control" "my_website" {
  name                              = "my-website-oac"
  description                       = "OAC for my-website S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_distribution" "my_website" {
  enabled             = true
  price_class         = "PriceClass_200"
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.my_website.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.my_website.id
    origin_access_control_id = aws_cloudfront_origin_access_control.my_website.id
  }

  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.my_website.id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
