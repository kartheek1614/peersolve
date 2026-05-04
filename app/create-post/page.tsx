"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data, error } = await supabase
        .from("posts")
        .insert({ user_id: user.id, title: title.trim(), content: content.trim(), upvotes: 0 })
        .select("id")
        .single();

      if (error) throw error;

      toast({ title: "Question posted!", description: "Your doubt has been shared anonymously." });
      router.push(`/post/${data.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/feed">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold">Ask a Question</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>New Doubt</CardTitle>
            <CardDescription>
              Ask anonymously. Your identity is never revealed.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Question Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Why does recursion cause a stack overflow?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">{title.length}/200</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Details</Label>
                <Textarea
                  id="content"
                  placeholder="Describe your doubt in detail. Include what you've tried, what you understand, and where you're stuck..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={8}
                  maxLength={5000}
                  className="resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground">{content.length}/5000</p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button type="submit" disabled={!title.trim() || !content.trim() || isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Posting..." : "Post Question"}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link href="/feed">Cancel</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
