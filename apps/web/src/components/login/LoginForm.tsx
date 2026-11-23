import { useState, useEffect, type FormEvent } from 'react';
import { login } from '@lms/shared';
import type { User } from '@lms/shared';

import Icon from '../../components/Icon';

interface LoginFormProps {
  role?: 'siswa' | 'guru';
  onSuccess: (user: User) => void;
  onForgotPassword: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export default function LoginForm({
  role = 'siswa',
  onSuccess,
  onForgotPassword,
  onShowToast,
}: LoginFormProps) {
  const [nisn, setNisn] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bersihkan pesan error & kata sandi setiap kali berpindah mode Siswa <-> Guru
  useEffect(() => {
    setErrorMessage(null);
    setPassword('');
  }, [role]);

  const isGuru = role === 'guru';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nisn.trim() || !password) {
      const emptyMsg = isGuru
        ? 'Lengkapi NIP / Nama Pengguna dan kata sandi terlebih dahulu.'
        : 'Lengkapi NISN dan kata sandi terlebih dahulu.';
      setErrorMessage(emptyMsg);
      onShowToast(emptyMsg, 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({ nisn: nisn.trim(), password, role });

      if (result.success && result.user) {
        onShowToast(result.message, 'check_circle');
        // Small delay to show success toast before navigating
        setTimeout(() => onSuccess(result.user!), 600);
      } else {
        setErrorMessage(result.message);
        onShowToast(result.message, 'error');
      }
    } catch {
      const netMsg = 'Terjadi kesalahan jaringan. Coba lagi.';
      setErrorMessage(netMsg);
      onShowToast(netMsg, 'wifi_off');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="flex flex-col space-y-[var(--space-md)]"
      id="student-login-form"
      onSubmit={handleSubmit}
    >
      {/* ─── Inline Error Alert (termasuk penolakan salah portal Siswa/Guru) ─── */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-fade-in"
        >
          <Icon name="warning" className="text-[18px] text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* ─── Input: NISN / NIP / Username ──────────────────────────── */}
      <div className="flex flex-col space-y-1.5">
        <label
          className="text-xs font-extrabold text-slate-800"
          htmlFor="student-nisn"
        >
          {isGuru ? 'NIP atau Nama Pengguna Guru' : 'NISN atau Nama Pengguna Siswa'}
        </label>
        <div className="relative flex items-center">
          <Icon
            name="badge"
            className={`absolute left-3.5 icon-md pointer-events-none ${
              isGuru ? 'text-emerald-600' : 'text-amber-600'
            }`}
          />
          <input
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={`
              w-full h-12 pl-11 pr-3 rounded-2xl
              ${
                isGuru
                  ? 'bg-emerald-50/50 border-2 border-emerald-200/80 focus:border-emerald-500 focus:ring-emerald-200/50'
                  : 'bg-amber-50/50 border-2 border-amber-200/80 focus:border-blue-500 focus:ring-blue-200/50'
              }
              text-slate-900 font-semibold
              text-sm placeholder:text-slate-400 placeholder:font-normal
              focus:bg-white focus:outline-none focus:ring-4
              transition-all duration-200
            `}
            id="student-nisn"
            name="nisn"
            placeholder={isGuru ? 'Masukkan NIP atau username guru' : 'Masukkan 10 digit NISN siswa'}
            required
            type="text"
            value={nisn}
            onChange={(e) => {
              setNisn(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* ─── Input: Password ─────────────────────────────────── */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            className="text-xs font-extrabold text-slate-800"
            htmlFor="student-password"
          >
            Kata Sandi
          </label>
          <button
            className="text-xs font-extrabold text-blue-600 hover:text-orange-600 hover:underline focus:outline-none"
            onClick={onForgotPassword}
            type="button"
          >
            Lupa Sandi?
          </button>
        </div>
        <div className="relative flex items-center">
          <Icon
            name="lock"
            className={`absolute left-3.5 icon-md pointer-events-none ${
              isGuru ? 'text-teal-600' : 'text-blue-600'
            }`}
          />
          <input
            autoComplete="current-password"
            className={`
              w-full h-12 pl-11 pr-11 rounded-2xl
              ${
                isGuru
                  ? 'bg-teal-50/40 border-2 border-teal-200/80 focus:border-emerald-500 focus:ring-emerald-200/50'
                  : 'bg-sky-50/50 border-2 border-sky-200/80 focus:border-blue-500 focus:ring-blue-200/50'
              }
              text-slate-900 font-semibold
              text-sm placeholder:text-slate-400 placeholder:font-normal
              focus:bg-white focus:outline-none focus:ring-4
              transition-all duration-200
            `}
            id="student-password"
            name="password"
            placeholder={isGuru ? 'Masukkan kata sandi akun guru' : 'Masukkan kata sandi akun siswa'}
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isSubmitting}
          />
          <button
            aria-label="Lihat atau sembunyikan sandi"
            className="
              absolute right-2 w-9 h-9
              flex items-center justify-center rounded-full
              text-slate-400 hover:text-blue-700 transition-colors
              focus:outline-none
            "
            onClick={() => setShowPassword(!showPassword)}
            type="button"
          >
            <Icon name={showPassword ? 'visibility' : 'visibility_off'} className="icon-md" />
          </button>
        </div>
      </div>

      {/* ─── Remember Me ─────────────────────────────────────── */}
      <div className="flex items-center space-x-2 pt-1">
        <label className="relative flex items-center cursor-pointer select-none">
          <input
            className="peer sr-only"
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <div
            className={`w-5 h-5 rounded-md border text-white transition-all flex items-center justify-center ${
              isGuru
                ? 'bg-emerald-100 border-emerald-300 peer-checked:bg-emerald-600 peer-checked:border-emerald-600'
                : 'bg-amber-100 border-amber-300 peer-checked:bg-blue-600 peer-checked:border-blue-600'
            }`}
          >
            <Icon name="check" className="text-[14px]" />
          </div>
          <span className="ml-2.5 text-xs font-semibold text-slate-600">
            Ingat saya di perangkat ini
          </span>
        </label>
      </div>

      {/* ─── Submit Button ───────────────────────────────────── */}
      <button
        className={`
          w-full h-[52px] mt-2 rounded-full
          ${
            isGuru
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25'
          }
          text-white font-black text-sm
          flex items-center justify-center gap-2
          shadow-lg active:scale-[0.99]
          transition-all duration-150
          focus:outline-none
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
        id="btn-submit"
        type="submit"
        disabled={isSubmitting}
      >
        <span>
          {isSubmitting ? 'Memverifikasi...' : `Masuk sebagai ${isGuru ? 'Guru' : 'Siswa'}`}
        </span>
        <Icon name={isSubmitting ? 'sync' : 'arrow_forward'} className="" />
      </button>
    </form>
  );
}
