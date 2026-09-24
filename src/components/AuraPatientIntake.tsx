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
  RotateCcw,
  Moon,
  Activity
} from 'lucide-react';
import {
  AuraPatientProfile,
  BiologicalSex,
  SmokingStatus,
  PhysicalActivity,
  SleepQuality,
  PeripheralEdema,
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
      weightKg: Math.max(35, Math.min(180, newWeight))
    });
  };

  const handleHeightChange = (newHeight: number) => {
    onChange({
      ...profile,
      heightCm: Math.max(120, Math.min(220, newHeight))
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Intake Title with Reset */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Patient Clinical Intake
          </h2>
          <p className="text-xs text-slate-400">
            Bidirectional demographic calibrator &amp; biomarker intake
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-cyan-500/20 transition-colors cursor-pointer"
          title="Reset to default benchmark patient"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* CARD 1: Core Demographics & Dual Sync */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-cyan-500/15 p-5 shadow-lg shadow-black/20 hover:border-cyan-500/30 transition-all">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
          <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-semibold">
            1
          </span>
          <div className="flex items-center gap-1.5 text-white font-medium text-sm">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Demographics &amp; Dual Sync</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Patient Identifier / Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => onChange({ ...profile, name: e.target.value })}
              placeholder="e.g., Eleanor Vance"
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Biological Sex Pills */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Biological Sex
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Female', 'Male'] as BiologicalSex[]).map((gender) => {
                const isSelected = profile.gender === gender;
                return (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => onChange({ ...profile, gender })}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {gender}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Age Slider with Dual-Sync Trigger */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Age</span>
              <span className="font-mono font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                {profile.age} years
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={85}
              value={profile.age}
              onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Dynamic Benchmark Pill */}
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-lg">
              <Info className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>
                Median benchmark for age {profile.age}: <strong>{currentBenchmark} kg</strong>
              </span>
            </div>
          </div>

          {/* Weight Input (Number & Slider) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Weight (kg)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={35}
                  max={180}
                  value={profile.weightKg}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 70)}
                  className="w-16 px-1.5 py-0.5 text-right font-mono font-semibold text-xs text-cyan-300 bg-slate-800 border border-cyan-500/30 rounded-md focus:outline-none"
                />
                <span className="text-xs text-slate-400">kg</span>
              </div>
            </div>
            <input
              type="range"
              min={35}
              max={160}
              value={profile.weightKg}
              onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Dynamic BMI Badge */}
            <div className="mt-2 flex items-center justify-between gap-2 p-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
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
              className="flex items-center justify-between w-full text-[11px] text-slate-400 hover:text-cyan-300 cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3 text-cyan-400" />
                <span>Height calibration: {profile.heightCm} cm</span>
              </div>
              {showHeightSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHeightSettings && (
              <div className="mt-2 p-2.5 bg-slate-800/70 border border-slate-700/70 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Stature</span>
                  <span className="font-mono text-cyan-400">{profile.heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min={130}
                  max={215}
                  value={profile.heightCm}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: Lifestyle & Clinical Markers (Activity, Sleep, Smoking, Family) */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-cyan-500/15 p-5 shadow-lg shadow-black/20 hover:border-cyan-500/30 transition-all">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
          <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-semibold">
            2
          </span>
          <div className="flex items-center gap-1.5 text-white font-medium text-sm">
            <Heart className="w-4 h-4 text-blue-400" />
            <span>Lifestyle &amp; Clinical Background</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Smoking Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Smoking Habit
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
                        ? 'bg-blue-500/20 border-blue-400/60 text-blue-300 shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{option}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-blue-400 bg-blue-500'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Activity Level */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Physical Activity Level
            </label>
            <select
              value={profile.physicalActivity}
              onChange={(e) =>
                onChange({ ...profile, physicalActivity: e.target.value as PhysicalActivity })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            >
              <option value="Active / Regular Exercise">Active / Regular Exercise (≥150 min/wk)</option>
              <option value="Sedentary (Low Activity)">Sedentary (Low Activity)</option>
            </select>
          </div>

          {/* Sleep Quality & Night Breathing */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sleep Quality &amp; Night Breathing</span>
            </label>
            <select
              value={profile.sleepQuality}
              onChange={(e) =>
                onChange({ ...profile, sleepQuality: e.target.value as SleepQuality })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            >
              <option value="Normal restful sleep">Normal restful sleep</option>
              <option value="Frequent snoring / Waking with breathlessness (Possible Sleep Apnea)">
                Snoring / Waking breathless (Possible Sleep Apnea)
              </option>
            </select>
          </div>

          {/* Family History Toggle */}
          <div className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-slate-200">
                Immediate Family History
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                First-degree relative with early heart disease or diabetes
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...profile, familyHistory: !profile.familyHistory })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                profile.familyHistory ? 'bg-cyan-500' : 'bg-slate-700'
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

      {/* CARD 3: Observable Symptoms & Vitals (Chest, Dyspnea, Edema, BP, Glucose) */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-cyan-500/15 p-5 shadow-lg shadow-black/20 hover:border-cyan-500/30 transition-all">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
          <span className="w-6 h-6 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xs font-semibold">
            3
          </span>
          <div className="flex items-center gap-1.5 text-white font-medium text-sm">
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>Symptoms &amp; Observable Vitals</span>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Chest Sensation */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Chest Sensation
            </label>
            <select
              value={profile.chestSensation}
              onChange={(e) =>
                onChange({ ...profile, chestSensation: e.target.value as ChestSensation })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            >
              <option value="No discomfort">No discomfort</option>
              <option value="Mild dull ache">Mild dull ache</option>
              <option value="Sharp / Tight angina pressure">Sharp / Tight angina pressure</option>
            </select>
          </div>

          {/* Breathing Effort */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Breathing Effort
            </label>
            <select
              value={profile.breathingEffort}
              onChange={(e) =>
                onChange({ ...profile, breathingEffort: e.target.value as BreathingEffort })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            >
              <option value="Easy & normal">Easy & normal</option>
              <option value="Short of breath during mild walks">Short of breath during mild walks</option>
              <option value="Breathless at rest">Breathless at rest</option>
            </select>
          </div>

          {/* Peripheral Edema */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Peripheral Edema</span>
            </label>
            <select
              value={profile.peripheralEdema}
              onChange={(e) =>
                onChange({ ...profile, peripheralEdema: e.target.value as PeripheralEdema })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            >
              <option value="No swelling">No swelling</option>
              <option value="Swelling in ankles/feet after sitting or walking">
                Swelling in ankles/feet after sitting or walking
              </option>
            </select>
          </div>

          {/* Energy & Stamina */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Energy &amp; Stamina
            </label>
            <select
              value={profile.energyStamina}
              onChange={(e) =>
                onChange({ ...profile, energyStamina: e.target.value as EnergyStamina })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            >
              <option value="High / Normal energy">High / Normal energy</option>
              <option value="Chronic fatigue / Easily exhausted">Chronic fatigue / Easily exhausted</option>
            </select>
          </div>

          {/* Blood Pressure */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Blood Pressure
            </label>
            <select
              value={profile.bloodPressure}
              onChange={(e) =>
                onChange({ ...profile, bloodPressure: e.target.value as BloodPressureReading })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
            >
              <option value="Normal (<120/80)">Normal (&lt;120/80)</option>
              <option value="Pre-hypertension">Pre-hypertension (120-139 / 80-89)</option>
              <option value="Diagnosed High">Diagnosed High (140+ / 90+)</option>
              <option value="Unchecked / Unknown">Unchecked / Unknown</option>
            </select>
          </div>

          {/* Fasting Blood Sugar */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Fasting Blood Sugar
            </label>
            <select
              value={profile.fastingBloodSugar}
              onChange={(e) =>
                onChange({ ...profile, fastingBloodSugar: e.target.value as FastingBloodSugar })
              }
              className="w-full px-3 py-2 text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 transition-colors"
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
