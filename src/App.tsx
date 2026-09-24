import React, { useState, useMemo } from 'react';
import { AuraPatientProfile } from './types/health';
import {
  calculateAuraBayesianRisk,
  calculateStatisticalEvidence,
  evaluateRiskTier,
  generateActionableGuidance,
  getBenchmarkWeightForAge,
  computeBmi
} from './engine/auraHealthEngine';

import { AuraHeader } from './components/AuraHeader';
import { AuraPatientIntake } from './components/AuraPatientIntake';
import { AuraGauges } from './components/AuraGauges';
import { AuraBayesianGraph } from './components/AuraBayesianGraph';
import { AuraEvidenceCards } from './components/AuraEvidenceCards';
import { AuraActionableGuidance } from './components/AuraActionableGuidance';
import { AuraReportModal } from './components/AuraReportModal';
import { PythonScriptTab } from './components/PythonScriptTab';
import { AURA_HEALTH_APP_PY } from './constants/auraPythonCode';

import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileDown
} from 'lucide-react';

const DEFAULT_PROFILE: AuraPatientProfile = {
  name: 'Eleanor Vance',
  age: 52,
  weightKg: getBenchmarkWeightForAge(52),
  heightCm: 172,
  gender: 'Female',
  smoking: 'Former / Occasional',
  physicalActivity: 'Sedentary (Low Activity)',
  sleepQuality: 'Normal restful sleep',
  peripheralEdema: 'Swelling in ankles/feet after sitting or walking',
  familyHistory: true,
  chestSensation: 'Mild dull ache',
  breathingEffort: 'Short of breath during mild walks',
  energyStamina: 'Chronic fatigue / Easily exhausted',
  bloodPressure: 'Pre-hypertension',
  fastingBloodSugar: 'Elevated (100–125)'
};

export default function App() {
  const [profile, setProfile] = useState<AuraPatientProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'python'>('dashboard');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showEvaluatedNotice, setShowEvaluatedNotice] = useState(false);

  // Compute live Bayesian risks
  const { heartPct, diabetesPct } = useMemo(
    () => calculateAuraBayesianRisk(profile),
    [profile]
  );

  // Compute clinical risk tiers
  const heartRisk = useMemo(
    () => evaluateRiskTier(heartPct, 'Coronary Heart Disease'),
    [heartPct]
  );

  const diabetesRisk = useMemo(
    () => evaluateRiskTier(diabetesPct, 'Type-2 Diabetes'),
    [diabetesPct]
  );

  // Compute Chi-Square Statistical Evidence
  const evidenceList = useMemo(
    () => calculateStatisticalEvidence(profile),
    [profile]
  );

  // Compute 3 Personalized Action Recommendations
  const actionableRecommendations = useMemo(
    () => generateActionableGuidance(profile, heartPct, diabetesPct),
    [profile, heartPct, diabetesPct]
  );

  const bmiInfo = useMemo(
    () => computeBmi(profile.weightKg, profile.heightCm, profile.age),
    [profile.weightKg, profile.heightCm, profile.age]
  );

  // Metabolic age calculation
  const calculatedMetabolicAge = useMemo(() => {
    let delta = 0;
    if (bmiInfo.bmi >= 30) delta += 4;
    else if (bmiInfo.bmi >= 25) delta += 2;
    if (profile.smoking === 'Active Daily Smoker') delta += 5;
    else if (profile.smoking === 'Former / Occasional') delta += 2;
    if (profile.physicalActivity === 'Sedentary (Low Activity)') delta += 3;
    if (profile.sleepQuality.includes('Possible Sleep Apnea')) delta += 3;
    return profile.age + delta;
  }, [profile, bmiInfo]);

  const handleRunAssessment = () => {
    setShowEvaluatedNotice(true);
    setTimeout(() => setShowEvaluatedNotice(false), 2400);
  };

  const handleResetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <AuraHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportReport={() => setIsReportOpen(true)}
        patientName={profile.name}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Numbered Floating Cards Patient Intake (Cols 1-4) */}
            <div className="lg:col-span-4 space-y-4">
              <AuraPatientIntake
                profile={profile}
                onChange={setProfile}
                onReset={handleResetProfile}
              />

              {/* Run Assessment CTA Button */}
              <button
                type="button"
                onClick={handleRunAssessment}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:shadow-cyan-500/40"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Run Bayesian Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {showEvaluatedNotice && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 transition-all">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Exact Bayesian posterior &amp; &chi;&sup2; models updated in real time!
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Clinical Intelligence Dashboard (Cols 5-12) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Executive Brief Header */}
              <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-5 shadow-xl shadow-black/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
                    AURA AI CLINICAL SYNTHESIS
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">
                    Patient Intelligence: {profile.name || 'Anonymous Patient'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Chronological Age: <strong className="text-white">{profile.age} yrs</strong> &middot; Calculated Metabolic Age: <strong className="text-cyan-400">{calculatedMetabolicAge} yrs</strong>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-300">
                    <span className="px-2.5 py-0.5 bg-slate-800/80 border border-slate-700 rounded-md font-medium text-slate-200">
                      {profile.gender}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-800/80 border border-slate-700 rounded-md font-medium text-slate-200">
                      BMI: {bmiInfo.bmi} ({bmiInfo.category})
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-800/80 border border-slate-700 rounded-md font-medium text-slate-200">
                      {profile.physicalActivity.split('/')[0]}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-800/80 border border-slate-700 rounded-md font-medium text-slate-200">
                      Genetics: {profile.familyHistory ? 'Positive (+)' : 'Negative (-)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-cyan-500/20 shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>Download Dossier</span>
                </button>
              </div>

              {/* 2. Holographic Circular Radial Gauges */}
              <AuraGauges
                heartRisk={heartRisk}
                diabetesRisk={diabetesRisk}
              />

              {/* 3. Interactive Bayesian Belief Network DAG */}
              <AuraBayesianGraph
                profile={profile}
                heartRisk={heartRisk}
                diabetesRisk={diabetesRisk}
              />

              {/* 4. Statistical Evidence Breakdown (Cards) */}
              <AuraEvidenceCards evidenceList={evidenceList} />

              {/* 5. Personalized Actionable Guidance */}
              <AuraActionableGuidance recommendations={actionableRecommendations} />

              {/* 6. Professional Clinical Disclaimer */}
              <div className="p-4 bg-slate-900/60 border-l-3 border-cyan-400 rounded-r-2xl flex items-start gap-3 text-xs text-slate-400 leading-relaxed shadow-lg">
                <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Clinical Governance &amp; Compliance Notice:</span>
                  <p className="mt-0.5 text-slate-300 font-normal">
                    AuraHealth Nexus computes statistical likelihood approximations through Bayesian variable elimination and Chi-Square contingency testing. This platform is engineered for clinical decision support, academic demonstration, and health risk awareness. It does not replace formal individualized medical consultation or diagnostic laboratory examinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PythonScriptTab pythonCode={AURA_HEALTH_APP_PY} />
        )}
      </main>

      {/* Export / Printable Report Modal */}
      <AuraReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        profile={profile}
        heartRisk={heartRisk}
        diabetesRisk={diabetesRisk}
        evidenceList={evidenceList}
        recommendations={actionableRecommendations}
      />
    </div>
  );
}
