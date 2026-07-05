import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/api";
import { Gift, Clock, CheckCircle, AlertCircle, ArrowLeft, Ticket } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "My Rewards — Neighbourly" },
      { name: "description", content: "View and manage your carpooling discount coupons." }
    ]
  }),
  component: RewardsPage,
});

type Coupon = {
  id: string;
  user_id: string;
  coupon_code: string;
  discount_type: string;
  discount_value: number;
  expiry_date: string;
  is_used: boolean;
  created_at: string;
};

type CouponsResponse = {
  available: Coupon[];
  used: Coupon[];
  expired: Coupon[];
};

function RewardsPage() {
  const user = useAppStore((s) => s.user);
  const [coupons, setCoupons] = useState<CouponsResponse>({ available: [], used: [], expired: [] });
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/rewards/my-coupons") as CouponsResponse;
      setCoupons(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCoupons();
    }
  }, [user]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold">Please sign in to view rewards</h2>
        <Button asChild><Link to="/auth">Sign In</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">My Rewards</h1>
          <p className="text-sm text-muted-foreground">Unlock discounts by completing rides and sharing fuel costs.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Profile Card and Stats */}
        <Card className="h-fit">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Gift className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl">Loyalty Rewards</CardTitle>
            <CardDescription>Earn coupons as you complete rides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Rides taken</span>
              <span className="font-semibold">{user.ridesTaken}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Rides offered</span>
              <span className="font-semibold">{user.ridesOffered}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground font-medium text-emerald-600">Available coupons</span>
              <span className="font-bold text-emerald-600">{coupons.available.length}</span>
            </div>
            
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100 mt-4 leading-relaxed">
              <h4 className="font-bold text-slate-700 mb-1">How it works:</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>1st Ride Completed: 10% Coupon</li>
                <li>5 Rides Completed: 15% Coupon</li>
                <li>10 Rides Completed: 20% Coupon</li>
                <li>25 Rides Completed: 30% Coupon</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Coupons Tabs */}
        <div>
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available ({coupons.available.length})</TabsTrigger>
              <TabsTrigger value="used">Used ({coupons.used.length})</TabsTrigger>
              <TabsTrigger value="expired">Expired ({coupons.expired.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="mt-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading your rewards...</div>
              ) : coupons.available.length === 0 ? (
                <div className="rounded-xl border border-dashed p-12 text-center">
                  <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="font-semibold text-slate-700">No coupons available</h3>
                  <p className="text-sm text-slate-400 mt-1">Complete your next ride to earn a discount coupon!</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {coupons.available.map((c) => (
                    <Card key={c.id} className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all">
                      <div className="absolute top-0 right-0 h-16 w-16 translate-x-8 -translate-y-8 rotate-45 bg-primary/10" />
                      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[160px]">
                        <div>
                          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                            🎁 {c.discount_value}% OFF
                          </span>
                          <h4 className="text-lg font-bold text-slate-800 tracking-wide font-mono mt-1 select-all cursor-pointer" onClick={() => copyToClipboard(c.coupon_code)}>
                            {c.coupon_code}
                          </h4>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs border-t pt-3">
                          <span className="text-muted-foreground inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Expires {c.expiry_date}
                          </span>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => copyToClipboard(c.coupon_code)}>
                            Copy Code
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="used" className="mt-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading your rewards...</div>
              ) : coupons.used.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No used coupons found.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {coupons.used.map((c) => (
                    <Card key={c.id} className="bg-slate-50/50 border-slate-200 opacity-75">
                      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
                        <div>
                          <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-500 mb-2">
                            {c.discount_value}% OFF
                          </span>
                          <h4 className="text-lg font-bold text-slate-400 line-through font-mono">
                            {c.coupon_code}
                          </h4>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-emerald-600 font-semibold border-t pt-3">
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Redeemed
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="expired" className="mt-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading your rewards...</div>
              ) : coupons.expired.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No expired coupons found.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {coupons.expired.map((c) => (
                    <Card key={c.id} className="bg-slate-50 border-slate-200 opacity-60">
                      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[140px]">
                        <div>
                          <span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-500 mb-2">
                            {c.discount_value}% OFF
                          </span>
                          <h4 className="text-lg font-bold text-slate-400 font-mono">
                            {c.coupon_code}
                          </h4>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-red-500 font-semibold border-t pt-3">
                          <span className="inline-flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" /> Expired
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
