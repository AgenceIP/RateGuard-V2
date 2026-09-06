"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { cn } from "cn";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/employees", label: "Team" },
  { href: "/providers", label: "Providers" },
  { href: "/sharia", label: "Without a forward" },
  { href: "/umrah", label: "Umrah agencies" },
  { href: "/crypto-check", label: "Crypto" },
  { href: "/settings", label: "Settings" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2 sm:mr-4">
          <span className="relative flex size-7 shrink-0 overflow-hidden rounded-lg ring-1 ring-foreground/10">
            <Image src="/brand/mark.jpeg" alt="RateGuard" fill sizes="28px" className="object-cover" priority />
          </span>
          <span className="hidden lg:block">
            <Image
              src="/brand/logo-light.jpeg"
              alt="RateGuard"
              width={480}
              height={128}
              className="h-6 w-auto rounded-md dark:hidden"
              priority
            />
            <Image
              src="/brand/logo-dark.jpeg"
              alt="RateGuard"
              width={480}
              height={128}
              className="hidden h-6 w-auto rounded-md dark:block"
              priority
            />
            <span className="block text-[11px] font-normal text-muted-foreground">international payroll costs</span>
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap">
          {LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-sm transition-colors sm:px-3",
                  active
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <ThemeToggle />
      </nav>
    </header>
  );
}

/**
 * Which icon shows is driven by the `.dark` class in CSS rather than React
 * state, so there's no hydration mismatch and no effect reading the DOM.
 */
function ThemeToggle() {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private browsing / blocked storage — the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}
