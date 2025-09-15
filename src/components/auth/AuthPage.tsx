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

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Basic password strength check (at least 6 chars, one number, one letter)
  function isPasswordStrong(pw: string) {
    return pw.length >= 6 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error("Invalid email or password."); // generic error

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to CivicPulse.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: "Invalid email or password.", // generic message
        variant: "destructive",
      });
    } finally {
      setPassword(""); // clear sensitive data
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignupError(null);

    // Validate password strength client-side
    if (!isPasswordStrong(password)) {
      setSignupError(
        "Password must be at least 6 characters and contain a number and a letter."
      );
      setLoading(false);
      return;
    }

    // Validate redirect URL is same-origin
    const redirectUrl = `${window.location.origin}/`;
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw new Error("Unable to create account. Please try again."); // generic error

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description:
          signupError || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPassword(""); // clear sensitive data
      setLoading(false);
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-civic"
                    disabled={loading}
                  >
                    {loading && (
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
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    {signupError && (
                      <p className="text-sm text-red-600">{signupError}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-civic"
                    disabled={loading}
                  >
                    {loading && (
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
