import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Check, Clock, ExternalLink, Eye, Pause, Play, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { approveBusiness, listAdminBusinesses, rejectBusiness, reopenBusiness, suspendBusiness } from "@/lib/admin.functions";
import { AdminBusinessDetailDialog } from "@/components/AdminBusinessDetailDialog";
import { TARABA_LGAS } from "@/lib/taraba-data";


const searchSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "suspended", "all"]).optional(),
  q: z.string().optional(),
  lga: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  validateSearch: searchSchema,
  component: SubmissionsPage,
});

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
  suspended: "bg-muted text-muted-foreground",
};

function SubmissionsPage() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const qc = useQueryClient();
  const fetchList = useServerFn(listAdminBusinesses);
  const approveFn = useServerFn(approveBusiness);
  const rejectFn = useServerFn(rejectBusiness);
  const suspendFn = useServerFn(suspendBusiness);
  const reopenFn = useServerFn(reopenBusiness);

  const status = search.status ?? "pending";
  const [q, setQ] = useState(search.q ?? "");
  const [dialog, setDialog] = useState<{ kind: "reject" | "suspend"; id: string; name: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reason, setReason] = useState("");


  const { data, isLoading } = useQuery({
    queryKey: ["admin-submissions", search],
    queryFn: () => fetchList({ data: { status, search: search.q, lga: search.lga, page: search.page ?? 1 } }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-submissions"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const approve = useMutation({ mutationFn: (id: string) => approveFn({ data: { id } }), onSuccess: (row) => { toast.success(`Approved · ${row.registry_id ?? ""}`); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const reject = useMutation({ mutationFn: (v: { id: string; reason: string }) => rejectFn({ data: v }), onSuccess: () => { toast.success("Rejected, owner notified"); setDialog(null); setReason(""); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const suspend = useMutation({ mutationFn: (v: { id: string; reason: string }) => suspendFn({ data: v }), onSuccess: () => { toast.success("Suspended"); setDialog(null); setReason(""); invalidate(); }, onError: (e: Error) => toast.error(e.message) });
  const reopen = useMutation({ mutationFn: (id: string) => reopenFn({ data: { id } }), onSuccess: () => { toast.success("Reopened"); invalidate(); }, onError: (e: Error) => toast.error(e.message) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {(["pending", "approved", "rejected", "suspended", "all"] as const).map((s) => (
            <Button
              key={s}
              variant={status === s ? "default" : "outline"}
              size="sm"
              className={status === s ? "bg-primary hover:bg-primary-deep" : ""}
              onClick={() => nav({ search: { ...search, status: s, page: 1 } })}
            >{s[0].toUpperCase() + s.slice(1)}</Button>
          ))}
        </div>
        <form
          className="flex flex-1 min-w-[200px] gap-2"
          onSubmit={(e) => { e.preventDefault(); nav({ search: { ...search, q: q || undefined, page: 1 } }); }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by business name…" className="pl-9" />
          </div>
          <Select value={search.lga ?? "__all"} onValueChange={(v) => nav({ search: { ...search, lga: v === "__all" ? undefined : v, page: 1 } })}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="All LGAs" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All LGAs</SelectItem>
              {TARABA_LGAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3 hidden md:table-cell">Sector</th>
              <th className="px-4 py-3 hidden lg:table-cell">LGA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {isLoading && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && (data?.rows.length ?? 0) === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No submissions match.</td></tr>}
            {(data?.rows ?? []).map((b) => (
              <tr key={b.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{b.business_name}</div>
                  <div className="text-xs text-muted-foreground">{b.business_email}</div>
                  {b.registry_id && <div className="mt-0.5 font-mono text-[10px] text-primary">{b.registry_id}</div>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{b.category}{b.sub_sector ? ` · ${b.sub_sector}` : ""}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{b.community}, {b.lga}</td>
                <td className="px-4 py-3"><Badge className={STATUS_BADGE[b.approval_status] ?? ""}>{b.approval_status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setDetailId(b.id)} title="View full submission">
                      <Eye className="mr-1 h-3.5 w-3.5" />View
                    </Button>
                    {b.approval_status === "approved" ? (
                      <Button asChild variant="ghost" size="sm"><Link to="/business/$id" params={{ id: b.id }}><ExternalLink className="h-3.5 w-3.5" /></Link></Button>
                    ) : null}
                    {b.approval_status === "pending" && (
                      <>
                        <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => approve.mutate(b.id)} disabled={approve.isPending}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => setDialog({ kind: "reject", id: b.id, name: b.business_name })}><X className="mr-1 h-3.5 w-3.5" />Reject</Button>
                      </>
                    )}
                    {b.approval_status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "suspend", id: b.id, name: b.business_name })}><Pause className="mr-1 h-3.5 w-3.5" />Suspend</Button>
                    )}
                    {(b.approval_status === "rejected" || b.approval_status === "suspended") && (
                      <Button size="sm" variant="outline" onClick={() => reopen.mutate(b.id)}><Play className="mr-1 h-3.5 w-3.5" />Reopen</Button>
                    )}
                  </div>
                  {b.rejection_reason && (b.approval_status === "rejected" || b.approval_status === "suspended") && (
                    <div className="mt-1 text-right text-[11px] text-destructive/80">{b.rejection_reason}</div>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <Pagination
          page={search.page ?? 1}
          totalPages={Math.max(1, Math.ceil(data.count / data.pageSize))}
          onChange={(p) => nav({ search: { ...search, page: p } })}
          count={data.count}
        />
      )}

      <Dialog open={!!dialog} onOpenChange={(o) => { if (!o) { setDialog(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.kind === "reject" ? "Reject submission" : "Suspend listing"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{dialog?.name}</p>
          <Textarea
            placeholder="Reason (will be sent to the business owner)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDialog(null); setReason(""); }}>Cancel</Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={reason.trim().length < 3 || reject.isPending || suspend.isPending}
              onClick={() => {
                if (!dialog) return;
                if (dialog.kind === "reject") reject.mutate({ id: dialog.id, reason: reason.trim() });
                else suspend.mutate({ id: dialog.id, reason: reason.trim() });
              }}
            >Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AdminBusinessDetailDialog id={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}


function Pagination({ page, totalPages, onChange, count }: { page: number; totalPages: number; onChange: (p: number) => void; count: number }) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <div><Clock className="mr-1 inline h-3.5 w-3.5" />{count} total</div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
