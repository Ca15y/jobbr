# CI/CD guide

Jobbr uses two GitHub Actions workflows.

## Continuous integration

`.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`:

1. Checks out the exact commit.
2. Installs dependencies reproducibly with `npm ci`.
3. Runs TypeScript checks.
4. Runs ESLint.
5. Builds the production Next.js bundle.

A failed check blocks confidence in that commit; it does not change either deployment.

## AWS deployment

`.github/workflows/deploy-aws.yml` is manual. It:

1. Exchanges GitHub's signed OIDC token for a short-lived, repository-scoped AWS role session.
2. Builds the image for `linux/amd64`.
3. Pushes immutable commit and moving `latest` tags to ECR.
4. Updates the Lambda function to the commit image.
5. Waits for Lambda to finish the update and checks `/login`.

No long-lived AWS access key is stored in GitHub. The workflow's `aws-production` environment also provides a place to add deployment approvals later.

## Rollback exercise

ECR retains the five newest images. To roll back, find a known-good commit tag and run:

```bash
aws lambda update-function-code \
  --function-name jobbr \
  --image-uri YOUR_ECR_REPOSITORY_URI:KNOWN_GOOD_COMMIT_SHA
```

Then wait for the update and test `/login`. A rollback changes the application image only; Supabase data remains intact.
