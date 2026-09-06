import Link from "next/link";
import { FlaskConical } from "lucide-react";

/**
 * Shown whenever the app runs on demo profiles. The wording is deliberate:
 * the *people and amounts* are examples, the *rates and risk math* are real.
 */
export function DemoBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
        <FlaskConical className="size-3" />
        Demo profiles · real exchange rates
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-xl border border-border bg-accent/60 p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <FlaskConical className="size-4" />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-medium">Demo mode</p>
        <p className="mt-0.5 text-muted-foreground">
          The people, amounts and dates below are <strong>made-up examples</strong>. The exchange rates, the volatility
          and every cost computed from them are <strong>real</strong> — pulled live from the European Central Bank (via
          Frankfurter). Connect Supabase to enter your actual team:{" "}
          <Link href="/settings" className="font-medium text-primary underline underline-offset-2">
            open settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
