output "ec2_public_ip" {
  description = "The public IP address of the backend EC2 instance."
  value       = aws_instance.backend.public_ip
}

output "ecr_repository_url" {
  description = "The URL of the ECR repository for the backend."
  value       = aws_ecr_repository.backend.repository_url
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket for the frontend."
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution."
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution."
  value       = aws_cloudfront_distribution.frontend.domain_name
}
