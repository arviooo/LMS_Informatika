import { useState, useEffect } from 'react';
import { api, type User, getCurrentUser } from '@lms/shared';
import { useNavigate } from 'react-router-dom';

import Icon from '../../components/Icon';
import { TeacherHomeSkeleton } from '../../components/ui/PageSkeleton';
export default function TeacherHomePage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/teacher/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col relative w-full min-h-screen pb-24">
      {/* Header Banner */}
      <section className="px-5 sm:px-8 pt-8 pb-4">
        <div className="bg-primary text-on-primary rounded-3xl p-8 shadow-sm relative overflow-hidden transition-transform hover:scale-[1.01] duration-300">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 animate-pulse-slow"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Selamat Datang, {user?.name}!</h1>
            <p className="text-sm sm:text-base text-on-primary/80 mt-2">{user?.class_name ? `Guru Pengampu Kelas ${user.class_name} • Ringkasan aktivitas kelas binaan Anda hari ini.` : 'Koordinator Guru Informatika • Ringkasan aktivitas seluruh kelas hari ini.'}</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <TeacherHomeSkeleton />
      ) : (
      <>
      {/* Stats Grid */}
      <section className="px-5 sm:px-8 py-4 grid grid-cols-2 gap-4">
        {/* Total Siswa - Pastel Green */}
        <div className="bg-[#B7F4D8] rounded-2xl p-5 flex flex-col items-start shadow-sm hover:brightness-95 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-full bg-[#128254] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Icon name="groups" className="text-[20px]" />
          </div>
          <span className="text-3xl font-bold text-[#128254]">
            {isLoading ? <span className="animate-pulse bg-white/50 text-transparent rounded">00</span> : stats?.total_students || 0}
          </span>
          <span className="text-xs text-[#128254]/80 mt-1 font-bold">Total Siswa Aktif</span>
        </div>
        
        {/* Tugas Terkumpul - Pastel Brown/Amber */}
        <div className="bg-[#DAB88B] rounded-2xl p-5 flex flex-col items-start shadow-sm hover:brightness-95 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-full bg-[#825412] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Icon name="assignment_turned_in" className="text-[20px]" />
          </div>
          <span className="text-3xl font-bold text-[#4A2F0A]">
            {isLoading ? <span className="animate-pulse bg-white/30 text-transparent rounded">00</span> : stats?.tasks_submitted || 0}
          </span>
          <span className="text-xs text-[#4A2F0A]/80 mt-1 font-bold">Tugas Terkumpul</span>
        </div>
        
        {/* Rata-rata Nilai - Pastel Blue */}
        <div className="bg-[#94B3F6] rounded-2xl p-5 flex flex-col items-start shadow-sm hover:brightness-95 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-full bg-[#0047AB] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Icon name="speed" className="text-[20px]" />
          </div>
          <span className="text-3xl font-bold text-[#002A66]">
            {isLoading ? <span className="animate-pulse bg-white/30 text-transparent rounded">00</span> : stats?.avg_score || 0}
          </span>
          <span className="text-xs text-[#002A66]/80 mt-1 font-bold">Rata-rata Nilai</span>
        </div>
        
        {/* Perlu Bimbingan - Pastel Red */}
        <div className="bg-[#FFE5E5] rounded-2xl p-5 flex flex-col items-start shadow-sm hover:brightness-95 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-full bg-[#D32F2F] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <Icon name="warning" className="text-[20px]" />
          </div>
          <span className="text-3xl font-bold text-[#B71C1C]">
            {isLoading ? <span className="animate-pulse bg-white/50 text-transparent rounded">0</span> : stats?.bimbingan || 0}
          </span>
          <span className="text-xs text-[#B71C1C]/80 mt-1 font-bold">Perlu Bimbingan</span>
        </div>
      </section>

      {/* Graph Area */}
      <section className="px-5 sm:px-8 py-4">
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-variant/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-on-surface leading-tight">Grafik Partisipasi <br/><span className="text-sm text-primary">Siswa Login Hari Ini</span></h2>
            <button className="text-primary text-sm font-bold flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full">
              Real-time <Icon name="sync" className="text-[16px] animate-spin-slow" />
            </button>
          </div>
          
          <div className="h-56 w-full flex pt-4 relative">
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-on-surface-variant w-8">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            
            <div className="flex-1 h-full relative ml-8 border-b border-surface-container-highest">
              {/* Line Chart SVG */}
              <div className="absolute top-0 left-0 right-0 bottom-8">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {stats?.class_progress && stats.class_progress.length > 1 && (
                    <>
                      <polygon 
                        points={`0,100 ${stats.class_progress.map((item: any, i: number) => `${(i / (stats.class_progress.length - 1)) * 100},${100 - item.value}`).join(' ')} 100,100`} 
                        fill="url(#lineGradient)" 
                      />
                      <polyline 
                        points={stats.class_progress.map((item: any, i: number) => `${(i / (stats.class_progress.length - 1)) * 100},${100 - item.value}`).join(' ')} 
                        fill="none" 
                        stroke="#4f46e5" 
                        strokeWidth="3" 
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                </svg>
              </div>

              {/* Data Points & Tooltips */}
              <div className="absolute top-0 left-0 right-0 bottom-8 flex justify-between pointer-events-none">
                {(stats?.class_progress || []).map((item: any, i: number) => (
                  <div key={i} className="relative h-full flex flex-col items-center pointer-events-auto group cursor-pointer" style={{ width: '40px', margin: '0 -20px' }}>
                    
                    {/* Hover Hitbox (invisible tall bar) */}
                    <div className="absolute inset-0 w-full h-full z-0"></div>

                    {/* The Dot */}
                    <div 
                      className="absolute w-3.5 h-3.5 rounded-full bg-white border-[3px] border-[#4f46e5] z-10 transition-transform group-hover:scale-150 shadow-sm" 
                      style={{ top: `calc(${100 - item.value}% - 7px)` }}
                    ></div>
                    
                    {/* Tooltip */}
                    <div 
                      className="absolute bg-inverse-surface text-inverse-on-surface text-[10px] px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl flex flex-col items-center z-20 pointer-events-none"
                      style={{ top: `calc(${100 - item.value}% - 3rem)` }}
                    >
                      <span className="font-bold text-primary-container">{item.value}% Hadir</span>
                      <span className="opacity-80">{item.count} dari {item.total} anak</span>
                    </div>

                    {/* X-Axis Label */}
                    <span className="absolute -bottom-6 text-[10px] font-bold text-on-surface-variant whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tombol Detail untuk Mobile */}
          <button 
            onClick={() => navigate('/guru/akun/siswa')} 
            className="w-full mt-8 py-3 flex items-center justify-center gap-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
          >
            Lihat Detail Kehadiran Siswa
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      </section>

      {/* Quick Menu */}
      <section className="px-5 sm:px-8 py-4">
        <h2 className="text-lg font-bold text-on-surface mb-4">Akses Cepat</h2>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/guru/dashboard')} className="w-full bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container transition-colors text-left">
            <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0">
              <Icon name="computer" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-on-surface">Lab Guru (Monitoring)</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Pantau aktivitas praktik siswa saat ini</p>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </button>
          
          <button onClick={() => navigate('/guru/materi')} className="w-full bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container transition-colors text-left">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-secondary flex items-center justify-center shrink-0">
              <Icon name="menu_book" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-on-surface">Kelola Materi</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Tambah atau edit bahan ajar</p>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </button>
          
          <button onClick={() => navigate('/guru/akun/siswa')} className="w-full bg-surface-container-low p-4 rounded-2xl flex items-center gap-4 hover:bg-surface-container transition-colors text-left">
            <div className="w-12 h-12 rounded-full bg-tertiary-container text-tertiary flex items-center justify-center shrink-0">
              <Icon name="groups" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-on-surface">Direktori Siswa</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">Kelola akun, kelas, dan reset password</p>
            </div>
            <Icon name="chevron_right" className="text-on-surface-variant" />
          </button>
        </div>
      </section>
      </>
      )}
    </div>
  );
}
