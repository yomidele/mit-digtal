import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BookOpen, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/registration-guide")({
  head: () => ({
    meta: [
      { title: "Registration Guide — Made-in-Taraba Digital Registry" },
      { name: "description", content: "Step-by-step guide to registering your business on the official Made-in-Taraba Digital Registry." },
      { property: "og:title", content: "Registration Guide — Made-in-Taraba Digital Registry" },
      { property: "og:description", content: "How to register your Taraba-based business in a few simple steps." },
    ],
  }),
  component: GuidePage,
});

const steps = [
  {
    title: "Create your account",
    body: "Sign up with your email address and a secure password. You can also continue with Google for a faster sign-in. One account can manage one business profile.",
  },
  {
    title: "Fill in your business details",
    body: "Provide your registered business name, sector, LGA, address, phone, products and services, and a short description of what you do. Add photos of your products or premises to help buyers and investors find you.",
  },
  {
    title: "Upload supporting documents",
    body: "A valid means of identification is required. Where available, attach your CAC certificate or local trade permit. Informal businesses without a CAC can submit a community attestation instead.",
  },
  {
    title: "Submit for verification",
    body: "Your submission is routed to a moderator in your Local Government Area. Verification typically takes 3–5 working days. You'll be notified by email once a decision is made.",
  },
  {
    title: "Get listed and discoverable",
    body: "Once approved, you receive a unique Registry ID and certificate of registration. Your business appears in the public directory, searchable by sector, LGA, and product category.",
  },
  {
    title: "Keep your profile current",
    body: "Sign in to your dashboard any time to update contact information, add new products, post photos, and manage your operating hours. Keeping your profile up to date improves discoverability.",
  },
];

function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-[#1a4d2e] text-white">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-[#f5c842]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f5c842]">Registration Guide</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">How to register your business</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            Registration is free and takes about 10 minutes. Follow these six steps to get your business listed on the official Made-in-Taraba Digital Registry.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <ol className="space-y-5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-4 rounded-lg border border-border bg-card p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a4d2e] text-sm font-bold text-[#f5c842]">{i + 1}</div>
              <div>
                <h2 className="font-display text-base font-bold text-[#1a4d2e] sm:text-lg">{s.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-lg border border-[#d4a017]/40 bg-[#fff8e6] p-5">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#1a4d2e]">
            <CheckCircle2 className="h-5 w-5 text-[#1a4d2e]" /> What you'll need before you start
          </h3>
          <ul className="mt-3 grid gap-2 text-sm text-foreground/80 sm:grid-cols-2">
            <li>• Valid means of ID (NIN, voter card, driver's license)</li>
            <li>• Business address and contact phone</li>
            <li>• 1–3 product or premises photos</li>
            <li>• CAC certificate or trade permit (if any)</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center justify-center rounded-md bg-[#1a4d2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2e1a]">
            Start registration
          </Link>
          <Link to="/help" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
            Visit Help Center
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
