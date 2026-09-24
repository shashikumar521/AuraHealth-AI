"""
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
        # Age contribution
        if a == 'Middle-aged (35-60)':
            base_p += 0.20
        elif a == 'Senior (>60)':
            base_p += 0.42

        # BMI contribution
        if b == 'Overweight (25-30)':
            base_p += 0.12
        elif b == 'Obese (>30)':
            base_p += 0.26

        # Smoking contribution
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
        # Age contribution
        if a == 'Middle-aged (35-60)':
            base_p += 0.10
        elif a == 'Senior (>60)':
            base_p += 0.22

        # BMI contribution
        if b == 'Overweight (25-30)':
            base_p += 0.14
        elif b == 'Obese (>30)':
            base_p += 0.34

        # Family history contribution
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
    # Chest_Pain: P(Chest_Pain | CAD)
    chest_pain_list = []
    for cad_val in cad_list:
        if cad_val == 'Yes':
            p_cp = [0.18, 0.34, 0.48]  # ['None', 'Atypical', 'Typical_Angina']
        else:
            p_cp = [0.82, 0.15, 0.03]
        cp_val = np.random.choice(['None', 'Atypical', 'Typical_Angina'], p=p_cp)
        chest_pain_list.append(cp_val)

    # Dyspnea: P(Dyspnea | CAD, Hypertension)
    dyspnea_list = []
    for cad_val, htn_val in zip(cad_list, htn_list):
        if cad_val == 'Yes' and htn_val == 'Yes':
            p_dys = [0.15, 0.45, 0.40]  # ['Absent', 'Mild', 'Severe']
        elif cad_val == 'Yes' and htn_val == 'No':
            p_dys = [0.38, 0.44, 0.18]
        elif cad_val == 'No' and htn_val == 'Yes':
            p_dys = [0.58, 0.32, 0.10]
        else:
            p_dys = [0.85, 0.12, 0.03]
        dys_val = np.random.choice(['Absent', 'Mild', 'Severe'], p=p_dys)
        dyspnea_list.append(dys_val)

    # Fasting_Glucose: P(Fasting_Glucose | Diabetes_T2)
    glucose_list = []
    for dm_val in dm_list:
        if dm_val == 'Yes':
            p_glu = [0.06, 0.28, 0.66]  # ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)']
        else:
            p_glu = [0.82, 0.16, 0.02]
        glu_val = np.random.choice(
            ['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)'],
            p=p_glu
        )
        glucose_list.append(glu_val)

    # Resting_ECG: P(Resting_ECG | CAD, Hypertension)
    ecg_list = []
    for cad_val, htn_val in zip(cad_list, htn_list):
        if cad_val == 'Yes' and htn_val == 'Yes':
            p_ecg = [0.14, 0.48, 0.38]  # ['Normal', 'ST_T_Abnormality', 'Hypertrophy']
        elif cad_val == 'Yes' and htn_val == 'No':
            p_ecg = [0.32, 0.52, 0.16]
        elif cad_val == 'No' and htn_val == 'Yes':
            p_ecg = [0.50, 0.22, 0.28]
        else:
            p_ecg = [0.84, 0.11, 0.05]
        ecg_val = np.random.choice(['Normal', 'ST_T_Abnormality', 'Hypertrophy'], p=p_ecg)
        ecg_list.append(ecg_val)

    # Fatigue: P(Fatigue | Diabetes_T2, CAD)
    fatigue_list = []
    for dm_val, cad_val in zip(dm_list, cad_list):
        if dm_val == 'Yes' and cad_val == 'Yes':
            p_fat = [0.18, 0.82]  # ['Normal', 'Chronic_Exhaustion']
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

    # Strict categorization matching the domain definitions
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


if __name__ == '__main__':
    clinical_df = generate_synthetic_clinical_data(3500)
    print("Generated synthetic clinical cohort with shape:", clinical_df.shape)
    print("\nPrevalence Overview:")
    print("Hypertension:", clinical_df['Hypertension'].value_counts(normalize=True).to_dict())
    print("Diabetes T2: ", clinical_df['Diabetes_T2'].value_counts(normalize=True).to_dict())
    print("CAD:         ", clinical_df['CAD'].value_counts(normalize=True).to_dict())
