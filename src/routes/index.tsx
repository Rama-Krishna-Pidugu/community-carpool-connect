import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Leaf, Lock, Search, ShieldCheck, Sparkles, Users, Car, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-carpool.png";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { testimonials } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-soft via-background to-secondary-soft" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Built for smarter cities
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Share Rides.<br />
              <span className="text-primary">Save Money.</span><br />
              Build Community.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Neighbourly connects people in your locality to carpool safely with verified drivers. Book a seat in under a minute or offer your empty ones.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/find-ride"><Search className="h-4 w-4" />Find a Ride</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/offer-ride"><Car className="h-4 w-4" />Offer a Ride</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-secondary" /> Verified drivers</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-secondary" /> No surge pricing</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-secondary" /> 100% neighbourhood</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 blur-2xl" />
            <img
              src={heroImg}
              alt="Neighbours carpooling together"
              width={1280}
              height={960}
              className="mx-auto w-full max-w-xl drop-shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Why neighbours pick Neighbourly</h2>
          <p className="mt-3 text-muted-foreground">Trust and simplicity built into every ride.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={ShieldCheck} tone="primary" title="Verified drivers" description="Every driver clears identity, license and vehicle checks before accepting a ride." />
          <FeatureCard icon={Lock} tone="secondary" title="Secure booking" description="Book a seat in seconds with a clear price, no hidden fees, and instant confirmation." />
          <FeatureCard icon={Users} tone="accent" title="Community based" description="Ride only with people from your locality. Familiar faces, familiar routes." />
          <FeatureCard icon={Leaf} tone="secondary" title="Eco friendly" description="Fewer cars on the road means cleaner air and a lighter footprint for everyone." />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to your next shared ride.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: 1, icon: MapPin, title: "Search your route", desc: "Enter your pickup and destination to see rides going your way today." },
              { n: 2, icon: Users, title: "Pick a neighbour", desc: "Browse verified drivers, ratings and vehicle info before choosing." },
              { n: 3, icon: ArrowRight, title: "Book &amp; ride", desc: "Confirm your seat and hop in. Split the cost, save the planet." },
            ].map((s) => (
              <Card key={s.n} className="relative overflow-hidden">
                <CardContent className="space-y-3 p-6">
                  <span className="absolute right-4 top-4 text-6xl font-bold text-primary-soft">{s.n}</span>
                  <span className="inline-grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: s.desc }} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Loved by neighbours</h2>
          <p className="mt-3 text-muted-foreground">Real stories from the Neighbourly community.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="transition-shadow hover:shadow-[var(--shadow-hover)]">
              <CardContent className="space-y-4 p-6">
                <p className="text-sm leading-relaxed">“{t.quote}”</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10"><AvatarImage src={t.avatar} /><AvatarFallback>{t.name[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-10 text-primary-foreground shadow-[var(--shadow-hover)] md:p-14">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">Ready to share your first ride?</h2>
              <p className="mt-2 text-primary-foreground/85">Join your neighbours and turn commutes into community.</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="justify-self-start md:justify-self-end">
              <Link to="/auth">Get started free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
