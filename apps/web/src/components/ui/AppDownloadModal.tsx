import { useEffect, useState } from 'react';
import Icon from '../Icon';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoTriggered?: boolean;
}

/**
 * Mendeteksi apakah pengguna sedang membuka LMS langsung dari dalam aplikasi Android (.APK)
 * yang sudah terpasang (Median / GoNative WebView / Android WebView / Standalone App).
 */
export function isRunningInInstalledApp(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const isWrapperOrWebView =
    /median|gonative|;\s*wv\b|WebView|Android.*Version\/[\d.]+.*Chrome/i.test(ua) ||
    Boolean(
      (window as any).median ||
      (window as any).gonative ||
      (window as any).JSBridge ||
      (window as any).ReactNativeWebView
    );

  const isStandalone =
    (window.matchMedia &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches)) ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  return isWrapperOrWebView || isStandalone;
}

/**
 * Mengunduh file APK melalui fetch() di dalam sesi browser (membawa cookie anti-bot hosting)
 * lalu menyimpannya sebagai Blob biner utuh (~7.5 MB).
 * Ini mengatasi bug Android DownloadManager yang sering hanya mengunduh file HTML ~1 KB
 * pada hosting gratis (seperti InfinityFree).
 */
export async function downloadApkSafely(
  onProgress?: (percent: number, loadedMB: string, totalMB: string) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/LMS_RuangInfo.apk?v=4', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Server tidak dapat melayani unduhan (HTTP ${response.status}).`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      return {
        success: false,
        error: 'Server mengirim halaman web alih-alih file APK. Silakan refresh halaman lalu coba lagi.',
      };
    }

    const contentLength = Number(response.headers.get('content-length')) || 7515360;
    const totalMB = (contentLength / (1024 * 1024)).toFixed(1);

    let blob: Blob;

    if (response.body && typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedLength += value.length;
          if (onProgress) {
            const percent = Math.min(99, Math.round((receivedLength / contentLength) * 100));
            const loadedMB = (receivedLength / (1024 * 1024)).toFixed(1);
            onProgress(percent, loadedMB, totalMB);
          }
        }
      }

      blob = new Blob(chunks as BlobPart[], {
        type: 'application/vnd.android.package-archive',
      });
    } else {
      blob = await response.blob();
    }

    // Validasi ukuran file minimal 1 MB agar tidak pernah menyimpan file HTML rusak ~1 KB
    if (blob.size < 1_000_000) {
      return {
        success: false,
        error: `File yang diterima tidak utuh (${(blob.size / 1024).toFixed(1)} KB). Silakan refresh browser lalu coba unduh kembali.`,
      };
    }

    if (onProgress) {
      const finalMB = (blob.size / (1024 * 1024)).toFixed(1);
      onProgress(100, finalMB, finalMB);
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'LMS_RuangInfo.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Tahan blob URL selama 60 detik agar browser Android selesai menulis file ke penyimpanan
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

    try {
      localStorage.setItem('lms_apk_downloaded', 'true');
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      localStorage.setItem('lms_app_prompt_dismissed_until', nextMonth.getTime().toString());
    } catch {
      // ignore localStorage error
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Koneksi terputus saat mengunduh aplikasi. Silakan coba lagi.',
    };
  }
}

