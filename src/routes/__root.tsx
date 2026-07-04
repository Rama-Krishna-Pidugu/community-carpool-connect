import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Car, Calendar, ShieldAlert } from "lucide-react";

import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Toaster } from "../components/ui/sonner";
import { useAppStore } from "../lib/store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Please try again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Try again</button>
          <a href="/" className="rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent-soft">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function BottomNav() {
  const user = useAppStore((s) => s.user);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!user || pathname === "/auth" || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur border-t border-border/60 md:hidden flex items-center justify-around px-4 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] pb-safe">
      <Link 
        to="/find-ride" 
        className="flex flex-col items-center justify-center w-20 h-full text-muted-foreground transition-colors hover:text-primary"
        activeProps={{ className: "flex flex-col items-center justify-center w-20 h-full text-primary font-semibold" }}
      >
        <Search className="h-5 w-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Find Ride</span>
      </Link>
      <Link 
        to="/offer-ride" 
        className="flex flex-col items-center justify-center w-20 h-full text-muted-foreground transition-colors hover:text-primary"
        activeProps={{ className: "flex flex-col items-center justify-center w-20 h-full text-primary font-semibold" }}
      >
        <Car className="h-5 w-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Offer Ride</span>
      </Link>
      <Link 
        to="/bookings" 
        className="flex flex-col items-center justify-center w-20 h-full text-muted-foreground transition-colors hover:text-primary"
        activeProps={{ className: "flex flex-col items-center justify-center w-20 h-full text-primary font-semibold" }}
      >
        <Calendar className="h-5 w-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">My Bookings</span>
      </Link>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (user && user.role === "ADMIN" && isMobile) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <div className="max-w-md space-y-5">
            <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Desktop Screen Required</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Admin Dashboard is optimized for larger displays and is not accessible on mobile screens. Please log in on a desktop computer.
            </p>
            <button 
              onClick={() => logout()} 
              className="inline-flex h-10 items-center justify-center rounded-xl bg-destructive px-5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background pb-16 md:pb-0">
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
        <BottomNav />
        <Footer />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}