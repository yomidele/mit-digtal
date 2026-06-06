import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LifeBuoy, Mail, Phone, MapPin, MessageCircle, BookOpen, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center — Made-in-Taraba Digital Registry" },
      { name: "description", content: "Get help with registration, verification, profile updates, and using the Made-in-Taraba Digital Registry." },
      { property: "og:title", content: "Help Center — Made-in-Taraba Digital Registry" },
      { property: "og:description", content: "Get help with registration, verification, and managing your business listing." },
    ],
  }),
  component: HelpPage,
});

const faqs = [
  {
    q: "Who can register on the Made-in-Taraba Digital Registry?",
    a: "Any business — formal or informal — operating within any of the 16 Local Government Areas of Taraba State is eligible to register. This includes sole proprietors, cooperatives, SMEs, and larger enterprises across all sectors.",
  },
  {
    q: "Is registration free?",
    a: "Yes. Registration on the official Made-in-Taraba Digital Registry is completely free. The state government covers the cost as part of its commitment to growing the productive economy.",
  },
  {
    q: "How long does verification take?",
    a: "Most submissions are reviewed by your LGA moderator within 3–5 working days. You'll receive a notification once your business is approved and your registry ID is issued.",
  },
  {
    q: "Can I update my business details after approval?",
    a: "Yes. Sign in to your dashboard at any time to update contact information, products, services, photos, and operating hours. Major changes (legal name, ownership) may require re-verification.",
  },
  {
    q: "What documents do I need?",
    a: "A valid means of identification, proof of business address, and (where applicable) your CAC certificate or local trade permit. Informal businesses without a CAC certificate can still register using a community attestation.",
  },
  {
    q: "I forgot my password. What should I do?",
    a: "Use the 'Forgot password' link on the sign-in page to receive a secure password reset email.",
  },
];

function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-[#1a4d2e] text-white">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-7 w-7 text-[#f5c842]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f5c842]">Help Center</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">We're here to help</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            Answers to common questions about registration, verification, and managing your listing on the Made-in-Taraba Digital Registry.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <ContactCard icon={<Mail className="h-5 w-5" />} title="Email" value="registry@taraba.gov.ng" href="mailto:registry@taraba.gov.ng" />
          <ContactCard icon={<Phone className="h-5 w-5" />} title="Phone" value="+234 800 000 0000" href="tel:+2348000000000" />
          <ContactCard icon={<MapPin className="h-5 w-5" />} title="Office" value="Jalingo, Taraba State" />
        </div>

        <h2 className="mt-12 font-display text-2xl font-bold text-[#1a4d2e]">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="group rounded-lg border border-border bg-card p-4 open:shadow-sm">
              <summary className="cursor-pointer list-none text-sm font-semibold text-foreground sm:text-base">
                <span className="mr-2 text-[#d4a017]">›</span>{f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <ResourceCard to="/registration-guide" icon={<BookOpen className="h-5 w-5" />} title="Registration Guide" desc="Step-by-step instructions for new businesses." />
          <ResourceCard to="/privacy" icon={<ShieldCheck className="h-5 w-5" />} title="Privacy Policy" desc="How we collect and protect your data." />
          <ResourceCard to="/terms" icon={<MessageCircle className="h-5 w-5" />} title="Terms of Use" desc="Rules for using the platform." />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function ContactCard({ icon, title, value, href }: { icon: React.ReactNode; title: string; value: string; href?: string }) {
  const inner = (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition hover:border-[#d4a017]">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1a4d2e] text-[#f5c842]">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
        <div className="mt-0.5 break-all text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : inner;
}

function ResourceCard({ to, icon, title, desc }: { to: "/registration-guide" | "/privacy" | "/terms"; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="block rounded-lg border border-border bg-card p-4 transition hover:border-[#d4a017] hover:shadow-sm">
      <div className="flex items-center gap-2 text-[#1a4d2e]">{icon}<span className="font-display text-sm font-bold">{title}</span></div>
      <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}
