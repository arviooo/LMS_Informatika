import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HeaderBar from '../../components/dashboard/HeaderBar';
import BottomNav from '../../components/dashboard/BottomNav';
import { useAuth } from '../../App';
import { api } from '@lms/shared';

import Icon from '../../components/Icon';
import { AssignmentListSkeleton } from '../../components/ui/PageSkeleton';
import { AnimatedVisual, MiniLottie } from '../../components/ui/AnimatedVisuals';
import { stripMarkdown } from '../../lib/textUtils';
export default function StudentAssignmentListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get('/api/student/assignments');
        setAssignments(response.data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFDF8]">
      <HeaderBar />

      <main className="flex-1 flex flex-col px-5 sm:px-6 gap-5 pt-5 pb-24 overflow-y-auto max-w-3xl mx-auto w-full">
        {/* Colorful Top Banner dengan Animasi Lottie Kuis/Tugas */}
        <div className="p-4.5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-between gap-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1">
              Misi & Tantangan • Kelas VII
            </span>
            <h2 className="text-xl font-black leading-tight">Daftar Tugas Siswa</h2>
            <p className="text-xs text-white/95 font-medium mt-0.5">Kerjakan tugas dari gurumu sebelum tenggat waktu dan kumpulkan poin maksimal!</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/95 shadow-sm flex items-center justify-center shrink-0 p-1">
            <MiniLottie name="kuis" className="w-14 h-14" />
          </div>
        </div>

        {loading ? (
          <AssignmentListSkeleton count={3} />
        ) : assignments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {assignments.map(assignment => (
              <button
                key={assignment.id}
                onClick={() => navigate(`/siswa/tugas/${assignment.id}`)}
                className={`flex flex-col gap-3 p-5 rounded-3xl border-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left group ${
                  assignment.has_submitted
                    ? 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 border-emerald-200/90'
                    : 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 border-amber-200/90'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {assignment.has_submitted ? (
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <Icon name="check_circle" className="text-[14px]" /> Selesai Dikerjakan
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <Icon name="hourglass_top" className="text-[14px]" /> Belum Dikerjakan
                    </span>
                  )}
                  <span className="text-rose-700 bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1">
                    <Icon name="schedule" className="text-[14px]" /> {new Date(assignment.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    {stripMarkdown(assignment.title)}
                    {!assignment.has_submitted && (
                      <span className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-sm animate-pulse shrink-0" title="Belum Dikerjakan"></span>
                    )}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 mt-1 line-clamp-2">
                    {stripMarkdown(assignment.command_text)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-amber-900 font-extrabold bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl flex items-center gap-1.5">
                    <AnimatedVisual type="celebrate" className="w-3.5 h-3.5" />
                    <span>{assignment.max_points} Poin Maksimal</span>
                  </span>
                  {assignment.score !== null && (
                    <span className="text-xs text-white font-black bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
                      <AnimatedVisual type="trophy" className="w-3.5 h-3.5" />
                      <span>Nilai: {assignment.score}</span>
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-emerald-50/60 rounded-3xl border-2 border-emerald-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 border-2 border-emerald-200 shadow-sm p-2">
              <MiniLottie name="progres" className="w-16 h-16" />
            </div>
            <h3 className="text-base font-black text-emerald-950">Hore! Belum ada tugas baru</h3>
            <p className="text-xs font-semibold text-emerald-800/80 mt-1.5 max-w-[260px]">
              Semua tugas sudah beres atau belum ada tugas baru dari gurumu. Selamat beristirahat!
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
