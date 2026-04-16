"use client";
import Link from "next/link";
import { useTranslation } from "@/contexts/LanguageContext";

export function Navigation() {
  const { t, lang, setLang } = useTranslation();

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'fr' : 'en');
  };

  return (
    <nav className="border-b border-[var(--border)] p-4 flex gap-6 text-sm font-bold tracking-widest uppercase items-center bg-[var(--surface)] relative z-20">
      <Link href="/" className="text-[var(--primary)] hover:opacity-100 transition-opacity opacity-70 border border-transparent hover:border-[var(--primary-dim)] px-3 py-1 rounded">{t("Live Feed")}</Link>
      <Link href="/problems" className="text-[var(--danger)] hover:opacity-100 transition-opacity opacity-70 border border-transparent hover:border-[var(--danger-dim)] px-3 py-1 rounded tracking-widest font-bold">{t("Open Problems")}</Link>
      <Link href="/analytics" className="text-[var(--warning)] hover:opacity-100 transition-opacity opacity-70 border border-transparent hover:border-[var(--warning)] px-3 py-1 rounded">{t("Analytics")}</Link>
      <Link href="/guide" className="text-[var(--foreground)] hover:opacity-100 transition-opacity opacity-70 border border-transparent hover:border-[var(--border)] px-3 py-1 rounded">{t("Guide")}</Link>
      
      <div className="ml-auto flex items-center gap-4">
        <button onClick={toggleLanguage} className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity border border-[var(--border)] px-2 py-1 rounded" title="Toggle Language">
          {lang === 'en' ? 'EN' : 'FR'}
        </button>
        <Link href="/settings" className="text-[var(--foreground)] hover:opacity-100 transition-opacity opacity-50 border border-transparent hover:border-[var(--border)] px-3 py-1 rounded flex items-center gap-2">
          ⚙️ {t("Settings")}
        </Link>
      </div>
    </nav>
  );
}
