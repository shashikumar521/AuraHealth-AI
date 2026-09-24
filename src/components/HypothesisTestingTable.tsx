import React, { useState } from 'react';
import { StatisticalEvidenceRecord } from '../types/clinical';
import { getDetailedContingencyMatrix } from '../engine/bayesianEngine';
import { Table, CheckCircle, AlertCircle, Eye, SlidersHorizontal } from 'lucide-react';

interface HypothesisTestingTableProps {
  records: StatisticalEvidenceRecord[];
  targetDisease: 'CAD' | 'Diabetes_T2' | 'Hypertension';
  onTargetDiseaseChange: (target: 'CAD' | 'Diabetes_T2' | 'Hypertension') => void;
  alpha: number;
  onAlphaChange: (alpha: number) => void;
}

export const HypothesisTestingTable: React.FC<HypothesisTestingTableProps> = ({
  records,
  targetDisease,
  onTargetDiseaseChange,
  alpha,
  onAlphaChange
}) => {
  const [inspectVar, setInspectVar] = useState<string | null>(null);

  const contingency = inspectVar ? getDetailedContingencyMatrix(inspectVar, targetDisease) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>Engine B: P-Value &amp; Clinical Evidence Hypothesis Testing</span>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              scipy.stats · χ² Independence
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Null hypothesis testing (H₀: Symptom occurrence is independent of target disease in cohort N=3,500).
          </p>
        </div>

        {/* Controls: Target Disease & Alpha */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-semibold text-slate-700 whitespace-nowrap">Target Disease:</label>
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

          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-semibold text-slate-700">Alpha (α):</label>
            <select
              value={alpha}
              onChange={(e) => onAlphaChange(parseFloat(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-2 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={0.01}>0.01 (Strict 99%)</option>
              <option value={0.05}>0.05 (Standard 95%)</option>
              <option value={0.10}>0.10 (Exploratory 90%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto mt-4 border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-600 tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Observed Evidence</th>
              <th className="py-3 px-3">Patient State</th>
              <th className="py-3 px-3 text-right">Chi² Stat</th>
              <th className="py-3 px-3 text-right">DoF</th>
              <th className="py-3 px-3 text-right">Exact p-value</th>
              <th className="py-3 px-3">Odds Ratio (95% CI)</th>
              <th className="py-3 px-3">Significance (α={alpha})</th>
              <th className="py-3 px-3">Clinical Interpretation</th>
              <th className="py-3 px-2 text-center">Matrix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => {
              const pDisplay = r.pValue < 0.0001 ? '< 0.0001' : r.pValue.toFixed(4);
              return (
                <tr
                  key={r.observedEvidence}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    r.isSignificant ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {r.observedEvidence.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 text-[11px] whitespace-nowrap">
                      {r.patientState}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium">
                    {r.chi2Stat.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {r.dof}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                        r.isSignificant
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pDisplay}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                    {r.oddsRatio.toFixed(2)}{' '}
                    <span className="text-[10px] text-slate-500">
                      [{r.ciLower.toFixed(2)}, {r.ciUpper.toFixed(2)}]
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {r.isSignificant ? (
                      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        <CheckCircle className="w-3 h-3" />
                        Significant (p &lt; {alpha})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-slate-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        Incidental (p ≥ {alpha})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs leading-relaxed">
                    {r.clinicalInterpretation}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button
                      onClick={() => setInspectVar(inspectVar === r.observedEvidence ? null : r.observedEvidence)}
                      title="Inspect 2xK Contingency Matrix"
                      className={`p-1.5 rounded transition-colors ${
                        inspectVar === r.observedEvidence
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Contingency Matrix Inspector Modal/Drawer */}
      {contingency && (
        <div className="mt-4 p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Table className="w-4 h-4 text-blue-600" />
              <span>
                2×K Contingency Cross-Tabulation: <strong>{contingency.evidenceVar}</strong> vs.{' '}
                <strong>{contingency.targetDisease}</strong> (Cohort N=3,500)
              </span>
            </h4>
            <button
              onClick={() => setInspectVar(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Close ✕
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded border border-blue-200 shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-blue-100/60 text-[11px] font-bold text-slate-700">
                <tr>
                  <th className="py-2 px-3">{contingency.evidenceVar} Category</th>
                  <th className="py-2 px-3 text-right">{contingency.targetDisease} = 'Yes'</th>
                  <th className="py-2 px-3 text-right">{contingency.targetDisease} = 'No'</th>
                  <th className="py-2 px-3 text-right">Row Total</th>
                  <th className="py-2 px-3 text-right">Prevalence (% in category)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {contingency.categories.map((cat) => {
                  const data = contingency.matrix[cat];
                  const prevalence = data.Total > 0 ? (data.Yes / data.Total) * 100 : 0;
                  return (
                    <tr key={cat} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-sans font-semibold text-slate-900">{cat}</td>
                      <td className="py-2 px-3 text-right text-red-600 font-bold">{data.Yes}</td>
                      <td className="py-2 px-3 text-right text-slate-600">{data.No}</td>
                      <td className="py-2 px-3 text-right text-slate-900 font-medium">{data.Total}</td>
                      <td className="py-2 px-3 text-right font-sans font-bold text-slate-800">
                        {prevalence.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-mono font-bold text-slate-900 border-t border-slate-200">
                <tr>
                  <td className="py-2 px-3 font-sans">Total Cohort</td>
                  <td className="py-2 px-3 text-right text-red-700">{contingency.totalYes}</td>
                  <td className="py-2 px-3 text-right text-slate-700">{contingency.totalNo}</td>
                  <td className="py-2 px-3 text-right">{contingency.grandTotal}</td>
                  <td className="py-2 px-3 text-right font-sans">
                    {((contingency.totalYes / contingency.grandTotal) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
