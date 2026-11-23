import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getCurrentUser, formatStorageUrl } from '@lms/shared';

import Icon from '../../components/Icon';
import { AssignmentDetailSkeleton } from '../../components/ui/PageSkeleton';
import RichTextRenderer from '../../components/ui/RichTextRenderer';
export default function TeacherAssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const isScopedTeacher = Boolean(currentUser?.class_name);
  const [classFilter, setClassFilter] = useState<string>(currentUser?.class_name || 'Semua');
  const [editingScoreIds, setEditingScoreIds] = useState<number[]>([]);
  const [previewSub, setPreviewSub] = useState<any | null>(null);

  const formatDateSafe = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  const isLateSubmission = (submittedAt: string | null | undefined, deadline: string | null | undefined) => {
    if (!submittedAt || !deadline) return false;
    try {
      const subTime = new Date(submittedAt.includes(' ') && !submittedAt.includes('T') ? submittedAt.replace(' ', 'T') : submittedAt).getTime();
      const deadTime = new Date(deadline.includes(' ') && !deadline.includes('T') ? deadline.replace(' ', 'T') : deadline).getTime();
      return subTime > deadTime;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        // We need to fetch assignment detail and its submissions.
        // Assuming we will add this API endpoint.
        const response = await api.get(`/api/teacher/assignments/${id}`);
        setAssignment(response.data.assignment);
        setSubmissions(response.data.submissions);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const classes = ['Semua', ...Array.from(new Set(submissions.map(s => s.user?.class_name).filter(Boolean)))].sort();
  
  const filteredSubmissions = classFilter === 'Semua' 
    ? submissions 
    : submissions.filter(s => s.user?.class_name === classFilter);

  const formatCsvCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const cleanStr = String(val).replace(/[\r\n]+/g, ' ').trim();
    return `"${cleanStr.replace(/"/g, '""')}"`;
  };

  const exportToCSV = async () => {
    if (!assignment) return;
    
    if (filteredSubmissions.length === 0) {
      await Swal.fire({
        icon: 'info',
        title: 'Tidak Ada Data',
        text: `Belum ada siswa yang mengumpulkan tugas untuk ${classFilter === 'Semua' ? 'semua kelas' : `kelas ${classFilter}`}.`,
        confirmButtonColor: '#006a6a',
        confirmButtonText: 'Tutup'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Unduh Rekap Nilai CSV?',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p style="margin-bottom: 8px;">Apakah Anda yakin ingin mengekspor data pengumpulan tugas ke dalam format Excel/CSV?</p>
          <div style="background: rgba(0, 106, 106, 0.08); padding: 12px; border-radius: 12px; border: 1px solid rgba(0, 106, 106, 0.2);">
            <div><strong>Judul Tugas:</strong> ${assignment.title}</div>
            <div><strong>Filter Kelas:</strong> ${classFilter === 'Semua' ? 'Semua Kelas' : `Kelas ${classFilter}`}</div>
            <div><strong>Jumlah Pengumpulan:</strong> ${filteredSubmissions.length} siswa</div>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Unduh File CSV',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#006a6a',
      cancelButtonColor: '#79747e',
      reverseButtons: true
    });

    if (!confirm.isConfirmed) return;

    const headers = [
      'No',
      'Nama Siswa',
      'Kelas',
      'No. Absen',
      'NISN',
      'Waktu Pengumpulan',
      'Ketepatan Waktu',
      'Status Penilaian',
      'Nilai',
      'Catatan Siswa'
    ];

    const rows = filteredSubmissions.map((sub, idx) => {
      const isLate = isLateSubmission(sub.submitted_at, assignment?.deadline);
      const ketepatan = isLate ? 'Terlambat' : 'Tepat Waktu';
      const statusNilai = sub.score !== null ? 'Sudah Dinilai' : 'Belum Dinilai';
      const nilaiAngka = sub.score !== null ? sub.score : '-';
      const waktuPengumpulan = formatDateSafe(sub.submitted_at);

      return [
        idx + 1,
        sub.user?.name || 'Anonim',
        sub.user?.class_name || '-',
        sub.user?.attendance_number ?? '-',
        sub.user?.identifier_no || '-',
        waktuPengumpulan,
        ketepatan,
        statusNilai,
        nilaiAngka,
        sub.student_note || '-'
      ];
    });

    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.map(formatCsvCell).join(','),
      ...rows.map(row => row.map(formatCsvCell).join(','))
    ].join('\r\n');

    const cleanTitle = (assignment.title || 'Tugas').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFilter = classFilter.replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Nilai_${cleanTitle}_${safeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'Berhasil Diunduh!',
      text: `File CSV pengumpulan tugas berhasil disimpan ke perangkat Anda.`,
      timer: 2200,
      showConfirmButton: false,
    });
  };

  if (loading) {
    return <AssignmentDetailSkeleton />;
  }

  return (
    <div className="flex flex-col relative w-full min-h-screen">
      <section className="px-5 sm:px-8 pt-8 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface"
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">Detail Tugas</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Lihat pengumpulan tugas dari siswa</p>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-variant/20 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded font-label-sm">{assignment?.max_points} Poin</span>
            <span className="text-on-surface-variant font-label-sm">Tenggat: {assignment ? formatDateSafe(assignment?.deadline) : ''}</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2">{assignment?.title}</h2>
          <div className="mb-4 mt-2 p-4 bg-surface-container-low/70 rounded-2xl border border-outline-variant/30">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1.5">Instruksi & Petunjuk Tugas:</span>
            <RichTextRenderer content={assignment?.command_text} />
          </div>
        </div>
      </section>

      <section className="px-5 sm:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="font-label-lg text-lg text-on-surface">Daftar Pengumpulan ({filteredSubmissions.length})</h3>
          
          <div className="flex items-center gap-2">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-surface-container-low border border-surface-variant/30 text-on-surface text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50"
            >
              {classes.map(c => (
                <option key={c} value={c}>{c === 'Semua' ? 'Semua Kelas' : `Kelas ${c}`}</option>
              ))}
            </select>
            
            <button
              onClick={exportToCSV}
              className="bg-primary text-on-primary font-label-sm text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-sm font-bold"
            >
              <Icon name="download" className="text-[18px]" />
              Ekspor CSV
            </button>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-10 bg-surface-container-lowest rounded-3xl border border-surface-variant/20">
              <Icon name="inbox" className="text-[48px] text-on-surface-variant/40 mb-2" />
              <p className="text-body-md text-on-surface-variant">Belum ada siswa yang mengumpulkan tugas ini di kelas terpilih.</p>
            </div>
          ) : (
            filteredSubmissions.map(sub => {
              const isLate = isLateSubmission(sub.submitted_at, assignment?.deadline);
              return (
              <div key={sub.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-on-surface block text-base">{sub.user?.name || 'Siswa'}</span>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-medium">Kelas {sub.user?.class_name || '-'}</span>
                      <span className="text-xs text-on-surface-variant font-medium">No. Absen: {sub.user?.attendance_number || sub.user?.identifier_no || '-'}</span>
                      {isLate && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded-full">
                          <Icon name="warning" className="text-[12px]" /> Terlambat Mengumpulkan
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Icon name="schedule" className="text-[14px]" />
                      {formatDateSafe(sub.submitted_at)}
                    </span>
                  </div>
                </div>

                {sub.student_note && (
                  <div className="bg-surface-container-highest p-3.5 rounded-xl mt-1 border-l-4 border-primary">
                    <p className="text-xs text-on-surface-variant font-bold mb-1.5">Catatan / Jawaban Siswa:</p>
                    <RichTextRenderer content={sub.student_note} />
                  </div>
                )}
                
                {/* File Attachment & Preview Panel (Responsive layout prevents button collision) */}
                {sub.file_path && (
                  <div className="mt-2 p-3.5 bg-surface-container-low border border-surface-variant/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <Icon name="description" className="text-[22px]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">Lampiran Jawaban Siswa</p>
                        <p className="text-xs text-on-surface-variant line-clamp-1">File hasil pengerjaan tugas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={() => setPreviewSub(sub)} 
                        className="flex-1 sm:flex-initial px-4 py-2 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-2 text-sm font-bold hover:bg-primary/90 shadow-sm transition-all active:scale-95 cursor-pointer"
                        title="Buka Preview Jawaban"
                      >
                        <Icon name="visibility" className="text-[18px]" />
                        Buka Preview
                      </button>
                      <a 
                        href={formatStorageUrl(sub.file_url)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-2 text-on-surface-variant hover:text-primary rounded-xl border border-surface-variant/40 hover:bg-surface-container transition-colors shrink-0 flex items-center justify-center"
                        title="Buka File di Tab Baru"
                      >
                        <Icon name="open_in_new" className="text-[18px]" />
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Nilai dan Grading */}
                <div className="mt-4 pt-3 border-t border-surface-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-on-surface-variant">Status Penilaian:</span>
                    {sub.score !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                          <Icon name="check_circle" className="text-[14px]" /> Sudah Dinilai ({sub.score})
                        </span>
                        {!editingScoreIds.includes(sub.id) && (
                          <button 
                            onClick={() => {
                              Swal.fire({
                                title: 'Ubah Nilai?',
                                text: "Yakin mau merubah nilai siswa ini?",
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonText: 'Ya, Ubah',
                                cancelButtonText: 'Batal'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  setEditingScoreIds(prev => [...prev, sub.id]);
                                }
                              });
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-colors"
                            title="Edit Nilai"
                          >
                            <Icon name="edit" className="text-[18px]" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-xs font-medium italic">Belum dinilai</span>
                    )}
                  </div>
                  
                  {(sub.score === null || editingScoreIds.includes(sub.id)) && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        id={`score-${sub.id}`}
                        defaultValue={sub.score !== null ? sub.score : ''}
                        placeholder={`0 - ${assignment?.max_points || 100}`}
                        className="w-24 border-2 border-outline-variant focus:border-primary focus:ring-0 rounded-xl px-3 py-2 text-sm bg-surface outline-none transition-all font-bold text-center"
                        min="0"
                        max={assignment?.max_points || 100}
                      />
                      <button 
                        onClick={async () => {
                          const input = document.getElementById(`score-${sub.id}`) as HTMLInputElement;
                          if (!input || !input.value) return;
                          try {
                            await api.post(`/api/teacher/assignments/${id}/submissions/${sub.id}/grade`, { score: parseInt(input.value) });
                            Swal.fire('Sukses', 'Nilai berhasil disimpan!', 'success');
                            setEditingScoreIds(prev => prev.filter(eid => eid !== sub.id));
                            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, score: parseInt(input.value) } : s));
                          } catch (err) {
                            Swal.fire('Gagal', 'Gagal menyimpan nilai', 'error');
                          }
                        }}
                        className="bg-primary text-on-primary hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                      >
                        Simpan Nilai
                      </button>
                      {editingScoreIds.includes(sub.id) && (
                        <button 
                          onClick={() => setEditingScoreIds(prev => prev.filter(eid => eid !== sub.id))}
                          className="bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 px-3 py-2 rounded-xl text-sm font-bold transition-colors"
                        >
                          <Icon name="close" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })
          )}
        </div>
      </section>
      {/* In-App Modal Preview Siswa (Aman untuk Layar HP & Laptop) */}
      {previewSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-surface-variant/30">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-surface-variant/20 flex items-center justify-between gap-3 bg-surface-container-low">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                  {previewSub.user?.name?.charAt(0) || 'S'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-on-surface text-base truncate">{previewSub.user?.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <p className="text-xs text-on-surface-variant">
                      Kelas {previewSub.user?.class_name || '-'} • No. Absen: {previewSub.user?.attendance_number || previewSub.user?.identifier_no || '-'}
                    </p>
                    {isLateSubmission(previewSub.submitted_at, assignment?.deadline) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-error bg-error/10 border border-error/20 px-2 py-0.5 rounded-full">
                        <Icon name="warning" className="text-[10px]" /> Terlambat
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={formatStorageUrl(previewSub.file_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                  title="Buka File Asli"
                >
                  <Icon name="open_in_new" className="text-[20px]" />
                </a>
                <button
                  onClick={() => setPreviewSub(null)}
                  className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
                  title="Tutup"
                >
                  <Icon name="close" className="text-[22px]" />
                </button>
              </div>
            </div>

            {/* Modal Content / Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-surface-container-lowest min-h-[300px]">
              {previewSub.file_url?.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-full flex flex-col items-center gap-4">
                  <iframe
                    src={formatStorageUrl(previewSub.file_url)}
                    title="Preview PDF"
                    className="w-full h-[52vh] rounded-2xl border border-surface-variant/30 shadow-inner"
                  />
                  <a
                    href={formatStorageUrl(previewSub.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
                  >
                    <Icon name="download" className="text-[18px]" />
                    Unduh / Buka Dokumen PDF
                  </a>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center">
                  <img
                    src={formatStorageUrl(previewSub.file_url)}
                    alt="Lampiran Jawaban Siswa"
                    className="max-h-[58vh] max-w-full rounded-2xl object-contain shadow-sm border border-outline-variant/30"
                  />
                </div>
              )}

              {previewSub.student_note && (
                <div className="w-full mt-4 p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-left">
                  <p className="text-xs font-bold text-on-surface-variant mb-2">Catatan / Jawaban dari Siswa:</p>
                  <RichTextRenderer content={previewSub.student_note} />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-variant/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant">Nilai:</span>
                <span className="text-base font-black text-primary">
                  {previewSub.score !== null ? `${previewSub.score} Poin` : 'Belum dinilai'}
                </span>
              </div>
              <button
                onClick={() => setPreviewSub(null)}
                className="px-5 py-2 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-variant transition-colors"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

