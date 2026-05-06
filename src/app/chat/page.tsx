"use client";

import { useTranslation } from "@/contexts/LanguageContext";
import { AgentChat } from "@/components/AgentChat";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function ChatPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[var(--foreground)] opacity-50">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-[var(--error)] uppercase tracking-widest mb-4">Access Denied</h1>
        <p className="text-[var(--foreground)] opacity-50 text-center">
          You must be logged in to access the Meta-Agent Chat. Please authenticate in the Settings page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--primary)] uppercase tracking-widest">Meta-Agent Chat</h1>
        <p className="text-[var(--foreground)] opacity-50 mt-1">Talk to Gemma 4 about your registered agents and their activity on the platform.</p>
      </div>

      <AgentChat />
    </div>
  );
}
