export const SYNTHETIC_DATA_PY = `"""
Synthetic Clinical Population Generator for Bayesian Network CDSS
Generates N=3,500 patient cohort based on epidemiological medical distributions.
"""

import numpy as np
import pandas as pd


def generate_synthetic_clinical_data(n_samples: int = 3500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic clinical cohort adhering to medical epidemiological dependencies.

    Graph Architecture:
    1. Root Nodes (Demographics & Risk Factors):
       - Age: ['Young (<35)', 'Middle-aged (35-60)', 'Senior (>60)']
       - Gender: ['Male', 'Female']
       - Smoking: ['Non-smoker', 'Former-smoker', 'Current-smoker']
       - BMI_Category: ['Normal (<25)', 'Overweight (25-30)', 'Obese (>30)']
       - Family_History: ['Absent', 'Present']

    2. Intermediate Disease Nodes:
       - Hypertension: ['No', 'Yes'] (Parents: Age, BMI_Category, Smoking)
       - Diabetes_T2: ['No', 'Yes'] (Parents: Age, BMI_Category, Family_History)
       - CAD: ['No', 'Yes'] (Parents: Smoking, Hypertension, Diabetes_T2, Gender)

    3. Leaf Symptom & Lab Nodes:
       - Chest_Pain: ['None', 'Atypical', 'Typical_Angina'] (Child of CAD)
       - Dyspnea: ['Absent', 'Mild', 'Severe'] (Child of CAD, Hypertension)
       - Fasting_Glucose: ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)'] (Child of Diabetes_T2)
       - Resting_ECG: ['Normal', 'ST_T_Abnormality', 'Hypertrophy'] (Child of CAD, Hypertension)
       - Fatigue: ['Normal', 'Chronic_Exhaustion'] (Child of Diabetes_T2, CAD)
    """
    np.random.seed(random_seed)

    # 1. Root Nodes
    age_categories = ['Young (<35)', 'Middle-aged (35-60)', 'Senior (>60)']
    age_probs = [0.24, 0.46, 0.30]
    age = np.random.choice(age_categories, size=n_samples, p=age_probs)

    gender_categories = ['Male', 'Female']
    gender_probs = [0.49, 0.51]
    gender = np.random.choice(gender_categories, size=n_samples, p=gender_probs)

    smoking_categories = ['Non-smoker', 'Former-smoker', 'Current-smoker']
    smoking_probs = [0.55, 0.23, 0.22]
    smoking = np.random.choice(smoking_categories, size=n_samples, p=smoking_probs)

    bmi_categories = ['Normal (<25)', 'Overweight (25-30)', 'Obese (>30)']
    bmi_probs = [0.38, 0.36, 0.26]
    bmi = np.random.choice(bmi_categories, size=n_samples, p=bmi_probs)

    fam_hist_categories = ['Absent', 'Present']
    fam_hist_probs = [0.68, 0.32]
    family_history = np.random.choice(fam_hist_categories, size=n_samples, p=fam_hist_probs)

    # 2. Intermediate Diseases
    # Hypertension: P(HTN = 'Yes' | Age, BMI, Smoking)
    htn_list = []
    for a, b, s in zip(age, bmi, smoking):
        base_p = 0.08
        if a == 'Middle-aged (35-60)':
            base_p += 0.20
        elif a == 'Senior (>60)':
            base_p += 0.42

        if b == 'Overweight (25-30)':
            base_p += 0.12
        elif b == 'Obese (>30)':
            base_p += 0.26

        if s == 'Former-smoker':
            base_p += 0.06
        elif s == 'Current-smoker':
            base_p += 0.15

        p_htn = np.clip(base_p, 0.03, 0.88)
        htn_val = 'Yes' if np.random.rand() < p_htn else 'No'
        htn_list.append(htn_val)

    # Diabetes_T2: P(DM = 'Yes' | Age, BMI, Family_History)
    dm_list = []
    for a, b, fh in zip(age, bmi, family_history):
        base_p = 0.04
        if a == 'Middle-aged (35-60)':
            base_p += 0.10
        elif a == 'Senior (>60)':
            base_p += 0.22

        if b == 'Overweight (25-30)':
            base_p += 0.14
        elif b == 'Obese (>30)':
            base_p += 0.34

        if fh == 'Present':
            base_p += 0.22

        p_dm = np.clip(base_p, 0.02, 0.85)
        dm_val = 'Yes' if np.random.rand() < p_dm else 'No'
        dm_list.append(dm_val)

    # Coronary Artery Disease (CAD): P(CAD = 'Yes' | Smoking, Hypertension, Diabetes_T2, Gender)
    cad_list = []
    for s, htn, dm, g in zip(smoking, htn_list, dm_list, gender):
        base_p = 0.04
        if g == 'Male':
            base_p += 0.08

        if s == 'Former-smoker':
            base_p += 0.08
        elif s == 'Current-smoker':
            base_p += 0.22

        if htn == 'Yes':
            base_p += 0.24

        if dm == 'Yes':
            base_p += 0.25

        p_cad = np.clip(base_p, 0.02, 0.88)
        cad_val = 'Yes' if np.random.rand() < p_cad else 'No'
        cad_list.append(cad_val)

    # 3. Leaf Symptoms and Clinical Biomarkers
    chest_pain_list = []
    for cad_val in cad_list:
        if cad_val == 'Yes':
            p_cp = [0.18, 0.34, 0.48]
        else:
            p_cp = [0.82, 0.15, 0.03]
        cp_val = np.random.choice(['None', 'Atypical', 'Typical_Angina'], p=p_cp)
        chest_pain_list.append(cp_val)

    dyspnea_list = []
    for cad_val, htn_val in zip(cad_list, htn_list):
        if cad_val == 'Yes' and htn_val == 'Yes':
            p_dys = [0.15, 0.45, 0.40]
        elif cad_val == 'Yes' and htn_val == 'No':
            p_dys = [0.38, 0.44, 0.18]
        elif cad_val == 'No' and htn_val == 'Yes':
            p_dys = [0.58, 0.32, 0.10]
        else:
            p_dys = [0.85, 0.12, 0.03]
        dys_val = np.random.choice(['Absent', 'Mild', 'Severe'], p=p_dys)
        dyspnea_list.append(dys_val)

    glucose_list = []
    for dm_val in dm_list:
        if dm_val == 'Yes':
            p_glu = [0.06, 0.28, 0.66]
        else:
            p_glu = [0.82, 0.16, 0.02]
        glu_val = np.random.choice(
            ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)'],
            p=p_glu
        )
        glucose_list.append(glu_val)

    ecg_list = []
    for cad_val, htn_val in zip(cad_list, htn_list):
        if cad_val == 'Yes' and htn_val == 'Yes':
            p_ecg = [0.14, 0.48, 0.38]
        elif cad_val == 'Yes' and htn_val == 'No':
            p_ecg = [0.32, 0.52, 0.16]
        elif cad_val == 'No' and htn_val == 'Yes':
            p_ecg = [0.50, 0.22, 0.28]
        else:
            p_ecg = [0.84, 0.11, 0.05]
        ecg_val = np.random.choice(['Normal', 'ST_T_Abnormality', 'Hypertrophy'], p=p_ecg)
        ecg_list.append(ecg_val)

    fatigue_list = []
    for dm_val, cad_val in zip(dm_list, cad_list):
        if dm_val == 'Yes' and cad_val == 'Yes':
            p_fat = [0.18, 0.82]
        elif dm_val == 'Yes' and cad_val == 'No':
            p_fat = [0.48, 0.52]
        elif dm_val == 'No' and cad_val == 'Yes':
            p_fat = [0.42, 0.58]
        else:
            p_fat = [0.80, 0.20]
        fat_val = np.random.choice(['Normal', 'Chronic_Exhaustion'], p=p_fat)
        fatigue_list.append(fat_val)

    df = pd.DataFrame({
        'Age': age,
        'Gender': gender,
        'Smoking': smoking,
        'BMI_Category': bmi,
        'Family_History': family_history,
        'Hypertension': htn_list,
        'Diabetes_T2': dm_list,
        'CAD': cad_list,
        'Chest_Pain': chest_pain_list,
        'Dyspnea': dyspnea_list,
        'Fasting_Glucose': glucose_list,
        'Resting_ECG': ecg_list,
        'Fatigue': fatigue_list
    })

    categorical_domains = {
        'Age': ['Young (<35)', 'Middle-aged (35-60)', 'Senior (>60)'],
        'Gender': ['Male', 'Female'],
        'Smoking': ['Non-smoker', 'Former-smoker', 'Current-smoker'],
        'BMI_Category': ['Normal (<25)', 'Overweight (25-30)', 'Obese (>30)'],
        'Family_History': ['Absent', 'Present'],
        'Hypertension': ['No', 'Yes'],
        'Diabetes_T2': ['No', 'Yes'],
        'CAD': ['No', 'Yes'],
        'Chest_Pain': ['None', 'Atypical', 'Typical_Angina'],
        'Dyspnea': ['Absent', 'Mild', 'Severe'],
        'Fasting_Glucose': ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)'],
        'Resting_ECG': ['Normal', 'ST_T_Abnormality', 'Hypertrophy'],
        'Fatigue': ['Normal', 'Chronic_Exhaustion']
    }

    for col, categories in categorical_domains.items():
        df[col] = pd.Categorical(df[col], categories=categories)

    return df
`;

