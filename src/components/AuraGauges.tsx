import React from 'react';
import { Heart, Activity, AlertCircle, ShieldCheck } from 'lucide-react';
import { RiskEvaluation } from '../types/health';

interface AuraGaugesProps {
  heartRisk: RiskEvaluation;
  diabetesRisk: RiskEvaluation;
}

interface RadialGaugeProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  risk: RiskEvaluation;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({ title, subtitle, icon, risk }) => {
  const percentage = Math.min(100, Math.max(0, risk.percentage));
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Semicircle arc (180 degrees)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * percentage) / 100;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
      {/* Background Soft Glow Accent */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundColor: risk.ringColor }}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
            {icon}
          </span>
          <div>
            <h3 className="font-medium text-[#1E293B] text-sm">{title}</h3>
            <p className="text-[11px] text-[#64748B]">{subtitle}</p>
          </div>
        </div>

        {/* Risk Badge with exact user gradients */}
        <span
          className="text-xs font-medium px-3 py-1 rounded-full border shadow-2xs transition-colors"
          style={{
            backgroundColor: risk.badgeBg,
            borderColor: risk.badgeBorder,
            color: risk.badgeText
          }}
        >
          {risk.level}
        </span>
      </div>

      {/* Radial Gauge Centerpiece */}
      <div className="flex flex-col items-center justify-center pt-2 pb-1">
        <div className="relative w-44 h-38 flex items-center justify-center">
          <svg className="w-44 h-38 -rotate-135" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeLinecap="round"
            />
            {/* Active Colored Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={risk.ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Center Metric Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pt-2">
            <span
              className="text-3xl font-semibold font-mono tracking-tight"
              style={{ color: risk.ringColor }}
            >
              {percentage.toFixed(1)}%
            </span>
            <span className="text-[11px] font-normal text-slate-500 uppercase tracking-wider mt-0.5">
              Posterior Risk
            </span>
          </div>
        </div>

        {/* Qualitative Benchmark Indicator */}
        <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-4 mt-[-10px] mb-3 font-mono">
          <span>0% (Optimal)</span>
          <span>50% (Threshold)</span>
          <span>100% (Critical)</span>
        </div>
      </div>

      {/* Clinical Interpretation Card */}
      <div className="mt-1 pt-3 border-t border-slate-100 flex items-start gap-2.5">
        {percentage < 25 ? (
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        )}
        <p className="text-xs font-normal text-[#64748B] leading-relaxed">
          {risk.summary}
        </p>
      </div>
    </div>
  );
};

export const AuraGauges: React.FC<AuraGaugesProps> = ({ heartRisk, diabetesRisk }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <RadialGauge
        title="Coronary Heart Disease"
        subtitle="Bayesian Inferred Posterior Probability"
        icon={<Heart className="w-4 h-4 text-rose-500" />}
        risk={heartRisk}
      />
      <RadialGauge
        title="Type-2 Diabetes Mellitus"
        subtitle="Bayesian Inferred Posterior Probability"
        icon={<Activity className="w-4 h-4 text-teal-600" />}
        risk={diabetesRisk}
      />
    </div>
  );
};
