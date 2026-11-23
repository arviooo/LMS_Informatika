import { useState, useEffect } from 'react';
import { api, type User, saveSession } from '@lms/shared';
import { useAuth } from '../App';

import Icon from '../components/Icon';
export default function ForceOnboardingModal() {
  const { user, setUser } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [classId, setClassId] = useState('');
  const [attendanceNumber, setAttendanceNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if onboarding is needed
  const needsOnboarding = user && user.role === 'siswa' && (!user.name || !user.class_id || !user.attendance_number);

  useEffect(() => {
    if (needsOnboarding) {
      api.get('/api/student/classes')
        .then(res => setClasses(res.data))
        .catch(err => {
          console.error('Failed to fetch classes:', err);
          setError('Gagal memuat daftar kelas. Silakan muat ulang halaman.');
        });
    }
  }, [needsOnboarding]);

  if (!needsOnboarding) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/api/student/profile', {
        name,
        class_id: classId,
        attendance_number: attendanceNumber,
      });

      // Update user state and session
      const updatedUser: User = { ...user, ...res.data.user };
      setUser(updatedUser);
      saveSession(updatedUser);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="mb-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 mb-4 bg-surface-container-lowest rounded-xl flex items-center justify-center p-1 shadow-sm border border-surface-variant/20">
              <img src="/logo-spengu.png" alt="Logo SMP Negeri 3 Gubug" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold text-on-surface">Lengkapi Profil Anda</h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Selamat datang! Sebelum mulai belajar, silakan lengkapi data diri Anda terlebih dahulu.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error/10 text-error text-sm rounded-xl flex items-start gap-2">
              <Icon name="error" className="text-[18px]" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-on-surface ml-1">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 transition-shadow"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="classId" className="text-sm font-semibold text-on-surface ml-1">
                Kelas
              </label>
              <div className="relative">
                <select
                  id="classId"
                  required
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary text-on-surface appearance-none transition-shadow"
                >
                  <option value="" disabled>Pilih Kelas</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <Icon name="arrow_drop_down" className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="attendanceNumber" className="text-sm font-semibold text-on-surface ml-1">
                Nomor Absen
              </label>
              <input
                id="attendanceNumber"
                type="number"
                min="1"
                required
                value={attendanceNumber}
                onChange={(e) => setAttendanceNumber(e.target.value)}
                placeholder="Contoh: 12"
                className="w-full px-4 py-3 bg-surface-container rounded-xl border-none focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/50 transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !name || !classId || !attendanceNumber}
              className="w-full mt-6 py-3.5 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {isLoading ? (
                <Icon name="progress_activity" className="animate-spin" />
              ) : (
                <>
                  <span>Simpan & Lanjutkan</span>
                  <Icon name="arrow_forward" className="text-[18px]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
