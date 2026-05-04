import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import type { Post } from "@/types";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get current user's anon name
  const { data: profile } = await supabase
    .from("users")
    .select("anon_name")
    .eq("id", user.id)
    .single();

  // Fetch posts with author anon_name and reply counts
  const { data: postsRaw, error } = await supabase
    .from("posts")
    .select(`
      id, user_id, title, content, upvotes, created_at,
      users!posts_user_id_fkey(anon_name),
      replies(count),
      votes(id)
    `)
    .order("created_at", { ascending: false });

  if (error) console.error("Feed error:", error);

  const posts: Post[] = (postsRaw ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    user_id: p.user_id as string,
    title: p.title as string,
    content: p.content as string,
    upvotes: p.upvotes as number,
    created_at: p.created_at as string,
    anon_name: (p.users as { anon_name: string } | null)?.anon_name ?? "Unknown",
    reply_count: Array.isArray(p.replies) ? (p.replies[0]?.count ?? 0) : 0,
    user_has_voted: Array.isArray(p.votes) ? p.votes.some((v: { id: string }) => v.id !== undefined) : false,
  }));

  // Check which posts the current user voted on
  const { data: userVotes } = await supabase
    .from("votes")
    .select("post_id")
    .eq("user_id", user.id);

  const votedPostIds = new Set((userVotes ?? []).map((v) => v.post_id));
  posts.forEach((p) => { p.user_has_voted = votedPostIds.has(p.id); });

  return (
    <div className="min-h-screen bg-background">
      <Navbar anonName={profile?.anon_name} />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Recent Doubts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {posts.length} question{posts.length !== 1 ? "s" : ""} from students
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/create-post">
              <PlusCircle className="h-4 w-4" />
              Ask a doubt
            </Link>
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-5xl mb-4">📚</div>
            <p className="font-medium mb-1">No questions yet</p>
            <p className="text-sm mb-4">Be the first to ask a doubt!</p>
            <Button asChild size="sm">
              <Link href="/create-post">Ask the first question</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={user.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
