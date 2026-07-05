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
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, ShieldCheck, Check, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import {
  validateFullName,
  validateDOB,
  validatePhone,
  validateEmail,
  validateAddress,
  validateDrivingLicense,
  validateVehicleRegistration,
  validateInsuranceNumber,
  validateFileUpload,
  validateImageDimensions
} from "@/lib/validators";

export const Route = createFileRoute("/verification")({
  head: () => ({
    meta: [
      { title: "Driver Verification — Neighbourly" },
      { name: "description", content: "Complete driver verification to start offering rides in your neighbourhood." }
    ]
  }),
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

  useEffect(() => {
    if (user) {
      setPersonal((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || (user.phone === "+91 98000 12345" ? "" : user.phone) || "",
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  // Form Field States
  const [personal, setPersonal] = useState({
    fullName: user?.name ?? "",
    dob: "",
    phone: (user?.phone === "+91 98000 12345" ? "" : user?.phone) ?? "",
    email: user?.email ?? "",
    licenseNumber: "",
    govIdNumber: "",
    address: ""
  });

  const [vehicle, setVehicle] = useState({
    type: "Car",
    model: "",
    regNumber: "",
    seats: 4,
    insuranceNumber: ""
  });

  const [docs, setDocs] = useState<{
    rc?: string;
    insurance?: string;
    govId?: string;
    license?: string;
    selfie?: string;
  }>({});

  const [docFiles, setDocFiles] = useState<{
    rc?: File;
    insurance?: File;
    govId?: File;
    license?: File;
    selfie?: File;
  }>({});

  // Real-time Errors / Touched States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [ageDisplay, setAgeDisplay] = useState<number | null>(null);

  if (!user) {
    navigate({ to: "/auth" });
    return null;
  }

  if (user.driverStatus === "verified") {
    return <VerifiedState />;
  }

  if (submitted || user.driverStatus === "pending") {
    return <PendingState />;
  }

  // Handle Mark Touched
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    runValidation(field);
  };

  // Run Field Validations
  const runValidation = (field: string, customVal?: string) => {
    let result = { isValid: true, message: "" };

    if (field === "fullName") {
      result = validateFullName(customVal ?? personal.fullName);
    } else if (field === "dob") {
      const dobResult = validateDOB(customVal ?? personal.dob);
      result = dobResult;
      setAgeDisplay(dobResult.age ?? null);
    } else if (field === "phone") {
      result = validatePhone(customVal ?? personal.phone);
    } else if (field === "address") {
      result = validateAddress(customVal ?? personal.address);
    } else if (field === "licenseNumber") {
      result = validateDrivingLicense(customVal ?? personal.licenseNumber);
    } else if (field === "vehicleModel") {
      result = (customVal ?? vehicle.model).trim().length >= 2 ? { isValid: true, message: "" } : { isValid: false, message: "Vehicle model must be at least 2 characters." };
    } else if (field === "regNumber") {
      result = validateVehicleRegistration(customVal ?? vehicle.regNumber);
    } else if (field === "insuranceNumber") {
      result = validateInsuranceNumber(customVal ?? vehicle.insuranceNumber);
    } else if (field === "govIdNumber") {
      result = (customVal ?? personal.govIdNumber).trim().length >= 5 ? { isValid: true, message: "" } : { isValid: false, message: "Government ID number must be at least 5 characters." };
    }

    setErrors(prev => {
      if (result.isValid) {
        const { [field]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [field]: result.message };
      }
    });

    return result.isValid;
  };

  // Live input changes
  const handlePersonalChange = (field: keyof typeof personal, val: string) => {
    setPersonal(prev => ({ ...prev, [field]: val }));
    if (touched[field]) {
      runValidation(field, val);
    }
  };

  const handleVehicleChange = (field: keyof typeof vehicle, val: any) => {
    setVehicle(prev => ({ ...prev, [field]: val }));
    if (touched[field]) {
      runValidation(field, val);
    }
  };

  // Upload S3 files
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

  // Step Nav validation
  const isStep0Valid = () => {
    return (
      personal.fullName.trim() &&
      personal.dob &&
      personal.phone.trim() &&
      personal.address.trim() &&
      validateFullName(personal.fullName).isValid &&
      validateDOB(personal.dob).isValid &&
      validatePhone(personal.phone).isValid &&
      validateAddress(personal.address).isValid
    );
  };

  const isStep1Valid = () => {
    return (
      personal.licenseNumber.trim() &&
      docs.license &&
      validateDrivingLicense(personal.licenseNumber).isValid &&
      !errors.licenseFile
    );
  };

  const isStep2Valid = () => {
    return (
      vehicle.model.trim() &&
      vehicle.regNumber.trim() &&
      docs.rc &&
      validateVehicleRegistration(vehicle.regNumber).isValid &&
      validateInsuranceNumber(vehicle.insuranceNumber).isValid &&
      !errors.rcFile &&
      !errors.insuranceFile
    );
  };

  const isStep3Valid = () => {
    return (
      personal.govIdNumber.trim() &&
      docs.govId &&
      docs.selfie &&
      confirmed &&
      !errors.govIdFile &&
      !errors.selfieFile
    );
  };

  const canProceed = () => {
    if (step === 0) return isStep0Valid();
    if (step === 1) return isStep1Valid();
    if (step === 2) return isStep2Valid();
    if (step === 3) return isStep3Valid();
    return true;
  };

  const handleNext = async () => {
    // Run all validations for current step
    if (step === 0) {
      const v1 = runValidation("fullName");
      const v2 = runValidation("dob");
      const v3 = runValidation("phone");
      const v4 = runValidation("address");
      setTouched({ fullName: true, dob: true, phone: true, address: true });
      if (!v1 || !v2 || !v3 || !v4) {
        toast.error("Please correct the form fields before proceeding.");
        return;
      }
    } else if (step === 1) {
      const v = runValidation("licenseNumber");
      setTouched({ licenseNumber: true });
      if (!v || !docs.license) {
        toast.error("Please provide valid license details and files.");
        return;
      }
    } else if (step === 2) {
      const v1 = runValidation("vehicleModel");
      const v2 = runValidation("regNumber");
      const v3 = runValidation("insuranceNumber");
      setTouched({ vehicleModel: true, regNumber: true, insuranceNumber: true });
      if (!v1 || !v2 || !v3 || !docs.rc) {
        toast.error("Please check vehicle details and upload RC certificate.");
        return;
      }
    }

    try {
      setIsUploading(true);
      if (step === 0) {
        await apiFetch("/driver/profile", {
          method: "PUT",
          body: JSON.stringify({
            license_number: personal.licenseNumber || "DL-PENDING-STAGE", 
            government_id_number: personal.govIdNumber || "GOV-PENDING-STAGE", 
            date_of_birth: personal.dob,
            full_name: personal.fullName,
            address: personal.address
          }),
        });
      }
      if (step === 1 && docFiles.license) {
        await uploadDocument("LICENSE", docFiles.license);
      }
      if (step === 2) {
        if (docFiles.rc) await uploadDocument("RC", docFiles.rc);
        if (docFiles.insurance) await uploadDocument("INSURANCE", docFiles.insurance);
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch (e: any) {
      toast.error(e.message || "Failed to save step configuration.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!isStep3Valid()) {
      toast.error("Please complete identity details and agree to terms.");
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload step 3 files
      if (docFiles.govId) await uploadDocument("GOVERNMENT_ID", docFiles.govId);
      if (docFiles.selfie) await uploadDocument("SELFIE", docFiles.selfie);

      // Finalize profile details update
      await apiFetch("/driver/profile", {
        method: "PUT",
        body: JSON.stringify({
          license_number: personal.licenseNumber,
          government_id_number: personal.govIdNumber, 
          date_of_birth: personal.dob,
          full_name: personal.fullName,
          address: personal.address
        }),
      });

      // Submit application
      await apiFetch("/driver/apply", {
        method: "POST",
        body: JSON.stringify({ 
          phone_number: personal.phone,
          vehicle_type: vehicle.type,
          vehicle_model: vehicle.model,
          vehicle_reg_number: vehicle.regNumber,
          vehicle_seats: vehicle.seats,
          insurance_number: vehicle.insuranceNumber || null
        })
      });

      submitVerification({
        userId: user.id,
        userName: personal.fullName,
        userAvatar: user.avatar,
        personal,
        vehicle,
        documents: docs as any,
      });

      toast.success("Driver verification application submitted!");
      setSubmitted(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit verification request.");
    } finally {
      setIsUploading(false);
    }
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  // File Validation Wrappers
  const handleLicenseUpload = async (url: string | undefined, file: File | undefined) => {
    if (!url || !file) return;
    const check = validateFileUpload(file, [".jpeg", ".jpg", ".png", ".pdf"], 10);
    if (!check.isValid) {
      setErrors(prev => ({ ...prev, licenseFile: check.message }));
      toast.error(check.message);
      return;
    }
    setErrors(prev => { const { licenseFile, ...rest } = prev; return rest; });
    setDocs(prev => ({ ...prev, license: url }));
    setDocFiles(prev => ({ ...prev, license: file }));
  };

  const handleRcUpload = async (url: string | undefined, file: File | undefined) => {
    if (!url || !file) return;
    const check = validateFileUpload(file, [".jpeg", ".jpg", ".png", ".pdf"], 10);
    if (!check.isValid) {
      setErrors(prev => ({ ...prev, rcFile: check.message }));
      toast.error(check.message);
      return;
    }
    setErrors(prev => { const { rcFile, ...rest } = prev; return rest; });
    setDocs(prev => ({ ...prev, rc: url }));
    setDocFiles(prev => ({ ...prev, rc: file }));
  };

  const handleInsuranceUpload = async (url: string | undefined, file: File | undefined) => {
    if (!url || !file) return;
    const check = validateFileUpload(file, [".jpeg", ".jpg", ".png", ".pdf"], 10);
    if (!check.isValid) {
      setErrors(prev => ({ ...prev, insuranceFile: check.message }));
      toast.error(check.message);
      return;
    }
    setErrors(prev => { const { insuranceFile, ...rest } = prev; return rest; });
    setDocs(prev => ({ ...prev, insurance: url }));
    setDocFiles(prev => ({ ...prev, insurance: file }));
  };

  const handleGovIdUpload = async (url: string | undefined, file: File | undefined) => {
    if (!url || !file) return;
    const check = validateFileUpload(file, [".jpeg", ".jpg", ".png", ".pdf"], 10);
    if (!check.isValid) {
      setErrors(prev => ({ ...prev, govIdFile: check.message }));
      toast.error(check.message);
      return;
    }
    setErrors(prev => { const { govIdFile, ...rest } = prev; return rest; });
    setDocs(prev => ({ ...prev, govId: url }));
    setDocFiles(prev => ({ ...prev, govId: file }));
  };

  const handleSelfieUpload = async (url: string | undefined, file: File | undefined) => {
    if (!url || !file) return;
    const typeCheck = validateFileUpload(file, [".jpeg", ".jpg", ".png", ".webp"], 5);
    if (!typeCheck.isValid) {
      setErrors(prev => ({ ...prev, selfieFile: typeCheck.message }));
      toast.error(typeCheck.message);
      return;
    }

    // Min resolution check for selfie
    const dimensionCheck = await validateImageDimensions(file, 720, 720);
    if (!dimensionCheck.isValid) {
      setErrors(prev => ({ ...prev, selfieFile: dimensionCheck.message }));
      toast.error(dimensionCheck.message);
      return;
    }

    setErrors(prev => { const { selfieFile, ...rest } = prev; return rest; });
    setDocs(prev => ({ ...prev, selfie: url }));
    setDocFiles(prev => ({ ...prev, selfie: file }));
  };

  // Inline Validation Field Wrapper
  const renderValidationStatus = (field: string, value: string) => {
    if (!touched[field]) return null;
    if (errors[field]) {
      return (
        <span className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium" role="alert">
          <AlertCircle className="h-3 w-3" />
          {errors[field]}
        </span>
      );
    }
    if (value && value.trim()) {
      return (
        <span className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
          <Check className="h-3.5 w-3.5" />
          Looks good!
        </span>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/offer-ride"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
      </Button>

      {user.driverStatus === "rejected" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50/50 p-4 text-red-800 dark:border-red-950 dark:bg-red-950/20">
          <p className="text-sm font-semibold">Your previous application was rejected.</p>
          <p className="text-sm">Please verify the details and documents below carefully before resubmitting.</p>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Driver Verification</h1>
        <p className="mt-1 text-muted-foreground">Complete these steps to register as a verified driver in the Neighbourly platform.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <StepIndicator steps={STEPS} current={step} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Sidebar Info Card */}
        <Card className="h-fit bg-blue-50/40 border-blue-100 dark:border-slate-800 dark:bg-slate-900/40">
          <CardContent className="space-y-4 p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="font-bold text-base">
              {["Personal Details", "Driving License Details", "Vehicle Verification", "Identity Validation"][step]}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {[
                "We collect minimal personal details. Neighbors will only see your name and verified status badge.",
                "Upload a clear copy of your license card so our moderation team can verify its validity.",
                "Fill in vehicle specifications to help riders locate you at pickups.",
                "Capture a live webcam selfie to match against your government-issued ID card photo.",
              ][step]}
            </p>
            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-3">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Requirements</span>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" /> Clear, readable document photos</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" /> All corners visible</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" /> Must be at least 18 years old</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Form Content */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            
            {/* STEP 0: PERSONAL INFORMATION */}
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2" role="form" aria-label="Personal Information Form">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="fullName"
                    value={personal.fullName}
                    onChange={(e) => handlePersonalChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    aria-required="true"
                    placeholder="Enter your full name"
                    className={touched.fullName ? (errors.fullName ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  {renderValidationStatus("fullName", personal.fullName)}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input
                    id="dob"
                    type="date"
                    value={personal.dob}
                    onChange={(e) => handlePersonalChange("dob", e.target.value)}
                    onBlur={() => handleBlur("dob")}
                    aria-required="true"
                    className={touched.dob ? (errors.dob ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  {ageDisplay !== null && ageDisplay >= 18 && (
                    <span className="text-3xs font-semibold text-blue-600 block mt-1">Calculated Age: {ageDisplay} Years Old</span>
                  )}
                  {renderValidationStatus("dob", personal.dob)}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone"
                    value={personal.phone}
                    onChange={(e) => handlePersonalChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    aria-required="true"
                    placeholder="10 digit phone number"
                    className={touched.phone ? (errors.phone ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  <span className="text-3xs text-slate-400 block mt-0.5">Format: 10 digits starting with 6-9. e.g. 9876543210</span>
                  {renderValidationStatus("phone", personal.phone)}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="address"
                    value={personal.address}
                    onChange={(e) => handlePersonalChange("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    aria-required="true"
                    placeholder="Enter your residence address"
                    className={touched.address ? (errors.address ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  {renderValidationStatus("address", personal.address)}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={personal.email}
                    readOnly
                    className="bg-slate-100/80 cursor-not-allowed dark:bg-slate-900/60"
                  />
                  <span className="text-3xs text-slate-400 block">Registered account email</span>
                </div>
              </div>
            )}

            {/* STEP 1: DRIVING LICENSE DETAILS */}
            {step === 1 && (
              <div className="grid gap-4 sm:grid-cols-2" role="form" aria-label="Driving License Details">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="licenseNumber">Driving License Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="licenseNumber"
                    value={personal.licenseNumber}
                    onChange={(e) => handlePersonalChange("licenseNumber", e.target.value)}
                    onBlur={() => handleBlur("licenseNumber")}
                    aria-required="true"
                    placeholder="e.g. TS0120190001234"
                    className={touched.licenseNumber ? (errors.licenseNumber ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  <span className="text-3xs text-slate-400 block mt-0.5">Format: State (2 letters) + RTO (2 digits) + Year (4 digits) + Unique ID (7 digits). e.g., TS0120190001234</span>
                  {renderValidationStatus("licenseNumber", personal.licenseNumber)}
                </div>

                <div className="sm:col-span-2">
                  <FileUpload
                    label="Driving License (Please upload front/back combined copy)"
                    value={docs.license}
                    onChange={handleLicenseUpload}
                  />
                  <span className="text-3xs text-slate-400 block mt-1">Accepts: JPEG, PNG, PDF (Max size: 10 MB)</span>
                  {errors.licenseFile && (
                    <span className="text-xs text-red-500 block mt-1" role="alert">{errors.licenseFile}</span>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: VEHICLE VERIFICATION */}
            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2" role="form" aria-label="Vehicle Verification Form">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicleType">Vehicle Type</Label>
                  <Select value={vehicle.type} onValueChange={(v) => handleVehicleChange("type", v)}>
                    <SelectTrigger id="vehicleType"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Car">Car (4-Wheeler)</SelectItem>
                      <SelectItem value="Bike">Bike (2-Wheeler)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="vehicleModel">Vehicle Model <span className="text-red-500">*</span></Label>
                  <Input
                    id="vehicleModel"
                    value={vehicle.model}
                    onChange={(e) => handleVehicleChange("model", e.target.value)}
                    onBlur={() => handleBlur("vehicleModel")}
                    aria-required="true"
                    placeholder="e.g. Honda City"
                    className={touched.vehicleModel ? (errors.vehicleModel ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  {renderValidationStatus("vehicleModel", vehicle.model)}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regNumber">Registration Number (RC) <span className="text-red-500">*</span></Label>
                  <Input
                    id="regNumber"
                    value={vehicle.regNumber}
                    onChange={(e) => handleVehicleChange("regNumber", e.target.value)}
                    onBlur={() => handleBlur("regNumber")}
                    aria-required="true"
                    placeholder="e.g. KA01MN9999"
                    className={touched.regNumber ? (errors.regNumber ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  <span className="text-3xs text-slate-400 block mt-0.5">Format: State (2 letters) + RTO (2 digits) + Series (1-2 letters) + 4 digit number. e.g. KA01MN9999</span>
                  {renderValidationStatus("regNumber", vehicle.regNumber)}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="seats">Available Seats</Label>
                  <Select value={String(vehicle.seats)} onValueChange={(v) => handleVehicleChange("seats", Number(v))}>
                    <SelectTrigger id="seats"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="insuranceNumber">Vehicle Insurance Number <span className="text-slate-400">(Optional)</span></Label>
                  <Input
                    id="insuranceNumber"
                    value={vehicle.insuranceNumber}
                    onChange={(e) => handleVehicleChange("insuranceNumber", e.target.value)}
                    onBlur={() => handleBlur("insuranceNumber")}
                    placeholder="e.g. INS-998822"
                    className={touched.insuranceNumber ? (errors.insuranceNumber ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  {renderValidationStatus("insuranceNumber", vehicle.insuranceNumber)}
                </div>

                <div className="sm:col-span-2 pt-2 border-t dark:border-slate-800">
                  <FileUpload
                    label="Registration Certificate (RC) *"
                    value={docs.rc}
                    onChange={handleRcUpload}
                  />
                  <span className="text-3xs text-slate-400 block mt-1">Accepts: JPEG, PNG, PDF (Max size: 10 MB)</span>
                  {errors.rcFile && (
                    <span className="text-xs text-red-500 block mt-1" role="alert">{errors.rcFile}</span>
                  )}
                </div>

                <div className="sm:col-span-2 mt-2">
                  <FileUpload
                    label="Vehicle Insurance Certificate (Optional)"
                    optional
                    value={docs.insurance}
                    onChange={handleInsuranceUpload}
                  />
                  <span className="text-3xs text-slate-400 block mt-1">Accepts: JPEG, PNG, PDF (Max size: 10 MB)</span>
                  {errors.insuranceFile && (
                    <span className="text-xs text-red-500 block mt-1" role="alert">{errors.insuranceFile}</span>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: IDENTITY VERIFICATION */}
            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2" role="form" aria-label="Identity Verification Form">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="govIdNumber">Government ID Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="govIdNumber"
                    value={personal.govIdNumber}
                    onChange={(e) => handlePersonalChange("govIdNumber", e.target.value)}
                    onBlur={() => handleBlur("govIdNumber")}
                    aria-required="true"
                    placeholder="Enter Government ID Number"
                    className={touched.govIdNumber ? (errors.govIdNumber ? "border-red-500" : "border-emerald-500") : ""}
                  />
                  {renderValidationStatus("govIdNumber", personal.govIdNumber)}
                </div>

                <div className="sm:col-span-2">
                  <FileUpload
                    label="Government ID Card Copy (Aadhaar / Voter ID / Passport) *"
                    value={docs.govId}
                    onChange={handleGovIdUpload}
                  />
                  <span className="text-3xs text-slate-400 block mt-1">Accepts: JPEG, PNG, PDF (Max size: 10 MB)</span>
                  {errors.govIdFile && (
                    <span className="text-xs text-red-500 block mt-1" role="alert">{errors.govIdFile}</span>
                  )}
                </div>

                <div className="sm:col-span-2 pt-4 border-t dark:border-slate-800">
                  {/* Selfie Guidelines Panel */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4 dark:bg-slate-900/50 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                      Selfie Capture Guidelines
                    </h4>
                    <div className="grid gap-2 text-2xs text-slate-600 dark:text-slate-400 sm:grid-cols-2">
                      <div>✔ Face should be fully visible</div>
                      <div>✔ Good light, plain background</div>
                      <div>✔ Remove sunglasses, caps, masks</div>
                      <div>✔ Look straight into camera</div>
                      <div>✔ Resolution must be at least 720x720</div>
                      <div>✔ Single person photo only</div>
                    </div>
                  </div>

                  <WebcamCapture
                    label="Capture Live Identification Selfie *"
                    value={docs.selfie}
                    onChange={handleSelfieUpload}
                  />
                  <span className="text-3xs text-slate-400 block mt-1">Accepts: Webcam snap or WebP/JPEG/PNG (Max size: 5 MB)</span>
                  {errors.selfieFile && (
                    <span className="text-xs text-red-500 block mt-1" role="alert">{errors.selfieFile}</span>
                  )}
                </div>

                <label className="col-span-2 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 cursor-pointer select-none dark:border-slate-800 dark:bg-slate-900/30">
                  <Checkbox
                    id="confirmed"
                    checked={confirmed}
                    onCheckedChange={(v) => setConfirmed(Boolean(v))}
                    className="mt-0.5"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">I confirm that all submitted details and uploaded government certificates are completely authentic and belong to me.</span>
                </label>
              </div>
            )}

            {/* Form Nav Buttons */}
            <div className="mt-6 flex justify-between border-t border-slate-200/60 dark:border-slate-800 pt-4">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 0 || isUploading}
                className="text-slate-500"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />Back
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isUploading}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  {isUploading ? "Validating..." : "Continue"}<ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isUploading}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold gap-1.5"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Submit Driver Profile"}
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
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-4 p-10 text-center flex flex-col items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-500 animate-pulse dark:bg-amber-950/20">
            <BadgeCheck className="h-8 w-8" />
          </span>
          <StatusBadge status="pending" className="mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Verification Submitted Successfully</h1>
          <p className="text-slate-500 text-sm max-w-md">
            Your documents are under review. Our operations team reviews all applications manually. 
            Estimated verification time is <strong>24-48 hours</strong>. You can continue booking carpool rides as a passenger in the meantime.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700"><Link to="/find-ride">Find a Ride</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Go to Dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifiedState() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="border border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-4 p-10 text-center flex flex-col items-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <StatusBadge status="verified" className="mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Verification Approved</h1>
          <p className="text-slate-500 text-sm max-w-md">
            Congratulations! You are now a verified driver. You can configure routes, schedule carpool timings, and offer rides to neighbors.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button asChild className="bg-blue-600 hover:bg-blue-700"><Link to="/offer-ride">Offer a Ride</Link></Button>
            <Button asChild variant="outline"><Link to="/dashboard">Go to Dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
