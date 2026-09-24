import React from 'react';
import { Activity, Code2, Sparkles, FileText, Dna } from 'lucide-react';

interface AuraHeaderProps {
  activeTab: 'dashboard' | 'python';
  onTabChange: (tab: 'dashboard' | 'python') => void;
  onExportReport: () => void;
  patientName: string;
}

export const AuraHeader: React.FC<AuraHeaderProps> = ({
  activeTab,
  onTabChange,
  onExportReport,
  patientName
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B132B]/90 backdrop-blur-xl border-b border-cyan-500/20 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/40">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0B132B] rounded-[14px] flex items-center justify-center">
            <Dna className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-sky-300 bg-clip-text text-transparent tracking-tight">
              AuraHealth Nexus
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Gemini AI Architecture
            </span>
          </div>
          <p className="text-xs font-normal text-slate-400">
            Clinical Decision Support &middot; Bayesian Belief Network &middot; Chi-Square Hypothesis Engine
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-cyan-500/20">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'python'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python (app.py)</span>
          </button>
        </div>

        {/* Export Report Action */}
        <button
          type="button"
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Clinical Dossier</span>
        </button>
      </div>
    </header>
  );
};
