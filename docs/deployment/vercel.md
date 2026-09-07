# Deploy Jobbr to Vercel

Vercel is the primary public deployment because it supports Jobbr's current Next.js server features directly. A Hobby account is appropriate for a personal, non-commercial portfolio project; review Vercel's current limits before changing that use.

## 1. Import the repository

1. Sign in to [Vercel](https://vercel.com/) with GitHub.
2. Select **Add New → Project**.
3. Import `ca15y/jobbr`.
4. Keep **Framework Preset: Next.js** and the default build settings.

Do not deploy yet if the environment variables are not configured.

## 2. Add environment variables

In the Vercel project, open **Settings → Environment Variables** and add these to Production, Preview, and Development:

| Name | Required | Source |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase **Project Settings → API** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase **Project Settings → API** |
| `ADZUNA_APP_ID` | No | Adzuna developer account |
| `ADZUNA_APP_KEY` | No | Adzuna developer account |
| `ADZUNA_COUNTRIES` | No | `za,gb,us` |

The two `NEXT_PUBLIC_` values are visible in browser code by design. Never substitute the Supabase service-role key.

## 3. Deploy and configure Supabase redirects

1. Select **Deploy** in Vercel.
2. Copy the assigned production URL, for example `https://jobbr-example.vercel.app`.
3. In Supabase, open **Authentication → URL Configuration**.
4. Set **Site URL** to the Vercel production URL.
5. Add these **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_VERCEL_DOMAIN/auth/callback`
6. Save, then request a new magic link from the deployed `/login` page.

Supabase's default email provider is suitable for initial testing, but it has strict
recipient and rate limits. A public deployment that offers email sign-in to users
outside the Supabase project team needs a custom SMTP provider.

After configuring custom SMTP, you may optionally use Jobbr's server-side token-hash
flow by setting the **Magic Link** template link to:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email">
  Sign in to Jobbr
</a>
```

Jobbr supports both Supabase's default PKCE callback and this optional token-hash
callback. `RedirectTo` preserves the Vercel, AWS, or local origin that requested the
link.

If you add a custom domain, add its `/auth/callback` URL to the same allow list before testing sign-in.

## Enable GitHub OAuth

The GitHub OAuth callback goes to Supabase first; Supabase then returns the user to Jobbr.

1. In Supabase, open **Authentication → Providers → GitHub**. Copy the callback URL shown there. It has this form:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

2. In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App**.
3. Enter:
   - **Application name:** `jobbr`
   - **Homepage URL:** your Vercel production URL
   - **Authorization callback URL:** the Supabase callback URL from step 1
4. Register the app, generate a client secret, and copy its client ID and secret.
5. Return to Supabase's GitHub provider, enable it, enter both values, and save.
6. On the Vercel login page, select **Continue with GitHub** and confirm that the browser returns to Jobbr.

The GitHub client secret stays in Supabase. Do not put it in `.env.local`, Vercel, GitHub repository variables, or source control.

## 4. Make the demo visible

After verification:

1. In the GitHub repository's **About** section, add the Vercel URL as the website.
2. Add topics such as `nextjs`, `supabase`, `terraform`, `aws-lambda`, `devops`, and `job-tracker`.
3. From your GitHub profile, select **Customize your pins** and pin `jobbr`.

Future pushes to `main` will create new Vercel production deployments. Pull requests get isolated preview deployments.
