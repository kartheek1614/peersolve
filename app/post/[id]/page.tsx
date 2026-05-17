import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Clock, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/utils";
import { PostDetailActions } from "./post-detail-actions";
import type { Reply } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get current user's anon name
  const { data: profile } = await supabase
    .from("users")
    .select("anon_name")
    .eq("id", user.id)
    .single();

  // Fetch post with author
  const { data: post } = await supabase
    .from("posts")
    .select(`
      id, user_id, title, content, upvotes, created_at,
      users!posts_user_id_fkey(anon_name)
    `)
    .eq("id", params.id)
    .single();

  if (!post) notFound();

  // Check if user voted on this post
  const { data: vote } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", params.id)
    .maybeSingle();

  // Fetch replies with author names
  const { data: repliesRaw } = await supabase
    .from("replies")
    .select(`
      id, post_id, user_id, content, created_at,
      users!replies_user_id_fkey(anon_name)
    `)
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  const replies: Reply[] = (repliesRaw ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    post_id: r.post_id as string,
    user_id: r.user_id as string,
    content: r.content as string,
    created_at: r.created_at as string,
    anon_name: (r.users as { anon_name: string } | null)?.anon_name ?? "Unknown",
  }));

  const postData = {
    id: post.id,
    user_id: post.user_id,
    title: post.title,
    content: post.content,
    upvotes: post.upvotes,
    created_at: post.created_at,
    anon_name: (post.users as unknown as { anon_name: string }[] | null)?.[0]?.anon_name ?? "Unknown",
    user_has_voted: !!vote,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/feed">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold text-sm truncate">{post.title}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Post */}
        <div className="space-y-4">
          <div className="flex gap-4">
            {/* Upvote */}
            <PostDetailActions
              post={postData}
              currentUserId={user.id}
            />
            {/* Post content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold leading-snug mb-3">{post.title}</h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
  {(post.users as unknown as { anon_name: string }[] | null)?.[0]?.anon_name ?? "Unknown"}
</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(post.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                </span>
              </div>
              <div className="prose prose-sm max-w-none text-foreground/90">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Replies section */}
        <PostDetailReplies
          postId={params.id}
          initialReplies={replies}
          currentUserId={user.id}
          anonName={profile?.anon_name ?? ""}
        />
      </main>
    </div>
  );
}

// Import here to avoid circular deps
import { PostDetailReplies } from "./post-detail-replies";
