import React, { useState } from 'react';
import {
  PatientEvidenceDict,
  EvidenceSensitivityRecord
} from '../types/clinical';
import { computeLeaveOneOutSensitivity } from '../engine/bayesianEngine';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Info,
  HelpCircle,
  Filter
} from 'lucide-react';

interface SensitivityAnalysisProps {
  evidence: PatientEvidenceDict;
  droppedVariables: Set<string>;
  onToggleDropVariable: (varKey: string) => void;
  onResetAllEvidence: () => void;
  targetDisease: 'CAD' | 'Diabetes_T2' | 'Hypertension';
  onTargetDiseaseChange: (target: 'CAD' | 'Diabetes_T2' | 'Hypertension') => void;
  currentPosterior: number;
  fullPosterior: number;
  priorVal: number;
}

export const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  evidence,
  droppedVariables,
  onToggleDropVariable,
  onResetAllEvidence,
  targetDisease,
  onTargetDiseaseChange,
  currentPosterior,
  fullPosterior,
  priorVal
}) => {
  const [viewMode, setViewMode] = useState<'ranking' | 'matrix'>('ranking');

  // Compute leave-one-out sensitivity records based on full original evidence
  const sensitivityRecords = computeLeaveOneOutSensitivity(evidence, targetDisease);

  const diseaseNames: Record<string, string> = {
    CAD: 'Coronary Artery Disease (CAD)',
    Diabetes_T2: 'Type-2 Diabetes Mellitus',
    Hypertension: 'Essential Hypertension'
  };

  const activeCount = Object.keys(evidence).filter(k => evidence[k] && !droppedVariables.has(k)).length;
  const totalCount = Object.keys(evidence).filter(k => evidence[k]).length;

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Sensitivity &amp; Evidence Ablation Analysis
            </h3>
            <span className="text-[10px] uppercase font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
              Leave-One-Out (LOO)
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Quantify the marginal diagnostic weight of each individual clinical marker by measuring posterior swings when each piece of evidence is dropped.
          </p>
        </div>

        {/* Target disease selector & reset button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-semibold text-slate-700 whitespace-nowrap">Study Target:</label>
            <select
              value={targetDisease}
              onChange={(e) => onTargetDiseaseChange(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="CAD">Coronary Artery Disease (CAD)</option>
              <option value="Diabetes_T2">Type-2 Diabetes Mellitus</option>
              <option value="Hypertension">Essential Hypertension</option>
            </select>
          </div>

          {droppedVariables.size > 0 && (
            <button
              onClick={onResetAllEvidence}
              className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore All Markers ({droppedVariables.size} dropped)</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time What-If Comparison Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-slate-500 block text-[11px]">Active Evidence:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">
              {activeCount} / {totalCount} markers
            </span>
          </div>
          <div className="h-7 w-px bg-slate-300"></div>
          <div>
            <span className="text-slate-500 block text-[11px]">Active Posterior Risk:</span>
            <span className={`font-black font-mono text-sm ${currentPosterior > 0.5 ? 'text-red-600' : currentPosterior >= 0.2 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {(currentPosterior * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-7 w-px bg-slate-300"></div>
          <div>
            <span className="text-slate-500 block text-[11px]">Full Evidence Baseline:</span>
            <span className="font-bold font-mono text-slate-700 text-sm">
              {(fullPosterior * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-7 w-px bg-slate-300"></div>
          <div>
            <span className="text-slate-500 block text-[11px]">Unconditional Prior:</span>
            <span className="font-bold font-mono text-slate-500 text-sm">
              {(priorVal * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Click any marker toggle below to drop or re-incorporate it in real time.</span>
        </div>
      </div>

      {/* Interactive Quick-Drop Chips */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Interactive Evidence Ingestion Checklist (Drop / Retain Markers)
        </label>
        <div className="flex flex-wrap gap-2">
          {sensitivityRecords.map((r) => {
            const isDropped = droppedVariables.has(r.variableKey);
            return (
              <button
                key={r.variableKey}
                onClick={() => onToggleDropVariable(r.variableKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isDropped
                    ? 'bg-slate-100 border-slate-300 text-slate-400 line-through opacity-75 hover:bg-slate-200'
                    : 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100 shadow-xs'
                }`}
                title={isDropped ? `Click to re-incorporate ${r.variableLabel}` : `Click to drop ${r.variableLabel}`}
              >
                {isDropped ? (
                  <XCircle className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span>{r.variableLabel}:</span>
                <strong className={isDropped ? 'text-slate-400' : 'text-blue-950 font-mono'}>
                  {r.patientState}
                </strong>
                {isDropped && (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded ml-1 no-underline">
                    Dropped
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marginal Leverage Tornado Table */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Rank-Ordered Marginal Clinical Influence on {diseaseNames[targetDisease]}</span>
          </h4>
          <span className="text-[11px] text-slate-500">
            Marginal Impact = P(Target|Full) − P(Target|Ablated)
          </span>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Clinical Marker</th>
                <th className="py-2.5 px-3">Patient Value</th>
                <th className="py-2.5 px-3 text-right">Posterior Without Marker</th>
                <th className="py-2.5 px-3 text-right">Marginal Impact (Δ)</th>
                <th className="py-2.5 px-3">Diagnostic Classification</th>
                <th className="py-2.5 px-3">Clinical Interpretation</th>
                <th className="py-2.5 px-3 text-center">Toggle In Current Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sensitivityRecords.map((r) => {
                const isDropped = droppedVariables.has(r.variableKey);
                const impactPct = r.marginalImpact * 100;
                const absImpact = Math.abs(impactPct);

                return (
                  <tr
                    key={r.variableKey}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isDropped ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {r.variableLabel}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                        {r.patientState}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-600">
                      {(r.ablatedPosterior * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 font-mono font-bold">
                        {r.direction === 'amplifying_risk' ? (
                          <span className="text-red-600 flex items-center">
                            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                            +{impactPct.toFixed(1)}%
                          </span>
                        ) : r.direction === 'protective_reduction' ? (
                          <span className="text-emerald-600 flex items-center">
                            <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                            {impactPct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center">
                            <Minus className="w-3 h-3 mr-0.5" />
                            0.0%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {absImpact >= 15 ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                          Critical Driver (&gt;15%)
                        </span>
                      ) : absImpact >= 5 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Moderate Influence (5–15%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                          Minor / Baseline (&lt;5%)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs leading-relaxed">
                      {r.clinicalInterpretation}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onToggleDropVariable(r.variableKey)}
                        className={`text-xs px-2.5 py-1 rounded font-semibold transition-colors ${
                          isDropped
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700'
                        }`}
                      >
                        {isDropped ? 'Restore' : 'Drop'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
