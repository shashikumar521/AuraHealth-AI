import React, { useState } from 'react';
import { Network, Info, Zap } from 'lucide-react';
import { AuraPatientProfile, RiskEvaluation } from '../types/health';
import { computeBmi } from '../engine/auraHealthEngine';

interface AuraBayesianGraphProps {
  profile: AuraPatientProfile;
  heartRisk: RiskEvaluation;
  diabetesRisk: RiskEvaluation;
}

interface GraphNode {
  id: string;
  name: string;
  category: 'demographic' | 'disease' | 'symptom';
  x: number;
  y: number;
  isActiveEvidence: boolean;
  activeVal?: string;
  probability?: number;
  parents: string[];
}

interface GraphEdge {
  from: string;
  to: string;
}

export const AuraBayesianGraph: React.FC<AuraBayesianGraphProps> = ({
  profile,
  heartRisk,
  diabetesRisk
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const bmiInfo = computeBmi(profile.weightKg, profile.heightCm, profile.age);

  // Active status checks
  const isChestActive = profile.chestSensation !== 'No discomfort';
  const isDyspneaActive = profile.breathingEffort !== 'Easy & normal';
  const isFatigueActive = profile.energyStamina !== 'High / Normal energy';
  const isBpActive =
    profile.bloodPressure === 'Pre-hypertension' || profile.bloodPressure === 'Diagnosed High';
  const isGlucoseActive =
    profile.fastingBloodSugar === 'Elevated (100–125)' ||
    profile.fastingBloodSugar === 'Diabetic (126+)';
  const isSmokingActive = profile.smoking !== 'Non-Smoker';
  const isWeightActive = bmiInfo.category !== 'Healthy Weight';
  const isFamHistActive = profile.familyHistory;

  // Graph Layout coordinates (SVG width: 800, height: 400)
  // Layer 1: Demographics & Risk Factors (x: 100)
  // Layer 2: Disease States (x: 400)
  // Layer 3: Observable Symptoms & Vitals (x: 700)
  const nodes: GraphNode[] = [
    // Layer 1: Inputs / Parents
    {
      id: 'age',
      name: 'Age Demographic',
      category: 'demographic',
      x: 100,
      y: 60,
      isActiveEvidence: true,
      activeVal: `${profile.age} yrs`,
      parents: []
    },
    {
      id: 'bmi',
      name: 'Weight / BMI',
      category: 'demographic',
      x: 100,
      y: 130,
      isActiveEvidence: isWeightActive,
      activeVal: `${bmiInfo.bmi} (${bmiInfo.category})`,
      parents: []
    },
    {
      id: 'sex',
      name: 'Biological Sex',
      category: 'demographic',
      x: 100,
      y: 200,
      isActiveEvidence: true,
      activeVal: profile.gender,
      parents: []
    },
    {
      id: 'smoking',
      name: 'Smoking Behavior',
      category: 'demographic',
      x: 100,
      y: 270,
      isActiveEvidence: isSmokingActive,
      activeVal: profile.smoking,
      parents: []
    },
    {
      id: 'famHist',
      name: 'Family Genetics',
      category: 'demographic',
      x: 100,
      y: 340,
      isActiveEvidence: isFamHistActive,
      activeVal: profile.familyHistory ? 'Positive (+)' : 'Negative (-)',
      parents: []
    },

    // Layer 2: Intermediate Disease States
    {
      id: 'chd',
      name: 'Coronary Heart Disease',
      category: 'disease',
      x: 400,
      y: 140,
      isActiveEvidence: false,
      probability: heartRisk.percentage,
      parents: ['age', 'bmi', 'sex', 'smoking', 'famHist', 't2d']
    },
    {
      id: 't2d',
      name: 'Type-2 Diabetes',
      category: 'disease',
      x: 400,
      y: 270,
      isActiveEvidence: false,
      probability: diabetesRisk.percentage,
      parents: ['age', 'bmi', 'famHist']
    },

    // Layer 3: Observable Evidence / Symptoms
    {
      id: 'chest',
      name: 'Chest Discomfort',
      category: 'symptom',
      x: 700,
      y: 60,
      isActiveEvidence: isChestActive,
      activeVal: profile.chestSensation,
      parents: ['chd']
    },
    {
      id: 'dyspnea',
      name: 'Dyspnea / Breathing',
      category: 'symptom',
      x: 700,
      y: 130,
      isActiveEvidence: isDyspneaActive,
      activeVal: profile.breathingEffort,
      parents: ['chd']
    },
    {
      id: 'fatigue',
      name: 'Fatigue & Stamina',
      category: 'symptom',
      x: 700,
      y: 200,
      isActiveEvidence: isFatigueActive,
      activeVal: profile.energyStamina,
      parents: ['chd', 't2d']
    },
    {
      id: 'bp',
      name: 'Blood Pressure',
      category: 'symptom',
      x: 700,
      y: 270,
      isActiveEvidence: isBpActive,
      activeVal: profile.bloodPressure,
      parents: ['chd']
    },
    {
      id: 'glucose',
      name: 'Blood Glucose',
      category: 'symptom',
      x: 700,
      y: 340,
      isActiveEvidence: isGlucoseActive,
      activeVal: profile.fastingBloodSugar,
      parents: ['t2d']
    }
  ];

  const edges: GraphEdge[] = [
    // Demographics -> CHD
    { from: 'age', to: 'chd' },
    { from: 'bmi', to: 'chd' },
    { from: 'sex', to: 'chd' },
    { from: 'smoking', to: 'chd' },
    { from: 'famHist', to: 'chd' },
    // Demographics -> T2D
    { from: 'age', to: 't2d' },
    { from: 'bmi', to: 't2d' },
    { from: 'famHist', to: 't2d' },
    // Inter-disease causal link
    { from: 't2d', to: 'chd' },
    // CHD -> Symptoms
    { from: 'chd', to: 'chest' },
    { from: 'chd', to: 'dyspnea' },
    { from: 'chd', to: 'fatigue' },
    { from: 'chd', to: 'bp' },
    // T2D -> Symptoms
    { from: 't2d', to: 'fatigue' },
    { from: 't2d', to: 'glucose' }
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const activeHoveredNode = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Network className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-medium text-[#1E293B] text-sm">
              Bayesian Belief Network Causal Architecture
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Real-time Directed Acyclic Graph (DAG) with dynamic node activation &amp; posterior flow.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
            <span>Active Evidence (Glowing)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span>Predicted Disease Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Baseline / Unobserved</span>
          </div>
        </div>
      </div>

      {/* SVG DAG Visualizer */}
      <div className="relative w-full overflow-x-auto bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
        <svg
          viewBox="0 0 800 400"
          className="w-full min-w-[700px] h-[340px] select-none"
        >
          <defs>
            {/* Arrow marker standard */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#CBD5E1" />
            </marker>
            {/* Arrow marker active highlight */}
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563EB" />
            </marker>
            {/* Soft glow filter */}
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2563EB" floodOpacity="0.45" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#D97706" floodOpacity="0.4" />
            </filter>
            <filter id="glow-coral" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#E11D48" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Layer Headers */}
          <text x="100" y="24" textAnchor="middle" className="text-[11px] fill-slate-600 font-medium tracking-wide">
            DEMOGRAPHICS &amp; HABITS
          </text>
          <text x="400" y="24" textAnchor="middle" className="text-[11px] fill-slate-600 font-medium tracking-wide">
            INTERMEDIATE DISEASE STATES
          </text>
          <text x="700" y="24" textAnchor="middle" className="text-[11px] fill-slate-600 font-medium tracking-wide">
            OBSERVABLE EVIDENCE &amp; VITALS
          </text>

          {/* Directed Causal Edges */}
          {edges.map((edge) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            const isEdgeActive = fromNode.isActiveEvidence || (fromNode.category === 'disease' && (fromNode.probability || 0) > 30);

            // Curved bezier path
            const dx = toNode.x - fromNode.x;
            const cx1 = fromNode.x + dx * 0.45;
            const cx2 = toNode.x - dx * 0.45;
            const d = `M ${fromNode.x} ${fromNode.y} C ${cx1} ${fromNode.y}, ${cx2} ${toNode.y}, ${toNode.x} ${toNode.y}`;

            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={d}
                fill="none"
                stroke={isEdgeActive ? '#93C5FD' : '#E2E8F0'}
                strokeWidth={isEdgeActive ? 1.75 : 1.2}
                strokeDasharray={isEdgeActive ? 'none' : '3 2'}
                markerEnd={isEdgeActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                className="transition-colors duration-300"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHovered = selectedNode === node.id;

            if (node.category === 'disease') {
              const prob = node.probability || 0;
              const isHigh = prob > 50;
              const isMod = prob >= 25 && prob <= 50;
              const fillColor = isHigh ? '#FFF1F2' : isMod ? '#FFFBEB' : '#ECFDF5';
              const strokeColor = isHigh ? '#E11D48' : isMod ? '#D97706' : '#0D9488';
              const glowFilter = isHigh ? 'url(#glow-coral)' : isMod ? 'url(#glow-amber)' : 'none';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setSelectedNode(node.id)}
                  onMouseLeave={() => setSelectedNode(null)}
                  className="cursor-pointer transition-transform duration-200"
                  style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                >
                  <rect
                    x="-82"
                    y="-28"
                    width="164"
                    height="56"
                    rx="14"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 2.5 : 1.8}
                    filter={glowFilter}
                  />
                  <text
                    x="0"
                    y="-6"
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-slate-800"
                  >
                    {node.name}
                  </text>
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    className="text-[12px] font-mono font-semibold"
                    fill={strokeColor}
                  >
                    P(High) = {prob.toFixed(1)}%
                  </text>
                </g>
              );
            }

            // Demographic or Symptom Nodes
            const isActive = node.isActiveEvidence;
            const fillColor = isActive ? '#EFF6FF' : '#FFFFFF';
            const strokeColor = isActive ? '#2563EB' : '#CBD5E1';
            const filterId = isActive ? 'url(#glow-blue)' : 'none';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setSelectedNode(node.id)}
                onMouseLeave={() => setSelectedNode(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                <rect
                  x="-72"
                  y="-22"
                  width="144"
                  height="44"
                  rx="12"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 2 : 1.2}
                  filter={filterId}
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isActive ? 'fill-blue-900 font-semibold' : 'fill-slate-700'
                  }`}
                >
                  {node.name}
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  className={`text-[9.5px] truncate ${
                    isActive ? 'fill-blue-700 font-medium' : 'fill-slate-400'
                  }`}
                >
                  {node.activeVal || 'Unchecked'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Node Inspection Footer */}
      <div className="mt-3.5 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {activeHoveredNode ? (
              <>
                <strong>{activeHoveredNode.name}:</strong>{' '}
                {activeHoveredNode.activeVal || `Posterior: ${activeHoveredNode.probability?.toFixed(1)}%`}
                {activeHoveredNode.parents.length > 0 && (
                  <span className="text-slate-400 ml-2">
                    (Conditioned on: {activeHoveredNode.parents.join(', ')})
                  </span>
                )}
              </>
            ) : (
              'Hover over any network node or edge to inspect conditional probability flow.'
            )}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 hidden md:block">
          Exact Bayesian Variable Elimination
        </div>
      </div>
    </div>
  );
};
