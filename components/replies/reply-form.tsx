"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Reply } from "@/types";

interface ReplyFormProps {
  postId: string;
  currentUserId: string;
  anonName: string;
  onReplyAdded: (reply: Reply) => void;
}

export function ReplyForm({ postId, currentUserId, anonName, onReplyAdded }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("replies")
        .insert({ post_id: postId, user_id: currentUserId, content: content.trim() })
        .select("id, post_id, user_id, content, created_at")
        .single();

      if (error) throw error;

      onReplyAdded({ ...data, anon_name: anonName });
      setContent("");
      toast({ title: "Reply posted!" });
    } catch {
      toast({ title: "Error", description: "Could not post reply.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Share your thoughts or answer this question..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="resize-none text-sm"
        maxLength={2000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Posting as <span className="font-mono">{anonName}</span>
        </span>
        <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting}>
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? "Posting..." : "Post Reply"}
        </Button>
      </div>
    </form>
  );
}
