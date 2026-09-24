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
  Wind
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
        return <Cigarette className="w-4 h-4 text-rose-500" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-teal-600" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-amber-600" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-sky-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <HeartPulse className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
          <Compass className="w-4 h-4" />
        </span>
        <div>
          <h3 className="font-medium text-[#1E293B] text-sm">
            Personalized Clinical Action Plan
          </h3>
          <p className="text-[11px] text-[#64748B]">
            Evidence-grounded lifestyle and diagnostic next steps tailored to your primary risk drivers.
          </p>
        </div>
      </div>

      {/* 3 Actionable Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.title}
            className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between space-y-2 hover:bg-slate-50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shadow-2xs">
                  {renderIcon(rec.icon)}
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  Step 0{index + 1}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-[#1E293B] mb-1">
                {rec.title}
              </h4>
              <p className="text-xs font-normal text-[#64748B] leading-relaxed">
                {rec.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Priority Action</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
