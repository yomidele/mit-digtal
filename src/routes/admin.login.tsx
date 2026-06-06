import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Copy, ShieldCheck, Sparkles, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { seedDemoAdmins } from "@/lib/seed.functions";
import { getMyRoles } from "@/lib/admin.functions";
import crest from "@/assets/taraba-crest.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Made-in-Taraba Registry" },
      { name: "description", content: "Secure sign-in for LGA moderators, state administrators and super admins of the Made-in-Taraba Digital Registry." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

const DEMO_ADMINS = [
  { label: "LGA Moderator", email: "lga@demo.taraba.gov.ng", role: "Local Government oversight" },
  { label: "State Admin", email: "state@demo.taraba.gov.ng", role: "Statewide administration" },
  { label: "Super Admin", email: "super@demo.taraba.gov.ng", role: "Platform owner" },
];
const DEMO_PASSWORD = "Demo!Taraba2026";

function AdminLoginPage() {
  const navigate = useNavigate();
  const fetchRoles = useServerFn(getMyRoles);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled || !data.user) return;
      try {
        const roles = await fetchRoles();
        const hasAdmin = (roles ?? []).some((r) =>
          ["lga_moderator", "state_admin", "super_admin"].includes(r.role),
        );
        navigate({ to: hasAdmin ? "/admin" : "/dashboard", replace: true });
      } catch {
        /* ignore */
      }
    })();
    return () => { cancelled = true; };
  }, [navigate, fetchRoles]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1f12] text-white">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #d4a017 1px, transparent 1px), radial-gradient(circle at 80% 60%, #d4a017 1px, transparent 1px)",
            backgroundSize: "48px 48px, 64px 64px",
          }}
        />
      </div>
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-[#1a4d2e] blur-3xl opacity-50" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-[#d4a017] blur-3xl opacity-10" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="border-b border-white/10">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={crest} alt="Taraba State" width={36} height={36} className="h-9 w-9 object-contain" />
              <div className="leading-tight">
                <div className="text-sm font-bold text-white">Made-in-Taraba</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#f5c842]">Admin Console</div>
              </div>
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-[#f5c842]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
          <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left — branding */}
            <div className="hidden flex-col justify-center lg:flex">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f5c842]/30 bg-[#f5c842]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#f5c842]">
                <ShieldCheck className="h-3.5 w-3.5" /> Restricted access
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight">
                Sign in to the <span className="text-[#f5c842]">Admin Console</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                For authorised LGA moderators, state administrators and super admins of the
                Made-in-Taraba Digital Registry. All sign-in attempts are logged and audited.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/80">
                {[
                  "Review and approve business submissions",
                  "Manage state-wide directory & user roles",
                  "Access verification & moderation tools",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5c842]/20 text-[#f5c842]">✓</div>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">
                  Are you a business owner? <Link to="/auth" className="font-semibold text-[#f5c842] hover:underline">Use the business sign-in</Link> instead.
                </p>
              </div>
            </div>

            {/* Right — card */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm shadow-2xl sm:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5c842] text-[#0a1f12]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold text-white">Administrator sign in</h2>
                    <p className="text-xs text-white/60">Use your registry admin credentials</p>
                  </div>
                </div>
                <AdminSignInForm onSuccess={() => navigate({ to: "/admin", replace: true })} />

                <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-white/40">
                  <div className="h-px flex-1 bg-white/10" />
                  <span>Demo access</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <DemoAdminPanel />

                <p className="mt-6 text-center text-[11px] text-white/40">
                  Lost access? Contact <a href="mailto:registry@taraba.gov.ng" className="text-[#f5c842] hover:underline">registry@taraba.gov.ng</a>
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-white/10">
          <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-white/40 sm:flex-row">
            <div>© {new Date().getFullYear()} Government of Taraba State</div>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-[#f5c842]">Privacy</Link>
              <Link to="/terms" className="hover:text-[#f5c842]">Terms</Link>
              <Link to="/help" className="hover:text-[#f5c842]">Help</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function AdminSignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const fetchRoles = useServerFn(getMyRoles);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      return toast.error(error.message);
    }
    try {
      const roles = await fetchRoles();
      const hasAdmin = (roles ?? []).some((r) =>
        ["lga_moderator", "state_admin", "super_admin"].includes(r.role),
      );
      if (!hasAdmin) {
        await supabase.auth.signOut();
        setBusy(false);
        return toast.error("This account does not have admin access.");
      }
      toast.success("Welcome back");
      onSuccess();
    } catch (err: any) {
      setBusy(false);
      toast.error(err?.message ?? "Sign-in failed");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="admin-email" className="text-xs font-medium text-white/80">Email</Label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-[#f5c842]"
          placeholder="you@taraba.gov.ng"
        />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="admin-pw" className="text-xs font-medium text-white/80">Password</Label>
        </div>
        <div className="relative mt-1.5">
          <Input
            id="admin-pw"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-white/10 bg-white/5 pr-10 text-white placeholder:text-white/30 focus-visible:ring-[#f5c842]"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 hover:text-white"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        disabled={busy}
        className="w-full bg-[#f5c842] font-semibold text-[#0a1f12] hover:bg-[#e6b833]"
      >
        {busy ? "Signing in…" : "Sign in to console"}
      </Button>
    </form>
  );
}

function DemoAdminPanel() {
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
    window.location.href = "/admin";
  }

  return (
    <div className="rounded-xl border border-[#f5c842]/20 bg-[#f5c842]/[0.04] p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#f5c842]" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#f5c842]">Preview demo dashboards</h3>
      </div>
      <p className="mt-1 text-[11px] text-white/60">
        Provision sample accounts to explore each admin role.
      </p>
      <Button
        onClick={handleSeed}
        disabled={busy}
        size="sm"
        className="mt-3 w-full bg-white/10 text-white hover:bg-white/20"
      >
        {busy ? "Provisioning…" : seeded ? "Re-provision accounts" : "Provision demo accounts"}
      </Button>
      <div className="mt-3 space-y-2">
        {DEMO_ADMINS.map((a) => (
          <div key={a.email} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-white">{a.label}</div>
                <div className="truncate font-mono text-[10px] text-white/50">{a.email}</div>
              </div>
              <Button
                size="sm"
                onClick={() => quickLogin(a.email)}
                className="h-7 bg-[#f5c842]/20 px-2 text-[11px] text-[#f5c842] hover:bg-[#f5c842]/30"
              >
                Open
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-lg bg-black/30 px-2.5 py-1.5 font-mono text-[10px]">
          <span className="text-white/50">Password:</span>
          <span className="font-semibold text-white/90">{DEMO_PASSWORD}</span>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(DEMO_PASSWORD); toast.success("Password copied"); }}
            className="rounded p-1 text-white/50 hover:text-[#f5c842]"
            aria-label="Copy password"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
