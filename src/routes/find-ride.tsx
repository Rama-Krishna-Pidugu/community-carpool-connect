import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RideCard } from "@/components/RideCard";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Ride } from "@/lib/mock-data";
import emptyImg from "@/assets/empty-state.png";

export const Route = createFileRoute("/find-ride")({
  head: () => ({ meta: [{ title: "Find a Ride — Neighbourly" }, { name: "description", content: "Search verified rides in your neighbourhood and book a seat in under a minute." }] }),
  component: FindRide,
});

function FindRide() {
  const rides = useAppStore((s) => s.rides);
  const bookRide = useAppStore((s) => s.bookRide);
  const user = useAppStore((s) => s.user);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selected, setSelected] = useState<Ride | null>(null);

  const results = useMemo(() => rides.filter((r) => {
    const p = pickup.trim().toLowerCase();
    const d = destination.trim().toLowerCase();
    if (p && !r.pickup.toLowerCase().includes(p)) return false;
    if (d && !r.destination.toLowerCase().includes(d)) return false;
    if (date && r.date !== date) return false;
    return true;
  }), [rides, pickup, destination, date]);

  const handleBook = () => {
    if (!selected) return;
    if (!user) { toast.error("Please sign in to book a ride."); return; }
    bookRide(selected);
    toast.success("Ride booked! See it in My Bookings.");
    setSelected(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold">Find a ride</h1>
        <p className="mt-1 text-muted-foreground">Search verified rides in your neighbourhood.</p>
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="pickup">Pickup</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input id="pickup" placeholder="e.g. Green Park" value={pickup} onChange={(e) => setPickup(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dest">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                <Input id="dest" placeholder="e.g. Cyber Hub" value={destination} onChange={(e) => setDestination(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-9" />
              </div>
            </div>
            <Button size="lg" className="gap-2"><Search className="h-4 w-4" />Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.length}</span> rides available
        </p>
      </div>

      <div className="mt-4 grid gap-4">
        {results.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <img src={emptyImg} alt="" width={200} height={160} loading="lazy" className="opacity-70" />
            <h3 className="text-lg font-semibold">No rides match your search</h3>
            <p className="text-sm text-muted-foreground">Try widening your dates or removing filters.</p>
          </CardContent></Card>
        ) : (
          results.map((r) => <RideCard key={r.id} ride={r} onBook={setSelected} />)
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
            <DialogDescription>Review the ride details before booking.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 rounded-xl border border-border bg-surface p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Driver</span><span className="font-medium">{selected.driverName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="text-right font-medium">{selected.pickup} → {selected.destination}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date &amp; time</span><span className="font-medium">{selected.date} · {selected.time}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{selected.vehicle}</span></div>
              <div className="flex justify-between border-t border-border pt-3"><span className="text-muted-foreground">Total</span><span className="text-lg font-bold text-primary">₹{selected.price}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleBook}>Confirm booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
