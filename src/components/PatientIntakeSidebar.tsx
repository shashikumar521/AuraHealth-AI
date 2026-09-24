import React from 'react';
import {
  PatientIntake,
  AgeCategory,
  BMICategory,
  GenderCategory,
  SmokingCategory,
  FamilyHistoryCategory,
  ChestPainCategory,
  DyspneaCategory,
  FastingGlucoseCategory,
  RestingECGCategory,
  FatigueCategory
} from '../types/clinical';
import { User, Activity, Heart, Stethoscope, Zap, RefreshCw, Sparkles } from 'lucide-react';

interface PatientIntakeSidebarProps {
  intake: PatientIntake;
  onChange: (updated: Partial<PatientIntake>) => void;
  onRunInference: () => void;
}

export const PatientIntakeSidebar: React.FC<PatientIntakeSidebarProps> = ({
  intake,
  onChange,
  onRunInference
}) => {
  // Helper to recalculate age category
  const handleAgeChange = (ageVal: number) => {
    let cat: AgeCategory = 'Middle-aged (35-60)';
    if (ageVal < 35) cat = 'Young (<35)';
    else if (ageVal > 60) cat = 'Senior (>60)';
    onChange({ rawAge: ageVal, age: cat });
  };

  // Helper to recalculate BMI and BMI category
  const handleHeightWeightChange = (height: number, weight: number) => {
    const bmi = weight / Math.pow(height / 100, 2);
    let cat: BMICategory = 'Normal (<25)';
    if (bmi >= 30) cat = 'Obese (>30)';
    else if (bmi >= 25) cat = 'Overweight (25-30)';
    onChange({ heightCm: height, weightKg: weight, bmiValue: Math.round(bmi * 10) / 10, bmiCategory: cat });
  };

  // Clinical preset scenarios
  const applyPreset = (presetKey: 'criticalCAD' | 'metabolicT2D' | 'elderlyHTN' | 'healthyYoung') => {
    if (presetKey === 'criticalCAD') {
      onChange({
        patientId: 'PT-CAD-9921',
        patientName: 'Robert M.',
        rawAge: 68,
        age: 'Senior (>60)',
        gender: 'Male',
        smoking: 'Current-smoker',
        heightCm: 176,
        weightKg: 98,
        bmiValue: 31.6,
        bmiCategory: 'Obese (>30)',
        familyHistory: 'Present',
        chestPain: 'Typical_Angina',
        dyspnea: 'Severe',
        fastingGlucose: 'Pre-diabetic (100-125)',
        restingEcg: 'ST_T_Abnormality',
        fatigue: 'Chronic_Exhaustion'
      });
    } else if (presetKey === 'metabolicT2D') {
      onChange({
        patientId: 'PT-MET-4412',
        patientName: 'Maria S.',
        rawAge: 54,
        age: 'Middle-aged (35-60)',
        gender: 'Female',
        smoking: 'Non-smoker',
        heightCm: 162,
        weightKg: 89,
        bmiValue: 33.9,
        bmiCategory: 'Obese (>30)',
        familyHistory: 'Present',
        chestPain: 'None',
        dyspnea: 'Mild',
        fastingGlucose: 'Diabetic (>=126)',
        restingEcg: 'Normal',
        fatigue: 'Chronic_Exhaustion'
      });
    } else if (presetKey === 'elderlyHTN') {
      onChange({
        patientId: 'PT-HTN-3120',
        patientName: 'Arthur K.',
        rawAge: 72,
        age: 'Senior (>60)',
        gender: 'Male',
        smoking: 'Former-smoker',
        heightCm: 170,
        weightKg: 81,
        bmiValue: 28.0,
        bmiCategory: 'Overweight (25-30)',
        familyHistory: 'Absent',
        chestPain: 'Atypical',
        dyspnea: 'Severe',
        fastingGlucose: 'Normal (<100)',
        restingEcg: 'Hypertrophy',
        fatigue: 'Normal'
      });
    } else if (presetKey === 'healthyYoung') {
      onChange({
        patientId: 'PT-CTL-1002',
        patientName: 'Sarah L.',
        rawAge: 28,
        age: 'Young (<35)',
        gender: 'Female',
        smoking: 'Non-smoker',
        heightCm: 168,
        weightKg: 59,
        bmiValue: 20.9,
        bmiCategory: 'Normal (<25)',
        familyHistory: 'Absent',
        chestPain: 'None',
        dyspnea: 'Absent',
        fastingGlucose: 'Normal (<100)',
        restingEcg: 'Normal',
        fatigue: 'Normal'
      });
    }
  };

  return (
    <aside className="w-full lg:w-84 bg-slate-900 text-slate-100 p-5 flex flex-col justify-between shrink-0 border-r border-slate-800">
      <div className="space-y-5">
        {/* Sidebar Header */}
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base flex items-center gap-2 text-white">
              <Stethoscope className="w-4 h-4 text-blue-400" />
              <span>Patient Intake Form</span>
            </h2>
            <span className="text-[10px] uppercase font-mono bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
              CDSS V2.4
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bayesian evidence vector ingestion
          </p>
        </div>

        {/* Clinical Preset Quick-Loader */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Clinical Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => applyPreset('criticalCAD')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-red-400">Critical CAD</div>
              <div className="text-[10px] text-slate-400">Smoker + Angina</div>
            </button>
            <button
              onClick={() => applyPreset('metabolicT2D')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-amber-400">Metabolic T2D</div>
              <div className="text-[10px] text-slate-400">Obese + Hyperglyc</div>
            </button>
            <button
              onClick={() => applyPreset('elderlyHTN')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-purple-400">Senior HTN</div>
              <div className="text-[10px] text-slate-400">Dyspnea + ECG Hyp</div>
            </button>
            <button
              onClick={() => applyPreset('healthyYoung')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded border border-slate-700 text-left transition-colors"
            >
              <div className="font-semibold text-emerald-400">Young Baseline</div>
              <div className="text-[10px] text-slate-400">Asymptomatic</div>
            </button>
          </div>
        </div>

        {/* Patient Identifiers */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Patient ID</label>
              <input
                type="text"
                value={intake.patientId}
                onChange={(e) => onChange({ patientId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400">Name / Initials</label>
              <input
                type="text"
                value={intake.patientName}
                onChange={(e) => onChange({ patientName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 1. Demographics */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> 1. Demographics
          </h3>

          {/* Age Slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Age: <strong className="text-white">{intake.rawAge} yrs</strong></span>
              <span className="text-blue-300 font-mono text-[11px]">{intake.age}</span>
            </div>
            <input
              type="range"
              min={18}
              max={90}
              value={intake.rawAge}
              onChange={(e) => handleAgeChange(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Gender Radio */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Biological Sex</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Male', 'Female'] as GenderCategory[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => onChange({ gender: g })}
                  className={`py-1 px-3 text-xs rounded border transition-colors ${
                    intake.gender === g
                      ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Lifestyle & Risk Factors */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> 2. Lifestyle &amp; Biomarkers
          </h3>

          {/* Smoking */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Smoking History</label>
            <select
              value={intake.smoking}
              onChange={(e) => onChange({ smoking: e.target.value as SmokingCategory })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Non-smoker">Non-smoker</option>
              <option value="Former-smoker">Former-smoker</option>
              <option value="Current-smoker">Current-smoker</option>
            </select>
          </div>

          {/* Height & Weight / BMI */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">BMI: <strong className="text-white">{intake.bmiValue} kg/m²</strong></span>
              <span className="text-amber-300 font-mono text-[11px]">{intake.bmiCategory}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500">Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={220}
                  value={intake.heightCm}
                  onChange={(e) => handleHeightWeightChange(parseFloat(e.target.value) || 170, intake.weightKg)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Weight (kg)</label>
                <input
                  type="number"
                  min={30}
                  max={200}
                  value={intake.weightKg}
                  onChange={(e) => handleHeightWeightChange(intake.heightCm, parseFloat(e.target.value) || 70)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Family History */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Family History of CVD / T2D</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Absent', 'Present'] as FamilyHistoryCategory[]).map((fh) => (
                <button
                  key={fh}
                  type="button"
                  onClick={() => onChange({ familyHistory: fh })}
                  className={`py-1 px-3 text-xs rounded border transition-colors ${
                    intake.familyHistory === fh
                      ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {fh}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Symptoms & Diagnostic Vitals */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" /> 3. Symptoms &amp; Diagnostic Vitals
          </h3>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Chest Pain Presentation</label>
            <select
              value={intake.chestPain}
              onChange={(e) => onChange({ chestPain: e.target.value as ChestPainCategory })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="None">None</option>
              <option value="Atypical">Atypical</option>
              <option value="Typical_Angina">Typical Angina</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Dyspnea (Shortness of Breath)</label>
            <select
              value={intake.dyspnea}
              onChange={(e) => onChange({ dyspnea: e.target.value as DyspneaCategory })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Absent">Absent</option>
              <option value="Mild">Mild</option>
              <option value="Severe">Severe</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Fasting Blood Glucose</label>
            <select
              value={intake.fastingGlucose}
              onChange={(e) => onChange({ fastingGlucose: e.target.value as FastingGlucoseCategory })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Normal (<100)">Normal (&lt;100 mg/dL)</option>
              <option value="Pre-diabetic (100-125)">Pre-diabetic (100–125 mg/dL)</option>
              <option value="Diabetic (>=126)">Diabetic (&ge;126 mg/dL)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Resting 12-Lead ECG</label>
            <select
              value={intake.restingEcg}
              onChange={(e) => onChange({ restingEcg: e.target.value as RestingECGCategory })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Normal">Normal</option>
              <option value="ST_T_Abnormality">ST-T Wave Abnormality</option>
              <option value="Hypertrophy">Left Ventricular Hypertrophy</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Fatigue Level</label>
            <select
              value={intake.fatigue}
              onChange={(e) => onChange({ fatigue: e.target.value as FatigueCategory })}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Normal">Normal</option>
              <option value="Chronic_Exhaustion">Chronic Exhaustion</option>
            </select>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4 mt-5 border-t border-slate-800">
        <button
          onClick={onRunInference}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-98"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Run Bayesian Clinical Inference</span>
        </button>
      </div>
    </aside>
  );
};
