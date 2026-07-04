import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Car, LogOut, Menu, User as UserIcon, Gift } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/find-ride", label: "Find Ride" },
  { to: "/offer-ride", label: "Offer Ride" },
  { to: "/bookings", label: "My Bookings" },
] as const;

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (pathname === "/auth" || pathname.startsWith("/admin")) return null;

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src="/neighbourly_logo_v3_navbar.svg" alt="Neighbourly Logo" className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-semibold text-primary bg-primary-soft" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-card px-1 py-1 pr-3 transition-shadow hover:shadow-[var(--shadow-card)]">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{user.name.split(" ")[0]}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile"><UserIcon className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/rewards"><Gift className="mr-2 h-4 w-4" />My Rewards</Link>
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><Car className="mr-2 h-4 w-4" />Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
              <Button asChild size="sm">
                <Link to="/auth">Get started</Link>
              </Button>
          )}

        </div>
      </div>
    </header>
  );
}
