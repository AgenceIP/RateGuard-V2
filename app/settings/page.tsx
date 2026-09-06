import { Database, KeyRound } from "lucide-react";
import { getCompany } from "@/lib/company";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { company, connected } = await getCompany();

  return (
    <div className="max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Your company&apos;s currency is the reference for every cost shown in the app.
        </p>
      </header>

      {!connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="size-4" />
              Move from the demo to your real data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The app is currently running on demo profiles. The exchange rates and calculations are real, but you can&apos;t save
              your own team yet.
            </p>
            <ol className="ml-4 list-decimal space-y-1.5">
              <li>Create a project at supabase.com.</li>
              <li>
                Run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">supabase/migrations/0001_init.sql</code>{" "}
                then <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">supabase/seed.sql</code> in the SQL Editor.
              </li>
              <li>
                Copy <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local.example</code> to{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code> and fill in the keys.
              </li>
              <li>Restart the dev server.</li>
            </ol>
            <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs">
              <KeyRound className="mt-0.5 size-3.5 shrink-0" />
              Optional: add <code className="font-mono">ANTHROPIC_API_KEY</code> to enable live web-search verification of
              crypto regulation, instead of the internal baseline.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company profile</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm company={company} connected={connected} />
        </CardContent>
      </Card>
    </div>
  );
}
