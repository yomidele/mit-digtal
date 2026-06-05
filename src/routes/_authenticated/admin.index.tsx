import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, XCircle, Pause, MapPin, Layers } from "lucide-react";
import { adminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchStats = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() });

  if (isLoading || !data) return <div className="py-12 text-center text-muted-foreground">Loading stats…</div>;

  const cards = [
    { label: "Pending review", value: data.counts.pending, icon: Clock, color: "bg-warning/15 text-warning-foreground", iconColor: "text-warning", to: "/admin/submissions" },
    { label: "Approved", value: data.counts.approved, icon: CheckCircle2, color: "bg-success/15 text-success", iconColor: "text-success", to: "/admin/businesses" },
    { label: "Rejected", value: data.counts.rejected, icon: XCircle, color: "bg-destructive/10 text-destructive", iconColor: "text-destructive", to: "/admin/submissions?status=rejected" },
    { label: "Suspended", value: data.counts.suspended, icon: Pause, color: "bg-muted text-muted-foreground", iconColor: "text-muted-foreground", to: "/admin/submissions?status=suspended" },
  ] as const;

  const topLgas = Object.entries(data.lgaCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topCats = Object.entries(data.catCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-elegant">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                  <div className="mt-2 font-display text-3xl font-bold text-foreground">{c.value}</div>
                </div>
                <Icon className={`h-6 w-6 ${c.iconColor}`} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Approved by LGA" icon={MapPin} rows={topLgas} />
        <Panel title="Approved by sector" icon={Layers} rows={topCats} />
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, rows }: { title: string; icon: React.ComponentType<{ className?: string }>; rows: Array<[string, number]> }) {
  const max = rows.reduce((m, [, v]) => Math.max(m, v), 1);
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-primary"><Icon className="h-4 w-4" /><h3 className="font-display text-sm font-bold uppercase tracking-wider">{title}</h3></div>
      <div className="mt-4 space-y-2">
        {rows.length === 0 && <div className="text-sm text-muted-foreground">No data yet.</div>}
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className="flex items-center justify-between text-xs"><span className="font-medium text-foreground">{k}</span><span className="text-muted-foreground">{v}</span></div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-to-r from-primary to-primary-deep" style={{ width: `${(v / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
