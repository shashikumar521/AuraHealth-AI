export type AgeCategory = 'Young (<35)' | 'Middle-aged (35-60)' | 'Senior (>60)';
export type GenderCategory = 'Male' | 'Female';
export type SmokingCategory = 'Non-smoker' | 'Former-smoker' | 'Current-smoker';
export type BMICategory = 'Normal (<25)' | 'Overweight (25-30)' | 'Obese (>30)';
export type FamilyHistoryCategory = 'Absent' | 'Present';

export type DiseaseState = 'No' | 'Yes';

export type ChestPainCategory = 'None' | 'Atypical' | 'Typical_Angina';
export type DyspneaCategory = 'Absent' | 'Mild' | 'Severe';
export type FastingGlucoseCategory = 'Normal (<100)' | 'Pre-diabetic (100-125)' | 'Diabetic (>=126)';
export type RestingECGCategory = 'Normal' | 'ST_T_Abnormality' | 'Hypertrophy';
export type FatigueCategory = 'Normal' | 'Chronic_Exhaustion';

export interface PatientIntake {
  patientId: string;
  patientName: string;
  rawAge: number;
  age: AgeCategory;
  gender: GenderCategory;
  smoking: SmokingCategory;
  heightCm: number;
  weightKg: number;
  bmiValue: number;
  bmiCategory: BMICategory;
  familyHistory: FamilyHistoryCategory;
  chestPain: ChestPainCategory;
  dyspnea: DyspneaCategory;
  fastingGlucose: FastingGlucoseCategory;
  restingEcg: RestingECGCategory;
  fatigue: FatigueCategory;
}

export interface PatientEvidenceDict {
  Age?: AgeCategory;
  Gender?: GenderCategory;
  Smoking?: SmokingCategory;
  BMI_Category?: BMICategory;
  Family_History?: FamilyHistoryCategory;
  Chest_Pain?: ChestPainCategory;
  Dyspnea?: DyspneaCategory;
  Fasting_Glucose?: FastingGlucoseCategory;
  Resting_ECG?: RestingECGCategory;
  Fatigue?: FatigueCategory;
  [key: string]: string | undefined;
}

export interface PosteriorResult {
  priors: {
    CAD: { Yes: number; No: number };
    Diabetes_T2: { Yes: number; No: number };
    Hypertension: { Yes: number; No: number };
  };
  posteriors: {
    CAD: { Yes: number; No: number };
    Diabetes_T2: { Yes: number; No: number };
    Hypertension: { Yes: number; No: number };
  };
  deltas: {
    CAD: number;
    Diabetes_T2: number;
    Hypertension: number;
  };
}

export interface StatisticalEvidenceRecord {
  observedEvidence: string;
  patientState: string;
  chi2Stat: number;
  dof: number;
  pValue: number;
  oddsRatio: number;
  ciLower: number;
  ciUpper: number;
  significanceTag: string;
  isSignificant: boolean;
  clinicalInterpretation: string;
}

export interface ContingencyMatrix {
  evidenceVar: string;
  targetDisease: string;
  categories: string[];
  matrix: {
    [evidenceCat: string]: {
      Yes: number;
      No: number;
      Total: number;
    };
  };
  totalYes: number;
  totalNo: number;
  grandTotal: number;
}

export interface EvidenceSensitivityRecord {
  variableKey: string;
  variableLabel: string;
  patientState: string;
  fullPosterior: number;
  ablatedPosterior: number;
  marginalImpact: number;
  percentImpact: number;
  direction: 'amplifying_risk' | 'protective_reduction' | 'neutral';
  clinicalInterpretation: string;
}
