import { Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Reply } from "@/types";

interface ReplyCardProps {
  reply: Reply;
  currentUserId?: string;
}

export function ReplyCard({ reply, currentUserId }: ReplyCardProps) {
  const isOwn = reply.user_id === currentUserId;

  return (
    <div className="flex gap-3 py-4 border-b border-border/50 last:border-0 animate-fade-in">
      <div className="flex-shrink-0 mt-0.5">
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-semibold text-muted-foreground">
          {reply.anon_name?.charAt(0) ?? "?"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground/80">
            {reply.anon_name}
          </span>
          {isOwn && (
            <span className="text-[10px] text-primary font-medium uppercase tracking-wide">you</span>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(reply.created_at)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {reply.content}
        </p>
      </div>
    </div>
  );
}
