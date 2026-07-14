import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Inbox, Building2, Users, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Made-in-Taraba Registry" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  // Query roles directly via the browser client (RLS allows users to read their own roles).
  // This avoids any dependency on server-fn env vars being correctly configured on the host,
  // and always reflects the live database (no JWT-baked claims, no cached state).
  const { data: roles, isLoading } = useQuery({
    queryKey: ["my-roles"],
    staleTime: 0,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("role,assigned_lga")
        .eq("user_id", uid);
      // eslint-disable-next-line no-console
      console.log("[admin] role check", { uid, roles: data, error });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const roleSet = new Set((roles ?? []).map((r) => r.role));
  const isMod = roleSet.has("lga_moderator");
  const isAdmin = roleSet.has("state_admin") || roleSet.has("super_admin");
  const isSuper = roleSet.has("super_admin");
  const allowed = isMod || isAdmin;

  if (isLoading) {
    return <Shell><div className="py-16 text-center text-muted-foreground">Loading…</div></Shell>;
  }
  if (!allowed) {
    return (
      <Shell>
        <div className="mx-auto mt-12 max-w-md rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h2 className="mt-3 font-display text-xl font-bold">Access denied</h2>
          <p className="mt-2 text-sm text-muted-foreground">You need an administrator role to view this area.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm text-primary hover:underline">Back to dashboard</Link>
        </div>
      </Shell>
    );
  }

  const tabs: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/admin/submissions", label: "Submissions", icon: Inbox },
    { to: "/admin/businesses", label: "All businesses", icon: Building2 },
    ...(isSuper ? [{ to: "/admin/users", label: "Users & roles", icon: Users }] : []),
  ];

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Admin Console</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSuper ? "Super administrator" : isAdmin ? "State administrator" : "LGA moderator"} access.
          </p>
        </div>
      </div>
      <nav className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${active ? "border-b-2 border-primary bg-secondary text-primary" : "text-muted-foreground hover:text-primary"}`}
            >
              <Icon className="h-4 w-4" />{t.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6"><Outlet /></div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto max-w-7xl px-4 py-8">{children}</div>
      <SiteFooter />
    </div>
  );
}
