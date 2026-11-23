import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import lottie from 'lottie-web';

import Icon from '../components/Icon';
import AppDownloadModal, { isRunningInInstalledApp } from '../components/ui/AppDownloadModal';
import { LandingPageSkeleton } from '../components/ui/PageSkeleton';
import { AnimatedVisual } from '../components/ui/AnimatedVisuals';
import { playScrollRevealSound } from '../lib/soundEffects';

import heroLottieData from '../assets/lottie/hero.json';
import materiLottieData from '../assets/lottie/materi.json';
import kuisLottieData from '../assets/lottie/kuis.json';
import progresLottieData from '../assets/lottie/progres.json';

const LOTTIE_ANIMATIONS = {
  hero: heroLottieData,
  materi: materiLottieData,
  kuis: kuisLottieData,
  progres: progresLottieData,
} as const;

/**
 * Komponen Pemutar Animasi LottieFiles Terbundel Langsung (Zero External Fetch).
 * Seluruh data JSON + aset gambar internal dari 4 file .lottie pengguna sudah dibundel
 * langsung ke dalam aplikasi agar langsung tampil tanpa risiko gagal muat atau fallback.
 */
function AnimatedLottieSlot({
  slot,
  className = '',
}: {
  slot: keyof typeof LOTTIE_ANIMATIONS;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const clonedData = JSON.parse(JSON.stringify(LOTTIE_ANIMATIONS[slot]));

    const animInstance = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: clonedData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    return () => {
      animInstance.destroy();
    };
  }, [slot]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center [&_svg]:!w-full [&_svg]:!h-full ${className}`}
    />
  );
}

/**
 * Efek Animasi Ketik (Typewriter) untuk judul "RuangInfo!" agar terasa lebih hidup.
 */
function TypewriterBrandText({ text = 'RuangInfo!' }: { text?: string }) {
  const [displayed, setDisplayed] = useState(text);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(text);
      return;
    }

    let charIdx = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!isDeleting) {
        charIdx++;
        setDisplayed(text.slice(0, charIdx));
        if (charIdx === text.length) {
          isDeleting = true;
          timeoutId = setTimeout(tick, 2800);
        } else {
          timeoutId = setTimeout(tick, 115);
        }
      } else {
        charIdx--;
        setDisplayed(text.slice(0, Math.max(1, charIdx)));
        if (charIdx <= 1) {
          isDeleting = false;
          timeoutId = setTimeout(tick, 450);
        } else {
          timeoutId = setTimeout(tick, 65);
        }
      }
    };

    charIdx = 0;
    setDisplayed('');
    timeoutId = setTimeout(tick, 250);

    return () => clearTimeout(timeoutId);
  }, [text]);

  return (
    <span className="inline-flex items-center min-w-[195px] sm:min-w-[270px] px-3.5 py-0.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20 -rotate-1 hover:rotate-1 transition-transform">
      <span>{displayed}</span>
      <span
        aria-hidden="true"
        className="inline-block w-[3px] h-[0.85em] ml-1 bg-white/95 rounded-full animate-pulse"
      />
    </span>
  );
}

export default function LandingPage() {
  const [showAppModal, setShowAppModal] = useState(false);
  const [isAutoTriggered, setIsAutoTriggered] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isInApp = isRunningInInstalledApp();

  useEffect(() => {
    const img = new Image();
    img.src = '/logo-spengu.png';
    const done = () => setIsReady(true);
    img.onload = done;
    img.onerror = done;
    const fallback = setTimeout(done, 350);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (isInApp) return;

    try {
      const alreadyDownloaded = localStorage.getItem('lms_apk_downloaded');
      if (alreadyDownloaded === 'true') {
        return;
      }
      const dismissedUntil = localStorage.getItem('lms_app_prompt_dismissed_until');
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return;
      }
    } catch {
      // Abaikan jika localStorage dibatasi browser
    }

    const timer = setTimeout(() => {
      if (!isRunningInInstalledApp()) {
        setIsAutoTriggered(true);
        setShowAppModal(true);
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isInApp]);

  // Efek Scroll-Reveal + Suara Halus Saat Siswa Scroll ke Bawah
  useEffect(() => {
    if (!isReady) return;
    const elements = document.querySelectorAll('.scroll-reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('is-revealed')) {
            entry.target.classList.add('is-revealed');
            playScrollRevealSound();
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -30px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isReady]);

  if (!isReady) {
    return <LandingPageSkeleton />;
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-white text-[#18181B] selection:bg-amber-200 selection:text-slate-900 animate-fade-in">
      {/* ─── Navigation Bar (Putih Bersih Tanpa Tombol APK di Kanan Atas) ─── */}
      <nav className="w-full px-5 sm:px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-40 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-amber-100 via-white to-sky-100 rounded-2xl flex items-center justify-center p-1.5 shadow-sm border-2 border-amber-300/80 transition-transform duration-300 hover:scale-105">
            <img src="/logo-spengu.png" alt="Logo SMP Negeri 3 Gubug" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#18181B] leading-tight tracking-tight">RuangInfo</h1>
            <p className="text-[10px] text-blue-600 uppercase tracking-[0.16em] font-black">
              SMPN 3 Gubug
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full text-xs sm:text-sm font-black shadow-md shadow-blue-500/20 hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 transition-all duration-200 flex items-center gap-1.5"
          >
            <span>Masuk</span>
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section (Background Putih Murni Agar Animasi Menyatu Tanpa Box Putih) ──── */}
      <section className="relative px-5 sm:px-8 pt-6 pb-16 sm:py-16 overflow-hidden bg-white">
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Top / Right: Animated Character Hero Illustration (Tanpa Kotak Pembungkus) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center order-1 lg:order-2 relative group">
            {/* Floating Playful Badges around Lottie (Ilustrasi Vektor 3D-Style) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border-2 border-amber-300 shadow-sm text-amber-800 text-xs font-black absolute top-4 left-2 z-20 -rotate-6 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105">
              <AnimatedVisual type="quiz" className="w-4 h-4" />
              <span>Kuis Seru!</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border-2 border-emerald-300 shadow-sm text-emerald-800 text-xs font-black absolute bottom-6 right-2 z-20 rotate-6 transition-transform duration-300 group-hover:translate-y-1 group-hover:scale-105">
              <AnimatedVisual type="trophy" className="w-4 h-4" />
              <span>E-Sertifikat</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border-2 border-sky-300 shadow-sm text-sky-800 text-xs font-black absolute top-8 right-0 z-20 rotate-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-105">
              <AnimatedVisual type="sparkles" className="w-4 h-4" />
              <span>Kelas VII</span>
            </div>

            <div className="relative z-10 transition-transform duration-500 group-hover:scale-[1.03]">
              <AnimatedLottieSlot
                slot="hero"
                className="w-72 h-72 sm:w-88 sm:h-88 lg:w-[410px] lg:h-[410px]"
              />
            </div>
          </div>

          {/* Bottom / Left: Bold Stacked Headline dengan Animasi Ketik + Subtitle + Colorful Pill Buttons */}
          <div className="w-full max-w-md lg:max-w-xl lg:w-1/2 flex flex-col items-start text-left order-2 lg:order-1">
            <h2 className="text-[2.35rem] sm:text-5xl lg:text-[3.4rem] font-black text-[#18181B] leading-[1.14] tracking-tight mb-4">
              Belajar Seru
              <span className="block text-blue-600">
                Hal Baru Setiap
              </span>
              <span className="inline-flex flex-wrap items-center gap-2 mt-1">
                <span>Hari di</span>
                <TypewriterBrandText text="RuangInfo!" />
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed mb-7 max-w-md">
              Belajar Informatika nggak lagi membosankan! Jelajahi modul penuh warna, taklukkan tantangan kuis interaktif, dan kumpulkan lencana kelulusanmu setiap hari.
            </p>

            {/* Mini Colorful Feature Pills dengan Ilustrasi Custom & Efek Hover */}
            <div className="flex flex-wrap gap-2 mb-7">
              <span className="interactive-card px-3.5 py-1.5 rounded-full bg-sky-100 hover:bg-sky-200/80 text-sky-800 border border-sky-300 text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-default">
                <AnimatedVisual type="book" className="w-4 h-4" />
                <span>Materi Visual</span>
              </span>
              <span className="interactive-card px-3.5 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200/80 text-amber-800 border border-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-default">
                <AnimatedVisual type="target" className="w-4 h-4" />
                <span>Kuis Petualangan</span>
              </span>
              <span className="interactive-card px-3.5 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200/80 text-emerald-800 border border-emerald-300 text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-default">
                <AnimatedVisual type="bolt" className="w-4 h-4" />
                <span>Hemat Kuota</span>
              </span>
            </div>

            {/* Stacked Pill Buttons */}
            <div className="w-full flex flex-col sm:flex-row lg:flex-col gap-3.5 max-w-md">
              <Link
                to="/login"
                className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 active:scale-[0.99] transition-all"
              >
                <span>Mulai Belajar Sekarang</span>
                <Icon name="arrow_forward" className="text-[20px]" />
              </Link>

              {!isInApp ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoTriggered(false);
                    setShowAppModal(true);
                  }}
                  className="w-full py-4 px-8 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-full font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-[0.99] transition-all"
                >
                  <Icon name="smartphone" className="text-[19px] text-white" />
                  <span>Pasang Aplikasi HP (.APK)</span>
                </button>
              ) : (
                <a
                  href="#keunggulan"
                  className="w-full py-4 px-8 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-full font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm border-2 border-amber-300 hover:-translate-y-0.5 active:scale-[0.99] transition-all"
                >
                  <span>Jelajahi Fitur Seru</span>
                  <Icon name="south" className="text-[18px]" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section dengan Scroll-Reveal & Hover Interaktif ─── */}
      <section id="keunggulan" className="px-5 sm:px-8 py-20 bg-white border-t border-slate-200/70 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="scroll-reveal text-center mb-14">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-100 border-2 border-sky-200 text-sky-800 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
              <AnimatedVisual type="sparkles" className="w-4 h-4" />
              <span>Fitur Unggulan Siswa</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-[#18181B] mb-3 tracking-tight">
              Belajar Informatika Jadi{' '}
              <span className="text-blue-600">
                Makin Asyik &amp; Berwarna!
              </span>
            </h3>
            <p className="text-slate-600 font-medium text-sm sm:text-base max-w-xl mx-auto">
              Dirancang khusus untuk siswa kelas VII SMP Negeri 3 Gubug dengan tampilan ceria, penuh warna, dan interaktif agar semangat belajar setiap hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-8">
            {/* 1. Materi Terstruktur — Tema Sky Cyan Cerah */}
            <div className="scroll-reveal interactive-card p-7 bg-gradient-to-br from-sky-100/90 via-cyan-50 to-blue-100/80 rounded-[2.25rem] shadow-md hover:shadow-2xl hover:shadow-sky-500/15 border-2 border-sky-300/80 hover:border-sky-400 transition-all duration-300 group hover:-translate-y-2.5 hover:scale-[1.015] flex flex-col items-start relative overflow-hidden cursor-pointer">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-sky-300/30 blur-xl pointer-events-none" />
              <div className="w-32 h-32 mb-5 rounded-3xl bg-white border-2 border-sky-200 shadow-sm flex items-center justify-center p-2 self-center sm:self-start transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2">
                <AnimatedLottieSlot
                  slot="materi"
                  className="w-28 h-28"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
                <AnimatedVisual type="book" className="w-3.5 h-3.5" />
                <span>01 • Modul Visual</span>
              </span>
              <h4 className="text-xl font-black text-sky-950 mb-2.5 group-hover:text-blue-700 transition-colors">Materi Terstruktur</h4>
              <p className="text-sky-900/80 font-medium text-sm leading-relaxed">
                Modul pembelajaran disusun bertahap per bab, dilengkapi video hemat kuota dan estimasi waktu baca agar belajar lebih fokus dan tidak membosankan.
              </p>
            </div>

            {/* 2. Kuis & Ujian Interaktif — Tema Sunny Amber & Yellow Cerah */}
            <div className="scroll-reveal interactive-card p-7 bg-gradient-to-br from-amber-100/90 via-orange-50 to-yellow-100/90 rounded-[2.25rem] shadow-md hover:shadow-2xl hover:shadow-amber-500/15 border-2 border-amber-300/90 hover:border-amber-400 transition-all duration-300 group hover:-translate-y-2.5 hover:scale-[1.015] flex flex-col items-start relative overflow-hidden cursor-pointer">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-300/35 blur-xl pointer-events-none" />
              <div className="w-32 h-32 mb-5 rounded-3xl bg-white border-2 border-amber-200 shadow-sm flex items-center justify-center p-2 self-center sm:self-start transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2">
                <AnimatedLottieSlot
                  slot="kuis"
                  className="w-28 h-28"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
                <AnimatedVisual type="quiz" className="w-3.5 h-3.5" />
                <span>02 • Evaluasi Seru</span>
              </span>
              <h4 className="text-xl font-black text-amber-950 mb-2.5 group-hover:text-orange-700 transition-colors">Kuis &amp; Ujian Interaktif</h4>
              <p className="text-amber-900/80 font-medium text-sm leading-relaxed">
                Uji pemahamanmu lewat kuis bergaya petualangan yang seru! Nilai dan status kelulusan langsung keluar otomatis begitu selesai dikerjakan.
              </p>
            </div>

            {/* 3. Pantauan Progres Terpusat — Tema Emerald Mint Cerah */}
            <div className="scroll-reveal interactive-card p-7 bg-gradient-to-br from-emerald-100/90 via-teal-50 to-green-100/80 rounded-[2.25rem] shadow-md hover:shadow-2xl hover:shadow-emerald-500/15 border-2 border-emerald-300/80 hover:border-emerald-400 transition-all duration-300 group hover:-translate-y-2.5 hover:scale-[1.015] flex flex-col items-start relative overflow-hidden cursor-pointer">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-300/35 blur-xl pointer-events-none" />
              <div className="w-32 h-32 mb-5 rounded-3xl bg-white border-2 border-emerald-200 shadow-sm flex items-center justify-center p-2 self-center sm:self-start transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2">
                <AnimatedLottieSlot
                  slot="progres"
                  className="w-28 h-28"
                />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-black uppercase tracking-wider mb-3 shadow-xs">
                <AnimatedVisual type="trophy" className="w-3.5 h-3.5" />
                <span>03 • Capaian &amp; Sertifikat</span>
              </span>
              <h4 className="text-xl font-black text-emerald-950 mb-2.5 group-hover:text-emerald-700 transition-colors">Pantauan Progres Terpusat</h4>
              <p className="text-emerald-900/80 font-medium text-sm leading-relaxed">
                Pantau persentase ketuntasan belajarmu secara langsung dan raih E-Sertifikat kelulusan resmi saat seluruh materi selesai dipelajari!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dedicated App Download Showcase Section (Hanya tampil di Web Browser) ─── */}
      {!isInApp && (
        <section className="px-5 sm:px-8 py-14 bg-white relative z-10 border-t border-slate-100">
          <div className="scroll-reveal max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 rounded-[2.25rem] p-7 sm:p-10 border-2 border-sky-300/70 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-300/25 rounded-full blur-2xl pointer-events-none" />
            <div className="flex-1 text-center md:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
                <Icon name="smartphone" className="text-[16px]" />
                Aplikasi Android Resmi
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2.5 tracking-tight">
                Pasang Aplikasi RuangInfo di HP Kamu!
              </h3>
              <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed mb-6 max-w-xl">
                Dapatkan pengalaman belajar yang jauh lebih praktis dan seru. Cukup sekali ketuk dari layar utama HP, hemat kuota internet, dan bebas dari gangguan tab browser.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoTriggered(false);
                    setShowAppModal(true);
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Icon name="download" className="text-[18px]" />
                  <span>Unduh File .APK (~7.5 MB)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoTriggered(false);
                    setShowAppModal(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-full font-bold text-sm transition-colors backdrop-blur-xs"
                >
                  Petunjuk Pemasangan
                </button>
              </div>
            </div>

            {/* Visual Phone Mockup / Badge */}
            <div className="shrink-0 flex flex-col items-center p-6 bg-white text-slate-900 rounded-3xl border-2 border-amber-300 shadow-lg text-center w-full max-w-[230px] relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-sky-100 p-2.5 mb-3 border-2 border-amber-300 flex items-center justify-center">
                <img src="/logo-spengu.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h4 className="font-black text-sm text-[#18181B]">LMS Informatika</h4>
              <p className="text-[11px] text-slate-600 font-semibold mb-3">Versi Android • 7.5 MB</p>
              <span className="w-full py-1.5 px-3 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider">
                ✓ Siap Dipasang
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer: Background Khusus Kontras (Deep Royal Navy) untuk Medsos & Lokasi ─── */}
      <footer className="mt-auto relative overflow-hidden px-4 sm:px-8 pt-8 sm:pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-8 bg-gradient-to-br from-[#0F172A] via-[#132247] to-[#1E3A8A] text-white border-t-4 border-amber-400">
        {/* Soft Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 pb-6 md:pb-8 border-b border-white/15">
            {/* Kolom 1: Identitas & Alamat Sekolah */}
            <div className="md:col-span-4 flex flex-col gap-3 md:gap-3.5">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center p-1.5 shadow-md border-2 border-amber-300 shrink-0">
                    <img src="/logo-spengu.png" alt="Logo SMP Negeri 3 Gubug" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm md:text-base font-black text-white leading-tight">RuangInfo</p>
                    <p className="text-[11px] md:text-xs font-extrabold text-amber-300">SMP Negeri 3 Gubug</p>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="md:hidden min-h-[40px] px-3.5 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black inline-flex items-center gap-1 shadow-sm shrink-0"
                >
                  <span>Masuk</span>
                  <Icon name="arrow_forward" className="text-[13px]" />
                </Link>
              </div>

              <p className="hidden md:block text-xs text-slate-300 font-medium leading-relaxed">
                Portal pembelajaran digital Informatika Kelas VII berbasis Kurikulum Merdeka yang interaktif, ceria, dan mudah diakses dari HP maupun komputer lab.
              </p>

              <div className="flex items-start gap-2 text-[11px] md:text-xs text-slate-200 bg-white/10 backdrop-blur-xs p-2.5 md:p-3 rounded-xl md:rounded-2xl border border-white/15">
                <Icon name="location_on" className="text-[16px] md:text-[18px] text-amber-300 shrink-0 mt-0.5" />
                <span className="font-medium leading-snug md:leading-relaxed">
                  Desa Baturagung, Kec. Gubug, Kab. Grobogan, Jawa Tengah 58164
                </span>
              </div>

              <div className="hidden md:flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black inline-flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Portal Belajar</span>
                  <Icon name="arrow_forward" className="text-[14px]" />
                </Link>
                {!isInApp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoTriggered(false);
                      setShowAppModal(true);
                    }}
                    className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-extrabold inline-flex items-center gap-1.5 transition-all"
                  >
                    <Icon name="smartphone" className="text-[14px]" />
                    <span>Unduh .APK</span>
                  </button>
                )}
              </div>
            </div>

            {/* Kolom 2: Media Sosial Resmi (Panel Berwarna Khusus, Grid 3 Sejajar di HP, Kartu Penuh di Desktop) */}
            <div className="md:col-span-4 bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 md:p-4 border border-white/15 flex flex-col gap-2.5 md:gap-3">
              <div>
                <h4 className="text-[10px] md:text-xs font-black uppercase tracking-wider text-sky-300">
                  Media Sosial Resmi
                </h4>
                <p className="text-xs md:text-sm font-black text-white mt-0.5">
                  SMP Negeri 3 Gubug
                </p>
              </div>

              <div className="grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-2.5">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/smpn3gubug?utm_source=ig_web_button_share_sheet&avpt=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-h-[44px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-1.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-white hover:bg-pink-50 border border-white/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-center md:text-left"
                >
                  <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3 min-w-0">
                    <span className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] md:text-xs font-black text-slate-900 leading-tight">Instagram</p>
                      <p className="hidden md:block text-[11px] font-semibold text-slate-500 truncate">@smpn3gubug</p>
                    </div>
                  </div>
                  <Icon name="open_in_new" className="hidden md:block text-[16px] text-slate-400 group-hover:text-pink-600 transition-colors shrink-0" />
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@smpn_3_gubug?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-h-[44px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-1.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-white hover:bg-slate-100 border border-white/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-center md:text-left"
                >
                  <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3 min-w-0">
                    <span className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] md:text-xs font-black text-slate-900 leading-tight">TikTok</p>
                      <p className="hidden md:block text-[11px] font-semibold text-slate-500 truncate">@smpn_3_gubug</p>
                    </div>
                  </div>
                  <Icon name="open_in_new" className="hidden md:block text-[16px] text-slate-400 group-hover:text-slate-900 transition-colors shrink-0" />
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@SMPNEGERI3GUBUG"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-h-[44px] flex flex-col md:flex-row items-center justify-center md:justify-between gap-1.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-white hover:bg-red-50 border border-white/80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-center md:text-left"
                >
                  <div className="flex flex-col md:flex-row items-center gap-1.5 md:gap-3 min-w-0">
                    <span className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true">
                        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.52V8.48L15.82 12l-6.07 3.52z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] md:text-xs font-black text-slate-900 leading-tight">YouTube</p>
                      <p className="hidden md:block text-[11px] font-semibold text-slate-500 truncate">@SMPNEGERI3GUBUG</p>
                    </div>
                  </div>
                  <Icon name="open_in_new" className="hidden md:block text-[16px] text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
                </a>
              </div>
            </div>

            {/* Kolom 3: Preview Peta Lokasi Google Maps (Kompak h-32 di HP, h-44 di Desktop) */}
            <div className="md:col-span-4 flex flex-col gap-2.5 md:gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-[10px] md:text-xs font-black uppercase tracking-wider text-amber-300">
                    Lokasi Sekolah
                  </h4>
                  <p className="text-xs md:text-sm font-black text-white mt-0.5">
                    Peta SMPN 3 Gubug
                  </p>
                </div>
                <a
                  href="https://maps.app.goo.gl/FfJkHCPhAAM4Kf976"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] md:text-xs font-extrabold text-sky-300 hover:text-amber-300 inline-flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>Buka Maps</span>
                  <Icon name="open_in_new" className="text-[13px] md:text-[14px]" />
                </a>
              </div>

              <div className="rounded-xl md:rounded-2xl overflow-hidden border-2 border-white/25 bg-white shadow-lg flex flex-col">
                <div className="relative w-full h-32 md:h-44 bg-sky-50">
                  <iframe
                    title="Peta Lokasi SMP Negeri 3 Gubug"
                    src="https://maps.google.com/maps?q=SMP%20Negeri%203%20Gubug%20Baturagung%20Grobogan&t=&z=16&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <a
                  href="https://maps.app.goo.gl/FfJkHCPhAAM4Kf976"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] md:min-h-[44px] px-3 md:px-3.5 py-2 md:py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] md:text-xs font-black flex items-center justify-between gap-2 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Icon name="map" className="text-[14px] md:text-[15px] text-slate-950 shrink-0" />
                    <span className="truncate">Lihat Rute di Google Maps</span>
                  </span>
                  <Icon name="arrow_forward" className="text-[14px] md:text-[15px] text-slate-950 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-4 md:pt-5 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-center sm:text-left">
            <p className="text-[10px] md:text-[11px] text-slate-300 font-semibold">
              © 2026 RuangInfo — SMP Negeri 3 Gubug. Hak Cipta Terpelihara.
            </p>
            <p className="text-[10px] md:text-[11px] text-slate-400 font-semibold">
              Informatika Kelas VII • Kurikulum Merdeka
            </p>
          </div>
        </div>
      </footer>

      {/* ─── App Download Pop-up Modal ─────────────────────────────── */}
      {!isInApp && (
        <AppDownloadModal
          isOpen={showAppModal}
          onClose={() => setShowAppModal(false)}
          autoTriggered={isAutoTriggered}
        />
      )}
    </div>
  );
}
