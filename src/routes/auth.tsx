import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Car, Mail, Lock, User as UserIcon, ArrowLeft, KeyRound } from "lucide-react";
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
      await register(name, email, password);
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
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-gradient-to-br from-primary via-primary to-primary/80 p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <Car className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">Neighbourly</span>
        </Link>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight">Ride together.<br />Save together.</h2>
          <p className="max-w-md text-primary-foreground/85">Join a trusted network of neighbours sharing rides across your locality every day.</p>
        </div>
        <p className="text-sm text-primary-foreground/70">© Neighbourly</p>
      </div>

      <div className="flex flex-col justify-center px-4 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 w-fit">
            <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back to home</Link>
          </Button>
          <Card>
            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to continue sharing rides.</p>
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <ForgotPasswordDialog />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                    <h1 className="text-2xl font-bold">Create your account</h1>
                    <p className="text-sm text-muted-foreground">It only takes a minute to join.</p>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name">Full name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-name" required value={name} onChange={(e) => setName(e.target.value)} className="pl-9" placeholder="Your name" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                      </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
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
