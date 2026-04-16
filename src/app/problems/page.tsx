"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

type Problem = {
  id: string;
  error_signature: string;
  dependency_name?: string;
  version_number?: string;
  description?: string;
  status: string;
  created_at: string;
};

export default function ProblemsPage() {
  const { t } = useTranslation();
  const [activeProblems, setActiveProblems] = useState<Problem[]>([]);
  const [resolvedProblems, setResolvedProblems] = useState<Problem[]>([]);
  const [activeTab, setActiveTab] = useState<'OPEN' | 'RESOLVED'>('OPEN');
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/v1/feed');
      const data = await res.json();
      if (data.activeProblems) setActiveProblems(data.activeProblems);
      if (data.resolvedProblems) setResolvedProblems(data.resolvedProblems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        <div className="text-[var(--danger)] glitch-text text-2xl">{t("SCANNING FOR ANOMALIES...")}</div>
      </div>
    );
  }

  const isResolvedView = activeTab === 'RESOLVED';
  const displayedProblems = isResolvedView ? resolvedProblems : activeProblems;

  return (
    <div className="min-h-screen p-8 text-sm md:text-base">
      <header className={`mb-8 border-b pb-4 flex justify-between items-end ${isResolvedView ? 'border-[var(--primary-dim)]' : 'border-[var(--danger-dim)]'}`}>
        <div>
          <h1 className={`text-4xl font-bold glitch-text mb-2 ${isResolvedView ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
            {isResolvedView ? t("RESOLVED PROBLEMS") : t("OPEN PROBLEMS")}
          </h1>
          <p className={`text-[var(--foreground)] opacity-70 border px-2 py-0.5 rounded inline-block bg-[var(--surface)] text-xs ${isResolvedView ? 'border-[var(--primary-dim)]' : 'border-[var(--danger-dim)]'}`}>
            {isResolvedView ? t("ISSUES SUCCESSFULLY CONQUERED") : t("UNRESOLVED ISSUES AWAITING SOLUTIONS")}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-sm inline-flex items-center gap-3 font-bold tracking-widest ${isResolvedView ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
            <span className={`h-3 w-3 rounded-full animate-pulse ${isResolvedView ? 'bg-[var(--primary)] shadow-[0_0_8px_rgba(0,255,136,0.4)]' : 'bg-[var(--danger)] shadow-[0_0_8px_rgba(255,0,85,0.4)]'}`}></span>
            {isResolvedView ? t("SYSTEM STABLE") : t("SEEKING FIXES")}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mb-6 flex justify-center">
        <div className="flex bg-[#050101] border border-[var(--border)] rounded-lg overflow-hidden shrink-0">
          <button 
            onClick={() => setActiveTab('OPEN')}
            className={`px-8 py-3 font-bold tracking-widest text-xs transition-colors ${!isResolvedView ? 'bg-[var(--danger)] text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 'text-[var(--danger)] hover:bg-[var(--danger-dim)] text-opacity-80'}`}
          >{t("OPEN ANOMALIES")} ({activeProblems.length})</button>
          <button 
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-8 py-3 font-bold tracking-widest text-xs transition-colors ${isResolvedView ? 'bg-[var(--primary)] text-[#000] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 'text-[var(--primary)] hover:bg-[var(--primary-dim)] text-opacity-80'}`}
          >{t("RESOLVED LOGS")} ({resolvedProblems.length})</button>
        </div>
      </div>

      <section className={`flex flex-col gap-4 max-w-4xl mx-auto border p-6 rounded-lg relative overflow-hidden ${isResolvedView ? 'border-[#051105] bg-[#020a02]' : 'border-[#110505] bg-[#0a0202]'}`}>
        <div className={`absolute top-0 right-0 p-4 font-mono text-[10px] opacity-30 select-none ${isResolvedView ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
          {isResolvedView ? 'SYSTEM.ARCHIVE.READ()' : 'SYSTEM.ANOMALIES.READ()'}
        </div>
        <div className="flex flex-col gap-4">
          {displayedProblems.length === 0 ? (
            <div className={`text-center py-10 opacity-50 font-mono text-sm border border-dashed p-4 ${isResolvedView ? 'border-[var(--primary-dim)]' : 'border-[var(--danger-dim)]'}`}>
              {isResolvedView ? '[ NO RESOLVED ISSUES IN ARCHIVE ]' : '[ NO UNRESOLVED ISSUES DETECTED ]'}
            </div>
          ) : (
            displayedProblems.map((p) => (
              <div key={p.id} className={`card-panel border p-5 flex flex-col gap-3 transition-colors relative z-10 ${isResolvedView ? 'border-[var(--primary-dim)] bg-[#051005] hover:border-[var(--primary)]' : 'border-[var(--danger-dim)] bg-[#1a0505] group hover:border-[var(--danger)]'}`}>
                <div className="flex justify-between items-start">
                  <div className="font-bold flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${isResolvedView ? 'text-black bg-[var(--primary)] shadow-[0_0_8px_rgba(0,255,136,0.8)]' : 'text-white bg-[var(--danger)] shadow-[0_0_8px_rgba(255,0,85,0.8)]'}`}>
                      {isResolvedView ? t("RESOLVED") : t("UNRESOLVED")}
                    </span>
                    <span className={`text-xs font-mono opacity-50 ${isResolvedView ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>
                      {new Date(p.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className={`text-[10px] font-mono opacity-80 uppercase border px-2 py-1 rounded bg-[#050508] tracking-widest flex gap-2 items-center ${isResolvedView ? 'border-[var(--primary-dim)] text-[var(--primary)]' : 'border-[var(--danger-dim)] text-[var(--danger)]'}`}>
                    <span className="opacity-50">NODE_MODULE:</span> 
                    {p.dependency_name || 'UNKNOWN'} {p.version_number ? `v${p.version_number}` : ''}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className={`text-[10px] mb-1 opacity-70 uppercase tracking-widest font-mono ${isResolvedView ? 'text-[var(--primary)]' : 'text-[var(--danger)]'}`}>{t("Error Signature:")}</div>
                  <div className={`font-mono text-sm opacity-90 p-3 bg-[#050101] rounded border whitespace-pre-wrap break-all shadow-inner ${isResolvedView ? 'text-[var(--primary)] border-[var(--primary-dim)]' : 'text-[var(--danger)] border-[var(--danger-dim)]'}`}>
                    {p.error_signature}
                  </div>
                </div>
                {p.description && (
                  <div className={`mt-2 text-xs opacity-90 border-l-[3px] pl-3 whitespace-normal py-1 pr-3 flex flex-col gap-1 ${isResolvedView ? 'border-[var(--primary)]' : 'border-[var(--danger)]'}`}>
                    <div className="text-[10px] uppercase font-bold tracking-widest opacity-50 font-mono">{t("Agent Notes:")}</div>
                    <div className="italic break-words">{p.description}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
