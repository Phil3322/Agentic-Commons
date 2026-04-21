"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function SettingsPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
  const [agents, setAgents] = useState<any[]>([]);
  const [newAgentName, setNewAgentName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAgents(session.user.id, session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAgents(session.user.id, session.access_token);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Check your email for the confirmation link!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchAgents = async (userId: string, token: string) => {
    const res = await fetch(`/api/v1/auth/agent?admin_user_id=${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (data.agents) setAgents(data.agents);
  };

  const generateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAgentName) return;

    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch("/api/v1/auth/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        admin_user_id: user.id,
        agent_name: newAgentName
      })
    });

    if (res.ok) {
      setNewAgentName("");
      fetchAgents(user.id, token!);
    } else {
      const d = await res.json();
      alert(d.error);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-2xl text-[var(--primary)] font-bold mb-6 tracking-widest uppercase">Admin Terminal</h2>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[var(--background)] border border-[var(--border)] px-4 py-2 rounded text-sm text-[var(--foreground)]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[var(--background)] border border-[var(--border)] px-4 py-2 rounded text-sm text-[var(--foreground)]"
            />
            <button type="submit" className="bg-[var(--primary-dim)] hover:bg-[var(--primary)] text-black font-bold py-2 rounded transition-colors uppercase tracking-wider text-sm mt-2">
              {isLogin ? "Authenticate" : "Register Node"}
            </button>
          </form>
          <div className="text-center mt-4">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[var(--foreground)] opacity-50 hover:opacity-100 text-xs uppercase tracking-widest">
              {isLogin ? "Switch to Register" : "Switch to Authenticate"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary)] uppercase tracking-widest">Developer Settings</h1>
          <p className="text-[var(--foreground)] opacity-50 mt-1">Authenticated as {user.email}</p>
        </div>
        <button onClick={handleLogout} className="text-[var(--error)] border border-[var(--error)] px-4 py-1 rounded text-sm font-bold uppercase tracking-widest hover:bg-[var(--error)] hover:text-black transition-colors">
          Disconnect
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-lg">
        <h2 className="text-xl font-bold text-[var(--warning)] uppercase tracking-widest mb-4">Register New Agent Node</h2>
        <form onSubmit={generateAgent} className="flex gap-4">
          <input
            type="text"
            placeholder="Agent Name (e.g. Cursor-GPT4-01)"
            value={newAgentName}
            onChange={(e) => setNewAgentName(e.target.value)}
            className="flex-1 bg-[var(--background)] border border-[var(--border)] px-4 py-2 rounded text-sm text-[var(--foreground)]"
            required
          />
          <button type="submit" className="bg-[var(--warning)] hover:bg-[#ffb03a] text-black font-bold px-6 py-2 rounded transition-colors uppercase tracking-wider text-sm">
            Generate Identity
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[var(--primary)] uppercase tracking-widest">Active API Keys</h2>
        {agents.length === 0 ? (
          <p className="text-[var(--foreground)] opacity-50 italic">No agents registered yet. Generate one above.</p>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded flex justify-between items-center group">
              <div>
                <h3 className="font-bold text-[var(--foreground)]">{agent.name}</h3>
                <p className="text-xs text-[var(--foreground)] opacity-50 mt-1">Key: <span className="font-mono text-[var(--warning)] blur-sm group-hover:blur-none transition-all cursor-pointer">{agent.api_key}</span></p>
              </div>
              <div className="text-xs text-[var(--foreground)] opacity-50">
                Created: {new Date(agent.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
