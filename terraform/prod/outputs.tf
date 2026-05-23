output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.my_website.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.my_website.domain_name
}

output "route53_name_servers" {
  description = "Route53 Hosted Zone name servers (set these in your domain registrar)"
  value       = aws_route53_zone.my_website.name_servers
}

output "garmin_api_url" {
  value = aws_apigatewayv2_api.garmin.api_endpoint
}

output "garmin_cognito_user_pool_id" {
  value = aws_cognito_user_pool.garmin.id
}

output "garmin_cognito_client_id" {
  value = aws_cognito_user_pool_client.garmin.id
}
