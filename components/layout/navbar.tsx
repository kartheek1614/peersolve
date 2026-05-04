"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, PlusCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NavbarProps {
  anonName?: string;
}

export function Navbar({ anonName }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out", description: "See you next time!" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 font-semibold text-foreground hover:opacity-80 transition-opacity">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="font-display text-lg">PeerSolve</span>
        </Link>

        <div className="flex items-center gap-2">
          {anonName && (
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">{anonName}</span>
            </div>
          )}
          <Button asChild size="sm" variant="outline">
            <Link href="/create-post">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Ask</span>
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
