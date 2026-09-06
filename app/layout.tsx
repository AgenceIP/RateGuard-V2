import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RateGuard",
  description: "See what an international payment really costs — without ever predicting an exchange rate.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The theme script below stamps a `dark` class on <html> before React
      // hydrates, which is by definition a server/client difference.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Applies the saved/system theme before first paint, so there's no flash. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`}
        </Script>
        <TooltipProvider>
          <NavBar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-border py-5">
            <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
              Exchange rates: European Central Bank via Frankfurter. This tool quantifies a risk; it never predicts the
              direction of an exchange rate.
            </p>
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
