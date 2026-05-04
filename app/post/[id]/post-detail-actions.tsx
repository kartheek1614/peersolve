"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Post } from "@/types";

interface PostDetailActionsProps {
  post: Post;
  currentUserId: string;
}

export function PostDetailActions({ post, currentUserId }: PostDetailActionsProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [hasVoted, setHasVoted] = useState(post.user_has_voted ?? false);
  const [isVoting, setIsVoting] = useState(false);
  const supabase = createClient();

  const handleUpvote = async () => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      if (hasVoted) {
        await supabase.from("votes").delete().eq("user_id", currentUserId).eq("post_id", post.id);
        await supabase.from("posts").update({ upvotes: upvotes - 1 }).eq("id", post.id);
        setUpvotes((v) => v - 1);
        setHasVoted(false);
      } else {
        await supabase.from("votes").insert({ user_id: currentUserId, post_id: post.id });
        await supabase.from("posts").update({ upvotes: upvotes + 1 }).eq("id", post.id);
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
    <div className="flex flex-col items-center gap-1 pt-1 w-10 flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-full transition-colors",
          hasVoted
            ? "text-primary bg-primary/10 hover:bg-primary/20"
            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
        )}
        onClick={handleUpvote}
        disabled={isVoting}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      <span className={cn("text-sm font-semibold tabular-nums", hasVoted ? "text-primary" : "text-muted-foreground")}>
        {upvotes}
      </span>
    </div>
  );
}
