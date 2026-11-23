import { useState, useEffect, useMemo } from 'react';
import { api, backendUrl, getCurrentUser } from '@lms/shared';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import Icon from '../../components/Icon';
import { isRunningInInstalledApp } from '../../components/ui/AppDownloadModal';
import { DirectoryListSkeleton } from '../../components/ui/PageSkeleton';

interface GradeItem {
  title: string;
  score: number | null;
}

interface StudentGrade {
  id: number;
  name: string;
  class_name: string;
  attendance_number: number | null;
  identifier_no: string;
  avg_quiz: number;
  avg_assignment: number;
  final_grade: number;
  quizzes?: GradeItem[];
  assignments?: GradeItem[];
}

type StatusFilter = 'all' | 'tuntas' | 'remedial';
type SortOption = 'absen' | 'name_asc' | 'highest' | 'lowest';

const KKM = 75;
const nameCollator = new Intl.Collator('id', { numeric: true, sensitivity: 'base' });

function getPredikat(score: number): {
  label: string;
  shortLabel: string;
  letter: string;
  badgeClass: string;
  scoreClass: string;
  absenClass: string;
} {
  if (score >= 85) {
    return {
      label: 'Sangat Baik (A)',
      shortLabel: 'Tuntas • A',
      letter: 'A',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      scoreClass: 'text-emerald-600',
      absenClass: 'bg-emerald-100 text-emerald-800',
    };
  }
  if (score >= KKM) {
    return {
      label: 'Baik (B - Tuntas)',
      shortLabel: 'Tuntas • B',
      letter: 'B',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      scoreClass: 'text-blue-600',
      absenClass: 'bg-blue-100 text-blue-800',
    };
  }
  if (score >= 60) {
    return {
      label: 'Cukup (C - Bimbingan)',
      shortLabel: 'Remedial • C',
      letter: 'C',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      scoreClass: 'text-amber-600',
      absenClass: 'bg-amber-100 text-amber-800',
    };
  }
  return {
    label: 'Kurang (D - Remedial)',
    shortLabel: 'Remedial • D',
    letter: 'D',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
    scoreClass: 'text-rose-600',
    absenClass: 'bg-rose-100 text-rose-700',
  };
}

