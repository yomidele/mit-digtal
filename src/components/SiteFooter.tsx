import { Link } from "@tanstack/react-router";
import crest from "@/assets/taraba-crest.png";

export function SiteFooter() {
  return (
    <footer className="bg-[#0d2e1a] text-white/80">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={crest} alt="Taraba State" width={44} height={44} className="h-11 w-11 object-contain" loading="lazy" />
            <div>
              <div className="font-display text-sm font-bold text-white">Made-in-Taraba Registry</div>
              <div className="text-[11px] text-[#f5c842]/80">Official Digital Business Directory</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            The official registry of businesses, products, and services driving Taraba State's economy forward.
          </p>
        </div>

        <FooterCol title="Platform" links={[
          { to: "/", label: "Home" },
          { to: "/directory", label: "Business Directory" },
          { to: "/about", label: "About the Registry" },
          { to: "/auth", label: "Sign in / Register", search: { mode: "signup" as const } },
        ]} />

        <FooterCol title="Government" links={[
          { href: "https://taraba.gov.ng", label: "Taraba State Government" },
          { href: "https://taraba.gov.ng", label: "Ministry of Commerce & Industry" },
          { href: "https://taraba.gov.ng", label: "Investment Promotion Agency" },
          { href: "https://taraba.gov.ng", label: "Bureau of Statistics" },
        ]} />

        <FooterCol title="Support" links={[
          { to: "/about", label: "Help Center" },
          { to: "/about", label: "Registration Guide" },
          { to: "/about", label: "Privacy Policy" },
          { to: "/about", label: "Terms of Use" },
        ]} />
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row">
          <div>© {new Date().getFullYear()} Government of Taraba State. All rights reserved.</div>
          <div>Jalingo · Taraba State · Nigeria</div>
        </div>
      </div>
    </footer>
  );
}

type FooterLink =
  | { to: "/" | "/directory" | "/about"; label: string; search?: undefined }
  | { to: "/auth"; label: string; search: { mode: "signup" | "login" } }
  | { href: string; label: string };

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#f5c842]">{title}</h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((l, i) => (
          <li key={i}>
            {"href" in l ? (
              <a href={l.href} target="_blank" rel="noreferrer" className="text-white/70 transition hover:text-[#f5c842]">{l.label}</a>
            ) : l.to === "/auth" ? (
              <Link to="/auth" search={l.search} className="text-white/70 transition hover:text-[#f5c842]">{l.label}</Link>
            ) : (
              <Link to={l.to} className="text-white/70 transition hover:text-[#f5c842]">{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
