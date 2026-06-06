import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Made-in-Taraba Digital Registry" },
      { name: "description", content: "The terms and conditions that govern the use of the Made-in-Taraba Digital Registry." },
      { property: "og:title", content: "Terms of Use — Made-in-Taraba Digital Registry" },
      { property: "og:description", content: "Rules for registering and using the official Taraba State digital business registry." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-[#1a4d2e] text-white">
        <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-[#f5c842]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#f5c842]">Terms of Use</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Platform terms & conditions</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            By creating an account or registering a business, you agree to the following terms.
          </p>
          <p className="mt-2 text-xs text-white/60">Last updated: June 2026</p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl space-y-8 px-4 py-12 text-sm leading-relaxed text-foreground/85">
        <Block title="1. Eligibility">
          <p>The Registry is open to any individual or organisation operating a lawful business within any of the 16 Local Government Areas of Taraba State, Nigeria. You must be 18 or older, or have authority to register on behalf of a business.</p>
        </Block>

        <Block title="2. Accurate information">
          <p>You agree to provide true, accurate, and current information when registering and to keep your profile up to date. Submitting false, misleading, or fraudulent information may result in rejection, suspension, or permanent removal from the Registry, and may be reported to relevant authorities.</p>
        </Block>

        <Block title="3. Account security">
          <p>You are responsible for safeguarding your account credentials and for all activity carried out under your account. Notify us immediately if you suspect unauthorised access.</p>
        </Block>

        <Block title="4. Verification & approval">
          <p>All submissions are reviewed by LGA moderators and state administrators. The Taraba State Government reserves the right to approve, reject, or revoke any registration where information cannot be verified or where the platform's terms are breached.</p>
        </Block>

        <Block title="5. Acceptable use">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>No unlawful, fraudulent, deceptive, or harmful activity.</li>
            <li>No infringement of intellectual property or other rights.</li>
            <li>No upload of malicious code or attempts to disrupt the platform.</li>
            <li>No harvesting of directory data for unsolicited marketing.</li>
            <li>No impersonation of any person, business, or government entity.</li>
          </ul>
        </Block>

        <Block title="6. Public directory listing">
          <p>By registering, you agree that approved business details (name, sector, LGA, products, services, photos, public contact information) may be displayed in the public directory and shared with verified buyers, investors, and partners. You may request removal of your listing at any time.</p>
        </Block>

        <Block title="7. Intellectual property">
          <p>Content you upload remains your property, but you grant the Taraba State Government a non-exclusive licence to display and promote it through the Registry and related state initiatives. The Registry platform, brand, and software are property of the Taraba State Government.</p>
        </Block>

        <Block title="8. Limitation of liability">
          <p>The Registry is provided on an "as available" basis. While we work to keep the platform secure and reliable, the Taraba State Government is not liable for any loss arising from use of the platform, third-party content, or service interruptions.</p>
        </Block>

        <Block title="9. Changes to these terms">
          <p>We may update these terms from time to time. Material changes will be announced on the platform. Continued use after changes take effect constitutes acceptance of the revised terms.</p>
        </Block>

        <Block title="10. Governing law">
          <p>These terms are governed by the laws of the Federal Republic of Nigeria and applicable laws of Taraba State.</p>
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
