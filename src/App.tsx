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

  const handleRunAssessment = () => {
    setShowEvaluatedNotice(true);
    setTimeout(() => setShowEvaluatedNotice(false), 2400);
  };

  const handleResetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1E293B] antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-2xl shadow-xs transition-all cursor-pointer hover:shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Run Clinical Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {showEvaluatedNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 transition-all">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Exact Bayesian posterior &amp; &chi;&sup2; models updated in real time!
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: Competition-Winning Clinical Intelligence Dashboard (Cols 5-12) */}
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Executive Brief Header */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider font-mono">
                    Executive Health Brief
                  </span>
                  <h2 className="text-lg font-semibold text-[#1E293B] mt-0.5">
                    Patient Intelligence: {profile.name || 'Anonymous Patient'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#64748B]">
                    <span className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded-md font-medium text-slate-700">
                      {profile.age} yrs &middot; {profile.gender}
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded-md font-medium text-slate-700">
                      BMI: {bmiInfo.bmi} ({bmiInfo.category})
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded-md font-medium text-slate-700">
                      {profile.smoking}
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-[#E2E8F0] rounded-md font-medium text-slate-700">
                      Genetics: {profile.familyHistory ? 'Positive (+)' : 'Negative (-)'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl border border-[#E2E8F0] shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-blue-600" />
                  <span>Download Brief</span>
                </button>
              </div>

              {/* 2. Animated Circular Radial Gauges */}
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
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-950">Clinical Governance &amp; Compliance Notice:</span>
                  <p className="mt-0.5 text-amber-900/90 font-normal">
                    AuraHealth AI computes statistical likelihood approximations through Bayesian variable elimination and Chi-Square contingency testing. This platform is engineered for clinical decision support, academic demonstration, and health risk awareness. It does not replace formal individualized medical consultation or diagnostic laboratory examinations.
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
