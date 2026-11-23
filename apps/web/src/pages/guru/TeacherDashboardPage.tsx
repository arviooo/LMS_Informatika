import { useState, useEffect, useMemo } from 'react';
import { api, getCurrentUser } from '@lms/shared';

import Icon from '../../components/Icon';
import { MonitoringMatrixSkeleton } from '../../components/ui/PageSkeleton';

interface StudentMatrix {
  id: number;
  name: string;
  identifier_no: string;
  class: string;
  pc_number: string;
  progress: number;
  is_being_guided?: boolean;
  online_status?: 'online' | 'logged_out' | 'offline';
  last_login_at?: string | null;
  last_logout_at?: string | null;
  metrics: {
    modul_done: boolean;
    modul_count?: number;
    total_modul?: number;
    video_done: boolean;
    kuis_score: number;
    tugas_done: boolean;
    tugas_count?: number;
    total_tugas?: number;
  };
}

interface SummaryData {
  total_students: number;
  aktif: number;
  online_count?: number;
  logged_out_count?: number;
  offline_count?: number;
  tuntas: number;
  bimbingan: number;
  average_progress: number;
}

interface RecentActivity {
  id: number;
  name: string;
  class: string;
  time: string;
  action: string;
}

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState<StudentMatrix[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [liveTime, setLiveTime] = useState('');
  const currentUser = getCurrentUser();
  const isScopedTeacher = Boolean(currentUser?.class_name);
  const [activeClass, setActiveClass] = useState(currentUser?.class_name || 'Semua Kelas');
  const classes = ['Semua Kelas', 'VII A', 'VII B', 'VII C', 'VII D'];
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'logged_out' | 'offline' | 'bimbingan'>('all');

  // Accordion Dropdown States (default tertutup agar hemat ruang & rapi)
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [showActivities, setShowActivities] = useState(false);

  useEffect(() => {
    fetchMatrix();

    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setLiveTime(`${h}:${m} WIB`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);

    return () => clearInterval(timer);
  }, [activeClass]);

  const fetchMatrix = async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get(`/api/teacher/dashboard/monitoring?class_name=${activeClass}`);
      setStudents(res.data.students || []);
      setSummary(res.data.summary || null);
      setRecentActivities(res.data.recent_activities || []);
      if (isRefreshing) {
        triggerToast('Data pemantauan kelas berhasil disinkronisasi.');
      }
    } catch (error) {
      console.error('Failed to fetch monitoring matrix', error);
      triggerToast('Gagal menarik data pemantauan terbaru.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleStudentRow = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.identifier_no.includes(searchQuery) ||
        (s.pc_number && s.pc_number.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'bimbingan') return s.progress < 40;
      return (s.online_status || 'offline') === statusFilter;
    });
  }, [students, searchQuery, statusFilter]);

  const allExpanded =
    filteredStudents.length > 0 && filteredStudents.every((s) => Boolean(expandedIds[s.id]));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedIds({});
    } else {
      const next: Record<number, boolean> = {};
      filteredStudents.forEach((s) => {
        next[s.id] = true;
      });
      setExpandedIds(next);
    }
  };

  // Hitung data untuk Diagram Lingkaran (Donut Chart) & Diagram Batang Kehadiran
  const chartStats = useMemo(() => {
    const total = Math.max(1, summary?.total_students ?? students.length);
    const tuntasCount = students.filter((s) => s.progress >= 75).length;
    const bimbinganCount = students.filter((s) => s.progress < 40).length;
    const prosesCount = Math.max(0, students.length - tuntasCount - bimbinganCount);

    const onlineCount = summary?.online_count ?? summary?.aktif ?? 0;
    const logoutCount = summary?.logged_out_count ?? 0;
    const offlineCount = summary?.offline_count ?? Math.max(0, total - onlineCount - logoutCount);

    const tuntasPct = Math.round((tuntasCount / total) * 100);
    const prosesPct = Math.round((prosesCount / total) * 100);
    const bimbinganPct = Math.max(0, 100 - tuntasPct - prosesPct);

    const onlinePct = (onlineCount / total) * 100;
    const logoutPct = (logoutCount / total) * 100;
    const offlinePct = Math.max(0, 100 - onlinePct - logoutPct);

    return {
      total: summary?.total_students ?? students.length,
      tuntasCount,
      prosesCount,
      bimbinganCount,
      onlineCount,
      logoutCount,
      offlineCount,
      tuntasPct,
      prosesPct,
      bimbinganPct,
      onlinePct,
      logoutPct,
      offlinePct,
    };
  }, [students, summary]);

  // SVG Donut Calculations
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const tuntasArc = (chartStats.tuntasPct / 100) * donutCircumference;
  const prosesArc = (chartStats.prosesPct / 100) * donutCircumference;
  const bimbinganArc = (chartStats.bimbinganPct / 100) * donutCircumference;

  return (
    <div className="flex flex-col relative w-full min-h-screen bg-[#F8F9FB]">
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-4 px-4 sm:px-6 pt-4 pb-24">
        {/* Toast Notification */}
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${
            showToast ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
          } w-[90%] max-w-md bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3`}
        >
          <Icon name="notifications_active" className="text-emerald-400 text-[22px] shrink-0" />
          <p className="text-xs sm:text-sm font-semibold flex-1">{toastMessage}</p>
        </div>

        {/* ─── 1. Compact Top Toolbar (Filter Kelas + Jam Live + Sync) ─── */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0">
            {isScopedTeacher ? (
              <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-xl text-blue-800 font-bold text-xs shrink-0">
                <Icon name="school" className="text-[15px] text-blue-600" />
                <span>Kelas Binaan: {currentUser?.class_name}</span>
              </div>
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

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {liveTime || 'Live'}
            </span>
            <button
              type="button"
              onClick={fetchMatrix}
              title="Sinkronkan Data Terbaru"
              className="h-8 w-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70 flex items-center justify-center active:scale-95 transition-all"
            >
              <Icon name="sync" className={`text-[18px] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ─── 2. Ringkasan Visual & Diagram Efisien (2 Kolom Kompak) ─── */}
        {summary && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Kiri: Diagram Lingkaran Ketuntasan Kelas */}
            <div className="md:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-center gap-4">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#F1F5F9"
                    strokeWidth="12"
                  />
                  {/* Tuntas (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={`${tuntasArc} ${donutCircumference}`}
                    strokeDashoffset={0}
                    className="transition-all duration-700"
                  />
                  {/* Sedang Proses (Amber) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="12"
                    strokeDasharray={`${prosesArc} ${donutCircumference}`}
                    strokeDashoffset={-tuntasArc}
                    className="transition-all duration-700"
                  />
                  {/* Perlu Bimbingan (Rose) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#EF4444"
                    strokeWidth="12"
                    strokeDasharray={`${bimbinganArc} ${donutCircumference}`}
                    strokeDashoffset={-(tuntasArc + prosesArc)}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    {summary.average_progress}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                    Rata-Rata
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Ketuntasan Kelas
                  </h2>
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {chartStats.total} Siswa
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Tuntas (≥75%)
                    </span>
                    <span className="font-extrabold text-emerald-700">{chartStats.tuntasCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Proses (40–74%)
                    </span>
                    <span className="font-extrabold text-amber-700">{chartStats.prosesCount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter(statusFilter === 'bimbingan' ? 'all' : 'bimbingan')
                    }
                    className={`flex items-center justify-between px-1.5 py-0.5 -mx-1.5 rounded-lg transition-colors ${
                      statusFilter === 'bimbingan' ? 'bg-rose-100' : 'hover:bg-rose-50'
                    }`}
                    title="Klik untuk filter siswa perlu bimbingan"
                  >
                    <span className="flex items-center gap-1.5 text-rose-700 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Perlu Bimbingan
                    </span>
                    <span className="font-black text-rose-700">{chartStats.bimbinganCount}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Kanan: Diagram Batang Kehadiran Realtime + Aksi Cepat */}
            <div className="md:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Diagram Kehadiran Realtime
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Klik status untuk memfilter
                  </span>
                </div>

                {/* Stacked Proportional Bar */}
                <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex gap-0.5 mb-3">
                  {chartStats.onlinePct > 0 && (
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${chartStats.onlinePct}%` }}
                      title={`Online: ${chartStats.onlineCount}`}
                    />
                  )}
                  {chartStats.logoutPct > 0 && (
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${chartStats.logoutPct}%` }}
                      title={`Sudah Logout: ${chartStats.logoutCount}`}
                    />
                  )}
                  {chartStats.offlinePct > 0 && (
                    <div
                      className="h-full bg-slate-300 transition-all duration-500"
                      style={{ width: `${chartStats.offlinePct}%` }}
                      title={`Belum Login: ${chartStats.offlineCount}`}
                    />
                  )}
                </div>

                {/* 3 Compact Filter Cards */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === 'online' ? 'all' : 'online')}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      statusFilter === 'online'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900 border-emerald-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black leading-none">{chartStats.onlineCount}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          statusFilter === 'online' ? 'bg-white' : 'bg-emerald-500 animate-pulse'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] font-bold mt-1 opacity-90 truncate">Online Lab</p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter(statusFilter === 'logged_out' ? 'all' : 'logged_out')
                    }
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      statusFilter === 'logged_out'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-amber-50/70 hover:bg-amber-50 text-amber-900 border-amber-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black leading-none">{chartStats.logoutCount}</span>
                      <Icon name="logout" className="text-[14px] opacity-80" />
                    </div>
                    <p className="text-[10px] font-bold mt-1 opacity-90 truncate">Sudah Logout</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === 'offline' ? 'all' : 'offline')}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      statusFilter === 'offline'
                        ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                        : 'bg-slate-100/80 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black leading-none">{chartStats.offlineCount}</span>
                      <Icon name="cloud_off" className="text-[14px] opacity-70" />
                    </div>
                    <p className="text-[10px] font-bold mt-1 opacity-80 truncate">Belum Login</p>
                  </button>
                </div>
              </div>

              {/* Compact Quick Action Strip */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    triggerToast(`Peringatan bimbingan dikirim ke ${chartStats.bimbinganCount} siswa pasif.`)
                  }
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Icon name="campaign" className="text-[16px]" />
                  <span>Ingatkan Pasif ({chartStats.bimbinganCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Menyiapkan ringkasan laporan praktik kelas...')}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
                >
                  <Icon name="description" className="text-[16px] text-blue-600" />
                  <span className="hidden sm:inline">Ekspor</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ─── 3. Dropdown Collapsible: Aktivitas Terbaru (Default Tertutup agar Hemat Tempat) ─── */}
        {recentActivities.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowActivities(!showActivities)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon name="history" className="text-[18px]" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Log Aktivitas Terbaru
                  </span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    {recentActivities.length}
                  </span>
                </div>
              </div>
              <Icon
                name="expand_more"
                className={`text-slate-500 text-[20px] transition-transform duration-200 ${
                  showActivities ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showActivities && (
              <div className="px-4 pb-3 pt-1 border-t border-slate-100 divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {activity.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{activity.name}</p>
                        <p className="text-[10px] text-slate-500">{activity.class}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {activity.action}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── 4. Matriks Pemantauan Siswa (Kompak dengan Dropdown Panah per Siswa) ─── */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Header Matriks + Search + Expand All */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Matriks Pemantauan Siswa
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {filteredStudents.length} Siswa
                </span>
              </div>

              <div className="flex items-center gap-2">
                {statusFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Icon name="close" className="text-[13px]" />
                    Reset Filter
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleExpandAll}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Icon
                    name={allExpanded ? 'expand_less' : 'expand_more'}
                    className="text-[16px]"
                  />
                  <span>{allExpanded ? 'Tutup Semua' : 'Buka Semua'}</span>
                </button>
              </div>
            </div>

            {/* Compact Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon name="search" className="text-[18px]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                placeholder="Cari siswa berdasarkan nama, NISN, atau nomor PC..."
              />
            </div>
          </div>

          {/* Daftar Baris Siswa Kompak (Accordion Dropdown) */}
          {isRefreshing && students.length === 0 ? (
            <div className="p-4">
              <MonitoringMatrixSkeleton />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">
              Tidak ada siswa yang sesuai dengan filter saat ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const isDanger = student.progress < 40;
                const isWarning = student.progress >= 40 && student.progress < 75;
                const isExpanded = Boolean(expandedIds[student.id]);

                const badgeColor = isDanger
                  ? 'bg-rose-100 text-rose-700'
                  : isWarning
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-700';

                const progressColor = isDanger
                  ? 'bg-rose-500'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

                const textProgressColor = isDanger
                  ? 'text-rose-600'
                  : isWarning
                  ? 'text-amber-600'
                  : 'text-emerald-600';

                return (
                  <article
                    key={student.id}
                    className={`transition-colors ${
                      isExpanded ? 'bg-slate-50/70' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Baris Ringkas (Klik untuk Buka/Tutup Detail Dropdown) */}
                    <button
                      type="button"
                      onClick={() => toggleStudentRow(student.id)}
                      aria-expanded={isExpanded}
                      className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Nomor Urut */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${badgeColor}`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        {/* Nama & Status Ringkas */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {student.name}
                            </h3>
                            {/* Dot status kehadiran */}
                            {student.online_status === 'online' ? (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0"
                                title="Sedang Online"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                              </span>
                            ) : student.online_status === 'logged_out' ? (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                                Logout
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold shrink-0">
                                Offline
                              </span>
                            )}
                            {student.is_being_guided && (
                              <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold shrink-0">
                                Dibimbing
                              </span>
                            )}
                          </div>

                          {/* Mini Progress Bar di Mobile & Desktop */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 max-w-[140px] h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium truncate">
                              {student.class} • PC-{student.pc_number}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Kanan: Persentase & Panah Dropdown */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className={`text-sm font-black block leading-none ${textProgressColor}`}>
                            {student.progress}%
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {isDanger ? 'Pasif' : isWarning ? 'Proses' : 'Tuntas'}
                          </span>
                        </div>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isExpanded
                              ? 'bg-blue-100 text-blue-700 rotate-180'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon name="expand_more" className="text-[18px]" />
                        </div>
                      </div>
                    </button>

                    {/* Isi Dropdown Detail (Hanya Muncul Saat Panah/Baris Diklik) */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 bg-slate-50/90 animate-fade-in">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 mb-3 pt-2">
                          <span>
                            NISN: <strong className="text-slate-700">{student.identifier_no}</strong> •
                            PC-{student.pc_number}
                          </span>
                          {student.last_logout_at && student.online_status === 'logged_out' && (
                            <span>Logout terakhir: {student.last_logout_at}</span>
                          )}
                        </div>

                        {/* 4 Metrik Detail Kompak */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {/* Modul */}
                          <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 flex flex-col items-center text-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                              Modul
                            </span>
                            {student.metrics.modul_count !== undefined ? (
                              <span
                                className={`text-sm font-black ${
                                  student.metrics.modul_count >= (student.metrics.total_modul || 1)
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {student.metrics.modul_count}/{student.metrics.total_modul}
                              </span>
                            ) : (
                              <Icon
                                name={student.metrics.modul_done ? 'check_circle' : 'horizontal_rule'}
                                className={`text-[18px] ${
                                  student.metrics.modul_done ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                              />
                            )}
                          </div>

                          {/* Video */}
                          <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 flex flex-col items-center text-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                              Video
                            </span>
                            <Icon
                              name={student.metrics.video_done ? 'check_circle' : 'horizontal_rule'}
                              className={`text-[18px] ${
                                student.metrics.video_done ? 'text-emerald-600' : 'text-slate-400'
                              }`}
                            />
                          </div>

                          {/* Kuis */}
                          <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 flex flex-col items-center text-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                              Kuis
                            </span>
                            <span
                              className={`text-sm font-black ${
                                student.metrics.kuis_score >= 75
                                  ? 'text-emerald-600'
                                  : student.metrics.kuis_score > 0
                                  ? 'text-rose-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {student.metrics.kuis_score > 0 ? student.metrics.kuis_score : '-'}
                            </span>
                          </div>

                          {/* Tugas */}
                          <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 flex flex-col items-center text-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                              Tugas
                            </span>
                            {student.metrics.tugas_count !== undefined ? (
                              <span
                                className={`text-sm font-black ${
                                  student.metrics.tugas_count >= (student.metrics.total_tugas || 1)
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {student.metrics.tugas_count}/{student.metrics.total_tugas}
                              </span>
                            ) : (
                              <Icon
                                name={student.metrics.tugas_done ? 'check_circle' : 'horizontal_rule'}
                                className={`text-[18px] ${
                                  student.metrics.tugas_done ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Tombol Tindakan Khusus Jika Siswa Pasif / Sedang Dibimbing */}
                        {(isDanger || student.is_being_guided) && (
                          <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            {isDanger && (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const res = await api.post(
                                      `/api/teacher/dashboard/students/${student.id}/call`
                                    );
                                    triggerToast(res.data.message);
                                  } catch {
                                    triggerToast('Gagal mengirim panggilan.');
                                  }
                                }}
                                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                              >
                                <Icon name="notifications_active" className="text-[16px]" />
                                Panggil ke Meja Guru
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await api.post(
                                    `/api/teacher/dashboard/students/${student.id}/guidance`
                                  );
                                  triggerToast(res.data.message);
                                  setStudents((prev) =>
                                    prev.map((s) =>
                                      s.id === student.id
                                        ? { ...s, is_being_guided: res.data.is_being_guided }
                                        : s
                                    )
                                  );
                                } catch {
                                  triggerToast('Gagal memperbarui status bimbingan.');
                                }
                              }}
                              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                student.is_being_guided
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              <Icon name="support_agent" className="text-[16px]" />
                              {student.is_being_guided
                                ? 'Selesai Bimbingan'
                                : 'Beri Bimbingan Langsung'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
