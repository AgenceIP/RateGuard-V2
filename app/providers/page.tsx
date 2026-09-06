import { getCompany } from "@/lib/company";
import { ProvidersClient } from "./ProvidersClient";

export const dynamic = "force-dynamic";

export default async function ProvidersPage() {
  const { company } = await getCompany();

  return (
    <div className="space-y-6">
      <header className="max-w-3xl space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Where to make your payments</h1>
        <p className="text-sm text-muted-foreground">
          The kinds of provider, what each offers for managing currency risk, and roughly what it costs. The point isn&apos;t to
          sell you a provider — it&apos;s to give you the right questions to ask before you sign.
        </p>
      </header>

      <ProvidersClient shariaMode={company.sharia_mode} />
    </div>
  );
}
