import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-page">
      <header className="login-header">
        <Brand />
        <ThemeToggle />
      </header>
      <section className="login-stage">
        <div className="login-intro">
          <span className="login-kicker">Your private search workspace</span>
          <h2>Keep every opportunity within reach.</h2>
          <p>Track applications, plan follow-ups, and find remote engineering work open to candidates in Nigeria.</p>
        </div>
        <LoginForm configured={isSupabaseConfigured} hasLinkError={params.error === "link"} />
      </section>
    </main>
  );
}
