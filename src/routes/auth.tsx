import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { Copy, ShieldCheck, Sparkles, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { seedDemoAdmins, seedDemoBusinessOwner } from "@/lib/seed.functions";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Made-in-Taraba Registry" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode === "signup" ? "signup" : "signin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="container mx-auto flex flex-col items-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <h1 className="font-display text-2xl font-bold text-primary">Access your registry account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in or create an account to register your business.</p>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin"><SignInForm onSuccess={() => navigate({ to: "/dashboard" })} /></TabsContent>
            <TabsContent value="signup"><SignUpForm onSuccess={() => navigate({ to: "/dashboard" })} /></TabsContent>
          </Tabs>
          <div className="mt-6 border-t border-border pt-4 text-center">
            <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Administrator? Sign in to the Admin Console
            </Link>
          </div>
        </div>
        <DemoAdminPanel onUse={(email) => { void email; }} />
      </section>
      <SiteFooter />
    </div>
  );
}

const DEMO_ADMINS = [
  { label: "LGA Moderator", email: "lga@demo.taraba.gov.ng" },
  { label: "State Admin", email: "state@demo.taraba.gov.ng" },
  { label: "Super Admin", email: "super@demo.taraba.gov.ng" },
];
const DEMO_PASSWORD = "Demo!Taraba2026";

function DemoAdminPanel({ onUse }: { onUse: (email: string) => void }) {
  const seed = useServerFn(seedDemoAdmins);
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState(false);

  async function handleSeed() {
    setBusy(true);
    try {
      await seed();
      setSeeded(true);
      toast.success("Demo admin accounts ready");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to seed");
    } finally { setBusy(false); }
  }

  async function quickLogin(email: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
    if (error) return toast.error(error.message + " — click 'Provision' first");
    toast.success("Signed in");
    onUse(email);
    window.location.href = "/admin";
  }

  return (
    <div className="mt-6 w-full max-w-md rounded-3xl border border-dashed border-primary/30 bg-secondary/40 p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-primary">Demo Admin Access</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Provision demo accounts to preview the LGA Moderator, State Admin and Super Admin dashboards.
      </p>
      <Button onClick={handleSeed} disabled={busy} size="sm" className="mt-3 w-full bg-primary hover:bg-primary-deep">
        <Sparkles className="mr-2 h-4 w-4" />
        {busy ? "Provisioning…" : seeded ? "Re-provision demo accounts" : "Provision demo admin accounts"}
      </Button>
      <div className="mt-4 space-y-2">
        {DEMO_ADMINS.map((a) => (
          <div key={a.email} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-foreground">{a.label}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{a.email}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(a.email); toast.success("Email copied"); }} aria-label="Copy email">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" className="h-7" onClick={() => quickLogin(a.email)}>Sign in</Button>
              </div>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-xl bg-background p-2.5 font-mono text-[11px]">
          <span className="text-muted-foreground">Password:</span>
          <span className="font-semibold text-foreground">{DEMO_PASSWORD}</span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(DEMO_PASSWORD); toast.success("Password copied"); }} aria-label="Copy password">
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    onSuccess();
  }
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary-deep">{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.object({
      fullName: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(255),
      phone: z.string().trim().min(7).max(30),
      password: z.string().min(8).max(72),
    }).safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.fullName, phone: form.phone },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    onSuccess();
  }
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div><Label htmlFor="fn">Full name</Label><Input id="fn" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
      <div><Label htmlFor="em">Email</Label><Input id="em" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div><Label htmlFor="ph">Phone</Label><Input id="ph" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
      <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary-deep">{busy ? "Creating…" : "Create account"}</Button>
    </form>
  );
}
