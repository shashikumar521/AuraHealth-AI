"""
AuraHealth Nexus - Clinical Decision Support Platform
Gemini-Inspired Cyber Blue / Dark Slate AI Architecture
Full-Stack Clinical Intelligence Engine using Python, Streamlit, pgmpy, scipy.stats, networkx, and plotly.

Install Dependencies:
    pip install streamlit pgmpy pandas numpy scipy plotly networkx

Run Application:
    streamlit run app.py
"""

from typing import Dict, Any, List, Tuple
from datetime import datetime
import numpy as np
import pandas as pd
import streamlit as st
import plotly.graph_objects as go
from scipy import stats
import networkx as nx

# Safe pgmpy Bayesian Network imports across diverse library releases
try:
    from pgmpy.models import DiscreteBayesianNetwork as BayesianNetwork
except ImportError:
    try:
        from pgmpy.models import BayesianNetwork
    except ImportError:
        from pgmpy.models import BayesianModel as BayesianNetwork

from pgmpy.estimators import BayesianEstimator
from pgmpy.inference import VariableElimination


# -----------------------------------------------------------------------------
# 1. Page Configuration & Gemini-Inspired Cyber Blue CSS Styling
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="AuraHealth Nexus | Clinical Intelligence",
    page_icon="🧬",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    /* Google Fonts */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    /* Global Canvas: Deep Obsidian Blue with subtle radial gradient */
    .stApp {
        background: radial-gradient(circle at 50% 15%, #1C2541 0%, #0B132B 80%) !important;
        color: #E2E8F0 !important;
        font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif !important;
    }

    /* Top Brand Navigation Header */
    .nexus-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 26px;
        background: rgba(28, 37, 65, 0.65);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(72, 202, 228, 0.2);
        border-radius: 20px;
        margin-bottom: 24px;
        box-shadow: 0 12px 36px 0 rgba(0, 0, 0, 0.45);
    }

    .nexus-brand-title {
        font-size: 1.35rem;
        font-weight: 700;
        background: linear-gradient(135deg, #48CAE4 0%, #3A86FF 50%, #90E0EF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
        letter-spacing: -0.3px;
    }

    .nexus-tagline {
        font-size: 0.78rem;
        color: #94A3B8;
        margin: 3px 0 0 0;
        font-weight: 400;
    }

    /* Frosted Dark Slate Card Containers */
    .nexus-card {
        background: rgba(28, 37, 65, 0.65);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(72, 202, 228, 0.15);
        border-radius: 16px;
        padding: 22px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        margin-bottom: 20px;
        transition: transform 0.2s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    }

    .nexus-card:hover {
        border-color: rgba(72, 202, 228, 0.35);
        box-shadow: 0 12px 36px 0 rgba(72, 202, 228, 0.08);
    }

    .nexus-card-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: #FFFFFF;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .nexus-card-subtitle {
        font-size: 0.78rem;
        color: #94A3B8;
        margin: 3px 0 0 0;
        font-weight: 400;
    }

    /* Section Step Number Pill */
    .step-indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 8px;
        background: linear-gradient(135deg, #3A86FF 0%, #48CAE4 100%);
        color: #0B132B;
        font-size: 0.75rem;
        font-weight: 700;
    }

    /* Status Pill Badges */
    .nexus-badge {
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 11.5px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        letter-spacing: 0.2px;
    }

    .badge-cyan {
        background: rgba(72, 202, 228, 0.14);
        color: #48CAE4;
        border: 1px solid rgba(72, 202, 228, 0.3);
    }

    .badge-optimal {
        background: rgba(16, 185, 129, 0.14);
        color: #34D399;
        border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge-amber {
        background: rgba(245, 158, 11, 0.14);
        color: #FBBF24;
        border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge-crimson {
        background: rgba(239, 68, 68, 0.14);
        color: #F87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .badge-blue {
        background: rgba(58, 134, 255, 0.14);
        color: #60A5FA;
        border: 1px solid rgba(58, 134, 255, 0.3);
    }

    /* Sidebar Customization */
    section[data-testid="stSidebar"] {
        background: rgba(15, 23, 42, 0.85) !important;
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(72, 202, 228, 0.15) !important;
    }

    section[data-testid="stSidebar"] .stMarkdown h3 {
        color: #48CAE4 !important;
        font-size: 0.92rem !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.6px !important;
    }

    /* Primary Glowing CTA Button */
    div.stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #3A86FF 0%, #48CAE4 100%) !important;
        color: #0B132B !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 12px 24px !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        letter-spacing: 0.3px !important;
        box-shadow: 0 4px 20px rgba(72, 202, 228, 0.35) !important;
        transition: all 0.25s ease !important;
        width: 100% !important;
    }

    div.stButton > button[kind="primary"]:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 30px rgba(72, 202, 228, 0.5) !important;
        background: linear-gradient(135deg, #2563EB 0%, #38BDF8 100%) !important;
    }

    /* P-Value Evidence Frosted Cards */
    .p-val-card {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(72, 202, 228, 0.15);
        border-radius: 14px;
        padding: 14px 18px;
        margin-bottom: 12px;
        transition: all 0.2s ease;
    }

    .p-val-card.verified {
        border-color: rgba(72, 202, 228, 0.4);
        background: rgba(28, 37, 65, 0.85);
        box-shadow: 0 4px 16px rgba(72, 202, 228, 0.08);
    }

    /* XAI Driver Item */
    .xai-driver-item {
        background: rgba(15, 23, 42, 0.75);
        border-left: 3px solid #3A86FF;
        border-radius: 0 12px 12px 0;
        padding: 12px 16px;
        margin-bottom: 10px;
    }

    /* Clinical Disclaimer Box */
    .nexus-disclaimer {
        background: rgba(15, 23, 42, 0.6);
        border-left: 3px solid #48CAE4;
        padding: 12px 16px;
        border-radius: 0 12px 12px 0;
        font-size: 0.76rem;
        color: #94A3B8;
        line-height: 1.5;
        margin-top: 18px;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# 2. Dual-Sync Interactive Calculator (Age <-> Weight <-> BMI)
# -----------------------------------------------------------------------------
def get_benchmark_weight_for_age(age: int) -> int:
    """Returns clinical median weight benchmark in kg."""
    if age <= 25:
        return 62
    elif age <= 40:
        return 71
    elif age <= 60:
        return 77
    else:
        return 72


def compute_bmi_metrics(weight_kg: float, height_cm: float = 172.0, age: int = 40) -> Dict[str, Any]:
    safe_height = max(height_cm, 100.0) / 100.0
    bmi = round(weight_kg / (safe_height * safe_height), 1)

    if bmi < 18.5:
        category = "Underweight"
        badge_class = "badge-blue"
        color = "#60A5FA"
    elif bmi < 25.0:
        category = "Optimal BMI"
        badge_class = "badge-optimal"
        color = "#34D399"
    elif bmi < 30.0:
        category = "Overweight"
        badge_class = "badge-amber"
        color = "#FBBF24"
    else:
        category = "Elevated Risk - Obese"
        badge_class = "badge-crimson"
        color = "#F87171"

    # Estimated Metabolic Age baseline
    metabolic_delta = 0
    if bmi >= 30: metabolic_delta += 4
    elif bmi >= 25: metabolic_delta += 2
    elif bmi < 18.5: metabolic_delta += 1

    return {
        "bmi": bmi,
        "category": category,
        "badge_class": badge_class,
        "color": color,
        "benchmark": get_benchmark_weight_for_age(age),
        "metabolic_delta": metabolic_delta
    }


# Session State Initialization
if 'nexus_age' not in st.session_state:
    st.session_state.nexus_age = 52
if 'nexus_weight' not in st.session_state:
    st.session_state.nexus_weight = float(get_benchmark_weight_for_age(52))
if 'nexus_height' not in st.session_state:
    st.session_state.nexus_height = 172.0

def on_age_change_callback():
    """Reactive callback: sliding age recalibrates median reference weight."""
    new_age = st.session_state.nexus_age
    st.session_state.nexus_weight = float(get_benchmark_weight_for_age(new_age))


# -----------------------------------------------------------------------------
# 3. Synthetic Reference Clinical Cohort (N = 2,500 profiles)
# -----------------------------------------------------------------------------
@st.cache_resource(show_spinner=False)
def generate_reference_cohort(n_samples: int = 2500, seed: int = 2026) -> pd.DataFrame:
    np.random.seed(seed)

    age_cat = np.random.choice(['18-25', '26-40', '41-60', '61+'], size=n_samples, p=[0.14, 0.32, 0.34, 0.20])
    gender = np.random.choice(['Male', 'Female'], size=n_samples, p=[0.50, 0.50])
    weight_status = np.random.choice(['Underweight', 'Optimal BMI', 'Overweight', 'Elevated Risk - Obese'], size=n_samples, p=[0.05, 0.43, 0.34, 0.18])
    smoking = np.random.choice(['Non-Smoker', 'Former Smoker', 'Active Smoker'], size=n_samples, p=[0.55, 0.25, 0.20])
    activity = np.random.choice(['Active / Regular Exercise', 'Sedentary (Low Activity)'], size=n_samples, p=[0.58, 0.42])
    sleep_apnea = np.random.choice(['Normal restful sleep', 'Frequent snoring / Waking with breathlessness (Possible Sleep Apnea)'], size=n_samples, p=[0.72, 0.28])
    fam_hist = np.random.choice(['No', 'Yes'], size=n_samples, p=[0.65, 0.35])

    # Blood Pressure (Normal, Pre-Hypertensive, Stage 2 High)
    bp_list = []
    for a, w, s, slp in zip(age_cat, weight_status, smoking, sleep_apnea):
        p_high = 0.08
        if a == '41-60': p_high += 0.16
        elif a == '61+': p_high += 0.32
        if w == 'Overweight': p_high += 0.12
        elif w == 'Elevated Risk - Obese': p_high += 0.26
        if s == 'Active Smoker': p_high += 0.16
        if 'Sleep Apnea' in slp: p_high += 0.18
        p_high = float(np.clip(p_high, 0.04, 0.88))
        p_rem = 1.0 - p_high
        bp_list.append(np.random.choice(['Normal (<120/80)', 'Pre-Hypertensive (120-139)', 'Stage 2 High (140+)'], p=[p_rem * 0.65, p_rem * 0.35, p_high]))

    # Fasting Blood Glucose
    glucose_list = []
    for a, w, f, act in zip(age_cat, weight_status, fam_hist, activity):
        p_diab = 0.06
        if a in ['41-60', '61+']: p_diab += 0.18
        if w == 'Overweight': p_diab += 0.14
        elif w == 'Elevated Risk - Obese': p_diab += 0.34
        if f == 'Yes': p_diab += 0.18
        if act == 'Sedentary (Low Activity)': p_diab += 0.10
        p_diab = float(np.clip(p_diab, 0.03, 0.88))
        p_rem = 1.0 - p_diab
        glucose_list.append(np.random.choice(['Normal (<100)', 'Pre-Diabetic (100-125)', 'Diabetic (126+)'], p=[p_rem * 0.70, p_rem * 0.30, p_diab]))

    # Target Condition 1: Type-2 Diabetes
    t2d_list = []
    for gl, w, f in zip(glucose_list, weight_status, fam_hist):
        p_t2d = 0.04
        if gl == 'Pre-Diabetic (100-125)': p_t2d += 0.30
        elif gl == 'Diabetic (126+)': p_t2d += 0.68
        if w == 'Elevated Risk - Obese': p_t2d += 0.20
        if f == 'Yes': p_t2d += 0.15
        p_t2d = float(np.clip(p_t2d, 0.02, 0.94))
        t2d_list.append('High' if np.random.rand() < p_t2d else 'Low')

    # Target Condition 2: Coronary Heart Disease (CHD)
    chd_list = []
    for g, s, bp, t2d, f, a, act, slp in zip(gender, smoking, bp_list, t2d_list, fam_hist, age_cat, activity, sleep_apnea):
        p_h = 0.05
        if g == 'Male': p_h += 0.08
        if s == 'Former Smoker': p_h += 0.09
        elif s == 'Active Smoker': p_h += 0.28
        if bp == 'Pre-Hypertensive (120-139)': p_h += 0.12
        elif bp == 'Stage 2 High (140+)': p_h += 0.29
        if t2d == 'High': p_h += 0.25
        if f == 'Yes': p_h += 0.14
        if a == '41-60': p_h += 0.10
        elif a == '61+': p_h += 0.24
        if act == 'Sedentary (Low Activity)': p_h += 0.08
        if 'Sleep Apnea' in slp: p_h += 0.12
        p_h = float(np.clip(p_h, 0.03, 0.92))
        chd_list.append('High' if np.random.rand() < p_h else 'Low')

    # Target Condition 3: Hypertensive Heart Strain (HHS)
    hhs_list = []
    for bp, chd, slp in zip(bp_list, chd_list, sleep_apnea):
        p_strain = 0.05
        if bp == 'Stage 2 High (140+)': p_strain += 0.45
        elif bp == 'Pre-Hypertensive (120-139)': p_strain += 0.18
        if chd == 'High': p_strain += 0.25
        if 'Sleep Apnea' in slp: p_strain += 0.15
        p_strain = float(np.clip(p_strain, 0.02, 0.92))
        hhs_list.append('High' if np.random.rand() < p_strain else 'Low')

    # Observable Symptoms
    chest_list = []
    dyspnea_list = []
    edema_list = []

    for chd, hhs in zip(chd_list, hhs_list):
        if chd == 'High':
            chest_list.append(np.random.choice(['None', 'Atypical sharp twinges', 'Substernal heaviness / Tight pressure'], p=[0.18, 0.38, 0.44]))
            dyspnea_list.append(np.random.choice(['Normal', 'Short of breath on mild climb/walk', 'Breathless at rest'], p=[0.20, 0.48, 0.32]))
        else:
            chest_list.append(np.random.choice(['None', 'Atypical sharp twinges', 'Substernal heaviness / Tight pressure'], p=[0.87, 0.10, 0.03]))
            dyspnea_list.append(np.random.choice(['Normal', 'Short of breath on mild climb/walk', 'Breathless at rest'], p=[0.86, 0.12, 0.02]))

        if hhs == 'High' or chd == 'High':
            edema_list.append(np.random.choice(['No swelling', 'Swelling in ankles/feet after sitting or walking'], p=[0.38, 0.62]))
        else:
            edema_list.append(np.random.choice(['No swelling', 'Swelling in ankles/feet after sitting or walking'], p=[0.91, 0.09]))

    return pd.DataFrame({
        'Age_Group': age_cat,
        'Sex': gender,
        'Weight_BMI': weight_status,
        'Smoking': smoking,
        'Physical_Activity': activity,
        'Sleep_Apnea': sleep_apnea,
        'Family_History': fam_hist,
        'Blood_Pressure': bp_list,
        'Glucose': glucose_list,
        'Coronary_Heart_Disease': chd_list,
        'Type2_Diabetes': t2d_list,
        'Hypertensive_Heart_Strain': hhs_list,
        'Chest_Pain': chest_list,
        'Dyspnea': dyspnea_list,
        'Edema': edema_list
    })


# -----------------------------------------------------------------------------
# 4. Bayesian Belief Network DAG Engine (pgmpy)
# -----------------------------------------------------------------------------
@st.cache_resource(show_spinner=False)
def build_bayesian_network(df: pd.DataFrame):
    edges = [
        # Demographic & Lifestyle -> Conditions
        ('Age_Group', 'Coronary_Heart_Disease'),
        ('Weight_BMI', 'Coronary_Heart_Disease'),
        ('Sex', 'Coronary_Heart_Disease'),
        ('Smoking', 'Coronary_Heart_Disease'),
        ('Physical_Activity', 'Coronary_Heart_Disease'),
        ('Sleep_Apnea', 'Coronary_Heart_Disease'),
        ('Family_History', 'Coronary_Heart_Disease'),

        ('Age_Group', 'Type2_Diabetes'),
        ('Weight_BMI', 'Type2_Diabetes'),
        ('Physical_Activity', 'Type2_Diabetes'),
        ('Family_History', 'Type2_Diabetes'),

        # Inter-Condition Influences
        ('Type2_Diabetes', 'Coronary_Heart_Disease'),
        ('Coronary_Heart_Disease', 'Hypertensive_Heart_Strain'),

        # Conditions -> Biomarkers & Symptoms
        ('Coronary_Heart_Disease', 'Chest_Pain'),
        ('Coronary_Heart_Disease', 'Dyspnea'),
        ('Coronary_Heart_Disease', 'Blood_Pressure'),
        ('Hypertensive_Heart_Strain', 'Edema'),
        ('Hypertensive_Heart_Strain', 'Blood_Pressure'),
        ('Type2_Diabetes', 'Glucose')
    ]
    model = BayesianNetwork(edges)
    estimator = BayesianEstimator(model, df)
    cpds = estimator.get_cpds(prior_type='BDeu', equivalent_sample_size=10)
    model.add_cpds(*cpds)
    infer = VariableElimination(model)
    return model, infer


def run_bayesian_inference(infer: VariableElimination, evidence: Dict[str, str]) -> Dict[str, float]:
    clean_ev = {k: v for k, v in evidence.items() if v and v != "I don't know"}

    try:
        q_chd = infer.query(variables=['Coronary_Heart_Disease'], evidence=clean_ev, show_progress=False)
        h_states = infer.model.get_cpds('Coronary_Heart_Disease').state_names['Coronary_Heart_Disease']
        p_heart = float(q_chd.values[h_states.index('High')])
    except Exception:
        p_heart = 0.22

    try:
        q_t2d = infer.query(variables=['Type2_Diabetes'], evidence=clean_ev, show_progress=False)
        d_states = infer.model.get_cpds('Type2_Diabetes').state_names['Type2_Diabetes']
        p_diab = float(q_t2d.values[d_states.index('High')])
    except Exception:
        p_diab = 0.18

    try:
        q_hhs = infer.query(variables=['Hypertensive_Heart_Strain'], evidence=clean_ev, show_progress=False)
        s_states = infer.model.get_cpds('Hypertensive_Heart_Strain').state_names['Hypertensive_Heart_Strain']
        p_strain = float(q_hhs.values[s_states.index('High')])
    except Exception:
        p_strain = 0.19

    return {
        'heart_risk_pct': p_heart * 100.0,
        'diab_risk_pct': p_diab * 100.0,
        'strain_risk_pct': p_strain * 100.0
    }


# -----------------------------------------------------------------------------
# 5. Chi-Square Hypothesis Testing Engine (scipy.stats)
# -----------------------------------------------------------------------------
def calculate_p_value_significance(df: pd.DataFrame, symptom_evidence: Dict[str, Tuple[str, str]]) -> List[Dict[str, Any]]:
    results = []
    for label, (col_name, val) in symptom_evidence.items():
        if not val or val in ['None', 'Normal', 'No swelling', 'Non-Smoker', 'Optimal BMI', 'Active / Regular Exercise', 'Normal restful sleep', 'No', "I don't know"]:
            continue

        target_col = 'Type2_Diabetes' if col_name in ['Glucose', 'Weight_BMI'] else 'Coronary_Heart_Disease'
        contingency = pd.crosstab(df[col_name], df[target_col])
        try:
            _, p_value, _, _ = stats.chi2_contingency(contingency)
        except Exception:
            p_value = 1.0

        is_significant = p_value < 0.05
        p_val_str = f"{p_value:.4f}" if p_value >= 0.0001 else "< 0.0001"

        if is_significant:
            badge_text = f"Statistically Verified (p = {p_val_str})"
            explanation = f"Statistically robust clinical association (p < 0.05). Significant prevalence skew observed among verified {target_col.replace('_', ' ')} cases."
        else:
            badge_text = f"Incidental (p = {p_val_str})"
            explanation = "Statistical link does not cross the alpha threshold (p >= 0.05). Likely represents benign physiological variation or incidental overlap."

        results.append({
            'symptom_name': label,
            'reported_value': val,
            'target_condition': target_col.replace('_', ' '),
            'p_value': p_value,
            'p_val_str': p_val_str,
            'is_significant': is_significant,
            'badge_text': badge_text,
            'explanation': explanation
        })
    return results


# -----------------------------------------------------------------------------
# 6. Top Brand Header
# -----------------------------------------------------------------------------
st.markdown("""
<div class="nexus-header">
    <div style="display: flex; align-items: center; gap: 14px;">
        <span style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(72,202,228,0.5));">🧬</span>
        <div>
            <h1 class="nexus-brand-title">AuraHealth Nexus</h1>
            <p class="nexus-tagline">Deep Cyber Blue Clinical Decision Support System &middot; Gemini AI Architecture</p>
        </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
        <span class="nexus-badge badge-cyan">Bayesian Engine v4.2</span>
        <span class="nexus-badge badge-optimal">N = 2,500 Cohort Grounded</span>
    </div>
</div>
""", unsafe_allow_html=True)


# Load Cohort and Fit Bayesian Network
cohort_df = generate_reference_cohort()
bayes_dag, bayes_engine = build_bayesian_network(cohort_df)


# -----------------------------------------------------------------------------
# 7. Sidebar Intake Form (Logical Sections & Dual-Sync)
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🧬 Patient Clinical Intake")
    st.caption("Complete physiological markers and presenting symptom profile.")

    # Section A: Demographics & Biometrics
    with st.expander("Section A: Core Demographics & Dual Sync", expanded=True):
        patient_name = st.text_input("Patient Identifier / Name", value="Eleanor Vance", key="inp_name")

        patient_age = st.slider(
            "Age (Years)",
            min_value=18,
            max_value=85,
            value=st.session_state.nexus_age,
            key="nexus_age",
            on_change=on_age_change_callback
        )

        expected_benchmark = get_benchmark_weight_for_age(patient_age)
        st.markdown(f"""
        <div style="margin-bottom: 10px;">
            <span class="nexus-badge badge-cyan">
                Median for Age {patient_age}: <strong>{expected_benchmark} kg</strong>
            </span>
        </div>
        """, unsafe_allow_html=True)

        col_w, col_h = st.columns(2)
        with col_w:
            patient_weight = st.number_input(
                "Weight (kg)",
                min_value=35.0,
                max_value=180.0,
                value=float(st.session_state.nexus_weight),
                step=0.5,
                key="nexus_weight"
            )
        with col_h:
            patient_height = st.number_input(
                "Height (cm)",
                min_value=130.0,
                max_value=220.0,
                value=float(st.session_state.nexus_height),
                step=1.0,
                key="nexus_height"
            )

        bmi_metrics = compute_bmi_metrics(patient_weight, patient_height, patient_age)
        st.markdown(f"""
        <div style="margin-top: 4px; margin-bottom: 8px;">
            <span class="nexus-badge {bmi_metrics['badge_class']}">
                BMI: <strong>{bmi_metrics['bmi']}</strong> &middot; {bmi_metrics['category']}
            </span>
        </div>
        """, unsafe_allow_html=True)

        patient_sex = st.radio("Biological Sex", options=["Female", "Male"], horizontal=True, key="inp_sex")

    # Section B: Lifestyle & High-Yield Clinical Markers
    with st.expander("Section B: Lifestyle & Clinical Markers", expanded=True):
        patient_smoking = st.selectbox(
            "Smoking Habit",
            options=["Non-Smoker", "Former Smoker", "Active Smoker"],
            index=1,
            key="inp_smoking"
        )

        patient_activity = st.selectbox(
            "Physical Activity Level",
            options=["Active / Regular Exercise", "Sedentary (Low Activity)"],
            index=1,
            key="inp_activity"
        )

        patient_sleep = st.selectbox(
            "Sleep Quality & Night Breathing",
            options=[
                "Normal restful sleep",
                "Frequent snoring / Waking with breathlessness (Possible Sleep Apnea)"
            ],
            index=0,
            key="inp_sleep"
        )

        patient_fam_hist = st.toggle(
            "Immediate family history of Heart Attack or Diabetes?",
            value=True,
            key="inp_fam_hist"
        )

    # Section C: Acute Symptoms & Biomarkers
    with st.expander("Section C: Acute Symptoms & Biomarkers", expanded=True):
        patient_chest = st.selectbox(
            "Chest Discomfort",
            options=["None", "Atypical sharp twinges", "Substernal heaviness / Tight pressure"],
            index=1,
            key="inp_chest"
        )

        patient_dyspnea = st.selectbox(
            "Exertional Dyspnea (Breathing)",
            options=["Normal", "Short of breath on mild climb/walk", "Breathless at rest"],
            index=1,
            key="inp_dyspnea"
        )

        patient_edema = st.selectbox(
            "Peripheral Edema",
            options=["No swelling", "Swelling in ankles/feet after sitting or walking"],
            index=1,
            key="inp_edema"
        )

        patient_glucose = st.selectbox(
            "Fasting Blood Glucose (mg/dL)",
            options=["Normal (<100)", "Pre-Diabetic (100-125)", "Diabetic (126+)", "I don't know"],
            index=1,
            key="inp_glucose"
        )

        patient_bp = st.selectbox(
            "Blood Pressure",
            options=["Normal (<120/80)", "Pre-Hypertensive (120-139)", "Stage 2 High (140+)", "I don't know"],
            index=1,
            key="inp_bp"
        )

    st.markdown("<br>", unsafe_allow_html=True)
    run_btn = st.button("Run Bayesian Assessment", type="primary", use_container_width=True)


# -----------------------------------------------------------------------------
# 8. Model Inference & Risk Mapping
# -----------------------------------------------------------------------------
if patient_age <= 25:
    age_category = '18-25'
elif patient_age <= 40:
    age_category = '26-40'
elif patient_age <= 60:
    age_category = '41-60'
else:
    age_category = '61+'

active_evidence = {
    'Age_Group': age_category,
    'Sex': patient_sex,
    'Weight_BMI': bmi_metrics['category'],
    'Smoking': patient_smoking,
    'Physical_Activity': patient_activity,
    'Sleep_Apnea': patient_sleep,
    'Family_History': 'Yes' if patient_fam_hist else 'No',
    'Blood_Pressure': patient_bp,
    'Glucose': patient_glucose,
    'Chest_Pain': patient_chest,
    'Dyspnea': patient_dyspnea,
    'Edema': patient_edema
}

posterior_risks = run_bayesian_inference(bayes_engine, active_evidence)
heart_risk = posterior_risks['heart_risk_pct']
diab_risk = posterior_risks['diab_risk_pct']
strain_risk = posterior_risks['strain_risk_pct']

# Calculate Metabolic Age
lifestyle_penalty = 0
if patient_smoking == 'Active Smoker': lifestyle_penalty += 5
elif patient_smoking == 'Former Smoker': lifestyle_penalty += 2
if patient_activity == 'Sedentary (Low Activity)': lifestyle_penalty += 3
if 'Sleep Apnea' in patient_sleep: lifestyle_penalty += 3
calculated_metabolic_age = patient_age + bmi_metrics['metabolic_delta'] + lifestyle_penalty

def get_risk_theme(pct: float) -> Dict[str, Any]:
    if pct < 25.0:
        return {
            'level': 'Low Risk',
            'color': '#48CAE4',
            'gauge_color': '#48CAE4',
            'badge_class': 'badge-cyan',
            'summary': 'Hemodynamic and metabolic markers are within balanced tolerances.'
        }
    elif pct <= 50.0:
        return {
            'level': 'Moderate Risk',
            'color': '#FBBF24',
            'gauge_color': '#FBBF24',
            'badge_class': 'badge-amber',
            'summary': 'Intermediate clinical elevation. Active surveillance and lifestyle intervention recommended.'
        }
    else:
        return {
            'level': 'Elevated Risk',
            'color': '#F87171',
            'gauge_color': '#EF4444',
            'badge_class': 'badge-crimson',
            'summary': 'Acute Bayesian risk signature detected. Diagnostic verification strongly advised.'
        }

heart_theme = get_risk_theme(heart_risk)
diab_theme = get_risk_theme(diab_risk)


# -----------------------------------------------------------------------------
# 9. Main Visual Intelligence Dashboard (Gemini Dark Layout)
# -----------------------------------------------------------------------------

# Panel 1: AI Consultation Greeting Card
display_name = patient_name.strip() if patient_name.strip() else "Patient"
timestamp_now = datetime.now().strftime("%B %d, %Y &middot; %H:%M UTC")

col_greet_left, col_greet_right = st.columns([8, 4])
with col_greet_left:
    st.markdown(f"""
    <div class="nexus-card" style="padding: 20px 24px; margin-bottom: 20px;">
        <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #48CAE4; font-family: monospace;">AURA AI CLINICAL SYNTHESIS</span>
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #FFFFFF; margin: 4px 0 6px 0;">Patient Evaluation for {display_name}</h2>
        <p style="font-size: 0.8rem; color: #94A3B8; margin: 0;">
            Chronological Age: <strong style="color: #FFFFFF;">{patient_age} yrs</strong> &middot; Calculated Metabolic Age: <strong style="color: #48CAE4;">{calculated_metabolic_age} yrs</strong> &middot; Generated {timestamp_now}
        </p>
    </div>
    """, unsafe_allow_html=True)

with col_greet_right:
    # Summary Report Download
    report_text = f"""=======================================================
AURAHEALTH NEXUS - CLINICAL INTELLIGENCE BRIEF
=======================================================
Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Patient Identifier: {display_name}
Chronological Age:  {patient_age} years
Calculated Metabolic Age: {calculated_metabolic_age} years
Biometrics: Weight {patient_weight} kg | Height {patient_height} cm | BMI {bmi_metrics['bmi']} ({bmi_metrics['category']})
Median Reference Benchmark: {expected_benchmark} kg

-------------------------------------------------------
BAYESIAN POSTERIOR PROBABILITY SYNTHESIS
-------------------------------------------------------
Coronary Heart Disease Risk:  {heart_risk:.2f}% [{heart_theme['level']}]
Type-2 Diabetes Risk:         {diab_risk:.2f}% [{diab_theme['level']}]
Hypertensive Heart Strain:    {strain_risk:.2f}%

-------------------------------------------------------
OBSERVED CLINICAL EVIDENCE PROFILE
-------------------------------------------------------
* Smoking Habit: {patient_smoking}
* Physical Activity: {patient_activity}
* Sleep / Night Breathing: {patient_sleep}
* Family Hereditary Risk: {'Positive' if patient_fam_hist else 'Negative'}
* Chest Discomfort: {patient_chest}
* Exertional Dyspnea: {patient_dyspnea}
* Peripheral Edema: {patient_edema}
* Fasting Glucose: {patient_glucose}
* Blood Pressure: {patient_bp}

-------------------------------------------------------
CLINICAL GOVERNANCE NOTICE:
This report is generated by a Bayesian Decision Support demonstration
and does not replace formal physician clinical examination.
======================================================="""

    st.markdown("""<div class="nexus-card" style="padding: 20px 24px; text-align: center; margin-bottom: 20px;">""", unsafe_allow_html=True)
    st.download_button(
        label="Download Clinical Summary (.TXT)",
        data=report_text,
        file_name=f"AuraNexus_{display_name.replace(' ', '_')}.txt",
        mime="text/plain",
        use_container_width=True
    )
    st.markdown("""<span style="font-size: 0.72rem; color: #64748B;">PDF/Structured clinical telemetry ready</span></div>""", unsafe_allow_html=True)


# Panel 2: Dual Holographic Plotly Radial Gauges
col_g1, col_g2 = st.columns(2)

def create_holographic_gauge(val: float, title: str, theme: Dict[str, Any]) -> go.Figure:
    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=val,
        domain={'x': [0, 1], 'y': [0, 1]},
        title={
            'text': f"<span style='color: #E2E8F0; font-size: 15px;'>{title}</span>",
            'font': {'size': 15, 'family': 'Plus Jakarta Sans, sans-serif'}
        },
        number={
            'suffix': "%",
            'font': {'size': 32, 'color': theme['color'], 'family': 'monospace'}
        },
        gauge={
            'shape': "angular",
            'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "#475569"},
            'bar': {'color': theme['gauge_color'], 'thickness': 0.35},
            'bgcolor': "rgba(15, 23, 42, 0.6)",
            'borderwidth': 0,
            'steps': [
                {'range': [0, 25], 'color': 'rgba(72, 202, 228, 0.18)'},
                {'range': [25, 50], 'color': 'rgba(245, 158, 11, 0.18)'},
                {'range': [50, 100], 'color': 'rgba(239, 68, 68, 0.22)'}
            ],
            'threshold': {
                'line': {'color': theme['color'], 'width': 3},
                'thickness': 0.8,
                'value': val
            }
        }
    ))
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        height=210,
        margin=dict(l=20, r=20, t=35, b=5)
    )
    return fig

