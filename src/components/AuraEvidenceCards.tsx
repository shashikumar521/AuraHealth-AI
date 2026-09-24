import React from 'react';
import { Microscope, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { SymptomStatisticalEvidence } from '../types/health';

interface AuraEvidenceCardsProps {
  evidenceList: SymptomStatisticalEvidence[];
}

export const AuraEvidenceCards: React.FC<AuraEvidenceCardsProps> = ({ evidenceList }) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
            <Microscope className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-medium text-[#1E293B] text-sm">
              Symptom Significance Engine (&chi;&sup2; Hypothesis Testing)
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Rigorous Chi-Square contingency evaluation against N = 2,000 reference patient records (&alpha; = 0.05).
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          Threshold: p &lt; 0.05
        </span>
      </div>

      {/* Grid of Evidence Cards */}
      {evidenceList.length === 0 ? (
        <div className="p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
          <h4 className="text-sm font-medium text-[#1E293B]">
            All Reported Parameters Are at Healthy Baseline
          </h4>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            You have not reported any abnormal chest sensations, exertional dyspnea, fatigue, or elevated vitals. No statistically significant pathological deviations were detected.
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
                    ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Factor Evaluated
                    </span>
                    <h4 className="text-xs font-semibold text-[#1E293B] mt-0.5">
                      {item.label}
                    </h4>
                  </div>

                  {/* Significance Tag */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                      isSig
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {isSig ? (
                      <CheckCircle2 className="w-3 h-3 text-blue-700" />
                    ) : (
                      <HelpCircle className="w-3 h-3 text-slate-500" />
                    )}
                    <span>{item.badgeText}</span>
                  </span>
                </div>

                {/* Reported Value */}
                <div className="flex items-center gap-2 mb-2.5 text-xs">
                  <span className="text-slate-500">Reported:</span>
                  <span className="font-medium text-blue-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-[11px]">
                    {item.reportedValue}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-auto">
                    Linked to: {item.targetDisease}
                  </span>
                </div>

                {/* Plain-English Explanation */}
                <div className="pt-2 border-t border-slate-200/60 text-xs text-[#64748B] flex items-start gap-1.5 leading-relaxed">
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
