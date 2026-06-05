import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Made-in-Taraba Digital Registry" },
      { name: "description", content: "About the Made-in-Taraba Digital Registry — an official platform of the Taraba State Government." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-primary">About the Registry</h1>
        <div className="prose mt-6 space-y-4 text-foreground/90">
          <p>
            The <strong>Made-in-Taraba Digital Registry</strong> is the official government database of businesses,
            products, services, and value chain actors operating within Taraba State, Nigeria.
          </p>
          <p>
            It exists to give the state real-time visibility into its productive economy, support data-driven
            planning, and connect Taraba's entrepreneurs with buyers, investors, and development partners.
          </p>
          <p>
            Any business operating in any of the state's <strong>16 LGAs</strong> — Ardo-Kola, Bali, Donga, Gashaka,
            Gassol, Ibi, Jalingo, Karim-Lamido, Kurmi, Lau, Sardauna, Takum, Ussa, Wukari, Yorro, and Zing — is
            eligible to register. Approved businesses receive a unique registry ID and certificate of registration.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
