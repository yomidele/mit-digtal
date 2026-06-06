import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Award, Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getAdminBusiness } from "@/lib/admin.functions";

export function AdminBusinessDetailDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const fetchFn = useServerFn(getAdminBusiness);
  const { data: b, isLoading } = useQuery({
    queryKey: ["admin-business-detail", id],
    queryFn: () => fetchFn({ data: { id: id! } }),
    enabled: !!id,
  });

  return (
    <Dialog open={!!id} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submission details</DialogTitle>
        </DialogHeader>

        {isLoading || !b ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              {b.logo_url ? (
                <img src={b.logo_url} alt="" className="h-16 w-16 rounded-xl border border-border object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">{b.business_name}</h3>
                  <Badge variant="secondary">{b.approval_status}</Badge>
                  {b.registry_id && <span className="font-mono text-xs text-primary">{b.registry_id}</span>}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{b.category}{b.sub_sector ? ` · ${b.sub_sector}` : ""}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Submitted {new Date(b.created_at).toLocaleString("en-GB")}</div>
              </div>
            </div>

            {b.rejection_reason && (b.approval_status === "rejected" || b.approval_status === "suspended") && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <strong>{b.approval_status === "rejected" ? "Rejection reason" : "Suspension reason"}:</strong> {b.rejection_reason}
              </div>
            )}

            <Section title="Products & services">
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{b.products_services}</p>
            </Section>

            <Section title="Identity & registration">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Ownership structure" value={b.ownership_structure} />
                <Info label="Registration status" value={b.registration_status} />
                {b.cac_number && <Info label="CAC number" value={b.cac_number} />}
                <Info label="Operational status" value={b.operational_status} />
              </div>
            </Section>

            <Section title="Location & contact">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info icon={MapPin} label="LGA" value={`${b.community}, ${b.lga}`} />
                <Info icon={MapPin} label="Address" value={b.address} />
                <Info icon={Phone} label="Phone" value={b.business_phone} />
                <Info icon={Mail} label="Email" value={b.business_email} />
                {b.website && <Info label="Website" value={b.website} />}
              </div>
            </Section>

            <Section title="Operations & market">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Employees" value={b.employee_count} />
                <Info label="Market reach" value={b.market_reach} />
                <Info label="Export readiness" value={b.export_readiness} />
                {b.key_markets && <Info label="Key markets" value={b.key_markets} />}
                {b.production_capacity && <Info label="Production capacity" value={b.production_capacity} />}
                {b.financing_needs && <Info label="Financing needs" value={b.financing_needs} />}
              </div>
            </Section>

            {b.certifications && b.certifications.length > 0 && (
              <Section title="Certifications">
                <div className="flex flex-wrap gap-2">
                  {b.certifications.map((c: string) => (
                    <Badge key={c} variant="secondary" className="gap-1"><Award className="h-3 w-3" />{c}</Badge>
                  ))}
                </div>
              </Section>
            )}

            {b.image_urls && b.image_urls.length > 0 && (
              <Section title={`Photos (${b.image_urls.length})`}>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {b.image_urls.map((u: string) => (
                    <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block">
                      <img src={u} alt="" loading="lazy" className="aspect-square w-full rounded-lg border border-border object-cover transition hover:opacity-80" />
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {b.document_urls && b.document_urls.length > 0 && (
              <Section title={`Supporting documents (${b.document_urls.length})`}>
                <ul className="space-y-2">
                  {b.document_urls.map((u: string) => (
                    <li key={u}>
                      <a
                        href={u}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-primary hover:bg-secondary"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{u.split("/").pop() ?? u}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {b.owner_profile && (
              <Section title="Owner">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info icon={User} label="Full name" value={b.owner_profile.full_name || "—"} />
                  {b.owner_profile.phone && <Info icon={Phone} label="Phone" value={b.owner_profile.phone} />}
                </div>
              </Section>
            )}

            {!b.image_urls?.length && !b.document_urls?.length && (
              <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-warning-foreground">
                <ImageIcon className="h-4 w-4" />
                Owner did not upload any photos or supporting documents.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-primary">{title}</h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}{label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
