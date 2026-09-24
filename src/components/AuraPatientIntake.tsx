import React, { useState } from 'react';
import {
  User,
  Heart,
  Stethoscope,
  Scale,
  Ruler,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import {
  AuraPatientProfile,
  BiologicalSex,
  SmokingStatus,
  ChestSensation,
  BreathingEffort,
  EnergyStamina,
  BloodPressureReading,
  FastingBloodSugar
} from '../types/health';
import { computeBmi, getBenchmarkWeightForAge } from '../engine/auraHealthEngine';

interface AuraPatientIntakeProps {
  profile: AuraPatientProfile;
  onChange: (updated: AuraPatientProfile) => void;
  onReset: () => void;
}

export const AuraPatientIntake: React.FC<AuraPatientIntakeProps> = ({
  profile,
  onChange,
  onReset
}) => {
  const [showHeightSettings, setShowHeightSettings] = useState(false);
  const bmiInfo = computeBmi(profile.weightKg, profile.heightCm, profile.age);
  const currentBenchmark = getBenchmarkWeightForAge(profile.age);

  const handleAgeChange = (newAge: number) => {
    const updatedBenchmark = getBenchmarkWeightForAge(newAge);
    onChange({
      ...profile,
      age: newAge,
      weightKg: updatedBenchmark
    });
  };

  const handleWeightChange = (newWeight: number) => {
    onChange({
      ...profile,
      weightKg: Math.max(40, Math.min(160, newWeight))
    });
  };

  const handleHeightChange = (newHeight: number) => {
    onChange({
      ...profile,
      heightCm: Math.max(120, Math.min(220, newHeight))
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner with Reset */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#1E293B] uppercase tracking-wider">
            Patient Intake Assessment
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time Bayesian parameters with reactive bidirectional synchronization.
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#E2E8F0] rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Reset to default patient values"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* CARD 1: Personal Profile */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs font-semibold">
            1
          </span>
          <div className="flex items-center gap-1.5 text-[#1E293B] font-medium text-sm">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal Profile &amp; Biometrics</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1.5">
              Full Name or Patient Identifier
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Biological Sex (Segmented Pills) */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1.5">
              Biological Sex
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
              {(['Male', 'Female'] as BiologicalSex[]).map((genderOption) => {
                const isSelected = profile.gender === genderOption;
                return (
                  <button
                    key={genderOption}
                    type="button"
                    onClick={() => onChange({ ...profile, gender: genderOption })}
                    className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {genderOption}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Slider with Auto Sync to Weight */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-[#1E293B]">Age</span>
              <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {profile.age} years
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={90}
              value={profile.age}
              onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Dynamic Benchmark Pill */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#0D9488] bg-teal-50/70 border border-teal-200/80 px-2.5 py-1 rounded-lg">
              <Info className="w-3 h-3 text-[#0D9488] shrink-0" />
              <span>
                Population median for age {profile.age}: <strong>{currentBenchmark} kg</strong>
              </span>
            </div>
          </div>

          {/* Weight Input (Number & Slider) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-[#1E293B]">Weight (kg)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={40}
                  max={160}
                  value={profile.weightKg}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 70)}
                  className="w-16 px-1.5 py-0.5 text-right font-mono font-semibold text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-md focus:outline-none"
                />
                <span className="text-xs text-slate-500">kg</span>
              </div>
            </div>
            <input
              type="range"
              min={40}
              max={140}
              value={profile.weightKg}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Dynamic BMI Badge */}
            <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Calculated BMI</span>
              </div>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${bmiInfo.badgeColor}`}
              >
                BMI: {bmiInfo.bmi} &middot; {bmiInfo.category}
              </span>
            </div>
          </div>

          {/* Height Adjuster Accordion */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHeightSettings(!showHeightSettings)}
              className="flex items-center justify-between w-full text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                <span>Height calibration: {profile.heightCm} cm</span>
              </div>
              {showHeightSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHeightSettings && (
              <div className="mt-2 p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Stature</span>
                  <span className="font-mono text-blue-600">{profile.heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min={140}
                  max={210}
                  value={profile.heightCm}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: Lifestyle & Background */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-semibold">
            2
          </span>
          <div className="flex items-center gap-1.5 text-[#1E293B] font-medium text-sm">
            <Heart className="w-4 h-4 text-indigo-600" />
            <span>Lifestyle &amp; Clinical Background</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Smoking Status */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1.5">
              Smoking Status
            </label>
            <div className="space-y-1.5">
              {(
                ['Non-Smoker', 'Former / Occasional', 'Active Daily Smoker'] as SmokingStatus[]
              ).map((option) => {
                const isSelected = profile.smoking === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onChange({ ...profile, smoking: option })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 text-blue-700 shadow-2xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-slate-700 hover:bg-slate-100/60'
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Family History Toggle */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-[#1E293B]">
                Immediate Family History
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                Any first-degree relative with early heart disease or diabetes?
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...profile, familyHistory: !profile.familyHistory })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                profile.familyHistory ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  profile.familyHistory ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* CARD 3: Observable Symptoms & Vitals */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center text-xs font-semibold">
            3
          </span>
          <div className="flex items-center gap-1.5 text-[#1E293B] font-medium text-sm">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Symptoms &amp; Observable Vitals</span>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Chest Sensation */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1">
              Chest Sensation
            </label>
            <select
              value={profile.chestSensation}
              onChange={(e) =>
                onChange({ ...profile, chestSensation: e.target.value as ChestSensation })
              }
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="No discomfort">No discomfort</option>
              <option value="Mild dull ache">Mild dull ache</option>
              <option value="Sharp / Tight angina pressure">Sharp / Tight angina pressure</option>
            </select>
          </div>

          {/* Breathing Effort */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1">
              Breathing Effort
            </label>
            <select
              value={profile.breathingEffort}
              onChange={(e) =>
                onChange({ ...profile, breathingEffort: e.target.value as BreathingEffort })
              }
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="Easy & normal">Easy & normal</option>
              <option value="Short of breath during mild walks">Short of breath during mild walks</option>
              <option value="Breathless at rest">Breathless at rest</option>
            </select>
          </div>

          {/* Energy & Stamina */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1">
              Energy &amp; Stamina
            </label>
            <select
              value={profile.energyStamina}
              onChange={(e) =>
                onChange({ ...profile, energyStamina: e.target.value as EnergyStamina })
              }
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="High / Normal energy">High / Normal energy</option>
              <option value="Chronic fatigue / Easily exhausted">Chronic fatigue / Easily exhausted</option>
            </select>
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1">
              Blood Pressure
            </label>
            <select
              value={profile.bloodPressure}
              onChange={(e) =>
                onChange({ ...profile, bloodPressure: e.target.value as BloodPressureReading })
              }
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="Normal (<120/80)">Normal (&lt;120/80)</option>
              <option value="Pre-hypertension">Pre-hypertension (120-139 / 80-89)</option>
              <option value="Diagnosed High">Diagnosed High (140+ / 90+)</option>
              <option value="Unchecked / Unknown">Unchecked / Unknown</option>
            </select>
          </div>

          {/* Fasting Blood Sugar */}
          <div>
            <label className="block text-xs font-medium text-[#1E293B] mb-1">
              Fasting Blood Sugar
            </label>
            <select
              value={profile.fastingBloodSugar}
              onChange={(e) =>
                onChange({ ...profile, fastingBloodSugar: e.target.value as FastingBloodSugar })
              }
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="Normal (<100 mg/dL)">Normal (&lt;100 mg/dL)</option>
              <option value="Elevated (100–125)">Elevated (100–125 mg/dL)</option>
              <option value="Diabetic (126+)">Diabetic (126+ mg/dL)</option>
              <option value="Unchecked / Unknown">Unchecked / Unknown</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
