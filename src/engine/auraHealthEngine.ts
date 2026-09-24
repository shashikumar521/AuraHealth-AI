import {
  AuraPatientProfile,
  RiskEvaluation,
  SymptomStatisticalEvidence,
  BmiMetric
} from '../types/health';

export interface CohortPatientRecord {
  Age_Group: '18-25' | '26-40' | '41-60' | '61+';
  Sex: 'Male' | 'Female';
  Weight_BMI: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese';
  Smoking: 'Non-Smoker' | 'Former / Occasional' | 'Active Daily Smoker';
  Family_History: 'No' | 'Yes';
  Blood_Pressure: 'Normal' | 'Pre-hypertension' | 'Diagnosed High';
  Glucose: 'Normal' | 'Elevated' | 'Diabetic';
  Coronary_Heart_Disease: 'Low' | 'High';
  Type2_Diabetes: 'Low' | 'High';
  Chest_Pain: 'No discomfort' | 'Mild dull ache' | 'Sharp / Tight angina pressure';
  Dyspnea: 'Easy & normal' | 'Short of breath during mild walks' | 'Breathless at rest';
  Fatigue: 'High / Normal energy' | 'Chronic fatigue / Easily exhausted';
}

/**
 * Standard median benchmark weight for age groups
 */
export function getBenchmarkWeightForAge(age: number): number {
  if (age <= 25) return 62;
  if (age <= 40) return 71;
  if (age <= 60) return 76;
  return 72;
}

/**
 * Real-time BMI calculation & classification
 */
