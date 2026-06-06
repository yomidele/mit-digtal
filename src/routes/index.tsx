import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Award, BarChart3, Globe2, Handshake, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { CATEGORY_LIST, SECTOR_ICONS } from "@/lib/taraba-data";
import { getPublicStats } from "@/lib/stats.functions";
import sectorsHero from "@/assets/taraba-sectors-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Made-in-Taraba Digital Registry — Powering Taraba's Economy" },
      { name: "description", content: "The official registry of Taraba State businesses, products, and value chain actors. Register your business or search the public directory." },
    ],
  }),
  component: Index,
});

const SECTOR_PALETTE: Record<string, { bg: string; fg: string }> = {
  "Agriculture": { bg: "#e8f5ee", fg: "#1a4d2e" },
  "Agro-processing": { bg: "#fef3e0", fg: "#b87a14" },
  "Mining": { bg: "#e6f1fb", fg: "#1f5fa6" },
  "Manufacturing": { bg: "#f4e4dc", fg: "#8a4a2a" },
  "Entrepreneurship": { bg: "#f3ebfb", fg: "#6b3fa0" },
  "Trade": { bg: "#e1ecf7", fg: "#1d4f8a" },
  "Crafts": { bg: "#fde8d6", fg: "#c4641a" },
  "Tourism": { bg: "#e3f4f1", fg: "#0f6e63" },
  "Creative Industries": { bg: "#fde8ee", fg: "#b1366a" },
  "Other": { bg: "#eef0e2", fg: "#6b7a2a" },
};



