import { Link, useRouterState } from "@tanstack/react-router";
import { Car, Github, Twitter } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Footer() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useAppStore((s) => s.user);
  if (pathname === "/auth" || pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-24 border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/neighbourly_logo_v3_navbar.svg" alt="Neighbourly Logo" className="h-9 w-auto" />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A trusted carpooling platform for neighbourhoods. Share rides, save money, and build a greener community together.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/find-ride" className="hover:text-foreground">Find a ride</Link></li>
            <li><Link to="/offer-ride" className="hover:text-foreground">Offer a ride</Link></li>
            <li><Link to="/bookings" className="hover:text-foreground">My bookings</Link></li>
            {user?.role === "ADMIN" && (
              <li><Link to="/admin" className="hover:text-foreground">Admin dashboard</Link></li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About</li>
            <li>Trust &amp; Safety</li>
            <li>Support</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Neighbourly. Built for a smarter city.</p>
          <div className="flex items-center gap-3">
            <Twitter className="h-4 w-4" />
            <Github className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
