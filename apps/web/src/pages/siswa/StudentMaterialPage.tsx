import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@lms/shared';

import Icon from '../../components/Icon';
import HeaderBar from '../../components/dashboard/HeaderBar';
import { MaterialDetailSkeleton } from '../../components/ui/PageSkeleton';
import { AnimatedVisual, MiniLottie } from '../../components/ui/AnimatedVisuals';

export default function StudentMaterialPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Progress states
  const [isRead, setIsRead] = useState(false);
  const [isVideoWatched, setIsVideoWatched] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const res = await api.get(`/api/student/materials/${id}`);
      setMaterial(res.data);
      if (res.data.student_progress && res.data.student_progress.length > 0) {
        setIsRead(res.data.student_progress[0].is_read);
        setIsVideoWatched(res.data.student_progress[0].is_video_watched);
      }
    } catch (e) {
      Swal.fire('Error', 'Gagal memuat materi.', 'error');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderBar title="Materi Belajar" backUrl="/siswa/materi" />
        <MaterialDetailSkeleton />
      </div>
    );
  }

  if (!material) return null;

  // Calculate dynamic steps
  const steps = [];
  
  // Step 1: Read
  steps.push({
    id: 1,
    title: 'Pelajari Materi: ' + material.title,
    desc: `Materi, Video, & Dokumen. Estimasi: ${material.estimated_read_time || 5} Menit`,
    icon: 'menu_book',
    isDone: isRead,
    onClick: () => navigate(`/siswa/materi/${id}/baca`)
  });

  // Step 2: Quiz
  let hasQuiz = false;
  let isQuizDone = false;
  let latestAttempt: any = null;
  if (material.quiz) {
    hasQuiz = true;
    if (material.quiz.attempts && material.quiz.attempts.length > 0) {
      isQuizDone = true;
      latestAttempt = material.quiz.attempts[0];
    }
  }

  // Only show quiz step if there is actually a quiz for this topic
  if (hasQuiz) {
    steps.push({
      id: 2,
      title: isQuizDone ? 'Kuis Pemahaman (Selesai)' : 'Kerjakan Kuis Latihan',
      desc: isQuizDone 
        ? `Sudah dikerjakan • Nilai: ${latestAttempt?.score ?? 0} (${latestAttempt?.is_passed ? 'Lulus' : 'Belum Tuntas'})`
        : 'Uji pemahamanmu tentang materi ini',
      icon: 'quiz',
      isDone: isQuizDone,
      onClick: async () => {
        if (isQuizDone) {
          Swal.fire({
            title: 'Kuis Telah Diselesaikan',
            html: `
              <div style="font-size: 14px; text-align: center; padding: 6px 0;">
                <p style="margin-bottom: 12px; color: #4b5563;">Kamu sudah mengerjakan kuis ini dan tidak dapat mengulang kembali.</p>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin: 12px 0;">
                  <p style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Nilai Akhir Kuis</p>
                  <p style="font-size: 38px; font-weight: 900; color: #1a2a4b; margin: 4px 0;">${latestAttempt?.score ?? 0}</p>
                  <span style="display: inline-block; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; ${latestAttempt?.is_passed ? 'background: #dcfce7; color: #15803d;' : 'background: #fee2e2; color: #b91c1c;'}">
                    ${latestAttempt?.is_passed ? 'LULUS (TUNTAS)' : 'BELUM TUNTAS'}
                  </span>
                </div>
              </div>
            `,
            icon: 'info',
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#1a2a4b'
          });
          return;
        }

        if (!isRead) {
           const result = await Swal.fire({
             title: 'Lanjut ke Kuis?',
             text: "Kamu belum menyelesaikan materi. Yakin ingin langsung kuis?",
             icon: 'warning',
             showCancelButton: true,
             confirmButtonText: 'Ya, Lanjutkan',
             cancelButtonText: 'Batal',
             confirmButtonColor: '#1a2a4b'
           });
           if (!result.isConfirmed) return;
        }
        navigate(`/siswa/materi/${id}/kuis`);
      }
    });
  }

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.isDone).length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8] selection:bg-amber-200">
      
      <HeaderBar title="Modul Pembelajaran" backUrl="/dashboard" />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-6 pb-24 flex flex-col gap-6">
        
        {/* Title Section */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden flex items-center justify-between gap-4">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-300/25 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-300 text-slate-950 text-[11px] font-black uppercase tracking-wider mb-2">
              <AnimatedVisual type="book" className="w-3.5 h-3.5" />
              <span>{material.topic?.title || 'Materi Informatika'}</span>
            </div>
            <h1 className="text-2xl font-black text-white leading-tight">
              {material.title}
            </h1>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/95 shadow-sm flex items-center justify-center shrink-0 p-1 relative z-10">
            <MiniLottie name="materi" className="w-14 h-14" />
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/80 rounded-3xl p-5 shadow-sm border-2 border-amber-200/80 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-black text-amber-950 flex items-center gap-1.5">
              <AnimatedVisual type="target" className="w-4 h-4" />
              <span>Progres Modul Ini</span>
            </span>
            <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-amber-900/80 font-bold">
            {completedSteps} dari {totalSteps} misi aktivitas telah diselesaikan.
          </p>
        </div>

        {/* Activity List */}
        <div className="flex flex-col gap-0 mt-1">
          <h2 className="text-base font-black text-blue-950 mb-5 flex items-center gap-1.5">
            <AnimatedVisual type="sparkles" className="w-4 h-4" />
            <span>Tahapan Aktivitas Belajar</span>
          </h2>
          
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isQuizStep = step.icon === 'quiz';
            
            return (
              <div key={step.id} className="flex gap-4 min-h-[84px]">
                
                {/* Timeline Line & Dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors shadow-sm ${
                    step.isDone 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
                      : isQuizStep
                      ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                      : 'bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                  }`}>
                    {step.isDone ? (
                      <Icon name="check" className="text-[18px]" />
                    ) : (
                      <span className="text-sm font-black">{step.id}</span>
                    )}
                  </div>
                  {!isLast && (
                    <div className={`w-1 h-full flex-1 my-2 rounded-full transition-colors ${step.isDone ? 'bg-emerald-400' : 'bg-amber-200'}`}></div>
                  )}
                </div>

                {/* Content Card */}
                <div className="flex-1 min-w-0 pb-6">
                  <div 
                    onClick={step.onClick}
                    className={`rounded-3xl p-4.5 shadow-sm border-2 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] min-h-[68px] flex items-center ${
                      step.isDone
                        ? 'bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 border-emerald-300'
                        : isQuizStep
                        ? 'bg-gradient-to-r from-amber-50/90 via-white to-orange-50/80 border-amber-300'
                        : 'bg-gradient-to-r from-sky-50/90 via-white to-indigo-50/70 border-sky-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 w-full">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        step.isDone
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : isQuizStep
                          ? 'bg-orange-100 text-orange-700 border border-orange-300'
                          : 'bg-sky-100 text-sky-700 border border-sky-300'
                      }`}>
                        <Icon name={step.icon} className="text-[22px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-black truncate text-slate-900">
                          {step.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">{step.desc}</p>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="hidden sm:block shrink-0 ml-2">
                        {step.isDone ? (
                          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full shadow-2xs">Selesai ✓</span>
                        ) : (
                          <span className={`px-3 py-1 text-white text-xs font-black rounded-full shadow-2xs ${
                            isQuizStep ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-sky-500 to-blue-600'
                          }`}>
                            Mulai →
                          </span>
                        )}
                      </div>
                      
                      <Icon name="chevron_right" className="text-slate-500 block sm:hidden" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
