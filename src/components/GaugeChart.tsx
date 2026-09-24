import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface GaugeChartProps {
  title: string;
  subtitle: string;
  posteriorVal: number; // 0 to 1
  priorVal: number;     // 0 to 1
  diseaseCode: 'CAD' | 'Diabetes_T2' | 'Hypertension';
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  subtitle,
  posteriorVal,
  priorVal
}) => {
  const percentage = Math.round(posteriorVal * 1000) / 10;
  const priorPercentage = Math.round(priorVal * 1000) / 10;
  const delta = Math.round((percentage - priorPercentage) * 10) / 10;

  // Arc calculation: semicircle from 180 deg to 0 deg
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const progressOffset = circumference * (1 - Math.min(1, Math.max(0, posteriorVal)));

  let strokeColor = '#10B981'; // Green
  let riskBadge = 'LOW RISK (<20%)';
  let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (posteriorVal > 0.50) {
    strokeColor = '#EF4444'; // Red
    riskBadge = 'ELEVATED / HIGH RISK (>50%)';
    badgeBg = 'bg-red-100 text-red-800 border-red-300';
  } else if (posteriorVal >= 0.20) {
    strokeColor = '#F59E0B'; // Amber
    riskBadge = 'MODERATE RISK (20–50%)';
    badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  // Prior tick position on arc (180deg to 0deg)
  const priorAngle = Math.PI * (1 - priorVal);
  const priorTickX = 100 + radius * Math.cos(priorAngle);
  const priorTickY = 95 - radius * Math.sin(priorAngle);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
            {riskBadge}
          </span>
        </div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="relative flex justify-center items-center my-2">
        <svg viewBox="0 0 200 115" className="w-48 overflow-visible">
          {/* Background Track with zone gradients */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Probability Arc */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Population Prior Marker */}
          <circle
            cx={priorTickX}
            cy={priorTickY}
            r="4.5"
            fill="#334155"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute top-12 flex flex-col items-center">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            {percentage}%
          </span>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Posterior Risk
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-slate-600">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <span>Cohort Prior: <strong className="text-slate-800">{priorPercentage}%</strong></span>
        </div>
        <div className="flex items-center space-x-1 font-semibold">
          <span className="text-slate-500">Delta:</span>
          <span className={`inline-flex items-center ${delta >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {delta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
