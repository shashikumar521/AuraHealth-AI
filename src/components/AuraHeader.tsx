import React from 'react';
import { Activity, Code2, Sparkles, FileText } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 p-0.5 shadow-xs flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#1E293B] tracking-tight">
              AuraHealth AI
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Clinical Intelligence
            </span>
          </div>
          <p className="text-xs font-normal text-[#64748B]">
            Bayesian Belief Network &middot; Chi-Square Inferential Hypothesis Testing &middot; Dual-Sync Biometrics
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
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
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};