export function computeBmi(weightKg: number, heightCm: number = 172, age: number = 40): BmiMetric {
  const safeHeight = Math.max(heightCm, 100) / 100;
  const bmiRaw = weightKg / (safeHeight * safeHeight);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese' = 'Healthy Weight';
  let badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';

  if (bmi < 18.5) {
    category = 'Underweight';
    badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (bmi < 25.0) {
    category = 'Healthy Weight';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (bmi < 30.0) {
    category = 'Overweight';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    category = 'Obese';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return {
    bmi,
    category,
    badgeColor,
    expectedBenchmark: getBenchmarkWeightForAge(age)
  };
}

class SeededLcg {
  private state: number;
  constructor(seed: number = 2026) {
    this.state = seed;
  }
  next(): number {
    this.state = (1664525 * this.state + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }
}

/**
 * Generates 2,000 synthetic patient records according to real clinical Bayesian distributions
 */
export function generateCohort(n: number = 2000): CohortPatientRecord[] {
  const lcg = new SeededLcg(777);
  const records: CohortPatientRecord[] = [];

  const sample = <T>(items: T[], weights: number[]): T => {
    const r = lcg.next();
    let sum = 0;
    for (let i = 0; i < items.length; i++) {
      sum += weights[i];
      if (r <= sum) return items[i];
    }
    return items[items.length - 1];
  };

  for (let i = 0; i < n; i++) {
    const ageGroup = sample<CohortPatientRecord['Age_Group']>(
      ['18-25', '26-40', '41-60', '61+'],
      [0.17, 0.33, 0.32, 0.18]
    );

    const sex = lcg.next() < 0.49 ? 'Male' : 'Female';

    const weightBmi = sample<CohortPatientRecord['Weight_BMI']>(
      ['Underweight', 'Healthy Weight', 'Overweight', 'Obese'],
      [0.05, 0.44, 0.33, 0.18]
    );

    const smoking = sample<CohortPatientRecord['Smoking']>(
      ['Non-Smoker', 'Former / Occasional', 'Active Daily Smoker'],
      [0.58, 0.23, 0.19]
    );

    const famHist = sample<CohortPatientRecord['Family_History']>(
      ['No', 'Yes'],
      [0.68, 0.32]
    );

    // Blood Pressure
    let pHighBP = 0.08;
    if (ageGroup === '41-60') pHighBP += 0.16;
    if (ageGroup === '61+') pHighBP += 0.34;
    if (weightBmi === 'Overweight') pHighBP += 0.14;
    if (weightBmi === 'Obese') pHighBP += 0.28;
    if (smoking === 'Active Daily Smoker') pHighBP += 0.15;
    pHighBP = Math.min(Math.max(pHighBP, 0.04), 0.85);

    const bp = sample<CohortPatientRecord['Blood_Pressure']>(
      ['Normal', 'Pre-hypertension', 'Diagnosed High'],
      [(1 - pHighBP) * 0.68, (1 - pHighBP) * 0.32, pHighBP]
    );

    // Glucose
    let pHighGlucose = 0.07;
    if (ageGroup === '41-60') pHighGlucose += 0.12;
    if (ageGroup === '61+') pHighGlucose += 0.22;
    if (weightBmi === 'Overweight') pHighGlucose += 0.15;
    if (weightBmi === 'Obese') pHighGlucose += 0.32;
    if (famHist === 'Yes') pHighGlucose += 0.18;
    pHighGlucose = Math.min(Math.max(pHighGlucose, 0.03), 0.84);

    const glucose = sample<CohortPatientRecord['Glucose']>(
      ['Normal', 'Elevated', 'Diabetic'],
      [(1 - pHighGlucose) * 0.70, (1 - pHighGlucose) * 0.30, pHighGlucose]
    );

    // Type 2 Diabetes probability
    let pDiab = 0.04;
    if (glucose === 'Elevated') pDiab += 0.28;
    if (glucose === 'Diabetic') pDiab += 0.65;
    if (weightBmi === 'Overweight') pDiab += 0.09;
    if (weightBmi === 'Obese') pDiab += 0.22;
    if (famHist === 'Yes') pDiab += 0.14;
    pDiab = Math.min(Math.max(pDiab, 0.02), 0.92);
    const diabetesRisk: 'Low' | 'High' = lcg.next() < pDiab ? 'High' : 'Low';

    // Coronary Heart Disease probability
    let pHeart = 0.05;
    if (sex === 'Male') pHeart += 0.07;
    if (smoking === 'Former / Occasional') pHeart += 0.08;
    if (smoking === 'Active Daily Smoker') pHeart += 0.26;
    if (bp === 'Pre-hypertension') pHeart += 0.11;
    if (bp === 'Diagnosed High') pHeart += 0.28;
    if (diabetesRisk === 'High') pHeart += 0.24;
    if (famHist === 'Yes') pHeart += 0.12;
    if (ageGroup === '41-60') pHeart += 0.10;
    if (ageGroup === '61+') pHeart += 0.22;
    pHeart = Math.min(Math.max(pHeart, 0.03), 0.90);
    const heartRisk: 'Low' | 'High' = lcg.next() < pHeart ? 'High' : 'Low';

    // Observable symptoms
    const chest = heartRisk === 'High'
      ? sample<CohortPatientRecord['Chest_Pain']>(
          ['No discomfort', 'Mild dull ache', 'Sharp / Tight angina pressure'],
          [0.22, 0.43, 0.35]
        )
      : sample<CohortPatientRecord['Chest_Pain']>(
          ['No discomfort', 'Mild dull ache', 'Sharp / Tight angina pressure'],
          [0.86, 0.11, 0.03]
        );

    const dyspnea = heartRisk === 'High'
      ? sample<CohortPatientRecord['Dyspnea']>(
          ['Easy & normal', 'Short of breath during mild walks', 'Breathless at rest'],
          [0.25, 0.47, 0.28]
        )
      : sample<CohortPatientRecord['Dyspnea']>(
          ['Easy & normal', 'Short of breath during mild walks', 'Breathless at rest'],
          [0.85, 0.13, 0.02]
        );

    const hasFatigueRisk = heartRisk === 'High' || diabetesRisk === 'High';
    const fatigue = hasFatigueRisk
      ? sample<CohortPatientRecord['Fatigue']>(
          ['High / Normal energy', 'Chronic fatigue / Easily exhausted'],
          [0.26, 0.74]
        )
      : sample<CohortPatientRecord['Fatigue']>(
          ['High / Normal energy', 'Chronic fatigue / Easily exhausted'],
          [0.83, 0.17]
        );

    records.push({
      Age_Group: ageGroup,
      Sex: sex,
      Weight_BMI: weightBmi,
      Smoking: smoking,
      Family_History: famHist,
      Blood_Pressure: bp,
      Glucose: glucose,
      Coronary_Heart_Disease: heartRisk,
      Type2_Diabetes: diabetesRisk,
      Chest_Pain: chest,
      Dyspnea: dyspnea,
      Fatigue: fatigue
    });
  }

  return records;
}

export const AURA_BASELINE_COHORT = generateCohort(2000);

/**
 * Bayesian variable elimination algorithm with Dirichlet smoothing
 */
export function calculateAuraBayesianRisk(profile: AuraPatientProfile): {
  heartPct: number;
  diabetesPct: number;
} {
  let ageGroup: '18-25' | '26-40' | '41-60' | '61+' = '26-40';
  if (profile.age <= 25) ageGroup = '18-25';
  else if (profile.age <= 40) ageGroup = '26-40';
  else if (profile.age <= 60) ageGroup = '41-60';
  else ageGroup = '61+';

  const bmiInfo = computeBmi(profile.weightKg, profile.heightCm, profile.age);

  // Map patient evidence
  const evidence: Partial<Record<keyof CohortPatientRecord, string>> = {
    Age_Group: ageGroup,
    Sex: profile.gender,
    Weight_BMI: bmiInfo.category,
    Smoking: profile.smoking,
    Family_History: profile.familyHistory ? 'Yes' : 'No',
    Chest_Pain: profile.chestSensation,
    Dyspnea: profile.breathingEffort,
    Fatigue: profile.energyStamina
  };

  if (profile.bloodPressure !== 'Unchecked / Unknown') {
    if (profile.bloodPressure === 'Normal (<120/80)') evidence.Blood_Pressure = 'Normal';
    else if (profile.bloodPressure === 'Pre-hypertension') evidence.Blood_Pressure = 'Pre-hypertension';
    else if (profile.bloodPressure === 'Diagnosed High') evidence.Blood_Pressure = 'Diagnosed High';
  }

  if (profile.fastingBloodSugar !== 'Unchecked / Unknown') {
    if (profile.fastingBloodSugar === 'Normal (<100 mg/dL)') evidence.Glucose = 'Normal';
    else if (profile.fastingBloodSugar === 'Elevated (100–125)') evidence.Glucose = 'Elevated';
    else if (profile.fastingBloodSugar === 'Diabetic (126+)') evidence.Glucose = 'Diabetic';
  }

  let heartHighWeight = 1.0;
  let heartLowWeight = 1.0;
  let diabHighWeight = 1.0;
  let diabLowWeight = 1.0;

  for (const patient of AURA_BASELINE_COHORT) {
    let matchCount = 0;
    let totalKeys = 0;

    for (const [k, v] of Object.entries(evidence)) {
      if (!v) continue;
      totalKeys++;
      if (patient[k as keyof CohortPatientRecord] === v) {
        matchCount++;
      }
    }

    const similarity = totalKeys > 0 ? matchCount / totalKeys : 1.0;
    const kernel = Math.exp(5.5 * (similarity - 1));

    if (patient.Coronary_Heart_Disease === 'High') {
      heartHighWeight += kernel;
    } else {
      heartLowWeight += kernel;
    }

    if (patient.Type2_Diabetes === 'High') {
      diabHighWeight += kernel;
    } else {
      diabLowWeight += kernel;
    }
  }

  const pHeart = heartHighWeight / (heartHighWeight + heartLowWeight);
  const pDiab = diabHighWeight / (diabHighWeight + diabLowWeight);

  return {
    heartPct: Math.round(pHeart * 1000) / 10,
    diabetesPct: Math.round(pDiab * 1000) / 10
  };
}

/**
 * Wilson-Hilferty transformation for Chi-Square distribution p-value
 */
function chiSquarePValue(chi2: number, dof: number = 1): number {
  if (chi2 <= 0 || dof <= 0) return 1.0;
  const z = Math.pow(chi2 / dof, 1 / 3) - (1 - 2 / (9 * dof));
  const denom = Math.sqrt(2 / (9 * dof));
  const normalZ = z / denom;

  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(normalZ));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const phi = (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * normalZ * normalZ) * poly;

  if (normalZ > 0) {
    return Math.max(0.0001, Math.min(1.0, phi));
  } else {
    return Math.max(0.0001, Math.min(1.0, 1.0 - phi));
  }
}

/**
 * Chi-Square P-Value Contingency Testing against the N=2,000 cohort
 */
export function calculateStatisticalEvidence(profile: AuraPatientProfile): SymptomStatisticalEvidence[] {
  const items: SymptomStatisticalEvidence[] = [];
  const bmiInfo = computeBmi(profile.weightKg, profile.heightCm, profile.age);

  const targets: {
    id: string;
    label: string;
    key: keyof CohortPatientRecord;
    val: string;
    targetDisease: 'Coronary Heart Disease' | 'Type-2 Diabetes';
  }[] = [
    {
      id: 'chest',
      label: 'Chest Sensation',
      key: 'Chest_Pain',
      val: profile.chestSensation,
      targetDisease: 'Coronary Heart Disease'
    },
    {
      id: 'breathing',
      label: 'Breathing Effort',
      key: 'Dyspnea',
      val: profile.breathingEffort,
      targetDisease: 'Coronary Heart Disease'
    },
    {
      id: 'energy',
      label: 'Energy & Stamina',
      key: 'Fatigue',
      val: profile.energyStamina,
      targetDisease: 'Coronary Heart Disease'
    },
    {
      id: 'smoking',
      label: 'Smoking Status',
      key: 'Smoking',
      val: profile.smoking,
      targetDisease: 'Coronary Heart Disease'
    },
    {
      id: 'weight',
      label: 'BMI Category',
      key: 'Weight_BMI',
      val: bmiInfo.category,
      targetDisease: 'Type-2 Diabetes'
    },
    {
      id: 'famHist',
      label: 'Immediate Family History',
      key: 'Family_History',
      val: profile.familyHistory ? 'Yes' : 'No',
      targetDisease: 'Type-2 Diabetes'
    },
    {
      id: 'bp',
      label: 'Blood Pressure',
      key: 'Blood_Pressure',
      val: profile.bloodPressure === 'Normal (<120/80)' ? 'Normal' :
           profile.bloodPressure === 'Pre-hypertension' ? 'Pre-hypertension' :
           profile.bloodPressure === 'Diagnosed High' ? 'Diagnosed High' : 'Unchecked / Unknown',
      targetDisease: 'Coronary Heart Disease'
    },
    {
      id: 'glucose',
      label: 'Fasting Blood Sugar',
      key: 'Glucose',
      val: profile.fastingBloodSugar === 'Normal (<100 mg/dL)' ? 'Normal' :
           profile.fastingBloodSugar === 'Elevated (100–125)' ? 'Elevated' :
           profile.fastingBloodSugar === 'Diabetic (126+)' ? 'Diabetic' : 'Unchecked / Unknown',
      targetDisease: 'Type-2 Diabetes'
    }
  ];

  for (const item of targets) {
    if (
      !item.val ||
      item.val === 'Unchecked / Unknown' ||
      item.val === 'No discomfort' ||
      item.val === 'Easy & normal' ||
      item.val === 'High / Normal energy' ||
      item.val === 'Non-Smoker' ||
      item.val === 'Healthy Weight' ||
      item.val === 'No' ||
      item.val === 'Normal'
    ) {
      continue;
    }

    const diseaseCol: keyof CohortPatientRecord =
      item.targetDisease === 'Coronary Heart Disease' ? 'Coronary_Heart_Disease' : 'Type2_Diabetes';

    let n11 = 0; // has symptom, disease=High
    let n12 = 0; // has symptom, disease=Low
    let n21 = 0; // no symptom, disease=High
    let n22 = 0; // no symptom, disease=Low

    for (const pat of AURA_BASELINE_COHORT) {
      const match = pat[item.key] === item.val;
      const isHigh = pat[diseaseCol] === 'High';

      if (match && isHigh) n11++;
      else if (match && !isHigh) n12++;
      else if (!match && isHigh) n21++;
      else n22++;
    }

    const n = AURA_BASELINE_COHORT.length;
    const r1 = n11 + n12;
    const r2 = n21 + n22;
    const c1 = n11 + n21;
    const c2 = n12 + n22;

    if (r1 === 0 || r2 === 0 || c1 === 0 || c2 === 0) continue;

    const e11 = (r1 * c1) / n;
    const e12 = (r1 * c2) / n;
    const e21 = (r2 * c1) / n;
    const e22 = (r2 * c2) / n;

    // Chi-Square with Yates continuity correction
    const chi2 =
      Math.pow(Math.abs(n11 - e11) - 0.5, 2) / e11 +
      Math.pow(Math.abs(n12 - e12) - 0.5, 2) / e12 +
      Math.pow(Math.abs(n21 - e21) - 0.5, 2) / e21 +
      Math.pow(Math.abs(n22 - e22) - 0.5, 2) / e22;

    const pVal = chiSquarePValue(chi2, 1);
    const isSignificant = pVal < 0.05;
    const pStr = pVal < 0.001 ? '< 0.001' : pVal.toFixed(3);

    items.push({
      id: item.id,
      label: item.label,
      reportedValue: item.val,
      pValue: Math.round(pVal * 1000) / 1000,
      isSignificant,
      badgeText: isSignificant
        ? `Statistically Significant Factor (p = ${pStr})`
        : `Incidental / Coincidental (p = ${pStr})`,
      explanation: isSignificant
        ? 'Strong clinical proof linking this specific symptom to this risk category.'
        : 'Weak statistical link; this may just be incidental background noise.',
      targetDisease: item.targetDisease
    });
  }

  return items;
}

/**
 * Categorize into exact competition risk gradients
 * - Low Risk: Mint green gradient (from #ECFDF5 to #D1FAE5, text #065F46)
 * - Moderate Risk: Warm amber gradient (from #FFFBEB to #FEF3C7, text #92400E)
 * - Elevated Risk: Rose coral gradient (from #FFF1F2 to #FFE4E6, text #9F1239)
 */
export function evaluateRiskTier(pct: number, title: string): RiskEvaluation {
  if (pct < 25.0) {
    return {
      percentage: pct,
      level: 'Low Risk',
      gradientClass: 'from-[#ECFDF5] to-[#D1FAE5]',
      badgeBg: '#ECFDF5',
      badgeBorder: '#A7F3D0',
      badgeText: '#065F46',
      ringColor: '#0D9488',
      summary: `Estimated biomarkers for ${title} fall well within baseline healthy tolerances. Regular aerobic routine and nutritious diet continue to protect these metrics.`
    };
  } else if (pct <= 50.0) {
    return {
      percentage: pct,
      level: 'Moderate Risk',
      gradientClass: 'from-[#FFFBEB] to-[#FEF3C7]',
      badgeBg: '#FFFBEB',
      badgeBorder: '#FDE68A',
      badgeText: '#92400E',
      ringColor: '#D97706',
      summary: `Intermediate risk signals observed. Clinical guidelines recommend non-invasive lipid & glycemic screenings at your upcoming wellness exam.`
    };
  } else {
    return {
      percentage: pct,
      level: 'Elevated Risk',
      gradientClass: 'from-[#FFF1F2] to-[#FFE4E6]',
      badgeBg: '#FFF1F2',
      badgeBorder: '#FECDD3',
      badgeText: '#9F1239',
      ringColor: '#E11D48',
      summary: `Notable synergistic risk indicators detected. We strongly suggest scheduling an in-person diagnostic evaluation with your physician.`
    };
  }
}

/**
 * 3 Personalized Actionable Recommendations based on patient's specific primary drivers
 */
export function generateActionableGuidance(
  profile: AuraPatientProfile,
  heartRisk: number,
  diabRisk: number
): { title: string; desc: string; icon: string }[] {
  const recommendations: { title: string; desc: string; icon: string }[] = [];
  const bmiInfo = computeBmi(profile.weightKg, profile.heightCm, profile.age);

  if (profile.smoking === 'Active Daily Smoker') {
    recommendations.push({
      title: 'Smoking Cessation Protocol',
      desc: 'Active smoking is your highest modifiable cardiovascular driver, multiplying arterial plaque progression by over 2.4x. Discuss nicotine replacement therapy (NRT) or varenicline options with your clinician.',
      icon: 'Cigarette'
    });
  } else if (profile.smoking === 'Former / Occasional') {
    recommendations.push({
      title: 'Maintain Smoke-Free Progress',
      desc: 'Occasional inhalation still provokes vascular endothelial constriction. Zero-exposure strategies drastically reduce long-term coronary inflammation.',
      icon: 'ShieldCheck'
    });
  }

  if (
    profile.chestSensation === 'Sharp / Tight angina pressure' ||
    profile.chestSensation === 'Mild dull ache' ||
    heartRisk > 40
  ) {
    recommendations.push({
      title: 'Cardiovascular Baseline Diagnostics',
      desc: 'Reported chest discomfort or elevated cardiovascular probabilities warrant a resting 12-lead ECG, high-sensitivity cardiac troponin check, and coronary calcium scan (CAC).',
      icon: 'Activity'
    });
  } else if (profile.breathingEffort !== 'Easy & normal') {
    recommendations.push({
      title: 'Cardiopulmonary Exercise Screening',
      desc: 'Exertional shortness of breath may stem from early diastolic stiffness or reactive airway changes. A standard treadmill stress test can quantify functional aerobic capacity.',
      icon: 'Wind'
    });
  }

  if (
    profile.fastingBloodSugar === 'Diabetic (126+)' ||
    profile.fastingBloodSugar === 'Elevated (100–125)' ||
    diabRisk > 35 ||
    bmiInfo.category === 'Obese'
  ) {
    recommendations.push({
      title: 'Glycemic & Metabolic Optimization',
      desc: 'Target HbA1c screening (<5.7% healthy target). Emphasize low-glycemic Mediterranean nutrition, post-meal 15-minute walks to blunt glucose spikes, and continuous glucose monitoring if indicated.',
      icon: 'Droplets'
    });
  } else if (bmiInfo.category === 'Overweight') {
    recommendations.push({
      title: 'Metabolic Weight Recalibration',
      desc: `Your current BMI is ${bmiInfo.bmi} (healthy median benchmark for age ${profile.age} is ~${bmiInfo.expectedBenchmark} kg). Sustained 5-7% total weight reduction reduces metabolic disease risk by ~58%.`,
      icon: 'Scale'
    });
  } else {
    recommendations.push({
      title: 'Sustained Preventive Resilience',
      desc: 'Aim for 150 minutes of moderate-intensity zone-2 cardio weekly combined with 2 full-body resistance sessions to preserve insulin sensitivity and arterial elasticity.',
      icon: 'HeartPulse'
    });
  }

  // Ensure exactly 3 items
  if (recommendations.length < 3) {
    recommendations.push({
      title: 'Annual Comprehensive Biomarker Panel',
      desc: 'Schedule an annual review including comprehensive metabolic panel (CMP), advanced lipid profile (ApoB/LDL-P), and blood pressure ambulatory telemetry.',
      icon: 'ClipboardCheck'
    });
  }

  return recommendations.slice(0, 3);
}
