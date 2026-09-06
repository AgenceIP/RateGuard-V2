import Link from "next/link";
import { AlertTriangle, BadgeCheck, CircleHelp, MessageCircleQuestion, ShieldCheck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SHARIA_DISCLAIMER } from "@/lib/copy/sharia";
import {
  PROVIDER_QUESTIONS,
  SHARIA_ALTERNATIVES,
  SHARIA_AVOID,
  SHARIA_MISCONCEPTION,
  SHARIA_PRINCIPLES,
  VERDICT_LABELS,
  type AlternativeVerdict,
} from "@/lib/copy/sharia-alternatives";

const VERDICT_STYLE: Record<AlternativeVerdict, { bg: string; color: string }> = {
  widely_accepted: { bg: "color-mix(in oklch, var(--good) 12%, transparent)", color: "var(--good)" },
  accepted_with_conditions: { bg: "color-mix(in oklch, var(--warning) 15%, transparent)", color: "var(--warning)" },
  debated: { bg: "var(--muted)", color: "var(--muted-foreground)" },
};

export default function ShariaPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Managing currency risk without a conventional forward
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Wanting to protect yourself against currency swings isn&apos;t the problem — reducing uncertainty is
          encouraged. The problem is the <strong className="text-foreground">structure</strong> of the instrument usually
          sold for the job. This page explains why, and what the alternatives are.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Three ideas worth knowing</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {SHARIA_PRINCIPLES.map((principle) => (
            <Card key={principle.term} className="h-full">
              <CardContent className="space-y-2">
                <p className="font-medium">{principle.term}</p>
                <p className="text-sm text-muted-foreground">{principle.plain}</p>
                <p className="rounded-lg bg-muted/50 p-2.5 text-xs leading-relaxed">{principle.consequence}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">The alternatives, simplest to most technical</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The first few need no financial product and no approval at all — just a different way of organising your
            payments.
          </p>
        </div>

        <div className="space-y-3">
          {SHARIA_ALTERNATIVES.map((alt) => {
            const style = VERDICT_STYLE[alt.verdict];
            return (
              <Card key={alt.id}>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium">
                        {alt.name}
                        {alt.arabicTerm && (
                          <span className="ml-2 text-sm font-normal text-muted-foreground">({alt.arabicTerm})</span>
                        )}
                      </h3>
                      {alt.inComparator && (
                        <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <BadgeCheck className="size-3" style={{ color: "var(--good)" }} />
                          Priced in the app&apos;s comparator
                        </p>
                      )}
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {VERDICT_LABELS[alt.verdict]}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Block title="How it works" text={alt.howItWorks} />
                    <Block title="What it protects" text={alt.whatItProtects} />
                    <Block title="What it doesn't solve" text={alt.limits} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-muted/50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Check before signing
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {alt.whatToVerify.map((item, i) => (
                          <li key={i} className="flex gap-2 text-xs leading-relaxed">
                            <ShieldCheck className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-accent/50 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Where the discussion stands
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed">{alt.verdictNote}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="size-4" style={{ color: "var(--destructive)" }} />
              What is generally ruled out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {SHARIA_AVOID.map((item) => (
                <li key={item.name} className="text-sm">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.why}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleHelp className="size-4 text-muted-foreground" />
              A common confusion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="rounded-xl bg-muted/50 p-3 text-sm italic">{SHARIA_MISCONCEPTION.claim}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{SHARIA_MISCONCEPTION.correction}</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircleQuestion className="size-4 text-muted-foreground" />
              Six questions to put to your provider
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Paste them straight into an email. The answers will tell you very quickly who you&apos;re dealing with.
            </p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {PROVIDER_QUESTIONS.map((question, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium">
                    {i + 1}
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button render={<Link href="/providers" />} nativeButton={false} variant="outline">
          See which providers offer what
        </Button>
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost">
          Back to payments
        </Button>
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-border p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: "var(--warning)" }} />
        <span>
          <strong>{SHARIA_DISCLAIMER}</strong> This page describes financial structures and flags where opinions
          differ; it settles nothing and is no substitute for the view of a scholar or a Sharia board who knows your
          situation.
        </span>
      </p>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