export default function TeacherGradebookPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isScopedTeacher = Boolean(currentUser?.class_name);
  const classes = isScopedTeacher
    ? [currentUser.class_name]
    : ['Semua Kelas', 'VII A', 'VII B', 'VII C', 'VII D'];

  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClass, setActiveClass] = useState(currentUser?.class_name || 'VII A');
  const [classSetting, setClassSetting] = useState({ homeroom_teacher: '', informatics_teacher: '' });

  // Filter, Search & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('absen');
  const [openIds, setOpenIds] = useState<Record<number, boolean>>({});
  const [liveStatus, setLiveStatus] = useState('');

  useEffect(() => {
    fetchGrades();
    if (activeClass !== 'Semua Kelas') {
      fetchClassSetting();
    } else {
      setClassSetting({ homeroom_teacher: '', informatics_teacher: '' });
    }
    setOpenIds({});
  }, [activeClass]);

  const fetchClassSetting = async () => {
    try {
      const res = await api.get(`/api/teacher/class-settings/${encodeURIComponent(activeClass)}`);
      setClassSetting(res.data || { homeroom_teacher: '', informatics_teacher: '' });
    } catch (error) {
      console.error('Failed to fetch class setting', error);
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/teacher/students/grades?class=${encodeURIComponent(activeClass)}`);
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Ringkasan Statistik Kelas
  const stats = useMemo(() => {
    const total = students.length;
    if (total === 0) {
      return { total: 0, avgFinal: 0, tuntasCount: 0, remedialCount: 0, tuntasPct: 0, highest: 0 };
    }
    let sumFinal = 0;
    let tuntasCount = 0;
    let highest = 0;
    for (const s of students) {
      const grade = Number(s.final_grade) || 0;
      sumFinal += grade;
      if (grade >= KKM) tuntasCount++;
      if (grade > highest) highest = grade;
    }
    return {
      total,
      avgFinal: Math.round((sumFinal / total) * 10) / 10,
      tuntasCount,
      remedialCount: total - tuntasCount,
      tuntasPct: Math.round((tuntasCount / total) * 100),
      highest,
    };
  }, [students]);

  // Filter + Search + Sort Siswa
  const visibleStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = students.filter((s) => {
      const grade = Number(s.final_grade) || 0;
      if (statusFilter === 'tuntas' && grade < KKM) return false;
      if (statusFilter === 'remedial' && grade >= KKM) return false;

      if (!q) return true;
      const nameMatch = (s.name || '').toLowerCase().includes(q);
      const nisnMatch = (s.identifier_no || '').toLowerCase().includes(q);
      const absenMatch = s.attendance_number !== null && String(s.attendance_number).includes(q);
      const classMatch = (s.class_name || '').toLowerCase().includes(q);
      return nameMatch || nisnMatch || absenMatch || classMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'highest') {
        return (Number(b.final_grade) || 0) - (Number(a.final_grade) || 0) || nameCollator.compare(a.name || '', b.name || '');
      }
      if (sortBy === 'lowest') {
        return (Number(a.final_grade) || 0) - (Number(b.final_grade) || 0) || nameCollator.compare(a.name || '', b.name || '');
      }
      if (sortBy === 'name_asc') {
        return nameCollator.compare(a.name || '', b.name || '');
      }
      // Default: urut berdasarkan kelas (jika Semua Kelas) lalu No. Absen
      if (activeClass === 'Semua Kelas' && a.class_name !== b.class_name) {
        return nameCollator.compare(a.class_name || '', b.class_name || '');
      }
      const absenA = a.attendance_number ?? 9999;
      const absenB = b.attendance_number ?? 9999;
      if (absenA !== absenB) return absenA - absenB;
      return nameCollator.compare(a.name || '', b.name || '');
    });
  }, [students, searchQuery, statusFilter, sortBy, activeClass]);

  const allExpanded =
    visibleStudents.length > 0 && visibleStudents.every((s) => Boolean(openIds[s.id]));

  const handleToggleAll = () => {
    if (allExpanded) {
      setOpenIds({});
      setLiveStatus('Semua rincian nilai siswa ditutup.');
    } else {
      const next: Record<number, boolean> = {};
      visibleStudents.forEach((s) => {
        next[s.id] = true;
      });
      setOpenIds(next);
      setLiveStatus(`Menampilkan rincian nilai untuk ${visibleStudents.length} siswa.`);
    }
  };

  const handleSortChange = (nextSort: SortOption) => {
    setSortBy(nextSort);
    const labelMap: Record<SortOption, string> = {
      absen: 'No. Absen',
      name_asc: 'Nama A sampai Z',
      highest: 'Nilai Tertinggi',
      lowest: 'Nilai Terendah',
    };
    setLiveStatus(`Diurutkan berdasarkan ${labelMap[nextSort]}, ${visibleStudents.length} siswa.`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('absen');
  };

  const formatCsvCell = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const cleanStr = String(val).replace(/[\r\n]+/g, ' ').trim();
    return `"${cleanStr.replace(/"/g, '""')}"`;
  };

  const exportGradebookToCSV = async () => {
    const dataToExport = visibleStudents.length > 0 ? visibleStudents : students;

    if (dataToExport.length === 0) {
      await Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Data',
        text: `Belum ada data nilai siswa di kelas ${activeClass} untuk diunduh.`,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Tutup',
      });
      return;
    }

    const isFiltered = statusFilter !== 'all' || searchQuery.trim() !== '';
    const filterInfo = isFiltered
      ? `<div><strong>Filter Aktif:</strong> ${statusFilter === 'tuntas' ? 'Tuntas (≥75)' : statusFilter === 'remedial' ? 'Remedial (<75)' : 'Pencarian'} (${dataToExport.length} dari ${students.length} siswa)</div>`
      : '';

    const confirm = await Swal.fire({
      title: 'Unduh Rekap Nilai Excel/CSV?',
      html: `
        <div style="text-align: left; font-size: 13px; line-height: 1.6;">
          <p style="margin-bottom: 10px;">File dapat langsung dibuka di <strong>Microsoft Excel</strong> atau <strong>Google Sheets</strong>.</p>
          <div style="background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div><strong>Kelas:</strong> ${activeClass}</div>
            <div><strong>Jumlah Siswa:</strong> ${dataToExport.length} siswa</div>
            ${filterInfo}
            <div><strong>Rumus Nilai:</strong> 50% Rata-rata Kuis + 50% Rata-rata Tugas (KKM ${KKM})</div>
            ${classSetting.homeroom_teacher ? `<div><strong>Wali Kelas:</strong> ${classSetting.homeroom_teacher}</div>` : ''}
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Unduh Sekarang',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    const headers = [
      'No',
      'No. Absen',
      'Nama Siswa',
      'Kelas',
      'NISN',
      'Rata-rata Kuis',
      'Rata-rata Tugas',
      'Nilai Akhir',
      'Status KKM',
      'Predikat',
    ];

    const rows = dataToExport.map((s, idx) => {
      const finalGrade = Number(s.final_grade) || 0;
      const predikat = getPredikat(finalGrade);

      return [
        idx + 1,
        s.attendance_number ?? '-',
        s.name || 'Anonim',
        s.class_name || activeClass,
        s.identifier_no || '-',
        s.avg_quiz ?? 0,
        s.avg_assignment ?? 0,
        finalGrade,
        finalGrade >= KKM ? 'Tuntas' : 'Remedial',
        predikat.label,
      ];
    });

    const BOM = '\uFEFF';
    const csvContent =
      BOM +
      [
        headers.map(formatCsvCell).join(','),
        ...rows.map((row) => row.map(formatCsvCell).join(',')),
      ].join('\r\n');

    const safeClass = activeClass.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeDate = new Date().toISOString().split('T')[0];
    const filename = `Rekap_Nilai_${safeClass}_${safeDate}.csv`;

    const triggerBlobDownload = () => {
      // Gunakan MIME 'text/csv' murni & tunda revokeObjectURL 60 detik
      // agar Android WebView / Median BlobDownloader.js sempat membaca isi Blob secara asinkron.
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    };

    // Di dalam Aplikasi Android (.APK / Median WebView):
    // Gunakan tautan HTTPS bertanda tangan dari server + Median native downloadFile
    // agar notifikasi unduhan Android muncul dan file tersimpan/terbuka di HP.
    if (isRunningInInstalledApp()) {
      try {
        const res = await api.post('/api/teacher/students/grades/export-link', {
          class: activeClass,
          status: statusFilter,
          search: searchQuery,
          sort: sortBy,
        });

        const downloadPath: string | undefined = res.data?.download_path;
        const serverFilename: string = res.data?.filename || filename;

        if (downloadPath) {
          const fullDownloadUrl = `${backendUrl}${downloadPath}`;
          const medianBridge = (window as any).median || (window as any).gonative;

          if (medianBridge?.share?.downloadFile) {
            medianBridge.share.downloadFile({
              url: fullDownloadUrl,
              filename: serverFilename,
              open: true,
            });
          } else {
            const link = document.createElement('a');
            link.href = fullDownloadUrl;
            link.setAttribute('download', serverFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          await Swal.fire({
            icon: 'success',
            title: 'Unduhan Dimulai!',
            html: `
              <div style="text-align: left; font-size: 13px; line-height: 1.6;">
                <p style="margin-bottom: 8px;">File <strong>${serverFilename}</strong> sedang diunduh ke HP Anda.</p>
                <p style="color: #64748b; font-size: 12px; margin-bottom: 10px;">
                  Jika jendela simpan/buka file tidak muncul otomatis, ketuk tombol di bawah untuk mengunduh langsung.
                </p>
                <a href="${fullDownloadUrl}" download="${serverFilename}" style="display: inline-block; width: 100%; text-align: center; padding: 10px 14px; background: #059669; color: #ffffff; border-radius: 10px; font-weight: 700; text-decoration: none;">
                  Unduh Manual (${serverFilename})
                </a>
              </div>
            `,
            confirmButtonText: 'Tutup',
            confirmButtonColor: '#2563eb',
          });
          return;
        }
      } catch (err) {
        console.warn('Server CSV export link failed, falling back to delayed blob download:', err);
      }
    }

    // Fallback (dan mode Web Browser): unduh langsung via Blob dengan jeda revoke 60 detik
    triggerBlobDownload();

    Swal.fire({
      icon: 'success',
      title: 'Berhasil Diunduh!',
      text: `Rekap nilai ${activeClass} (${dataToExport.length} siswa) tersimpan sebagai file Excel/CSV.`,
      timer: 2200,
      showConfirmButton: false,
    });
  };

  const hasActiveFilter = statusFilter !== 'all' || searchQuery.trim() !== '';

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-clip bg-[#F8F9FB]">
      {/* ─── Compact Single-Row Sticky Header (1 Tombol Unduh Jelas, Tanpa Duplikat) ─── */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-2 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => navigate('/guru/akun')}
              aria-label="Kembali ke halaman Akun Guru"
              className="w-9 h-9 -ml-1 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors shrink-0"
            >
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg text-slate-900 font-extrabold truncate leading-tight">
                Rekap Nilai Siswa
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                {activeClass} • {students.length} Siswa • KKM {KKM}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={exportGradebookToCSV}
            className="h-9 px-3.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
          >
            <Icon name="download" className="text-[16px]" />
            <span>Unduh Excel</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full min-w-0 max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-24 flex flex-col gap-4">
        {/* ─── 1. Bar Pilihan Kelas + Info Wali Kelas Ringkas ─── */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 min-w-0">
              {isScopedTeacher ? (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-xl text-blue-800 font-bold text-xs">
                  <Icon name="school" className="text-[15px] text-blue-600" />
                  Kelas Binaan: {currentUser?.class_name}
                </span>
              ) : (
                classes.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setActiveClass(cls)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all shrink-0 ${
                      activeClass === cls
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 font-semibold'
                    }`}
                  >
                    {cls}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Info Wali Kelas & Guru Informatika (1 baris ringkas saja) */}
          {activeClass !== 'Semua Kelas' && (classSetting.homeroom_teacher || classSetting.informatics_teacher) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              {classSetting.homeroom_teacher && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="person" className="text-[14px] text-blue-600" />
                  Wali Kelas: <strong className="text-slate-800">{classSetting.homeroom_teacher}</strong>
                </span>
              )}
              {classSetting.informatics_teacher && (
                <span className="inline-flex items-center gap-1">
                  <Icon name="school" className="text-[14px] text-emerald-600" />
                  Guru Mapel: <strong className="text-slate-800">{classSetting.informatics_teacher}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ─── 2. Ringkasan 3 Kartu Cepat (Klik untuk Filter Langsung!) ─── */}
        {!loading && students.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Rata-rata Kelas */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white hover:bg-blue-50/60 text-slate-900 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${statusFilter === 'all' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Rata-Rata
                </span>
                <Icon name="trending_up" className={`text-[16px] ${statusFilter === 'all' ? 'text-blue-200' : 'text-blue-600'}`} />
              </div>
              <div className="text-xl sm:text-2xl font-black leading-none">{stats.avgFinal}</div>
              <p className={`text-[10px] font-semibold mt-1 truncate ${statusFilter === 'all' ? 'text-blue-100' : 'text-slate-500'}`}>
                Tertinggi: {stats.highest}
              </p>
            </button>

            {/* Tuntas */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'tuntas' ? 'all' : 'tuntas')}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all ${
                statusFilter === 'tuntas'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white hover:bg-emerald-50/60 text-slate-900 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${statusFilter === 'tuntas' ? 'text-emerald-100' : 'text-emerald-700'}`}>
                  Tuntas
                </span>
                <Icon name="check_circle" className={`text-[16px] ${statusFilter === 'tuntas' ? 'text-emerald-200' : 'text-emerald-600'}`} />
              </div>
              <div className="text-xl sm:text-2xl font-black leading-none">{stats.tuntasCount}</div>
              <p className={`text-[10px] font-semibold mt-1 truncate ${statusFilter === 'tuntas' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Nilai ≥ {KKM} ({stats.tuntasPct}%)
              </p>
            </button>

            {/* Remedial */}
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'remedial' ? 'all' : 'remedial')}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all ${
                statusFilter === 'remedial'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white hover:bg-rose-50/60 text-slate-900 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wide ${statusFilter === 'remedial' ? 'text-rose-100' : 'text-rose-600'}`}>
                  Remedial
                </span>
                <Icon name="warning" className={`text-[16px] ${statusFilter === 'remedial' ? 'text-rose-200' : 'text-rose-500'}`} />
              </div>
              <div className="text-xl sm:text-2xl font-black leading-none">{stats.remedialCount}</div>
              <p className={`text-[10px] font-semibold mt-1 truncate ${statusFilter === 'remedial' ? 'text-rose-100' : 'text-slate-500'}`}>
                Nilai &lt; {KKM}
              </p>
            </button>
          </div>
        )}

        {/* ─── 3. Panel Cari Siswa, Filter Status & Urutkan ─── */}
        <section
          aria-labelledby="daftar-nilai-heading"
          className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
            {/* Baris Judul + Tombol Buka/Tutup Semua */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 id="daftar-nilai-heading" className="text-sm sm:text-base font-extrabold text-slate-900">
                  Daftar Nilai Siswa
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {visibleStudents.length} / {students.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Icon name="close" className="text-[14px]" />
                    <span>Reset</span>
                  </button>
                )}
                {visibleStudents.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    aria-expanded={allExpanded}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Icon
                      name={allExpanded ? 'expand_less' : 'expand_more'}
                      className="text-[16px]"
                    />
                    <span>{allExpanded ? 'Tutup Semua' : 'Buka Semua'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Kotak Pencarian Cepat */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" className="text-[18px]" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari nama siswa, nomor absen, atau NISN"
                placeholder="Ketik nama siswa, no. absen, atau NISN untuk mencari cepat..."
                className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute inset-y-0 right-2.5 flex items-center justify-center w-7 h-7 my-auto rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                >
                  <Icon name="close" className="text-[16px]" />
                </button>
              )}
            </div>

            {/* Baris Kontrol Sederhana: Filter Status & Urutkan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Filter Status */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(
                  [
                    { id: 'all', label: `Semua (${stats.total})` },
                    { id: 'tuntas', label: `Tuntas (${stats.tuntasCount})` },
                    { id: 'remedial', label: `Remedial (${stats.remedialCount})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shrink-0 ${
                      statusFilter === tab.id
                        ? tab.id === 'remedial'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : tab.id === 'tuntas'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Urutkan Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="sort-gradebook" className="text-xs font-bold text-slate-500 flex items-center gap-1 whitespace-nowrap">
                  <Icon name="sort" className="text-[15px]" />
                  <span>Urutkan:</span>
                </label>
                <select
                  id="sort-gradebook"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="flex-1 sm:flex-none h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="absen">No. Absen (Urut)</option>
                  <option value="name_asc">Nama Siswa (A–Z)</option>
                  <option value="highest">Nilai Tertinggi</option>
                  <option value="lowest">Nilai Terendah</option>
                </select>
              </div>
            </div>

            {/* Petunjuk Singkat Rumus & Klik Baris */}
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <span className="flex items-center gap-1.5">
                <Icon name="info" className="text-[14px] text-blue-600 shrink-0" />
                <span>Ketuk nama siswa untuk melihat rincian nilai per kuis &amp; tugas.</span>
              </span>
              <span className="hidden sm:inline font-semibold text-slate-600 shrink-0">
                Nilai Akhir = 50% Kuis + 50% Tugas
              </span>
            </div>
          </div>

          {/* Live Status Announcement (Visually Hidden for Screen Readers) */}
          <div
            role="status"
            aria-live="polite"
            className="sr-only"
          >
            {liveStatus}
          </div>

          {/* ─── 4. Daftar Baris Siswa Kompak (Native <details> Accordion) ─── */}
          {loading ? (
            <div className="p-4">
              <DirectoryListSkeleton count={5} />
            </div>
          ) : visibleStudents.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
              <Icon name="group_off" className="text-[44px] text-slate-300" />
              <p className="text-sm font-bold text-slate-700">
                {students.length === 0
                  ? `Belum ada data siswa di kelas ${activeClass}.`
                  : 'Siswa tidak ditemukan.'}
              </p>
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-1 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                >
                  Tampilkan Semua Siswa
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleStudents.map((student, idx) => {
                const finalGrade = Number(student.final_grade) || 0;
                const predikat = getPredikat(finalGrade);
                const isOpen = Boolean(openIds[student.id]);
                const quizzes = student.quizzes || [];
                const assignments = student.assignments || [];
                const displayAbsen =
                  student.attendance_number !== null && student.attendance_number !== undefined
                    ? String(student.attendance_number).padStart(2, '0')
                    : String(idx + 1).padStart(2, '0');

                return (
                  <details
                    key={student.id}
                    open={isOpen}
                    onToggle={(e) => {
                      const nextOpen = (e.currentTarget as HTMLDetailsElement).open;
                      setOpenIds((prev) =>
                        prev[student.id] === nextOpen ? prev : { ...prev, [student.id]: nextOpen }
                      );
                    }}
                    className="gradebook-accordion group open:bg-slate-50/70 transition-colors"
                  >
                    {/* Baris Ringkas: Tanpa tag heading di dalam <summary> untuk aksesibilitas */}
                    <summary className="w-full px-4 py-3 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/80 focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:-outline-offset-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Nomor Absen */}
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${predikat.absenClass}`}
                          title={`No. Absen ${displayAbsen}`}
                        >
                          {displayAbsen}
                        </span>

                        {/* Nama + Ringkasan 1 Baris */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {student.name}
                            </span>
                            {activeClass === 'Semua Kelas' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                                {student.class_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                            <span>Kuis: <strong className="text-slate-700">{student.avg_quiz}</strong></span>
                            <span aria-hidden="true">•</span>
                            <span>Tugas: <strong className="text-slate-700">{student.avg_assignment}</strong></span>
                            {student.identifier_no && (
                              <>
                                <span aria-hidden="true" className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
                                  NISN {student.identifier_no}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Kanan: Nilai Akhir + Predikat + Panah Detail */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className={`text-lg font-black block leading-none ${predikat.scoreClass}`}>
                            {finalGrade}
                          </span>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full border text-[10px] font-bold leading-none ${predikat.badgeClass}`}
                          >
                            {predikat.shortLabel}
                          </span>
                        </div>
                        <span
                          aria-hidden="true"
                          className="accordion-chevron w-7 h-7 rounded-full bg-slate-100 group-open:bg-blue-100 text-slate-500 group-open:text-blue-700 flex items-center justify-center shrink-0"
                        >
                          <Icon name="expand_more" className="text-[18px]" />
                        </span>
                      </div>
                    </summary>

                    {/* Rincian Nilai Lengkap (Muncul Saat Baris Diketuk) */}
                    <div className="px-4 pb-4 pt-3 border-t border-slate-200/70 bg-slate-50/90 flex flex-col gap-3">
                      {/* Info Identitas + 3 Kotak Ringkas */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span>
                          Kelas <strong className="text-slate-700">{student.class_name}</strong> • No. Absen{' '}
                          <strong className="text-slate-700">{student.attendance_number ?? '-'}</strong> • NISN{' '}
                          <strong className="font-mono text-slate-700">{student.identifier_no || '-'}</strong>
                        </span>
                        <span className="font-bold text-slate-700">{predikat.label}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 text-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Rata-rata Kuis
                          </span>
                          <span className="text-base font-black text-slate-900 mt-0.5 block">
                            {student.avg_quiz}
                          </span>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 text-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Rata-rata Tugas
                          </span>
                          <span className="text-base font-black text-slate-900 mt-0.5 block">
                            {student.avg_assignment}
                          </span>
                        </div>
                        <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 text-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Nilai Akhir
                          </span>
                          <span className={`text-base font-black mt-0.5 block ${predikat.scoreClass}`}>
                            {finalGrade}
                          </span>
                        </div>
                      </div>

                      {/* Rincian Nilai per Kuis & per Tugas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Daftar Kuis */}
                        <div className="bg-white rounded-2xl p-3 border border-slate-200/70">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                              <Icon name="quiz" className="text-[15px] text-blue-600" />
                              Rincian Kuis
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {quizzes.length} dikerjakan
                            </span>
                          </div>
                          {quizzes.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-1">
                              Belum ada kuis yang dikerjakan.
                            </p>
                          ) : (
                            <ul className="divide-y divide-slate-100">
                              {quizzes.map((q, qIdx) => {
                                const qScore = Number(q.score ?? 0);
                                return (
                                  <li
                                    key={`${student.id}-q-${qIdx}`}
                                    className="py-1.5 flex items-center justify-between gap-2 text-xs"
                                  >
                                    <span className="text-slate-700 font-medium truncate">{q.title}</span>
                                    <span
                                      className={`font-black shrink-0 ${
                                        qScore >= KKM ? 'text-emerald-600' : 'text-rose-600'
                                      }`}
                                    >
                                      {q.score ?? '-'}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        {/* Daftar Tugas */}
                        <div className="bg-white rounded-2xl p-3 border border-slate-200/70">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                              <Icon name="assignment" className="text-[15px] text-amber-600" />
                              Rincian Tugas
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {assignments.length} dikumpulkan
                            </span>
                          </div>
                          {assignments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-1">
                              Belum ada tugas yang dikumpulkan.
                            </p>
                          ) : (
                            <ul className="divide-y divide-slate-100">
                              {assignments.map((a, aIdx) => {
                                const aScore = a.score !== null && a.score !== undefined ? Number(a.score) : null;
                                return (
                                  <li
                                    key={`${student.id}-a-${aIdx}`}
                                    className="py-1.5 flex items-center justify-between gap-2 text-xs"
                                  >
                                    <span className="text-slate-700 font-medium truncate">{a.title}</span>
                                    {aScore !== null ? (
                                      <span
                                        className={`font-black shrink-0 ${
                                          aScore >= KKM ? 'text-emerald-600' : 'text-rose-600'
                                        }`}
                                      >
                                        {aScore}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                                        Belum dinilai
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
