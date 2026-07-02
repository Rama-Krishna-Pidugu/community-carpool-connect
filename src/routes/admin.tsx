import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Neighbourly" }, { name: "description", content: "Admin dashboard to review and approve driver verification submissions." }] }),
  component: AdminPage,
});

function AdminPage() {
  const queue = useAppStore((s) => s.verificationQueue);
  const approve = useAppStore((s) => s.approveVerification);
  const reject = useAppStore((s) => s.rejectVerification);
  const [rejecting, setRejecting] = useState<VerificationSubmission | null>(null);
  const [feedback, setFeedback] = useState("");

  const buckets = {
    pending: queue.filter((v) => v.status === "pending"),
    verified: queue.filter((v) => v.status === "verified"),
    rejected: queue.filter((v) => v.status === "rejected"),
  };

  const handleApprove = (id: string) => { approve(id); toast.success("Driver approved"); };
  const handleReject = () => {
    if (!rejecting) return;
    reject(rejecting.id, feedback || "Documents unclear. Please resubmit.");
    toast.success("Submission rejected");
    setRejecting(null);
    setFeedback("");
  };

  const renderList = (list: VerificationSubmission[]) => list.length === 0 ? (
    <Card><CardContent className="p-10 text-center text-muted-foreground">No submissions in this bucket.</CardContent></Card>
  ) : (
    <div className="grid gap-4">
      {list.map((v) => (
        <Card key={v.id} className="transition-shadow hover:shadow-[var(--shadow-hover)]">
          <CardContent className="p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
              <Avatar className="h-12 w-12"><AvatarImage src={v.userAvatar} /><AvatarFallback>{v.userName[0]}</AvatarFallback></Avatar>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{v.userName}</p>
                  <StatusBadge status={v.status} />
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div><span className="font-medium text-foreground">Phone:</span> {v.personal.phone}</div>
                  <div><span className="font-medium text-foreground">Email:</span> {v.personal.email}</div>
                  <div><span className="font-medium text-foreground">DOB:</span> {v.personal.dob}</div>
                  <div><span className="font-medium text-foreground">Submitted:</span> {v.submittedAt}</div>
                  <div className="sm:col-span-2"><span className="font-medium text-foreground">Vehicle:</span> {v.vehicle.type} · {v.vehicle.model} · {v.vehicle.regNumber} · {v.vehicle.seats} seats</div>
                </div>
                {v.feedback && <p className="rounded-lg bg-destructive/10 p-2 text-xs text-destructive">Feedback: {v.feedback}</p>}
              </div>
              {v.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => handleApprove(v.id)} className="gap-1"><ShieldCheck className="h-4 w-4" />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => setRejecting(v)} className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"><ShieldAlert className="h-4 w-4" />Reject</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
    </div>
  );
}
