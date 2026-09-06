"use client";

import { EnvelopeSimpleIcon, GithubLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ configured, hasLinkError }: { configured: boolean; hasLinkError: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "oauth" | "sending" | "sent" | "error">(
    hasLinkError ? "error" : "idle",
  );
  const [message, setMessage] = useState(
    hasLinkError ? "That sign-in link is invalid or has expired. Request a new one." : "",
  );

  async function handleGitHubSignIn() {
    if (!configured) return;
    setState("oauth");
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "We could not start GitHub sign-in.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    setState("sending");
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setState("sent");
      setMessage("Check your inbox. Your secure sign-in link is ready.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "We could not send the sign-in link.");
    }
  }

  return (
    <div className="login-card surface">
      <div className="login-icon" aria-hidden="true">
        <EnvelopeSimpleIcon size={22} />
      </div>
      <h1>Welcome to jobbr</h1>
      <p>Sign in with GitHub or use a secure email link.</p>

      {configured ? (
        <div className="login-form">
          <button
            className="button button-secondary login-provider-button"
            type="button"
            onClick={handleGitHubSignIn}
            disabled={state === "oauth" || state === "sending"}
          >
            <GithubLogoIcon size={18} weight="fill" aria-hidden="true" />
            {state === "oauth" ? "Opening GitHub..." : "Continue with GitHub"}
          </button>
          <div className="login-divider" aria-hidden="true">
            <span>or use email</span>
          </div>
          <form className="login-email-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <button
              className="button button-primary"
              type="submit"
              disabled={state === "sending" || state === "oauth"}
            >
              {state === "sending" ? "Sending link..." : "Email me a sign-in link"}
            </button>
          </form>
        </div>
      ) : (
        <div className="login-form">
          <div className="inline-notice" data-tone="warning">
            Supabase is not connected yet. You can review the complete interface with preview data.
          </div>
          <Link href="/" className="button button-primary">Open preview</Link>
        </div>
      )}

      {message && (
        <p className="form-message" data-tone={state === "sent" ? "success" : "error"} role="status">
          {message}
        </p>
      )}
      <p className="login-footnote">Your applications stay private to your account.</p>
    </div>
  );
}
