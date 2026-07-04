import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BadgeCheck, Car, Mail, Phone, Star, Users, Wallet, Leaf } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Neighbourly" }, { name: "description", content: "Your Neighbourly profile, driver verification and ride history." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAppStore((s) => s.user);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const refreshProfile = useAppStore((s) => s.refreshProfile);
  const bookings = useAppStore((s) => s.bookings);
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  if (!user) { navigate({ to: "/auth" }); return null; }

  const save = () => {
    updateProfile(form);
    toast.success("Profile updated");
    setEdit(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 sm:flex sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4 sm:contents">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 sm:flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-bold">{user.name}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                    <Star className="h-3 w-3 fill-accent" />{user.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{user.email}</span>
                  <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{user.phone}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Member since {user.joinedAt}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setEdit(true)} className="col-span-2 sm:col-auto">Edit profile</Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Driver verification</h2>
                <p className="text-sm text-muted-foreground">Verify to start offering rides.</p>
              </div>
              <StatusBadge status={user.driverStatus === "none" ? "none" : user.driverStatus} />
            </div>
            <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm">
              {user.driverStatus === "none" && <p>You're set up as a passenger. Complete verification to offer rides.</p>}
              {user.driverStatus === "pending" && <p>Your documents are under review. Estimated time: 24-48 hours.</p>}
              {user.driverStatus === "verified" && <p className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-secondary" />You're a verified driver. Publish rides anytime.</p>}
              {user.driverStatus === "rejected" && <p className="text-destructive">Your submission was rejected. Please resubmit with valid documents.</p>}
            </div>
            {user.driverStatus !== "verified" && (
              <Button asChild className="mt-4"><Link to="/verification">{user.driverStatus === "none" ? "Start verification" : "View verification"}</Link></Button>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
          <StatCard icon={Car} tone="primary" label="Rides taken" value={String(user.ridesTaken)} />
          <StatCard icon={Users} tone="secondary" label="Rides offered" value={String(user.ridesOffered)} />
          <StatCard icon={Wallet} tone="accent" label="Money saved" value={`₹${user.moneySaved || 0}`} />
          <StatCard icon={Leaf} tone="secondary" label="CO₂ saved" value={`${user.co2Saved || 0}kg`} />
        </div>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="font-semibold">Ride history</h2>
          <div className="mt-4 divide-y divide-border">
            {bookings.slice(0, 6).map((b) => (
              <div key={b.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{b.ride.pickup} → {b.ride.destination}</p>
                  <p className="text-xs text-muted-foreground">{b.ride.date} · with {b.ride.driverName}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Full name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(false)}>Cancel</Button>
            <Button onClick={save}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