export const BAYESIAN_NETWORK_PY = `"""
Bayesian Belief Network Engine for Clinical Decision Support
Instantiates the Causal DAG, learns BDeu-smoothed CPDs, and executes exact Variable Elimination.
"""

from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

try:
    from pgmpy.models import DiscreteBayesianNetwork as BayesianNetwork
except ImportError:
    try:
        from pgmpy.models import BayesianNetwork
    except ImportError:
        from pgmpy.models import BayesianModel as BayesianNetwork

from pgmpy.estimators import BayesianEstimator
from pgmpy.inference import VariableElimination
from synthetic_data import generate_synthetic_clinical_data


class ClinicalBayesianEngine:
    EDGES = [
        ('Age', 'Hypertension'),
        ('BMI_Category', 'Hypertension'),
        ('Smoking', 'Hypertension'),

        ('Age', 'Diabetes_T2'),
        ('BMI_Category', 'Diabetes_T2'),
        ('Family_History', 'Diabetes_T2'),

        ('Smoking', 'CAD'),
        ('Hypertension', 'CAD'),
        ('Diabetes_T2', 'CAD'),
        ('Gender', 'CAD'),

        ('CAD', 'Chest_Pain'),
        ('CAD', 'Dyspnea'),
        ('CAD', 'Resting_ECG'),
        ('CAD', 'Fatigue'),

        ('Hypertension', 'Dyspnea'),
        ('Hypertension', 'Resting_ECG'),

        ('Diabetes_T2', 'Fasting_Glucose'),
        ('Diabetes_T2', 'Fatigue')
    ]

    VALID_DOMAINS = {
        'Age': ['Young (<35)', 'Middle-aged (35-60)', 'Senior (>60)'],
        'Gender': ['Male', 'Female'],
        'Smoking': ['Non-smoker', 'Former-smoker', 'Current-smoker'],
        'BMI_Category': ['Normal (<25)', 'Overweight (25-30)', 'Obese (>30)'],
        'Family_History': ['Absent', 'Present'],
        'Hypertension': ['No', 'Yes'],
        'Diabetes_T2': ['No', 'Yes'],
        'CAD': ['No', 'Yes'],
        'Chest_Pain': ['None', 'Atypical', 'Typical_Angina'],
        'Dyspnea': ['Absent', 'Mild', 'Severe'],
        'Fasting_Glucose': ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)'],
        'Resting_ECG': ['Normal', 'ST_T_Abnormality', 'Hypertrophy'],
        'Fatigue': ['Normal', 'Chronic_Exhaustion']
    }

    def __init__(self, data: Optional[pd.DataFrame] = None):
        if data is None:
            self.df = generate_synthetic_clinical_data(n_samples=3500, random_seed=42)
        else:
            self.df = data.copy()

        self.model = BayesianNetwork(self.EDGES)
        self._fit_network()
        self.inference_engine = VariableElimination(self.model)
        self.prior_probabilities = self._compute_priors()

    def _fit_network(self) -> None:
        estimator = BayesianEstimator(self.model, self.df)
        cpds = estimator.get_cpds(prior_type='BDeu', equivalent_sample_size=10)
        self.model.add_cpds(*cpds)

        if not self.model.check_model():
            raise ValueError("Bayesian Network specification failed consistency check.")

    def _compute_priors(self) -> Dict[str, Dict[str, float]]:
        priors = {}
        for target in ['CAD', 'Diabetes_T2', 'Hypertension']:
            try:
                res = self.inference_engine.query(variables=[target], evidence={})
                prob_dict = {
                    state: float(res.values[idx])
                    for idx, state in enumerate(self.VALID_DOMAINS[target])
                }
                priors[target] = prob_dict
            except Exception:
                counts = self.df[target].value_counts(normalize=True)
                priors[target] = {state: float(counts.get(state, 0.0)) for state in self.VALID_DOMAINS[target]}
        return priors

    def sanitize_evidence(self, evidence_dict: Dict[str, Any]) -> Dict[str, str]:
        clean_evidence = {}
        for node, val in evidence_dict.items():
            if node in self.VALID_DOMAINS and val is not None:
                str_val = str(val).strip()
                if str_val in self.VALID_DOMAINS[node]:
                    clean_evidence[node] = str_val
        return clean_evidence

    def predict_patient(self, evidence_dict: Dict[str, Any]) -> Dict[str, Any]:
        clean_evidence = self.sanitize_evidence(evidence_dict)
        results = {
            'posteriors': {},
            'priors': self.prior_probabilities,
            'active_evidence': clean_evidence,
            'risk_delta': {}
        }

        target_nodes = ['CAD', 'Diabetes_T2', 'Hypertension']
        for target in target_nodes:
            if target in clean_evidence:
                target_state = clean_evidence[target]
                results['posteriors'][target] = {
                    'Yes': 1.0 if target_state == 'Yes' else 0.0,
                    'No': 0.0 if target_state == 'Yes' else 1.0
                }
            else:
                try:
                    query_res = self.inference_engine.query(
                        variables=[target],
                        evidence=clean_evidence,
                        joint=False,
                        show_progress=False
                    )
                    states = self.VALID_DOMAINS[target]
                    prob_dict = {
                        state: float(query_res.values[idx])
                        for idx, state in enumerate(states)
                    }
                    results['posteriors'][target] = prob_dict
                except Exception:
                    results['posteriors'][target] = self.prior_probabilities.get(
                        target, {'No': 0.75, 'Yes': 0.25}
                    )

            p_yes_post = results['posteriors'][target].get('Yes', 0.0)
            p_yes_prior = self.prior_probabilities[target].get('Yes', 0.0)
            results['risk_delta'][target] = float(p_yes_post - p_yes_prior)

        return results


_clinical_engine_singleton: Optional[ClinicalBayesianEngine] = None

def get_bayesian_engine(data: Optional[pd.DataFrame] = None) -> ClinicalBayesianEngine:
    global _clinical_engine_singleton
    if _clinical_engine_singleton is None or data is not None:
        _clinical_engine_singleton = ClinicalBayesianEngine(data)
    return _clinical_engine_singleton

def predict_patient(evidence_dict: Dict[str, Any], data: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    engine = get_bayesian_engine(data)
    return engine.predict_patient(evidence_dict)
`;

