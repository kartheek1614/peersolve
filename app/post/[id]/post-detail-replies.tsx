"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ReplyCard } from "@/components/replies/reply-card";
import { ReplyForm } from "@/components/replies/reply-form";
import type { Reply } from "@/types";

interface PostDetailRepliesProps {
  postId: string;
  initialReplies: Reply[];
  currentUserId: string;
  anonName: string;
}

export function PostDetailReplies({
  postId,
  initialReplies,
  currentUserId,
  anonName,
}: PostDetailRepliesProps) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies);

  const handleReplyAdded = (reply: Reply) => {
    setReplies((prev) => [...prev, reply]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>
      </div>

      {/* Reply form */}
      <div className="border rounded-lg p-4 bg-card">
        <ReplyForm
          postId={postId}
          currentUserId={currentUserId}
          anonName={anonName}
          onReplyAdded={handleReplyAdded}
        />
      </div>

      {/* Replies list */}
      {replies.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">No replies yet. Be the first to help!</p>
        </div>
      ) : (
        <div className="border rounded-lg bg-card px-4">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
