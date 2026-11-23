import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

import heroLottieData from '../../assets/lottie/hero.json';
import materiLottieData from '../../assets/lottie/materi.json';
import kuisLottieData from '../../assets/lottie/kuis.json';
import progresLottieData from '../../assets/lottie/progres.json';

const LOTTIE_MAP = {
  hero: heroLottieData,
  materi: materiLottieData,
  kuis: kuisLottieData,
  progres: progresLottieData,
} as const;

export function MiniLottie({
  name,
  className = 'w-14 h-14',
}: {
  name: keyof typeof LOTTIE_MAP;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';
    const clonedData = JSON.parse(JSON.stringify(LOTTIE_MAP[name]));
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: clonedData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    });
    return () => anim.destroy();
  }, [name]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center shrink-0 [&_svg]:!w-full [&_svg]:!h-full ${className}`}
    />
  );
}

export type AnimatedVisualType =
  | 'book'
  | 'quiz'
  | 'trophy'
  | 'bolt'
  | 'lightbulb'
  | 'target'
  | 'clock'
  | 'school'
  | 'backpack'
  | 'sparkles'
  | 'video'
  | 'settings'
  | 'flame'
  | 'celebrate';

/**
 * Ilustrasi Vektor 3D-Style Berwarna & Beranimasi (Pengganti Emoji / Ikon Template Polos)
 */
export function AnimatedVisual({
  type,
  className = 'w-5 h-5',
}: {
  type: AnimatedVisualType;
  className?: string;
}) {
  switch (type) {
    case 'book':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <defs>
            <linearGradient id="avBookL" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="avBookR" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <path d="M4 9 C4 7.5 5.5 6.5 8 7 L18 10 L18 29 L7 26.5 C5 26 4 24.8 4 23 Z" fill="url(#avBookL)" />
          <path d="M32 9 C32 7.5 30.5 6.5 28 7 L18 10 L18 29 L29 26.5 C31 26 32 24.8 32 23 Z" fill="url(#avBookR)" />
          <path d="M7 10.5 L16 12.8 L16 25.5 L7 23.5 Z" fill="#FFFFFF" opacity="0.92" />
          <path d="M29 10.5 L20 12.8 L20 25.5 L29 23.5 Z" fill="#F0F9FF" opacity="0.92" />
          <line x1="9" y1="15" x2="14" y2="16.2" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="9" y1="19" x2="14" y2="20.2" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="22" y1="16.2" x2="27" y2="15" stroke="#38BDF8" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="29" cy="7" r="3" fill="#FBBF24" className="animate-pulse" />
        </svg>
      );

    case 'quiz':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <defs>
            <linearGradient id="avQuizBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <rect x="4" y="8" width="28" height="20" rx="10" fill="url(#avQuizBg)" />
          <rect x="9.5" y="15" width="7" height="2.6" rx="1.3" fill="#FFFFFF" />
          <rect x="11.7" y="12.8" width="2.6" height="7" rx="1.3" fill="#FFFFFF" />
          <circle cx="23.5" cy="15.5" r="2" fill="#FEF08A" />
          <circle cx="27" cy="19" r="2" fill="#FFFFFF" />
          <circle cx="22.5" cy="20.5" r="1.8" fill="#A7F3D0" />
        </svg>
      );

    case 'trophy':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <defs>
            <linearGradient id="avGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path d="M9 8 H5 C5 15 8 18 11.5 18.5" stroke="#F59E0B" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M27 8 H31 C31 15 28 18 24.5 18.5" stroke="#F59E0B" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M10 6 H26 V15 C26 20 22.5 23.5 18 23.5 C13.5 23.5 10 20 10 15 Z" fill="url(#avGold)" />
          <rect x="16" y="23" width="4" height="5" fill="#D97706" />
          <rect x="11" y="27.5" width="14" height="3.5" rx="1.75" fill="#B45309" />
          <polygon points="18,9.5 19.3,12.5 22.5,12.8 20,14.8 20.8,18 18,16.2 15.2,18 16,14.8 13.5,12.8 16.7,12.5" fill="#FFFFFF" />
        </svg>
      );

    case 'bolt':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <defs>
            <linearGradient id="avBolt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="15" fill="#D1FAE5" />
          <path d="M20 5 L10 19 H17.5 L15.5 31 L26 16.5 H18.5 Z" fill="url(#avBolt)" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );

    case 'lightbulb':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <defs>
            <linearGradient id="avBulb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <path d="M18 5 C12 5 8 9.5 8 15 C8 18.8 10.5 21.5 12.5 24 H23.5 C25.5 21.5 28 18.8 28 15 C28 9.5 24 5 18 5 Z" fill="url(#avBulb)" />
          <rect x="13" y="25" width="10" height="3" rx="1.5" fill="#94A3B8" />
          <rect x="14.5" y="29" width="7" height="2.6" rx="1.3" fill="#64748B" />
          <path d="M15 15 Q18 11 21 15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="18" cy="15" r="14" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 5" fill="none" className="animate-spin" style={{ animationDuration: '12s' }} />
        </svg>
      );

    case 'target':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <circle cx="18" cy="18" r="14" fill="#F97316" />
          <circle cx="18" cy="18" r="9.5" fill="#FFFFFF" />
          <circle cx="18" cy="18" r="5.5" fill="#F59E0B" />
          <circle cx="18" cy="18" r="2.2" fill="#FFFFFF" />
          <path d="M27 7 L19 15" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" />
          <polygon points="27,7 31,4 30,9 25,10" fill="#38BDF8" />
        </svg>
      );

    case 'clock':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <circle cx="18" cy="19" r="13" fill="#FB923C" />
          <circle cx="18" cy="19" r="10" fill="#FFFFFF" />
          <path d="M18 13 V19 L22.5 21.5" stroke="#EA580C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M8 7 L12 10 M28 7 L24 10" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'school':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <polygon points="18,4 4,13 32,13" fill="#2563EB" />
          <rect x="7" y="13" width="22" height="17" rx="2" fill="#DBEAFE" />
          <rect x="14.5" y="20" width="7" height="10" rx="1.5" fill="#3B82F6" />
          <rect x="10" y="16" width="3.5" height="3.5" rx="0.8" fill="#60A5FA" />
          <rect x="22.5" y="16" width="3.5" height="3.5" rx="0.8" fill="#60A5FA" />
          <circle cx="18" cy="9.5" r="2" fill="#FDE047" />
        </svg>
      );

    case 'backpack':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <path d="M13 9 C13 5.5 23 5.5 23 9" stroke="#2563EB" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="7" y="9" width="22" height="22" rx="7" fill="#3B82F6" />
          <rect x="11" y="18" width="14" height="9" rx="3" fill="#FBBF24" />
          <line x1="13" y1="21.5" x2="23" y2="21.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'video':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <rect x="4" y="7" width="28" height="22" rx="6" fill="#6366F1" />
          <polygon points="15,13 24,18 15,23" fill="#FFFFFF" />
          <circle cx="28" cy="11" r="2.2" fill="#FDE047" />
        </svg>
      );

    case 'settings':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <circle cx="18" cy="18" r="12" fill="#38BDF8" />
          <circle cx="18" cy="18" r="6" fill="#FFFFFF" />
          <circle cx="18" cy="18" r="2.5" fill="#0284C7" />
        </svg>
      );

    case 'flame':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <path d="M18 4 C23 11 28 15 28 22 C28 27.5 23.5 32 18 32 C12.5 32 8 27.5 8 22 C8 16.5 12 12.5 14 9 C14.5 12 16 13 17 13 C16.5 9.5 17 6.5 18 4 Z" fill="#F97316" />
          <path d="M18 15 C21 19 23 21.5 23 24.5 C23 27.5 20.8 29.5 18 29.5 C15.2 29.5 13 27.5 13 24.5 C13 21.5 15.5 19 18 15 Z" fill="#FDE047" />
        </svg>
      );

    case 'celebrate':
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <polygon points="18,3 21.5,12.5 31.5,13 23.5,19 26.5,29 18,23 9.5,29 12.5,19 4.5,13 14.5,12.5" fill="#F59E0B" />
          <circle cx="18" cy="17" r="4" fill="#FEF08A" />
        </svg>
      );

    case 'sparkles':
    default:
      return (
        <svg viewBox="0 0 36 36" className={`${className} shrink-0 overflow-visible`} aria-hidden="true">
          <path d="M18 3 L21.2 14.8 L33 18 L21.2 21.2 L18 33 L14.8 21.2 L3 18 L14.8 14.8 Z" fill="#3B82F6" />
          <path d="M28 5 L29.5 9.5 L34 11 L29.5 12.5 L28 17 L26.5 12.5 L22 11 L26.5 9.5 Z" fill="#F59E0B" className="animate-pulse" />
        </svg>
      );
  }
}
