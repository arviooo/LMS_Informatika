import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { api } from '@lms/shared';
import { useAuth } from '../../App';

import Icon from '../../components/Icon';
import { QuizPageSkeleton } from '../../components/ui/PageSkeleton';

/**
 * Ilustrasi Panggung Kuis Interaktif (Berganti suasana tiap nomor soal agar seru bagi siswa kelas 7)
 */
function QuizStageIllustration({
  questionIndex,
  topicTitle,
  quizTitle,
  points,
  isAnswered,
}: {
  questionIndex: number;
  topicTitle?: string;
  quizTitle?: string;
  points: number;
  isAnswered: boolean;
}) {
  const themeIndex = questionIndex % 4;

  const themes = [
    {
      // Tema 1: Hutan Algoritma & Maskot Burung Pintar (Terinspirasi Gambar 1)
      skyGradient: 'from-[#6B4423] via-[#8C5828] to-[#3B5E2B]',
      badgeText: 'Petualangan Algoritma',
      mascotLabel: 'Fokus & Teliti!',
    },
    {
      // Tema 2: Ekspedisi Rimba Siber
      skyGradient: 'from-[#1E4D3B] via-[#2A6F4E] to-[#1A3C34]',
      badgeText: 'Eksplorasi Logika',
      mascotLabel: 'pecahkan Tantangan!',
    },
    {
      // Tema 3: Lembah Senja Komputasi
      skyGradient: 'from-[#7C3AED]/90 via-[#C2410C]/85 to-[#4338CA]',
      badgeText: 'Misi Berpikir Kritis',
      mascotLabel: 'Kamu Pasti Bisa!',
    },
    {
      // Tema 4: Oasis Data Digital
      skyGradient: 'from-[#0F4C81] via-[#1B6CA8] to-[#14532D]',
      badgeText: 'Tantangan Informatika',
      mascotLabel: ' Raih Poin Maksimal!',
    },
  ];

  const currentTheme = themes[themeIndex];

  return (
    <div
      className={`relative w-full h-[255px] sm:h-[285px] bg-gradient-to-b ${currentTheme.skyGradient} overflow-hidden select-none`}
    >
      {/* Background Illustrated Forest & Code Elements SVG */}
      <svg
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sunGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="foliageBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4D7C0F" />
            <stop offset="100%" stopColor="#14532D" />
          </linearGradient>
          <linearGradient id="foliageFront" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#65A30D" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="beakGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="75%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>
        </defs>

        {/* Soft Sunbeams */}
        <circle cx="200" cy="110" r="120" fill="url(#sunGlow)" />
        <polygon points="80,0 130,0 210,260 120,260" fill="#FEF3C7" opacity="0.08" />
        <polygon points="240,0 295,0 350,260 270,260" fill="#FEF3C7" opacity="0.07" />

        {/* Distant Tree Trunks */}
        <rect x="20" y="0" width="34" height="230" fill="#451A03" opacity="0.45" />
        <rect x="85" y="0" width="24" height="230" fill="#5C2D0C" opacity="0.35" />
        <rect x="305" y="0" width="40" height="230" fill="#451A03" opacity="0.45" />
        <rect x="360" y="0" width="26" height="230" fill="#5C2D0C" opacity="0.35" />

        {/* Floating Binary / Code Fireflies */}
        <circle cx="65" cy="95" r="3" fill="#FDE047" opacity="0.8" />
        <circle cx="330" cy="85" r="3.5" fill="#FDE047" opacity="0.7" />
        <circle cx="135" cy="70" r="2.5" fill="#A7F3D0" opacity="0.8" />
        <circle cx="275" cy="115" r="2.5" fill="#FDE047" opacity="0.85" />
        <text x="52" y="128" fill="#FEF08A" opacity="0.35" fontSize="11" fontWeight="bold" fontFamily="monospace">
          {'{01}'}
        </text>
        <text x="312" y="110" fill="#A7F3D0" opacity="0.35" fontSize="11" fontWeight="bold" fontFamily="monospace">
          {'</>'}
        </text>

        {/* Back Foliage Hills */}
        <path d="M0,195 Q95,155 205,185 T400,175 L400,260 L0,260 Z" fill="url(#foliageBack)" />

        {/* Decorative Jungle Leaves Left & Right */}
        <path d="M15,210 Q45,155 85,175 Q55,205 15,210 Z" fill="#84CC16" opacity="0.75" />
        <path d="M40,220 Q75,165 115,190 Q75,215 40,220 Z" fill="#4D7C0F" />
        <path d="M385,210 Q345,155 305,180 Q345,205 385,210 Z" fill="#84CC16" opacity="0.75" />
        <path d="M355,225 Q315,170 280,195 Q320,220 355,225 Z" fill="#15803D" />

        {/* Wooden Log / Branch */}
        <path
          d="M55,205 Q160,182 275,172"
          stroke="#5C240E"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M40,218 L245,214 C255,205 250,192 238,190 L55,196 Z"
          fill="#6B210B"
        />

        {/* Friendly Smart Toucan / Cyber-Bird Mascot */}
        <g transform="translate(155, 78)">
          {/* Tail */}
          <path d="M10,88 L-10,118 L8,120 L24,92 Z" fill="#0F172A" />
          {/* Body */}
          <path
            d="M18,45 C2,62 2,92 14,104 C28,108 48,96 54,72 C58,54 50,38 36,36 Z"
            fill="#0F2942"
          />
          {/* White/Yellow Chest */}
          <path
            d="M34,36 C48,38 54,52 50,68 C42,72 32,64 30,50 C29,42 31,37 34,36 Z"
            fill="#FFFFFF"
          />
          {/* Wing */}
          <path
            d="M14,56 C4,72 8,92 20,96 C32,88 38,70 32,54 Z"
            fill="#1E3A5F"
          />
          {/* Head */}
          <circle cx="36" cy="32" r="16" fill="#0F2942" />
          {/* Eye Ring & Eye */}
          <circle cx="40" cy="30" r="6" fill="#38BDF8" />
          <circle cx="40" cy="30" r="3.2" fill="#0F172A" />
          <circle cx="41.2" cy="28.8" r="1.2" fill="#FFFFFF" />
          {/* Vibrant Toucan Beak */}
          <path
            d="M48,21 C76,20 102,26 112,37 C94,43 72,43 47,40 Z"
            fill="url(#beakGrad)"
          />
          {/* Beak Tip */}
          <path d="M98,27 C105,30 110,33 112,37 C105,39 99,40 94,40 Z" fill="#271206" />
          {/* Feet on branch */}
          <path d="M24,103 L22,113 M28,104 L28,113 M38,102 L38,111 M42,102 L44,111" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Foreground Grass Silhouette */}
        <path d="M0,225 Q120,202 260,218 T400,212 L400,260 L0,260 Z" fill="url(#foliageFront)" />
      </svg>

      {/* Bottom Floating Context Pills (Quiz Topic, Points & Integrity Status) */}
      <div className="absolute bottom-10 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[11px] font-bold border border-white/15 shadow-sm max-w-[65%] truncate">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
          <span className="truncate">{quizTitle || topicTitle || currentTheme.badgeText}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold shadow-md">
          <Icon name="star" className="text-[13px]" />
          <span>+{points} Poin</span>
          {isAnswered && (
            <span className="ml-1 bg-white text-amber-700 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase">
              Terjawab
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  // Native <dialog> ref for Daftar Soal modal
  const drawerDialogRef = useRef<HTMLDialogElement>(null);

  // Anti-Cheating, Persistent Session & Integrity Refs
  const [violationCount, setViolationCount] = useState(0);
  const violationCountRef = useRef(0);
  const answersRef = useRef<Record<number, string>>({});
  const quizRef = useRef<any>(null);
  const endTimeRef = useRef<number | null>(null);
  const isSubmittingRef = useRef(false);
  const isFinishedRef = useRef(false);
  const isModalOpenRef = useRef(false);

  const getSessionStorageKey = (quizId: number | string) =>
    `lms_quiz_session_${user?.id || 'guest'}_${quizId}`;

  const persistSession = (
    quizId: number | string,
    patch: {
      endTime?: number;
      answers?: Record<number, string>;
      activeQuestionIndex?: number;
      violationCount?: number;
    }
  ) => {
    try {
      const key = getSessionStorageKey(quizId);
      const raw = localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem(key, JSON.stringify({ ...existing, ...patch }));
    } catch {
      // Abaikan jika localStorage dibatasi
    }
  };

  const clearPersistedSession = (quizId?: number | string) => {
    if (!quizId) return;
    try {
      localStorage.removeItem(getSessionStorageKey(quizId));
    } catch {
      // Abaikan
    }
  };

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/api/student/materials/${id}/quiz`);

      // If student already completed the quiz, show popup with last score and exit
      if (res.data.latest_attempt) {
        clearPersistedSession(res.data.id);
        Swal.fire({
          title: 'Kuis Telah Diselesaikan!',
          html: `
            <div style="font-size: 14px; text-align: center; padding: 6px 0;">
              <p style="margin-bottom: 12px; color: #4b5563;">Kamu telah menyelesaikan kuis ini dan sudah mengumpulkan jawaban.</p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; margin: 12px 0;">
                <p style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Nilai Terakhir</p>
                <p style="font-size: 38px; font-weight: 900; color: #1a2a4b; margin: 4px 0;">${res.data.latest_attempt.score}</p>
                <span style="display: inline-block; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; ${res.data.latest_attempt.is_passed ? 'background: #dcfce7; color: #15803d;' : 'background: #fee2e2; color: #b91c1c;'}">
                  ${res.data.latest_attempt.is_passed ? 'LULUS (TUNTAS)' : 'BELUM TUNTAS'}
                </span>
              </div>
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Kembali ke Materi',
          confirmButtonColor: '#1a2a4b',
          allowOutsideClick: false,
        }).then(() => {
          navigate(`/siswa/materi/${id}`);
        });
        return;
      }

      const loadedQuiz = res.data;
      quizRef.current = loadedQuiz;
      setQuiz(loadedQuiz);

      // Cek apakah siswa sudah pernah membuka kuis ini sebelumnya (Anti-Reset Timer & Jawaban)
      const storageKey = getSessionStorageKey(loadedQuiz.id);
      let savedSession: any = null;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) savedSession = JSON.parse(raw);
      } catch {
        savedSession = null;
      }

      const now = Date.now();
      if (savedSession && typeof savedSession.endTime === 'number') {
        const remaining = Math.max(0, Math.floor((savedSession.endTime - now) / 1000));
        const restoredAnswers = savedSession.answers || {};
        const restoredIndex =
          typeof savedSession.activeQuestionIndex === 'number' &&
          savedSession.activeQuestionIndex < (loadedQuiz.questions?.length || 1)
            ? savedSession.activeQuestionIndex
            : 0;
        const restoredViolations = savedSession.violationCount || 0;

        endTimeRef.current = savedSession.endTime;
        answersRef.current = restoredAnswers;
        setAnswers(restoredAnswers);
        setActiveQuestionIndex(restoredIndex);
        violationCountRef.current = restoredViolations;
        setViolationCount(restoredViolations);
        setTimeLeft(remaining);
      } else {
        const newEndTime = now + loadedQuiz.duration_minutes * 60 * 1000;
        endTimeRef.current = newEndTime;
        persistSession(loadedQuiz.id, {
          endTime: newEndTime,
          answers: {},
          activeQuestionIndex: 0,
          violationCount: 0,
        });
        setTimeLeft(loadedQuiz.duration_minutes * 60);
      }
    } catch (e: any) {
      if (e.response?.status === 403 || e.response?.status === 404) {
        alert('Kuis belum tersedia atau tidak ditemukan.');
      } else {
        alert('Gagal memuat kuis.');
      }
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  // Timer logic berbasis endTimeRef (tidak bisa diakali dengan reload/keluar)
  useEffect(() => {
    if (isLoading || !quiz || isFinishedRef.current) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const timer = setInterval(() => {
      if (endTimeRef.current) {
        const remaining = Math.max(0, Math.floor((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
      } else {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isLoading, quiz]);

  // Exit Guard: Cegah keluar diam-diam lewat tombol Back HP/Browser atau Tutup Tab
  useEffect(() => {
    if (isLoading || !quiz) return;

    // Pasang state riwayat untuk mencegat tombol Back browser/Android
    window.history.pushState({ quizGuard: true }, '', window.location.href);

    const handlePopState = () => {
      if (isFinishedRef.current || isSubmittingRef.current) return;
      // Tahan agar tidak langsung keluar, lalu tampilkan pop-up kumpulkan paksa
      window.history.pushState({ quizGuard: true }, '', window.location.href);
      handleExitAttempt();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFinishedRef.current || isSubmittingRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoading, quiz]);

  // Anti-Cheating: Tab Switch & Window Blur Detection
  useEffect(() => {
    if (isLoading || !quiz || isSubmitting) return;

    const handleVisibilityChange = () => {
      if (isSubmittingRef.current || isFinishedRef.current) return;
      if (document.hidden) {
        triggerViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoading, quiz, isSubmitting]);

  // Anti-Cheating: Anti Copy-Paste, Text Selection & Shortcut Protection
  useEffect(() => {
    if (isLoading || !quiz) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinishedRef.current) return;
      if (
        (e.ctrlKey && ['c', 'C', 'x', 'X', 'u', 'U'].includes(e.key)) ||
        (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J'].includes(e.key)) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        Swal.fire({
          toast: true,
          position: 'top',
          icon: 'warning',
          title: 'Aksi salin (copy) atau shortcut dinonaktifkan demi integritas kuis!',
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true,
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isFinishedRef.current) return;
      e.preventDefault();
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: 'Klik kanan dinonaktifkan selama pengerjaan kuis!',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      });
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (isFinishedRef.current) return;
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
    };
  }, [isLoading, quiz]);

  const triggerViolation = async () => {
    if (isSubmittingRef.current || isFinishedRef.current || isModalOpenRef.current) return;
    isModalOpenRef.current = true;

    const nextCount = violationCountRef.current + 1;
    violationCountRef.current = nextCount;
    setViolationCount(nextCount);
    if (quizRef.current?.id) {
      persistSession(quizRef.current.id, { violationCount: nextCount });
    }

    if (nextCount === 1) {
      await Swal.fire({
        title: 'Peringatan Integritas (1/3)',
        html: `
          <div style="text-align: left; font-size: 14px; color: #334155; line-height: 1.6;">
            <p style="font-weight: 700; color: #d97706; margin-bottom: 8px;">
              Anda terdeteksi meninggalkan halaman kuis!
            </p>
            <p style="margin-bottom: 8px;">
              Selama ujian berlangsung, Anda <b>dilarang keras</b> membuka tab baru, mencari jawaban di Google, atau menggunakan AI (ChatGPT, Gemini, dll).
            </p>
            <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 10px 14px; border-radius: 12px; color: #92400e; font-size: 13px; font-weight: 600;">
              ⚠️ Ini adalah peringatan pertama. Toleransi tersisa: <b>2 kali lagi</b> sebelum kuis diserahkan secara otomatis.
            </div>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Saya Mengerti & Kembali Mengerjakan',
        confirmButtonColor: '#0284c7',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      isModalOpenRef.current = false;
    } else if (nextCount === 2) {
      await Swal.fire({
        title: 'Peringatan Keras (2/3)',
        html: `
          <div style="text-align: left; font-size: 14px; color: #334155; line-height: 1.6;">
            <p style="font-weight: 700; color: #dc2626; margin-bottom: 8px;">
              Anda terdeteksi meninggalkan kuis untuk KEDUA KALINYA!
            </p>
            <p style="margin-bottom: 8px;">
              Sistem integritas LMS telah mencatat log aktivitas Anda.
            </p>
            <div style="background-color: #fee2e2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 12px; color: #991b1b; font-size: 13px; font-weight: 700;">
              ⛔ PERINGATAN TERAKHIR: Jika Anda berpindah tab atau keluar dari browser 1 KALI LAGI, kuis akan <u>OTOMATIS DIKUMPULKAN</u> secara paksa saat itu juga!
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Kembali ke Soal Sekarang',
        confirmButtonColor: '#dc2626',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      isModalOpenRef.current = false;
    } else if (nextCount >= 3) {
      await Swal.fire({
        title: 'Batas Pelanggaran Habis (3/3)',
        html: `
          <div style="text-align: left; font-size: 14px; color: #334155; line-height: 1.6;">
            <p style="font-weight: 700; color: #991b1b; margin-bottom: 8px;">
              Batas toleransi pelanggaran telah habis (3/3 kali)!
            </p>
            <p style="margin-bottom: 8px;">
              Anda terbukti berpindah tab berulang kali selama kuis berlangsung. Demi menjaga integritas akademik, pengerjaan kuis Anda dihentikan.
            </p>
            <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 12px; color: #334155; font-size: 13px; font-weight: 600;">
              ℹ️ Seluruh jawaban yang telah Anda pilih saat ini otomatis dikirimkan ke guru pengampu.
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Kumpulkan Sekarang',
        confirmButtonColor: '#475569',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      isModalOpenRef.current = false;
      submitQuiz(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionId: string) => {
    if (!quiz) return;
    const activeQuestion = quiz.questions[activeQuestionIndex];
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [activeQuestion.id]: optionId,
      };
      answersRef.current = updated;
      persistSession(quiz.id, { answers: updated });
      return updated;
    });
  };

  const handleNext = () => {
    if (quiz && activeQuestionIndex < quiz.questions.length - 1) {
      const nextIdx = activeQuestionIndex + 1;
      setActiveQuestionIndex(nextIdx);
      persistSession(quiz.id, { activeQuestionIndex: nextIdx });
    }
  };

  const handlePrev = () => {
    if (quiz && activeQuestionIndex > 0) {
      const prevIdx = activeQuestionIndex - 1;
      setActiveQuestionIndex(prevIdx);
      persistSession(quiz.id, { activeQuestionIndex: prevIdx });
    }
  };

  const openQuestionDrawer = () => {
    if (drawerDialogRef.current && !drawerDialogRef.current.open) {
      drawerDialogRef.current.showModal();
    }
  };

  const closeQuestionDrawer = () => {
    if (drawerDialogRef.current && drawerDialogRef.current.open) {
      drawerDialogRef.current.close();
    }
  };

  const submitQuiz = async (isAuto = false) => {
    const activeQuiz = quizRef.current || quiz;
    if (!activeQuiz || isSubmittingRef.current) return;
    closeQuestionDrawer();
    isFinishedRef.current = true;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/student/quizzes/${activeQuiz.id}/submit`, {
        answers: answersRef.current,
      });
      clearPersistedSession(activeQuiz.id);
      await Swal.fire({
        title: 'Kuis Selesai!',
        html: `<b>Nilai Kamu: ${res.data.score}</b><br/>Status: ${res.data.is_passed ? 'LULUS' : 'TIDAK LULUS'}`,
        icon: res.data.is_passed ? 'success' : 'warning',
        confirmButtonText: 'Tutup',
      });
      navigate('/materi', { replace: true });
    } catch (e) {
      isFinishedRef.current = false;
      isSubmittingRef.current = false;
      await Swal.fire('Error', 'Gagal menyerahkan kuis. Periksa koneksi internetmu.', 'error');
      if (isAuto) {
        navigate('/materi', { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitAttempt = async () => {
    const activeQuiz = quizRef.current || quiz;
    if (!activeQuiz || isFinishedRef.current || isSubmittingRef.current || isModalOpenRef.current) return;
    closeQuestionDrawer();
    isModalOpenRef.current = true;

    const currentAnswered = Object.keys(answersRef.current).length;
    const totalCount = activeQuiz.questions?.length || 0;

    const result = await Swal.fire({
      title: 'Keluar & Kumpulkan Paksa?',
      html: `
        <div style="text-align: left; font-size: 14px; color: #334155; line-height: 1.6;">
          <p style="font-weight: 700; color: #dc2626; margin-bottom: 8px;">
            Kamu tidak diperbolehkan keluar lalu mengulang kuis dari awal!
          </p>
          <p style="margin-bottom: 10px;">
            Soal yang terjawab saat ini: <b>${currentAnswered} dari ${totalCount} soal</b>.
          </p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 12px; color: #991b1b; font-size: 13px; font-weight: 600;">
            Jika kamu tetap keluar sekarang, seluruh jawabanmu akan <u>OTOMATIS DIKUMPULKAN SECARA PAKSA</u> dan kuis langsung ditutup.
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar & Kumpulkan Paksa',
      cancelButtonText: 'Batal, Lanjut Mengerjakan',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#2563eb',
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    isModalOpenRef.current = false;

    if (result.isConfirmed) {
      submitQuiz(true);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    closeQuestionDrawer();
    const answeredCount = Object.keys(answers).length;
    const totalCount = quiz.questions.length;

    if (answeredCount < totalCount) {
      const result = await Swal.fire({
        title: 'Yakin Ingin Mengirim?',
        text: `Masih ada ${totalCount - answeredCount} soal yang belum dijawab.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kirim',
        cancelButtonText: 'Batal',
      });
      if (!result.isConfirmed) return;
    }

    submitQuiz(false);
  };

  const handleAutoSubmit = async () => {
    if (isFinishedRef.current || isSubmittingRef.current) return;
    closeQuestionDrawer();
    await Swal.fire('Waktu Habis!', 'Jawaban kuis otomatis dikirimkan.', 'info');
    submitQuiz(true);
  };

  if (isLoading) {
    return <QuizPageSkeleton />;
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 text-center">
        <Icon name="assignment_turned_in" className="text-[64px] text-outline-variant mb-4" />
        <h2 className="text-xl font-bold text-on-surface mb-2">Kuis Kosong</h2>
        <p className="text-on-surface-variant mb-6">Guru belum menambahkan soal pada kuis ini.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all"
        >
          Kembali ke Materi
        </button>
      </div>
    );
  }

  const activeQuestion = quiz.questions[activeQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLowTime = timeLeft < 180;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = Math.round(((activeQuestionIndex + 1) / totalQuestions) * 100);
  const isLastQuestion = activeQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-[100dvh] bg-[#E8ECE2] flex flex-col items-center justify-start sm:py-6 sm:px-4 select-none antialiased">
      {/* Main Quiz Mobile-First Container (Mirip Gambar 1) */}
      <div className="w-full max-w-lg bg-white sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden flex flex-col min-h-[100dvh] sm:min-h-[820px] relative">
        
        {/* ─── Top Overlay Control Bar (Counter, Progress Bar, Daftar Soal Button) ─── */}
        <header className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 pt-4 pb-2 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Question Counter ("9 of 15") + Exit */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExitAttempt}
                aria-label="Keluar Kuis"
                className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/45 backdrop-blur-md text-white flex items-center justify-center transition-colors border border-white/20"
                title="Keluar & Kumpulkan Kuis"
              >
                <Icon name="arrow_back" className="text-[16px]" />
              </button>
              <span className="text-white font-extrabold text-sm sm:text-base drop-shadow-sm tracking-tight">
                {activeQuestionIndex + 1} dari {totalQuestions}
              </span>
            </div>

            {/* Center: Warm Orange-Amber Progress Bar on White Track (Gambar 1) */}
            <div className="flex-1 max-w-[180px] sm:max-w-[220px] h-2.5 bg-white/90 rounded-full overflow-hidden shadow-inner p-[1.5px]">
              <div
                className="h-full bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(8, progressPercentage)}%` }}
              />
            </div>

            {/* Right: Daftar Soal Button (Sesuai Permintaan User) */}
            <button
              type="button"
              onClick={openQuestionDrawer}
              aria-label="Buka Daftar Soal"
              className="relative h-10 px-3 rounded-full bg-white text-slate-800 shadow-lg hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1.5 font-extrabold text-xs shrink-0"
              title="Lihat Daftar Soal"
            >
              <Icon name="apps" className="text-[18px] text-[#D97706]" />
              <span className="hidden xs:inline">Soal</span>
              <span className="bg-amber-500/15 text-[#B45309] px-1.5 py-0.5 rounded-full text-[10px] font-black">
                {answeredCount}/{totalQuestions}
              </span>
            </button>
          </div>

          {/* Sub-bar: Timer & Integrity Indicator */}
          <div className="flex items-center justify-between gap-2">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-2xs ${
                violationCount === 0
                  ? 'bg-emerald-950/55 border-emerald-400/30 text-emerald-200'
                  : violationCount === 1
                  ? 'bg-amber-950/65 border-amber-400/40 text-amber-200'
                  : 'bg-rose-950/75 border-rose-400/50 text-rose-200 animate-pulse'
              }`}
            >
              <Icon name="verified" className="text-[13px]" />
              <span>
                {violationCount === 0
                  ? 'Anti-Curang Aktif'
                  : `Peringatan Tab: ${violationCount}/3`}
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md border shadow-sm ${
                isLowTime
                  ? 'bg-rose-600/90 border-rose-300 text-white animate-pulse'
                  : 'bg-black/40 border-white/20 text-white'
              }`}
            >
              <Icon name={isLowTime ? 'timer_off' : 'timer'} className="text-[14px] text-amber-300" />
              <span className="font-mono tracking-wider">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </header>

        {/* ─── Top Illustrated Hero Stage ─── */}
        <QuizStageIllustration
          questionIndex={activeQuestionIndex}
          topicTitle={quiz.topic_title}
          quizTitle={quiz.title}
          points={activeQuestion.points}
          isAnswered={Boolean(answers[activeQuestion.id])}
        />

        {/* ─── Bottom White Rounded Card Sheet (Mirip Gambar 1) ─── */}
        <main className="relative z-20 -mt-7 flex-1 bg-white rounded-t-[2.25rem] px-5 sm:px-7 pt-7 pb-7 flex flex-col justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.12)]">
          <div>
            {/* Question Number & Quick Jump Pill Strip */}
            <div className="flex items-center justify-center mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[#B45309] text-xs font-extrabold tracking-wide">
                Pertanyaan #{activeQuestionIndex + 1}
              </span>
            </div>

            {/* Question Text (Centered bold clean typography like Gambar 1) */}
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 text-center leading-snug mb-6 px-1">
              {activeQuestion.question_text}
            </h1>

            {/* Answer Option Pills (A, B, C, D) */}
            <fieldset className="flex flex-col gap-3.5">
              <legend className="sr-only">Pilihan Jawaban</legend>
              {activeQuestion.options.map((opt: any) => {
                const isSelected = answers[activeQuestion.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`group relative flex items-center min-h-[60px] px-3.5 py-2.5 rounded-full transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#D97706] via-[#EA580C] to-[#F59E0B] text-white shadow-lg shadow-orange-500/30 scale-[1.01]'
                        : 'bg-[#F4F5F7] hover:bg-amber-50/70 text-slate-800 border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    <input
                      className="sr-only"
                      name="quiz-answer"
                      type="radio"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => handleSelectAnswer(opt.id)}
                    />

                    {/* Left Circular Letter Badge (A, B, C, D) */}
                    <div
                      className={`w-10 h-10 rounded-full font-extrabold text-base flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        isSelected
                          ? 'bg-white text-[#D97706] shadow-sm'
                          : 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white shadow-xs'
                      }`}
                    >
                      {opt.id}
                    </div>

                    {/* Middle Option Text */}
                    <div className="ml-3.5 mr-3 flex-1 min-w-0">
                      <span
                        className={`text-sm sm:text-base leading-snug block break-words ${
                          isSelected ? 'text-white font-extrabold' : 'text-slate-800 font-bold'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    {/* Right Checkmark / Radio Circle */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-1 transition-all ${
                        isSelected
                          ? 'border-2 border-white bg-white/20 text-white'
                          : 'border-2 border-slate-300 bg-transparent text-transparent group-hover:border-amber-400'
                      }`}
                    >
                      {isSelected && <Icon name="check" className="text-[14px]" />}
                    </div>
                  </label>
                );
              })}
            </fieldset>
          </div>

          {/* ─── Bottom Action Bar (Green Pill "Next ->" Button like Gambar 1) ─── */}
          <div className="mt-8 pt-2 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {activeQuestionIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Soal Sebelumnya"
                  className="h-14 w-14 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 active:scale-95 transition-all border border-slate-200"
                  title="Soal Sebelumnya"
                >
                  <Icon name="arrow_back" className="text-[20px]" />
                </button>
              )}

              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 h-14 px-6 rounded-full bg-gradient-to-r from-[#3F7D20] to-[#4E9428] hover:brightness-105 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#3F7D20]/30 active:scale-[0.98] transition-all"
                >
                  <span>Selanjutnya</span>
                  <Icon name="arrow_forward" className="text-[20px]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 h-14 px-6 rounded-full bg-gradient-to-r from-[#3F7D20] to-[#15803D] hover:brightness-105 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="progress_activity" className="animate-spin text-[20px]" />
                      <span>Mengirim Jawaban...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="task_alt" className="text-[20px]" />
                      <span>Selesai & Kumpulkan</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Quick Submit Link if all questions answered before the last slide */}
            {!isLastQuestion && answeredCount === totalQuestions && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Icon name="task_alt" className="text-[16px] text-emerald-600" />
                <span>Semua soal sudah terjawab! Klik untuk Kumpulkan Sekarang</span>
              </button>
            )}
          </div>
        </main>
      </div>

      {/* ─── Native Modal Dialog: Peta Navigasi Daftar Soal ─── */}
      <dialog
        ref={drawerDialogRef}
        aria-labelledby="quiz-drawer-title"
        onClick={(e) => {
          if (e.target === drawerDialogRef.current) {
            closeQuestionDrawer();
          }
        }}
        className="m-auto w-[92vw] max-w-md rounded-[2rem] bg-white text-slate-800 p-0 shadow-2xl border border-slate-100 backdrop:bg-black/55 backdrop:backdrop-blur-xs"
      >
        <div className="p-5 sm:p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#D97706]">
                Navigasi Kuis
              </span>
              <h2 id="quiz-drawer-title" className="text-lg font-extrabold text-slate-900">
                Daftar Nomor Soal
              </h2>
            </div>
            <button
              type="button"
              onClick={closeQuestionDrawer}
              aria-label="Tutup Daftar Soal"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>

          {/* Grid Nomor Soal */}
          <div className="grid grid-cols-5 gap-2.5">
            {quiz.questions.map((q: any, idx: number) => {
              const isAnswered = Boolean(answers[q.id]);
              const isActive = idx === activeQuestionIndex;

              let btnStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200';
              let statusLabel = 'Kosong';

              if (isActive) {
                btnStyle =
                  'bg-[#3F7D20] text-white ring-2 ring-[#3F7D20] ring-offset-2 font-black shadow-md';
                statusLabel = 'Aktif';
              } else if (isAnswered) {
                btnStyle =
                  'bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-extrabold shadow-xs';
                statusLabel = 'Dijawab';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setActiveQuestionIndex(idx);
                    persistSession(quiz.id, { activeQuestionIndex: idx });
                    closeQuestionDrawer();
                  }}
                  className={`h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${btnStyle}`}
                >
                  <span className="text-base font-extrabold leading-none">{idx + 1}</span>
                  <span className="text-[9px] uppercase tracking-wider mt-1 opacity-90 font-bold">
                    {statusLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-around gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706]" />
              <span>Terjawab ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#3F7D20]" />
              <span>Sedang Dibuka</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300" />
              <span>Belum ({totalQuestions - answeredCount})</span>
            </div>
          </div>

          {/* Submit Action inside Drawer */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#3F7D20] to-[#15803D] hover:brightness-105 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all disabled:opacity-50"
          >
            <Icon name="task_alt" className="text-[18px]" />
            <span>Selesai & Kumpulkan Kuis ({answeredCount}/{totalQuestions})</span>
          </button>
        </div>
      </dialog>
    </div>
  );
}
