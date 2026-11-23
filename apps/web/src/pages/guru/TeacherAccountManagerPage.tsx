import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@lms/shared';
import Icon from '../../components/Icon';
import { DirectoryListSkeleton } from '../../components/ui/PageSkeleton';
import Swal from 'sweetalert2';

interface TeacherItem {
  id: number;
  name: string;
  identifier_no: string;
  class_name: string | null;
  is_coordinator: boolean;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  last_logout_at: string | null;
  last_activity_at: string | null;
  online_status: 'online' | 'logged_out' | 'offline';
}

export default function TeacherAccountManagerPage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Semua Guru');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    class_name: 'VII A',
    identifier_no: '',
    password: 'password123'
  });

  const tabOptions = ['Semua Guru', 'Koordinator', 'VII A', 'VII B', 'VII C', 'VII D'];
  const classSelectOptions = ['Koordinator', 'VII A', 'VII B', 'VII C', 'VII D', 'Lainnya'];
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [customClass, setCustomClass] = useState('');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/teacher/accounts');
      setTeachers(res.data);
    } catch (err: any) {
      console.error('Failed to fetch teachers:', err);
      const msg = err.response?.data?.message || 'Gagal memuat direktori akun guru. Pastikan file backend terbaru sudah diupload.';
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: msg
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    // Auto-refresh status every 15 seconds to monitor live teacher presence
    const timer = setInterval(() => {
      api.get('/api/teacher/accounts').then(res => setTeachers(res.data)).catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      class_name: 'VII A',
      identifier_no: 'guru_viia',
      password: 'password123'
    });
    setIsCustomClass(false);
    setCustomClass('');
    setShowAddModal(true);
  };

  const handleClassChange = (selected: string) => {
    if (selected === 'Lainnya') {
      setIsCustomClass(true);
      setFormData(prev => ({
        ...prev,
        class_name: customClass || '',
        identifier_no: customClass ? `guru_${customClass.toLowerCase().replace(/[\s-]/g, '')}` : prev.identifier_no
      }));
    } else if (selected === 'Koordinator') {
      setIsCustomClass(false);
      setFormData(prev => ({
        ...prev,
        class_name: 'Koordinator',
        identifier_no: 'guru_koordinator'
      }));
    } else {
      setIsCustomClass(false);
      const slug = selected.toLowerCase().replace(/[\s-]/g, '');
      setFormData(prev => ({
        ...prev,
        class_name: selected,
        identifier_no: `guru_${slug}`
      }));
    }
  };

  const handleCustomClassChange = (val: string) => {
    setCustomClass(val);
    const slug = val.toLowerCase().replace(/[\s-]/g, '');
    setFormData(prev => ({
      ...prev,
      class_name: val,
      identifier_no: slug ? `guru_${slug}` : ''
    }));
  };

  const handleOpenEdit = (t: TeacherItem) => {
    setSelectedTeacher(t);
    const currentClass = t.class_name || 'Koordinator';
    const isStandard = ['Koordinator', 'VII A', 'VII B', 'VII C', 'VII D'].includes(currentClass);
    setIsCustomClass(!isStandard);
    if (!isStandard) {
      setCustomClass(currentClass);
    }
    setFormData({
      name: t.name && t.name !== '0987654321' ? t.name : 'Tim Guru Informatika (Koordinator)',
      class_name: currentClass,
      identifier_no: t.identifier_no || '',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Perhatian', 'Nama Guru wajib diisi', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post('/api/teacher/accounts', formData);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: `Akun <b>${formData.name}</b> (${formData.class_name}) berhasil dibuat.<br><br>
               Username: <code>${res.data.teacher.identifier_no}</code><br>
               Password: <code>${res.data.default_password}</code>`,
      });
      setShowAddModal(false);
      fetchTeachers();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal membuat akun guru', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    if (!formData.name.trim()) {
      Swal.fire('Perhatian', 'Nama Guru wajib diisi', 'warning');
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/api/teacher/accounts/${selectedTeacher.id}`, formData);
      Swal.fire('Berhasil', 'Data guru pengampu berhasil diperbarui!', 'success');
      setShowEditModal(false);
      fetchTeachers();
    } catch (err: any) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal memperbarui data', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (t: TeacherItem) => {
    const result = await Swal.fire({
      title: `Reset Sandi Akun?`,
      html: `Kata sandi akun <b>${t.name}</b> (${t.class_name || 'Koordinator'}) akan direset ke default: <code>password123</code>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Reset Sandi',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setActionLoading(true);
        const res = await api.post(`/api/teacher/accounts/${t.id}/reset-password`);
        Swal.fire('Berhasil!', res.data.message, 'success');
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.message || 'Gagal mereset sandi', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteTeacher = async (t: TeacherItem) => {
    if (t.identifier_no === '0987654321') {
      Swal.fire('Pemberitahuan', 'Akun Koordinator Utama tidak dapat dihapus.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: `Hapus Akun Guru?`,
      html: `Akun <b>${t.name}</b> (${t.class_name || 'Guru'}) akan dihapus permanen dari sistem.`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Akun',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setActionLoading(true);
        await api.delete(`/api/teacher/accounts/${t.id}`);
        Swal.fire('Terhapus!', `Akun guru telah dihapus.`, 'success');
        fetchTeachers();
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus akun', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAutoGenerate = async () => {
    const result = await Swal.fire({
      title: 'Sinkronkan Otomatis Akun VII A - VII D?',
      text: 'Sistem akan otomatis memastikan akun guru pengampu (VII A, VII B, VII C, VII D, dan Koordinator) aktif di database dengan password default: "password123".',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Ya, Sinkronkan Sekarang',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        setActionLoading(true);
        const res = await api.post('/api/teacher/accounts/auto-generate');
        Swal.fire('Selesai!', res.data.message, 'success');
        fetchTeachers();
      } catch (err: any) {
        Swal.fire('Gagal', err.response?.data?.message || 'Gagal sinkronkan akun otomatis', 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Filter logic
  const filteredTeachers = teachers.filter(t => {
    // 1. Tab filter
    if (activeTab === 'Koordinator') {
      if (!t.is_coordinator && t.class_name) return false;
    } else if (activeTab !== 'Semua Guru') {
      if (t.class_name !== activeTab) return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchId = t.identifier_no.toLowerCase().includes(q);
      const matchClass = (t.class_name || 'Koordinator').toLowerCase().includes(q);
      return matchName || matchId || matchClass;
    }

    return true;
  });

  // Calculate stats
  const totalTeachers = teachers.length;
  const onlineCount = teachers.filter(t => t.online_status === 'online').length;
  const loggedOutCount = teachers.filter(t => t.online_status === 'logged_out').length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip font-body-md text-on-surface flex flex-col pb-safe">
      {/* Header with Back Button */}
      <header className="w-full bg-surface/90 backdrop-blur-xl shadow-xs border-b border-surface-variant/20">
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button 
              aria-label="Kembali" 
              className="w-9 h-9 -ml-1 flex items-center justify-center rounded-full bg-surface-container/60 hover:bg-surface-container-high transition-colors text-on-surface shrink-0"
              onClick={() => navigate('/guru/akun')}
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-label-sm text-[10px] text-primary font-bold uppercase tracking-wider leading-none truncate">
                Manajemen Akun Guru
              </span>
              <h1 className="font-headline-sm text-sm sm:text-xl text-on-surface font-bold leading-tight truncate mt-0.5">
                Direktori Guru Pengampu
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleAutoGenerate}
              disabled={actionLoading}
              className="h-9 w-9 sm:w-auto sm:px-3 rounded-xl bg-tertiary-container text-on-tertiary-container text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-95 active:scale-95 transition-all shadow-xs shrink-0"
              title="Sinkronkan Akun VII A - VII D"
            >
              <Icon name="bolt" className="text-[16px] text-tertiary" />
              <span className="hidden sm:inline">Auto-Sync VII A - VII D</span>
            </button>
            <button
              onClick={handleOpenAdd}
              disabled={actionLoading}
              className="h-9 px-3 sm:px-4 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 active:scale-95 transition-all shadow-xs shrink-0 whitespace-nowrap"
            >
              <Icon name="person_add" className="text-[15px]" />
              <span>Tambah Guru</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full min-w-0 max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-4 overflow-x-clip">
        {/* Statistics Bar - Live Presence Monitor */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
          <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-2xl border border-surface-variant/20 shadow-xs flex flex-col justify-between min-w-0">
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-semibold leading-tight truncate">
              Total Akun
            </span>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-extrabold text-on-surface leading-none">{totalTeachers}</span>
              <span className="text-[10px] sm:text-xs text-on-surface-variant truncate">Guru</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-2xl border border-secondary/30 shadow-xs flex flex-col justify-between min-w-0">
            <span className="text-[11px] sm:text-xs text-secondary font-bold leading-tight truncate">
              Sedang Aktif
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0"></span>
              <span className="text-lg sm:text-2xl font-extrabold text-secondary leading-none">{onlineCount}</span>
              <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant truncate">Online</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-2xl border border-surface-variant/20 shadow-xs flex flex-col justify-between min-w-0">
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-semibold leading-tight truncate">
              Sudah Logout
            </span>
            <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-tertiary shrink-0"></span>
              <span className="text-lg sm:text-2xl font-extrabold text-tertiary leading-none">{loggedOutCount}</span>
              <span className="text-[10px] sm:text-xs font-normal text-on-surface-variant truncate">Selesai</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Class Filter Tabs */}
        <div className="flex flex-col gap-3 w-full min-w-0">
          {/* Class Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full max-w-full">
            {tabOptions.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-full font-label-md text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs shrink-0 ${
                  activeTab === tab 
                    ? 'bg-primary text-on-primary font-bold' 
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-surface-variant/20'
                }`}
              >
                {tab === 'Koordinator' || tab === 'Semua Guru' ? tab : `Kelas ${tab}`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex items-center w-full">
            <Icon name="search" className="absolute left-3.5 text-outline text-[20px] pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama guru, kelas ampuan, atau username..."
              className="w-full h-11 pl-11 pr-9 rounded-xl bg-surface-container-lowest text-xs sm:text-sm border border-surface-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-outline hover:text-on-surface"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            )}
          </div>
        </div>

        {/* Teachers List / Cards */}
        {loading ? (
          <DirectoryListSkeleton count={4} />
        ) : filteredTeachers.length === 0 ? (
          <div className="py-16 px-4 bg-surface-container-lowest rounded-3xl border border-dashed border-surface-variant/40 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-outline mb-3">
              <Icon name="manage_accounts" className="text-[32px]" />
            </div>
            <h3 className="font-bold text-on-surface text-base">Tidak Ada Guru Ditemukan</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mt-1 mb-4">
              {searchQuery ? 'Tidak ada akun guru yang sesuai dengan pencarian.' : 'Belum ada akun guru yang tersimpan di tab ini.'}
            </p>
            <button
              onClick={handleAutoGenerate}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 hover:bg-primary/90 shadow-sm"
            >
              <Icon name="bolt" className="text-[16px]" />
              <span>Sinkronkan Akun VII A - VII D Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full min-w-0">
            {filteredTeachers.map((t) => {
              const displayName = t.name && t.name !== '0987654321' ? t.name : (t.is_coordinator ? 'Tim Guru Informatika (Koordinator)' : t.name);
              const avatarChar = displayName.charAt(0).toUpperCase();

              return (
                <div
                  key={t.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-surface-variant/20 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3 w-full min-w-0 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2.5 min-w-0">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center overflow-hidden shrink-0 border border-primary/20">
                        {t.avatar_url ? (
                          <img src={t.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{avatarChar}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-on-surface text-sm sm:text-base leading-snug break-words">
                            {displayName}
                          </h3>
                          {/* Class Scope Badge */}
                          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                            t.is_coordinator 
                              ? 'bg-primary-container text-on-primary-container' 
                              : 'bg-secondary-container text-on-secondary-container'
                          }`}>
                            {t.class_name ? `Kelas ${t.class_name}` : 'Koordinator'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[11px] text-on-surface-variant font-mono bg-surface-container px-2 py-0.5 rounded-md">
                            @{t.identifier_no}
                          </span>
                          {/* Live Presence Status Badge */}
                          {t.online_status === 'online' ? (
                            <span className="inline-flex items-center gap-1 bg-secondary-container/70 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                              Aktif Online
                            </span>
                          ) : t.online_status === 'logged_out' ? (
                            <span className="inline-flex items-center gap-1 bg-surface-container text-tertiary text-[10px] font-medium px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                              Sudah Logout
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-surface-container text-outline text-[10px] font-medium px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                              Belum Login
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Timestamps */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-outline bg-surface-container-low/50 px-3 py-1.5 rounded-xl">
                    <span>
                      {t.last_login_at ? `Login: ${t.last_login_at}` : 'Belum pernah login'}
                    </span>
                    {t.last_activity_at && t.online_status === 'online' && (
                      <span className="text-secondary font-semibold">
                        Aktif {t.last_activity_at}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-surface-variant/15 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => handleResetPassword(t)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-primary-fixed/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Reset kata sandi ke password123"
                    >
                      <Icon name="key" className="text-[15px]" />
                      <span>Reset Sandi</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        disabled={actionLoading}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Edit Data Guru"
                      >
                        <Icon name="edit" className="text-[16px]" />
                        <span>Edit</span>
                      </button>

                      {t.identifier_no !== '0987654321' && (
                        <button
                          onClick={() => handleDeleteTeacher(t)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-error-container/40 hover:bg-error-container text-error transition-colors"
                          title="Hapus Akun Guru"
                        >
                          <Icon name="delete" className="text-[17px]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL TAMBAH GURU */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-surface-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon name="person_add" className="text-[20px]" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface">Tambah Akun Guru Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 sm:p-6 flex flex-col gap-4">
              {/* Opsi 1: Nama Guru */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  1. Nama Lengkap Guru <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Opsi 2: Kelas yang Diampu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  2. Kelas yang Diampu <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {classSelectOptions.map((cls) => {
                    const isSelected = isCustomClass ? cls === 'Lainnya' : formData.class_name === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleClassChange(cls)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-container border-outline/30 text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>

                {isCustomClass && (
                  <input
                    type="text"
                    required
                    value={customClass}
                    onChange={(e) => handleCustomClassChange(e.target.value)}
                    placeholder="Ketik nama kelas (misal: VII E atau VIII A)"
                    className="w-full mt-2 bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                )}
              </div>

              {/* Opsi 3: Username ID Login */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  3. Username / ID Login <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.identifier_no}
                  onChange={(e) => setFormData({ ...formData, identifier_no: e.target.value })}
                  placeholder="Contoh: guru_viia"
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="text-[11px] text-on-surface-variant">
                  Digunakan untuk masuk di halaman Login LMS.
                </p>
              </div>

              {/* Opsi 4: Kata Sandi Awal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  4. Kata Sandi Awal
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Default: password123"
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="text-[11px] text-on-surface-variant">
                  Default otomatis: <code>password123</code>
                </p>
              </div>

              <div className="pt-3 border-t border-surface-variant/20 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                  {actionLoading ? <Icon name="progress_activity" className="animate-spin text-[18px]" /> : <Icon name="save" className="text-[18px]" />}
                  Simpan Akun Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT GURU */}
      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-surface-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Icon name="edit" className="text-[20px]" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-on-surface">Edit Akun Guru</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Nama Lengkap Guru <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Kelas yang Diampu <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {classSelectOptions.map((cls) => {
                    const isSelected = isCustomClass ? cls === 'Lainnya' : formData.class_name === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleClassChange(cls)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-container border-outline/30 text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>

                {isCustomClass && (
                  <input
                    type="text"
                    required
                    value={customClass}
                    onChange={(e) => handleCustomClassChange(e.target.value)}
                    placeholder="Nama kelas baru"
                    className="w-full mt-2 bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Username / ID Login <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.identifier_no}
                  onChange={(e) => setFormData({ ...formData, identifier_no: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Ganti Kata Sandi Baru <span className="text-outline font-normal">(Kosongkan jika tidak diubah)</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ketik kata sandi baru (minimal 6 karakter)"
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t border-surface-variant/20 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                  {actionLoading ? <Icon name="progress_activity" className="animate-spin text-[18px]" /> : <Icon name="save" className="text-[18px]" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
