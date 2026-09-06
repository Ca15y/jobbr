# Security policy

## Reporting a vulnerability

Please do not disclose security vulnerabilities in a public issue. Use GitHub's private vulnerability reporting feature from the repository Security tab.

Include the affected route or component, reproduction steps, impact, and any suggested mitigation. Do not include real user records, credentials, or access tokens.

## Supported version

Security fixes target the latest version on the `main` branch.

## Deployment safety

- Browser code uses only the Supabase publishable key.
- Supabase secret and service-role keys must never use a `NEXT_PUBLIC_` prefix.
- AWS deployments use GitHub OIDC instead of stored AWS access keys.
- Database access is restricted by Row Level Security policies.