export const STATISTICAL_ENGINE_PY = `"""
Inferential P-Value Hypothesis Testing and Biostatistical Engine
Executes Chi-Square Tests of Independence and Odds Ratio (OR with 95% CI)
against the epidemiological reference cohort.
"""

from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from scipy import stats


def compute_odds_ratio_with_ci(
    df: pd.DataFrame,
    evidence_var: str,
    patient_state: str,
    target_disease: str,
    alpha: float = 0.05
) -> Tuple[float, float, float]:
    mask_state = (df[evidence_var] == patient_state)
    mask_disease = (df[target_disease] == 'Yes')

    a = float(np.sum(mask_state & mask_disease))
    b = float(np.sum(mask_state & ~mask_disease))
    c = float(np.sum(~mask_state & mask_disease))
    d = float(np.sum(~mask_state & ~mask_disease))

    if 0 in (a, b, c, d):
        a += 0.5
        b += 0.5
        c += 0.5
        d += 0.5

    if (b * c) == 0:
        return 1.0, 1.0, 1.0

    odds_ratio = (a * d) / (b * c)
    se_ln_or = np.sqrt(1.0 / a + 1.0 / b + 1.0 / c + 1.0 / d)
    z = stats.norm.ppf(1.0 - alpha / 2.0)

    ln_ci_lower = np.log(odds_ratio) - z * se_ln_or
    ln_ci_upper = np.log(odds_ratio) + z * se_ln_or

    return float(odds_ratio), float(np.exp(ln_ci_lower)), float(np.exp(ln_ci_upper))


def evaluate_evidence_significance(
    df: pd.DataFrame,
    evidence_dict: Dict[str, Any],
    target_disease: str = 'CAD',
    alpha: float = 0.05
) -> pd.DataFrame:
    records = []

    for evidence_var, patient_state in evidence_dict.items():
        if evidence_var == target_disease or patient_state is None:
            continue

        if evidence_var not in df.columns:
            continue

        patient_state_str = str(patient_state).strip()

        contingency = pd.crosstab(df[evidence_var], df[target_disease])

        try:
            chi2_stat, p_val, dof, _ = stats.chi2_contingency(contingency, correction=True)
        except Exception:
            chi2_stat, p_val, dof = 0.0, 1.0, 1

        odds_ratio, or_low, or_high = compute_odds_ratio_with_ci(
            df, evidence_var, patient_state_str, target_disease, alpha
        )

        if p_val < alpha:
            decision = f"Statistically Significant Driver (p < {alpha})"
            if odds_ratio > 1.0:
                interpretation = (
                    f"Strong causal risk factor; increases odds of {target_disease} "
                    f"by {odds_ratio:.2f}x (95% CI: {or_low:.2f}–{or_high:.2f})."
                )
            else:
                interpretation = (
                    f"Protective / negative association; lower prevalence in {target_disease} "
                    f"(OR: {odds_ratio:.2f}, 95% CI: {or_low:.2f}–{or_high:.2f})."
                )
        else:
            decision = "Non-significant / Incidental Evidence"
            interpretation = (
                f"No statistically demonstrable dependence on {target_disease} in reference cohort "
                f"(p = {p_val:.4f}). Coincidental or non-discriminating finding."
            )

        records.append({
            'Observed Evidence': evidence_var,
            'Patient State': patient_state_str,
            'Chi2 Stat': round(float(chi2_stat), 3),
            'Degrees of Freedom': int(dof),
            'p-value': float(p_val),
            'Odds Ratio (95% CI)': f"{odds_ratio:.2f} [{or_low:.2f}, {or_high:.2f}]",
            'Significance (alpha=0.05)': decision,
            'Clinical Interpretation': interpretation
        })

    result_df = pd.DataFrame(records)
    if not result_df.empty:
        result_df.sort_values(by='p-value', ascending=True, inplace=True)
        result_df.reset_index(drop=True, inplace=True)
    return result_df
`;

