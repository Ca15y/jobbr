"use client";

import {
  BinocularsIcon,
  BriefcaseIcon,
  GearSixIcon,
  HouseIcon,
  PlusIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: HouseIcon },
  { href: "/applications", label: "Applications", icon: BriefcaseIcon },
  { href: "/opportunities", label: "Find jobs", icon: BinocularsIcon },
  { href: "/settings", label: "Settings", icon: GearSixIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({
  children,
  email,
  preview,
}: {
  children: React.ReactNode;
  email: string;
  preview: boolean;
}) {
  const pathname = usePathname();
  const isAddingApplication = pathname.startsWith("/applications/new");

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-top">
          <Brand />
          <nav className="sidebar-nav" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-link", isActive(pathname, item.href) && "is-active")}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                >
                  <Icon size={19} weight={isActive(pathname, item.href) ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {!isAddingApplication && (
            <Link href="/applications/new" className="button button-primary sidebar-add">
              <PlusIcon size={17} weight="bold" />
              Add application
            </Link>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="account-copy">
            <span className="account-label">{preview ? "Preview mode" : "Signed in"}</span>
            <span className="account-email" title={email}>{email}</span>
          </div>
          <ThemeToggle />
          {!preview && (
            <form action={signOut}>
              <button className="icon-button" aria-label="Sign out" title="Sign out">
                <SignOutIcon size={18} />
              </button>
            </form>
          )}
        </div>
      </aside>

      <header className="mobile-header">
        <Brand />
        <div className="mobile-actions">
          <ThemeToggle />
          {!isAddingApplication && (
            <Link href="/applications/new" className="icon-button icon-button-accent" aria-label="Add application">
              <PlusIcon size={18} weight="bold" />
            </Link>
          )}
        </div>
      </header>

      <main className="main-content">
        {preview && (
          <div className="preview-banner" role="status">
            <span>Preview data is active.</span>
            <Link href="/settings">Connect Supabase to sync your records.</Link>
          </div>
        )}
        {children}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("mobile-nav-link", active && "is-active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
