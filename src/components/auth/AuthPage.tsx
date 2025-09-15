import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Users, Shield, MessageSquare } from "lucide-react";

function isPasswordStrong(password: string) {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function AuthPage() {
  // Separate state for sign-in and sign-up
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [signUp, setSignUp] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState({ signin: false, signup: false });
  const [error, setError] = useState({ signin: "", signup: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Generic input handler
  const handleInput =
    (form: "signin" | "signup", field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (form === "signin") {
        setSignIn((prev) => ({ ...prev, [field]: e.target.value }));
      } else {
        setSignUp((prev) => ({ ...prev, [field]: e.target.value }));
      }
      setError((prev) => ({ ...prev, [form]: "" }));
    };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, signin: true }));
    setError((prev) => ({ ...prev, signin: "" }));

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signIn.email,
        password: signIn.password,
      });

      if (signInError) throw new Error("Invalid email or password.");

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to CivicPulse.",
      });

      setSignIn({ email: "", password: "" });
      navigate("/");
    } catch (err: any) {
      setError((prev) => ({
        ...prev,
        signin: "Invalid email or password.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, signin: false }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, signup: true }));
    setError((prev) => ({ ...prev, signup: "" }));

    if (!isPasswordStrong(signUp.password)) {
      setError((prev) => ({
        ...prev,
        signup: "Password must be at least 6 characters and contain a number and a letter.",
      }));
      setLoading((prev) => ({ ...prev, signup: false }));
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: signUp.email,
        password: signUp.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signUp.fullName,
          },
        },
      });

      if (signUpError) throw new Error("Unable to create account. Please try again.");

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      setSignUp({ fullName: "", email: "", password: "" });
      navigate("/");
    } catch (err: any) {
      setError((prev) => ({
        ...prev,
        signup: "Unable to create account. Please try again.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, signup: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent">
              CivicPulse
            </h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              Empower Your Community
            </h2>
            <p className="text-xl text-muted-foreground">
              Report civic issues, track their progress, and make your
              neighborhood a better place to live.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-card shadow-card">
              <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Location-Based Reporting</h3>
                <p className="text-sm text-muted-foreground">
                  Report issues with precise location tracking
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-card shadow-card">
              <Users className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Community Voting</h3>
                <p className="text-sm text-muted-foreground">
                  Prioritize issues through community support
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-card shadow-card">
              <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Real-Time Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Follow issue status from report to resolution
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 rounded-lg bg-card shadow-card">
              <MessageSquare className="h-6 w-6 text-success flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Community Discussion</h3>
                <p className="text-sm text-muted-foreground">
                  Collaborate and discuss solutions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="shadow-civic">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Join your community in making positive change
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="signin" className="w-full">
            <CardContent className="pb-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardContent>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} autoComplete="off">
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signIn.email}
                      onChange={handleInput("signin", "email")}
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signIn.password}
                      onChange={handleInput("signin", "password")}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {error.signin && (
                    <p className="text-sm text-red-600">{error.signin}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-civic"
                    disabled={loading.signin}
                  >
                    {loading.signin && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} autoComplete="off">
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullName">Full Name</Label>
                    <Input
                      id="signup-fullName"
                      placeholder="John Doe"
                      value={signUp.fullName}
                      onChange={handleInput("signup", "fullName")}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUp.email}
                      onChange={handleInput("signup", "email")}
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minimum 6 characters, include a number"
                      value={signUp.password}
                      onChange={handleInput("signup", "password")}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  {error.signup && (
                    <p className="text-sm text-red-600">{error.signup}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-civic"
                    disabled={loading.signup}
                  >
                    {loading.signup && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
