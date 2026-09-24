import {
  PatientEvidenceDict,
  PosteriorResult,
  StatisticalEvidenceRecord,
  ContingencyMatrix,
  EvidenceSensitivityRecord
} from '../types/clinical';

// Seeded PRNG for reproducible synthetic cohort
class SeededRandom {
  private m = 0x80000000; // 2**31
  private a = 1103515245;
  private c = 12345;
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }

  nextFloat(): number {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / (this.m - 1);
  }

  choice<T>(items: T[], probs: number[]): T {
    const r = this.nextFloat();
    let cumulative = 0;
    for (let i = 0; i < items.length; i++) {
      cumulative += probs[i];
      if (r <= cumulative || i === items.length - 1) {
        return items[i];
      }
    }
    return items[items.length - 1];
  }
}

export interface SyntheticPatientRecord {
  Age: string;
  Gender: string;
  Smoking: string;
  BMI_Category: string;
  Family_History: string;
  Hypertension: string;
  Diabetes_T2: string;
  CAD: string;
  Chest_Pain: string;
  Dyspnea: string;
  Fasting_Glucose: string;
  Resting_ECG: string;
  Fatigue: string;
  [key: string]: string;
}

/**
 * Generate synthetic cohort matching epidemiological distributions
 */
export function generateSyntheticCohort(nSamples: number = 3500, seed: number = 42): SyntheticPatientRecord[] {
  const rng = new SeededRandom(seed);
  const cohort: SyntheticPatientRecord[] = [];

  const ageCats = ['Young (<35)', 'Middle-aged (35-60)', 'Senior (>60)'];
  const ageProbs = [0.24, 0.46, 0.30];

  const genderCats = ['Male', 'Female'];
  const genderProbs = [0.49, 0.51];

  const smokingCats = ['Non-smoker', 'Former-smoker', 'Current-smoker'];
  const smokingProbs = [0.55, 0.23, 0.22];

  const bmiCats = ['Normal (<25)', 'Overweight (25-30)', 'Obese (>30)'];
  const bmiProbs = [0.38, 0.36, 0.26];

  const famCats = ['Absent', 'Present'];
  const famProbs = [0.68, 0.32];

  for (let i = 0; i < nSamples; i++) {
    const age = rng.choice(ageCats, ageProbs);
    const gender = rng.choice(genderCats, genderProbs);
    const smoking = rng.choice(smokingCats, smokingProbs);
    const bmi = rng.choice(bmiCats, bmiProbs);
    const famHist = rng.choice(famCats, famProbs);

    // Hypertension
    let baseHtn = 0.08;
    if (age === 'Middle-aged (35-60)') baseHtn += 0.20;
    else if (age === 'Senior (>60)') baseHtn += 0.42;

    if (bmi === 'Overweight (25-30)') baseHtn += 0.12;
    else if (bmi === 'Obese (>30)') baseHtn += 0.26;

    if (smoking === 'Former-smoker') baseHtn += 0.06;
    else if (smoking === 'Current-smoker') baseHtn += 0.15;

    baseHtn = Math.max(0.03, Math.min(0.88, baseHtn));
    const htn = rng.nextFloat() < baseHtn ? 'Yes' : 'No';

    // Diabetes T2
    let baseDm = 0.04;
    if (age === 'Middle-aged (35-60)') baseDm += 0.10;
    else if (age === 'Senior (>60)') baseDm += 0.22;

    if (bmi === 'Overweight (25-30)') baseDm += 0.14;
    else if (bmi === 'Obese (>30)') baseDm += 0.34;

    if (famHist === 'Present') baseDm += 0.22;

    baseDm = Math.max(0.02, Math.min(0.85, baseDm));
    const dm = rng.nextFloat() < baseDm ? 'Yes' : 'No';

    // CAD
    let baseCad = 0.04;
    if (gender === 'Male') baseCad += 0.08;
    if (smoking === 'Former-smoker') baseCad += 0.08;
    else if (smoking === 'Current-smoker') baseCad += 0.22;
    if (htn === 'Yes') baseCad += 0.24;
    if (dm === 'Yes') baseCad += 0.25;

    baseCad = Math.max(0.02, Math.min(0.88, baseCad));
    const cad = rng.nextFloat() < baseCad ? 'Yes' : 'No';

    // Chest Pain
    let pCp = cad === 'Yes' ? [0.18, 0.34, 0.48] : [0.82, 0.15, 0.03];
    const chestPain = rng.choice(['None', 'Atypical', 'Typical_Angina'], pCp);

    // Dyspnea
    let pDys = [0.85, 0.12, 0.03];
    if (cad === 'Yes' && htn === 'Yes') pDys = [0.15, 0.45, 0.40];
    else if (cad === 'Yes' && htn === 'No') pDys = [0.38, 0.44, 0.18];
    else if (cad === 'No' && htn === 'Yes') pDys = [0.58, 0.32, 0.10];
    const dyspnea = rng.choice(['Absent', 'Mild', 'Severe'], pDys);

    // Fasting Glucose
    let pGlu = dm === 'Yes' ? [0.06, 0.28, 0.66] : [0.82, 0.16, 0.02];
    const glucose = rng.choice(['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)'], pGlu);

    // Resting ECG
    let pEcg = [0.84, 0.11, 0.05];
    if (cad === 'Yes' && htn === 'Yes') pEcg = [0.14, 0.48, 0.38];
    else if (cad === 'Yes' && htn === 'No') pEcg = [0.32, 0.52, 0.16];
    else if (cad === 'No' && htn === 'Yes') pEcg = [0.50, 0.22, 0.28];
    const restingEcg = rng.choice(['Normal', 'ST_T_Abnormality', 'Hypertrophy'], pEcg);

    // Fatigue
    let pFat = [0.80, 0.20];
    if (dm === 'Yes' && cad === 'Yes') pFat = [0.18, 0.82];
    else if (dm === 'Yes' && cad === 'No') pFat = [0.48, 0.52];
    else if (dm === 'No' && cad === 'Yes') pFat = [0.42, 0.58];
    const fatigue = rng.choice(['Normal', 'Chronic_Exhaustion'], pFat);

    cohort.push({
      Age: age,
      Gender: gender,
      Smoking: smoking,
      BMI_Category: bmi,
      Family_History: famHist,
      Hypertension: htn,
      Diabetes_T2: dm,
      CAD: cad,
      Chest_Pain: chestPain,
      Dyspnea: dyspnea,
      Fasting_Glucose: glucose,
      Resting_ECG: restingEcg,
      Fatigue: fatigue
    });
  }

  return cohort;
}

