import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, Code } from 'lucide-react';

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
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <Code className="w-4 h-4" />
            </span>
            <h3 className="font-medium text-[#1E293B] text-base">
              AuraHealth AI Standalone Python Engine (Streamlit + pgmpy + NetworkX + scipy.stats)
            </h3>
          </div>
          <p className="text-xs font-normal text-[#64748B] mt-1">
            Run the exact same multi-variable Bayesian Belief Network, NetworkX DAG visualizer, and Chi-Square engine locally in your Python environment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl border border-[#E2E8F0] shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download app.py</span>
          </button>
        </div>
      </div>

      {/* Terminal Command Box */}
      <div className="bg-[#1E293B] rounded-xl p-4 text-slate-100 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-normal text-slate-300">Terminal Install &amp; Launch</span>
          </div>
          <button
            onClick={handleCopyCmd}
            className="text-[11px] hover:text-white flex items-center gap-1 text-slate-400 cursor-pointer"
          >
            {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="space-y-1.5">
          <div>
            <span className="text-slate-400 font-normal"># 1. Install dependencies</span>
          </div>
          <div className="text-emerald-300 font-mono select-all">
            {installCmd}
          </div>
          <div className="pt-1">
            <span className="text-slate-400 font-normal"># 2. Run the Streamlit web application</span>
          </div>
          <div className="text-blue-300 font-mono select-all">
            {runCmd}
          </div>
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="relative border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="bg-[#F8FAFC] px-4 py-2 border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs font-mono text-slate-600">app.py</span>
          <span className="text-[11px] text-slate-400 font-mono">Streamlit + pgmpy + NetworkX</span>
        </div>
        <pre className="p-4 bg-white text-slate-700 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
          {pythonCode}
        </pre>
      </div>
    </div>
  );
};
