import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import crest from "@/assets/taraba-crest.png";

export function SiteHeader() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async (uid: string | null) => {
      if (!uid) { setIsAdmin(false); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      const set = new Set((data ?? []).map((r) => r.role));
      setIsAdmin(set.has("lga_moderator") || set.has("state_admin") || set.has("super_admin"));
    };
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ? { id: data.user.id } : null;
      setUser(u); load(u?.id ?? null);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ? { id: session.user.id } : null;
      setUser(u); load(u?.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={crest} alt="Taraba State crest" width={40} height={40} className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-primary">Made-in-Taraba</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Digital Registry</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">Home</Link>
          <Link to="/directory" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">Directory</Link>
          <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">About</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="text-primary">
                  <Link to="/admin"><ShieldCheck className="mr-1 h-4 w-4" />Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
              <Button onClick={signOut} variant="outline" size="sm">Sign out</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary-deep">
                <Link to="/auth" search={{ mode: "signup" }}>Register Business</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
