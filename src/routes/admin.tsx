import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { VerificationSubmission } from "@/lib/mock-data";

import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    const user = useAppStore.getState().user;
    if (user?.role !== "ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({ meta: [{ title: "Admin — Neighbourly" }, { name: "description", content: "Admin dashboard to review and approve driver verification submissions." }] }),
  component: AdminPage,
});

function AdminPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [rejecting, setRejecting] = useState<any | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/drivers");
      setDrivers(data);
    } catch (e: any) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const buckets = {
    pending: drivers.filter((v) => v.verification_status === "PENDING"),
    verified: drivers.filter((v) => v.verification_status === "VERIFIED"),
    rejected: drivers.filter((v) => v.verification_status === "REJECTED"),
  };

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/admin/drivers/${id}/approve`, { method: "PUT" });
      toast.success("Driver approved");
      fetchDrivers();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    try {
      await apiFetch(`/admin/drivers/${rejecting.driver_id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ feedback: feedback || "Documents unclear. Please resubmit." })
      });
      toast.success("Submission rejected");
      setRejecting(null);
      setFeedback("");
      fetchDrivers();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject");
    }
  };

  const renderList = (list: any[]) => {
    if (loading) return <Card><CardContent className="p-10 text-center text-muted-foreground">Loading...</CardContent></Card>;
    if (list.length === 0) return <Card><CardContent className="p-10 text-center text-muted-foreground">No submissions in this bucket.</CardContent></Card>;

    return (
      <div className="grid gap-4">
        {list.map((v) => {
          const vehicle = v.vehicles?.[0];
          return (
            <Card key={v.driver_id} className="transition-shadow hover:shadow-[var(--shadow-hover)] overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5 border-b border-border bg-muted/10">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
                    <Avatar className="h-12 w-12"><AvatarImage src={v.user_avatar} /><AvatarFallback>{v.user_name?.[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{v.user_name}</p>
                        <StatusBadge status={v.verification_status.toLowerCase()} />
                      </div>
                      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <div><span className="font-medium text-foreground">Phone:</span> {v.user_phone}</div>
                        <div><span className="font-medium text-foreground">Email:</span> {v.user_email}</div>
                        <div><span className="font-medium text-foreground">DOB:</span> {v.date_of_birth}</div>
                        <div><span className="font-medium text-foreground">License No:</span> {v.license_number}</div>
                        <div><span className="font-medium text-foreground">Gov ID No:</span> {v.government_id_number}</div>
                        {vehicle && (
                          <div className="sm:col-span-2">
                            <span className="font-medium text-foreground">Vehicle:</span> {vehicle.vehicle_type} · {vehicle.model} · {vehicle.license_plate} · {vehicle.capacity} seats
                          </div>
                        )}
                      </div>
                    </div>
                    {v.verification_status === "PENDING" && (
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => handleApprove(v.driver_id)} className="gap-1"><ShieldCheck className="h-4 w-4" />Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => setRejecting(v)} className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"><ShieldAlert className="h-4 w-4" />Reject</Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Documents Gallery */}
                <div className="p-5 bg-background">
                  <h4 className="text-sm font-semibold mb-3">Uploaded Documents</h4>
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                    {v.documents?.map((doc: any) => (
                      <div key={doc.document_id} className="snap-start shrink-0 w-64 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">{doc.document_type}</p>
                        {doc.url ? (
                          <div 
                            onClick={() => setExpandedImage(doc.url)} 
                            className="cursor-pointer block w-full h-40 rounded-lg overflow-hidden border border-border group relative"
                          >
                            <img src={doc.url} alt={doc.document_type} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-xs font-medium">Click to expand</div>
                          </div>
                        ) : (
                          <div className="w-full h-40 rounded-lg border border-border border-dashed grid place-items-center bg-muted/30 text-xs text-muted-foreground">
                            URL expired or missing
                          </div>
                        )}
                      </div>
                    ))}
                    {v.documents?.length === 0 && (
                      <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground"><BadgeCheck className="h-5 w-5" /></span>
        <div>
          <h1 className="text-3xl font-bold">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Review and approve driver verifications.</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="mt-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({buckets.pending.length})</TabsTrigger>
          <TabsTrigger value="verified">Approved ({buckets.verified.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({buckets.rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">{renderList(buckets.pending)}</TabsContent>
        <TabsContent value="verified" className="mt-4">{renderList(buckets.verified)}</TabsContent>
        <TabsContent value="rejected" className="mt-4">{renderList(buckets.rejected)}</TabsContent>
      </Tabs>

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject submission</DialogTitle>
            <DialogDescription>Let the driver know what to fix before resubmitting.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="e.g. Driving license photo is blurry. Please upload a clearer image." value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Send rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!expandedImage} onOpenChange={(o) => !o && setExpandedImage(null)}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
          {expandedImage && (
            <img src={expandedImage} alt="Expanded Document" className="w-full h-auto max-h-[85vh] object-contain rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
