import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getCurrentUser } from '@lms/shared';

import Icon from '../../components/Icon';
import { DirectoryListSkeleton } from '../../components/ui/PageSkeleton';
export default function TeacherStudentManagerPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isScopedTeacher = Boolean(currentUser?.class_name);

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeClass, setActiveClass] = useState(currentUser?.class_name || 'VII A');

  const classes = isScopedTeacher && currentUser?.class_name
    ? [currentUser.class_name]
    : ['Semua Kelas', 'VII A', 'VII B', 'VII C', 'VII D'];

  const [searchQuery, setSearchQuery] = useState('');
  const [classSetting, setClassSetting] = useState({ homeroom_teacher: '', informatics_teacher: '' });
  const [isEditingClass, setIsEditingClass] = useState(false);
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.identifier_no.includes(searchQuery)
  );

  // Student Form State
  const [showModal, setShowModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    identifier_no: '',
    attendance_number: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchClassSetting();
  }, [activeClass]);

  const fetchClassSetting = async () => {
    try {
      const res = await api.get(`/api/teacher/class-settings/${activeClass}`);
      setClassSetting(res.data);
    } catch (error) {
      console.error('Failed to fetch class setting', error);
    }
  };

  const handleSaveClassSetting = async () => {
    try {
      await api.post(`/api/teacher/class-settings/${activeClass}`, classSetting);
      setIsEditingClass(false);
      Swal.fire('Sukses', 'Pengaturan kelas berhasil disimpan!', 'success');
    } catch (error) {
      Swal.fire('Gagal', 'Gagal menyimpan pengaturan kelas', 'error');
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/teacher/students?class=${encodeURIComponent(activeClass)}`);
      setStudents(res.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudentId(null);
    setStudentForm({ name: '', identifier_no: '', attendance_number: '' });
    setShowModal(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudentId(student.id);
    setStudentForm({
      name: student.name,
      identifier_no: student.identifier_no,
      attendance_number: student.attendance_number || ''
    });
    setShowModal(true);
  };

  const saveStudent = async () => {
    try {
      const payload = {
        ...studentForm,
        class_name: isScopedTeacher ? (currentUser?.class_name || activeClass) : (activeClass === 'Semua Kelas' ? 'VII A' : activeClass),
      };
      
      if (editingStudentId) {
        await api.put(`/api/teacher/students/${editingStudentId}`, payload);
        Swal.fire('Sukses', 'Data siswa berhasil diubah', 'success');
      } else {
        await api.post('/api/teacher/students', payload);
        Swal.fire('Sukses', 'Siswa baru berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      fetchStudents();
    } catch (e: any) {
      Swal.fire('Gagal', 'Gagal menyimpan data siswa. Pastikan NISN belum digunakan.', 'error');
    }
  };

  const deleteStudent = async (id: number, name: string) => {
    Swal.fire({
      title: 'Hapus Akun?',
      text: `Yakin ingin MENGHAPUS akun ${name}? Data tidak dapat dikembalikan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/api/teacher/students/${id}`);
          fetchStudents();
          Swal.fire('Terhapus!', 'Siswa berhasil dihapus.', 'success');
        } catch (e) {
          Swal.fire('Gagal', 'Gagal menghapus siswa', 'error');
        }
      }
    });
  };

  const resetPassword = async (id: number, name: string) => {
    Swal.fire({
      title: 'Reset Password?',
      text: `Yakin ingin mereset password akun ${name} menjadi "spengu123"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Reset!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`/api/teacher/students/${id}/reset-password`);
          Swal.fire('Sukses', `Berhasil! Password ${name} diubah kembali ke default (spengu123)`, 'success');
        } catch (e) {
          Swal.fire('Gagal', 'Gagal mereset password', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip font-body-md text-on-surface flex flex-col pb-safe">
      <header className="w-full bg-surface/90 backdrop-blur-xl shadow-xs border-b border-surface-variant/20">
        <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
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
                Manajemen Akun
              </span>
              <h1 className="font-headline-sm text-base sm:text-xl text-on-surface font-bold leading-tight truncate mt-0.5">
                Direktori Siswa
              </h1>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-primary text-on-primary px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-primary/90 active:scale-95 transition-all shrink-0 whitespace-nowrap"
          >
            <Icon name="person_add" className="text-[16px]" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full min-w-0 max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-5 overflow-x-clip">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full max-w-full">
          {classes.map(cls => (
            <button
              key={cls}
              onClick={() => setActiveClass(cls)}
              className={`px-4 py-2 rounded-full font-label-md text-xs sm:text-sm whitespace-nowrap transition-all shadow-xs shrink-0 ${
                activeClass === cls 
                  ? 'bg-primary text-on-primary font-bold' 
                  : 'bg-surface-container-lowest border border-surface-variant/30 text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cls === 'Semua Kelas' ? cls : `Kelas ${cls}`}
            </button>
          ))}
        </div>

        {/* Class Info & Teacher Settings */}
        {activeClass !== 'Semua Kelas' && (
          <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-variant/20 p-4 sm:p-5 flex flex-col gap-4 w-full overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold text-sm sm:text-base text-on-surface flex items-center gap-2 min-w-0">
                <Icon name="admin_panel_settings" className="text-primary text-[20px] shrink-0" />
                <span className="truncate">Pengaturan Kelas {activeClass}</span>
              </h2>
              <button 
                onClick={() => isEditingClass ? handleSaveClassSetting() : setIsEditingClass(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 ${
                  isEditingClass ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-primary hover:bg-surface-variant'
                }`}
              >
                {isEditingClass ? 'Simpan' : 'Edit Guru'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">Wali Kelas</label>
                {isEditingClass ? (
                  <input 
                    type="text" 
                    value={classSetting.homeroom_teacher}
                    onChange={(e) => setClassSetting({...classSetting, homeroom_teacher: e.target.value})}
                    className="px-3 py-2 bg-surface rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    placeholder="Nama Wali Kelas"
                  />
                ) : (
                  <div className="px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-variant/40 text-sm font-medium">
                    {classSetting.homeroom_teacher || '-'}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant">Guru Informatika</label>
                {isEditingClass ? (
                  <input 
                    type="text" 
                    value={classSetting.informatics_teacher}
                    onChange={(e) => setClassSetting({...classSetting, informatics_teacher: e.target.value})}
                    className="px-3 py-2 bg-surface rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    placeholder="Nama Guru Informatika"
                  />
                ) : (
                  <div className="px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-variant/40 text-sm font-medium">
                    {classSetting.informatics_teacher || '-'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Student List Content */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-surface-variant/20 overflow-hidden flex flex-col w-full">
          <div className="p-4 bg-surface-container-low border-b border-surface-variant/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-on-surface min-w-0">
              <Icon name="groups" className="text-primary text-[20px] shrink-0" />
              <h2 className="font-bold text-xs sm:text-sm truncate">Daftar Siswa ({activeClass})</h2>
            </div>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg shrink-0">
              {students.length} Siswa
            </span>
          </div>
          
          <div className="p-3 bg-surface-container-lowest border-b border-surface-variant/30">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-on-surface-variant">
                <Icon name="search" className="text-[18px]" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" 
                placeholder="Cari nama atau NISN..." 
              />
            </div>
          </div>
          
          <div className="flex flex-col divide-y divide-surface-container">
            {isLoading ? (
              <div className="p-4">
                <DirectoryListSkeleton count={4} />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 flex flex-col justify-center items-center gap-2 text-outline">
                <Icon name="person_off" className="text-[48px]" />
                <p className="text-sm font-medium">Siswa tidak ditemukan.</p>
              </div>
            ) : (
              filteredStudents.map((student, index) => {
                const hasLoggedInToday = student.last_login_at && new Date(student.last_login_at).toDateString() === new Date().toDateString();
                return (
                  <div key={student.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-2.5 hover:bg-surface-container-lowest/50 transition-colors w-full overflow-hidden">
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <span className="w-8 h-8 rounded-full bg-primary-fixed/30 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-bold text-on-surface break-words">{student.name}</p>
                          {hasLoggedInToday ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-secondary-container text-on-secondary-container text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Online Hari Ini
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap">
                              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                              Offline
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-outline font-medium break-words">
                          NISN: {student.identifier_no} • Absen: {student.attendance_number || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => resetPassword(student.id, student.name)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary flex items-center justify-center transition-colors" 
                        title="Reset Password"
                      >
                        <Icon name="key" className="text-[17px]" />
                      </button>
                      <button 
                        onClick={() => openEditModal(student)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors" 
                        title="Edit Data"
                      >
                        <Icon name="edit" className="text-[17px]" />
                      </button>
                      <button 
                        onClick={() => deleteStudent(student.id, student.name)}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-error-container hover:bg-error/20 text-error flex items-center justify-center transition-colors" 
                        title="Hapus Siswa"
                      >
                        <Icon name="delete" className="text-[17px]" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Modal CRUD Siswa */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-surface-variant/20 flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg text-on-surface">
                {editingStudentId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-on-surface">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-on-surface">NISN / Nomor Induk</label>
                <input 
                  type="text" 
                  value={studentForm.identifier_no}
                  onChange={(e) => setStudentForm({...studentForm, identifier_no: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                  placeholder="Masukkan NISN unik"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-on-surface">Nomor Absen</label>
                <input 
                  type="number" 
                  value={studentForm.attendance_number}
                  onChange={(e) => setStudentForm({...studentForm, attendance_number: e.target.value})}
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
                  placeholder="Nomor urut (opsional)"
                />
              </div>
            </div>

            <div className="p-4 bg-surface-container-low border-t border-surface-variant/20 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-on-surface-variant font-bold hover:bg-surface-container transition-colors text-sm"
              >
                Batal
              </button>
              <button 
                onClick={saveStudent}
                disabled={!studentForm.name || !studentForm.identifier_no}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
