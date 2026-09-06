variable "aws_region" {
  description = "AWS region for the ECR repository and Lambda function."
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Name used for the AWS resources."
  type        = string
  default     = "jobbr"
}

variable "github_owner" {
  description = "GitHub account that owns the repository."
  type        = string
  default     = "Ca15y"
}

variable "github_owner_id" {
  description = "Immutable numeric GitHub ID for the repository owner."
  type        = string
  default     = "170892886"
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the deployment role."
  type        = string
  default     = "jobbr"
}

variable "github_repository_id" {
  description = "Immutable numeric GitHub repository ID included in new OIDC subject claims."
  type        = string
  default     = "1358879694"
}

variable "github_environment" {
  description = "GitHub Actions environment allowed to deploy to AWS."
  type        = string
  default     = "aws-production"
}

variable "existing_github_oidc_provider_arn" {
  description = "ARN of an existing GitHub Actions OIDC provider in this AWS account. Leave empty to create one."
  type        = string
  default     = ""
}

variable "image_uri" {
  description = "Full ECR image URI for Lambda. Leave empty during the first bootstrap apply."
  type        = string
  default     = ""
}

variable "next_public_supabase_url" {
  description = "Public Supabase project URL. This is also baked into the client bundle."
  type        = string
  default     = ""
}

variable "next_public_supabase_publishable_key" {
  description = "Supabase publishable key. This key is intentionally safe for browser use when RLS is enabled."
  type        = string
  sensitive   = true
  default     = ""
}

variable "adzuna_app_id" {
  description = "Optional Adzuna application ID."
  type        = string
  sensitive   = true
  default     = ""
}

variable "adzuna_app_key" {
  description = "Optional Adzuna application key."
  type        = string
  sensitive   = true
  default     = ""
}

variable "adzuna_countries" {
  description = "Comma-separated Adzuna country feeds."
  type        = string
  default     = "za,gb,us"
}
