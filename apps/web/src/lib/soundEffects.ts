/**
 * Sistem Efek Suara UI Mikro (Web Audio API Synthesizer)
 * Dirancang sangat lembut (volume rendah 2% - 5%) agar membuat LMS terasa hidup,
 * interaktif, dan menyenangkan untuk siswa kelas VII tanpa mengganggu fokus belajar.
 */

const SOUND_STORAGE_KEY = 'lms_sound_enabled';

let audioCtx: AudioContext | null = null;
let userHasInteracted = false;
let lastHoverTime = 0;
let lastScrollTime = 0;

export function isSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_STORAGE_KEY);
    return val !== 'false'; // Aktif secara bawaan
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Abaikan jika localStorage dibatasi
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!isSoundEnabled()) return null;

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended' && userHasInteracted) {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx.state === 'running' ? audioCtx : null;
  } catch {
    return null;
  }
}

/**
 * 1. Efek Klik / Ketuk Tombol (Soft Bubble Pop - sangat lembut & pendek ~45ms)
 */
export function playTapSound(): void {
  userHasInteracted = true;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.042);

    // Volume sangat lembut (0.042 dari 1.0)
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.042, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.048);
  } catch {
    // Abaikan jika audio diblokir browser
  }
}

/**
 * 2. Efek Hover Kartu / Tombol (Whisper Crystalline Tick - super halus ~22ms)
 */
export function playHoverSound(): void {
  if (!userHasInteracted) return;
  const nowMs = Date.now();
  if (nowMs - lastHoverTime < 130) return; // Cegah spam suara saat kursor bergerak cepat
  lastHoverTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(820, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.022);

    // Volume ekstra kecil (0.016 dari 1.0) agar hanya terasa sebagai sentuhan halus
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.016, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.024);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.026);
  } catch {
    // Abaikan
  }
}

/**
 * 3. Efek Saat Elemen Muncul Ketika Scroll (Soft Airy Chime - sangat halus ~85ms)
 */
export function playScrollRevealSound(): void {
  if (!userHasInteracted) return;
  const nowMs = Date.now();
  if (nowMs - lastScrollTime < 550) return;
  lastScrollTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5

    // Volume sangat lembut (0.018 dari 1.0)
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Abaikan
  }
}

/**
 * Pasang listener global agar seluruh tombol, tautan, dan kartu interaktif di LMS
 * otomatis memiliki efek suara mikro yang lembut tanpa mengganggu.
 */
export function initGlobalSoundEffects(): () => void {
  if (typeof window === 'undefined') return () => {};

  const interactiveSelector =
    'button, a, [role="button"], input[type="checkbox"], input[type="radio"], .interactive-card';

  const onPointerDown = (e: PointerEvent) => {
    userHasInteracted = true;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.closest(interactiveSelector)) {
      playTapSound();
    } else if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };

  const onPointerOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const matched = target.closest(interactiveSelector);
    if (!matched) return;
    const related = e.relatedTarget as HTMLElement | null;
    if (related && matched.contains(related)) return; // Masih di dalam elemen yang sama
    playHoverSound();
  };

  const onTouchScrollUnlock = () => {
    userHasInteracted = true;
  };

  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointerover', onPointerOver, { passive: true });
  window.addEventListener('touchstart', onTouchScrollUnlock, { passive: true });

  return () => {
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerover', onPointerOver);
    window.removeEventListener('touchstart', onTouchScrollUnlock);
  };
}
