import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../App';
import { useNavigate } from 'react-router-dom';
import { api, backendUrl } from '@lms/shared';
import Swal from 'sweetalert2';

import Icon from '../../components/Icon';
interface HeaderBarProps {
  onNotification?: () => void;
  title?: string;
  subtitle?: string;
  backUrl?: string | number;
  variant?: 'default' | 'transparent';
}

export default function HeaderBar({ onNotification, title, subtitle, backUrl, variant = 'default' }: HeaderBarProps) {
  const { handleLogout, user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for notifications
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifs = async () => {
      try {
        const endpoint = user.role === 'guru' ? '/api/teacher/notifications' : '/api/student/notifications';
        const res = await api.get(endpoint);
        const newNotifs = res.data;
        // Check if there's a new unread call
        if (newNotifs.length > 0) {
           // In a real app we'd keep track of previously seen notifs to only toast once, 
           // but checking against the old state length or just a generic unread check is simple enough.
        }
        setNotifications(newNotifs);
      } catch (e) {}
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: number) => {
    try {
      const endpoint = user?.role === 'guru' ? `/api/teacher/notifications/${id}/read` : `/api/student/notifications/${id}/read`;
      await api.post(endpoint);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      const endpoint = user?.role === 'guru' ? '/api/teacher/notifications/read-all' : '/api/student/notifications/read-all';
      await api.post(endpoint);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const doLogout = async () => {
    setShowMenu(false);
    const result = await Swal.fire({
      title: 'Keluar dari Akun?',
      text: 'Apakah kamu yakin ingin keluar dari akun RuangInfo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#2563eb',
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      handleLogout();
      navigate('/');
    }
  };

  // Find the first unread call notification to show as a sticky toast (optional)
  const activeCall = notifications.find(n => !n.is_read && n.type === 'call');

  const isTransparent = variant === 'transparent';

  return (
    <header className={`flex items-center justify-between px-4 sm:px-6 py-3.5 sticky top-0 z-30 transition-colors ${isTransparent ? 'bg-transparent text-white' : 'bg-[#FFFDF8]/90 backdrop-blur-md shadow-xs border-b-2 border-amber-200/60'}`}>
      {/* Toast Overlay for Calls */}
      {activeCall && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-error text-on-error px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm w-[90vw]">
            <Icon name="warning" className="text-[32px] animate-pulse" />
            <div className="flex-1">
              <h4 className="font-bold">{activeCall.title}</h4>
              <p className="text-sm text-on-error/90">{activeCall.message}</p>
            </div>
            <button 
              onClick={() => markAsRead(activeCall.id)}
              className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-3 py-1 text-sm font-bold transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Left: Logo & Title / Back & Title */}
      <div className="flex items-center gap-2.5">
        {backUrl !== undefined ? (
          <button
            onClick={() => {
              if (typeof backUrl === 'number') navigate(backUrl);
              else navigate(backUrl);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all -ml-1 ${isTransparent ? 'text-white hover:bg-white/10' : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300/70'}`}
          >
            <Icon name="arrow_back" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 via-white to-sky-100 p-1 shadow-xs border border-amber-300 flex items-center justify-center">
            <img
              alt="Logo SMP Negeri 3 Gubug"
              className="w-full h-full object-contain"
              src="/logo-spengu.png"
            />
          </div>
        )}
        <div>
          <h1 className={`text-sm leading-tight font-black ${isTransparent ? 'text-white' : 'text-slate-900'}`}>
            {title || 'RuangInfo'}
          </h1>
          <p className={`text-[10px] leading-tight font-bold ${isTransparent ? 'text-white/80' : 'text-blue-600'}`}>
            {subtitle || (user?.role === 'guru' ? (user?.class_name ? `Guru Pengampu ${user.class_name}` : 'Koordinator Guru') : 'Portal Belajar Siswa VII')}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Sync indicator */}
        <button className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${isTransparent ? 'text-amber-300 hover:bg-white/10' : 'text-orange-500 hover:bg-amber-100/70'}`}>
          <Icon name="bolt" className="icon-md icon-filled" />
        </button>
        {/* Notification */}
        {user?.role !== 'guru' && (
        <div className="relative" ref={notifRef}>
          <button
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors relative ${showNotifications ? (isTransparent ? 'bg-white/20' : 'bg-surface-container') : (isTransparent ? 'text-white hover:bg-white/10' : 'hover:bg-surface-container text-on-surface-variant')}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Icon name="notifications" className={`icon-md ${unreadCount > 0 ? 'text-error animate-pulse' : ''}`} />
            {/* Notification dot */}
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-ping" />}
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-variant/20 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-variant/20 flex items-center justify-between">
                <h3 className="font-bold text-on-surface">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary font-bold hover:underline">Tandai dibaca</button>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-sm">Tidak ada notifikasi</div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map(notif => (
                      <button 
                        key={notif.id} 
                        onClick={() => markAsRead(notif.id)}
                        className={`text-left p-4 border-b border-surface-variant/10 hover:bg-surface-container-low transition-colors ${notif.is_read ? 'opacity-70' : 'bg-primary/5'}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${notif.type === 'call' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                            <Icon name={notif.type === 'call' ? 'warning' : 'notifications'} className="text-[18px]" />
                          </div>
                          <div>
                            <h4 className={`text-sm ${notif.is_read ? 'font-medium' : 'font-bold'} text-on-surface`}>{notif.title}</h4>
                            <p className="text-xs text-on-surface-variant mt-1">{notif.message}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}
        {/* Avatar & Menu */}
        <div className="relative ml-0.5" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`w-8 h-8 rounded-full overflow-hidden active:scale-95 transition-transform outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isTransparent ? 'bg-white/20' : 'bg-surface-container'}`}
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url.startsWith('http') ? user.avatar_url : `${backendUrl}${user.avatar_url}`}
                alt="Foto profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon name="person" className="text-on-surface-variant w-full h-full flex items-center justify-center icon-md" />
            )}
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-variant/20 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-2 border-b border-surface-variant/20 mb-2">
                <p className="text-sm font-bold text-on-surface truncate">{user?.name && user.name !== '0987654321' ? user.name : (user?.role === 'guru' ? 'Tim Guru Informatika' : 'Siswa')}</p>
                <p className="text-xs text-on-surface-variant truncate">{user?.role === 'guru' ? (user?.class_name ? `Guru Kelas ${user.class_name}` : 'Koordinator Guru') : user?.identifier_no}</p>
              </div>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  navigate(user?.role === 'guru' ? '/guru/akun' : '/akun');
                }}
                className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2 transition-colors"
              >
                <Icon name="person" className="text-[18px] text-on-surface-variant" />
                Profil Akun
              </button>
              <button 
                onClick={doLogout}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2 transition-colors"
              >
                <Icon name="logout" className="text-[18px]" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
