"""
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
        # Fallback for older pgmpy versions
        from pgmpy.models import BayesianModel as BayesianNetwork

from pgmpy.estimators import BayesianEstimator
from pgmpy.inference import VariableElimination
from synthetic_data import generate_synthetic_clinical_data


class ClinicalBayesianEngine:
    """
    Hospital-grade Bayesian Network Clinical Decision Support Engine.
    Encapsulates DAG structure, CPD fitting with BDeu priors, and exact Variable Elimination inference.
    """

    EDGES = [
        # Demographic/Risk -> Intermediate Diseases
        ('Age', 'Hypertension'),
        ('BMI_Category', 'Hypertension'),
        ('Smoking', 'Hypertension'),

        ('Age', 'Diabetes_T2'),
        ('BMI_Category', 'Diabetes_T2'),
        ('Family_History', 'Diabetes_T2'),

        # CAD Causal Parents
        ('Smoking', 'CAD'),
        ('Hypertension', 'CAD'),
        ('Diabetes_T2', 'CAD'),
        ('Gender', 'CAD'),

        # Leaf Manifestations of CAD
        ('CAD', 'Chest_Pain'),
        ('CAD', 'Dyspnea'),
        ('CAD', 'Resting_ECG'),
        ('CAD', 'Fatigue'),

        # Manifestations of Hypertension
        ('Hypertension', 'Dyspnea'),
        ('Hypertension', 'Resting_ECG'),

        # Manifestations of Diabetes
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
        """
        Estimate Conditional Probability Distributions (CPDs) using BayesianEstimator
        with BDeu pseudo-counts (equivalent sample size = 10) to prevent zero-probability states.
        """
        estimator = BayesianEstimator(self.model, self.df)
        cpds = estimator.get_cpds(prior_type='BDeu', equivalent_sample_size=10)
        self.model.add_cpds(*cpds)

        if not self.model.check_model():
            raise ValueError("Bayesian Network specification failed consistency check.")

    def _compute_priors(self) -> Dict[str, Dict[str, float]]:
        """Compute unconditional baseline prior probabilities for all target disease nodes."""
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
                # Fallback to empirical reference data
                counts = self.df[target].value_counts(normalize=True)
                priors[target] = {state: float(counts.get(state, 0.0)) for state in self.VALID_DOMAINS[target]}
        return priors

    def sanitize_evidence(self, evidence_dict: Dict[str, Any]) -> Dict[str, str]:
        """
        Filter and validate evidence against known DAG node names and domain states.
        Discards None, empty strings, and invalid categories to prevent inference crashes.
        """
        clean_evidence = {}
        for node, val in evidence_dict.items():
            if node in self.VALID_DOMAINS and val is not None:
                str_val = str(val).strip()
                if str_val in self.VALID_DOMAINS[node]:
                    clean_evidence[node] = str_val
        return clean_evidence

    def predict_patient(self, evidence_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compute posterior distributions for CAD, Diabetes_T2, and Hypertension given patient evidence.

        Parameters:
            evidence_dict: Dictionary mapping node names to categorical states.

        Returns:
            Dictionary containing:
            - 'posteriors': {disease: {'Yes': float, 'No': float}}
            - 'priors': baseline prior probabilities
            - 'active_evidence': validated evidence used in calculation
            - 'risk_delta': posterior['Yes'] - prior['Yes']
        """
        clean_evidence = self.sanitize_evidence(evidence_dict)
        results = {
            'posteriors': {},
            'priors': self.prior_probabilities,
            'active_evidence': clean_evidence,
            'risk_delta': {}
        }

        target_nodes = ['CAD', 'Diabetes_T2', 'Hypertension']

        for target in target_nodes:
            # If the target is itself observed in evidence, posterior is deterministic
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
                    # Query result factor states
                    states = self.VALID_DOMAINS[target]
                    prob_dict = {
                        state: float(query_res.values[idx])
                        for idx, state in enumerate(states)
                    }
                    results['posteriors'][target] = prob_dict
                except Exception as e:
                    # In case of unseen joint combination, fallback to smoothed marginal or prior
                    results['posteriors'][target] = self.prior_probabilities.get(
                        target, {'No': 0.75, 'Yes': 0.25}
                    )

            p_yes_post = results['posteriors'][target].get('Yes', 0.0)
            p_yes_prior = self.prior_probabilities[target].get('Yes', 0.0)
            results['risk_delta'][target] = float(p_yes_post - p_yes_prior)

        return results


# Module singleton instance for clean imports
_clinical_engine_singleton: Optional[ClinicalBayesianEngine] = None


def get_bayesian_engine(data: Optional[pd.DataFrame] = None) -> ClinicalBayesianEngine:
    global _clinical_engine_singleton
    if _clinical_engine_singleton is None or data is not None:
        _clinical_engine_singleton = ClinicalBayesianEngine(data)
    return _clinical_engine_singleton


def predict_patient(evidence_dict: Dict[str, Any], data: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    """Top-level functional interface to execute Bayesian inference on patient evidence."""
    engine = get_bayesian_engine(data)
    return engine.predict_patient(evidence_dict)


if __name__ == '__main__':
    test_patient = {
        'Age': 'Senior (>60)',
        'Gender': 'Male',
        'Smoking': 'Current-smoker',
        'BMI_Category': 'Obese (>30)',
        'Family_History': 'Present',
        'Chest_Pain': 'Typical_Angina',
        'Dyspnea': 'Severe'
    }
    prediction = predict_patient(test_patient)
    print("Inference Successful!")
    print("Posterior CAD Risk:", prediction['posteriors']['CAD'])
    print("Posterior Diabetes T2 Risk:", prediction['posteriors']['Diabetes_T2'])
    print("Posterior Hypertension Risk:", prediction['posteriors']['Hypertension'])
