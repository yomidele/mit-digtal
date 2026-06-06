import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CheckCircle2, Clock, Download, Eye, FileText, Pencil, XCircle, Ban, History } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyBusiness, getMyProfile } from "@/lib/business.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { downloadMyCertificate, getMyDownloadHistory } from "@/lib/certificates.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Made-in-Taraba Registry" }] }),
  component: Dashboard,
});

const STATUS = {
  pending: { color: "bg-warning text-warning-foreground", icon: Clock, label: "Pending Review" },
  approved: { color: "bg-success text-success-foreground", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-destructive text-destructive-foreground", icon: XCircle, label: "Rejected" },
  suspended: { color: "bg-destructive text-destructive-foreground", icon: Ban, label: "Suspended" },
} as const;

const ADMIN_ROLES = new Set(["lga_moderator", "state_admin", "super_admin"]);

function Dashboard() {
  const navigate = useNavigate();
  const fetchBiz = useServerFn(getMyBusiness);
  const fetchProfile = useServerFn(getMyProfile);
  const fetchRoles = useServerFn(getMyRoles);
  const { data: roles, isLoading: rolesLoading } = useQuery({ queryKey: ["my-roles"], queryFn: () => fetchRoles() });
  const isAdmin = (roles ?? []).some((r: { role: string }) => ADMIN_ROLES.has(r.role));

  useEffect(() => {
    if (!rolesLoading && isAdmin) navigate({ to: "/admin", replace: true });
  }, [rolesLoading, isAdmin, navigate]);

  const { data: biz, isLoading } = useQuery({ queryKey: ["my-business"], queryFn: () => fetchBiz(), enabled: !rolesLoading && !isAdmin });
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile(), enabled: !rolesLoading && !isAdmin });

  if (rolesLoading || isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="container mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">Loading…</div>
        <SiteFooter />
      </div>
    );
  }

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
          <>
            <BusinessCard biz={biz} />
            {biz.approval_status === "approved" && <DownloadHistory />}
          </>
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
  const qc = useQueryClient();
  const downloadFn = useServerFn(downloadMyCertificate);
  const downloadMut = useMutation({
    mutationFn: () => downloadFn({ data: { businessId: biz.id } }),
    onSuccess: ({ base64, filename }) => {
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      qc.invalidateQueries({ queryKey: ["my-download-history"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Download failed"),
  });

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    downloadMut.mutate();
  };

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
              <Link to="/register-business"><Pencil className="mr-2 h-4 w-4" />Edit submission</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link to="/business/$id" params={{ id: biz.id }}>View public listing</Link>
              </Button>
              <Button onClick={handleDownload} className="bg-primary hover:bg-primary-deep">
                <Download className="mr-2 h-4 w-4" />Download certificate
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DownloadHistory() {
  const fetchFn = useServerFn(getMyDownloadHistory);
  const { data, isLoading } = useQuery({ queryKey: ["my-download-history"], queryFn: () => fetchFn() });
  const rows = data ?? [];
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold">Certificate download history</h3>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">A full audit trail of every time your certificate has been downloaded.</p>
      <div className="mt-4">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading history…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
            No downloads recorded yet. Your next download will appear here.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Date &amp; Time</th>
                  <th className="px-4 py-2.5">Registry ID</th>
                  <th className="px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 text-foreground">
                      {new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{r.details?.registry_id ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">Certificate download</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
