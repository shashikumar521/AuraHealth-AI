# Clinical Decision Support System (CDSS) for Disease Prediction
### Bayesian Belief Networks (pgmpy) & P-Value Hypothesis Testing (scipy.stats)

A hospital-grade Clinical Decision Support System (CDSS) for disease risk stratification across Coronary Artery Disease (CAD), Type-2 Diabetes Mellitus, and Essential Hypertension.

---

## ⚡ Terminal Setup & Execution Commands

Install required scientific dependencies:
```bash
pip install streamlit pgmpy pandas numpy scipy plotly networkx
```
or via requirements file:
```bash
pip install -r requirements.txt
```

Launch the Streamlit Web Application:
```bash
streamlit run app.py
```

Run test suite or standalone module executions:
```bash
python synthetic_data.py
python bayesian_network.py
python statistical_engine.py
```

---

## 🏗️ Architectural Topology & DAG Structure

The Bayesian Network models causal medical dependencies across 12 discrete categorical nodes:

### 1. Root Nodes (Demographics & Risk Factors)
- **Age**: `['Young (<35)', 'Middle-aged (35-60)', 'Senior (>60)']`
- **Gender**: `['Male', 'Female']`
- **Smoking**: `['Non-smoker', 'Former-smoker', 'Current-smoker']`
- **BMI_Category**: `['Normal (<25)', 'Overweight (25-30)', 'Obese (>30)']`
- **Family_History**: `['Absent', 'Present']`

### 2. Intermediate Diseases
- **Hypertension**: `['No', 'Yes']` — Parents: `Age`, `BMI_Category`, `Smoking`
- **Diabetes_T2**: `['No', 'Yes']` — Parents: `Age`, `BMI_Category`, `Family_History`
- **CAD**: `['No', 'Yes']` — Parents: `Smoking`, `Hypertension`, `Diabetes_T2`, `Gender`

### 3. Leaf Symptom & Lab Nodes
- **Chest_Pain**: `['None', 'Atypical', 'Typical_Angina']` — Child of `CAD`
- **Dyspnea**: `['Absent', 'Mild', 'Severe']` — Child of `CAD`, `Hypertension`
- **Fasting_Glucose**: `['Normal (<100)', 'Pre-diabetic (100-125)', 'Diabetic (>=126)']` — Child of `Diabetes_T2`
- **Resting_ECG**: `['Normal', 'ST_T_Abnormality', 'Hypertrophy']` — Child of `CAD`, `Hypertension`
- **Fatigue**: `['Normal', 'Chronic_Exhaustion']` — Child of `Diabetes_T2`, `CAD`

---

## 🔬 Dual Engine Capabilities

### Engine A: Bayesian Exact Inference (`pgmpy.inference.VariableElimination`)
- Fits Conditional Probability Distributions (CPDs) on synthetic epidemiological cohort ($N=3,500$) using `BayesianEstimator` with Dirichlet / Bayesian Dirichlet equivalent uniform (BDeu) pseudo-counts ($\text{ESS}=10$) ensuring no zero probabilities.
- Exact marginalization and variable elimination to output $P(\text{CAD} = \text{'Yes'} \mid \mathbf{E})$, $P(\text{Diabetes\_T2} = \text{'Yes'} \mid \mathbf{E})$, and $P(\text{Hypertension} = \text{'Yes'} \mid \mathbf{E})$.

### Engine B: Inferential P-Value Hypothesis Testing (`scipy.stats`)
- Evaluates $2 \times K$ cross-tabulation matrices against the baseline population cohort.
- Chi-Square Test of Independence ($\chi^2$, degrees of freedom, exact p-value).
- Odds Ratio (OR) with 95% Wald Confidence Intervals for the observed patient manifestation.
- Fisherian Decision Rule:
  - $p < 0.05$: **"Statistically Significant Driver (p < 0.05)"**
  - $p \ge 0.05$: **"Non-significant / Incidental Evidence"**
