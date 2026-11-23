import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../App';
import BottomNav from '../../components/dashboard/BottomNav';
import { api, saveSession, backendUrl } from '@lms/shared';
import { useNavigate } from 'react-router-dom';

import Icon from '../../components/Icon';
import Swal from 'sweetalert2';
import HeaderBar from '../../components/dashboard/HeaderBar';
import { ProfilePageSkeleton } from '../../components/ui/PageSkeleton';
import { AnimatedVisual } from '../../components/ui/AnimatedVisuals';

export default function StudentProfilePage() {
  const { user, handleLogout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isDataSaver, setIsDataSaver] = useState(true);
  const [classSetting, setClassSetting] = useState({ homeroom_teacher: 'Tim Guru Informatika', informatics_teacher: 'Tim Guru Informatika' });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (user && user.role === 'siswa') {
      api.get('/api/student/class-setting')
        .then(res => setClassSetting(res.data))
        .catch(err => console.error('Failed to load class setting', err))
        .finally(() => setIsLoadingProfile(false));
    } else {
      setIsLoadingProfile(false);
    }
  }, [user]);

  if (!user) return null;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      
      try {
        setIsUploading(true);
        const res = await api.post('/api/student/profile', { avatar_base64: base64String });
        if (res.data.user) {
          const updatedUser = { ...user, avatar_url: res.data.user.avatar_url };
          saveSession(updatedUser);
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to upload photo', error);
        Swal.fire('Error', 'Gagal mengunggah foto profil', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setShowPhotoMenu(false);
    const result = await Swal.fire({
      title: 'Hapus Foto Profil?',
      text: "Yakin ingin menghapus foto profil?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33'
    });
    if (!result.isConfirmed) return;
    try {
      setIsUploading(true);
      const res = await api.post('/api/student/profile', { remove_avatar: true });
      if (res.data.user) {
        const updatedUser = { ...user, avatar_url: null };
        saveSession(updatedUser);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to remove photo', error);
      Swal.fire('Error', 'Gagal menghapus foto profil', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const notifyFeature = (feature: string) => {
    Swal.fire('Info', `Fitur ${feature} sedang dalam pengembangan.`, 'info');
  };

  const handleSavePassword = async () => {
    if (passwordForm.newPassword.length < 6) {
      Swal.fire('Peringatan', 'Kata sandi minimal 6 karakter', 'warning');
      return;
    }
    
    setIsSaving(true);
    try {
      await api.post('/api/student/profile', { password: passwordForm.newPassword });
      Swal.fire('Sukses', 'Kata sandi berhasil diperbarui', 'success');
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '' });
    } catch (error) {
      console.error('Failed to change password', error);
      Swal.fire('Error', 'Gagal mengganti kata sandi. Coba lagi.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmLogout = async () => {
    const result = await Swal.fire({
      title: 'Keluar dari Akun?',
      text: 'Apakah kamu yakin ingin keluar dari akun RuangInfo? Kamu perlu masuk kembali dengan NISN dan kata sandi.',
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
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <HeaderBar title="Profil Siswa" backUrl={-1} />

      <main className="flex-1 flex flex-col relative w-full pt-4 pb-24 px-4">
        {isLoadingProfile ? (
          <ProfilePageSkeleton />
        ) : (
        <div className="flex flex-col w-full pb-8 space-y-5 max-w-md mx-auto pt-2 animate-fade-in">
          
          {/* 1. Header Card Profil Siswa (Cerah, Berwarna & Harmonis) */}
          <section className="relative w-full rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 shadow-xl shadow-blue-500/15 p-6 overflow-hidden border-2 border-amber-300/80 text-white">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-300/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-300/25 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-gradient-to-tr from-amber-300 to-yellow-300 p-1 text-4xl text-blue-900 font-black flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${backendUrl}${user.avatar_url}`} alt="Foto Profil" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                {/* Ubah Foto Pill Button */}
                <button 
                  onClick={() => setShowPhotoMenu(true)}
                  disabled={isUploading}
                  aria-label="Ubah Foto Profil" 
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md active:scale-95 transition-transform border-2 border-white"
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

              <div className="mt-3 space-y-1">
                <h2 className="text-xl text-white font-black tracking-tight">{user.name}</h2>
                <p className="text-xs text-amber-200 font-bold">
                  Kelas {user.class_name || '-'} • NISN: {user.identifier_no}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-black shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
                  Siswa Aktif T.A 2026/2027
                </span>
              </div>
            </div>
          </section>

          {/* 3. Informasi Data Akademik Siswa */}
          <section className="space-y-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-blue-900 px-1 flex items-center gap-1.5">
              <AnimatedVisual type="school" className="w-4 h-4" />
              <span>Data Akademik & Sistem</span>
            </h3>
            <div className="rounded-3xl bg-white shadow-sm divide-y divide-amber-100 border-2 border-amber-200/80 overflow-hidden">
              
              {/* Item 1: Sekolah */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-blue-700 shrink-0">
                  <Icon name="school" className="text-[22px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-500 block mb-0.5">Satuan Pendidikan</span>
                  <span className="text-sm text-slate-900 font-black truncate block">SMP Negeri 3 Gubug</span>
                </div>
              </div>

              {/* Item 2: Wali Kelas */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-orange-600 shrink-0">
                  <Icon name="person" className="text-[22px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-500 block mb-0.5">Wali Kelas</span>
                  <span className="text-sm text-slate-900 font-black truncate block">{classSetting.homeroom_teacher}</span>
                </div>
              </div>

              {/* Item 2.5: Guru Informatika */}
              <div className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                  <Icon name="terminal" className="text-[22px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-slate-500 block mb-0.5">Guru Informatika</span>
                  <span className="text-sm text-slate-900 font-black truncate block">{classSetting.informatics_teacher}</span>
                </div>
              </div>

            </div>
          </section>

          {/* Sertifikat & Pencapaian */}
          <section className="space-y-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-orange-800 px-1 flex items-center gap-1.5 mt-1">
              <AnimatedVisual type="trophy" className="w-4 h-4" />
              <span>Sertifikat & Pencapaian</span>
            </h3>
            <div className="rounded-3xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 shadow-sm border-2 border-amber-300/80 overflow-hidden">
              <button onClick={() => navigate('/siswa/sertifikat')} className="w-full min-h-[56px] p-4 flex items-center justify-between text-left hover:bg-amber-100/50 active:scale-[0.99] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                    <Icon name="star" className="text-[22px]" />
                  </div>
                  <div>
                    <span className="text-sm text-amber-950 font-black block mb-0.5">E-Sertifikat Kelulusan</span>
                    <span className="text-xs font-semibold text-amber-800/80 block">Unduh sertifikat resmi (bila tuntas 100%)</span>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-amber-700 text-[20px]" />
              </button>
            </div>
          </section>

          {/* 5. Pusat Bantuan & Pengaturan */}
          <section className="space-y-2.5">
            <h3 className="font-black text-xs uppercase tracking-wider text-sky-900 px-1 flex items-center gap-1.5 mt-1">
              <AnimatedVisual type="settings" className="w-4 h-4" />
              <span>Pusat Bantuan & Akun</span>
            </h3>
            <div className="rounded-3xl bg-white shadow-sm divide-y divide-sky-100 border-2 border-sky-200/80 overflow-hidden">
              {/* Item: Panduan LMS */}
              <button onClick={() => setShowGuideModal(true)} className="w-full min-h-[52px] p-4 flex items-center justify-between text-left hover:bg-sky-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
                    <Icon name="menu_book" className="text-[20px]" />
                  </div>
                  <div>
                    <span className="text-sm text-slate-900 font-black block mb-0.5">Panduan Belajar</span>
                    <span className="text-xs font-semibold text-slate-500 block">Cara menggunakan aplikasi LMS ini</span>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-slate-400 text-[20px]" />
              </button>

              {/* Item: Ganti Kata Sandi */}
              <button onClick={() => setShowPasswordModal(true)} className="w-full min-h-[52px] p-4 flex items-center justify-between text-left hover:bg-indigo-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <Icon name="lock_reset" className="text-[20px]" />
                  </div>
                  <div>
                    <span className="text-sm text-slate-900 font-black block mb-0.5">Ganti Kata Sandi</span>
                    <span className="text-xs font-semibold text-slate-500 block">Perbarui password akun kamu</span>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-slate-400 text-[20px]" />
              </button>
            </div>
          </section>

          {/* 6. Tombol Aksi Keluar & Info Aplikasi */}
          <section className="space-y-4 pt-3">
            <button 
              onClick={confirmLogout}
              className="w-full h-12 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white font-black flex items-center justify-center gap-2 hover:from-rose-600 hover:to-red-600 active:scale-95 transition-all shadow-md shadow-rose-500/20"
            >
              <Icon name="logout" className="text-[20px]" />
              Keluar dari Akun Siswa
            </button>

            <div className="text-center space-y-1 pb-2">
              <p className="text-[11px] text-outline font-bold uppercase tracking-wider">
                LMS RuangInfo • Versi 2.4.0
              </p>
              <p className="text-[10px] text-outline-variant">
                SMP Negeri 3 Gubug • Kabupaten Grobogan
              </p>
            </div>
          </section>

        </div>
        )}
      </main>

      <BottomNav />
      
      {/* Photo Options Modal/Bottom Sheet */}
      {showPhotoMenu && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowPhotoMenu(false)}></div>
          <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 fade-in duration-300 pb-safe">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-surface-container-highest shadow-sm flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url.startsWith('http') ? user.avatar_url : `${backendUrl}${user.avatar_url}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h3 className="font-bold text-on-surface">Edit foto profil</h3>
              </div>
              <button 
                onClick={() => setShowPhotoMenu(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            {/* Menu Options */}
            <div className="flex flex-col py-2">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors text-left"
              >
                <span className="text-sm font-bold text-on-surface">Ambil foto</span>
                <Icon name="photo_camera" className="text-on-surface-variant" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors text-left"
              >
                <span className="text-sm font-bold text-on-surface">Pilih foto</span>
                <Icon name="image" className="text-on-surface-variant" />
              </button>
              {user.avatar_url && (
                <>
                  <div className="h-px bg-surface-variant/20 my-2 mx-6"></div>
                  <button 
                    onClick={handleRemovePhoto}
                    disabled={isUploading}
                    className="flex items-center justify-between px-6 py-4 hover:bg-error/10 transition-colors text-left group"
                  >
                    <span className="text-sm font-bold text-error">Hapus foto</span>
                    <Icon name="delete" className="text-error/70 group-hover:text-error" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal Panduan Belajar */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-surface-variant/20 flex items-center justify-between shrink-0 bg-primary/5">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                <Icon name="menu_book" className="text-primary" />
                Panduan Belajar LMS
              </h3>
              <button onClick={() => setShowGuideModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Membaca Materi</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Buka menu <span className="font-bold text-primary">Materi</span>. Pilih Topik, lalu klik judul materi. Kamu wajib membaca materi sampai selesai agar mendapatkan centang hijau.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Mengerjakan Kuis</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Setelah membaca materi, klik tombol <span className="font-bold text-primary">Mulai Kuis</span>. Materi dianggap <span className="italic">"Selesai"</span> (100%) hanya jika kamu telah menuntaskan kuisnya.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">3</div>
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Mengumpulkan Tugas</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Buka menu <span className="font-bold text-primary">Tugas</span>. Pilih tugas yang aktif. Kamu bisa mengetik langsung jawabanmu, lalu klik <span className="font-bold text-primary">Kumpulkan Tugas</span>. Jangan lupa simpan draf jika belum selesai!
                  </p>
                </div>
              </div>
              
              <div className="bg-tertiary-container/30 rounded-xl p-4 mt-4 border border-tertiary/20">
                <p className="text-xs text-on-surface-variant font-medium flex items-start gap-2">
                  <Icon name="lightbulb" className="text-tertiary text-[16px] mt-0.5" />
                  <span><strong>Tips:</strong> Jika kamu kesulitan, gunakan fitur <span className="font-bold">Tanya Guru (Chat WA)</span> di halaman profil ini untuk bertanya langsung kepada gurumu.</span>
                </p>
              </div>
            </div>
            
            <div className="p-5 border-t border-surface-variant/20 bg-surface-container-low shrink-0">
              <button 
                onClick={() => setShowGuideModal(false)}
                className="w-full h-12 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail & Keamanan Akun */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-surface-variant/20 flex items-center justify-between">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                <Icon name="lock_reset" className="text-primary" />
                Ganti Kata Sandi
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-on-surface">Kata Sandi Baru</label>
                <input 
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ newPassword: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Masukkan minimal 6 karakter"
                />
              </div>
              <div className="bg-secondary-container/50 rounded-xl p-3 border border-secondary/20">
                <p className="text-[11px] text-on-surface-variant flex items-start gap-1.5">
                  <Icon name="info" className="text-[14px] text-secondary mt-0.5" />
                  Pastikan kamu mengingat kata sandi baru. Jika lupa, kamu harus meminta guru untuk meresetnya.
                </p>
              </div>
              </div>
            <div className="p-5 border-t border-surface-variant/20 bg-surface-container-low flex justify-end gap-3">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="px-5 py-2.5 rounded-full font-bold text-primary hover:bg-primary/10 transition-colors"
                disabled={isSaving}
              >
                Batal
              </button>
              <button 
                onClick={handleSavePassword}
                disabled={isSaving || passwordForm.newPassword.length < 6}
                className="px-5 py-2.5 rounded-full font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSaving && <Icon name="sync" className="animate-spin text-[18px]" />}
                Simpan Sandi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