// Global cached synthetic population
export const GLOBAL_SYNTHETIC_COHORT = generateSyntheticCohort(3500, 42);

// Calculate exact conditional CPD functions matching the Bayesian network
export function getConditionalProbabilities() {
  return {
    pHTN: (age: string, bmi: string, smoking: string): number => {
      let base = 0.08;
      if (age === 'Middle-aged (35-60)') base += 0.20;
      else if (age === 'Senior (>60)') base += 0.42;
      if (bmi === 'Overweight (25-30)') base += 0.12;
      else if (bmi === 'Obese (>30)') base += 0.26;
      if (smoking === 'Former-smoker') base += 0.06;
      else if (smoking === 'Current-smoker') base += 0.15;
      return Math.max(0.03, Math.min(0.88, base));
    },
    pDM: (age: string, bmi: string, famHist: string): number => {
      let base = 0.04;
      if (age === 'Middle-aged (35-60)') base += 0.10;
      else if (age === 'Senior (>60)') base += 0.22;
      if (bmi === 'Overweight (25-30)') base += 0.14;
      else if (bmi === 'Obese (>30)') base += 0.34;
      if (famHist === 'Present') base += 0.22;
      return Math.max(0.02, Math.min(0.85, base));
    },
    pCAD: (smoking: string, htn: string, dm: string, gender: string): number => {
      let base = 0.04;
      if (gender === 'Male') base += 0.08;
      if (smoking === 'Former-smoker') base += 0.08;
      else if (smoking === 'Current-smoker') base += 0.22;
      if (htn === 'Yes') base += 0.24;
      if (dm === 'Yes') base += 0.25;
      return Math.max(0.02, Math.min(0.88, base));
    },
    pChestPain: (cad: string, cp: string): number => {
      const dist = cad === 'Yes'
        ? { 'None': 0.18, 'Atypical': 0.34, 'Typical_Angina': 0.48 }
        : { 'None': 0.82, 'Atypical': 0.15, 'Typical_Angina': 0.03 };
      return (dist as Record<string, number>)[cp] || 0.33;
    },
    pDyspnea: (cad: string, htn: string, dys: string): number => {
      let dist = { 'Absent': 0.85, 'Mild': 0.12, 'Severe': 0.03 };
      if (cad === 'Yes' && htn === 'Yes') dist = { 'Absent': 0.15, 'Mild': 0.45, 'Severe': 0.40 };
      else if (cad === 'Yes' && htn === 'No') dist = { 'Absent': 0.38, 'Mild': 0.44, 'Severe': 0.18 };
      else if (cad === 'No' && htn === 'Yes') dist = { 'Absent': 0.58, 'Mild': 0.32, 'Severe': 0.10 };
      return (dist as Record<string, number>)[dys] || 0.33;
    },
    pFastingGlucose: (dm: string, glu: string): number => {
      const dist = dm === 'Yes'
        ? { 'Normal (<100)': 0.06, 'Pre-diabetic (100-125)': 0.28, 'Diabetic (>=126)': 0.66 }
        : { 'Normal (<100)': 0.82, 'Pre-diabetic (100-125)': 0.16, 'Diabetic (>=126)': 0.02 };
      return (dist as Record<string, number>)[glu] || 0.33;
    },
    pRestingECG: (cad: string, htn: string, ecg: string): number => {
      let dist = { 'Normal': 0.84, 'ST_T_Abnormality': 0.11, 'Hypertrophy': 0.05 };
      if (cad === 'Yes' && htn === 'Yes') dist = { 'Normal': 0.14, 'ST_T_Abnormality': 0.48, 'Hypertrophy': 0.38 };
      else if (cad === 'Yes' && htn === 'No') dist = { 'Normal': 0.32, 'ST_T_Abnormality': 0.52, 'Hypertrophy': 0.16 };
      else if (cad === 'No' && htn === 'Yes') dist = { 'Normal': 0.50, 'ST_T_Abnormality': 0.22, 'Hypertrophy': 0.28 };
      return (dist as Record<string, number>)[ecg] || 0.33;
    },
    pFatigue: (dm: string, cad: string, fat: string): number => {
      let dist = { 'Normal': 0.80, 'Chronic_Exhaustion': 0.20 };
      if (dm === 'Yes' && cad === 'Yes') dist = { 'Normal': 0.18, 'Chronic_Exhaustion': 0.82 };
      else if (dm === 'Yes' && cad === 'No') dist = { 'Normal': 0.48, 'Chronic_Exhaustion': 0.52 };
      else if (dm === 'No' && cad === 'Yes') dist = { 'Normal': 0.42, 'Chronic_Exhaustion': 0.58 };
      return (dist as Record<string, number>)[fat] || 0.50;
    }
  };
}

