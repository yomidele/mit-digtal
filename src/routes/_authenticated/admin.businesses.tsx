import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, ExternalLink, FileSpreadsheet, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { exportBusinessesData } from "@/lib/export.functions";
import { listAdminBusinesses } from "@/lib/admin.functions";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_authenticated/admin/businesses")({
  component: AllBusinesses,
});

function AllBusinesses() {
  const fetchList = useServerFn(listAdminBusinesses);
  const fetchExport = useServerFn(exportBusinessesData);
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<"csv" | "xlsx" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-all", submittedQ, page],
    queryFn: () => fetchList({ data: { status: "all", search: submittedQ || undefined, page } }),
  });

  async function download(kind: "csv" | "xlsx") {
    setDownloading(kind);
    try {
      const rows = await fetchExport();
      if (!rows.length) { toast.info("No businesses to export yet."); return; }
      const normalized = rows.map((r) => ({
        ...r,
        certifications: Array.isArray(r.certifications) ? r.certifications.join(", ") : r.certifications,
      }));
      const ws = XLSX.utils.json_to_sheet(normalized);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Businesses");
      const filename = `made-in-taraba-businesses-${new Date().toISOString().slice(0, 10)}.${kind}`;
      if (kind === "csv") {
        const csv = XLSX.utils.sheet_to_csv(ws);
        triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
      } else {
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        triggerDownload(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
      }
      toast.success(`${kind.toUpperCase()} downloaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setDownloading(null);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.count / data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-1 min-w-[240px] gap-2" onSubmit={(e) => { e.preventDefault(); setSubmittedQ(q); setPage(1); }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by business name…" className="pl-9" />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <div className="flex gap-2">
          <Button onClick={() => download("csv")} disabled={!!downloading} variant="outline"><FileText className="mr-1 h-4 w-4" />{downloading === "csv" ? "Building…" : "Export CSV"}</Button>
          <Button onClick={() => download("xlsx")} disabled={!!downloading} className="bg-success text-success-foreground hover:bg-success/90"><FileSpreadsheet className="mr-1 h-4 w-4" />{downloading === "xlsx" ? "Building…" : "Export Excel"}</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3 hidden md:table-cell">Sector</th>
              <th className="px-4 py-3 hidden lg:table-cell">LGA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && (data?.rows.length ?? 0) === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No businesses yet.</td></tr>}
            {(data?.rows ?? []).map((b) => (
              <tr key={b.id} className="hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{b.business_name}</div>
                  {b.registry_id && <div className="mt-0.5 font-mono text-[10px] text-primary">{b.registry_id}</div>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{b.category}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{b.community}, {b.lga}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{b.approval_status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {b.approval_status === "approved" && (
                      <>
                        <Button asChild size="sm" variant="ghost"><Link to="/business/$id" params={{ id: b.id }}><ExternalLink className="h-3.5 w-3.5" /></Link></Button>
                        <Button asChild size="sm" variant="outline">
                          <a href={`/api/businesses/${b.id}/certificate.pdf`} target="_blank" rel="noopener noreferrer"><Download className="mr-1 h-3.5 w-3.5" />Certificate</a>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
