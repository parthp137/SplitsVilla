import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const footerSections = [
  { title: "Support", links: [{ label: "Help Center", to: "#" }, { label: "Safety", to: "#" }, { label: "Cancellation Options", to: "#" }] },
  { title: "Community", links: [{ label: "SplitsVilla Blog", to: "#" }, { label: "Forum", to: "#" }, { label: "Invite Friends", to: "#" }] },
  { title: "Hosting", links: [{ label: "List Your Property", to: "/become-host" }, { label: "Host Resources", to: "#" }, { label: "Responsible Hosting", to: "#" }] },
  { title: "SplitsVilla", links: [{ label: "About Us", to: "#" }, { label: "Careers", to: "#" }, { label: "Press", to: "#" }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-sm font-bold text-foreground">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold text-foreground">
              Splits<span className="text-primary">Villa</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 SplitsVilla, Inc. · Privacy · Terms · Sitemap</p>
        </div>
      </div>
    </footer>
  );
}