/**
 * Exact Bayesian Variable Elimination across the 12-node DAG
 */
export function computeExactBayesianPosterior(evidence: PatientEvidenceDict): PosteriorResult {
  const cpd = getConditionalProbabilities();

  // Priors from reference cohort
  const total = GLOBAL_SYNTHETIC_COHORT.length;
  const priorHtnYes = GLOBAL_SYNTHETIC_COHORT.filter(r => r.Hypertension === 'Yes').length / total;
  const priorDmYes = GLOBAL_SYNTHETIC_COHORT.filter(r => r.Diabetes_T2 === 'Yes').length / total;
  const priorCadYes = GLOBAL_SYNTHETIC_COHORT.filter(r => r.CAD === 'Yes').length / total;

  const priors = {
    CAD: { Yes: priorCadYes, No: 1 - priorCadYes },
    Diabetes_T2: { Yes: priorDmYes, No: 1 - priorDmYes },
    Hypertension: { Yes: priorHtnYes, No: 1 - priorHtnYes }
  };

  // State space for latent disease nodes: [HTN, DM, CAD]
  const diseaseStates = ['No', 'Yes'];

  // Root states domain
  const ageDomain = evidence.Age ? [evidence.Age] : ['Young (<35)', 'Middle-aged (35-60)', 'Senior (>60)'];
  const ageProbs: Record<string, number> = { 'Young (<35)': 0.24, 'Middle-aged (35-60)': 0.46, 'Senior (>60)': 0.30 };

  const genderDomain = evidence.Gender ? [evidence.Gender] : ['Male', 'Female'];
  const genderProbs: Record<string, number> = { 'Male': 0.49, 'Female': 0.51 };

  const smokingDomain = evidence.Smoking ? [evidence.Smoking] : ['Non-smoker', 'Former-smoker', 'Current-smoker'];
  const smokingProbs: Record<string, number> = { 'Non-smoker': 0.55, 'Former-smoker': 0.23, 'Current-smoker': 0.22 };

  const bmiDomain = evidence.BMI_Category ? [evidence.BMI_Category] : ['Normal (<25)', 'Overweight (25-30)', 'Obese (>30)'];
  const bmiProbs: Record<string, number> = { 'Normal (<25)': 0.38, 'Overweight (25-30)': 0.36, 'Obese (>30)': 0.26 };

  const famDomain = evidence.Family_History ? [evidence.Family_History] : ['Absent', 'Present'];
  const famProbs: Record<string, number> = { 'Absent': 0.68, 'Present': 0.32 };

  // Joint distribution accumulator over (HTN, DM, CAD)
  const jointWeights: Record<string, number> = {};

  for (const htn of diseaseStates) {
    for (const dm of diseaseStates) {
      for (const cad of diseaseStates) {
        let stateWeight = 0;

        for (const a of ageDomain) {
          const pA = ageProbs[a];
          for (const g of genderDomain) {
            const pG = genderProbs[g];
            for (const s of smokingDomain) {
              const pS = smokingProbs[s];
              for (const b of bmiDomain) {
                const pB = bmiProbs[b];
                for (const f of famDomain) {
                  const pF = famProbs[f];

                  const pRoot = pA * pG * pS * pB * pF;

                  // Conditional HTN
                  const pHtnYes = cpd.pHTN(a, b, s);
                  const pHtn = htn === 'Yes' ? pHtnYes : (1 - pHtnYes);

                  // Conditional DM
                  const pDmYes = cpd.pDM(a, b, f);
                  const pDm = dm === 'Yes' ? pDmYes : (1 - pDmYes);

                  // Conditional CAD
                  const pCadYes = cpd.pCAD(s, htn, dm, g);
                  const pCad = cad === 'Yes' ? pCadYes : (1 - pCadYes);

                  // Symptom likelihoods
                  let pSymptoms = 1.0;
                  if (evidence.Chest_Pain) {
                    pSymptoms *= cpd.pChestPain(cad, evidence.Chest_Pain);
                  }
                  if (evidence.Dyspnea) {
                    pSymptoms *= cpd.pDyspnea(cad, htn, evidence.Dyspnea);
                  }
                  if (evidence.Fasting_Glucose) {
                    pSymptoms *= cpd.pFastingGlucose(dm, evidence.Fasting_Glucose);
                  }
                  if (evidence.Resting_ECG) {
                    pSymptoms *= cpd.pRestingECG(cad, htn, evidence.Resting_ECG);
                  }
                  if (evidence.Fatigue) {
                    pSymptoms *= cpd.pFatigue(dm, cad, evidence.Fatigue);
                  }

                  stateWeight += pRoot * pHtn * pDm * pCad * pSymptoms;
                }
              }
            }
          }
        }

        const key = `${htn}_${dm}_${cad}`;
        jointWeights[key] = stateWeight;
      }
    }
  }

  // Normalize joint weights
  const totalWeight = Object.values(jointWeights).reduce((sum, w) => sum + w, 0) || 1e-12;

  // Marginalize out for CAD, DM, HTN
  let cadYesWeight = 0;
  let dmYesWeight = 0;
  let htnYesWeight = 0;

  for (const htn of diseaseStates) {
    for (const dm of diseaseStates) {
      for (const cad of diseaseStates) {
        const w = jointWeights[`${htn}_${dm}_${cad}`];
        if (cad === 'Yes') cadYesWeight += w;
        if (dm === 'Yes') dmYesWeight += w;
        if (htn === 'Yes') htnYesWeight += w;
      }
    }
  }

  const postCadYes = Math.min(0.999, Math.max(0.001, cadYesWeight / totalWeight));
  const postDmYes = Math.min(0.999, Math.max(0.001, dmYesWeight / totalWeight));
  const postHtnYes = Math.min(0.999, Math.max(0.001, htnYesWeight / totalWeight));

  return {
    priors,
    posteriors: {
      CAD: { Yes: postCadYes, No: 1 - postCadYes },
      Diabetes_T2: { Yes: postDmYes, No: 1 - postDmYes },
      Hypertension: { Yes: postHtnYes, No: 1 - postHtnYes }
    },
    deltas: {
      CAD: postCadYes - priorCadYes,
      Diabetes_T2: postDmYes - priorDmYes,
      Hypertension: postHtnYes - priorHtnYes
    }
  };
}

