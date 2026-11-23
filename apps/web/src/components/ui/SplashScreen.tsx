import { useEffect, useState } from 'react';

interface SplashScreenProps {
  isAppReady: boolean;
  onFinish: () => void;
}

export default function SplashScreen({ isAppReady, onFinish }: SplashScreenProps) {
  const [phase, setPhase] = useState<'fade-in' | 'hold' | 'fade-out'>('fade-in');
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    // Fase 1: Trigger animasi fade-in logo segera saat komponen dipasang
    const holdTimer = setTimeout(() => {
      setPhase('hold');
    }, 60);

    // Fase 2: Pastikan animasi opening tampil minimal 1.3 detik agar elegan & tidak berkedip
    const minTimer = setTimeout(() => {
      setMinTimePassed(true);
    }, 1350);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(minTimer);
    };
  }, []);

  useEffect(() => {
    if (isAppReady && minTimePassed) {
      setPhase('fade-out');
      const finishTimer = setTimeout(() => {
        onFinish();
      }, 450);
      return () => clearTimeout(finishTimer);
    }
  }, [isAppReady, minTimePassed, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-8 select-none transition-opacity duration-500 ease-out ${
        phase === 'fade-out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(145deg, #0b1c30 0%, #162c4e 50%, #003ea8 100%)',
      }}
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Spacer */}
      <div className="h-8" />

      {/* Center Logo & Brand with Fade-In Animation */}
      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ease-out ${
          phase === 'fade-in'
            ? 'opacity-0 scale-90 translate-y-4'
            : phase === 'hold'
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-105 -translate-y-2'
        }`}
      >
        {/* Glowing Logo Ring */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 rounded-[2rem] bg-white/15 blur-xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2rem] bg-white p-4 shadow-2xl border-2 border-white/40 flex items-center justify-center">
            <img
              src="/logo-spengu.png"
              alt="Logo SMP Negeri 3 Gubug"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ruang<span className="text-blue-300">Info</span>
        </h1>
        <p className="text-xs sm:text-sm text-blue-100/85 font-semibold tracking-widest uppercase mt-1.5">
          SMP Negeri 3 Gubug
        </p>

        {/* Loading Pill Indicator */}
        <div className="mt-8 w-44 h-1.5 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-300 via-white to-emerald-300 rounded-full animate-splash-progress" />
        </div>
        <span className="text-[11px] text-blue-200/75 font-medium mt-2.5">
          Mempersiapkan Ruang Belajar...
        </span>
      </div>

      {/* Bottom Footer Credit */}
      <div
        className={`relative z-10 text-center transition-opacity duration-700 delay-200 ${
          phase === 'fade-in' ? 'opacity-0' : 'opacity-80'
        }`}
      >
        <p className="text-[11px] text-blue-100/70 font-medium">
          Kurikulum Merdeka • Pembelajaran Informatika
        </p>
      </div>
    </div>
  );
}

