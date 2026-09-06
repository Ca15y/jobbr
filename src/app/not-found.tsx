import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="login-page">
      <header className="login-header"><Brand /></header>
      <div className="error-state">
        <h1>Page not found</h1>
        <p>The page you requested does not exist or has moved.</p>
        <Link href="/" className="button button-primary">Return to overview</Link>
      </div>
    </main>
  );
}