/**
 * Biostatistical Chi-Square survival function (P-Value computation)
 * Uses incomplete gamma approximation (Lanczos / continued fraction)
 */
function logGamma(z: number): number {
  const g = 7;
  const C = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function regularizedGammaUpper(a: number, x: number): number {
  if (x <= 0) return 1.0;
  if (x < a + 1) {
    // Series expansion for lower gamma then 1 - P
    let sum = 1.0 / a;
    let term = 1.0 / a;
    for (let n = 1; n < 100; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < 1e-12) break;
    }
    const lowerP = Math.exp(-x + a * Math.log(x) - logGamma(a)) * sum;
    return Math.max(0, 1.0 - lowerP);
  } else {
    // Continued fraction for upper gamma Q
    let b = x + 1.0 - a;
    let c = 1.0 / 1e-30;
    let d = 1.0 / b;
    let h = d;
    for (let i = 1; i < 100; i++) {
      const an = -i * (i - a);
      b += 2.0;
      d = an * d + b;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1.0 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < 1e-12) break;
    }
    return Math.max(0, Math.min(1.0, Math.exp(-x + a * Math.log(x) - logGamma(a)) * h));
  }
}

export function chi2Survival(chi2: number, dof: number): number {
  if (chi2 <= 0 || dof <= 0) return 1.0;
  return regularizedGammaUpper(dof / 2.0, chi2 / 2.0);
}

