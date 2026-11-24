import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { api, saveSession, backendUrl } from '@lms/shared';
import Icon from '../../components/Icon';
import { ProfilePageSkeleton } from '../../components/ui/PageSkeleton';

export default function TeacherProfilePage() {
  const navigate = useNavigate();
  const { user, handleLogout, setUser } = useAuth();
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    api.get('/api/user')
      .then(res => {
        if (res.data) {
          saveSession(res.data);
          setUser(res.data);
        }
      })
      .catch(() => { })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  // Profile Photo state
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Edit Profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name && user.name !== '0987654321' && user.name !== 'guruinformatika' ? user.name : 'Tim Guru Informatika (Koordinator)',
    class_name: user?.class_name || 'Koordinator',
    password: ''
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast('Ukuran foto maksimal 2MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.post('/api/teacher/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = { ...user, avatar_url: response.data.avatar_url };
      saveSession(updatedUser);
      setUser(updatedUser);
      triggerToast('Foto profil berhasil diperbarui');
    } catch (error) {
      triggerToast('Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      triggerToast('Nama tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: editForm.name,
        class_name: editForm.class_name === 'Koordinator' ? null : editForm.class_name
      };
      if (editForm.password) {
        if (editForm.password.length < 6) {
          triggerToast('Kata sandi minimal 6 karakter');
          setIsSaving(false);
          return;
        }
        payload.password = editForm.password;
      }

      const response = await api.put('/api/teacher/profile', payload);
      const updatedUser = { ...user, ...response.data.user };
      saveSession(updatedUser);
      setUser(updatedUser);
      triggerToast('Profil berhasil diperbarui');
      setShowEditModal(false);
      setEditForm({ ...editForm, password: '' });
    } catch (error: any) {
      triggerToast(error.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;
  if (isLoadingProfile) return <ProfilePageSkeleton />;

  const displayName = user.name && user.name !== '0987654321' && user.name !== 'guruinformatika' ? user.name : 'Tim Guru Informatika (Koordinator)';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const isKoordinator = !user.class_name || user.identifier_no === 'guruinformatika' || user.identifier_no === '0987654321';

  return (
    <div className="flex-1 flex flex-col px-4 sm:px-8 py-6 gap-6 max-w-3xl mx-auto w-full">
      {/* Header Card: Profil Guru Berwibawa */}
      <div className="w-full bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-surface-variant/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary-fixed/30 pointer-events-none"></div>
        <div className="relative flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-3 group">
            <div className="w-24 h-24 rounded-full p-1 bg-surface-container shadow-md flex items-center justify-center text-3xl font-bold text-primary overflow-hidden border-2 border-primary/20">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url.startsWith('http') ? user.avatar_url : `${backendUrl}${user.avatar_url}`}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span>{avatarLetter}</span>
              )}
            </div>

            {/* Tombol Edit Foto */}
            <button
              onClick={() => setShowPhotoMenu(true)}
              disabled={isUploading}
              aria-label="Ubah Foto Profil"
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-95 transition-transform border-2 border-surface-container-lowest"
            >
              <Icon name={isUploading ? 'sync' : 'edit'} className={`text-[16px] ${isUploading ? 'animate-spin' : ''}`} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                setShowPhotoMenu(false);
                handlePhotoChange(e);
              }}
            />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={cameraInputRef}
              onChange={(e) => {
                setShowPhotoMenu(false);
                handlePhotoChange(e);
              }}
            />
          </div>

          {/* Identity Text */}
          <h2 className="font-headline-sm text-xl text-on-surface font-bold leading-snug">
            {displayName}
          </h2>
          <p className="text-xs text-on-surface-variant font-mono mt-1 bg-surface-container px-3 py-1 rounded-full">
            ID Akun: {user.identifier_no}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <Icon name="security" className="text-[15px]" />
              {isKoordinator ? 'Koordinator MGMP' : 'Guru Pengampu'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold">
              <Icon name="school" className="text-[15px]" />
              Sistem Aktif
            </span>
          </div>

          {/* Quick Action / Status Note */}
          <div className="w-full mt-5 bg-surface-container-low rounded-2xl p-3.5 flex items-center justify-between text-left border border-surface-variant/20">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-xs text-on-surface font-medium">
                Status Hak Akses: <span className="font-bold text-secondary">{user.class_name ? `Guru Binaan (${user.class_name})` : 'Koordinator (Semua Kelas)'}</span>
              </span>
            </div>
            <span className="text-[11px] font-medium text-outline">T.A. 2026/2027</span>
          </div>
        </div>
      </div>

      {/* Menu Direktori & Manajemen Pengguna */}
      <div className="w-full space-y-2">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block px-1">
          Manajemen Guru & Siswa
        </span>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/20 overflow-hidden flex flex-col divide-y divide-surface-container-high">
          {/* Fitur Direktori Guru Pengampu (Khusus Koordinator) */}
          <button
            onClick={() => navigate('/guru/akun/pengampu')}
            className="w-full p-4 flex items-center gap-4 hover:bg-surface-container transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Icon name="manage_accounts" className="text-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-on-surface">Direktori Guru Pengampu Kelas</p>
                <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  Fitur Koordinator
                </span>
              </div>
              <p className="text-xs text-outline truncate mt-0.5">Pantau status guru aktif, kelola akun VII A - VII D, & reset sandi</p>
            </div>
            <Icon name="chevron_right" className="text-outline text-[20px] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Direktori Siswa */}
          <button
            onClick={() => navigate('/guru/akun/siswa')}
            className="w-full p-4 flex items-center gap-4 hover:bg-surface-container transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-secondary flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Icon name="contacts" className="text-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">Rekap & Direktori Siswa</p>
              <p className="text-xs text-outline truncate mt-0.5">Manajemen Akun, Data Kelas & NISN Siswa</p>
            </div>
            <Icon name="chevron_right" className="text-outline text-[20px] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Menu Akademik */}
      <div className="w-full space-y-2">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block px-1">
          Manajemen Akademik
        </span>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/20 overflow-hidden flex flex-col divide-y divide-surface-container-high">
          <button onClick={() => navigate('/guru/nilai')} className="w-full p-4 flex items-center gap-4 hover:bg-surface-container transition-colors text-left group">
            <div className="w-10 h-10 rounded-xl bg-tertiary-container text-tertiary flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Icon name="table_chart" className="text-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">Rekap Nilai Siswa (Tugas & Kuis)</p>
              <p className="text-xs text-outline truncate mt-0.5">Pantau buku nilai akhir & unduh rekap nilai</p>
            </div>
            <Icon name="chevron_right" className="text-outline text-[20px] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Pusat Bantuan & Pengaturan */}
      <div className="w-full space-y-2">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block px-1">
          Bantuan & Pengaturan
        </span>
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-variant/20 overflow-hidden flex flex-col divide-y divide-surface-container-high">
          <button onClick={() => setShowGuideModal(true)} className="w-full p-4 flex items-center gap-4 hover:bg-surface-container transition-colors text-left group">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Icon name="menu_book" className="text-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">Panduan Penggunaan LMS</p>
              <p className="text-xs text-outline truncate mt-0.5">Tata cara kelola materi, kuis & penilaian</p>
            </div>
            <Icon name="chevron_right" className="text-outline text-[20px] group-hover:translate-x-1 transition-transform" />
          </button>

          <button onClick={() => {
            setEditForm({
              name: displayName,
              class_name: user?.class_name || 'Koordinator',
              password: ''
            });
            setShowEditModal(true);
          }} className="w-full p-4 flex items-center gap-4 hover:bg-surface-container transition-colors text-left group">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Icon name="person" className="text-[22px]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">Pengaturan Profil & Sandi</p>
              <p className="text-xs text-outline truncate mt-0.5">Ubah nama akun, peran, dan kredensial</p>
            </div>
            <Icon name="chevron_right" className="text-outline text-[20px] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Tombol Keluar Sesi Guru */}
      <div className="w-full pt-2 space-y-4">
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl bg-error-container text-error font-bold flex items-center justify-center gap-2 hover:bg-error/20 active:scale-95 transition-all shadow-sm"
          type="button"
        >
          <Icon name="logout" className="text-[20px]" />
          <span>Keluar Sesi Guru / Admin</span>
        </button>
        <div className="text-center px-4">
          <p className="text-xs font-bold text-outline">
            Portal Pendidik RuangInfo v2.5.0
          </p>
          <p className="text-[10px] text-outline-variant mt-1">
            SMP Negeri 3 Gubug • Implementasi Kurikulum Merdeka
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        <div className="bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[280px]">
          <Icon name="info" className="text-primary-fixed" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      </div>

      {/* Modal Edit Profile */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-surface-variant/20 flex items-center justify-between">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                <Icon name="manage_accounts" className="text-primary" />
                Edit Profil Akun
              </h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Nama Lengkap Guru / Admin</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Contoh: Tim Guru Informatika"
                />
              </div>

              {/* Peran / Hak Akses Kelas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Peran & Hak Akses</label>
                <select
                  value={editForm.class_name}
                  onChange={e => setEditForm({ ...editForm, class_name: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                >
                  <option value="Koordinator">Koordinator (Semua Kelas VII A - VII D)</option>
                  <option value="VII A">Guru Pengampu Kelas VII A</option>
                  <option value="VII B">Guru Pengampu Kelas VII B</option>
                  <option value="VII C">Guru Pengampu Kelas VII C</option>
                  <option value="VII D">Guru Pengampu Kelas VII D</option>
                </select>
                <p className="text-[11px] text-on-surface-variant">
                  Koordinator memiliki wewenang penuh memantau semua kelas dan mengelola akun guru kelas.
                </p>
              </div>

              {/* Ganti Sandi */}
              {user.class_name && !isKoordinator ? (
                <div className="p-3.5 bg-secondary-container/30 border border-secondary/30 rounded-xl flex items-start gap-3 text-xs text-on-surface">
                  <Icon name="shield" className="text-secondary text-[20px] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-secondary text-sm">Hak Akses Guru Kelas Terproteksi</p>
                    <p className="text-on-surface-variant mt-1 leading-relaxed">
                      Kata sandi akun guru pengampu ({user.class_name}) dikelola secara terpusat oleh Koordinator Guru. Hubungi Koordinator jika Anda memerlukan pembaruan kata sandi.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Ganti Kata Sandi <span className="text-on-surface-variant font-normal">(Opsional)</span></label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Kosongkan jika tidak ingin mengubah"
                  />
                  <p className="text-[11px] text-on-surface-variant">Kata sandi minimal 6 karakter.</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-surface-variant/20 bg-surface-container-low flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm text-sm"
              >
                {isSaving && <Icon name="sync" className="animate-spin text-[16px]" />}
                Simpan Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-surface-variant/20 flex items-center justify-between shrink-0 bg-primary/5">
              <h3 className="font-headline-sm text-base font-bold text-on-surface flex items-center gap-2">
                <Icon name="menu_book" className="text-primary" />
                Panduan Penggunaan LMS (Guru)
              </h3>
              <button onClick={() => setShowGuideModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-on-surface-variant leading-relaxed">
              <div className="p-3 bg-surface-container rounded-xl">
                <p className="font-bold text-on-surface text-sm mb-1">1. Monitoring Lab Komputer</p>
                <p>Pantau status online siswa secara langsung. Sistem secara otomatis mendeteksi kehadiran, aktivitas mengerjakan materi/kuis, serta waktu logout siswa.</p>
              </div>
              <div className="p-3 bg-surface-container rounded-xl">
                <p className="font-bold text-on-surface text-sm mb-1">2. Direktori Guru Pengampu</p>
                <p>Khusus Koordinator: Dapat melihat semua akun guru yang sedang berjalan/online, membuat akun per kelas, mereset kata sandi, dan menyinkronkan akun VII A - VII D.</p>
              </div>
              <div className="p-3 bg-surface-container rounded-xl">
                <p className="font-bold text-on-surface text-sm mb-1">3. Penugasan & Kuis Terintegrasi</p>
                <p>Buat tugas dengan perintah upload file atau link. Guru pengampu kelas hanya akan menerima dan menilai tugas dari kelas ampuannya.</p>
              </div>
            </div>
            <div className="p-4 border-t border-surface-variant/20 bg-surface-container-low flex justify-end">
              <button onClick={() => setShowGuideModal(false)} className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs">
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
