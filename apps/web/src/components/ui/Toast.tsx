import { useEffect, useState, useCallback } from 'react';

import Icon from '../../components/Icon';
interface ToastProps {
  message: string;
  icon?: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  icon = 'info',
  duration = 2800,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        px-4 py-2.5 rounded-full
        bg-inverse-surface text-inverse-on-surface
        text-label-md
        flex items-center gap-2 shadow-lg
        transition-all duration-300
        ${isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0 pointer-events-none'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon name={icon} className="icon-sm" />
      <span>{message}</span>
    </div>
  );
}

// ─── Toast Hook ──────────────────────────────────────────────

interface ToastState {
  message: string;
  icon: string;
  id: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, icon = 'info') => {
    setToast({ message, icon, id: Date.now() });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}