/**
 * Biostatistical Engine B: Evaluate evidence significance against target disease
 */
export function evaluateEvidenceSignificanceTS(
  evidence: PatientEvidenceDict,
  targetDisease: 'CAD' | 'Diabetes_T2' | 'Hypertension' = 'CAD',
  alpha: number = 0.05
): StatisticalEvidenceRecord[] {
  const cohort = GLOBAL_SYNTHETIC_COHORT;
  const results: StatisticalEvidenceRecord[] = [];

  const evidenceVars = [
    'Age', 'Gender', 'Smoking', 'BMI_Category', 'Family_History',
    'Chest_Pain', 'Dyspnea', 'Fasting_Glucose', 'Resting_ECG', 'Fatigue'
  ];

  for (const v of evidenceVars) {
    const patientState = evidence[v];
    if (!patientState) continue;

    // Cross-tabulation: variable states vs disease states ('Yes'/'No')
    const categories = Array.from(new Set(cohort.map(r => r[v])));
    const observed: Record<string, { Yes: number; No: number }> = {};
    for (const c of categories) {
      observed[c] = { Yes: 0, No: 0 };
    }

    let totalYes = 0;
    let totalNo = 0;
    for (const r of cohort) {
      const state = r[v];
      const dis = r[targetDisease];
      if (dis === 'Yes') {
        observed[state].Yes++;
        totalYes++;
      } else {
        observed[state].No++;
        totalNo++;
      }
    }

    const n = cohort.length;
    let chi2 = 0;
    const dof = (categories.length - 1) * 1; // 2xK matrix -> (K-1)*(2-1)

    for (const c of categories) {
      const rowTotal = observed[c].Yes + observed[c].No;
      const expectedYes = (rowTotal * totalYes) / n;
      const expectedNo = (rowTotal * totalNo) / n;

      if (expectedYes > 0) chi2 += Math.pow(observed[c].Yes - expectedYes, 2) / expectedYes;
      if (expectedNo > 0) chi2 += Math.pow(observed[c].No - expectedNo, 2) / expectedNo;
    }

    const pValue = chi2Survival(chi2, dof);

    // Odds Ratio calculation for the specific patient's state vs others
    let a = 0; // State Match & Disease Yes
    let b = 0; // State Match & Disease No
    let c = 0; // State Mismatch & Disease Yes
    let d = 0; // State Mismatch & Disease No

    for (const r of cohort) {
      const stateMatch = r[v] === patientState;
      const diseaseYes = r[targetDisease] === 'Yes';
      if (stateMatch && diseaseYes) a++;
      else if (stateMatch && !diseaseYes) b++;
      else if (!stateMatch && diseaseYes) c++;
      else if (!stateMatch && !diseaseYes) d++;
    }

    // Haldane-Anscombe correction
    let orA = a, orB = b, orC = c, orD = d;
    if (orA === 0 || orB === 0 || orC === 0 || orD === 0) {
      orA += 0.5;
      orB += 0.5;
      orC += 0.5;
      orD += 0.5;
    }

    const oddsRatio = (orA * orD) / (orB * orC);
    const seLnOr = Math.sqrt(1 / orA + 1 / orB + 1 / orC + 1 / orD);
    const z = 1.95996; // 95% CI
    const ciLower = Math.exp(Math.log(oddsRatio) - z * seLnOr);
    const ciUpper = Math.exp(Math.log(oddsRatio) + z * seLnOr);

    const isSignificant = pValue < alpha;
    const significanceTag = isSignificant
      ? `Statistically Significant Driver (p < ${alpha})`
      : 'Non-significant / Incidental Evidence';

    let clinicalInterpretation = '';
    if (isSignificant) {
      if (oddsRatio > 1.0) {
        clinicalInterpretation = `Strong pathological driver; presence of '${patientState}' increases odds of ${targetDisease.replace('_', ' ')} by ${oddsRatio.toFixed(2)}x (95% CI: ${ciLower.toFixed(2)}–${ciUpper.toFixed(2)}).`;
      } else {
        clinicalInterpretation = `Protective / baseline negative marker; associated with lower odds of ${targetDisease.replace('_', ' ')} (OR: ${oddsRatio.toFixed(2)}, 95% CI: ${ciLower.toFixed(2)}–${ciUpper.toFixed(2)}).`;
      }
    } else {
      clinicalInterpretation = `Incidental or non-discriminating finding; symptom distribution does not statistically deviate from null hypothesis in reference cohort (p = ${pValue.toFixed(4)}).`;
    }

    results.push({
      observedEvidence: v,
      patientState,
      chi2Stat: chi2,
      dof,
      pValue,
      oddsRatio,
      ciLower,
      ciUpper,
      significanceTag,
      isSignificant,
      clinicalInterpretation
    });
  }

  // Sort lowest p-value first
  results.sort((x, y) => x.pValue - y.pValue);
  return results;
}

