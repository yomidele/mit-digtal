import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Made-in-Taraba Digital Registry" },
      { name: "description", content: "How the Made-in-Taraba Digital Registry collects, uses, and protects your information." },
      { property: "og:title", content: "Privacy Policy — Made-in-Taraba Digital Registry" },
      { property: "og:description", content: "Our commitment to safeguarding the information you share with the Registry." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-[#1a4d2e] text-white">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-[#f5c842]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f5c842]">Privacy Policy</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Your data, protected</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            The Taraba State Government values your privacy. This page explains what information we collect, how we use it, and the choices you have.
          </p>
          <p className="mt-2 text-xs text-white/60">Last updated: June 2026</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl space-y-8 px-4 py-12 text-sm leading-relaxed text-foreground/85">
        <Block title="1. Information we collect">
          <p>When you register a business on the Registry, we collect the information you submit — including business name, sector, LGA, contact details, products and services, photos, and supporting identification or trade documents. We also collect basic account information (email address, password hash) and standard technical data such as device type and IP address for security and analytics.</p>
        </Block>

        <Block title="2. How we use your information">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To verify your business and issue your Registry ID and certificate.</li>
            <li>To display approved business profiles in the public directory.</li>
            <li>To produce aggregate statistics that inform state economic planning.</li>
            <li>To notify you about the status of your submission and important platform updates.</li>
            <li>To protect the platform from fraud, abuse, and unauthorised access.</li>
          </ul>
        </Block>

        <Block title="3. Information shared publicly">
          <p>Once your business is approved, your business name, sector, LGA, products, services, photos, and public contact details are visible in the directory so buyers, investors, and partners can find you. Personal identification documents and your account email are never shown publicly.</p>
        </Block>

        <Block title="4. Who has access internally">
          <p>Verification information is accessible only to authorised LGA moderators, state administrators, and authorised staff of the Taraba State Bureau of Statistics and Ministry of Commerce & Industry, strictly for verification and statistical purposes.</p>
        </Block>

        <Block title="5. Data retention">
          <p>We retain registry records for as long as your business is active on the platform. If you delete your account or withdraw your registration, we keep minimum records required by law and aggregate statistics, and remove personal identifiers within 30 days.</p>
        </Block>

        <Block title="6. Security">
          <p>The platform uses encryption in transit, role-based access controls, and secure authentication. While no system can guarantee absolute security, we apply industry-standard safeguards to protect your information.</p>
        </Block>

        <Block title="7. Your rights">
          <p>You can request access to, correction of, or deletion of your personal information at any time by emailing <a className="text-[#1a4d2e] underline" href="mailto:registry@taraba.gov.ng">registry@taraba.gov.ng</a>. You may also update most details directly from your dashboard.</p>
        </Block>

        <Block title="8. Contact">
          <p>For privacy questions or complaints, contact the Registry data office at <a className="text-[#1a4d2e] underline" href="mailto:registry@taraba.gov.ng">registry@taraba.gov.ng</a>.</p>
        </Block>
      </section>
      <SiteFooter />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-[#1a4d2e]">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
