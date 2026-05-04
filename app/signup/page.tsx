"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { generateAnonName } from "@/lib/anon-names";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [anonName] = useState(() => generateAnonName());
  const [previewName, setPreviewName] = useState(anonName);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      // 2. Insert user profile with anon name
      const { error: profileError } = await supabase
        .from("users")
        .insert({ id: authData.user.id, email, anon_name: previewName });

      if (profileError) throw profileError;

      toast({ title: "Account created!", description: `Your identity: ${previewName}` });
      router.push("/feed");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed.";
      toast({ title: "Signup failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshName = () => setPreviewName(generateAnonName());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight">PeerSolve</span>
          </div>
          <p className="text-sm text-muted-foreground">Anonymous student Q&A</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Create account</CardTitle>
            <CardDescription>Join anonymously. Your identity stays private.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              {/* Anonymous Identity Preview */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-xs text-muted-foreground mb-1.5">Your anonymous identity</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary">{previewName}</span>
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={refreshName}>
                    <Shuffle className="h-3.5 w-3.5" />
                    <span className="text-xs ml-1">Shuffle</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">This name will never reveal your real identity.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
