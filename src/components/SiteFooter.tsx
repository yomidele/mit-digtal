import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import crest from "@/assets/taraba-crest.png";

export function SiteFooter() {
  return (
    <footer className="bg-[#0d2e1a] text-white/80">
      <div className="container mx-auto px-4 pt-10 pb-6 sm:pt-14">
        {/* Brand */}
        <div className="mb-8 flex items-start gap-3 sm:mb-10">
          <img src={crest} alt="Taraba State" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" loading="lazy" />
          <div className="min-w-0">
            <div className="font-display text-sm font-bold leading-tight text-white">Made-in-Taraba Registry</div>
            <div className="text-[11px] text-[#f5c842]/80">Official Digital Business Directory</div>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-white/60 sm:text-sm">
              The official registry of businesses, products and services driving Taraba State's economy forward.
            </p>
          </div>
        </div>

        {/* Link columns — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <FooterCol title="Platform" links={[
            { to: "/", label: "Home" },
            { to: "/directory", label: "Directory" },
            { to: "/about", label: "About" },
            { to: "/auth", label: "Register", search: { mode: "signup" as const } },
          ]} />

          <FooterCol title="Government" links={[
            { href: "https://taraba.gov.ng", label: "Taraba State" },
            { href: "https://taraba.gov.ng", label: "Commerce & Industry" },
            { href: "https://taraba.gov.ng", label: "Investment Agency" },
            { href: "https://taraba.gov.ng", label: "Bureau of Statistics" },
          ]} />

          <FooterCol title="Support" links={[
            { to: "/help", label: "Help Center" },
            { to: "/registration-guide", label: "Registration Guide" },
            { to: "/admin/login", label: "Admin Login" },
            { to: "/privacy", label: "Privacy Policy" },
            { to: "/terms", label: "Terms of Use" },
          ]} />

          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#f5c842]">Contact</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2 text-white/70">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f5c842]" />
                <span>Jalingo, Taraba State</span>
              </li>
              <li className="flex items-start gap-2 text-white/70">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f5c842]" />
                <a href="mailto:registry@taraba.gov.ng" className="break-all hover:text-[#f5c842]">registry@taraba.gov.ng</a>
              </li>
              <li className="flex items-start gap-2 text-white/70">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#f5c842]" />
                <a href="tel:+2348000000000" className="hover:text-[#f5c842]">+234 800 000 0000</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-[11px] text-white/60 sm:flex-row sm:text-xs">
          <div className="text-center sm:text-left">© {new Date().getFullYear()} Government of Taraba State</div>
          <div>Jalingo · Taraba · Nigeria</div>
        </div>
      </div>
    </footer>
  );
}

type FooterLink =
  | { to: "/" | "/directory" | "/about" | "/help" | "/registration-guide" | "/privacy" | "/terms"; label: string; search?: undefined }
  | { to: "/auth"; label: string; search: { mode: "signup" | "login" } }
  | { href: string; label: string };

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#f5c842]">{title}</h4>
      <ul className="space-y-2.5 text-xs sm:text-sm">
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
