import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, FileCode } from 'lucide-react';
import {
  SYNTHETIC_DATA_PY,
  BAYESIAN_NETWORK_PY,
  STATISTICAL_ENGINE_PY,
  APP_PY
} from '../constants/pythonSource';

export const CodeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'synthetic' | 'bayesian' | 'statistical' | 'app' | 'requirements'>('app');
  const [copied, setCopied] = useState(false);

  const fileContents: Record<'synthetic' | 'bayesian' | 'statistical' | 'app' | 'requirements', { filename: string; code: string; language: string; summary: string }> = {
    app: {
      filename: 'app.py',
      language: 'python',
      summary: 'Streamlit Web Dashboard with HIPAA compliance banner, patient intake sidebar, Plotly gauges, hypothesis tables, Causal DAG, and medical report download.',
      code: APP_PY
    },
    bayesian: {
      filename: 'bayesian_network.py',
      language: 'python',
      summary: 'Bayesian Belief Network architecture with BDeu pseudo-counts (ESS=10) and Variable Elimination exact inference for CAD, Diabetes_T2, and Hypertension.',
      code: BAYESIAN_NETWORK_PY
    },
    statistical: {
      filename: 'statistical_engine.py',
      language: 'python',
      summary: 'Biostatistical hypothesis testing engine computing 2xK contingency tables, Chi-Square of independence, exact p-values, and Odds Ratios with 95% Confidence Intervals.',
      code: STATISTICAL_ENGINE_PY
    },
    synthetic: {
      filename: 'synthetic_data.py',
      language: 'python',
      summary: 'Generates 3,500 patient cohort adhering strictly to epidemiological conditional distributions across all 12 categorical nodes.',
      code: SYNTHETIC_DATA_PY
    },
    requirements: {
      filename: 'requirements.txt',
      language: 'text',
      summary: 'Pip dependencies required to run the Python Streamlit system locally.',
      code: `streamlit>=1.35.0
pgmpy>=0.1.25
pandas>=2.0.0
numpy>=1.24.0
scipy>=1.11.0
plotly>=5.20.0
networkx>=3.1`
    }
  };

  const currentFile = fileContents[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, code: string) => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Terminal execution banner */}
      <div className="bg-slate-950 text-slate-100 p-4 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono text-emerald-400">
          <Terminal className="w-4 h-4" />
          <span>Local Python Execution Instructions</span>
        </div>
        <div className="bg-slate-900 rounded p-3 font-mono text-xs text-slate-300 space-y-1.5 overflow-x-auto border border-slate-800">
          <p className="text-slate-500"># 1. Install production medical data science dependencies:</p>
          <p className="text-emerald-300 font-semibold selection:bg-emerald-800">
            pip install streamlit pgmpy pandas numpy scipy plotly networkx
          </p>
          <p className="text-slate-500 pt-1"># 2. Launch the Streamlit Clinical Decision Support System:</p>
          <p className="text-cyan-300 font-semibold selection:bg-cyan-800">
            streamlit run app.py
          </p>
        </div>
      </div>

      {/* Code file tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(fileContents) as Array<keyof typeof fileContents>).map((key) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setCopied(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fileContents[key].filename}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
          <button
            onClick={() => handleDownload(currentFile.filename, currentFile.code)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
        <strong>{currentFile.filename}:</strong> {currentFile.summary}
      </div>

      {/* Code Block */}
      <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[440px] border border-slate-800">
        <pre>{currentFile.code}</pre>
      </div>
    </div>
  );
};
