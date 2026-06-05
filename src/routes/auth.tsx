import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { Copy, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { seedDemoAdmins } from "@/lib/seed.functions";

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
        </div>
      </section>
      <SiteFooter />
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
