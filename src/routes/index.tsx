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

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center backdrop-blur">
      <div className="font-display text-4xl font-bold text-gold md:text-5xl">{value}</div>
      <div className="mt-2 text-xs font-medium uppercase tracking-wider text-white/80">{label}</div>
    </div>
  );
}

function Index() {
  const fetchStats = useServerFn(getPublicStats);
  const { data: stats } = useQuery({ queryKey: ["public-stats"], queryFn: () => fetchStats() });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container relative mx-auto grid gap-12 px-4 py-20 md:grid-cols-[1.3fr_1fr] md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Official Government Platform
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight md:text-6xl">
              Powering Taraba's Economy <span className="text-gold">Through Digital Innovation</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              The Made-in-Taraba Digital Registry is the official database of businesses,
              products, services, and value chain actors operating across all 16 LGAs of Taraba State.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-elegant">
                <Link to="/auth" search={{ mode: "signup" }}>Register your business <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link to="/directory">Browse directory</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="rounded-3xl bg-white/10 p-10 backdrop-blur">
              <img src={crest} alt="Taraba State coat of arms" width={280} height={280} className="h-64 w-64 object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-deep py-12 text-white">
        <div className="container mx-auto grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard value={stats?.totalBusinesses ?? 0} label="Registered Businesses" />
          <StatCard value={`${stats?.totalLgas ?? 0}/16`} label="LGAs Active" />
          <StatCard value={stats?.totalSectors ?? 0} label="Sectors Covered" />
          <StatCard value={CATEGORY_LIST.length} label="Categories Tracked" />
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
      <section className="container mx-auto grid gap-8 px-4 py-20 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8">
          <h3 className="font-display text-2xl font-bold text-primary">For Businesses</h3>
          <ul className="mt-6 space-y-3 text-sm">
            {["Official government recognition", "Discoverable by buyers, investors, and partners", "Unique registry ID with downloadable certificate", "Access to future programs and incentives"].map((b) => (
              <li key={b} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8">
          <h3 className="font-display text-2xl font-bold text-primary">For Government</h3>
          <ul className="mt-6 space-y-3 text-sm">
            {["Real-time visibility into the state's productive economy", "Data-driven policy and investment planning", "Verified database of value chain actors", "Standardized records across all 16 LGAs"].map((b) => (
              <li key={b} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{b}</li>
            ))}
          </ul>
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
