import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import { AnimatedVisual } from '../ui/AnimatedVisuals';

interface QuickAccessItem {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
  cardStyle: string;
  path: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    icon: 'menu_book',
    label: 'Daftar Modul',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-500/25',
    cardStyle: 'bg-gradient-to-br from-sky-50 via-cyan-50/70 to-indigo-50 border-2 border-sky-200/80 text-sky-950',
    path: '#materi',
  },
  {
    icon: 'assignment',
    label: 'Tugas Saya',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25',
    cardStyle: 'bg-gradient-to-br from-emerald-50 via-teal-50/70 to-green-50 border-2 border-emerald-200/80 text-emerald-950',
    path: '/tugas',
  },
  {
    icon: 'account_circle',
    label: 'Profil Siswa',
    color: 'text-white',
    bgColor: 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/25',
    cardStyle: 'bg-gradient-to-br from-amber-50 via-orange-50/70 to-yellow-50 border-2 border-amber-200/80 text-amber-950',
    path: '/akun',
  },
];

export default function QuickAccess() {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (path.startsWith('#')) {
      const element = document.getElementById(path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <div>
      {/* Section Title */}
      <h3 className="text-xs text-blue-900 uppercase tracking-wider font-black px-1 mb-3 flex items-center gap-1.5">
        <AnimatedVisual type="bolt" className="w-4 h-4" />
        <span>Akses Kilat Siswa</span>
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {quickAccessItems.map((item) => (
          <button
            key={item.label}
            className={`
              flex flex-col items-center justify-center gap-2.5 py-4 px-2
              ${item.cardStyle} rounded-3xl shadow-sm
              hover:shadow-md hover:-translate-y-0.5
              active:scale-[0.98]
              transition-all duration-200
            `}
            onClick={() => handleNavigation(item.path)}
            type="button"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${item.bgColor} shadow-md flex items-center justify-center border-2 border-white`}
            >
              <Icon name={item.icon} className={`text-[24px] ${item.color}`} />
            </div>
            <span className="text-[11px] font-black text-center leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
