import { Link } from "@tanstack/react-router";
import crest from "@/assets/taraba-crest.png";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src={crest} alt="Taraba State" width={48} height={48} className="h-12 w-12 object-contain" loading="lazy" />
            <div>
              <div className="font-display text-base font-bold">Made-in-Taraba Digital Registry</div>
              <div className="text-xs text-sidebar-foreground/70">An initiative of the Taraba State Government</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-sidebar-foreground/80">
            Powering Taraba's economy through digital innovation — the official registry of businesses,
            products, services, and value chain actors in Taraba State, Nigeria.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gold">Platform</h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/80">
            <li><Link to="/directory" className="hover:text-gold">Business Directory</Link></li>
            <li><Link to="/auth" search={{ mode: "signup" }} className="hover:text-gold">Register a Business</Link></li>
            <li><Link to="/about" className="hover:text-gold">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gold">Contact</h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/80">
            <li>Taraba State Secretariat</li>
            <li>Jalingo, Taraba State</li>
            <li>Nigeria</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-sidebar-foreground/60">
          © {new Date().getFullYear()} Government of Taraba State. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
