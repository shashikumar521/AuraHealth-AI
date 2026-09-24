import React, { useState } from 'react';
import { Network, Zap } from 'lucide-react';
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
  const isEdemaActive = profile.peripheralEdema !== 'No swelling';
  const isSleepActive = profile.sleepQuality.includes('Possible Sleep Apnea');
  const isActivityActive = profile.physicalActivity === 'Sedentary (Low Activity)';
  const isBpActive =
    profile.bloodPressure === 'Pre-hypertension' || profile.bloodPressure === 'Diagnosed High';
  const isGlucoseActive =
    profile.fastingBloodSugar === 'Elevated (100–125)' ||
    profile.fastingBloodSugar === 'Diabetic (126+)';
  const isSmokingActive = profile.smoking !== 'Non-Smoker';
  const isWeightActive = bmiInfo.category !== 'Healthy Weight';
  const isFamHistActive = profile.familyHistory;

  // Graph Layout coordinates (SVG width: 860, height: 460)
  // Layer 1: Inputs / Parents (x: 120)
  // Layer 2: Disease States (x: 430)
  // Layer 3: Observable Evidence / Symptoms (x: 740)
  const nodes: GraphNode[] = [
    // Layer 1: Demographics & Lifestyle
    {
      id: 'age',
      name: 'Age Demographic',
      category: 'demographic',
      x: 120,
      y: 45,
      isActiveEvidence: true,
      activeVal: `${profile.age} yrs`,
      parents: []
    },
    {
      id: 'bmi',
      name: 'Weight / BMI',
      category: 'demographic',
      x: 120,
      y: 110,
      isActiveEvidence: isWeightActive,
      activeVal: `${bmiInfo.bmi} (${bmiInfo.category})`,
      parents: []
    },
    {
      id: 'sex',
      name: 'Biological Sex',
      category: 'demographic',
      x: 120,
      y: 175,
      isActiveEvidence: true,
      activeVal: profile.gender,
      parents: []
    },
    {
      id: 'smoking',
      name: 'Smoking Habit',
      category: 'demographic',
      x: 120,
      y: 240,
      isActiveEvidence: isSmokingActive,
      activeVal: profile.smoking.split('/')[0].trim(),
      parents: []
    },
    {
      id: 'activity',
      name: 'Physical Activity',
      category: 'demographic',
      x: 120,
      y: 305,
      isActiveEvidence: isActivityActive,
      activeVal: profile.physicalActivity.split('/')[0].trim(),
      parents: []
    },
    {
      id: 'sleep',
      name: 'Sleep / Apnea',
      category: 'demographic',
      x: 120,
      y: 370,
      isActiveEvidence: isSleepActive,
      activeVal: isSleepActive ? 'OSA Sign' : 'Normal',
      parents: []
    },
    {
      id: 'famHist',
      name: 'Family Genetics',
      category: 'demographic',
      x: 120,
      y: 435,
      isActiveEvidence: isFamHistActive,
      activeVal: profile.familyHistory ? 'Positive (+)' : 'Negative (-)',
      parents: []
    },

    // Layer 2: Intermediate Condition States
    {
      id: 'chd',
      name: 'Coronary Heart Disease',
      category: 'disease',
      x: 430,
      y: 130,
      isActiveEvidence: false,
      probability: heartRisk.percentage,
      parents: ['age', 'bmi', 'sex', 'smoking', 'activity', 'sleep', 'famHist', 't2d']
    },
    {
      id: 't2d',
      name: 'Type-2 Diabetes',
      category: 'disease',
      x: 430,
      y: 275,
      isActiveEvidence: false,
      probability: diabetesRisk.percentage,
      parents: ['age', 'bmi', 'activity', 'famHist']
    },
    {
      id: 'strain',
      name: 'Hypertensive Strain',
      category: 'disease',
      x: 430,
      y: 395,
      isActiveEvidence: false,
      probability: Math.min(95, Math.round((heartRisk.percentage * 0.65 + (isBpActive ? 30 : 5)))),
      parents: ['chd', 'sleep']
    },

    // Layer 3: Observable Evidence / Symptoms
    {
      id: 'chest',
      name: 'Chest Discomfort',
      category: 'symptom',
      x: 740,
      y: 55,
      isActiveEvidence: isChestActive,
      activeVal: profile.chestSensation.split('/')[0].trim(),
      parents: ['chd']
    },
    {
      id: 'dyspnea',
      name: 'Exertional Dyspnea',
      category: 'symptom',
      x: 740,
      y: 135,
      isActiveEvidence: isDyspneaActive,
      activeVal: profile.breathingEffort.split('during')[0].trim(),
      parents: ['chd']
    },
    {
      id: 'edema',
      name: 'Peripheral Edema',
      category: 'symptom',
      x: 740,
      y: 215,
      isActiveEvidence: isEdemaActive,
      activeVal: isEdemaActive ? 'Swelling' : 'No swelling',
      parents: ['strain', 'chd']
    },
    {
      id: 'bp',
      name: 'Blood Pressure',
      category: 'symptom',
      x: 740,
      y: 295,
      isActiveEvidence: isBpActive,
      activeVal: profile.bloodPressure.split('(')[0].trim(),
      parents: ['chd', 'strain']
    },
    {
      id: 'glucose',
      name: 'Blood Glucose',
      category: 'symptom',
      x: 740,
      y: 375,
      isActiveEvidence: isGlucoseActive,
      activeVal: profile.fastingBloodSugar.split('(')[0].trim(),
      parents: ['t2d']
    }
  ];

  const edges: GraphEdge[] = [
    // Demographics -> CHD
    { from: 'age', to: 'chd' },
    { from: 'bmi', to: 'chd' },
    { from: 'sex', to: 'chd' },
    { from: 'smoking', to: 'chd' },
    { from: 'activity', to: 'chd' },
    { from: 'sleep', to: 'chd' },
    { from: 'famHist', to: 'chd' },

    // Demographics -> T2D
    { from: 'age', to: 't2d' },
    { from: 'bmi', to: 't2d' },
    { from: 'activity', to: 't2d' },
    { from: 'famHist', to: 't2d' },

    // Inter-disease causal links
    { from: 't2d', to: 'chd' },
    { from: 'chd', to: 'strain' },
    { from: 'sleep', to: 'strain' },

    // Disease -> Observable Symptoms
    { from: 'chd', to: 'chest' },
    { from: 'chd', to: 'dyspnea' },
    { from: 'chd', to: 'bp' },
    { from: 'strain', to: 'edema' },
    { from: 'strain', to: 'bp' },
    { from: 't2d', to: 'glucose' }
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const activeHoveredNode = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-cyan-500/15 p-6 shadow-xl shadow-black/25">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Network className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-semibold text-white text-sm">
              Bayesian Belief Network Causal Architecture (DAG)
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 2D Directed Acyclic Graph calibrated to pgmpy inference topology
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/30" />
            <span>Active Marker (#48CAE4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
            <span>Target Disease Nodes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span>Baseline / Dormant</span>
          </div>
        </div>
      </div>

      {/* SVG DAG Visual Canvas */}
      <div className="w-full overflow-x-auto bg-[#0B132B]/80 rounded-xl border border-cyan-500/10 p-2">
        <svg
          viewBox="0 0 860 480"
          className="w-full min-w-[760px] h-auto select-none"
          style={{ maxHeight: '430px' }}
        >
          <defs>
            <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#48CAE4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3A86FF" stopOpacity="0.6" />
            </linearGradient>

            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#48CAE4" floodOpacity="0.5" />
            </filter>
            <filter id="glow-crimson" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F87171" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Graph Edges */}
          {edges.map((edge, idx) => {
            const source = nodeMap.get(edge.from);
            const target = nodeMap.get(edge.to);
            if (!source || !target) return null;

            const isEdgeHighlighted =
              selectedNode === edge.from || selectedNode === edge.to;
            const strokeColor = isEdgeHighlighted
              ? '#48CAE4'
              : 'rgba(72, 202, 228, 0.22)';
            const strokeW = isEdgeHighlighted ? 2.5 : 1.2;

            // Bezier curve
            const dx = target.x - source.x;
            const cx1 = source.x + dx * 0.45;
            const cy1 = source.y;
            const cx2 = source.x + dx * 0.55;
            const cy2 = target.y;

            return (
              <path
                key={`edge-${idx}`}
                d={`M ${source.x + 65} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x - 70} ${target.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeW}
                strokeDasharray={isEdgeHighlighted ? 'none' : '3 3'}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Graph Nodes */}
          {nodes.map((node) => {
            const isHovered = selectedNode === node.id;

            if (node.category === 'disease') {
              const prob = node.probability ?? 20;
              const isHigh = prob >= 40;
              const fillColor = '#1C2541';
              const strokeColor = isHigh ? '#F87171' : '#34D399';
              const glowFilter = isHovered || isHigh ? 'url(#glow-crimson)' : 'none';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setSelectedNode(node.id)}
                  onMouseLeave={() => setSelectedNode(null)}
                  className="cursor-pointer transition-transform duration-200"
                >
                  <rect
                    x="-76"
                    y="-26"
                    width="152"
                    height="52"
                    rx="14"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 2.5 : 1.8}
                    filter={glowFilter}
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    className="text-[11px] font-semibold fill-white"
                  >
                    {node.name}
                  </text>
                  <text
                    x="0"
                    y="15"
                    textAnchor="middle"
                    className="text-[12px] font-mono font-bold"
                    fill={strokeColor}
                  >
                    P(High) = {prob.toFixed(1)}%
                  </text>
                </g>
              );
            }

            // Demographic or Symptom Nodes
            const isActive = node.isActiveEvidence;
            const fillColor = isActive ? '#1C2541' : '#0F172A';
            const strokeColor = isActive ? '#48CAE4' : 'rgba(72, 202, 228, 0.25)';
            const filterId = isActive ? 'url(#glow-cyan)' : 'none';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setSelectedNode(node.id)}
                onMouseLeave={() => setSelectedNode(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                <rect
                  x="-65"
                  y="-18"
                  width="130"
                  height="36"
                  rx="10"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 1.8 : 1}
                  filter={filterId}
                />
                <text
                  x="0"
                  y="-2"
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isActive ? 'fill-cyan-300 font-semibold' : 'fill-slate-300'
                  }`}
                >
                  {node.name}
                </text>
                <text
                  x="0"
                  y="11"
                  textAnchor="middle"
                  className={`text-[9.5px] truncate font-mono ${
                    isActive ? 'fill-white font-medium' : 'fill-slate-500'
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
      <div className="mt-3.5 p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {activeHoveredNode ? (
              <>
                <strong className="text-white">{activeHoveredNode.name}:</strong>{' '}
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
        <div className="text-[11px] text-cyan-400 font-mono hidden md:block">
          Exact Variable Elimination
        </div>
      </div>
    </div>
  );
};
