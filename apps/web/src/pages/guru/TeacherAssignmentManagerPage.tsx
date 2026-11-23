import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { api } from '@lms/shared';

import Icon from '../../components/Icon';
import { AssignmentListSkeleton } from '../../components/ui/PageSkeleton';
import { stripMarkdown } from '../../lib/textUtils';
export default function TeacherAssignmentManagerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get('/api/teacher/assignments');
        setAssignments(response.data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="flex flex-col relative w-full max-w-full overflow-x-clip min-h-screen">
      <section className="px-4 sm:px-8 pt-6 pb-4 flex justify-between items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-headline-sm text-lg sm:text-xl text-on-surface font-bold leading-tight">
            Manajemen Tugas
          </h1>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Kelola dan nilai penugasan siswa
          </p>
        </div>
        <button 
          onClick={() => navigate('/guru/tugas/tambah')}
          className="bg-primary text-on-primary px-3.5 py-2.5 rounded-xl font-label-md text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <Icon name="add" className="text-[18px]" />
          <span>Buat Tugas</span>
        </button>
      </section>

      <section className="px-4 sm:px-8 py-3 flex flex-col gap-4">
        {loading ? (
          <AssignmentListSkeleton count={3} />
        ) : assignments.length > 0 ? (
          assignments.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-variant/30 shadow-xs flex flex-col gap-3 w-full overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-on-surface-variant font-label-sm text-xs">
                    {new Date(item.deadline).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {item.target_classes && item.target_classes.length > 0 && (
                    <span className="bg-tertiary/10 text-tertiary px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap">
                      {item.target_classes.length === 4 ? 'Semua Kelas' : item.target_classes.join(', ')}
                    </span>
                  )}
                </div>
                <span className="bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-md font-label-sm text-xs font-bold shrink-0">
                  {item.max_points} Poin
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="font-label-lg text-sm sm:text-base text-on-surface font-bold break-words">
                  {stripMarkdown(item.title)}
                </h3>
                <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant mt-1 line-clamp-2">
                  {stripMarkdown(item.command_text)}
                </p>
              </div>

              <div className="pt-2.5 border-t border-surface-variant/20 flex flex-wrap items-center justify-between gap-2">
                {item.submissions_count && item.submissions_count > 0 ? (
                  <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    <span>
                      {item.submissions_count} siswa telah mengumpulkan{user?.class_name ? ` (${user.class_name})` : ''}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-on-surface-variant/70 italic flex items-center gap-1">
                    <Icon name="inbox" className="text-[15px] shrink-0" />
                    <span>
                      Belum ada siswa yang mengumpulkan{user?.class_name ? ` (${user.class_name})` : ''}
                    </span>
                  </span>
                )}

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <div className="flex items-center gap-0.5">
                    <button 
                      onClick={() => navigate(`/guru/tugas/edit/${item.id}`)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                      title="Edit Tugas"
                    >
                      <Icon name="edit" className="text-[17px]" />
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm('Yakin ingin menghapus tugas ini?')) {
                          try {
                            await api.delete(`/api/teacher/assignments/${item.id}`);
                            setAssignments(assignments.filter(a => a.id !== item.id));
                          } catch (e) {
                            Swal.fire('Gagal', 'Gagal menghapus tugas', 'error');
                          }
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors"
                      title="Hapus Tugas"
                    >
                      <Icon name="delete" className="text-[17px]" />
                    </button>
                  </div>
                  <button 
                    onClick={() => navigate(`/guru/tugas/${item.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-label-md text-xs font-bold hover:bg-primary/20 transition-colors whitespace-nowrap"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-surface-container-lowest rounded-3xl border border-surface-variant/20 shadow-sm">
            <Icon name="assignment" className="text-[48px] text-on-surface-variant/40 mb-2" />
            <p className="text-body-md text-on-surface-variant">Belum ada tugas yang dibuat.</p>
          </div>
        )}
      </section>
    </div>
  );
}
