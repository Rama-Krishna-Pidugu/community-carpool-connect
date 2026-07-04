import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Car, Mail, Lock, User as UserIcon, ArrowLeft, KeyRound, Phone } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Neighbourly" },
      { name: "description", content: "Sign in or create your Neighbourly account to start sharing rides in your neighbourhood." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const confirmOTP = useAppStore((s) => s.confirmOTP);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password, phone);
      toast.success("Account created. Please check your email for the OTP.");
      setShowOtpDialog(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await confirmOTP(email, otp);
      toast.success("Email verified successfully! Logging you in...");
      setShowOtpDialog(false);
      // Auto login after confirm
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-slate-50/50 dark:bg-slate-950/20">
      {/* Premium Light-Themed Left Sidebar */}
      <div className="relative hidden bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-100/50 p-12 text-slate-900 lg:flex lg:flex-col lg:justify-between border-r border-slate-200/60 dark:border-slate-800/40 overflow-hidden">
        {/* Soft Glowing Backdrops */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <Link to="/" className="relative z-10 w-fit transition-opacity hover:opacity-90">
          <img 
            src="/neighbourly_logo_v3_navbar.svg" 
            alt="Neighbourly" 
            className="h-10 w-auto" 
          />
        </Link>

        <div className="relative z-10 space-y-6 max-w-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 p-8 rounded-3xl shadow-xl shadow-slate-100/50 dark:shadow-none backdrop-blur-sm">
          <h2 className="text-4xl font-extrabold leading-[1.15] tracking-tight bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Ride together.<br />
            Save together.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Join a trusted network of verified neighbours sharing rides and building community across your locality every day.
          </p>
        </div>
        
        <p className="relative z-10 text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
          © {new Date().getFullYear()} NEIGHBOURLY
        </p>
      </div>

      {/* Auth Card Center Column */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-[440px]">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <Link to="/"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to home</Link>
          </Button>
          <Card className="border-slate-200/80 bg-white shadow-2xl shadow-slate-100/60 dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-none backdrop-blur-sm">
            <CardContent className="p-8">
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <TabsTrigger value="signin" className="rounded-lg text-xs font-bold py-2">Sign in</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg text-xs font-bold py-2">Sign up</TabsTrigger>
                </TabsList>
 
                <TabsContent value="signin" className="outline-none">
                  <form onSubmit={handleSignIn} className="mt-8 space-y-4">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
                      <p className="text-xs text-muted-foreground">Sign in to continue sharing rides.</p>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="signin-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signin-email" type="email" placeholder="name@domain.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-primary dark:border-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signin-password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-primary dark:border-slate-700" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <ForgotPasswordDialog />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg bg-primary hover:bg-primary/95 text-white">
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>
 
                <TabsContent value="signup" className="outline-none">
                  <form onSubmit={handleSignUp} className="mt-8 space-y-4">
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
                      <p className="text-xs text-muted-foreground">It only takes a minute to join.</p>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="signup-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">Full name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-name" required value={name} onChange={(e) => setName(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-primary dark:border-slate-700" placeholder="Rohan Das" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-phone" type="tel" placeholder="+91 98765 43210" required value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-primary dark:border-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-email" type="email" placeholder="name@domain.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-primary dark:border-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-primary dark:border-slate-700" />
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-semibold shadow-md transition-all hover:shadow-lg bg-primary hover:bg-primary/95 text-white">
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify your email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit confirmation code to <strong>{email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="otp">Confirmation Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="otp" 
                  required 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  className="pl-9" 
                  placeholder="123456" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Verifying..." : "Verify & Sign in"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-xs font-medium text-primary hover:underline">Forgot password?</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>Enter your email and we'll send you a reset link.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="fp-email">Email</Label>
          <Input id="fp-email" type="email" placeholder="you@example.com" />
        </div>
        <DialogFooter>
          <Button onClick={() => { toast.success("Reset link sent"); setOpen(false); }}>Send reset link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