/**
 * Get detailed 2xK contingency matrix for breakdown expander
 */
export function getDetailedContingencyMatrix(
  evidenceVar: string,
  targetDisease: 'CAD' | 'Diabetes_T2' | 'Hypertension'
): ContingencyMatrix {
  const cohort = GLOBAL_SYNTHETIC_COHORT;
  const categories = Array.from(new Set(cohort.map(r => r[evidenceVar])));

  const matrix: ContingencyMatrix['matrix'] = {};
  let totalYes = 0;
  let totalNo = 0;

  for (const cat of categories) {
    matrix[cat] = { Yes: 0, No: 0, Total: 0 };
  }

  for (const r of cohort) {
    const val = r[evidenceVar];
    const dis = r[targetDisease];
    if (dis === 'Yes') {
      matrix[val].Yes++;
      totalYes++;
    } else {
      matrix[val].No++;
      totalNo++;
    }
    matrix[val].Total++;
  }

  return {
    evidenceVar,
    targetDisease,
    categories,
    matrix,
    totalYes,
    totalNo,
    grandTotal: cohort.length
  };
}

/**
 * Leave-One-Out (Ablation) Sensitivity Analysis
 * For every active evidence item, compute posterior P(Target = 'Yes' | E \ {X_i})
 * to quantify the marginal risk impact of that specific clinical observation.
 */
