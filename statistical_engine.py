"""
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
    """
    Computes Odds Ratio (OR) and 95% Confidence Interval for patient's state
    vs all alternative states against target disease presence ('Yes').

    Contingency 2x2:
                    Disease Yes     Disease No
    State Match:         a              b
    State Mismatch:      c              d

    Applies Haldane-Anscombe correction (+0.5) if any cell is zero.
    """
    mask_state = (df[evidence_var] == patient_state)
    mask_disease = (df[target_disease] == 'Yes')

    a = float(np.sum(mask_state & mask_disease))
    b = float(np.sum(mask_state & ~mask_disease))
    c = float(np.sum(~mask_state & mask_disease))
    d = float(np.sum(~mask_state & ~mask_disease))

    # Apply Haldane-Anscombe correction if any cell is 0
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
    """
    Evaluates the statistical association between patient intake findings and the target disease.

    For each non-null observed evidence variable:
    1. Builds a contingency matrix against the target disease ('No' vs 'Yes').
    2. Runs Chi-Square Test of Independence (scipy.stats.chi2_contingency).
    3. Calculates Odds Ratio and 95% Wald Confidence Intervals.
    4. Applies Neyman-Pearson / Fisherian hypothesis decision rule at alpha=0.05.
    5. Returns a structured clinical diagnostic summary DataFrame.
    """
    records = []

    for evidence_var, patient_state in evidence_dict.items():
        if evidence_var == target_disease or patient_state is None:
            continue

        if evidence_var not in df.columns:
            continue

        patient_state_str = str(patient_state).strip()

        # Build Contingency Table (Rows: evidence states, Columns: disease states)
        contingency = pd.crosstab(df[evidence_var], df[target_disease])

        # Chi-Square Test of Independence
        try:
            chi2_stat, p_val, dof, _ = stats.chi2_contingency(contingency, correction=True)
        except Exception:
            chi2_stat, p_val, dof = 0.0, 1.0, 1

        # Odds Ratio for the observed patient state specifically
        odds_ratio, or_low, or_high = compute_odds_ratio_with_ci(
            df, evidence_var, patient_state_str, target_disease, alpha
        )

        # Hypothesis decision
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

    if result_df.empty:
        return pd.DataFrame(columns=[
            'Observed Evidence',
            'Patient State',
            'Chi2 Stat',
            'Degrees of Freedom',
            'p-value',
            'Odds Ratio (95% CI)',
            'Significance (alpha=0.05)',
            'Clinical Interpretation'
        ])

    # Sort primarily by statistical significance (lowest p-value first)
    result_df.sort_values(by='p-value', ascending=True, inplace=True)
    result_df.reset_index(drop=True, inplace=True)
    return result_df


if __name__ == '__main__':
    from synthetic_data import generate_synthetic_clinical_data

    sample_df = generate_synthetic_clinical_data(3500)
    sample_intake = {
        'Age': 'Senior (>60)',
        'Smoking': 'Current-smoker',
        'Chest_Pain': 'Typical_Angina',
        'Dyspnea': 'Severe',
        'Resting_ECG': 'Hypertrophy'
    }

    stat_summary = evaluate_evidence_significance(sample_df, sample_intake, target_disease='CAD')
    print("Statistical Evidence Evaluation against CAD:\n")
    print(stat_summary[['Observed Evidence', 'Patient State', 'Chi2 Stat', 'p-value', 'Significance (alpha=0.05)']])
