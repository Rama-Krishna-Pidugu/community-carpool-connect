import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ride } from "@/lib/mock-data";
import emptyImg from "@/assets/empty-state.png";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/find-ride")({
  head: () => ({ meta: [{ title: "Find a Ride — Neighbourly" }, { name: "description", content: "Search verified rides in your neighbourhood and book a seat in under a minute." }] }),
  component: FindRide,
});

function FindRide() {
  const bookRide = useAppStore((s) => s.bookRide);
  const user = useAppStore((s) => s.user);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selected, setSelected] = useState<Ride | null>(null);
  const [results, setResults] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  useEffect(() => {
    if (selected && user) {
      apiFetch("/rewards/my-coupons")
        .then((data: any) => {
          setCoupons(data.available || []);
          setSelectedCoupon(null);
        })
        .catch(() => {
          setCoupons([]);
        });
    }
  }, [selected, user]);

  const fetchRides = async (pVal = "", dVal = "") => {
    try {
      setLoading(true);
      let url = "/rides";
      const params = new URLSearchParams();
      if (pVal.trim()) params.append("origin", pVal.trim());
      if (dVal.trim()) params.append("destination", dVal.trim());

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const data = await apiFetch(url);

      // Map backend schema to frontend Ride schema
      const mapped = data.map((r: any) => {
        const depTime = new Date(r.departure_time);
        const dateStr = depTime.toLocaleDateString("en-IN", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-");
        const timeStr = depTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

        return {
          id: r.ride_id,
          driverId: r.driver_id,
          driverName: r.driver_name || "Verified Driver",
          driverAvatar: r.driver_avatar || undefined,
          rating: r.rating || 4.9,
          vehicle: r.vehicle_info || "Verified Vehicle",
          pickup: r.pickup_address,
          destination: r.destination_address,
          date: dateStr,
          time: timeStr,
          seats: r.available_seats,
          price: r.price_per_seat,
          verified: true
        };
      });

      // Filter by date client-side if selected
      const filtered = date ? mapped.filter((r: any) => r.date === date) : mapped;
      setResults(filtered);
    } catch (err) {
      toast.error("Failed to retrieve matching rides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [date]); // Re-fetch or filter when date changes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRides(pickup, destination);
  };

  const handleBook = async () => {
    if (!selected) return;
    if (!user) { toast.error("Please sign in to book a ride."); return; }
    try {
      await bookRide(selected, selectedCoupon?.coupon_code);
      toast.success("Ride booked! See it in My Bookings.");
      setSelected(null);
    } catch (err) {
      toast.error("Failed to book this ride. Check if you already booked it.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold">Find a ride</h1>
        <p className="mt-1 text-muted-foreground">Search verified rides in your neighbourhood.</p>
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
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
            <Button type="submit" disabled={loading} size="lg" className="gap-2">
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
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
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-border bg-surface p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Driver</span><span className="font-medium">{selected.driverName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="text-right font-medium">{selected.pickup} → {selected.destination}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date &amp; time</span><span className="font-medium">{selected.date} · {selected.time}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{selected.vehicle}</span></div>

                {selectedCoupon && (
                  <div className="flex justify-between text-xs text-emerald-600 font-medium">
                    <span>Discount ({selectedCoupon.discount_value}%)</span>
                    <span>-₹{(selected.price * selectedCoupon.discount_value / 100).toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary">
                    ₹{selectedCoupon ? (selected.price - (selected.price * selectedCoupon.discount_value / 100)).toFixed(0) : selected.price}
                  </span>
                </div>
              </div>

              {/* Coupon Selection */}
              {coupons.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="coupon-select" className="text-xs font-bold text-slate-700">Apply Reward Coupon</Label>
                  <Select
                    value={selectedCoupon?.coupon_code || "none"}
                    onValueChange={(val) => {
                      if (val === "none") {
                        setSelectedCoupon(null);
                      } else {
                        const cop = coupons.find(c => c.coupon_code === val);
                        setSelectedCoupon(cop || null);
                      }
                    }}
                  >
                    <SelectTrigger id="coupon-select" className="w-full">
                      <SelectValue placeholder="Select a coupon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Do not apply coupon</SelectItem>
                      {coupons.map((c) => (
                        <SelectItem key={c.id} value={c.coupon_code}>
                          🎁 {c.coupon_code} - {c.discount_value}% OFF (Expires {c.expiry_date})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
