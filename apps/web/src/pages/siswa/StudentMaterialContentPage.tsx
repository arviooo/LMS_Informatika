import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, backendUrl } from '@lms/shared';

import Icon from '../../components/Icon';
import RichTextRenderer from '../../components/ui/RichTextRenderer';
import HeaderBar from '../../components/dashboard/HeaderBar';
import { MaterialDetailSkeleton } from '../../components/ui/PageSkeleton';
import { AnimatedVisual } from '../../components/ui/AnimatedVisuals';

export default function StudentMaterialContentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      const res = await api.get(`/api/student/materials/${id}`);
      setMaterial(res.data);
      if (res.data.student_progress && res.data.student_progress.length > 0) {
        setIsRead(res.data.student_progress[0].is_read || res.data.student_progress[0].is_video_watched);
      }
    } catch (e) {
      Swal.fire('Error', 'Gagal memuat materi.', 'error');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProgressUpdate = async (checked: boolean) => {
    if (!checked || isRead || isMarking) return;
    setIsMarking(true);
    try {
      await api.post(`/api/student/materials/${id}/progress`, {
        is_video_watched: true
      });
      setIsRead(true);
    } catch (e) {
      Swal.fire('Error', 'Gagal menyimpan progres belajar.', 'error');
    } finally {
      setIsMarking(false);
    }
  };

  const triggerPdfDownload = () => {
    if (!material.attachment_path) return;
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      window.open(material.attachment_path, '_blank');
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 2000);
    }, 900);
  };

  const proceedToNextStep = async () => {
    if (!isRead) {
      const result = await Swal.fire({
        title: 'Yakin Ingin Kembali?',
        text: "Kamu belum menandai centang 'Saya Telah Memahami Materi Ini'.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#1a2a4b'
      });
      if (!result.isConfirmed) return;
    }
    // Go back to the step-by-step module details
    navigate(`/siswa/materi/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderBar title="Memuat Materi..." />
        <MaterialDetailSkeleton />
      </div>
    );
  }

  if (!material) return null;

  // Helper to dynamically resolve URL for mobile devices on LAN
  const getDynamicUrl = (url: string) => {
    if (!url) return url;
    return url.replace(/http:\/\/localhost(:\d+)?/g, backendUrl);
  };

  const getFileType = (path: string) => {
    if (!path) return 'unknown';
    const extension = path.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'document';
  };

  const fileType = getFileType(material.attachment_path);

  const extractYoutubeId = (raw?: string | null): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const m = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };
  const validYoutubeId = extractYoutubeId(material.youtube_video_id);

  return (
    <>
    <div className="min-h-screen bg-[#FFFDF8]">
      <HeaderBar title="Isi Materi" backUrl={-1} />

      {/* ─── Main Content ──────────────────────────────────────── */}
      <main className="flex flex-col relative w-full pt-4 pb-safe min-h-screen max-w-3xl mx-auto">
        <div className="flex flex-col w-full pb-10">
          <div className="px-5 py-4 flex flex-col gap-5">
            
            {/* Breadcrumb / Topic Metadata Header */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-blue-500/15 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[11px] font-black tracking-wide uppercase">
                  <AnimatedVisual type="book" className="w-3.5 h-3.5" />
                  <span>{material.topic?.title || 'Materi Pembelajaran'}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold flex items-center gap-1">
                  <Icon name="schedule" className="text-[13px]" /> {material.estimated_read_time || 5} Menit Baca
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                {material.title}
              </h2>
            </div>

            {/* Data-Saver Alert Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4.5 rounded-3xl border-2 border-emerald-200/80 flex items-start gap-3.5 shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-white border-2 border-emerald-200 flex items-center justify-center shrink-0 shadow-xs mt-0.5 p-1">
                <AnimatedVisual type="bolt" className="w-7 h-7" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-950 font-black">Mode Hemat Kuota Aktif</span>
                  <span className="bg-emerald-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black">Aktif</span>
                </div>
                <p className="text-xs font-medium text-emerald-900/80 mt-0.5">
                  Teks dan gambar telah dioptimalkan agar ringan diakses tanpa menyedot kuota internetmu.
                </p>
              </div>
            </div>

            {/* Main Content Body */}
            <article className="flex flex-col gap-5 text-slate-900">
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border-2 border-amber-200/70 flex flex-col gap-3">
                <RichTextRenderer content={material.content_text} />
              </div>

              {/* Facade Video Player */}
              {validYoutubeId && (
                <section className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon name="smart_display" className="text-[20px] text-primary" />
                      <h4 className="font-label-lg text-label-lg text-on-surface font-semibold">Video Tutorial Simulasi</h4>
                    </div>
                    <span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full">Hemat Kuota</span>
                  </div>
                  
                  <div className="relative w-full bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-surface-container-high px-5 py-2 flex items-center justify-between text-on-surface-variant">
                      <span className="font-label-sm text-label-sm flex items-center gap-1 text-on-surface">
                        <Icon name="wifi_off" className="text-[15px] text-secondary" />
                        Video tidak memakan kuota sebelum diklik
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">1080p</span>
                    </div>
                    
                    {!isVideoActive ? (
                      <div 
                        className="relative w-full aspect-video bg-surface-dim overflow-hidden flex items-center justify-center cursor-pointer group"
                        onClick={() => setIsVideoActive(true)}
                      >
                        <img 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          src={`https://img.youtube.com/vi/${validYoutubeId}/hqdefault.jpg`} 
                          alt="Video Thumbnail" 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center gap-2">
                          <button
                            aria-label="Putar Video YouTube"
                            className="w-16 h-16 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg transition-transform active:scale-95 group-hover:scale-110"
                            type="button"
                          >
                            <Icon name="play_arrow" className="" />
                          </button>
                          <div className="bg-inverse-surface/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-inverse-on-surface flex items-center gap-1.5 shadow-md">
                            <Icon name="downloading" className="text-[16px] text-secondary-fixed" />
                            <span className="font-label-sm text-label-sm font-semibold">Putar Video (YouTube Stream)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-black">
                        <iframe 
                          className="w-full h-full" 
                          src={`https://www.youtube-nocookie.com/embed/${validYoutubeId}?autoplay=1&rel=0&modestbranding=1`} 
                          title="Video Tutorial" 
                          frameBorder="0" 
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    <div className="p-3 bg-surface-container-low text-center">
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1">
                        <Icon name="info" className="text-[15px]" />
                        Koneksi streaming video YouTube hanya aktif saat tombol putar ditekan.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Dokumen Materi Lengkap */}
              {material.attachment_path && (
                <section className="flex flex-col gap-2 mt-2">
                  <h4 className="font-label-lg text-label-lg text-on-surface font-semibold flex items-center gap-1.5">
                    <Icon name="attachment" className="text-[20px] text-primary" />
                    Lampiran Materi
                  </h4>
                  
                  <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant/20 overflow-hidden flex flex-col">
                    {/* Preview Panel */}
                    {fileType === 'image' && (
                      <div 
                        className="w-full relative group bg-surface-container overflow-hidden cursor-zoom-in"
                        onClick={() => setIsPreviewModalOpen(true)}
                      >
                        <img 
                          src={getDynamicUrl(material.attachment_path)} 
                          alt="Lampiran Materi" 
                          className="w-full h-48 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-surface/90 backdrop-blur-md text-on-surface font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Icon name="zoom_in" className="text-[18px]" />
                            Lihat Penuh
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {fileType === 'pdf' && (
                      <div className="w-full relative group bg-surface-container overflow-hidden h-48 sm:h-64 cursor-pointer" onClick={() => setIsPreviewModalOpen(true)}>
                        <div className="absolute inset-0 pointer-events-none z-10"></div>
                        <iframe 
                          src={`${getDynamicUrl(material.attachment_path)}#toolbar=0&navpanes=0&scrollbar=0`} 
                          className="w-full h-full border-0 pointer-events-none"
                          title="Preview PDF"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center z-20">
                          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-surface/90 backdrop-blur-md text-on-surface font-bold text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                            <Icon name="zoom_in" className="text-[18px]" />
                            Baca Penuh
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${fileType === 'image' ? 'bg-tertiary-container text-on-tertiary-container' : fileType === 'pdf' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                          <Icon name={fileType === 'image' ? 'image' : fileType === 'pdf' ? 'picture_as_pdf' : 'description'} className="text-[24px]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-lg text-label-lg text-on-surface truncate font-semibold">
                            {material.attachment_path.split('/').pop() || 'Lampiran'}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 uppercase tracking-wider font-bold text-[10px]">
                            {fileType} FILE
                          </span>
                        </div>
                      </div>
                      <div className="flex w-full sm:w-auto gap-2">
                        {(fileType === 'image' || fileType === 'pdf') && (
                          <button
                            className="flex-1 sm:flex-none h-10 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                            onClick={() => setIsPreviewModalOpen(true)}
                            type="button"
                          >
                            <Icon name="visibility" className="text-[18px]" />
                            <span className="sm:hidden">Lihat</span>
                          </button>
                        )}
                        <button
                          className="flex-1 sm:flex-none h-10 px-4 bg-primary/10 hover:bg-primary/20 active:bg-primary/30 text-primary font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          onClick={triggerPdfDownload}
                          type="button"
                        >
                          {isDownloading ? (
                            <>
                              <Icon name="sync" className="text-[18px] animate-spin" />
                              <span>Tunggu...</span>
                            </>
                          ) : downloadSuccess ? (
                            <>
                              <Icon name="check_circle" className="text-[18px]" />
                              <span>Tersimpan</span>
                            </>
                          ) : (
                            <>
                              <Icon name="download" className="text-[18px]" />
                              <span className="sm:hidden">Unduh</span>
                              <span className="hidden sm:inline">Unduh File</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </article>

            {/* Interactive Progress Confirmation */}
            <div className="mt-2 bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-3">
              <label className="min-h-[52px] cursor-pointer flex items-center gap-5 select-none rounded-lg p-2 transition-colors hover:bg-surface-container-low">
                <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                  <input 
                    className="peer sr-only" 
                    type="checkbox" 
                    checked={isRead}
                    disabled={isRead || isMarking}
                    onChange={(e) => handleProgressUpdate(e.target.checked)}
                  />
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isRead ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-transparent'}`}>
                    {isMarking ? (
                      <Icon name="sync" className="text-[20px] animate-spin text-primary" />
                    ) : (
                      <Icon name="check" className="text-[20px] font-bold" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight">
                    SAYA TELAH MEMAHAMI MATERI INI
                  </span>
                  <span className={`font-body-sm text-body-sm transition-colors ${isRead ? 'text-secondary' : 'text-on-surface-variant'}`}>
                    {isRead ? 'Progres materi tercatat tuntas di server e-learning.' : 'Centang untuk memperbarui laporan progres belajar ke Bapak/Ibu Guru.'}
                  </span>
                </div>
              </label>

              {/* Instant feedback pill */}
              {isRead && (
                <div className="bg-secondary-container text-on-secondary-container px-3 py-2 rounded-lg flex items-center justify-between font-label-sm text-label-sm animate-fade-in">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Icon name="cloud_done" className="text-[16px]" />
                    Progres Berhasil Disimpan (Tersinkron)
                  </span>
                  <span className="font-mono">100% Selesai</span>
                </div>
              )}
            </div>

            {/* Main Floating Action CTA */}
            <div className="sticky bottom-4 z-20 pt-2">
              <button
                className={`w-full h-[50px] rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] ${
                  isRead 
                    ? 'bg-primary hover:bg-primary-container active:opacity-95 text-on-primary ring-2 ring-secondary-container' 
                    : 'bg-primary hover:bg-primary-container active:opacity-95 text-on-primary'
                }`}
                onClick={proceedToNextStep}
                type="button"
              >
                <span>{material.quiz ? 'SELESAI & LANJUT KE KUIS' : 'SELESAI & KEMBALI KE MODUL'}</span>
                <Icon name="check_circle" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
      
      {/* Fullscreen Preview Modal */}
      {isPreviewModalOpen && material.attachment_path && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-fade-in">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${fileType === 'image' ? 'bg-tertiary' : 'bg-error'} text-white`}>
                <Icon name={fileType === 'image' ? 'image' : 'picture_as_pdf'} className="text-[20px]" />
              </div>
              <span className="text-white font-semibold truncate text-lg">
                {material.attachment_path.split('/').pop() || 'Pratinjau Dokumen'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={triggerPdfDownload} 
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center transition-colors"
                title="Unduh File"
              >
                <Icon name="download" />
              </button>
              <button 
                onClick={() => setIsPreviewModalOpen(false)} 
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center transition-colors"
                title="Tutup"
              >
                <Icon name="close" />
              </button>
            </div>
          </div>
          
          {/* Modal Body */}
          <div className="flex-1 w-full h-full overflow-auto p-4 sm:p-8 flex items-center justify-center relative">
            {fileType === 'image' && (
              <img 
                src={material.attachment_path} 
                alt="Pratinjau Penuh" 
                className="max-w-full max-h-full object-contain cursor-zoom-out shadow-2xl rounded-sm"
                onClick={() => setIsPreviewModalOpen(false)} 
              />
            )}
            {fileType === 'pdf' && (
              <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <iframe 
                  src={material.attachment_path} 
                  className="w-full flex-1 border-0"
                  title="PDF Viewer"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