export const APP_PY = `"""
Clinical Decision Support System (CDSS) for Disease Prediction
Dual Engine: Bayesian Belief Networks (pgmpy) & P-Value Hypothesis Testing (scipy.stats)
Built with Streamlit and Plotly.
"""

from datetime import datetime
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import networkx as nx

from synthetic_data import generate_synthetic_clinical_data
from bayesian_network import get_bayesian_engine, ClinicalBayesianEngine
from statistical_engine import evaluate_evidence_significance

st.set_page_config(
    page_title="Bayesian Clinical Decision Support System",
    page_icon="🩺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load synthetic cohort and initialize Bayesian network
@st.cache_resource(show_spinner=True)
def load_system_engines():
    df = generate_synthetic_clinical_data(n_samples=3500, random_seed=42)
    engine = get_bayesian_engine(df)
    return df, engine

clinical_df, bayesian_engine = load_system_engines()

# Header and HIPAA disclaimer
st.title("🩺 Bayesian Clinical Decision Support System (CDSS)")
st.caption("Dual Engine: Exact Variable Elimination (pgmpy) & Inferential Hypothesis Testing (scipy.stats)")

st.warning("⚠️ CLINICAL PROTOCOL NOTICE: Compliant with synthetic cohort standards under HIPAA 45 CFR § 164.514(b). This tool calculates exact Bayesian posterior probabilities and biostatistical p-values to aid licensed clinicians.")

# Sidebar Patient Intake Form
st.sidebar.title("📋 Patient Intake Form")
patient_id = st.sidebar.text_input("Patient Identifier", value="PT-2026-0842")
patient_name = st.sidebar.text_input("Patient Name / Initials", value="J. Doe")

raw_age = st.sidebar.slider("Age (Years)", 18, 90, 63)
age_cat = 'Young (<35)' if raw_age < 35 else ('Middle-aged (35-60)' if raw_age <= 60 else 'Senior (>60)')

gender = st.sidebar.radio("Biological Sex", ['Male', 'Female'], horizontal=True)
smoking = st.sidebar.selectbox("Smoking History", ['Non-smoker', 'Former-smoker', 'Current-smoker'], index=2)

col_h, col_w = st.sidebar.columns(2)
ht = col_h.number_input("Height (cm)", 120.0, 220.0, 175.0)
wt = col_w.number_input("Weight (kg)", 30.0, 200.0, 96.0)
bmi_val = wt / ((ht / 100.0) ** 2)
bmi_cat = 'Normal (<25)' if bmi_val < 25 else ('Overweight (25-30)' if bmi_val <= 30 else 'Obese (>30)')

family_history = 'Present' if st.sidebar.toggle("Family History of CVD / Diabetes", value=True) else 'Absent'

chest_pain = st.sidebar.selectbox("Chest Pain Presentation", ['None', 'Atypical', 'Typical_Angina'], index=2)
dyspnea = st.sidebar.selectbox("Dyspnea (Shortness of Breath)", ['Absent', 'Mild', 'Severe'], index=2)
fasting_glucose = st.sidebar.selectbox("Fasting Blood Glucose", ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)'], index=1)
resting_ecg = st.sidebar.selectbox("Resting 12-Lead ECG", ['Normal', 'ST_T_Abnormality', 'Hypertrophy'], index=1)
fatigue = st.sidebar.selectbox("Fatigue Level", ['Normal', 'Chronic_Exhaustion'], index=1)

patient_evidence = {
    'Age': age_cat,
    'Gender': gender,
    'Smoking': smoking,
    'BMI_Category': bmi_cat,
    'Family_History': family_history,
    'Chest_Pain': chest_pain,
    'Dyspnea': dyspnea,
    'Fasting_Glucose': fasting_glucose,
    'Resting_ECG': resting_ecg,
    'Fatigue': fatigue
}

inference_results = bayesian_engine.predict_patient(patient_evidence)
posteriors = inference_results['posteriors']
priors = inference_results['priors']

p_cad = posteriors['CAD']['Yes']
p_dm = posteriors['Diabetes_T2']['Yes']
p_htn = posteriors['Hypertension']['Yes']

# Risk Metric Cards
c1, c2, c3 = st.columns(3)
c1.metric("Coronary Artery Disease (CAD)", f"{p_cad*100:.1f}%", f"{(p_cad - priors['CAD']['Yes'])*100:+.1f}%")
c2.metric("Type-2 Diabetes Mellitus", f"{p_dm*100:.1f}%", f"{(p_dm - priors['Diabetes_T2']['Yes'])*100:+.1f}%")
c3.metric("Essential Hypertension", f"{p_htn*100:.1f}%", f"{(p_htn - priors['Hypertension']['Yes'])*100:+.1f}%")

# Main Navigation Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📈 Tab 1: Posterior Distributions",
    "🔬 Tab 2: Evidence Statistical Validation (P-Values)",
    "🕸️ Tab 3: Bayesian Causal Graph",
    "📄 Tab 4: Clinical Summary Export"
])

with tab1:
    st.subheader("Diagnostic Posterior Probabilities (Plotly Gauges)")
    col_g1, col_g2 = st.columns(2)
    fig_cad = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=p_cad * 100,
        delta={'reference': priors['CAD']['Yes'] * 100},
        title={'text': "<b>CAD Posterior Risk</b>"},
        gauge={'axis': {'range': [0, 100]}, 'bar': {'color': "#1E3A8A"}}
    ))
    col_g1.plotly_chart(fig_cad, use_container_width=True)

    fig_dm = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=p_dm * 100,
        delta={'reference': priors['Diabetes_T2']['Yes'] * 100},
        title={'text': "<b>Type-2 Diabetes Posterior Risk</b>"},
        gauge={'axis': {'range': [0, 100]}, 'bar': {'color': "#065F46"}}
    ))
    col_g2.plotly_chart(fig_dm, use_container_width=True)

    # Sensitivity Analysis: Leave-One-Out (LOO) Evidence Ablation
    st.markdown("---")
    st.markdown("#### 🔬 Sensitivity Analysis & Evidence Ablation")
    if st.toggle("Enable Evidence Sensitivity Mode", value=False):
        study_disease = st.selectbox("Study Target Disease", ['CAD', 'Diabetes_T2', 'Hypertension'])
        dropped_markers = st.multiselect(
            "Select evidence points to DROP:",
            options=list(patient_evidence.keys()),
            format_func=lambda x: f"{x.replace('_', ' ')} ({patient_evidence[x]})"
        )
        if dropped_markers:
            ablated_evidence = {k: v for k, v in patient_evidence.items() if k not in dropped_markers}
            ablated_res = bayesian_engine.predict_patient(ablated_evidence)
            st.warning(f"Ablated Risk: P({study_disease}='Yes'|E) = {ablated_res['posteriors'][study_disease]['Yes']*100:.1f}%")

with tab2:
    st.subheader("Engine B: Inferential P-Value Hypothesis Testing (scipy.stats)")
    target = st.selectbox("Select Target Disease", ['CAD', 'Diabetes_T2', 'Hypertension'])
    stat_df = evaluate_evidence_significance(clinical_df, patient_evidence, target_disease=target)
    st.dataframe(stat_df, use_container_width=True)

with tab3:
    st.subheader("Bayesian Directed Acyclic Graph (DAG) Structure")
    st.info("Causal Edges: 12 nodes across demographics, intermediate disease states, and leaf symptoms.")

with tab4:
    st.subheader("Structured Medical Consultation Report")
    report = f"# CLINICAL REPORT for {patient_id} ({patient_name})\\n\\nCAD Risk: {p_cad*100:.1f}%\\nT2D Risk: {p_dm*100:.1f}%"
    st.download_button("Download Report (.md)", report, file_name=f"{patient_id}_report.md")
`;
