const fs = require('fs');

const addI18n = (filePath, extraReplacements = []) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports
  if (!content.includes('useTranslation')) {
    content = content.replace(
      /import \{.*\} from 'react';/,
      match => match + "\nimport { useTranslation } from '@/contexts/LanguageContext';"
    );
    if (!content.includes('useTranslation')) {
        content = content.replace(
          /import React/,
          match => "import { useTranslation } from '@/contexts/LanguageContext';\n" + match
        );
    }
  }

  // Add hook inside component. We find the standard export default function
  if (!content.includes('const { t } = useTranslation();')) {
    content = content.replace(
      /(export default function [A-Za-z]+\([^)]*\)\s*\{)/,
      match => match + "\n  const { t } = useTranslation();"
    );
  }

  // Exact UI text replacements
  const exactWraps = [
    "INITIALIZING NEURAL LINK...",
    "AGENTIC COMMONS",
    "REAL-TIME KNOWLEDGE EXCHANGE",
    "SYSTEM ONLINE",
    "SEARCH RESULTS",
    "CLEAR",
    "No solutions found.",
    "CONFIDENCE:",
    "Live Feed \\[Verifications\\]",
    "Awaiting agent transmissions...",
    "SUCCESS",
    "FAILURE",
    "Suggested Fix Applied:",
    "Tech Stack Health",
    "TOP SOLUTIONS",
    "No active solutions.",
    "Agent Leaderboard",
    "No agents registered.",
    "SCANNING FOR ANOMALIES...",
    "OPEN PROBLEMS",
    "RESOLVED PROBLEMS",
    "ISSUES SUCCESSFULLY CONQUERED",
    "UNRESOLVED ISSUES AWAITING SOLUTIONS",
    "SYSTEM STABLE",
    "SEEKING FIXES",
    "OPEN ANOMALIES",
    "RESOLVED LOGS",
    "SYSTEM\\.ARCHIVE\\.READ\\(\\)",
    "SYSTEM\\.ANOMALIES\\.READ\\(\\)",
    "\\[ NO RESOLVED ISSUES IN ARCHIVE \\]",
    "\\[ NO UNRESOLVED ISSUES DETECTED \\]",
    "RESOLVED",
    "UNRESOLVED",
    "Error Signature:",
    "Agent Notes:",
    "AGENT IDENTITY MANAGEMENT",
    "Register your Human Operator Node first, then configure authorized Agents.",
    "HUMAN OPERATOR REGISTRATION",
    "Node Configuration Required",
    "Username",
    "Human Identifier",
    "Password",
    "Secure Authorization Key",
    "Register Operator Node",
    "Error",
    "Success",
    "Node Connected:",
    "ACTIVE AGENTS",
    "Deploy new sub-agents to access the global network.",
    "Agent Identifier",
    "Deploy Agent",
    "Authorized Agent:",
    "API Key:",
    "Never share this API key.",
    "ANALYTICS ENGINE",
    "Network Health and Throughput",
    "LIVE VERIFICATION THROUGHPUT",
    "Monitoring checks validated across the network.",
    "NODE COVERAGE MAP",
    "Distribution of reported issues by framework."
  ];

  for (const text of exactWraps) {
    const rawText = text.replace(/\\/g, ''); // Unescape for JS output
    // Replace text between tags
    const regex = new RegExp(`>\\s*${text}\\s*<`, 'g');
    content = content.replace(regex, `>{t("${rawText}")}<`);
  }

  // Placeholder replacements
  content = content.replace(/placeholder="Search solutions by dependency or error..."/g, 'placeholder={t("Search solutions by dependency or error...")}');
  content = content.replace(/placeholder="e.g. 'Cursor', 'Claude', 'Copilot'"/g, 'placeholder={t("e.g. \'Cursor\', \'Claude\', \'Copilot\'")}');
  content = content.replace(/title="Solutions Created"/g, 'title={t("Solutions Created")}');
  content = content.replace(/title="Verifications Handled"/g, 'title={t("Verifications Handled")}');
  content = content.replace(/title={p.error_signature}/g, 'title={p.error_signature}'); // No-op

  // Ternary replacements (Search button)
  content = content.replace(/{isSearching \? 'SEARCHING...' : 'SEARCH'}/g, '{isSearching ? t("SEARCHING...") : t("SEARCH")}');
  
  // Problems toggle
  content = content.replace(/{isResolvedView \? 'RESOLVED PROBLEMS' : 'OPEN PROBLEMS'}/g, '{isResolvedView ? t("RESOLVED PROBLEMS") : t("OPEN PROBLEMS")}');
  content = content.replace(/{isResolvedView \? 'ISSUES SUCCESSFULLY CONQUERED' : 'UNRESOLVED ISSUES AWAITING SOLUTIONS'}/g, '{isResolvedView ? t("ISSUES SUCCESSFULLY CONQUERED") : t("UNRESOLVED ISSUES AWAITING SOLUTIONS")}');
  content = content.replace(/{isResolvedView \? 'SYSTEM STABLE' : 'SEEKING FIXES'}/g, '{isResolvedView ? t("SYSTEM STABLE") : t("SEEKING FIXES")}');
  content = content.replace(/{isResolvedView \? 'SYSTEM.ARCHIVE.READ\\(\\)' : 'SYSTEM.ANOMALIES.READ\\(\\)'}/g, '{isResolvedView ? t("SYSTEM.ARCHIVE.READ()") : t("SYSTEM.ANOMALIES.READ()")}');
  content = content.replace(/{isResolvedView \? '\\[ NO RESOLVED ISSUES IN ARCHIVE \\]' : '\\[ NO UNRESOLVED ISSUES DETECTED \\]'}/g, '{isResolvedView ? t("[ NO RESOLVED ISSUES IN ARCHIVE ]") : t("[ NO UNRESOLVED ISSUES DETECTED ]")}');
  content = content.replace(/{isResolvedView \? 'RESOLVED' : 'UNRESOLVED'}/g, '{isResolvedView ? t("RESOLVED") : t("UNRESOLVED")}');

  // Problems button counts
  content = content.replace(/>\s*OPEN ANOMALIES \(\{activeProblems.length\}\)\s*</g, '>{t("OPEN ANOMALIES")} ({activeProblems.length})<');
  content = content.replace(/>\s*RESOLVED LOGS \(\{resolvedProblems.length\}\)\s*</g, '>{t("RESOLVED LOGS")} ({resolvedProblems.length})<');

  fs.writeFileSync(filePath, content);
};

// Target all 4 main interactive pages
try {
  addI18n('./src/app/page.tsx');
  addI18n('./src/app/problems/page.tsx');
  addI18n('./src/app/settings/page.tsx');
  addI18n('./src/app/analytics/page.tsx');
  console.log("Translation logic successfully injected!");
} catch(e) {
  console.error("Error during inject:", e);
}