export function computeLeaveOneOutSensitivity(
  evidence: PatientEvidenceDict,
  targetDisease: 'CAD' | 'Diabetes_T2' | 'Hypertension' = 'CAD'
): EvidenceSensitivityRecord[] {
  const fullResult = computeExactBayesianPosterior(evidence);
  const fullPosterior = fullResult.posteriors[targetDisease].Yes;

  const records: EvidenceSensitivityRecord[] = [];

  const variableLabels: Record<string, string> = {
    Age: 'Age Stratum',
    Gender: 'Biological Sex',
    Smoking: 'Smoking Status',
    BMI_Category: 'Body Mass Index (BMI)',
    Family_History: 'Family History',
    Chest_Pain: 'Chest Pain / Angina',
    Dyspnea: 'Dyspnea Severity',
    Fasting_Glucose: 'Fasting Blood Glucose',
    Resting_ECG: 'Resting 12-Lead ECG',
    Fatigue: 'Fatigue & Exhaustion'
  };

  for (const [key, state] of Object.entries(evidence)) {
    if (!state) continue;

    // Create ablated evidence dictionary without this single variable
    const ablatedEvidence: PatientEvidenceDict = { ...evidence };
    delete ablatedEvidence[key];

    const ablatedResult = computeExactBayesianPosterior(ablatedEvidence);
    const ablatedPosterior = ablatedResult.posteriors[targetDisease].Yes;

    const marginalImpact = fullPosterior - ablatedPosterior;
    const percentImpact = ablatedPosterior > 0
      ? ((fullPosterior - ablatedPosterior) / ablatedPosterior) * 100
      : 0;

    let direction: 'amplifying_risk' | 'protective_reduction' | 'neutral' = 'neutral';
    let clinicalInterpretation = '';

    if (Math.abs(marginalImpact) < 0.005) {
      direction = 'neutral';
      clinicalInterpretation = `Marginal clinical influence (risk swing < 0.5%). This marker has minimal independent diagnostic weight on ${targetDisease.replace('_', ' ')}.`;
    } else if (marginalImpact > 0) {
      direction = 'amplifying_risk';
      clinicalInterpretation = `Amplifying risk driver (+${(marginalImpact * 100).toFixed(1)}% absolute risk). Presence of '${state}' increases posterior probability.`;
    } else {
      direction = 'protective_reduction';
      clinicalInterpretation = `Protective / stabilizing factor (${(marginalImpact * 100).toFixed(1)}% absolute risk). Presence of '${state}' anchors posterior risk lower.`;
    }

    records.push({
      variableKey: key,
      variableLabel: variableLabels[key] || key.replace('_', ' '),
      patientState: state,
      fullPosterior,
      ablatedPosterior,
      marginalImpact,
      percentImpact,
      direction,
      clinicalInterpretation
    });
  }

  // Sort by descending absolute marginal impact (highest clinical leverage first)
  records.sort((a, b) => Math.abs(b.marginalImpact) - Math.abs(a.marginalImpact));
  return records;
}
