import React, { useState } from 'react';
import { PatientEvidenceDict, PosteriorResult } from '../types/clinical';
import { Info, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface CausalDAGProps {
  evidence: PatientEvidenceDict;
  posteriors: PosteriorResult['posteriors'];
}

interface NodeDef {
  id: string;
  label: string;
  category: 'root' | 'disease' | 'symptom';
  x: number; // percentage coordinates 0..100
  y: number;
  parents: string[];
  children: string[];
  description: string;
}

const NODES: NodeDef[] = [
  // Top Layer: Demographics & Risk Factors
  {
    id: 'Age',
    label: 'Age',
    category: 'root',
    x: 12,
    y: 12,
    parents: [],
    children: ['Hypertension', 'Diabetes_T2'],
    description: 'Demographic stratification: Young (<35), Middle-aged (35-60), Senior (>60)'
  },
  {
    id: 'Gender',
    label: 'Gender',
    category: 'root',
    x: 32,
    y: 12,
    parents: [],
    children: ['CAD'],
    description: 'Biological sex determinant with differential CAD incidence baseline'
  },
  {
    id: 'Smoking',
    label: 'Smoking',
    category: 'root',
    x: 52,
    y: 12,
    parents: [],
    children: ['Hypertension', 'CAD'],
    description: 'Tobacco use category: Non-smoker, Former-smoker, Current-smoker'
  },
  {
    id: 'BMI_Category',
    label: 'BMI Category',
    category: 'root',
    x: 72,
    y: 12,
    parents: [],
    children: ['Hypertension', 'Diabetes_T2'],
    description: 'Calculated BMI category: Normal (<25), Overweight (25-30), Obese (>30)'
  },
  {
    id: 'Family_History',
    label: 'Family History',
    category: 'root',
    x: 90,
    y: 12,
    parents: [],
    children: ['Diabetes_T2'],
    description: 'First-degree genetic predisposition to cardiometabolic disorders'
  },

  // Middle Layer: Target Diseases
  {
    id: 'Hypertension',
    label: 'Hypertension',
    category: 'disease',
    x: 24,
    y: 45,
    parents: ['Age', 'BMI_Category', 'Smoking'],
    children: ['CAD', 'Dyspnea', 'Resting_ECG'],
    description: 'Essential arterial hypertension (Parents: Age, BMI, Smoking)'
  },
  {
    id: 'Diabetes_T2',
    label: 'Type-2 Diabetes',
    category: 'disease',
    x: 52,
    y: 45,
    parents: ['Age', 'BMI_Category', 'Family_History'],
    children: ['CAD', 'Fasting_Glucose', 'Fatigue'],
    description: 'Metabolic insulin resistance syndrome (Parents: Age, BMI, Family History)'
  },
  {
    id: 'CAD',
    label: 'Coronary Artery Disease',
    category: 'disease',
    x: 82,
    y: 45,
    parents: ['Smoking', 'Hypertension', 'Diabetes_T2', 'Gender'],
    children: ['Chest_Pain', 'Dyspnea', 'Resting_ECG', 'Fatigue'],
    description: 'Coronary atherosclerotic vascular occlusion (Parents: Smoking, HTN, DM, Gender)'
  },

  // Bottom Layer: Clinical Leaf Symptoms & Lab Biomarkers
  {
    id: 'Fatigue',
    label: 'Fatigue',
    category: 'symptom',
    x: 12,
    y: 82,
    parents: ['Diabetes_T2', 'CAD'],
    children: [],
    description: 'Chronic clinical exhaustion secondary to metabolic and perfusion deficit'
  },
  {
    id: 'Fasting_Glucose',
    label: 'Fasting Glucose',
    category: 'symptom',
    x: 32,
    y: 82,
    parents: ['Diabetes_T2'],
    children: [],
    description: 'Glycemic biomarker: Normal (<100), Pre-diabetic (100-125), Diabetic (>=126)'
  },
  {
    id: 'Dyspnea',
    label: 'Dyspnea',
    category: 'symptom',
    x: 52,
    y: 82,
    parents: ['CAD', 'Hypertension'],
    children: [],
    description: 'Exertional/resting shortness of breath secondary to left ventricular strain'
  },
  {
    id: 'Resting_ECG',
    label: 'Resting ECG',
    category: 'symptom',
    x: 72,
    y: 82,
    parents: ['CAD', 'Hypertension'],
    children: [],
    description: '12-lead ECG: Normal, ST-T Abnormality, Left Ventricular Hypertrophy'
  },
  {
    id: 'Chest_Pain',
    label: 'Chest Pain',
    category: 'symptom',
    x: 90,
    y: 82,
    parents: ['CAD'],
    children: [],
    description: 'Angina pectoris presentation: None, Atypical, Typical Angina'
  }
];

const EDGES = [
  { from: 'Age', to: 'Hypertension' },
  { from: 'BMI_Category', to: 'Hypertension' },
  { from: 'Smoking', to: 'Hypertension' },
  { from: 'Age', to: 'Diabetes_T2' },
  { from: 'BMI_Category', to: 'Diabetes_T2' },
  { from: 'Family_History', to: 'Diabetes_T2' },
  { from: 'Smoking', to: 'CAD' },
  { from: 'Hypertension', to: 'CAD' },
  { from: 'Diabetes_T2', to: 'CAD' },
  { from: 'Gender', to: 'CAD' },
  { from: 'CAD', to: 'Chest_Pain' },
  { from: 'CAD', to: 'Dyspnea' },
  { from: 'CAD', to: 'Resting_ECG' },
  { from: 'CAD', to: 'Fatigue' },
  { from: 'Hypertension', to: 'Dyspnea' },
  { from: 'Hypertension', to: 'Resting_ECG' },
  { from: 'Diabetes_T2', to: 'Fasting_Glucose' },
  { from: 'Diabetes_T2', to: 'Fatigue' }
];

export const CausalDAG: React.FC<CausalDAGProps> = ({ evidence, posteriors }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('CAD');

  const selectedNode = NODES.find(n => n.id === selectedNodeId) || NODES[7];

  // SVG coordinate mapper
  const svgWidth = 900;
  const svgHeight = 440;

  const getNodeCoords = (node: NodeDef) => ({
    x: (node.x / 100) * svgWidth,
    y: (node.y / 100) * svgHeight
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>Bayesian Directed Acyclic Graph (DAG) Topology</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
              12 Nodes · 18 Causal Edges
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any node to inspect its conditional parents, child manifestations, and clinical distributions.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-blue-400"></span>
            <span className="text-slate-700 font-medium">Observed Evidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-red-400"></span>
            <span className="text-slate-700 font-medium">Target Disease</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-400 border border-slate-300"></span>
            <span className="text-slate-700 font-medium">Unobserved</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto my-3 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[700px] h-[380px] select-none"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563EB" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map(edge => {
            const fromNode = NODES.find(n => n.id === edge.from)!;
            const toNode = NODES.find(n => n.id === edge.to)!;
            const fromCoord = getNodeCoords(fromNode);
            const toCoord = getNodeCoords(toNode);

            const isConnectedToSelected =
              edge.from === selectedNodeId || edge.to === selectedNodeId;

            // Curved cubic bezier paths
            const midY = (fromCoord.y + toCoord.y) / 2;
            const pathD = `M ${fromCoord.x} ${fromCoord.y} C ${fromCoord.x} ${midY}, ${toCoord.x} ${midY}, ${toCoord.x} ${toCoord.y}`;

            return (
              <path
                key={`${edge.from}->${edge.to}`}
                d={pathD}
                fill="none"
                stroke={isConnectedToSelected ? '#2563EB' : '#CBD5E1'}
                strokeWidth={isConnectedToSelected ? 2.5 : 1.5}
                strokeDasharray={isConnectedToSelected ? 'none' : 'none'}
                markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const coords = getNodeCoords(node);
            const isDisease = node.category === 'disease';
            const isObserved = Boolean(evidence[node.id]);
            const isSelected = node.id === selectedNodeId;

            let bgColor = '#64748B'; // unobserved slate
            let strokeColor = '#475569';
            let label = node.label;
            let subtext = '';

            if (isDisease) {
              bgColor = '#EF4444'; // Red
              strokeColor = '#DC2626';
              const prob = (posteriors[node.id as keyof typeof posteriors]?.Yes || 0) * 100;
              subtext = `${prob.toFixed(1)}%`;
            } else if (isObserved) {
              bgColor = '#2563EB'; // Blue
              strokeColor = '#1D4ED8';
              subtext = evidence[node.id] || '';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${coords.x}, ${coords.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                className="cursor-pointer group"
              >
                {/* Selection halo */}
                {isSelected && (
                  <circle
                    r="28"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    className="animate-spin-slow"
                  />
                )}

                {/* Node circle */}
                <circle
                  r={isDisease ? 22 : 18}
                  fill={bgColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-transform group-hover:scale-110 drop-shadow-sm"
                />

                {/* Text Label */}
                <text
                  y={isDisease ? -26 : -22}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-800 pointer-events-none drop-shadow-sm"
                >
                  {label}
                </text>

                {/* Subtext (state or prob) */}
                <text
                  y={isDisease ? 35 : 30}
                  textAnchor="middle"
                  className={`text-[10px] font-semibold pointer-events-none ${
                    isDisease
                      ? 'fill-red-600 font-extrabold'
                      : isObserved
                      ? 'fill-blue-700'
                      : 'fill-slate-500'
                  }`}
                >
                  {subtext}
                </text>

                {/* Inside circle icon/badge */}
                <text
                  y={4}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-white pointer-events-none"
                >
                  {isDisease ? 'Dx' : isObserved ? 'Ev' : '○'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspector Drawer */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                {selectedNode.category} node
              </span>
              <h4 className="font-bold text-slate-900 text-base">{selectedNode.label} ({selectedNode.id})</h4>
            </div>
            <p className="text-xs text-slate-600 mt-1">{selectedNode.description}</p>
          </div>

          <div className="text-right">
            {selectedNode.category === 'disease' ? (
              <div>
                <span className="text-xs text-slate-500 block">Posterior P(Disease='Yes'|E)</span>
                <span className="text-xl font-extrabold text-red-600">
                  {((posteriors[selectedNode.id as keyof typeof posteriors]?.Yes || 0) * 100).toFixed(1)}%
                </span>
              </div>
            ) : evidence[selectedNode.id] ? (
              <div>
                <span className="text-xs text-slate-500 block">Observed Intake State</span>
                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 inline-block">
                  {evidence[selectedNode.id]}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Unobserved (Marginalized)</span>
            )}
          </div>
        </div>

        {/* Causal Edges detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 text-xs">
          <div>
            <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
              <ArrowRight className="w-3.5 h-3.5 text-blue-600 rotate-180" /> Direct Causal Parents:
            </span>
            {selectedNode.parents.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.parents.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedNodeId(p)}
                    className="bg-white hover:bg-blue-50 text-blue-800 font-medium px-2 py-0.5 rounded border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 italic">Root variable (Exogenous demographic/lifestyle prior)</span>
            )}
          </div>

          <div>
            <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" /> Direct Causal Children:
            </span>
            {selectedNode.children.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.children.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedNodeId(c)}
                    className="bg-white hover:bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded border border-slate-200 hover:border-emerald-300 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-slate-400 italic">Leaf variable (Observable clinical symptom / lab biomarker)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
