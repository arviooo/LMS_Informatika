import { useEffect, useState } from 'react';

import Icon from '../../components/Icon';
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleBackdropClick = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-end justify-center p-4
        transition-all duration-200
        ${isVisible ? 'bg-inverse-surface/30 backdrop-blur-sm' : 'bg-transparent'}
      `}
      onClick={handleBackdropClick}
    >
      <div
        className={`
          w-full max-w-sm
          bg-surface-container-lowest rounded-xl
          p-[var(--space-lg)] shadow-xl
          transition-all duration-300
          ${isVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 scale-95'
          }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-[var(--space-sm)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <Icon name="help_outline" className="icon-md" />
            </div>
            <h2 className="text-headline-sm text-on-surface">Bantuan Akses Akun</h2>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center text-outline hover:text-on-surface transition-colors rounded-full"
            onClick={handleClose}
            type="button"
            aria-label="Tutup modal bantuan"
          >
            <Icon name="close" className="icon-md" />
          </button>
        </div>

        {/* Content */}
        <p className="text-body-sm text-on-surface-variant mb-[var(--space-md)]">
          Jika kamu lupa kata sandi atau NISN belum terdaftar di RuangInfo
          Spengu, silakan hubungi Guru Informatika atau Pengelola Lab Komputer
          kelas masing-masing.
        </p>

        {/* Info Box */}
        <div className="p-3 bg-surface-container-low rounded-lg mb-[var(--space-md)]">
          <p className="text-label-sm text-on-surface">
            Format Default Sandi Siswa:
          </p>
          <p className="text-body-sm text-outline">
            NISN (10 digit) atau tanggal lahir (DDMMYYYY).
          </p>
        </div>

        {/* Action Button */}
        <button
          className="w-full h-12 bg-surface-container text-on-surface text-label-md rounded-lg hover:bg-surface-container-high transition-colors active:scale-[0.99]"
          onClick={handleClose}
          type="button"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
