import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getMyBusiness, getSignedUploadUrl, upsertMyBusiness } from "@/lib/business.functions";
import {
  BUSINESS_CATEGORIES, CATEGORY_LIST, COMMON_CERTIFICATIONS, EMPLOYEE_BUCKETS,
  EXPORT_READINESS, MARKET_REACH, OPERATIONAL_STATUSES, OWNERSHIP_TYPES,
  REGISTRATION_STATUSES, TARABA_LGAS,
} from "@/lib/taraba-data";

export const Route = createFileRoute("/_authenticated/register-business")({
  head: () => ({ meta: [{ title: "Register Your Business — Made-in-Taraba Registry" }] }),
  component: RegisterBusiness,
});

type FormState = {
  business_name: string;
  category: string;
  sub_sector: string;
  products_services: string;
  ownership_structure: string;
  registration_status: string;
  cac_number: string;
  operational_status: string;
  lga: string;
  community: string;
  address: string;
  business_phone: string;
  business_email: string;
  website: string;
  employee_count: string;
  production_capacity: string;
  market_reach: string;
  key_markets: string;
  financing_needs: string;
  certifications: string[];
  export_readiness: string;
  logo_url: string;
  image_urls: string[];
  document_urls: string[];
};

const EMPTY: FormState = {
  business_name: "", category: "", sub_sector: "", products_services: "",
  ownership_structure: "", registration_status: "", cac_number: "",
  operational_status: "Active", lga: "", community: "", address: "",
  business_phone: "", business_email: "", website: "", employee_count: "",
  production_capacity: "", market_reach: "", key_markets: "", financing_needs: "",
  certifications: [], export_readiness: "No", logo_url: "", image_urls: [], document_urls: [],
};

const STORAGE_KEY = "mit-registration-draft";
const STEPS = ["Identity", "Location & Contact", "Operations", "Market & Export", "Certifications", "Media"];

