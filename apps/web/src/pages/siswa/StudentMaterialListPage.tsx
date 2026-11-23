import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@lms/shared';
import BottomNav from '../../components/dashboard/BottomNav';
import Swal from 'sweetalert2';

import Icon from '../../components/Icon';
import HeaderBar from '../../components/dashboard/HeaderBar';
import { MaterialListSkeleton } from '../../components/ui/PageSkeleton';
import { AnimatedVisual, MiniLottie } from '../../components/ui/AnimatedVisuals';

export default function StudentMaterialListPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/api/student/topics');
        setTopics(response.data);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const topicPalettes = [
    {
      card: 'bg-gradient-to-br from-sky-50 via-white to-indigo-50/70 border-2 border-sky-200/80',
      badge: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
      title: 'text-sky-950',
      activeItem: 'bg-white hover:bg-sky-50 border-2 border-sky-200/80 shadow-xs',
      activeIcon: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm',
    },
    {
      card: 'bg-gradient-to-br from-amber-50 via-white to-orange-50/70 border-2 border-amber-200/80',
      badge: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white',
      title: 'text-amber-950',
      activeItem: 'bg-white hover:bg-amber-50 border-2 border-amber-200/80 shadow-xs',
      activeIcon: 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm',
    },
    {
      card: 'bg-gradient-to-br from-emerald-50 via-white to-teal-50/70 border-2 border-emerald-200/80',
      badge: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      title: 'text-emerald-950',
      activeItem: 'bg-white hover:bg-emerald-50 border-2 border-emerald-200/80 shadow-xs',
      activeIcon: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm',
    },
    {
      card: 'bg-gradient-to-br from-violet-50 via-white to-indigo-50/70 border-2 border-violet-200/80',
      badge: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
      title: 'text-violet-950',
      activeItem: 'bg-white hover:bg-violet-50 border-2 border-violet-200/80 shadow-xs',
      activeIcon: 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <HeaderBar title="Materi Belajar" backUrl="/dashboard" />

      <main className="flex-1 flex flex-col relative w-full pt-5 pb-24 px-5 max-w-3xl mx-auto">
        {/* Colorful Top Banner dengan Animasi Lottie Materi */}
        <div className="mb-5 p-4.5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-between gap-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider mb-1">
              Kurikulum Merdeka • Kelas VII
            </span>
            <h2 className="text-lg font-black leading-tight">Petualangan Modul Informatika</h2>
            <p className="text-xs text-white/90 font-medium mt-0.5">Selesaikan setiap bab secara berurutan untuk membuka bab berikutnya!</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/95 shadow-sm flex items-center justify-center shrink-0 p-1">
            <MiniLottie name="materi" className="w-14 h-14" />
          </div>
        </div>

        {loading ? (
          <MaterialListSkeleton count={2} />
        ) : topics.length === 0 ? (
          <div className="text-center py-10 bg-amber-50/70 rounded-3xl border-2 border-amber-200 mt-4">
            <Icon name="library_books" className="text-[48px] text-amber-500 mb-2" />
            <p className="text-sm font-bold text-amber-900">Belum ada materi dari Guru.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {(() => {
              const allMaterials = topics.flatMap(t => t.materials || []);
              const lockedMap = new Map();
              let previousDone = true;
              allMaterials.forEach(materi => {
                const isRead = materi.student_progress && materi.student_progress.length > 0 && materi.student_progress[0].is_read;
                const hasQuiz = !!materi.quiz;
                const hasQuizAttempt = hasQuiz && materi.quiz.attempts && materi.quiz.attempts.length > 0;
                const isFullyDone = isRead && (!hasQuiz || hasQuizAttempt);

                lockedMap.set(materi.id, !previousDone);
                previousDone = isFullyDone;
              });

              return topics.map((topic, idx) => {
                const palette = topicPalettes[idx % topicPalettes.length];
                return (
                <div key={topic.id} className={`${palette.card} rounded-3xl p-5 shadow-sm`}>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${palette.badge}`}>
                      Bab {idx + 1}
                    </span>
                    <h2 className={`text-lg font-black ${palette.title}`}>{topic.title}</h2>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mb-4">{topic.description}</p>
                  
                  <div className="flex flex-col gap-3">
                    {topic.materials && topic.materials.map((materi: any) => {
                      const isRead = materi.student_progress && materi.student_progress.length > 0 && materi.student_progress[0].is_read;
                      const hasQuiz = !!materi.quiz;
                      const hasQuizAttempt = hasQuiz && materi.quiz.attempts && materi.quiz.attempts.length > 0;
                      const isFullyDone = isRead && (!hasQuiz || hasQuizAttempt);
                      const isLocked = lockedMap.get(materi.id);

                      return (
                        <button 
                          key={materi.id}
                          onClick={() => {
                            if (isLocked) {
                              Swal.fire('Terkunci 🔒', 'Kamu harus menyelesaikan dan memahami materi sebelumnya terlebih dahulu untuk membuka materi ini.', 'warning');
                              return;
                            }
                            navigate(`/siswa/materi/${materi.id}`);
                          }}
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                            isLocked
                              ? 'bg-slate-100/90 opacity-75 cursor-not-allowed border-2 border-slate-200'
                              : isFullyDone
                              ? 'bg-gradient-to-r from-emerald-50 to-teal-50/70 hover:from-emerald-100/80 hover:to-teal-100/70 border-2 border-emerald-300 shadow-xs'
                              : palette.activeItem
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              isLocked
                                ? 'bg-slate-200 text-slate-500'
                                : isFullyDone
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm'
                                : palette.activeIcon
                            }`}>
                              <Icon name={isLocked ? 'lock' : isFullyDone ? 'check_circle' : 'menu_book'} />
                            </div>
                            {!isFullyDone && !isLocked && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm font-black truncate ${isLocked ? 'text-slate-500' : isFullyDone ? 'text-emerald-950' : 'text-slate-900'}`}>
                              {materi.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                              <AnimatedVisual type={materi.type === 'video' ? 'video' : 'book'} className="w-3.5 h-3.5" />
                              <span>{materi.type === 'video' ? 'Video Pembelajaran' : 'Materi Visual'}</span>
                              {isFullyDone && <span className="px-2 py-0.2 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black">Tuntas ✓</span>}
                            </p>
                          </div>
                          <Icon name={isLocked ? 'lock' : 'chevron_right'} className={isLocked ? 'text-slate-400' : 'text-slate-500'} />
                        </button>
                      );
                    })}
                    
                    {(!topic.materials || topic.materials.length === 0) && (
                      <p className="text-sm text-slate-500 italic py-2">Belum ada materi di topik ini.</p>
                    )}
                  </div>
                </div>
                );
              });
            })()}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