export default function AppDownloadModal({ isOpen, onClose, autoTriggered = false }: AppDownloadModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ percent: 0, loadedMB: '0.0', totalMB: '7.5' });
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isDownloading) return;
    setIsVisible(false);
    setTimeout(onClose, 250);
  };

  const handleDismissToday = () => {
    if (isDownloading) return;
    try {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + 24);
      localStorage.setItem('lms_app_prompt_dismissed_until', tomorrow.getTime().toString());
    } catch {
      // ignore localStorage error
    }
    handleClose();
  };

  const handleDownloadClick = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);
    setHasDownloaded(false);
    setDownloadProgress({ percent: 0, loadedMB: '0.0', totalMB: '7.5' });

    const result = await downloadApkSafely((percent, loadedMB, totalMB) => {
      setDownloadProgress({ percent, loadedMB, totalMB });
    });

    setIsDownloading(false);
    if (result.success) {
      setHasDownloaded(true);
    } else {
      setDownloadError(result.error || 'Gagal mengunduh file APK.');
    }
  };

  // Jangan pernah tampilkan modal jika sudah berada di dalam aplikasi APK yang terinstall
  if (!isOpen || isRunningInInstalledApp()) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'bg-black/60 backdrop-blur-xs' : 'bg-transparent pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md bg-surface-container-lowest text-on-surface rounded-3xl p-5 sm:p-6 shadow-2xl border border-surface-variant/30 transition-all duration-300 max-h-[90vh] overflow-y-auto ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center p-2 shadow-xs border border-primary/20 shrink-0">
              <img
                src="/logo-spengu.png"
                alt="Logo SMPN 3 Gubug"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Aplikasi Android (APK)
              </div>
              <h2 className="text-lg font-extrabold text-on-surface leading-tight truncate">
                RuangInfo Mobile
              </h2>
              <p className="text-xs text-on-surface-variant font-medium truncate">
                SMP Negeri 3 Gubug • Kurikulum Merdeka
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDownloading}
            className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors shrink-0 disabled:opacity-40"
            aria-label="Tutup"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Hero Banner / Highlight Box */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent p-4 rounded-2xl border border-primary/20 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-2">
            <span className="flex items-center gap-1 text-primary">
              <Icon name="verified" className="text-[15px]" />
              Resmi & Gratis
            </span>
            <span className="bg-surface-container-high px-2 py-0.5 rounded-md font-mono text-[11px]">
              Ukuran: ~7.5 MB
            </span>
          </div>
          <p className="text-sm text-on-surface font-bold leading-snug">
            Belajar Informatika Lebih Nyaman Langsung dari Aplikasi HP!
          </p>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Tidak perlu repot membuka browser lagi. Cukup sekali pasang, kamu bisa langsung masuk ke materi, tugas, dan kuis.
          </p>
        </div>

        {/* Keunggulan Aplikasi */}
        <div className="space-y-2 mb-5">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/70">
            <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="smartphone" className="text-[16px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface">Ikon di Layar Utama HP</p>
              <p className="text-[11px] text-on-surface-variant">Buka LMS cukup sekali ketuk dari home screen Android.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/70">
            <div className="w-7 h-7 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="bolt" className="text-[16px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface">Ringan & Hemat Kuota</p>
              <p className="text-[11px] text-on-surface-variant">Aplikasi sangat ringan (~7.5 MB) dan responsif untuk semua tipe HP.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-container-low/70">
            <div className="w-7 h-7 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="check_circle" className="text-[16px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface">Layar Penuh Tanpa Tab Browser</p>
              <p className="text-[11px] text-on-surface-variant">Mengerjakan kuis dan membaca modul lebih fokus tanpa gangguan browser.</p>
            </div>
          </div>
        </div>

        {/* Download Action Section */}
        <div className="space-y-2.5 mb-4">
          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadClick}
            className="w-full py-3.5 px-5 bg-primary text-on-primary rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all text-center disabled:opacity-80 disabled:cursor-wait"
          >
            {isDownloading ? (
              <>
                <Icon name="progress_activity" className="text-[20px] animate-spin" />
                <span>
                  Mengunduh... {downloadProgress.percent}% ({downloadProgress.loadedMB} MB)
                </span>
              </>
            ) : (
              <>
                <Icon name="download" className="text-[20px]" />
                <span>Unduh Aplikasi (.APK)</span>
              </>
            )}
          </button>

          {/* Progress Bar saat mengunduh */}
          {isDownloading && (
            <div className="w-full space-y-1 animate-in fade-in">
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${Math.max(5, downloadProgress.percent)}%` }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant text-center font-medium">
                Mohon tunggu sebentar, jangan tutup halaman ({downloadProgress.loadedMB} MB / {downloadProgress.totalMB} MB)
              </p>
            </div>
          )}

          {hasDownloaded && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
              <Icon name="check_circle" className="text-[18px] shrink-0 text-emerald-600" />
              <span>
                File <b>LMS_RuangInfo.apk</b> ({downloadProgress.totalMB} MB) berhasil diunduh! Buka notifikasi unduhan HP untuk memasang.
              </span>
            </div>
          )}

          {downloadError && (
            <div className="p-3 bg-error-container/60 border border-error/30 rounded-xl text-error text-xs flex items-start gap-2 animate-in fade-in">
              <Icon name="warning" className="text-[18px] shrink-0 mt-0.5" />
              <span>{downloadError}</span>
            </div>
          )}
        </div>

        {/* Panduan Instalasi (Toggle Accordion) */}
        <div className="border border-surface-variant/30 rounded-2xl overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full px-4 py-3 bg-surface-container-low flex items-center justify-between text-xs font-bold text-on-surface hover:bg-surface-container transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Icon name="info" className="text-primary text-[16px]" />
              Cara Pasang (Install) di HP Android
            </span>
            <Icon
              name={showGuide ? 'expand_less' : 'expand_more'}
              className="text-[18px] text-on-surface-variant transition-transform"
            />
          </button>

          {showGuide && (
            <div className="p-4 bg-surface-container-lowest text-xs text-on-surface-variant space-y-2 border-t border-surface-variant/20 animate-in fade-in">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <p>Klik tombol <b>Unduh Aplikasi (.APK)</b> di atas dan tunggu hingga 100%.</p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <p>
                  Jika muncul pemberitahuan <i>"File mungkin berbahaya"</i>, klik <b>"Tetap Download" / "Download Anyway"</b> (file 100% aman buatan sekolah).
                </p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <p>
                  Buka file <b>LMS_RuangInfo.apk</b> dari notifikasi unduhan atau folder <b>Download</b> di HP.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <p>
                  Pilih <b>Install (Pasang)</b>. Jika sebelumnya sudah pernah memasang versi lama, hapus (<i>Uninstall</i>) versi lama dulu lalu pasang yang baru.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-[10px]">
                  5
                </span>
                <p>Selesai! Buka aplikasi RuangInfo dan login seperti biasa.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Dismiss / Alternative */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-variant/20 text-xs">
          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDismissToday}
            className="text-on-surface-variant hover:text-on-surface font-medium transition-colors disabled:opacity-40"
          >
            {autoTriggered ? 'Sudah Punya / Nanti Saja' : 'Tutup'}
          </button>
          <button
            type="button"
            disabled={isDownloading}
            onClick={handleClose}
            className="text-primary hover:underline font-bold disabled:opacity-40"
          >
            Buka Portal Web →
          </button>
        </div>
      </div>
    </div>
  );
}