function Index() {
  const fetchStats = useServerFn(getPublicStats);
  const { data: stats } = useQuery({ queryKey: ["public-stats"], queryFn: () => fetchStats() });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container relative mx-auto grid items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Official Government Platform
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] md:text-5xl lg:text-6xl">
              Powering Taraba's Economy <span className="text-gold">Through Digital Innovation</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/85 md:text-lg">
              The official registry of every business, product, service, and value-chain actor across all 16 LGAs of Taraba State — built to drive investment, policy, and growth.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-elegant">
                <Link to="/auth" search={{ mode: "signup" }}>Register your business <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link to="/directory">Browse directory</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/70">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Verified by State Admins</div>
              <div className="flex items-center gap-2"><Award className="h-4 w-4 text-gold" /> Unique Registry ID</div>
              <div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-gold" /> Public Directory</div>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl ring-1 ring-gold/30">
              <img
                src={sectorsHero}
                alt="A composite view of Taraba's productive sectors: agriculture, agro-processing, mining, manufacturing, trade, crafts, tourism, entrepreneurship, and creative industries"
                width={1536}
                height={1024}
                className="h-full w-full object-cover"
              />
              {/* Gradient blend into hero background */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary-deep/80 via-primary-deep/10 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary-deep/90 to-transparent" />

              {/* Floating sector chips */}
              <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
                {(["Agriculture", "Mining", "Manufacturing"] as const).map((c) => {
                  const Icon = SECTOR_ICONS[c];
                  return (
                    <span key={c} className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-primary shadow-sm sm:text-xs">
                      <Icon className="h-3 w-3" /> {c}
                    </span>
                  );
                })}
              </div>
              <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-1.5 sm:bottom-4 sm:right-4 sm:gap-2">
                {(["Tourism", "Creative Industries", "Trade"] as const).map((c) => {
                  const Icon = SECTOR_ICONS[c];
                  return (
                    <span key={c} className="flex items-center gap-1 rounded-full bg-gold/95 px-2.5 py-1 text-[10px] font-semibold text-gold-foreground shadow-sm sm:text-xs">
                      <Icon className="h-3 w-3" /> {c}
                    </span>
                  );
                })}
              </div>
            </div>
            {/* Accent card */}
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-gold/30 bg-white/95 px-4 py-3 shadow-elegant backdrop-blur sm:flex sm:items-center sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">9 sectors</div>
                <div className="text-sm font-bold text-foreground">One unified registry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip — gold */}
      <section className="bg-[#d4a017]">
        <div className="container mx-auto grid grid-cols-2 gap-y-6 px-4 py-8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-[#0d2e1a]/15">
          {[
            { v: stats?.totalBusinesses ? `${stats.totalBusinesses.toLocaleString()}+` : "0", l: "Registered businesses" },
            { v: `${stats?.totalLgasCovered ?? 16}`, l: "LGAs covered" },
            { v: `${CATEGORY_LIST.length}`, l: "Industry sectors" },
            { v: "₦4.2B+", l: "Estimated business value" },
            { v: "38,000+", l: "Jobs represented" },
          ].map((s) => (
            <div key={s.l} className="flex flex-col items-center justify-center px-4 text-center lg:px-6">
              <div className="font-display text-2xl font-semibold leading-none text-[#0d2e1a]">{s.v}</div>
              <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-[#0d2e1a]/70">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-[#f7f9f6] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-[#1a4d2e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1a4d2e]">Industry sectors</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-[#0d2e1a] md:text-4xl">Every sector of Taraba's economy, in one place</h2>
            <p className="mt-3 text-muted-foreground">From smallholder farms to creative studios, every productive arm of the state lives in a single, searchable registry.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {CATEGORY_LIST.map((c) => {
              const Icon = SECTOR_ICONS[c];
              const palette = SECTOR_PALETTE[c] ?? SECTOR_PALETTE["Other"];
              const count = stats?.sectorCounts?.[c] ?? 0;
              return (
                <Link
                  key={c}
                  to="/directory"
                  search={{ category: c }}
                  className="group flex flex-col items-center rounded-[10px] border border-[#dce8dc] bg-white px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-[#1a4d2e]/40 hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[10px]" style={{ background: palette.bg, color: palette.fg }}>
                    {Icon ? <Icon className="h-5 w-5" strokeWidth={2} /> : null}
                  </div>
                  <div className="mt-3 text-[12px] font-medium leading-tight text-[#0d2e1a]">{c === "Creative Industries" ? "Creative industries" : c === "Other" ? "Other sectors" : c}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{count.toLocaleString()} {count === 1 ? "business" : "businesses"}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-[#1a4d2e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1a4d2e]">How it works</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-[#0d2e1a] md:text-4xl">Get listed in three simple steps</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: 1, title: "Register your business", body: "Fill the multi-step form with your business, location, capacity, and supporting documents." },
              { n: 2, title: "Verification & approval", body: "State Admins review your submission, request clarifications if needed, and approve your listing." },
              { n: 3, title: "Get discovered", body: "Receive a unique registry ID, download your certificate, and appear in the public directory." },
            ].map((s) => (
              <div key={s.n} className="rounded-[10px] border border-[#dce8dc] bg-white p-7">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a4d2e] font-display text-sm font-bold text-white">{s.n}</div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#0d2e1a]">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#f7f9f6] py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-[#1a4d2e]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#1a4d2e]">Why register</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-[#0d2e1a] md:text-4xl">Built for businesses, powered by government</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              { icon: TrendingUp, title: "Investment visibility", body: "Surface your scale, capacity, and growth story to investors and development partners.", bg: "#e8f5ee", fg: "#1a4d2e" },
              { icon: BarChart3, title: "Access to finance", body: "Be matched with state and partner financing windows tailored to your sector.", bg: "#fef3e0", fg: "#b87a14" },
              { icon: Handshake, title: "Market linkages", body: "Connect with cooperatives, processors, and offtakers across Taraba and beyond.", bg: "#e6f1fb", fg: "#1f5fa6" },
              { icon: ShieldCheck, title: "Official recognition", body: "Government-verified listing with a unique registry ID and downloadable certificate.", bg: "#f3ebfb", fg: "#6b3fa0" },
              { icon: Award, title: "Policy representation", body: "Your data informs state-level economic policy, planning, and incentive design.", bg: "#fde8e8", fg: "#a83232" },
              { icon: Globe2, title: "Export readiness support", body: "Get flagged for export readiness programs, certifications, and trade promotion.", bg: "#e3f4f1", fg: "#0f6e63" },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-4 rounded-[10px] border border-[#dce8dc] bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: b.bg, color: b.fg }}>
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#0d2e1a]">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a4d2e] py-20 text-white">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to put your business on the map?</h2>
          <p className="max-w-xl text-white/80">Join thousands of Taraba businesses being seen, supported, and connected through the official state registry.</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-[#d4a017] text-[#0d2e1a] hover:bg-[#d4a017]/90 shadow-elegant">
              <Link to="/auth" search={{ mode: "signup" }}>Register your business — it's free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10">
              <Link to="/directory"><Search className="mr-2 h-4 w-4" /> Browse the directory</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