function RegisterBusiness() {
  const navigate = useNavigate();
  const fetchBiz = useServerFn(getMyBusiness);
  const submit = useServerFn(upsertMyBusiness);
  const signUrl = useServerFn(getSignedUploadUrl);

  const { data: existing, isLoading } = useQuery({ queryKey: ["my-business"], queryFn: () => fetchBiz() });
  const locked = existing?.approval_status === "approved";

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);

  // hydrate from db then localStorage
  useEffect(() => {
    if (isLoading || hydrated) return;
    let base = EMPTY;
    if (existing) {
      base = { ...EMPTY, ...Object.fromEntries(Object.entries(existing).filter(([k]) => k in EMPTY)) } as FormState;
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) base = { ...EMPTY, ...JSON.parse(raw) };
      } catch { /* ignore */ }
    }
    setForm(base);
    setHydrated(true);
  }, [existing, isLoading, hydrated]);

  // autosave drafts
  useEffect(() => {
    if (!hydrated || locked) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* ignore */ }
  }, [form, hydrated, locked]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const subSectors = useMemo(() => {
    const list = BUSINESS_CATEGORIES[form.category as keyof typeof BUSINESS_CATEGORIES];
    return list ? [...list] : [];
  }, [form.category]);

  const stepErrors = useMemo(() => validateStep(step, form), [step, form]);
  const canNext = stepErrors.length === 0;

  async function handleUpload(file: File, kind: "logo" | "image" | "document") {
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${kind}/${Date.now()}-${safe}`;
      const { uploadUrl, publicUrl } = await signUrl({ data: { path } });
      const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      if (!res.ok) throw new Error("Upload failed");
      return publicUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
      return null;
    }
  }

  async function onSubmit() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sub_sector: form.sub_sector || null,
        cac_number: form.cac_number || null,
        website: form.website || null,
        production_capacity: form.production_capacity || null,
        key_markets: form.key_markets || null,
        financing_needs: form.financing_needs || null,
        logo_url: form.logo_url || null,
      };
      await submit({ data: payload });
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Submitted! Your registration is pending review.");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !hydrated) {
    return <Shell><div className="py-16 text-center text-muted-foreground">Loading…</div></Shell>;
  }

  if (locked) {
    return (
      <Shell>
        <div className="rounded-3xl border border-warning/40 bg-warning/10 p-8 text-center">
          <h2 className="font-display text-xl font-bold">Submission locked</h2>
          <p className="mt-2 text-sm text-muted-foreground">Your business is approved. Contact a state administrator to unlock edits.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/dashboard" })}>Back to dashboard</Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Stepper step={step} />
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="font-display text-xl font-bold text-primary">Step {step + 1}: {STEPS[step]}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Progress saves automatically as you type.</p>

        <div className="mt-6 grid gap-4">
          {step === 0 && (
            <>
              <Field label="Business name *">
                <Input value={form.business_name} onChange={(e) => update("business_name", e.target.value)} maxLength={200} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sector *">
                  <Select value={form.category} onValueChange={(v) => { update("category", v); update("sub_sector", ""); }}>
                    <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                    <SelectContent>{CATEGORY_LIST.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Sub-sector">
                  <Select value={form.sub_sector || undefined} onValueChange={(v) => update("sub_sector", v)} disabled={!subSectors.length}>
                    <SelectTrigger><SelectValue placeholder={subSectors.length ? "Select" : "Pick a sector first"} /></SelectTrigger>
                    <SelectContent>{subSectors.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Products & services *" hint="Describe what you produce, supply, or offer.">
                <Textarea value={form.products_services} onChange={(e) => update("products_services", e.target.value)} maxLength={4000} rows={4} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ownership structure *">
                  <Select value={form.ownership_structure} onValueChange={(v) => update("ownership_structure", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{OWNERSHIP_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Registration status *">
                  <Select value={form.registration_status} onValueChange={(v) => update("registration_status", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{REGISTRATION_STATUSES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              {form.registration_status === "Registered (CAC)" && (
                <Field label="CAC registration number">
                  <Input value={form.cac_number} onChange={(e) => update("cac_number", e.target.value)} maxLength={60} />
                </Field>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="LGA *">
                  <Select value={form.lga} onValueChange={(v) => update("lga", v)}>
                    <SelectTrigger><SelectValue placeholder="Select LGA" /></SelectTrigger>
                    <SelectContent>{TARABA_LGAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Community / Ward *">
                  <Input value={form.community} onChange={(e) => update("community", e.target.value)} maxLength={120} />
                </Field>
              </div>
              <Field label="Street address *">
                <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} maxLength={400} rows={2} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business phone *">
                  <Input value={form.business_phone} onChange={(e) => update("business_phone", e.target.value)} placeholder="+234…" maxLength={40} />
                </Field>
                <Field label="Business email *">
                  <Input type="email" value={form.business_email} onChange={(e) => update("business_email", e.target.value)} maxLength={255} />
                </Field>
              </div>
              <Field label="Website (optional)">
                <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" maxLength={255} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Operational status *">
                  <Select value={form.operational_status} onValueChange={(v) => update("operational_status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{OPERATIONAL_STATUSES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Number of employees *">
                  <Select value={form.employee_count} onValueChange={(v) => update("employee_count", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{EMPLOYEE_BUCKETS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Production capacity (optional)" hint="e.g. 500 bags per month, 2,000 litres per day">
                <Textarea value={form.production_capacity} onChange={(e) => update("production_capacity", e.target.value)} maxLength={2000} rows={3} />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Market reach *">
                  <Select value={form.market_reach} onValueChange={(v) => update("market_reach", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{MARKET_REACH.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Export readiness *">
                  <Select value={form.export_readiness} onValueChange={(v) => update("export_readiness", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EXPORT_READINESS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Key markets (optional)" hint="Cities, states, or countries you sell to.">
                <Input value={form.key_markets} onChange={(e) => update("key_markets", e.target.value)} maxLength={1000} />
              </Field>
              <Field label="Financing needs (optional)" hint="Brief description of capital, equipment, or support needs.">
                <Textarea value={form.financing_needs} onChange={(e) => update("financing_needs", e.target.value)} maxLength={2000} rows={3} />
              </Field>
            </>
          )}

          {step === 4 && (
            <>
              <Field label="Certifications & quality standards" hint="Select all that apply.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {COMMON_CERTIFICATIONS.map((c) => {
                    const checked = form.certifications.includes(c);
                    return (
                      <label key={c} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary/40 p-3">
                        <Checkbox checked={checked} onCheckedChange={(v) => {
                          const next = v ? [...form.certifications, c] : form.certifications.filter((x) => x !== c);
                          update("certifications", next);
                        }} />
                        <span className="text-sm">{c}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>
              {form.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.certifications.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
                </div>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <Field label="Business logo (optional)">
                <UploadSlot
                  accept="image/*"
                  current={form.logo_url}
                  onPick={async (file) => {
                    const url = await handleUpload(file, "logo");
                    if (url) update("logo_url", url);
                  }}
                  onClear={() => update("logo_url", "")}
                />
              </Field>
              <Field label="Product / facility photos (up to 5)">
                <MultiUpload
                  accept="image/*"
                  urls={form.image_urls}
                  max={5}
                  onAdd={async (file) => {
                    const url = await handleUpload(file, "image");
                    if (url) update("image_urls", [...form.image_urls, url]);
                  }}
                  onRemove={(i) => update("image_urls", form.image_urls.filter((_, idx) => idx !== i))}
                />
              </Field>
              <Field label="Supporting documents (CAC, licenses — up to 5)">
                <MultiUpload
                  accept=".pdf,.png,.jpg,.jpeg"
                  urls={form.document_urls}
                  max={5}
                  onAdd={async (file) => {
                    const url = await handleUpload(file, "document");
                    if (url) update("document_urls", [...form.document_urls, url]);
                  }}
                  onRemove={(i) => update("document_urls", form.document_urls.filter((_, idx) => idx !== i))}
                  asList
                />
              </Field>
            </>
          )}
        </div>

        {stepErrors.length > 0 && (
          <ul className="mt-6 list-disc rounded-xl border border-destructive/30 bg-destructive/5 p-4 pl-8 text-sm text-destructive">
            {stepErrors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <ArrowLeft className="mr-1 h-4 w-4" />Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext} className="bg-primary hover:bg-primary-deep" onClick={() => setStep(step + 1)}>
              Next<ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button disabled={!canNext || saving} className="bg-gold text-gold-foreground hover:bg-gold/90" onClick={onSubmit}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
              Submit for review
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-primary">Business Registration</h1>
        <p className="mt-1 text-sm text-muted-foreground">Six quick steps. We'll review and issue your Registry ID upon approval.</p>
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mt-6 flex flex-wrap items-center gap-2 text-xs">
      {STEPS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <li key={label} className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${active ? "bg-primary text-primary-foreground" : done ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"}`}>
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${active ? "bg-gold text-gold-foreground" : done ? "bg-success text-success-foreground" : "bg-background text-muted-foreground"}`}>
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function UploadSlot({ current, onPick, onClear, accept }: { current: string; onPick: (f: File) => void; onClear: () => void; accept?: string }) {
  return (
    <div className="flex items-center gap-4">
      {current ? (
        <div className="relative">
          <img src={current} alt="" className="h-20 w-20 rounded-xl border border-border object-cover" />
          <button type="button" onClick={onClear} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"><X className="h-3 w-3" /></button>
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 text-muted-foreground"><Upload className="h-5 w-5" /></div>
      )}
      <label className="cursor-pointer">
        <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-secondary"><Upload className="h-4 w-4" />{current ? "Replace" : "Upload"}</span>
      </label>
    </div>
  );
}

function MultiUpload({ urls, max, onAdd, onRemove, accept, asList }: { urls: string[]; max: number; onAdd: (f: File) => void; onRemove: (i: number) => void; accept?: string; asList?: boolean }) {
  return (
    <div className="space-y-3">
      {asList ? (
        <ul className="space-y-2">
          {urls.map((u, i) => (
            <li key={u} className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-2 text-sm">
              <a href={u} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">{u.split("/").pop()}</a>
              <button type="button" onClick={() => onRemove(i)} className="rounded-full p-1 text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {urls.map((u, i) => (
            <div key={u} className="relative">
              <img src={u} alt="" className="aspect-square w-full rounded-lg border border-border object-cover" />
              <button type="button" onClick={() => onRemove(i)} className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-1 text-destructive-foreground"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
      {urls.length < max && (
        <label className="cursor-pointer">
          <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ""; }} />
          <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border bg-card px-3 py-2 text-sm hover:bg-secondary"><Upload className="h-4 w-4" />Add file ({urls.length}/{max})</span>
        </label>
      )}
    </div>
  );
}

function validateStep(step: number, f: FormState): string[] {
  const errs: string[] = [];
  if (step === 0) {
    if (f.business_name.trim().length < 2) errs.push("Business name is required.");
    if (!f.category) errs.push("Sector is required.");
    if (f.products_services.trim().length < 5) errs.push("Describe your products or services.");
    if (!f.ownership_structure) errs.push("Ownership structure is required.");
    if (!f.registration_status) errs.push("Registration status is required.");
  }
  if (step === 1) {
    if (!f.lga) errs.push("LGA is required.");
    if (!f.community.trim()) errs.push("Community is required.");
    if (f.address.trim().length < 3) errs.push("Address is required.");
    if (f.business_phone.trim().length < 7) errs.push("Phone is required.");
    if (!/^\S+@\S+\.\S+$/.test(f.business_email.trim())) errs.push("Valid business email is required.");
  }
  if (step === 2) {
    if (!f.operational_status) errs.push("Operational status is required.");
    if (!f.employee_count) errs.push("Employee count is required.");
  }
  if (step === 3) {
    if (!f.market_reach) errs.push("Market reach is required.");
    if (!f.export_readiness) errs.push("Export readiness is required.");
  }
  return errs;
}
