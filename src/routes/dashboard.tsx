import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Car, Leaf, MapPin, Search, TrendingUp, Users, Wallet } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { RideCard } from "@/components/RideCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Neighbourly" }, { name: "description", content: "Your Neighbourly dashboard: upcoming rides, quick search, and stats." }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useAppStore((s) => s.user);
  const refreshProfile = useAppStore((s) => s.refreshProfile);
  const bookings = useAppStore((s) => s.bookings);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth" });
    } else {
      refreshProfile();
    }
  }, [user, navigate, refreshProfile]);

  if (!user) return null;

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const recent = bookings.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="truncate text-3xl font-bold">{user.name.split(" ")[0]} 👋</h1>
        </div>
        <StatusBadge status={user.driverStatus === "none" ? "none" : user.driverStatus} label={user.driverStatus === "none" ? "Passenger" : undefined} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Car} tone="primary" label="Rides taken" value={String(user.ridesTaken)} />
        <StatCard icon={Users} tone="secondary" label="Rides offered" value={String(user.ridesOffered)} />
        <StatCard icon={Wallet} tone="accent" label="Money saved" value={`₹${user.ridesTaken * 45}`} />
        <StatCard icon={Leaf} tone="secondary" label="CO₂ saved" value={`${user.ridesTaken * 2}kg`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Search className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-semibold">Find your next ride</h2>
                <p className="text-sm text-muted-foreground">Search rides going your way in seconds.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2"><Link to="/find-ride"><MapPin className="h-4 w-4" />Search rides</Link></Button>
              <Button asChild size="lg" variant="outline" className="gap-2"><Link to="/offer-ride"><Car className="h-4 w-4" />Offer a ride</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 p-6">
            <span className="inline-grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent"><TrendingUp className="h-5 w-5" /></span>
            <h2 className="text-lg font-semibold">This week</h2>
            <p className="text-3xl font-bold">{upcoming.length}</p>
            <p className="text-sm text-muted-foreground">upcoming rides scheduled</p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming rides</h2>
          <Button asChild variant="ghost" size="sm"><Link to="/bookings">View all</Link></Button>
        </div>
        {upcoming.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No upcoming rides. <Link to="/find-ride" className="font-medium text-primary hover:underline">Find one now</Link>.</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {upcoming.map((b) => <RideCard key={b.id} ride={b.ride} />)}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Recent bookings</h2>
        <div className="grid gap-3">
          {recent.map((b) => (
            <Card key={b.id} className="transition-shadow hover:shadow-[var(--shadow-hover)]">
              <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 sm:p-5">
                <div className="min-w-0">
                  <p className="truncate font-medium">{b.ride.pickup} → {b.ride.destination}</p>
                  <p className="text-xs text-muted-foreground">with {b.ride.driverName} · {b.ride.date} · {b.ride.time}</p>
                </div>
                <StatusBadge status={b.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
