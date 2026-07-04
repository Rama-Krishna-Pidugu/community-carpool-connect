import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import type { Booking } from "@/lib/mock-data";
import emptyImg from "@/assets/empty-state.png";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "My Bookings — Neighbourly" }, { name: "description", content: "Track your upcoming, past and cancelled ride bookings." }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const bookings = useAppStore((s) => s.bookings);
  const cancelBooking = useAppStore((s) => s.cancelBooking);
  const refreshProfile = useAppStore((s) => s.refreshProfile);
  
  const [detail, setDetail] = useState<Booking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const groups = {
    upcoming: bookings.filter((b) => b.status === "upcoming"),
    past: bookings.filter((b) => b.status === "past"),
    cancelled: bookings.filter((b) => b.status === "cancelled"),
  };

  const handleCancel = () => {
    if (!confirmCancel) return;
    cancelBooking(confirmCancel);
    toast.success("Booking cancelled");
    setConfirmCancel(null);
    setDetail(null);
  };

  const renderList = (list: Booking[]) => list.length === 0 ? (
    <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
      <img src={emptyImg} alt="" width={200} height={160} loading="lazy" className="opacity-70" />
      <h3 className="text-lg font-semibold">Nothing here yet</h3>
      <p className="text-sm text-muted-foreground">Your bookings will appear here.</p>
      <Button asChild size="sm" className="mt-2"><Link to="/find-ride">Find a ride</Link></Button>
    </CardContent></Card>
  ) : (
    <div className="grid gap-4">
      {list.map((b) => (
        <Card key={b.id} className="transition-shadow hover:shadow-[var(--shadow-hover)]">
          <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5 md:grid-cols-[auto_minmax(0,1fr)_auto]">
            <Avatar className="hidden h-12 w-12 md:block"><AvatarImage src={b.ride.driverAvatar} /><AvatarFallback>{b.ride.driverName[0]}</AvatarFallback></Avatar>
            <div className="min-w-0 space-y-1">
              <p className="truncate font-semibold">{b.ride.pickup} → {b.ride.destination}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>with {b.ride.driverName}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{b.ride.date}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{b.ride.time}</span>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-bold text-primary">₹{b.ride.price}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setDetail(b)}>View details</Button>
                {b.status === "upcoming" && <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmCancel(b.id)}>Cancel</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">My bookings</h1>
      <p className="mt-1 text-muted-foreground">Manage your upcoming, past and cancelled rides.</p>

      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({groups.upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({groups.past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({groups.cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">{renderList(groups.upcoming)}</TabsContent>
        <TabsContent value="past" className="mt-4">{renderList(groups.past)}</TabsContent>
        <TabsContent value="cancelled" className="mt-4">{renderList(groups.cancelled)}</TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>Full information for this ride.</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12"><AvatarImage src={detail.ride.driverAvatar} /><AvatarFallback>{detail.ride.driverName[0]}</AvatarFallback></Avatar>
                <div>
                  <p className="font-semibold">{detail.ride.driverName}</p>
                  <p className="text-xs text-muted-foreground">{detail.ride.vehicle}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-sm">
                <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /><div><p className="text-xs text-muted-foreground">Pickup</p><p className="font-medium">{detail.ride.pickup}</p></div></div>
                <div className="mt-3 flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-accent" /><div><p className="text-xs text-muted-foreground">Destination</p><p className="font-medium">{detail.ride.destination}</p></div></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted-foreground">Date</p><p className="font-semibold">{detail.ride.date}</p></div>
                <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted-foreground">Time</p><p className="font-semibold">{detail.ride.time}</p></div>
                <div className="rounded-lg bg-surface p-3"><p className="text-xs text-muted-foreground">Seats</p><p className="font-semibold inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{detail.ride.seats}</p></div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-primary-soft p-4"><span className="text-sm font-medium">Total paid</span><span className="text-xl font-bold text-primary">₹{detail.ride.price}</span></div>
            </div>
          )}
          <DialogFooter>
            {detail?.status === "upcoming" && <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirmCancel(detail.id)}>Cancel booking</Button>}
            <Button onClick={() => setDetail(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmCancel} onOpenChange={(o) => !o && setConfirmCancel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>The seat will be released and cannot be recovered.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(null)}>Keep booking</Button>
            <Button variant="destructive" onClick={handleCancel}>Cancel booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
