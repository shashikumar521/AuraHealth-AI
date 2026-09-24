export type BiologicalSex = 'Male' | 'Female';
export type SmokingStatus = 'Non-Smoker' | 'Former / Occasional' | 'Active Daily Smoker';

export type ChestSensation = 'No discomfort' | 'Mild dull ache' | 'Sharp / Tight angina pressure';
export type BreathingEffort = 'Easy & normal' | 'Short of breath during mild walks' | 'Breathless at rest';
export type EnergyStamina = 'High / Normal energy' | 'Chronic fatigue / Easily exhausted';

export type BloodPressureReading = 'Normal (<120/80)' | 'Pre-hypertension' | 'Diagnosed High' | 'Unchecked / Unknown';
export type FastingBloodSugar = 'Normal (<100 mg/dL)' | 'Elevated (100–125)' | 'Diabetic (126+)' | 'Unchecked / Unknown';

export interface AuraPatientProfile {
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  gender: BiologicalSex;
  smoking: SmokingStatus;
  familyHistory: boolean;
  chestSensation: ChestSensation;
  breathingEffort: BreathingEffort;
  energyStamina: EnergyStamina;
  bloodPressure: BloodPressureReading;
  fastingBloodSugar: FastingBloodSugar;
}

export type RiskLevel = 'Low Risk' | 'Moderate Risk' | 'Elevated Risk';

export interface RiskEvaluation {
  percentage: number;
  level: RiskLevel;
  gradientClass: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  ringColor: string;
  summary: string;
}

export interface SymptomStatisticalEvidence {
  id: string;
  label: string;
  reportedValue: string;
  pValue: number;
  isSignificant: boolean;
  badgeText: string;
  explanation: string;
  targetDisease: 'Coronary Heart Disease' | 'Type-2 Diabetes';
}

export interface BmiMetric {
  bmi: number;
  category: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese';
  badgeColor: string;
  expectedBenchmark: number;
}

export interface DagNodeState {
  id: string;
  label: string;
  type: 'demographic' | 'disease' | 'symptom';
  active: boolean;
  glowColor?: string;
  value?: string;
  probability?: number;
  description: string;
  parents: string[];
}
