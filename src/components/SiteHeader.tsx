import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, ShieldCheck, LogOut, LayoutDashboard, Home, BookOpen, Info, User } from "lucide-react";
import crest from "@/assets/taraba-crest.png";

export function SiteHeader() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
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
    setOpen(false);
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        {/* Brand — logo only; name is inside the crest */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Made-in-Taraba Digital Registry — Home">
          <img
            src={crest}
            alt="Made-in-Taraba Digital Registry"
            width={44}
            height={44}
            className="h-11 w-11 object-contain drop-shadow-sm"
          />
          <span className="sr-only">Made-in-Taraba Digital Registry</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">Home</Link>
          <Link to="/directory" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">Directory</Link>
          <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-primary [&.active]:text-primary">About</Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="text-primary">
                  <Link to="/admin"><ShieldCheck className="mr-1 h-4 w-4" />Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border hover:bg-secondary" aria-label="View dashboard">
                <Link to="/dashboard"><User className="h-5 w-5 text-primary" /></Link>
              </Button>
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

        {/* Mobile — primary CTA + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {user ? (
            <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border" aria-label="View dashboard">
              <Link to="/dashboard"><User className="h-5 w-5 text-primary" /></Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="h-9 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary-deep">
              <Link to="/auth" search={{ mode: "signup" }}>Register</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex items-center gap-3 border-b border-border bg-primary/5 p-5">
                <img src={crest} alt="" width={48} height={48} className="h-12 w-12 object-contain" />
                <div className="leading-tight">
                  <div className="font-display text-sm font-bold text-primary">Made-in-Taraba</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Digital Registry</div>
                </div>
              </div>
              <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle></SheetHeader>
              <nav className="flex flex-col p-3">
                <MobileLink to="/" icon={Home} onClick={() => setOpen(false)}>Home</MobileLink>
                <MobileLink to="/directory" icon={BookOpen} onClick={() => setOpen(false)}>Directory</MobileLink>
                <MobileLink to="/about" icon={Info} onClick={() => setOpen(false)}>About</MobileLink>
                {user && (
                  <>
                    <div className="my-2 border-t border-border" />
                    <MobileLink to="/dashboard" icon={LayoutDashboard} onClick={() => setOpen(false)}>Dashboard</MobileLink>
                    {isAdmin && (
                      <MobileLink to="/admin" icon={ShieldCheck} onClick={() => setOpen(false)}>Admin Console</MobileLink>
                    )}
                  </>
                )}
              </nav>
              <div className="absolute inset-x-0 bottom-0 border-t border-border p-3">
                {user ? (
                  <Button onClick={signOut} variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-primary hover:bg-primary-deep" onClick={() => setOpen(false)}>
                    <Link to="/auth">Sign in</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileLink({ to, icon: Icon, onClick, children }: { to: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-primary [&.active]:bg-secondary [&.active]:text-primary"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}
