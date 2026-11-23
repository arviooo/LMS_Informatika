import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { useState, useEffect } from 'react';
import { api } from '@lms/shared';
import Icon from '../Icon';

interface NavItem {
  icon: string;
  filledIcon: string;
  label: string;
  path: string;
  id: string;
  activePill: string;
  activeText: string;
  activeIcon: string;
}

const navItems: NavItem[] = [
  {
    id: 'beranda',
    icon: 'home',
    filledIcon: 'home',
    label: 'Beranda',
    path: '/dashboard',
    activePill: 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25',
    activeText: 'text-blue-700 font-extrabold',
    activeIcon: 'text-white',
  },
  {
    id: 'materi',
    icon: 'menu_book',
    filledIcon: 'menu_book',
    label: 'Materi',
    path: '/materi',
    activePill: 'bg-gradient-to-r from-sky-500 to-cyan-500 shadow-md shadow-sky-500/25',
    activeText: 'text-sky-700 font-extrabold',
    activeIcon: 'text-white',
  },
  {
    id: 'tugas',
    icon: 'assignment',
    filledIcon: 'assignment',
    label: 'Tugas',
    path: '/tugas',
    activePill: 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/25',
    activeText: 'text-orange-700 font-extrabold',
    activeIcon: 'text-white',
  },
  {
    id: 'akun',
    icon: 'person',
    filledIcon: 'person',
    label: 'Akun',
    path: '/akun',
    activePill: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25',
    activeText: 'text-emerald-700 font-extrabold',
    activeIcon: 'text-white',
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hasPendingMateri, setHasPendingMateri] = useState(false);
  const [hasPendingTugas, setHasPendingTugas] = useState(false);

  useEffect(() => {
    if (user && user.role === 'siswa') {
      // Fetch topics to check unread materials
      api.get('/api/student/topics').then(res => {
        const topics = res.data || [];
        const hasUnread = topics.some((t: any) => {
          const hasQuiz = t.quizzes && t.quizzes.length > 0;
          const hasQuizAttempt = hasQuiz && t.quizzes[0].attempts && t.quizzes[0].attempts.length > 0;
          
          return t.materials?.some((m: any) => {
            const isRead = m.student_progress && m.student_progress.length > 0 && m.student_progress[0].is_read;
            return !isRead || (hasQuiz && !hasQuizAttempt);
          });
        });
        setHasPendingMateri(hasUnread);
      }).catch(() => {});
      
      // Fetch assignments to check unsubmitted
      api.get('/api/student/assignments').then(res => {
        const assignments = res.data || [];
        const hasUnsubmitted = assignments.some((a: any) => !a.has_submitted);
        setHasPendingTugas(hasUnsubmitted);
      }).catch(() => {});
    }
  }, [user, location.pathname]); // Re-fetch when route changes to keep it updated

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-xl border-t-2 border-amber-200/80 pb-safe shadow-[0_-6px_25px_rgba(245,158,11,0.1)]">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          
          let showBadge = false;
          if (user?.role === 'siswa') {
            if (item.id === 'materi' && hasPendingMateri) showBadge = true;
            if (item.id === 'tugas' && hasPendingTugas) showBadge = true;
          }

          return (
            <button
              key={item.path}
              className={`
                relative flex flex-col items-center justify-center gap-0.5
                w-18 py-1
                transition-colors duration-200
                ${isActive
                  ? item.activeText
                  : 'text-slate-500 hover:text-slate-800'
                }
              `}
              onClick={() => {
                navigate(item.path);
              }}
              type="button"
            >
              {/* Active indicator pill */}
              <div
                className={`
                  relative px-5 py-1 rounded-full transition-all duration-200
                  ${isActive ? item.activePill : 'bg-transparent'}
                `}
              >
                <Icon
                  name={isActive ? item.filledIcon : item.icon}
                  className={`text-[22px] ${isActive ? `icon-filled ${item.activeIcon}` : ''}`}
                />
                
                {/* Red Dot Badge */}
                {showBadge && (
                  <span className="absolute top-0.5 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                )}
              </div>
              <span
                className={`text-[10px] leading-tight ${
                  isActive ? 'font-black' : 'font-semibold'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
