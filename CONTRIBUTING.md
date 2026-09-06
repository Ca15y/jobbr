# Contributing to jobbr

Thanks for helping improve jobbr. This project welcomes focused bug fixes, accessibility improvements, documentation, and job-source integrations.

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Install dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local` and connect your own Supabase project.
4. Keep changes small and explain their user impact.
5. Run the required checks before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run build
```

## Data and credentials

- Never commit `.env.local`, database passwords, service-role keys, AWS credentials, or user application data.
- Use only public demo data in screenshots and tests.
- New tables must enable Row Level Security and include ownership policies.

## Pull requests

Describe what changed, how you tested it, and any deployment or database migration impact. Visual changes should include light, dark, desktop, and mobile verification.
