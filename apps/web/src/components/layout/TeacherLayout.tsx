import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { backendUrl } from '@lms/shared';

import Icon from '../../components/Icon';
import HeaderBar from '../dashboard/HeaderBar';

export default function TeacherLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Beranda', icon: 'home', path: '/guru/home' },
    { label: 'Materi', icon: 'menu_book', path: '/guru/materi' },
    { label: 'Tugas', icon: 'assignment', path: '/guru/tugas' },
    { label: 'Lab Guru', icon: 'computer', path: '/guru/dashboard' },
    { label: 'Akun', icon: 'person', path: '/guru/akun' }
  ];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-clip">
      <HeaderBar avatarUrl={user?.avatar_url} />

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 max-w-full overflow-x-clip pb-24">
        <Outlet />
      </main>

      {/* Footer Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-surface-container-highest px-2 py-2 flex items-center justify-around pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map(item => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button 
              key={item.label}
              onClick={() => {
                navigate(item.path);
              }}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <div className={`w-14 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-primary-container text-on-primary-container' : 'bg-transparent text-on-surface-variant'}`}>
                <Icon name={item.icon} className="" />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
