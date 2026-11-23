import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import HeaderBar from '../components/dashboard/HeaderBar';
import ProgressCard from '../components/dashboard/ProgressCard';
import DeadlineCard from '../components/dashboard/DeadlineCard';
import ReadingCard from '../components/dashboard/ReadingCard';
import QuickAccess from '../components/dashboard/QuickAccess';
import TipsCard from '../components/dashboard/TipsCard';
import BottomNav from '../components/dashboard/BottomNav';
import { DashboardStudentSkeleton } from '../components/ui/PageSkeleton';
import { AnimatedVisual } from '../components/ui/AnimatedVisuals';
import Icon from '../components/Icon';
import {
  mockClasses,
  mockTopics,
  mockMaterials,
  mockProgress,
  getProgressSummary,
  api,
  backendUrl
} from '@lms/shared';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/api/student/topics')
        .then(res => setTopics(res.data))
        .catch(err => console.error('Failed to fetch topics:', err))
        .finally(() => setIsLoadingTopics(false));
        
      api.get('/api/student/assignments')
        .then(res => setAssignments(res.data))
        .catch(err => console.error('Failed to fetch assignments:', err))
        .finally(() => setIsLoadingAssignments(false));
    }
  }, [user]);

  if (!user) return null;

  // Get user's class info directly from user object
  const userClassName = String(user.class_name || 'N/A');
  const gradeStr = userClassName.substring(0, 1);
  const grade = !isNaN(parseInt(gradeStr)) ? parseInt(gradeStr) : 7;
  const semesterStr = user.semester || 'ganjil';

  // Calculate progress summary based on topics and materials
  let total_activities = 0;
  let completed_activities = 0;
  let in_progress_activities = 0;
  let not_started_activities = 0;

  topics.forEach((topic) => {
    if (topic.materials) {
      topic.materials.forEach((material: any) => {
        total_activities++;
        const isRead = material.student_progress && material.student_progress.length > 0 && material.student_progress[0].is_read;
        const hasQuiz = material.quiz;
        const hasQuizAttempt = hasQuiz && material.quiz.attempts && material.quiz.attempts.length > 0;
        
        if (isRead && (!hasQuiz || hasQuizAttempt)) {
          completed_activities++;
        } else if (isRead) {
          in_progress_activities++;
        } else {
          not_started_activities++;
        }
      });
    }
  });

  assignments.forEach((assignment: any) => {
    total_activities++;
    if (assignment.has_submitted) {
      completed_activities++;
    } else {
      not_started_activities++;
    }
  });

  const completion_percentage = total_activities > 0 ? Math.round((completed_activities / total_activities) * 100) : 0;
  
  const summary = {
    total_activities,
    completed_activities,
    in_progress_activities,
    not_started_activities,
    completion_percentage
  };

  // Get active assignments (not submitted) sorted by deadline
  const activeAssignments = assignments.filter(a => !a.has_submitted).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  // Playful multi-color themes for Topic Cards
  const topicColorPalettes = [
    {
      card: 'bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/70 border-2 border-sky-200/80',
      header: 'bg-gradient-to-r from-sky-100/90 to-cyan-100/80 border-b border-sky-200/70',
      badge: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white',
      title: 'text-sky-950',
      itemHover: 'hover:bg-sky-100/60',
      iconActive: 'bg-sky-100 text-sky-700 border border-sky-200',
    },
    {
      card: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/70 border-2 border-amber-200/80',
      header: 'bg-gradient-to-r from-amber-100/90 to-orange-100/80 border-b border-amber-200/70',
      badge: 'bg-gradient-to-br from-orange-500 to-amber-500 text-white',
      title: 'text-amber-950',
      itemHover: 'hover:bg-amber-100/60',
      iconActive: 'bg-amber-100 text-orange-700 border border-amber-200',
    },
    {
      card: 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/70 border-2 border-emerald-200/80',
      header: 'bg-gradient-to-r from-emerald-100/90 to-teal-100/80 border-b border-emerald-200/70',
      badge: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
      title: 'text-emerald-950',
      itemHover: 'hover:bg-emerald-100/60',
      iconActive: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    },
    {
      card: 'bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/70 border-2 border-violet-200/80',
      header: 'bg-gradient-to-r from-violet-100/90 to-indigo-100/80 border-b border-violet-200/70',
      badge: 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white',
      title: 'text-violet-950',
      itemHover: 'hover:bg-violet-100/60',
      iconActive: 'bg-violet-100 text-violet-700 border border-violet-200',
    },
    {
      card: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/70 border-2 border-rose-200/80',
      header: 'bg-gradient-to-r from-rose-100/90 to-pink-100/80 border-b border-rose-200/70',
      badge: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
      title: 'text-rose-950',
      itemHover: 'hover:bg-rose-100/60',
      iconActive: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
  ];

  return (
    <main className="relative flex flex-col min-h-dvh pb-20 bg-[#FFFDF8]">
      {/* ─── Hero Section (Cerah, Berwarna & Harmonis) ─── */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 rounded-b-[2.5rem] shadow-xl shadow-blue-500/15 pb-10 overflow-hidden z-20 border-b-4 border-amber-300/80">
        {/* Background Batik Image */}
        <div 
          className="absolute inset-0 z-0 opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "url('/bg-batik.jpg')", backgroundSize: '120px' }}
        ></div>
        {/* Colorful Decorative Orbs */}
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-amber-300/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-300/25 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-full border-[1px] border-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 scale-[1.5] pointer-events-none"></div>

        <HeaderBar variant="transparent" />

        <div className="px-5 sm:px-6 relative z-10 pt-2 flex items-start justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-300 text-slate-950 mb-4 border-2 border-white/60 shadow-sm">
              <Icon name="location_on" className="text-[14px] text-orange-700 icon-filled" />
              <span className="text-[11px] font-black tracking-wide">
                SMPN 3 Gubug • Kelas VII
              </span>
            </div>
            
            <h2 className="text-[26px] leading-tight text-white mb-1.5 font-black drop-shadow-xs">
              Halo, {user.name.split(' ')[0]}! 👋✨
            </h2>
            <p className="text-xs text-white/95 font-semibold">
              Kelas:{' '}
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-amber-200 font-black">
                {userClassName}
              </span>{' '}
              • Informatika Semester{' '}
              {semesterStr === 'genap' ? 'Genap' : 'Ganjil'}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 bg-emerald-400/25 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-200/40 shadow-sm">
                <Icon name="wifi" className="text-[12px] text-emerald-300 icon-filled" />
                <span className="text-[10px] font-extrabold text-white">
                  Sinkronisasi Aktif
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-400/25 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-200/40 shadow-sm">
                <Icon name="cloud_done" className="text-[12px] text-amber-200 icon-filled" />
                <span className="text-[10px] font-extrabold text-white">
                  Server Sekolah Siap
                </span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 ml-4 relative mt-2">
             <div className="w-[74px] h-[74px] rounded-full bg-gradient-to-tr from-amber-300 via-yellow-300 to-sky-300 p-1 shadow-xl relative z-10">
                <div className="w-full h-full bg-white rounded-full overflow-hidden border-2 border-white">
                  <img src={user.avatar_url ? (user.avatar_url.startsWith('http') ? user.avatar_url : `${backendUrl}${user.avatar_url}`) : `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full object-cover bg-amber-50" />
                </div>
             </div>
             <div className="absolute -inset-2 bg-amber-300/35 rounded-full blur-md z-0 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* ─── Scrollable Content ────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col px-5 sm:px-6 gap-6 pb-10 pt-6">
        {isLoadingTopics || isLoadingAssignments ? (
          <DashboardStudentSkeleton />
        ) : (
          <>
        <ProgressCard summary={summary} grade={grade} />

        {activeAssignments.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs text-orange-800 uppercase tracking-wider font-black px-1 mt-1 flex items-center gap-1.5">
              <AnimatedVisual type="clock" className="w-4 h-4" />
              <span>Tugas Belum Dikerjakan</span>
            </h3>
            {activeAssignments.map(assignment => (
              <DeadlineCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}

        <QuickAccess />

        <TipsCard />

        <div id="materi" className="mt-2 flex flex-col gap-3 scroll-mt-20">
          <p className="text-xs text-blue-900 uppercase tracking-wider font-black px-1 flex items-center gap-1.5">
            <AnimatedVisual type="book" className="w-4 h-4" />
            <span>Daftar Materi Pembelajaran</span>
          </p>
          
          {topics.length === 0 ? (
            <div className="bg-amber-50/70 rounded-2xl p-5 text-center shadow-sm border-2 border-amber-200/70">
              <p className="text-sm font-semibold text-amber-900">Belum ada materi yang tersedia.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {topics.map((topic, index) => {
                const palette = topicColorPalettes[index % topicColorPalettes.length];
                return (
                  <div key={topic.id} className={`${palette.card} rounded-2xl shadow-sm overflow-hidden`}>
                    <div className={`p-3.5 ${palette.header} flex items-center gap-2.5`}>
                      <span className={`w-7 h-7 rounded-xl ${palette.badge} flex items-center justify-center text-xs font-black shadow-xs`}>
                        {index + 1}
                      </span>
                      <h3 className={`text-sm font-black ${palette.title} truncate`}>{topic.title}</h3>
                    </div>
                    <div className="p-2.5 flex flex-col gap-2">
                      {topic.materials && topic.materials.length > 0 ? (
                        topic.materials.map((material: any) => {
                          const isRead = material.student_progress && material.student_progress.length > 0 && material.student_progress[0].is_read;
                          const hasQuiz = !!material.quiz;
                          const hasQuizAttempt = hasQuiz && material.quiz.attempts && material.quiz.attempts.length > 0;
                          const isFullyDone = isRead && (!hasQuiz || hasQuizAttempt);
                          
                          return (
                            <button
                              key={material.id}
                              onClick={() => navigate(`/siswa/materi/${material.id}`)}
                              className={`flex items-center justify-between p-3 rounded-xl bg-white/85 border border-slate-200/70 ${palette.itemHover} transition-all text-left shadow-2xs active:scale-[0.99]`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                                  isFullyDone
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                    : palette.iconActive
                                }`}>
                                  <Icon name={isFullyDone ? 'check_circle' : 'menu_book'} className="text-[19px]" />
                                  {!isFullyDone && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-sm font-extrabold truncate ${isFullyDone ? 'text-emerald-900' : 'text-slate-900'}`}>{material.title}</span>
                                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                    <Icon name="schedule" className="text-[12px] text-amber-600" /> {material.estimated_read_time} mnt
                                    {isFullyDone && <span className="text-emerald-600 font-bold ml-1">• Tuntas ✓</span>}
                                  </span>
                                </div>
                              </div>
                              <Icon name="chevron_right" className="text-slate-400 text-[20px]" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-2 text-xs font-semibold text-slate-500 text-center">Belum ada sub-materi</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {/* â”€â”€â”€ Bottom Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <BottomNav />
    </main>
  );
}

