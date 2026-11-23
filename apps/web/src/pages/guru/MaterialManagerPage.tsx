import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { api } from '@lms/shared';
import { useNavigate } from 'react-router-dom';

import Icon from '../../components/Icon';
import { MaterialListSkeleton } from '../../components/ui/PageSkeleton';
interface Material {
  id: number;
  title: string;
  youtube_video_id: string | null;
  estimated_read_time: number;
  order_number: number;
  target_classes?: string[];
}

interface Topic {
  id: number;
  title: string;
  description: string;
  order_number: number;
  is_active: boolean;
  materials: Material[];
}

export default function MaterialManagerPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/teacher/topics');
      setTopics(res.data);
    } catch (error) {
      console.error('Failed to fetch topics', error);
      Swal.fire('Gagal', 'Gagal memuat daftar topik.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTopic = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Bab?',
      text: 'Yakin ingin menghapus bab ini beserta seluruh materinya? Tindakan ini tidak bisa dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/teacher/topics/${id}`);
        fetchTopics();
        Swal.fire('Terhapus!', 'Bab berhasil dihapus.', 'success');
      } catch (e) {
        Swal.fire('Gagal', 'Gagal menghapus bab.', 'error');
      }
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus Materi?',
      text: 'Yakin ingin menghapus materi ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/teacher/materials/${id}`);
        fetchTopics();
        Swal.fire('Terhapus!', 'Materi berhasil dihapus.', 'success');
      } catch (e) {
        Swal.fire('Gagal', 'Gagal menghapus materi.', 'error');
      }
    }
  };

  const handleAddTopic = async () => {
    const title = prompt('Masukkan Judul Bab Baru:');
    if (!title) return;
    try {
      await api.post('/api/teacher/topics', {
        title,
        description: 'Deskripsi bab baru',
        order_number: topics.length + 1,
        is_active: true
      });
      fetchTopics();
    } catch (e) {
      Swal.fire('Gagal', 'Gagal menambah bab.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col relative w-full max-w-full overflow-x-clip min-h-screen">
        <section className="px-4 sm:px-8 pt-6 pb-4 flex justify-between items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="font-headline-sm text-lg sm:text-xl text-on-surface font-bold leading-tight">
              Manajemen Materi
            </h1>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Kelola silabus dan konten pembelajaran
            </p>
          </div>
        </section>
        <section className="px-4 sm:px-8 py-3">
          <MaterialListSkeleton count={2} />
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-full max-w-full overflow-x-clip min-h-screen">
      <section className="px-4 sm:px-8 pt-6 pb-4 flex justify-between items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-headline-sm text-lg sm:text-xl text-on-surface font-bold leading-tight">
            Manajemen Materi
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Kelola silabus dan konten pembelajaran
          </p>
        </div>
        <button 
          onClick={handleAddTopic}
          className="bg-primary text-on-primary px-3.5 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <Icon name="add" className="text-[18px]" />
          <span>Bab Baru</span>
        </button>
      </section>

      <section className="px-4 sm:px-8 py-3 flex flex-col gap-5">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-surface-container-lowest rounded-3xl p-4 sm:p-6 shadow-sm border border-surface-variant/20 w-full overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3 border-b border-surface-variant/20 pb-3.5 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    Bab {topic.order_number}
                  </span>
                  <h2 className="font-label-lg text-sm sm:text-base font-bold text-on-surface leading-snug break-words">
                    {topic.title}
                  </h2>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                  {topic.description}
                </p>
              </div>
              <div className="flex items-center shrink-0">
                <button 
                  onClick={() => handleDeleteTopic(topic.id)}
                  className="w-8 h-8 flex items-center justify-center text-error hover:bg-error-container/50 rounded-lg transition-colors"
                  title="Hapus Bab"
                >
                  <Icon name="delete" className="text-[18px]" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {topic.materials && topic.materials.length > 0 ? (
                topic.materials.map((mat, idx) => (
                  <div
                    key={mat.id}
                    className="flex items-center justify-between gap-2.5 bg-surface-container p-3 sm:p-4 rounded-2xl border border-surface-variant/15 w-full overflow-hidden"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-label-md text-xs sm:text-sm font-bold text-on-surface leading-snug break-words">
                          {mat.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 font-label-sm text-[11px] text-on-surface-variant">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Icon name="schedule" className="text-[12px] shrink-0" />
                            {mat.estimated_read_time} mnt
                          </span>
                          {mat.youtube_video_id && (
                            <span className="inline-flex items-center gap-1 text-error whitespace-nowrap font-semibold">
                              <Icon name="play_circle" className="text-[12px] shrink-0" />
                              Video
                            </span>
                          )}
                          {mat.target_classes && mat.target_classes.length > 0 && (
                            <span className="inline-flex items-center bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-md font-bold text-[10px] whitespace-nowrap">
                              {mat.target_classes.length === 4 ? 'Semua Kelas' : mat.target_classes.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      <button 
                        onClick={() => navigate(`/guru/materi/edit/${mat.id}`)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                        title="Edit Materi"
                      >
                        <Icon name="edit" className="text-[17px]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors"
                        title="Hapus Materi"
                      >
                        <Icon name="delete" className="text-[17px]" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-body-sm text-on-surface-variant py-2">
                  Belum ada materi di bab ini.
                </p>
              )}
              
              <button 
                onClick={() => navigate(`/guru/materi/tambah?topic_id=${topic.id}`)}
                className="mt-1 flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-primary/40 text-primary font-label-sm text-xs font-bold rounded-xl hover:bg-primary/5 active:scale-[0.99] transition-all"
              >
                <Icon name="add_circle" className="text-[16px]" />
                <span>Tambah Materi</span>
              </button>
            </div>
          </div>
        ))}
        
        {topics.length === 0 && (
          <div className="text-center py-10">
            <Icon name="menu_book" className="text-[48px] text-on-surface-variant/40 mb-2" />
            <p className="text-body-md text-on-surface-variant">Belum ada bab/topik yang dibuat.</p>
          </div>
        )}
      </section>
    </div>
  );
}
