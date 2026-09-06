# jobbr

[![CI](https://github.com/ca15y/jobbr/actions/workflows/ci.yml/badge.svg)](https://github.com/ca15y/jobbr/actions/workflows/ci.yml)

Jobbr is a private-by-default job application workspace for tracking opportunities and finding remote engineering roles. It is designed for candidates in Nigeria while keeping its role and location filters extensible.

## What it does

- Tracks Saved, Applied, Interviewing, Offer, Accepted, Rejected, Withdrawn, and No response stages
- Syncs applications across devices with per-user Supabase Row Level Security
- Supports GitHub OAuth and passwordless email links
- Records status history automatically
- Combines remote listings from Remotive and Jobicy
- Optionally adds Adzuna results
- Prioritizes Nigeria, Africa, EMEA, and worldwide eligibility signals
- Provides light and dark themes
- Falls back to a populated preview workspace when Supabase is not configured

## Architecture

Jobbr is a Next.js 16 application using the App Router, Server Components, route handlers, server actions, and Supabase cookie authentication. It therefore needs a server-capable deployment and cannot run on GitHub Pages.

- **Public production:** Vercel Hobby
- **DevOps lab:** Docker + Amazon ECR + AWS Lambda Web Adapter + Lambda Function URL
- **Data and authentication:** Supabase Postgres, Auth, and Row Level Security
- **Automation:** GitHub Actions CI and keyless AWS deployment through GitHub OIDC
- **Infrastructure:** Terraform

See the [architecture guide](docs/architecture.md) for the request flow and design decisions.

## Run locally

Requirements: Node.js 24 and npm.

```bash
git clone https://github.com/ca15y/jobbr.git
cd jobbr
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase values, Jobbr starts in preview mode so the interface can be explored immediately.

## Connect Supabase

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor**, paste `supabase/migrations/001_initial_schema.sql`, and run it once.
3. Open **Project Settings → API** and copy the project URL and publishable key into `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. Open **Authentication → URL Configuration**. Set the local redirect URL to `http://localhost:3000/auth/callback`.
5. Restart `npm run dev`, request a sign-in link, and confirm that a new application persists after refresh.

The publishable key is meant for browser use. Data privacy comes from the included database Row Level Security policies. Never expose a Supabase service-role key.

## Enable GitHub sign-in

GitHub OAuth is configured between GitHub and Supabase; no GitHub secret belongs in this repository or in the browser application. Follow the exact production sequence in the [Vercel deployment guide](docs/deployment/vercel.md#enable-github-oauth).

## Optional Adzuna feed

Remotive and Jobicy work without credentials. To add Adzuna, register at [Adzuna Developer](https://developer.adzuna.com/) and configure:

```dotenv
ADZUNA_APP_ID=your-app-id
ADZUNA_APP_KEY=your-app-key
ADZUNA_COUNTRIES=za,gb,us
```

Adzuna is supplemental because its API is country-based and has no Nigeria-specific market endpoint. Jobbr marks uncertain eligibility for review.

## Deploy

- [Deploy the public app to Vercel](docs/deployment/vercel.md)
- [Build the AWS Lambda DevOps lab](docs/deployment/aws-lambda.md)
- [Understand the CI/CD workflow](docs/ci-cd.md)

The Vercel deployment is the dependable public demo. The AWS deployment is a learning environment and can consume AWS credits through container storage, logs, requests, or data transfer. AWS Budgets sends alerts but is not a hard spending cap.

## Verify a change

```bash
npm run typecheck
npm run lint
npm run build
```

## Contributing and security

Contributions are welcome; read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please report vulnerabilities using the process in [SECURITY.md](SECURITY.md), not a public issue.

## License

[MIT](LICENSE) © 2026 ca15y. The MIT license lets other people use, modify, and redistribute the code while preserving the copyright and license notice. It does not give anyone access to another user's Jobbr data.
