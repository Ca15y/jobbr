output "ecr_repository_url" {
  description = "Docker registry/repository used by Jobbr."
  value       = aws_ecr_repository.app.repository_url
}

output "github_deploy_role_arn" {
  description = "Set this as the AWS_DEPLOY_ROLE_ARN GitHub Actions variable."
  value       = aws_iam_role.github_deploy.arn
}

output "lambda_function_url" {
  description = "Public URL after image_uri is configured."
  value       = try(aws_lambda_function_url.app[0].function_url, null)
}
