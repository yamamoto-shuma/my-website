resource "aws_route53_zone" "my_website" {
  name = "yama-shu.com"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route53_record" "apex_a" {
  zone_id = aws_route53_zone.my_website.zone_id
  name    = "yama-shu.com"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.my_website.domain_name
    zone_id                = aws_cloudfront_distribution.my_website.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = aws_route53_zone.my_website.zone_id
  name    = "yama-shu.com"
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.my_website.domain_name
    zone_id                = aws_cloudfront_distribution.my_website.hosted_zone_id
    evaluate_target_health = false
  }
}
