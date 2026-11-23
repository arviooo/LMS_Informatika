import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { AnimatedVisual } from '../ui/AnimatedVisuals';
import { stripMarkdown } from '../../lib/textUtils';

interface DeadlineCardProps {
  assignment: any;
}

export default function DeadlineCard({ assignment }: DeadlineCardProps) {
  const navigate = useNavigate();
  const deadlineDate = assignment.deadline ? new Date(assignment.deadline) : null;

  // Format deadline as relative text
  const getDeadlineText = () => {
    if (!deadlineDate) return '';
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays < 0) return 'Sudah lewat!';
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Besok';
    return `${diffDays} hari lagi`;
  };

  const getDeadlineTime = () => {
    if (!deadlineDate) return '';
    return deadlineDate.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const isUrgent = deadlineDate
    ? deadlineDate.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="relative bg-gradient-to-br from-rose-50/80 via-white to-amber-50/80 rounded-3xl p-5 shadow-md shadow-orange-500/10 overflow-hidden border-2 border-orange-200/80">
      {/* Decorative Background Blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-orange-300/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Urgency Header */}
        <div className="flex justify-between items-start">
          <div className="relative">
             <div className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm ${
               isUrgent ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white' : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
             }`}>
               <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
                 <Icon name={isUrgent ? 'priority_high' : 'schedule'} className="text-[10px]" />
               </div>
               <span className="text-[11px] font-black tracking-wide flex items-center gap-1">
                 <AnimatedVisual type={isUrgent ? 'flame' : 'clock'} className="w-3.5 h-3.5" />
                 <span>{isUrgent ? 'Tenggat Segera' : 'Tenggat Mendatang'}</span>
               </span>
             </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-orange-800 bg-orange-100/80 px-2.5 py-1 rounded-full border border-orange-200">
            <Icon name="schedule" className="text-[14px]" />
            <span className="text-[11px] font-extrabold tracking-wide">
              {getDeadlineText()}, {getDeadlineTime()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-xl font-black text-slate-900 mb-1 leading-snug">
            {stripMarkdown(assignment.title)}
          </h3>
          <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">
            {stripMarkdown(assignment.command_text || assignment.description) || 'Selesaikan tugas ini tepat waktu dan raih nilai terbaikmu!'}
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-sky-100 text-sky-800 px-3 py-1.5 rounded-xl border border-sky-200">
             <Icon name="calendar_today" className="text-[14px]" />
             <span className="text-[10px] font-extrabold">Tugas Terjadwal</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-300">
             <Icon name="star" className="text-[14px] text-orange-600" />
             <span className="text-[10px] font-extrabold">Bobot 100 Poin</span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => navigate(`/siswa/tugas/${assignment.id}`)}
          className="w-full mt-1 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
           <span className="text-white font-black text-sm tracking-wide">Kerjakan Sekarang</span>
           <Icon name="arrow_forward" className="text-white text-[18px]" />
        </button>
      </div>
    </div>
  );
}
