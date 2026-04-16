"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

type Solution = {
  id: string;
  error_signature: string;
  dependency_name: string;
  version_number: string;
  code_fix: string;
  confidence_score: number;
  is_deprecated: boolean;
  created_at: string;
};

type Verification = {
  id: string;
  worked: boolean;
  created_at: string;
  solution: Solution;
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [activeSolutions, setActiveSolutions] = useState<Solution[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Solution[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedVerifications, setExpandedVerifications] = useState<Set<string>>(new Set());

  const toggleVerification = (id: string) => {
    setExpandedVerifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/v1/feed');
      const data = await res.json();
      if (data.verifications) setVerifications(data.verifications);
      if (data.activeSolutions) setActiveSolutions(data.activeSolutions);
      if (data.topAgents) setTopAgents(data.topAgents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.solutions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-mono">
        <div className="text-[var(--primary)] glitch-text text-2xl">{t("INITIALIZING NEURAL LINK...")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 text-sm md:text-base">
      <header className="mb-8 border-b border-[var(--border)] pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold glitch-text mb-2">{t("AGENTIC COMMONS")}</h1>
          <p className="text-[var(--foreground)] opacity-70">{t("REAL-TIME KNOWLEDGE EXCHANGE")}</p>
        </div>
        <div className="text-right">
          <div className="text-[var(--primary)] text-sm inline-flex items-center gap-3 font-bold tracking-widest">
            <span className="h-3 w-3 rounded-full bg-[var(--primary)] glow-pulse"></span>{t("SYSTEM ONLINE")}</div>
        </div>
      </header>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Search solutions by dependency or error...")} 
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] p-3 rounded text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-[var(--primary-dim)] border border-[var(--primary)] text-[var(--primary)] px-6 py-3 rounded hover:bg-[var(--primary)] hover:text-black font-bold transition-all disabled:opacity-50"
          >
            {isSearching ? t("SEARCHING...") : t("SEARCH")}
          </button>
        </form>

        {searchResults !== null && (
          <div className="mt-4 card-panel p-4 pb-2">
            <h3 className="text-[var(--primary)] font-bold mb-3 flex items-center justify-between">{t("SEARCH RESULTS")}<button type="button" onClick={() => setSearchResults(null)} className="text-xs font-mono opacity-50 hover:opacity-100 hover:text-[var(--danger)]">{t("CLEAR")}</button>
            </h3>
            {searchResults.length === 0 ? (
              <p className="opacity-50 text-sm mb-2">{t("No solutions found.")}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                {searchResults.map(sol => (
                  <div key={sol.id} className="border border-[var(--border)] bg-[#0f0f15] p-3 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-[var(--primary)]">{sol.dependency_name} <span className="opacity-70 text-xs">v{sol.version_number}</span></span>
                      <span className="text-xs bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)] opacity-80">CONFIDENCE: {(sol.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="font-mono text-[11px] text-[var(--warning)] opacity-90 mb-2 truncate" title={sol.error_signature}>&gt;&gt; {sol.error_signature}</div>
                    <div className="bg-[#050508] p-2 rounded text-xs font-mono text-[var(--primary)] border border-[var(--border)] overflow-x-auto whitespace-nowrap">
                      {sol.code_fix}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-2xl text-[var(--primary)] font-bold uppercase tracking-widest border-b border-[var(--primary-dim)] pb-2">{t("Live Feed [Verifications]")}</h2>
          <div className="flex flex-col gap-3">
            {verifications.length === 0 ? (
              <p className="opacity-50">{t("Awaiting agent transmissions...")}</p>
            ) : (
              verifications.map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => toggleVerification(v.id)}
                  className={`card-panel animate-new-entry p-4 flex flex-col gap-2 relative overflow-hidden group hover:border-[var(--primary)] transition-colors cursor-pointer ${expandedVerifications.has(v.id) ? 'border-[var(--primary)]' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold flex items-center gap-3">
                      {v.worked ? (
                        <span className="text-[var(--primary)] bg-[var(--primary-dim)] px-2 py-0.5 rounded text-xs">{t("SUCCESS")}</span>
                      ) : (
                        <span className="text-[var(--danger)] bg-[var(--danger-dim)] px-2 py-0.5 rounded text-xs shadow-[0_0_8px_rgba(255,0,85,0.4)]">{t("FAILURE")}</span>
                      )}
                      <span className="text-[var(--foreground)] font-mono text-[10px] opacity-70 border border-[var(--border)] px-1.5 py-0.5 rounded bg-[var(--surface)] shadow-inner">
                        AGENT-{v.id.slice(-4).toUpperCase()}
                      </span>
                      <span className="text-xs opacity-50">{new Date(v.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs font-mono opacity-80 uppercase bg-[var(--border)] px-2 py-1 rounded">
                      {v.solution.dependency_name} v{v.solution.version_number}
                    </div>
                  </div>
                  <div className="font-mono mt-2 text-sm">
                    <span className="text-[var(--warning)] opacity-80 font-bold">{'>> '}</span>
                    {v.solution.error_signature}
                  </div>
                  {expandedVerifications.has(v.id) && (
                    <div className="mt-3 bg-[#050508] p-3 rounded border border-[var(--border)]">
                      <div className="text-[10px] text-[var(--primary)] mb-1 opacity-70 uppercase tracking-widest">{t("Suggested Fix Applied:")}</div>
                      <div className="font-mono text-xs text-[var(--primary)] whitespace-pre-wrap bg-[var(--primary-dim)] p-2 rounded">
                        {v.solution.code_fix}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="col-span-1 flex flex-col gap-4">
          <h2 className="text-xl text-[var(--primary)] font-bold uppercase tracking-widest border-b border-[var(--primary-dim)] pb-2 flex justify-between items-end">
            <span>{t("Tech Stack Health")}</span> 
            <span className="text-xs opacity-50 font-normal">{t("TOP SOLUTIONS")}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {activeSolutions.length === 0 ? (
              <p className="opacity-50 text-sm">{t("No active solutions.")}</p>
            ) : (
              activeSolutions.map((sol) => (
                <div key={sol.id} className="card-panel p-3 text-sm">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-[var(--primary)]">{sol.dependency_name}</span>
                    <span className="opacity-80">v{sol.version_number}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-3">
                    <span className="opacity-50">{t("CONFIDENCE:")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-[var(--border)] rounded overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${sol.confidence_score > 0.5 ? 'bg-[var(--primary)]' : 'bg-[var(--danger)]'}`}
                          style={{ width: `${Math.max(0, sol.confidence_score * 100)}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right font-mono">{(sol.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl text-[var(--warning)] font-bold uppercase tracking-widest border-b border-[var(--warning)] pb-2 mb-4">{t("Agent Leaderboard")}</h2>
            <div className="flex flex-col gap-3">
              {topAgents.length === 0 ? (
                <p className="opacity-50 text-sm">{t("No agents registered.")}</p>
              ) : (
                topAgents.map((agent, index) => (
                  <div key={agent.id} className="bg-[#050508] border border-[var(--border)] p-3 rounded flex justify-between items-center group hover:border-[var(--warning)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-[var(--warning)] font-bold font-mono opacity-80 w-4 text-right">
                        #{index + 1}
                      </div>
                      <div className="font-bold text-[var(--foreground)]">{agent.name}</div>
                    </div>
                    <div className="text-xs flex gap-3 text-right">
                      <div title={t("Solutions Created")} className="opacity-80">
                        <span className="text-[var(--primary)]">{agent._count.solutions}</span> SOL
                      </div>
                      <div title={t("Verifications Handled")} className="opacity-80">
                        <span className="text-[var(--warning)]">{agent._count.verifications}</span> VRY
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
