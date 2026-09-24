import React from 'react';
import {
  Compass,
  Cigarette,
  Activity,
  Droplets,
  Scale,
  HeartPulse,
  ClipboardCheck,
  ShieldCheck,
  Wind,
  Moon
} from 'lucide-react';

interface RecommendationItem {
  title: string;
  desc: string;
  icon: string;
}

interface AuraActionableGuidanceProps {
  recommendations: RecommendationItem[];
}

export const AuraActionableGuidance: React.FC<AuraActionableGuidanceProps> = ({
  recommendations
}) => {
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Cigarette':
        return <Cigarette className="w-4 h-4 text-rose-400" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'Moon':
        return <Moon className="w-4 h-4 text-sky-400" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-teal-400" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-amber-400" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-sky-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <HeartPulse className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-cyan-500/15 p-6 shadow-xl shadow-black/25 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
        <span className="p-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Compass className="w-4 h-4" />
        </span>
        <div>
          <h3 className="font-semibold text-white text-sm">
            Personalized Clinical Action Plan &amp; Explainable AI (XAI) Drivers
          </h3>
          <p className="text-[11px] text-slate-400">
            Evidence-grounded lifestyle and diagnostic interventions tailored to detected risk multipliers.
          </p>
        </div>
      </div>

      {/* 3 Actionable Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.title}
            className="p-4 rounded-xl border border-cyan-500/15 bg-slate-800/60 flex flex-col justify-between space-y-2 hover:border-cyan-500/35 transition-all shadow-md shadow-black/20"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center">
                  {renderIcon(rec.icon)}
                </div>
                <span className="text-[11px] font-mono font-bold text-cyan-400">
                  Directive 0{index + 1}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-white mb-1">
                {rec.title}
              </h4>
              <p className="text-xs font-normal text-slate-300 leading-relaxed">
                {rec.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] text-cyan-400 font-medium">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Priority Protocol</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
