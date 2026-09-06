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
  default     = "ca15y"
}

variable "github_repository" {
  description = "GitHub repository allowed to assume the deployment role."
  type        = string
  default     = "jobbr"
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

variable "next_server_actions_encryption_key" {
  description = "Stable 32-byte base64 key shared by rolling Next.js deployments."
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
