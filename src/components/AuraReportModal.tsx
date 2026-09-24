import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldAlert } from 'lucide-react';
import {
  AuraPatientProfile,
  RiskEvaluation,
  SymptomStatisticalEvidence
} from '../types/health';
import { computeBmi } from '../engine/auraHealthEngine';

interface AuraReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AuraPatientProfile;
  heartRisk: RiskEvaluation;
  diabetesRisk: RiskEvaluation;
  evidenceList: SymptomStatisticalEvidence[];
  recommendations: { title: string; desc: string }[];
}

export const AuraReportModal: React.FC<AuraReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  heartRisk,
  diabetesRisk,
  evidenceList,
  recommendations
}) => {
  if (!isOpen) return null;

  const bmiInfo = computeBmi(profile.weightKg, profile.heightCm, profile.age);
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const lines = [
      `AURAHEALTH AI - CLINICAL RISK ASSESSMENT REPORT`,
      `Date: ${reportDate}`,
      `Patient Name: ${profile.name || 'Anonymous Patient'}`,
      `Age: ${profile.age} | Sex: ${profile.gender} | Height: ${profile.heightCm} cm | Weight: ${profile.weightKg} kg (BMI: ${bmiInfo.bmi} - ${bmiInfo.category})`,
      `Smoking: ${profile.smoking} | Family History: ${profile.familyHistory ? 'Yes' : 'No'}`,
      ``,
      `--- BAYESIAN RISK ESTIMATES ---`,
      `Coronary Heart Disease Risk: ${heartRisk.percentage.toFixed(1)}% (${heartRisk.level})`,
      `Type-2 Diabetes Risk: ${diabetesRisk.percentage.toFixed(1)}% (${diabetesRisk.level})`,
      ``,
      `--- STATISTICAL SYMPTOM EVALUATION (Chi-Square, N=2,000) ---`,
      ...evidenceList.map(
        (e) => `* ${e.label} [${e.reportedValue}]: p = ${e.pValue} -> ${e.isSignificant ? 'Statistically Significant' : 'Incidental'}`
      ),
      ``,
      `--- CLINICAL ACTION PLAN ---`,
      ...recommendations.map((r, i) => `${i + 1}. ${r.title}: ${r.desc}`),
      ``,
      `DISCLAIMER: Educational and clinical decision support demonstration. Not a replacement for formal physician diagnosis.`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AuraHealth_Report_${(profile.name || 'Patient').replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
          <div>
            <h3 className="font-semibold text-[#1E293B] text-base">
              Clinical Intelligence Brief: {profile.name || 'Patient'}
            </h3>
            <p className="text-xs text-[#64748B]">
              Generated on {reportDate} &middot; Bayesian &amp; &chi;&sup2; Model Output
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Patient Quick Vitals Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Age / Sex</span>
              <p className="font-semibold text-slate-800">{profile.age} yrs / {profile.gender}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">BMI / Category</span>
              <p className="font-semibold text-slate-800">{bmiInfo.bmi} ({bmiInfo.category})</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Smoking Status</span>
              <p className="font-semibold text-slate-800">{profile.smoking}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Family Genetics</span>
              <p className="font-semibold text-slate-800">{profile.familyHistory ? 'Positive (+)' : 'Negative (-)'}</p>
            </div>
          </div>

          {/* Primary Risk Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-600">Coronary Heart Disease</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: heartRisk.badgeBg,
                    borderColor: heartRisk.badgeBorder,
                    color: heartRisk.badgeText
                  }}
                >
                  {heartRisk.level}
                </span>
              </div>
              <p className="text-2xl font-mono font-semibold" style={{ color: heartRisk.ringColor }}>
                {heartRisk.percentage.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{heartRisk.summary}</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-600">Type-2 Diabetes</span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: diabetesRisk.badgeBg,
                    borderColor: diabetesRisk.badgeBorder,
                    color: diabetesRisk.badgeText
                  }}
                >
                  {diabetesRisk.level}
                </span>
              </div>
              <p className="text-2xl font-mono font-semibold" style={{ color: diabetesRisk.ringColor }}>
                {diabetesRisk.percentage.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{diabetesRisk.summary}</p>
            </div>
          </div>

          {/* Evidence findings */}
          <div>
            <h4 className="font-semibold text-[#1E293B] mb-2">Evaluated Symptom Evidence</h4>
            {evidenceList.length === 0 ? (
              <p className="text-slate-500 italic">No elevated symptoms reported.</p>
            ) : (
              <div className="space-y-1.5">
                {evidenceList.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center justify-between"
                  >
                    <span>
                      <strong>{e.label}:</strong> {e.reportedValue}
                    </span>
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {e.badgeText}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-[#1E293B] mb-2">Actionable Care Steps</h4>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={rec.title} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-medium text-[#1E293B]">
                    0{i + 1}. {rec.title}:
                  </span>{' '}
                  <span className="text-slate-600">{rec.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              This report is powered by a Bayesian Belief Network and Chi-Square statistical validation against 2,000 synthetic patient records. It is intended for clinical decision support and health awareness, not definitive medical diagnosis.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-[#F8FAFC]">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .TXT Brief</span>
          </button>
        </div>
      </div>
    </div>
  );
};
