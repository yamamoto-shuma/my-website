resource "aws_acm_certificate" "my_website" {
  provider          = aws.us_east_1
  domain_name       = "yamashu.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.my_website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = aws_route53_zone.my_website.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "my_website" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.my_website.arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}
