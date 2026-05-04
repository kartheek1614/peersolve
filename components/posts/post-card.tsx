"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUp, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [hasVoted, setHasVoted] = useState(post.user_has_voted ?? false);
  const [isVoting, setIsVoting] = useState(false);
  const supabase = createClient();

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId || isVoting) return;

    setIsVoting(true);
    try {
      if (hasVoted) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", post.id);

        if (error) throw error;

        await supabase
          .from("posts")
          .update({ upvotes: upvotes - 1 })
          .eq("id", post.id);

        setUpvotes((v) => v - 1);
        setHasVoted(false);
      } else {
        const { error } = await supabase
          .from("votes")
          .insert({ user_id: currentUserId, post_id: post.id });

        if (error) throw error;

        await supabase
          .from("posts")
          .update({ upvotes: upvotes + 1 })
          .eq("id", post.id);

        setUpvotes((v) => v + 1);
        setHasVoted(true);
      }
    } catch {
      toast({ title: "Error", description: "Could not register vote.", variant: "destructive" });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <Card className="hover:border-primary/30 transition-colors group">
      <Link href={`/post/${post.id}`} className="block">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Upvote column */}
            <div className="flex flex-col items-center gap-1 pt-0.5">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full transition-colors",
                  hasVoted
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                )}
                onClick={handleUpvote}
                disabled={!currentUserId || isVoting}
                aria-label={hasVoted ? "Remove upvote" : "Upvote"}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className={cn("text-xs font-semibold tabular-nums", hasVoted ? "text-primary" : "text-muted-foreground")}>
                {upvotes}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-1.5">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {truncate(post.content, 160)}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">
                  {post.anon_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(post.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.reply_count ?? 0} {post.reply_count === 1 ? "reply" : "replies"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
