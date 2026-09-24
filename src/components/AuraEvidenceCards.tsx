import React from 'react';
import { Microscope, CheckCircle2, HelpCircle } from 'lucide-react';
import { SymptomStatisticalEvidence } from '../types/health';

interface AuraEvidenceCardsProps {
  evidenceList: SymptomStatisticalEvidence[];
}

export const AuraEvidenceCards: React.FC<AuraEvidenceCardsProps> = ({ evidenceList }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-cyan-500/15 p-6 shadow-xl shadow-black/25 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Microscope className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-semibold text-white text-sm">
              Symptom Significance Engine (&chi;&sup2; Hypothesis Testing)
            </h3>
            <p className="text-[11px] text-slate-400">
              Inferential Chi-Square contingency evaluation against N = 2,500 reference patient records (&alpha; = 0.05).
            </p>
          </div>
        </div>

        <span className="text-[11px] text-cyan-300 font-mono bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/25">
          Significance Threshold: p &lt; 0.05
        </span>
      </div>

      {/* Grid of Evidence Cards */}
      {evidenceList.length === 0 ? (
        <div className="p-6 bg-slate-800/40 border border-slate-700/60 rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
          <h4 className="text-sm font-semibold text-white">
            All Reported Parameters Are at Healthy Baseline
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have not reported any abnormal chest sensations, exertional dyspnea, edema, or elevated vitals. No statistically significant pathological deviations were detected.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {evidenceList.map((item) => {
            const isSig = item.isSignificant;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSig
                    ? 'bg-slate-800/80 border-cyan-500/40 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Factor Evaluated
                    </span>
                    <h4 className="text-xs font-semibold text-white mt-0.5">
                      {item.label}
                    </h4>
                  </div>

                  {/* Significance Tag */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                      isSig
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600'
                    }`}
                  >
                    {isSig ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <HelpCircle className="w-3 h-3 text-slate-400" />
                    )}
                    <span>{item.badgeText}</span>
                  </span>
                </div>

                {/* Reported Value */}
                <div className="flex items-center gap-2 mb-2.5 text-xs">
                  <span className="text-slate-400">Reported:</span>
                  <span className="font-medium text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded-md border border-cyan-500/30 font-mono text-[11px]">
                    {item.reportedValue}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-auto">
                    Target: {item.targetDisease}
                  </span>
                </div>

                {/* Plain-English Explanation */}
                <div className="pt-2 border-t border-slate-700/60 text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                  <p>{item.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
