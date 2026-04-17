output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.my_website.domain_name
}

output "route53_name_servers" {
  description = "Route53 Hosted Zone name servers (set these in your domain registrar)"
  value       = aws_route53_zone.my_website.name_servers
}
