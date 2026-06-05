import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { Search, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { listDirectory } from "@/lib/directory.functions";
import { CATEGORY_LIST, MARKET_REACH, TARABA_LGAS, SECTOR_ICONS } from "@/lib/taraba-data";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  lga: z.string().optional(),
  marketReach: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/directory")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Business Directory — Made-in-Taraba Registry" }] }),
  component: Directory,
});

function Directory() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const fetchList = useServerFn(listDirectory);
  const [q, setQ] = useState(search.q ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["directory", search],
    queryFn: () =>
      fetchList({
        data: {
          search: search.q,
          category: search.category,
          lga: search.lga,
          marketReach: search.marketReach,
          page: search.page ?? 1,
        },
      }),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.count / data.pageSize)) : 1;
  const currentPage = search.page ?? 1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-gradient-hero py-12 text-white">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Public Business Directory</h1>
          <p className="mt-2 text-white/85">Browse every approved business across Taraba State.</p>
          <form
            className="mt-6 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => { e.preventDefault(); nav({ search: (s: typeof search) => ({ ...s, q: q || undefined, page: 1 }) }); }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by business name…" className="bg-white pl-9 text-foreground" />
            </div>
            <Button type="submit" className="bg-gold text-gold-foreground hover:bg-gold/90">Search</Button>
          </form>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">Filter</h3>
          <FilterSelect label="Sector" value={search.category} options={CATEGORY_LIST} onChange={(v) => nav({ search: { ...search, category: v, page: 1 } })} />
          <FilterSelect label="LGA" value={search.lga} options={[...TARABA_LGAS]} onChange={(v) => nav({ search: { ...search, lga: v, page: 1 } })} />
          <FilterSelect label="Market reach" value={search.marketReach} options={[...MARKET_REACH]} onChange={(v) => nav({ search: { ...search, marketReach: v, page: 1 } })} />
          <Button variant="ghost" size="sm" onClick={() => nav({ search: {} })} className="w-full">Clear filters</Button>
        </aside>

        <div>
          <div className="mb-4 text-sm text-muted-foreground">{isLoading ? "Loading…" : `${data?.count ?? 0} businesses`}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(data?.rows ?? []).map((b) => {
              const Icon = SECTOR_ICONS[b.category] ?? SECTOR_ICONS["Other"];
              return (
              <Link key={b.id} to="/business/$id" params={{ id: b.id }} className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-elegant">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {b.logo_url ? <img src={b.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" loading="lazy" /> : <Icon className="h-7 w-7" strokeWidth={1.75} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-foreground group-hover:text-primary">{b.business_name}</div>
                    <div className="text-xs text-muted-foreground">{b.category}{b.sub_sector ? ` · ${b.sub_sector}` : ""}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{b.community}, {b.lga}</div>
                    <p className="mt-2 line-clamp-2 text-xs text-foreground/80">{b.products_services}</p>
                    {b.certifications?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {b.certifications.slice(0, 3).map((c) => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
              );
            })}
            {!isLoading && (data?.rows.length ?? 0) === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                No businesses match your filters yet.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => nav({ search: { ...search, page: currentPage - 1 } })}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => nav({ search: { ...search, page: currentPage + 1 } })}>Next</Button>
            </div>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (v: string | undefined) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <Select value={value ?? "__all"} onValueChange={(v) => onChange(v === "__all" ? undefined : v)}>
        <SelectTrigger><SelectValue placeholder={`All ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">All {label.toLowerCase()}</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
