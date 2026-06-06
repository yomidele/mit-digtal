import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Award, BarChart3, CheckCircle2, ClipboardList, Globe2, Handshake, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
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
      <section className="relative bg-gold text-gold-foreground">
        <div className="container mx-auto grid gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: stats?.totalBusinesses ?? 0, l: "Registered Businesses" },
            { v: `${stats?.totalLgas ?? 0}/16`, l: "LGAs Active" },
            { v: stats?.totalSectors ?? 0, l: "Sectors Covered" },
            { v: CATEGORY_LIST.length, l: "Categories Tracked" },
          ].map((s) => (
            <div key={s.l} className="flex items-baseline gap-3 sm:flex-col sm:items-start sm:gap-1">
              <div className="font-display text-3xl font-extrabold leading-none md:text-4xl">{s.v}</div>
              <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Featured Sectors</div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">A snapshot of Taraba's productive economy</h2>
          <p className="mt-3 text-muted-foreground">From agriculture to creative industries, the registry covers every sector driving the state forward.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORY_LIST.map((c) => {
            const Icon = SECTOR_ICONS[c];
            return (
              <Link key={c} to="/directory" search={{ category: c }} className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-elegant">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  {Icon ? <Icon className="h-6 w-6" strokeWidth={1.75} /> : null}
                </div>
                <div className="mt-3 font-semibold text-foreground group-hover:text-primary">{c}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</div>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Three steps to get listed</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: ClipboardList, title: "Register", body: "Complete the 6-step business registration form with your details, location, capacity, and media." },
              { icon: ShieldCheck, title: "Verify", body: "State Admins review your submission, may request additional information, and approve your listing." },
              { icon: CheckCircle2, title: "Get Listed", body: "Receive a unique registry ID, a downloadable certificate, and appear in the public directory." },
            ].map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-gold-foreground">{i + 1}</div>
                <s.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Why register</div>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Benefits for your business</h2>
          <p className="mt-3 text-muted-foreground">Join the official state record and unlock visibility, credibility, and opportunity.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Official Recognition", body: "Government-verified listing with a unique registry ID and downloadable certificate." },
            { icon: Globe2, title: "Public Visibility", body: "Be discovered by buyers, investors, and partners through the public directory." },
            { icon: TrendingUp, title: "Investment Ready", body: "Surface your financing needs and capacity to development partners and funders." },
            { icon: Handshake, title: "Market Linkages", body: "Connect with cooperatives, processors, and offtakers across Taraba and beyond." },
            { icon: BarChart3, title: "Sector Insights", body: "Benchmark your business against real, real-time sector and LGA data." },
            { icon: Award, title: "Programs & Incentives", body: "Be first in line for state programs, grants, and capacity-building schemes." },
          ].map((b) => (
            <div key={b.title} className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-elegant">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-hero py-16 text-white">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
          <Search className="h-10 w-10 text-gold" />
          <h2 className="font-display text-3xl font-bold md:text-4xl">Search the public business directory</h2>
          <p className="max-w-xl text-white/85">No account needed — explore every approved business in Taraba State.</p>
          <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/directory">Open directory</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