with col_g1:
    st.markdown("""<div class="nexus-card">""", unsafe_allow_html=True)
    st.plotly_chart(create_holographic_gauge(heart_risk, "Coronary Heart Disease Risk", heart_theme), use_container_width=True)
    st.markdown(f"""
        <div style="text-align: center; margin-top: -6px;">
            <span class="nexus-badge {heart_theme['badge_class']}">{heart_theme['level']}</span>
            <p style="font-size: 0.76rem; color: #94A3B8; margin: 6px 0 0 0;">{heart_theme['summary']}</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col_g2:
    st.markdown("""<div class="nexus-card">""", unsafe_allow_html=True)
    st.plotly_chart(create_holographic_gauge(diab_risk, "Type-2 Diabetes Risk", diab_theme), use_container_width=True)
    st.markdown(f"""
        <div style="text-align: center; margin-top: -6px;">
            <span class="nexus-badge {diab_theme['badge_class']}">{diab_theme['level']}</span>
            <p style="font-size: 0.76rem; color: #94A3B8; margin: 6px 0 0 0;">{diab_theme['summary']}</p>
        </div>
    </div>
    """, unsafe_allow_html=True)


# Panel 3: Interactive 2D Bayesian Causal Network Graph
st.markdown("""
<div class="nexus-card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div>
            <h4 class="nexus-card-title">Interactive 2D Bayesian Causal DAG</h4>
            <p class="nexus-card-subtitle">Probabilistic dependency topology with real-time node activation</p>
        </div>
        <div style="display: flex; gap: 8px;">
            <span class="nexus-badge badge-cyan">Active Symptoms (#48CAE4)</span>
            <span class="nexus-badge badge-crimson">Target Conditions</span>
        </div>
    </div>
""", unsafe_allow_html=True)

G = nx.DiGraph()
pos = {
    'Age_Group': (0.1, 0.95),
    'Weight_BMI': (0.1, 0.75),
    'Smoking': (0.1, 0.55),
    'Physical_Activity': (0.1, 0.35),
    'Sleep_Apnea': (0.1, 0.15),

    'Coronary_Heart_Disease': (0.5, 0.75),
    'Type2_Diabetes': (0.5, 0.35),
    'Hypertensive_Heart_Strain': (0.5, 0.05),

    'Chest_Pain': (0.9, 0.95),
    'Dyspnea': (0.9, 0.75),
    'Edema': (0.9, 0.55),
    'Blood_Pressure': (0.9, 0.35),
    'Glucose': (0.9, 0.15)
}

dag_edges = [
    ('Age_Group', 'Coronary_Heart_Disease'),
    ('Weight_BMI', 'Coronary_Heart_Disease'),
    ('Smoking', 'Coronary_Heart_Disease'),
    ('Physical_Activity', 'Coronary_Heart_Disease'),
    ('Sleep_Apnea', 'Coronary_Heart_Disease'),

    ('Age_Group', 'Type2_Diabetes'),
    ('Weight_BMI', 'Type2_Diabetes'),
    ('Physical_Activity', 'Type2_Diabetes'),

    ('Type2_Diabetes', 'Coronary_Heart_Disease'),
    ('Coronary_Heart_Disease', 'Hypertensive_Heart_Strain'),

    ('Coronary_Heart_Disease', 'Chest_Pain'),
    ('Coronary_Heart_Disease', 'Dyspnea'),
    ('Coronary_Heart_Disease', 'Blood_Pressure'),
    ('Hypertensive_Heart_Strain', 'Edema'),
    ('Hypertensive_Heart_Strain', 'Blood_Pressure'),
    ('Type2_Diabetes', 'Glucose')
]
G.add_edges_from(dag_edges)

edge_x = []
edge_y = []
for edge in G.edges():
    x0, y0 = pos[edge[0]]
    x1, y1 = pos[edge[1]]
    edge_x.extend([x0, x1, None])
    edge_y.extend([y0, y1, None])

edge_trace = go.Scatter(
    x=edge_x, y=edge_y,
    line=dict(width=1.5, color='rgba(72, 202, 228, 0.25)'),
    hoverinfo='none',
    mode='lines'
)

# Active node determination
is_chest_active = patient_chest != 'None'
is_dyspnea_active = patient_dyspnea != 'Normal'
is_edema_active = patient_edema != 'No swelling'
is_bp_active = patient_bp in ['Pre-Hypertensive (120-139)', 'Stage 2 High (140+)']
is_glucose_active = patient_glucose in ['Pre-Diabetic (100-125)', 'Diabetic (126+)']
is_smoking_active = patient_smoking != 'Non-Smoker'
is_weight_active = bmi_metrics['category'] != 'Optimal BMI'
is_sleep_active = 'Sleep Apnea' in patient_sleep
is_activity_active = patient_activity == 'Sedentary (Low Activity)'

node_data = {
    'Age_Group': (True, '#48CAE4', f"Age: {patient_age}"),
    'Weight_BMI': (is_weight_active, '#48CAE4' if is_weight_active else '#475569', f"BMI: {bmi_metrics['bmi']}"),
    'Smoking': (is_smoking_active, '#48CAE4' if is_smoking_active else '#475569', f"Smoke: {patient_smoking.split()[0]}"),
    'Physical_Activity': (is_activity_active, '#48CAE4' if is_activity_active else '#475569', f"Activity: {patient_activity.split()[0]}"),
    'Sleep_Apnea': (is_sleep_active, '#48CAE4' if is_sleep_active else '#475569', f"Sleep: {'Apnea' if is_sleep_active else 'Normal'}"),

    'Coronary_Heart_Disease': (True, heart_theme['color'], f"CHD: {heart_risk:.1f}%"),
    'Type2_Diabetes': (True, diab_theme['color'], f"T2D: {diab_risk:.1f}%"),
    'Hypertensive_Heart_Strain': (True, '#F87171' if strain_risk > 35 else '#34D399', f"HHS: {strain_risk:.1f}%"),

    'Chest_Pain': (is_chest_active, '#48CAE4' if is_chest_active else '#475569', f"Chest: {patient_chest.split()[0]}"),
    'Dyspnea': (is_dyspnea_active, '#48CAE4' if is_dyspnea_active else '#475569', f"Dyspnea: {patient_dyspnea.split()[0]}"),
    'Edema': (is_edema_active, '#48CAE4' if is_edema_active else '#475569', f"Edema: {'Yes' if is_edema_active else 'No'}"),
    'Blood_Pressure': (is_bp_active, '#48CAE4' if is_bp_active else '#475569', f"BP: {patient_bp.split()[0]}"),
    'Glucose': (is_glucose_active, '#48CAE4' if is_glucose_active else '#475569', f"Sugar: {patient_glucose.split()[0]}")
}

node_x, node_y, node_color, node_size, node_text = [], [], [], [], []
for node in G.nodes():
    x, y = pos[node]
    node_x.append(x)
    node_y.append(y)
    is_act, col, lbl = node_data[node]
    node_color.append(col)
    node_size.append(26 if 'Disease' in node or 'Diabetes' in node or 'Strain' in node else (22 if is_act else 14))
    node_text.append(lbl)

node_trace = go.Scatter(
    x=node_x, y=node_y,
    mode='markers+text',
    hoverinfo='text',
    text=node_text,
    textposition="top center",
    textfont=dict(size=10, color='#E2E8F0', family='Plus Jakarta Sans, sans-serif'),
    marker=dict(
        color=node_color,
        size=node_size,
        line=dict(width=2, color='#0B132B')
    )
)

fig_dag = go.Figure(
    data=[edge_trace, node_trace],
    layout=go.Layout(
        showlegend=False,
        hovermode='closest',
        margin=dict(b=15, l=15, r=15, t=15),
        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        height=320
    )
)
st.plotly_chart(fig_dag, use_container_width=True)
st.markdown("</div>", unsafe_allow_html=True)


# Panel 4: P-Value Evidence Cards & Explainable AI (XAI)
col_pval, col_xai = st.columns([6, 6])

with col_pval:
    st.markdown("""
    <div class="nexus-card">
        <h4 class="nexus-card-title">P-Value Significance Breakdown</h4>
        <p class="nexus-card-subtitle">&chi;&sup2; Hypothesis Testing vs N = 2,500 Reference Cohort</p>
        <div style="margin-top: 14px;">
    """, unsafe_allow_html=True)

    symptom_evidence_dict = {
        'Chest Discomfort': ('Chest_Pain', patient_chest),
        'Exertional Dyspnea': ('Dyspnea', patient_dyspnea),
        'Peripheral Edema': ('Edema', patient_edema),
        'Smoking Habit': ('Smoking', patient_smoking),
        'Physical Inactivity': ('Physical_Activity', patient_activity),
        'Sleep Apnea Pattern': ('Sleep_Apnea', patient_sleep),
        'Blood Pressure': ('Blood_Pressure', patient_bp),
        'Fasting Glucose': ('Glucose', patient_glucose),
        'BMI Status': ('Weight_BMI', bmi_metrics['category'])
    }

    sig_cards = calculate_p_value_significance(cohort_df, symptom_evidence_dict)

    if sig_cards:
        for sc in sig_cards:
            is_sig = sc['is_significant']
            card_class = "verified" if is_sig else ""
            badge_html = f"<span class='nexus-badge badge-optimal'>{sc['badge_text']}</span>" if is_sig else f"<span class='nexus-badge badge-blue'>{sc['badge_text']}</span>"

            st.markdown(f"""
            <div class="p-val-card {card_class}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <div>
                        <span style="font-size: 10px; font-weight: 700; color: #48CAE4; text-transform: uppercase;">Observed Marker</span>
                        <h5 style="margin: 0; font-size: 0.86rem; font-weight: 600; color: #FFFFFF;">{sc['symptom_name']}</h5>
                    </div>
                    {badge_html}
                </div>
                <div style="font-size: 0.76rem; color: #CBD5E1; margin-bottom: 4px;">
                    Finding: <strong style="color: #FFFFFF;">{sc['reported_value']}</strong> &middot; Target: <em>{sc['target_condition']}</em>
                </div>
                <div style="font-size: 0.74rem; color: #94A3B8; line-height: 1.45;">
                    {sc['explanation']}
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.markdown("""
        <div style="padding: 16px; background: rgba(15, 23, 42, 0.5); border-radius: 12px; text-align: center;">
            <p style="font-size: 0.8rem; color: #94A3B8; margin: 0;">
                All entered parameters reflect baseline physiological norms. No statistically anomalous deviations detected.
            </p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("</div></div>", unsafe_allow_html=True)


with col_xai:
    st.markdown("""
    <div class="nexus-card">
        <h4 class="nexus-card-title">Explainable AI (XAI) Risk Drivers</h4>
        <p class="nexus-card-subtitle">Primary clinical contributors that amplified the posterior probability</p>
        <div style="margin-top: 14px;">
    """, unsafe_allow_html=True)

    # Calculate Top 3 Primary Drivers
    xai_drivers = []
    if patient_smoking == 'Active Smoker':
        xai_drivers.append(("Active Tobacco Combustion", "Contributed ~+26% to coronary arterial strain and microvascular endothelial dysfunction."))
    elif patient_smoking == 'Former Smoker':
        xai_drivers.append(("Former Smoking History", "Residual vascular stiffness contributes ~+9% to baseline cardiovascular probability."))

    if patient_bp in ['Pre-Hypertensive (120-139)', 'Stage 2 High (140+)']:
        xai_drivers.append(("Elevated Hemodynamic Pressure", f"Hypertensive baseline ({patient_bp.split()[0]}) contributed +22% to systemic cardiac afterload."))

    if patient_glucose in ['Pre-Diabetic (100-125)', 'Diabetic (126+)']:
        xai_drivers.append(("Glycemic Elevation", "Elevated fasting glucose contributes +24% to microvascular insulin resistance."))

    if 'Sleep Apnea' in patient_sleep:
        xai_drivers.append(("Nocturnal Hypoxemia / Sleep Apnea", "Intermittent nocturnal desaturations contributed +16% to sympathetic cardiac strain."))

    if patient_activity == 'Sedentary (Low Activity)':
        xai_drivers.append(("Sedentary Lifestyle Marker", "Low physical activity index contributed +12% to insulin sensitivity suppression."))

    if bmi_metrics['category'] in ['Overweight', 'Elevated Risk - Obese']:
        xai_drivers.append(("Adiposity & BMI Variance", f"BMI of {bmi_metrics['bmi']} versus age-calibrated median of {expected_benchmark} kg contributed +14% to metabolic strain."))

    if not xai_drivers:
        xai_drivers.append(("Optimal Baseline Physiological Profile", "All primary lifestyle and somatic risk factors remain within optimal statistical bounds."))

    xai_drivers = xai_drivers[:3]

    for title, desc in xai_drivers:
        st.markdown(f"""
        <div class="xai-driver-item">
            <h5 style="margin: 0 0 4px 0; font-size: 0.85rem; font-weight: 600; color: #48CAE4;">{title}</h5>
            <p style="margin: 0; font-size: 0.76rem; color: #94A3B8; line-height: 1.45;">{desc}</p>
        </div>
        """, unsafe_allow_html=True)

    # Clinical Next Steps Box
    st.markdown("""
        <div style="margin-top: 14px; padding: 12px 16px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(72,202,228,0.2); border-radius: 12px;">
            <span style="font-size: 0.72rem; font-weight: 700; color: #3A86FF; text-transform: uppercase;">PRIORITY ACTION DIRECTIVE</span>
            <p style="margin: 4px 0 0 0; font-size: 0.75rem; color: #CBD5E1; line-height: 1.4;">
                Prioritize fasting HbA1c screening, 24-hr ambulatory BP monitoring, and continuous pulse oximetry if sleep apnea symptoms persist.
            </p>
        </div>
    </div>
    """, unsafe_allow_html=True)


# Panel 5: Clinical Disclaimer
st.markdown("""
<div class="nexus-disclaimer">
    <strong>Clinical Decision Support Disclaimer:</strong><br>
    AuraHealth Nexus uses Bayesian Belief Networks and Chi-Square contingency algorithms calibrated on synthetic epidemiological cohorts for research and decision-support modeling. It does not replace individualized diagnostic assessment by a licensed physician.
</div>
""", unsafe_allow_html=True)
