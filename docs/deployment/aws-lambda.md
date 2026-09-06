# Deploy the AWS Lambda learning environment

This environment exists to practice containerization, infrastructure as code, IAM, OIDC, CI/CD, logs, and rollback. It uses AWS credits and low-cost services, but it is not guaranteed to remain at exactly $0. ECR storage, Lambda usage, logs, and data transfer can incur charges.

## What Terraform creates

- One private ECR repository with image scanning and a five-image retention policy
- One Lambda execution role with access only to its CloudWatch log group
- One GitHub OIDC provider, unless an existing provider ARN is supplied
- One repository-scoped GitHub deployment role
- After the first image exists: one Lambda function and public Function URL

Terraform does not manage Supabase.

## 0. Add a cost guardrail

Before provisioning, open **AWS Billing and Cost Management → Budgets** and create a small monthly cost budget with email alerts. Also enable Free Tier usage alerts. A budget alerts you; it does not automatically stop resources.

## 1. Check the local tools and AWS identity

Start Docker Desktop, then run:

```bash
aws --version
docker version
terraform version
aws sts get-caller-identity
```

Confirm that the account and IAM identity are the ones you intend to use. Keep the account ID out of screenshots when possible.

## 2. Prepare Terraform values

```bash
cp infra/aws/terraform.tfvars.example infra/aws/terraform.tfvars
```

Edit the ignored `infra/aws/terraform.tfvars` file:

- Copy the Supabase URL and publishable key from `.env.local`.
- Leave `image_uri = ""` for the first apply.
- Leave Adzuna values empty unless you use that feed.
- If you fork Jobbr, replace the GitHub owner/repository names and numeric IDs. Find the IDs with `gh api user --jq .id` and `gh api repos/OWNER/REPOSITORY --jq .id`.

Do not commit `terraform.tfvars` or any `*.tfstate` file. Terraform state contains environment values.

## 3. Initialize and review the infrastructure

```bash
terraform -chdir=infra/aws init
terraform -chdir=infra/aws fmt -check
terraform -chdir=infra/aws validate
terraform -chdir=infra/aws plan -out=bootstrap.tfplan
terraform -chdir=infra/aws apply bootstrap.tfplan
```

The first apply deliberately creates the registry and IAM resources but no Lambda function, because Lambda requires an image that already exists in ECR.

Repositories created under GitHub's newer OIDC format include immutable owner and repository IDs in the token subject. Terraform binds the AWS role to those IDs and the `aws-production` environment, preventing a renamed or recreated repository from inheriting deployment access.

If AWS reports that the GitHub OIDC provider already exists, find that provider's ARN and set `existing_github_oidc_provider_arn` in `terraform.tfvars`; do not create a duplicate provider.

## 4. Build and push the bootstrap image

Capture the ECR URL and authenticate Docker:

```bash
export AWS_REGION="us-east-1"
export JOBBR_ECR_URL="$(terraform -chdir=infra/aws output -raw ecr_repository_url)"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${JOBBR_ECR_URL%/*}"
```

Build the exact `linux/amd64` architecture configured for Lambda and push it:

```bash
docker build \
  --platform linux/amd64 \
  --provenance=false \
  --secret id=jobbr_env,src=.env.local \
  --tag "$JOBBR_ECR_URL:bootstrap" \
  .

docker push "$JOBBR_ECR_URL:bootstrap"
```

Do not paste values directly into a Dockerfile or command argument. The BuildKit secret mount reads `.env.local` only during the build; Docker does not copy that file into an image layer.

## 5. Create Lambda

Set this value in `infra/aws/terraform.tfvars`:

```hcl
image_uri = "YOUR_ECR_REPOSITORY_URL:bootstrap"
```

Review and apply again:

```bash
terraform -chdir=infra/aws plan -out=lambda.tfplan
terraform -chdir=infra/aws apply lambda.tfplan
terraform -chdir=infra/aws output -raw lambda_function_url
```

Open the URL and add `login`, for example `https://example.lambda-url.us-east-1.on.aws/login`. Add that full `/auth/callback` URL to the Supabase redirect allow list before testing authentication.

## 6. Connect GitHub Actions without AWS access keys

In GitHub, open **Settings → Environments**, create `aws-production`, and optionally require approval for it.

Then open **Settings → Secrets and variables → Actions → Variables** and create:

| Variable | Value |
| --- | --- |
| `AWS_REGION` | `us-east-1` |
| `AWS_ECR_REPOSITORY_URI` | Terraform output `ecr_repository_url` |
| `AWS_LAMBDA_FUNCTION_NAME` | `jobbr` |
| `AWS_FUNCTION_URL` | Terraform output `lambda_function_url` |
| `AWS_DEPLOY_ROLE_ARN` | Terraform output `github_deploy_role_arn` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

Open **Actions → Deploy to AWS Lambda → Run workflow**. The workflow assumes the short-lived OIDC role, pushes a commit-tagged image, updates Lambda, and checks the login route.

## 7. Observe and practise

Tail application logs:

```bash
aws logs tail /aws/lambda/jobbr --follow --region us-east-1
```

Useful exercises:

- Inspect an ECR image scan.
- Read a cold-start invocation in CloudWatch Logs.
- Compare a warm request with a cold request.
- Deploy a visible text change through GitHub Actions.
- Roll back to an earlier commit image using the [rollback guide](../ci-cd.md#rollback-exercise).

## 8. Remove the learning environment

When you are not using AWS, first review the destroy plan, then remove the resources:

```bash
terraform -chdir=infra/aws plan -destroy
terraform -chdir=infra/aws destroy
```

`destroy` permanently removes the Lambda function, its log group, IAM roles created here, and the ECR repository including its stored images. It does not delete the Supabase project or Vercel deployment.
