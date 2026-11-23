import type { ProgressSummary } from '@lms/shared';
import Icon from '../../components/Icon';
import { AnimatedVisual } from '../ui/AnimatedVisuals';

interface ProgressCardProps {
  summary: ProgressSummary;
  grade: number;
}

export default function ProgressCard({ summary, grade }: ProgressCardProps) {
  const {
    completed_activities,
    in_progress_activities,
    not_started_activities,
    completion_percentage,
  } = summary;

  // Determine encouragement based on percentage
  const getEncouragement = () => {
    if (completion_percentage >= 80) return { text: 'Luar Biasa!', color: 'text-white' };
    if (completion_percentage >= 60) return { text: 'Cukup Baik!', color: 'text-white' };
    if (completion_percentage >= 40) return { text: 'Terus Semangat!', color: 'text-white' };
    return { text: 'Ayo Mulai Belajar!', color: 'text-white' };
  };

  const encouragement = getEncouragement();

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completion_percentage / 100) * circumference;

  return (
    <div className="relative bg-gradient-to-br from-white via-[#FFFDF8] to-sky-50/60 rounded-3xl p-5 shadow-md shadow-blue-500/5 border-2 border-amber-200/80 overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] text-orange-700 uppercase tracking-wider font-black mb-1 flex items-center gap-1.5">
              <AnimatedVisual type="target" className="w-3.5 h-3.5" />
              <span>SEMESTER INI</span>
            </p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              Progres Belajar
            </h3>
            <p className="text-xs font-bold text-blue-600 mt-0.5">
              Kelas {grade === 7 ? 'VII' : grade === 8 ? 'VIII' : 'IX'} • Kurikulum Merdeka
            </p>
          </div>

          <div className="relative">
             <div className="absolute inset-0 bg-orange-400 blur-md opacity-30 rounded-full"></div>
             <div className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm ${encouragement.color}`}>
               <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center">
                 <Icon name="star" className="text-[11px]" />
               </div>
               <span className="text-[11px] font-black tracking-wide">{encouragement.text}</span>
             </div>
          </div>
        </div>

        {/* Circular Progress & Stats wrapper */}
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-6 mx-auto flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="colorfulProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="50%" stopColor="#0EA5E9" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <circle
                className="text-sky-100 stroke-current"
                strokeWidth="12"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
              />
              <circle
                stroke="url(#colorfulProgressGrad)"
                className="drop-shadow-md transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-blue-700">
                {Math.round(completion_percentage)}%
              </span>
              <span className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider">Tuntas</span>
            </div>
            {/* Inner top dot */}
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            <StatPill 
              icon="check_circle" 
              iconColor="text-emerald-600" 
              iconBg="bg-emerald-100"
              cardBg="bg-gradient-to-br from-emerald-50 to-teal-50/70 border-2 border-emerald-200"
              value={completed_activities} 
              label="Tuntas" 
              textColor="text-emerald-700" 
            />
            <StatPill 
              icon="sync" 
              iconColor="text-amber-600" 
              iconBg="bg-amber-100"
              cardBg="bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-amber-200"
              value={in_progress_activities} 
              label="Proses" 
              textColor="text-amber-800" 
            />
            <StatPill 
              icon="pending" 
              iconColor="text-rose-600" 
              iconBg="bg-rose-100"
              cardBg="bg-gradient-to-br from-rose-50 to-pink-50/70 border-2 border-rose-200"
              value={not_started_activities} 
              label="Belum Mulai" 
              textColor="text-rose-700" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  iconColor,
  iconBg,
  cardBg,
  value,
  label,
  textColor,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  cardBg: string;
  value: number;
  label: string;
  textColor: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-3 rounded-2xl ${cardBg} shadow-xs hover:shadow-md transition-all`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 ${iconBg} border border-white shadow-2xs`}>
        <Icon name={icon} className={`text-[15px] ${iconColor}`} />
      </div>
      <span className="text-xl font-black text-slate-900 leading-none mb-1">{value}</span>
      <span className={`text-[9px] font-black uppercase tracking-wider ${textColor}`}>{label}</span>
    </div>
  );
}
