import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, Code, Dna } from 'lucide-react';

interface PythonScriptTabProps {
  pythonCode: string;
}

export const PythonScriptTab: React.FC<PythonScriptTabProps> = ({ pythonCode }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const installCmd = 'pip install streamlit pgmpy pandas numpy scipy plotly networkx';
  const runCmd = 'streamlit run app.py';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(`${installCmd} && ${runCmd}`);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6 shadow-xl shadow-black/30 space-y-4 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-cyan-500/20 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/15 text-cyan-400 rounded-lg border border-cyan-500/30">
              <Dna className="w-4 h-4" />
            </span>
            <h3 className="font-semibold text-white text-base">
              AuraHealth Nexus Standalone Python Engine (Streamlit + pgmpy + NetworkX + scipy.stats)
            </h3>
          </div>
          <p className="text-xs font-normal text-slate-400 mt-1">
            Run the exact same multi-variable Bayesian Belief Network, NetworkX DAG visualizer, and Chi-Square engine locally in your Python environment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 shadow-sm transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download app.py</span>
          </button>
        </div>
      </div>

      {/* Terminal Quick Start */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>TERMINAL ONE-LINER SETUP</span>
          </span>
          <button
            onClick={handleCopyCmd}
            className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCmd ? 'Copied' : 'Copy command'}</span>
          </button>
        </div>
        <pre className="text-xs font-mono text-cyan-300/90 overflow-x-auto whitespace-pre-wrap select-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          {installCmd} && {runCmd}
        </pre>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#070D1E]">
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>app.py (Executable Python Code)</span>
          <span>UTF-8 &middot; Python 3.9+</span>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[550px] leading-relaxed selection:bg-cyan-900 selection:text-cyan-100">
          <code>{pythonCode}</code>
        </pre>
      </div>
    </div>
  );
};
