import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepIndicator } from "@/components/StepIndicator";
import { FileUpload } from "@/components/FileUpload";
import { WebcamCapture } from "@/components/WebcamCapture";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/verification")({
  head: () => ({ meta: [{ title: "Driver Verification — Neighbourly" }, { name: "description", content: "Complete driver verification to start offering rides in your neighbourhood." }] }),
  component: VerificationPage,
});

const STEPS = ["Personal", "License", "Vehicle", "Identity"];

function VerificationPage() {
  const user = useAppStore((s) => s.user);
  const refreshProfile = useAppStore((s) => s.refreshProfile);
  const submitVerification = useAppStore((s) => s.submitVerification);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const [personal, setPersonal] = useState({ fullName: user?.name ?? "", dob: "", phone: (user?.phone === "+91 98000 12345" ? "" : user?.phone) ?? "", email: user?.email ?? "", licenseNumber: "", govIdNumber: "" });
  const [vehicle, setVehicle] = useState({ type: "Car", model: "", regNumber: "", seats: 4 });
  const [docs, setDocs] = useState<{ rc?: string; insurance?: string; govId?: string; license?: string; selfie?: string }>({});
  const [docFiles, setDocFiles] = useState<{ rc?: File; insurance?: File; govId?: File; license?: File; selfie?: File }>({});

  if (!user) { navigate({ to: "/auth" }); return null; }

  if (user.driverStatus === "verified") {
    return <VerifiedState />;
  }

  if (submitted || user.driverStatus === "pending") {
    return <PendingState />;
  }

  const [isUploading, setIsUploading] = useState(false);

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = () => {
    if (step === 0) return personal.fullName && personal.dob && personal.phone;
    if (step === 1) return docs.license && personal.licenseNumber;
    if (step === 2) return vehicle.model && vehicle.regNumber && docs.rc;
    if (step === 3) return docs.govId && personal.govIdNumber && docs.selfie && confirmed;
    return true;
  };

  const uploadDocument = async (type: string, file: File) => {
    const presigned = await apiFetch("/driver/documents/presigned-url", {
      method: "POST",
      body: JSON.stringify({ document_type: type, filename: file.name })
    });

    const formData = new FormData();
    Object.entries(presigned.fields).forEach(([k, v]) => formData.append(k, v as string));
    formData.append("file", file);
    
    await fetch(presigned.url, { method: "POST", body: formData });

    await apiFetch("/driver/documents/confirm", {
      method: "POST",
      body: JSON.stringify({ document_type: type, s3_key: presigned.s3_key })
    });
  };

  const handleNext = async () => {
    try {
      setIsUploading(true);
      if (step === 0) {
        await apiFetch("/driver/profile", {
          method: "PUT",
          body: JSON.stringify({
            license_number: personal.licenseNumber,
            government_id_number: personal.govIdNumber, 
            date_of_birth: personal.dob
          }),
        });
      }
      if (step === 1 && docFiles.license) await uploadDocument("LICENSE", docFiles.license);
      if (step === 2) {
        if (docFiles.rc) await uploadDocument("RC", docFiles.rc);
        if (docFiles.insurance) await uploadDocument("INSURANCE", docFiles.insurance);
      }
      setStep((s) => Math.min(s + 1, STEPS.length));
    } catch (e: any) {
      toast.error(e.message || "Failed to save step");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      
      // Upload step 3 docs
      if (docFiles.govId) await uploadDocument("GOVERNMENT_ID", docFiles.govId);
      if (docFiles.selfie) await uploadDocument("SELFIE", docFiles.selfie);

      // Update Profile again to capture Government ID Number
      await apiFetch("/driver/profile", {
        method: "PUT",
        body: JSON.stringify({
          license_number: personal.licenseNumber,
          government_id_number: personal.govIdNumber, 
          date_of_birth: personal.dob
        }),
      });

      // Apply
      await apiFetch("/driver/apply", {
        method: "POST",
        body: JSON.stringify({ 
          phone_number: personal.phone,
          vehicle_type: vehicle.type,
          vehicle_model: vehicle.model,
          vehicle_reg_number: vehicle.regNumber,
          vehicle_seats: vehicle.seats
        })
      });

      submitVerification({
        userId: user.id, userName: user.name, userAvatar: user.avatar,
        personal, vehicle, documents: docs as any,
      });
      toast.success("Verification submitted");
      setSubmitted(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit application");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2"><Link to="/offer-ride"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link></Button>
      {user.driverStatus === "rejected" && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <p className="text-sm font-semibold">Your previous application was rejected.</p>
          <p className="text-sm">Please review your documents and information carefully before submitting again.</p>
        </div>
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Driver verification</h1>
        <p className="mt-1 text-muted-foreground">Complete these 4 steps to become a verified driver.</p>
      </div>

      <Card className="mb-6"><CardContent className="p-5"><StepIndicator steps={STEPS} current={step} /></CardContent></Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="h-fit bg-primary-soft">
          <CardContent className="space-y-3 p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></span>
            <h3 className="font-semibold">{["Your personal details", "Driving license", "Vehicle details", "Identity verification"][step] ?? "Review"}</h3>
            <p className="text-sm text-muted-foreground">
              {[
                "Confirm the basic information neighbours will see.",
                "Upload clear photos of both sides of your driving license.",
                "Tell us about your vehicle and upload the RC copy.",
                "One last check to confirm your identity.",
              ][step]}
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              {["Clear, unedited photos", "All corners visible", "No glare or blur"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-secondary" />{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2"><Label>Full name</Label><Input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Date of birth</Label><Input type="date" value={personal.dob} onChange={(e) => setPersonal({ ...personal, dob: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Phone number</Label><Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label>Email</Label><Input value={personal.email} readOnly className="bg-muted" /></div>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2"><Label>Driving license number</Label><Input value={personal.licenseNumber} onChange={(e) => setPersonal({ ...personal, licenseNumber: e.target.value })} placeholder="DL Number" /></div>
                <div className="sm:col-span-2">
                  <FileUpload label="Driving license (Please upload clear photo)" value={docs.license} onChange={(v, f) => { setDocs({ ...docs, license: v }); setDocFiles({ ...docFiles, license: f }); }} />
                </div>
                <div className="sm:col-span-2"><StatusBadge status="pending" label="Awaiting review after submission" /></div>
              </div>
            )}
            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Vehicle type</Label>
                  <Select value={vehicle.type} onValueChange={(v) => setVehicle({ ...vehicle, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Car">Car</SelectItem>
                      <SelectItem value="Bike">Bike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Vehicle model</Label><Input value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} placeholder="Honda City" /></div>
                <div className="space-y-1.5"><Label>Registration number</Label><Input value={vehicle.regNumber} onChange={(e) => setVehicle({ ...vehicle, regNumber: e.target.value })} placeholder="KA 05 MJ 4421" /></div>
                <div className="space-y-1.5">
                  <Label>Available seats</Label>
                  <Select value={String(vehicle.seats)} onValueChange={(v) => setVehicle({ ...vehicle, seats: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[1, 2, 3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <FileUpload label="Registration certificate (RC)" value={docs.rc} onChange={(v, f) => { setDocs({ ...docs, rc: v }); setDocFiles({ ...docFiles, rc: f }); }} />
                <FileUpload label="Vehicle insurance" optional value={docs.insurance} onChange={(v, f) => { setDocs({ ...docs, insurance: v }); setDocFiles({ ...docFiles, insurance: f }); }} />
              </div>
            )}
            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2"><Label>Government ID Number</Label><Input value={personal.govIdNumber} onChange={(e) => setPersonal({ ...personal, govIdNumber: e.target.value })} placeholder="ID Number" /></div>
                <div className="sm:col-span-2">
                  <FileUpload label="Government ID (Aadhaar / Passport / Voter ID)" value={docs.govId} onChange={(v, f) => { setDocs({ ...docs, govId: v }); setDocFiles({ ...docFiles, govId: f }); }} />
                </div>
                <div className="sm:col-span-2">
                  <WebcamCapture label="Live Selfie (for identity verification)" value={docs.selfie} onChange={(v, f) => { setDocs({ ...docs, selfie: v }); setDocFiles({ ...docFiles, selfie: f }); }} />
                </div>
                <label className="col-span-2 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                  <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(Boolean(v))} className="mt-0.5" />
                  <span className="text-sm">I confirm that all submitted information is accurate and belongs to me.</span>
                </label>
              </div>
            )}

            <div className="mt-6 flex justify-between border-t border-border pt-4">
              <Button variant="ghost" onClick={back} disabled={step === 0 || isUploading}><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={!canProceed() || isUploading}>
                  {isUploading ? "Uploading..." : "Continue"}<ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || isUploading} className="gap-2">
                  <BadgeCheck className="h-4 w-4" />{isUploading ? "Submitting..." : "Submit verification"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PendingState() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-4 p-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-warning-soft text-warning-foreground">
            <BadgeCheck className="h-8 w-8" />
          </span>
          <StatusBadge status="pending" className="mx-auto" />
          <h1 className="text-2xl font-bold">Verification submitted</h1>
          <p className="text-muted-foreground">Our team will review your documents within <strong>24-48 hours</strong>. You can still search and book rides while we review.</p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild><Link to="/find-ride">Find a ride</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifiedState() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-4 p-10 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <StatusBadge status="verified" className="mx-auto" />
          <h1 className="text-2xl font-bold">You're a verified driver!</h1>
          <p className="text-muted-foreground">Your driver profile has been approved. You are now ready to offer rides and earn on Neighbourly.</p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button asChild><Link to="/offer-ride">Offer a ride</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Back to dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
