import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="jobbr home">
      <span className="brand-mark" aria-hidden="true">j</span>
      {!compact && <span className="brand-word">jobbr</span>}
    </Link>
  );
}
