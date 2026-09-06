"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { seedDemoData } from "@/app/employees/actions";
import { Button } from "@/components/ui/button";

/** Populates an empty, connected team with demo profiles + priced payment history to explore. */
export function SeedDemoDataButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await seedDemoData();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-1.5">
      <Button type="button" variant="outline" onClick={handleClick} disabled={pending}>
        <FlaskConical className="size-4" />
        {pending ? "Populating…" : "Populate demo team"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
