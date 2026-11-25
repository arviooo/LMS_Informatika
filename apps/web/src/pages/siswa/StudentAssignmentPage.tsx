import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { api, formatStorageUrl } from '@lms/shared';

import Icon from '../../components/Icon';
import RichTextEditor from '../../components/ui/RichTextEditor';
import RichTextRenderer from '../../components/ui/RichTextRenderer';
import HeaderBar from '../../components/dashboard/HeaderBar';
import { AssignmentDetailSkeleton } from '../../components/ui/PageSkeleton';
import { stripMarkdown } from '../../lib/textUtils';

export default function StudentAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [note, setNote] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const formatDateSafe = (dateStr: string | null | undefined, options?: Intl.DateTimeFormatOptions) => {
    if (!dateStr) return '-';
    try {
      const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleString('id-ID', options || { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };
  
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [motivationText, setMotivationText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const response = await api.get(`/api/student/assignments/${id}`);
        setAssignment(response.data.assignment);
        setSubmission(response.data.submission);
        if (response.data.submission?.student_note) {
          setNote(response.data.submission.student_note);
        } else {
          const draftNote = localStorage.getItem(`draft_note_${id}`);
          if (draftNote) setNote(draftNote);
        }
      } catch (error) {
        console.error('Failed to fetch assignment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignmentData();
    
    const texts = [
      "Pastikan jawabanmu sudah lengkap dan benar ya!",
      "Jangan terburu-buru, periksa lagi setiap bagian tugasmu.",
      "Bismillah, teliti lagi hasil kerjamu sebelum dikirim ke server.",
      "Sudah yakin? Cek lagi file yang dilampirkan agar tidak salah kirim.",
      "Kerja bagus! Yuk pastikan tidak ada yang terlewat sebelum kumpul."
    ];
    setMotivationText(texts[Math.floor(Math.random() * texts.length)]);
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const removeSelectedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      await Swal.fire('Perhatian', 'Pilih file tugas terlebih dahulu!', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (note) {
        formData.append('student_note', note);
      }
      
      await api.post(`/api/student/assignments/${id}/submit`, formData);
      
      setIsSuccess(true);
      localStorage.removeItem(`draft_note_${id}`); // clear draft after submit
      setTimeout(async () => {
        await Swal.fire('Sukses', 'Tugas Berhasil Terkumpul!', 'success');
        window.location.reload(); // refresh to see the preview
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting:', error);
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.file?.[0] ||
        'Gagal mengumpulkan tugas.';
      await Swal.fire('Gagal', errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDraft = () => {
    localStorage.setItem(`draft_note_${id}`, note);
    Swal.fire('Disimpan', 'Draf catatan berhasil disimpan di perangkatmu!', 'success');
  };

  const handleHelp = () => {
    Swal.fire('Bantuan', 'Butuh bantuan? Silakan hubungi Tim Guru Informatika di Lab Komputer saat jam istirahat.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <HeaderBar title="Kerjakan Tugas" backUrl={-1} />

      <main className="flex-1 flex flex-col relative w-full pt-4 pb-safe max-w-3xl mx-auto">
        {loading ? (
          <AssignmentDetailSkeleton />
        ) : (
          <div className="flex flex-col w-full pb-8">
          
          {/* Top Progress Indicator Banner */}
          <div className="px-5 pt-2">
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-3xl p-4.5 shadow-xs border-2 border-emerald-200/80">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Icon name="cloud_sync" className="text-emerald-600" />
                  <span className="text-xs font-black">Tersinkron dengan Server</span>
                </div>
                <span className="bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-amber-900 flex items-center gap-1">
                  <Icon name="data_saver_on" className="text-[14px] text-orange-600" /> Hemat Kuota Aktif
                </span>
              </div>
              <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 h-full w-2/3 rounded-full transition-all duration-300"></div>
              </div>
            </div>
          </div>

          {/* Assignment Summary Card */}
          <section className="px-5 mt-5">
            <div className="bg-white rounded-3xl p-5 shadow-md shadow-amber-500/5 border-2 border-amber-200/80">
              {/* Status Badges Row */}
              <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {submission ? (
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <Icon name="check_circle" className="text-[15px]" /> Selesai
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <Icon name="hourglass_top" className="text-[15px]" /> Sedang Berjalan
                    </span>
                  )}
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                    <Icon name="stars" className="text-[15px] text-orange-600" /> {assignment?.max_points || 100} Poin
                  </span>
                </div>
                <div className="flex items-center gap-1 text-rose-700 bg-rose-100 border border-rose-200 px-3 py-1 rounded-full">
                  <Icon name="schedule" className="text-[15px]" />
                  <span className="text-xs font-extrabold">
                    Tenggat: {formatDateSafe(assignment?.deadline)}
                  </span>
                </div>
              </div>
              
              {/* Assignment Title */}
              <h1 className="text-xl font-black text-slate-900 mb-2 leading-snug">
                {stripMarkdown(assignment?.title)}
              </h1>
              
              {/* Meta Teacher & Due Info */}
              <div className="flex items-center gap-5 pt-2 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <Icon name="person" className="text-[16px]" />
                  </div>
                  <span className="font-label-md text-label-md text-on-surface-variant">Guru Pengampu</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                <div className="flex items-center gap-1">
                  <Icon name="calendar_today" className="text-outline text-[16px]" />
                  <span className="font-label-md text-label-md text-on-surface-variant">{formatDateSafe(assignment?.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              
              {/* Short Description */}
              {assignment?.command_text && (
                <div className="mb-5 p-4 bg-surface-container-low/70 rounded-2xl border border-outline-variant/30">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">Petunjuk & Perintah Tugas:</span>
                  <RichTextRenderer content={assignment.command_text} />
                </div>
              )}

              {/* Lampiran (Attachment) */}
              {assignment?.attachment_path && (
                <div className="mt-4 pt-4 border-t border-surface-variant">
                  <h3 className="font-label-md text-label-md text-on-surface-variant mb-2">Lampiran Tugas</h3>
                  <a 
                    href={formatStorageUrl(assignment.attachment_url || assignment.attachment_path)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-secondary-container text-on-secondary-container p-3 rounded-xl hover:bg-secondary-container/80 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                      <Icon name="attach_file" className="text-[20px] text-secondary" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-label-md text-label-md font-bold truncate">
                        {assignment.attachment_path.split('/').pop() || 'Lihat Lampiran'}
                      </span>
                      <span className="font-body-sm text-body-sm opacity-80 uppercase tracking-widest text-[10px]">
                        Dokumen/File
                      </span>
                    </div>
                  </a>
                </div>
              )}
              
            </div>
          </section>

          {/* Instructions Section */}
          <section className="px-5 mt-5">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <Icon name="assignment" className="text-[20px]" />
                  </div>
                  <h2 className="font-label-lg text-label-lg text-on-surface">Instruksi Pengerjaan</h2>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">Langkah Wajib</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md flex-shrink-0 mt-0.5">1</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                      {assignment?.instruction}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Acceptable Format Badges */}
              <div className="mt-5 pt-3 bg-surface-container-low rounded-lg p-4">
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-2">Format Berkas Diterima:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-surface-container-lowest text-primary font-label-md text-label-md px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                    <Icon name="picture_as_pdf" className="text-[16px] text-error" /> PDF
                  </span>
                  <span className="bg-surface-container-lowest text-secondary font-label-md text-label-md px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                    <Icon name="image" className="text-[16px]" /> JPG
                  </span>
                  <span className="bg-surface-container-lowest text-secondary font-label-md text-label-md px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                    <Icon name="image" className="text-[16px]" /> PNG
                  </span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm ml-auto flex items-center gap-1">
                    <Icon name="tune" className="text-[14px]" /> Kompres Otomatis
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Submission Preview Panel (Dukungan PDF & Gambar untuk HP/Desktop) */}
          {submission && submission.file_url ? (
            <section className="px-5 mt-5">
              <div className="bg-primary-container/20 rounded-2xl p-5 shadow-sm border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="task" className="text-primary text-[24px]" />
                    <h2 className="font-label-lg text-lg text-on-surface font-bold">Tugas Terkumpul</h2>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Icon name="verified" className="text-[14px]" /> Terkirim ke Guru
                  </span>
                </div>
                
                {submission.file_url.toLowerCase().endsWith('.pdf') ? (
                  <div className="bg-surface-container-lowest rounded-2xl p-4 mb-4 flex items-center justify-between border border-surface-variant/30 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                        <Icon name="picture_as_pdf" className="text-[26px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-on-surface truncate">Dokumen Jawaban (PDF)</span>
                        <span className="text-xs text-on-surface-variant">Tersimpan aman di server</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowPreviewModal(true)}
                        className="px-3.5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
                      >
                        Lihat Dokumen
                      </button>
                      <a
                        href={formatStorageUrl(submission.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-on-surface-variant hover:text-primary rounded-xl border border-surface-variant/40 hover:bg-surface-container"
                        title="Buka di Tab Baru"
                      >
                        <Icon name="open_in_new" className="text-[16px]" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-surface-container-low rounded-xl p-3 mb-3 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-md bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0">
                          <Icon name="image" className="text-[20px]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface truncate">Bukti_Jawaban.jpg</span>
                          <button
                            type="button"
                            onClick={() => setShowPreviewModal(true)}
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 font-bold cursor-pointer text-left"
                          >
                            <Icon name="visibility" className="text-[12px]" /> Lihat Penuh (Perbesar)
                          </button>
                        </div>
                      </div>
                      <a
                        href={formatStorageUrl(submission.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-on-surface-variant hover:text-primary rounded-lg border border-surface-variant/30"
                        title="Buka File Asli"
                      >
                        <Icon name="open_in_new" className="text-[16px]" />
                      </a>
                    </div>
                    
                    <div 
                      onClick={() => setShowPreviewModal(true)}
                      className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest mb-4 cursor-pointer group relative shadow-inner"
                    >
                      <img 
                        src={formatStorageUrl(submission.file_url)} 
                        alt="Preview Jawaban" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5 backdrop-blur-[1px]">
                        <Icon name="zoom_in" className="text-[18px]" /> Ketuk untuk melihat ukuran penuh
                      </div>
                    </div>
                  </>
                )}
                
                {submission.student_note && (
                  <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 mb-3">
                    <span className="font-label-sm text-label-sm text-on-surface-variant block mb-2 font-bold">Catatan / Jawaban Anda:</span>
                    <RichTextRenderer content={submission.student_note} />
                  </div>
                )}
                
                <div className="flex items-center justify-center p-3 bg-secondary-container/50 rounded-xl text-on-secondary-container font-medium text-xs">
                  <Icon name="verified" className="text-[18px] mr-2 text-secondary" />
                  <span>Tugas ini sudah tersimpan di server dan siap diperiksa oleh guru.</span>
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* Upload Section / Interactive Dropzone */}
              <section className="px-5 mt-5">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <Icon name="upload_file" className="text-[20px]" />
                  </div>
                  <h2 className="font-label-lg text-label-lg text-on-surface">Unggah Berkas Jawaban</h2>
                </div>
                <span className="bg-secondary-container/50 text-on-secondary-container px-2 py-0.5 rounded font-label-sm text-label-sm">Wajib</span>
              </div>
              
              {!selectedFile ? (
                <div 
                  className="cursor-pointer bg-surface-container-low rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-[0.98] shadow-sm relative overflow-hidden" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    className="hidden" 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 shadow-inner">
                    <Icon name="cloud_upload" className="text-[36px]" />
                  </div>
                  <span className="font-label-lg text-label-lg text-on-surface mb-1">
                    Ketuk untuk Memilih File Tugas
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mb-4">
                    Bisa jepret langsung dari kamera HP atau ambil dari galeri & manajer file dokumen.
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-surface-container-lowest px-2.5 py-1 rounded font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 shadow-sm">
                      <Icon name="photo_camera" className="text-[15px] text-primary" /> Kamera
                    </span>
                    <span className="bg-surface-container-lowest px-2.5 py-1 rounded font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 shadow-sm">
                      <Icon name="folder_open" className="text-[15px] text-primary" /> Dokumen
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">Maks 15MB</span>
                  </div>
                </div>
              ) : (
                <div className="mt-5 bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-4 shadow-sm border border-outline-variant/30 transition-all duration-300">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon name="task" className="text-[26px]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-label-md text-on-surface truncate leading-snug">
                          {selectedFile.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="text-secondary font-label-sm text-label-sm flex items-center gap-1">
                            <Icon name="check_circle" className="" />
                            Siap Diunggah
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button 
                        aria-label="Ganti File" 
                        className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant active:bg-surface-container transition-colors" 
                        onClick={() => fileInputRef.current?.click()} 
                        type="button"
                      >
                        <Icon name="swap_horiz" className="text-[20px]" />
                      </button>
                      <button 
                        aria-label="Hapus File" 
                        className="w-10 h-10 flex items-center justify-center rounded-full text-error active:bg-error-container/50 transition-colors" 
                        onClick={removeSelectedFile} 
                        type="button"
                      >
                        <Icon name="delete" className="text-[20px]" />
                      </button>
                    </div>
                  </div>
                  
                  {previewUrl && (
                    <div className="w-full h-40 sm:h-56 rounded-lg overflow-hidden bg-surface-container border border-outline-variant/50 relative">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-on-surface shadow-sm">
                        Preview
                      </div>
                    </div>
                  )}

                  <input 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    className="hidden" 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Student Note Field */}
          <section className="px-5 mt-5">
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-variant/20">
              <div className="flex items-center justify-between mb-2">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5" htmlFor="studentNote">
                  <Icon name="comment" className="text-primary text-[18px]" />
                  Catatan / Jawaban Tugas Siswa
                </label>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Bisa Diformat Rapi</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Sampaikan catatan atau tulis jawaban langsung untuk guru. Gunakan toolbar di bawah untuk menebalkan teks, membuat daftar poin, dan melihat pratinjau sebelum dikumpulkan.
              </p>
              <RichTextEditor
                id="studentNote"
                value={note}
                onChange={setNote}
                placeholder="Tuliskan jawaban atau catatan tugas untuk guru..."
                minHeight="140px"
              />
            </div>
          </section>

          {/* Classroom Motivation Micro-card */}
          <div className="px-5 mt-5">
            <div className="bg-secondary-container/40 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0">
                <Icon name="tips_and_updates" className="" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-label-md text-label-md text-on-secondary-container block leading-tight">Teliti Sebelum Mengirim!</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">{motivationText}</span>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Ergonomic Action Buttons */}
          <div className="sticky bottom-0 mt-8 w-full bg-surface-container-lowest shadow-[0_-4px_10px_rgba(0,0,0,0.05)] px-4 sm:px-6 py-4 flex flex-col gap-3 z-40">
            {/* Primary Blue Submission Button */}
            <button 
              className={`w-full h-[52px] ${isSuccess ? 'bg-secondary text-on-secondary' : 'bg-primary-container hover:bg-primary active:bg-primary-fixed text-on-primary-container hover:text-on-primary'} rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-300 disabled:opacity-70`} 
              onClick={handleSubmit} 
              disabled={isSubmitting || isSuccess || !selectedFile}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Icon name="progress_activity" className="animate-spin text-[22px]" />
                  <span>Mengunggah Tugas ke Server...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Icon name="check_circle" className="" />
                  <span>Tugas Berhasil Terkumpul!</span>
                </>
              ) : (
                <>
                  <Icon name="send" className="text-[22px]" />
                  <span>Kirim Tugas Sekarang</span>
                </>
              )}
            </button>
            
            {/* Secondary Draft Button */}
            <div className="flex items-center gap-3">
              <button 
                className="flex-1 h-12 bg-surface-container-low hover:bg-surface-container active:bg-surface-container-high text-on-surface rounded-xl font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors" 
                onClick={handleDraft} 
                type="button"
              >
                <Icon name="bookmark_border" className="text-[18px]" />
                <span>Simpan Draf Jawaban</span>
              </button>
              <button 
                aria-label="Bantuan Guru" 
                className="w-12 h-12 bg-surface-container-low hover:bg-surface-container active:bg-surface-container-high text-on-surface rounded-xl flex items-center justify-center transition-colors shrink-0" 
                onClick={handleHelp} 
                type="button"
              >
                <Icon name="help_outline" className="text-[20px]" />
              </button>
            </div>
          </div>
            </>
          )}
          
        </div>
        )}
      </main>
      {/* In-App Modal Preview Siswa (Tampilan Layar HP & Tablet) */}
      {showPreviewModal && submission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-surface-variant/30">
            {/* Header */}
            <div className="p-4 border-b border-surface-variant/20 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2">
                <Icon name="task" className="text-primary text-[20px]" />
                <h3 className="font-bold text-on-surface text-sm sm:text-base">Pratinjau Hasil Tugas</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={formatStorageUrl(submission.file_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                  title="Buka File Asli"
                >
                  <Icon name="open_in_new" className="text-[18px]" />
                </a>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
                  title="Tutup"
                >
                  <Icon name="close" className="text-[20px]" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center bg-surface-container-lowest min-h-[300px]">
              {submission.file_url?.toLowerCase().endsWith('.pdf') ? (
                <div className="w-full h-full flex flex-col items-center gap-3">
                  <iframe
                    src={formatStorageUrl(submission.file_url)}
                    title="Preview Dokumen PDF"
                    className="w-full h-[55vh] rounded-2xl border border-surface-variant/30 shadow-inner"
                  />
                  <a
                    href={formatStorageUrl(submission.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
                  >
                    <Icon name="download" className="text-[18px]" />
                    Unduh / Buka Dokumen PDF
                  </a>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center">
                  <img
                    src={formatStorageUrl(submission.file_url)}
                    alt="Preview Tugas Anda"
                    className="max-h-[60vh] max-w-full rounded-2xl object-contain shadow-sm border border-outline-variant/30"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-variant/20 flex items-center justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-6 py-2 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm hover:bg-surface-variant transition-colors"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

