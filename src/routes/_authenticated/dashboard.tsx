import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Eye, FileText, Pencil, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyBusiness, getMyProfile } from "@/lib/business.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Made-in-Taraba Registry" }] }),
  component: Dashboard,
});

const STATUS = {
  pending: { color: "bg-warning text-warning-foreground", icon: Clock, label: "Pending Review" },
  approved: { color: "bg-success text-success-foreground", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-destructive text-destructive-foreground", icon: XCircle, label: "Rejected" },
} as const;

function Dashboard() {
  const fetchBiz = useServerFn(getMyBusiness);
  const fetchProfile = useServerFn(getMyProfile);
  const { data: biz, isLoading } = useQuery({ queryKey: ["my-business"], queryFn: () => fetchBiz() });
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile() });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Welcome{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your business registration and profile.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 text-sm text-muted-foreground">Loading…</div>
        ) : !biz ? (
          <EmptyState />
        ) : (
          <BusinessCard biz={biz} />
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
      <FileText className="mx-auto h-12 w-12 text-primary" />
      <h2 className="mt-4 font-display text-xl font-bold">Register your business</h2>
      <p className="mt-2 text-sm text-muted-foreground">Complete the 6-step form to be added to the Taraba State Digital Registry.</p>
      <Button asChild className="mt-6 bg-primary hover:bg-primary-deep">
        <Link to="/register-business">Start registration</Link>
      </Button>
    </div>
  );
}

function BusinessCard({ biz }: { biz: any }) {
  const status = STATUS[biz.approval_status as keyof typeof STATUS] ?? STATUS.pending;
  const StatusIcon = status.icon;
  const canEdit = biz.approval_status !== "approved";
  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">{biz.business_name}</h2>
            <div className="mt-1 text-sm text-muted-foreground">{biz.category}{biz.sub_sector ? ` · ${biz.sub_sector}` : ""} · {biz.community}, {biz.lga}</div>
            {biz.registry_id && <div className="mt-2 font-mono text-xs text-primary">{biz.registry_id}</div>}
          </div>
          <Badge className={`${status.color} gap-1`}><StatusIcon className="h-3 w-3" />{status.label}</Badge>
        </div>

        {biz.approval_status === "rejected" && biz.rejection_reason && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <strong>Reason:</strong> {biz.rejection_reason}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon={Eye} label="Profile views" value={biz.view_count ?? 0} />
          <Stat label="Employees" value={biz.employee_count} />
          <Stat label="Market reach" value={biz.market_reach} />
          <Stat label="Export ready" value={biz.export_readiness} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {canEdit ? (
            <Button asChild className="bg-primary hover:bg-primary-deep">
              <Link to="/_authenticated/register-business"><Pencil className="mr-2 h-4 w-4" />Edit submission</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/business/$id" params={{ id: biz.id }}>View public listing</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}{label}
      </div>
      <div className="mt-1 font-display text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}
