import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import LoginForm from '../components/login/LoginForm';
import HelpModal from '../components/ui/HelpModal';
import { LoginPageSkeleton } from '../components/ui/PageSkeleton';
import Toast, { useToast } from '../components/ui/Toast';
import { AnimatedVisual } from '../components/ui/AnimatedVisuals';
import type { User } from '@lms/shared';

import Icon from '../components/Icon';
const SCHOOL_LOGO_URL = '/logo-spengu.png';

export default function LoginPage() {
  const { handleLogin } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'siswa' | 'guru'>('siswa');
  const [isReady, setIsReady] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    const img = new Image();
    img.src = SCHOOL_LOGO_URL;
    const done = () => setIsReady(true);
    img.onload = done;
    img.onerror = done;
    const fallback = setTimeout(done, 300);
    return () => clearTimeout(fallback);
  }, []);

  const onLoginSuccess = (user: User) => {
    handleLogin(user);
  };

  if (!isReady) {
    return <LoginPageSkeleton />;
  }

  return (
    <main className="relative min-h-screen overflow-x-clip p-4 bg-gradient-to-b from-[#FFF9EB] via-[#FFFDF8] to-[#EFF6FF]/70 flex items-center justify-center">
      {/* Playful Pastel Background Blobs */}
      <div className="fixed -top-16 -left-16 w-72 h-72 bg-amber-300/35 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-20 -right-16 w-72 h-72 bg-sky-300/35 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-64 h-64 bg-emerald-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* Main Form Content Container */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center animate-fade-in py-4">
        {/* ─── Top Identity Branding ─────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-5">
          {/* School Logo */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 via-white to-sky-100 p-2.5 shadow-md flex items-center justify-center mb-3 border-2 border-amber-300">
            <img
              alt="Logo SMP Negeri 3 Gubug"
              className="w-full h-full object-contain rounded-lg"
              src={SCHOOL_LOGO_URL}
            />
          </div>

          {/* Micro Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-2 font-black text-xs mb-2 shadow-2xs transition-colors ${
              loginMode === 'guru'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {loginMode === 'guru' ? (
              <Icon name="admin_panel_settings" className="text-[15px] text-emerald-600 icon-filled" />
            ) : (
              <AnimatedVisual type="backpack" className="w-4 h-4" />
            )}
            <span className="tracking-wide">
              {loginMode === 'guru' ? 'Akses Pengajar' : 'Portal Belajar Siswa'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-[#18181B] tracking-tight">
            Ruang<span className="text-blue-600">Info</span>
          </h1>
          <p className="text-xs font-semibold text-slate-600 max-w-[270px] mt-0.5">
            {loginMode === 'guru' ? 'Portal Pengajar SMP Negeri 3 Gubug' : 'Portal Belajar Seru Siswa Kelas VII • SMPN 3 Gubug'}
          </p>
        </div>

        {/* ─── Login Card ────────────────────────────────────────── */}
        <div
          className={`w-full bg-white p-6 rounded-[2rem] shadow-xl border-2 relative overflow-hidden transition-colors duration-300 ${
            loginMode === 'guru'
              ? 'shadow-emerald-500/10 border-emerald-200/90'
              : 'shadow-amber-500/10 border-amber-200/80'
          }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-2 transition-all duration-300 ${
              loginMode === 'guru'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
                : 'bg-gradient-to-r from-blue-600 via-sky-500 to-amber-400'
            }`}
          />
          <LoginForm
            role={loginMode}
            onSuccess={onLoginSuccess}
            onForgotPassword={() => setShowHelpModal(true)}
            onShowToast={showToast}
          />
        </div>

        {/* ─── Alternative Portal Switch ─────────────────────────── */}
        <div className="w-full mt-3.5 flex flex-col items-center gap-2.5">
          <button
            className="
              w-full py-3 px-4 rounded-2xl
              bg-gradient-to-r from-sky-50 via-white to-amber-50 shadow-sm border-2 border-sky-200/80
              flex items-center justify-between
              text-slate-700 hover:text-blue-700 hover:border-blue-300
              transition-all group
            "
            onClick={() => {
              if (loginMode === 'siswa') {
                setLoginMode('guru');
                showToast('Beralih ke Portal Guru', 'admin_panel_settings');
              } else {
                setLoginMode('siswa');
                showToast('Beralih ke Portal Siswa', 'school');
              }
            }}
            type="button"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Icon name={loginMode === 'guru' ? 'face' : 'person_search'} className="icon-sm text-blue-700 group-hover:text-white" />
              </div>
              <span className="text-xs text-left font-extrabold">
                Masuk sebagai {loginMode === 'guru' ? 'Siswa Kelas VII' : 'Guru Pengampu'}
              </span>
            </div>
            <Icon name="chevron_right" className="icon-sm text-blue-500 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* ─── Data Saver Hint ──────────────────────────────────── */}
        <div className="flex items-center justify-center gap-1.5 mt-5 px-3.5 py-1.5 rounded-full bg-amber-100/70 border border-amber-300/70 text-amber-900">
          <Icon name="cloud_done" className="text-[16px] text-orange-600" />
          <span className="text-xs font-bold">
            Koneksi Aman &amp; Mode Hemat Kuota Aktif
          </span>
        </div>

        {/* ─── Footer ──────────────────────────────────────────── */}
        <footer className="mt-4 text-center">
          <p className="text-[11px] font-bold text-slate-500">
            &copy; SMP Negeri 3 Gubug &bull; Kurikulum Merdeka Informatika
          </p>
        </footer>
      </div>

      {/* ─── Help Modal ────────────────────────────────────────── */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* ─── Toast ─────────────────────────────────────────────── */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          icon={toast.icon}
          onClose={hideToast}
        />
      )}
    </main>
  );
}
