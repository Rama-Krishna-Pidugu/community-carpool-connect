import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Car, FileCheck, IdCard, ShieldCheck, Users, Clock, Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import verifiedImg from "@/assets/verified-driver.png";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { StatusBadge } from "@/components/StatusBadge";
import { apiFetch } from "@/lib/api";

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
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdRide, setCreatedRide] = useState<any>(null);

  const [form, setForm] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
    vehicle: "",
    seats: 3,
    price: 60,
  });

  useEffect(() => {
    apiFetch("/driver/vehicles")
      .then((data: any) => {
        setVehicles(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, vehicle: data[0].vehicle_id }));
        }
      })
      .catch(() => {
        toast.error("Failed to load registered vehicles");
      });
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const selectedVehicle = vehicles.find((v) => v.vehicle_id === form.vehicle);
  const maxSeats = selectedVehicle ? selectedVehicle.capacity : 6;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle) {
      toast.error("Please select a vehicle");
      return;
    }

    const departureTime = new Date(`${form.date}T${form.time}`);
    if (departureTime <= new Date()) {
      toast.error("Departure time must be in the future");
      return;
    }

    if (form.seats <= 0 || form.seats > maxSeats) {
      toast.error(`Seats must be between 1 and ${maxSeats}`);
      return;
    }

    if (form.price < 0) {
      toast.error("Price per seat cannot be negative");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiFetch("/rides", {
        method: "POST",
        body: JSON.stringify({
          vehicle_id: form.vehicle,
          pickup_address: form.pickup,
          destination_address: form.destination,
          departure_time: departureTime.toISOString(),
          available_seats: form.seats,
          price_per_seat: form.price,
        }),
      });

      if (res.success) {
        toast.success("Ride created successfully!");
        setCreatedRide(res.ride);
      } else {
        toast.error(res.message || "Failed to create ride");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while creating the ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdRide) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="space-y-6 p-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
              <BadgeCheck className="h-8 w-8" />
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-success">Ride Created Successfully</h1>
              <p className="text-muted-foreground">Your ride has been scheduled and is now visible to passengers.</p>
            </div>
            
            <div className="rounded-xl border border-border bg-surface p-6 text-left space-y-4">
              <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                <span className="font-semibold text-muted-foreground">Pickup:</span>
                <span className="font-medium">{createdRide.pickup_address}</span>
                
                <span className="font-semibold text-muted-foreground">Dropoff:</span>
                <span className="font-medium">{createdRide.destination_address}</span>
                
                <span className="font-semibold text-muted-foreground">Departure:</span>
                <span className="font-medium">
                  {new Date(createdRide.departure_time).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                
                <span className="font-semibold text-muted-foreground">Seats:</span>
                <span className="font-medium">{createdRide.available_seats} seats available</span>
                
                <span className="font-semibold text-muted-foreground">Price:</span>
                <span className="font-medium">₹{createdRide.price_per_seat} per seat</span>
                
                <span className="font-semibold text-muted-foreground">Status:</span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {createdRide.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button onClick={() => setCreatedRide(null)}>Offer another ride</Button>
              <Button asChild variant="outline">
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Label htmlFor="pickup">Pickup Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  id="pickup"
                  required
                  value={form.pickup}
                  onChange={(e) => set("pickup", e.target.value)}
                  className="pl-9"
                  placeholder="VIT-AP University"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                <Input
                  id="destination"
                  required
                  value={form.destination}
                  onChange={(e) => set("destination", e.target.value)}
                  className="pl-9"
                  placeholder="Vijayawada Railway Station"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Departure Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time">Departure Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              {vehicles.length === 0 ? (
                <div className="text-sm text-destructive font-medium p-2 border border-destructive/20 rounded-md bg-destructive/5">
                  No registered vehicles found. Please add a vehicle first.
                </div>
              ) : (
                <Select value={form.vehicle} onValueChange={(v) => set("vehicle", v)}>
                  <SelectTrigger id="vehicle">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.vehicle_id} value={v.vehicle_id}>
                        {v.model} ({v.license_plate}) - Max {v.capacity} seats
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="seats">Available seats</Label>
              <Select value={String(form.seats)} onValueChange={(v) => set("seats", Number(v))}>
                <SelectTrigger id="seats">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} seat{n > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price per seat (₹)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" size="lg" disabled={isSubmitting || vehicles.length === 0} className="w-full sm:w-auto">
                {isSubmitting ? "Creating..." : "Create Ride"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
