import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Mail, Phone, Globe, Building2, Users, Target, Award, ArrowLeft, Download } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBusiness } from "@/lib/directory.functions";
import { SECTOR_ICONS } from "@/lib/taraba-data";

export const Route = createFileRoute("/business/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Business Profile — Registry #${params.id.slice(0, 8)}` }],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  const { id } = Route.useParams();
  const fetcher = useServerFn(getBusiness);
  const { data: b, isLoading } = useQuery({ queryKey: ["business", id], queryFn: () => fetcher({ data: { id } }) });

  if (isLoading) return <div className="min-h-screen bg-background"><SiteHeader /><div className="container mx-auto px-4 py-16 text-muted-foreground">Loading…</div></div>;
  if (!b) throw notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/directory"><ArrowLeft className="mr-1 h-4 w-4" />Back to directory</Link></Button>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            {(() => { const Icon = SECTOR_ICONS[b.category] ?? SECTOR_ICONS["Other"]; return (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {b.logo_url ? <img src={b.logo_url} alt="" className="h-20 w-20 rounded-2xl object-cover" /> : <Icon className="h-10 w-10" strokeWidth={1.5} />}
            </div>
            ); })()}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-foreground">{b.business_name}</h1>
                <Badge className="bg-success text-success-foreground">Approved</Badge>
              </div>
              {b.registry_id && <div className="mt-1 font-mono text-xs text-primary">{b.registry_id}</div>}
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{b.category}{b.sub_sector ? ` · ${b.sub_sector}` : ""}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{b.community}, {b.lga}</span>
                <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{b.employee_count} employees</span>
                <span className="inline-flex items-center gap-1"><Target className="h-4 w-4" />{b.market_reach}</span>
              </div>
              <div className="mt-4">
                <Button asChild size="sm" className="bg-primary hover:bg-primary-deep">
                  <a href={`/api/businesses/${b.id}/certificate.pdf`} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />Download official certificate
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <Section title="Products & Services"><p className="text-sm text-foreground/90">{b.products_services}</p></Section>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info label="Ownership" value={b.ownership_structure} />
            <Info label="Registration" value={b.registration_status} />
            {b.cac_number && <Info label="CAC Number" value={b.cac_number} />}
            <Info label="Operational Status" value={b.operational_status} />
            <Info label="Export Readiness" value={b.export_readiness} />
            {b.production_capacity && <Info label="Production Capacity" value={b.production_capacity} />}
            {b.key_markets && <Info label="Key Markets" value={b.key_markets} />}
          </div>

          {b.certifications?.length ? (
            <Section title="Certifications">
              <div className="flex flex-wrap gap-2">
                {b.certifications.map((c: string) => (
                  <Badge key={c} variant="secondary" className="gap-1"><Award className="h-3 w-3" />{c}</Badge>
                ))}
              </div>
            </Section>
          ) : null}

          {b.image_urls?.length ? (
            <Section title="Gallery">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {b.image_urls.map((url: string) => (
                  <img key={url} src={url} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                ))}
              </div>
            </Section>
          ) : null}

          <Section title="Contact">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{b.business_phone}</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{b.business_email}</div>
              {b.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /><a href={b.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{b.website}</a></div>}
              <div className="text-muted-foreground">{b.address}</div>
            </div>
          </Section>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
