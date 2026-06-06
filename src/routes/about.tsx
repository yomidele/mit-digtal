import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Target, Eye, Sparkles, Building2, Users, BarChart3, Handshake, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Made-in-Taraba Digital Registry" },
      { name: "description", content: "Learn about the Made-in-Taraba Digital Registry — the Taraba State Government's official platform for businesses, products and services." },
      { property: "og:title", content: "About — Made-in-Taraba Digital Registry" },
      { property: "og:description", content: "Our mission, vision, and how the Registry is transforming Taraba's productive economy." },
    ],
  }),
  component: About,
});

const lgas = [
  "Ardo-Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", "Karim-Lamido",
  "Kurmi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", "Yorro", "Zing",
];

const values = [
  { icon: ShieldCheck, title: "Trust & Verification", body: "Every listing is reviewed by an LGA-level moderator so buyers and investors can transact with confidence." },
  { icon: Handshake, title: "Inclusive Growth", body: "From smallholder farmers to large manufacturers, the Registry is open and free to every Taraba business." },
  { icon: BarChart3, title: "Data-Driven Planning", body: "Aggregate data informs policy, investment promotion, and targeted economic interventions." },
  { icon: Sparkles, title: "Made-in-Taraba Pride", body: "Showcasing the talent, products, and enterprise built within the state to local and global markets." },
];

const audiences = [
  { icon: Building2, title: "For businesses", body: "Get a verified profile, unique Registry ID, certificate of registration, and free visibility to buyers, investors, and partners." },
  { icon: Users, title: "For citizens & buyers", body: "Discover trusted Taraba-made products and services across all 16 LGAs in one searchable directory." },
  { icon: BarChart3, title: "For government & partners", body: "Real-time visibility into the productive economy — sector growth, geographic distribution, and value chain insights." },
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-[#1a4d2e] text-white">
        <div className="container mx-auto max-w-4xl px-4 py-14 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-wider text-[#f5c842]">About the Registry</span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">
            The official record of Taraba's productive economy
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            The Made-in-Taraba Digital Registry is the Taraba State Government's official database of businesses, products, services, and value chain actors. It exists to give the state real-time visibility into its economy, connect entrepreneurs with opportunity, and put Taraba-made enterprise firmly on the map.
          </p>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="container mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          <Card icon={<Target className="h-5 w-5" />} title="Our mission">
            To register, verify, and promote every business operating in Taraba State — formal and informal — so they are visible, credible, and connected to buyers, investors, and government support programmes.
          </Card>
          <Card icon={<Eye className="h-5 w-5" />} title="Our vision">
            A Taraba where every product, service, and enterprise — from rural cooperatives to urban manufacturers — is digitally visible, accurately counted, and globally accessible.
          </Card>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-[#f7f4ea]">
        <div className="container mx-auto max-w-5xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-[#1a4d2e] sm:text-3xl">What the Registry does</h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground/80 sm:text-base">
            More than a directory, the Registry is the digital infrastructure that ties together verification, promotion, and economic intelligence for the state.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { t: "Verifies businesses", d: "Reviewed by LGA moderators, with state-level oversight, before listings go live." },
              { t: "Issues a Registry ID", d: "Every approved business receives a unique ID and digital certificate of registration." },
              { t: "Powers a public directory", d: "Buyers, investors, and partners search by sector, LGA, and product category." },
              { t: "Generates economic intelligence", d: "Aggregate, anonymised data informs state planning and investment promotion." },
              { t: "Connects to opportunity", d: "A pipeline for grants, training, exhibitions, and procurement opportunities." },
              { t: "Celebrates Made-in-Taraba", d: "Surfaces the products, talent, and innovation built within the state." },
            ].map((x, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-display text-base font-bold text-[#1a4d2e]">{x.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="container mx-auto max-w-5xl px-4 py-14">
        <h2 className="font-display text-2xl font-bold text-[#1a4d2e] sm:text-3xl">Who the Registry is for</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {audiences.map((a, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1a4d2e] text-[#f5c842]">
                <a.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-[#1a4d2e]">{a.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#f7f4ea]">
        <div className="container mx-auto max-w-5xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-[#1a4d2e] sm:text-3xl">Our guiding values</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border bg-card p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#fff8e6] text-[#1a4d2e]">
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#1a4d2e]">{v.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="container mx-auto max-w-5xl px-4 py-14">
        <h2 className="font-display text-2xl font-bold text-[#1a4d2e] sm:text-3xl">Statewide coverage — 16 LGAs</h2>
        <p className="mt-3 max-w-2xl text-sm text-foreground/80 sm:text-base">
          Any business operating in any of Taraba State's 16 Local Government Areas is eligible to register, free of charge.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {lgas.map((l) => (
            <span key={l} className="rounded-full border border-[#1a4d2e]/15 bg-[#fff8e6] px-3 py-1.5 text-xs font-medium text-[#1a4d2e]">
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* Governance */}
      <section className="bg-[#0d2e1a] text-white">
        <div className="container mx-auto max-w-4xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-[#f5c842] sm:text-3xl">Governance & oversight</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
            The Registry is operated by the Taraba State Government in collaboration with the Ministry of Commerce & Industry, the Taraba Investment Promotion Agency, and the Bureau of Statistics. LGA moderators handle first-level verification; state administrators provide oversight and quality assurance. All personal information is handled in line with our <Link to="/privacy" className="underline decoration-[#f5c842]/60 underline-offset-2 hover:text-[#f5c842]">Privacy Policy</Link> and platform <Link to="/terms" className="underline decoration-[#f5c842]/60 underline-offset-2 hover:text-[#f5c842]">Terms of Use</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-4xl px-4 py-14 text-center">
        <h2 className="font-display text-2xl font-bold text-[#1a4d2e] sm:text-3xl">Put your business on the map</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/80 sm:text-base">
          Registration is free and takes about 10 minutes. Get verified, get a Registry ID, and become discoverable to buyers, investors, and partners.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center justify-center rounded-md bg-[#1a4d2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2e1a]">
            Register your business
          </Link>
          <Link to="/directory" className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent">
            Browse directory
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1a4d2e] text-[#f5c842]">{icon}</div>
      <h3 className="mt-3 font-display text-lg font-bold text-[#1a4d2e]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
