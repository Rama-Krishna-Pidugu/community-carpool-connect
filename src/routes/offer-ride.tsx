import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Car, FileCheck, IdCard, ShieldCheck, Users, Clock, Calendar, MapPin } from "lucide-react";
import { useState } from "react";
import verifiedImg from "@/assets/verified-driver.png";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/offer-ride")({
  head: () => ({ meta: [{ title: "Offer a Ride — Neighbourly" }, { name: "description", content: "Offer empty seats to verified neighbours and help build a greener community." }] }),
  component: OfferRide,
});

function OfferRide() {
  const user = useAppStore((s) => s.user);
  const navigate = useNavigate();

  if (!user) {
    navigate({ to: "/auth" });
    return null;
  }

  if (user.driverStatus !== "verified") {
    return <BecomeDriver status={user.driverStatus} />;
  }

  return <OfferForm />;
}

function BecomeDriver({ status }: { status: "none" | "pending" | "rejected" }) {
  return (
    <div>
      <section className="bg-gradient-to-br from-primary-soft via-background to-secondary-soft">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
              <BadgeCheck className="h-3.5 w-3.5 text-secondary" /> Verification required
            </span>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Become a Verified Driver</h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Complete verification to start offering rides and help build a trusted community.
            </p>
            {status !== "none" && (
              <div>
                <StatusBadge status={status} />
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/verification">{status === "pending" ? "View status" : "Start verification"} <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline"><Link to="/find-ride">Find a ride instead</Link></Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-secondary/10 to-primary/10 blur-2xl" />
            <img src={verifiedImg} alt="Verified driver" width={1024} height={1024} loading="lazy" className="mx-auto w-full max-w-md drop-shadow-xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Why verification?</h2>
        <p className="mt-2 text-muted-foreground">A quick check that keeps every ride safe.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: IdCard, title: "Verified identity", desc: "We confirm every driver's real identity." },
            { icon: FileCheck, title: "Valid driving license", desc: "Only licensed drivers can offer rides." },
            { icon: Car, title: "Registered vehicle", desc: "RC and vehicle details are checked." },
            { icon: Users, title: "Safer community", desc: "Passengers know every driver is trusted." },
          ].map((c) => (
            <Card key={c.title} className="transition-shadow hover:shadow-[var(--shadow-hover)]">
              <CardContent className="space-y-2 p-5">
                <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-secondary-soft text-secondary"><c.icon className="h-5 w-5" /></span>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Required documents</h2>
              <p className="mt-2 text-muted-foreground">Keep these handy before starting.</p>
              <ul className="mt-6 space-y-3">
                {["Driving license (front & back)", "Vehicle registration certificate (RC)", "Government ID (Aadhaar/Passport/Voter ID)", "Vehicle details & selfie", "Vehicle insurance (optional)"].map((d) => (
                  <li key={d} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                    <span className="text-sm">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">The process</h2>
              <p className="mt-2 text-muted-foreground">Three simple steps.</p>
              <ol className="mt-6 space-y-4">
                {[
                  { n: 1, title: "Upload your documents", desc: "Fill in the form and upload clear photos." },
                  { n: 2, title: "Admin reviews your submission", desc: "Typically approved within 24-48 hours." },
                  { n: 3, title: "Start offering rides", desc: "Once approved, publish your first ride." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4 rounded-xl border border-border bg-background p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-semibold">{s.n}</span>
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button asChild size="lg" className="mt-6 gap-2">
                <Link to="/verification">Start verification <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function OfferForm() {
  const publishRide = useAppStore((s) => s.publishRide);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickup: "", destination: "", date: "", time: "",
    vehicle: "", seats: 3, price: 60,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    publishRide(form);
    toast.success("Ride published!");
    navigate({ to: "/bookings" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold">Offer a ride</h1>
        <p className="mt-1 text-muted-foreground">Share your route with neighbours going your way.</p>
      </div>
      <Card className="mt-6">
        <CardContent className="p-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="pickup">Pickup</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input id="pickup" required value={form.pickup} onChange={(e) => set("pickup", e.target.value)} className="pl-9" placeholder="Green Park Colony" />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                <Input id="destination" required value={form.destination} onChange={(e) => set("destination", e.target.value)} className="pl-9" placeholder="Tech Park" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="date" type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="time" type="time" required value={form.time} onChange={(e) => set("time", e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input id="vehicle" required value={form.vehicle} onChange={(e) => set("vehicle", e.target.value)} placeholder="Honda City · White · KA 05 MJ 4421" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seats">Available seats</Label>
              <Select value={String(form.seats)} onValueChange={(v) => set("seats", Number(v))}>
                <SelectTrigger id="seats"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n} seat{n > 1 ? "s" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price per seat (₹)</Label>
              <Input id="price" type="number" min={0} required value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" className="w-full sm:w-auto">Publish ride</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
