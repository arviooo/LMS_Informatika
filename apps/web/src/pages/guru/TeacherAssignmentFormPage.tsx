import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@lms/shared';

import Icon from '../../components/Icon';
import { FormPageSkeleton } from '../../components/ui/PageSkeleton';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { stripMarkdown } from '../../lib/textUtils';
export default function TeacherAssignmentFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);
  
  const [instruction, setInstruction] = useState('');
  const [title, setTitle] = useState('');
  const [commandText, setCommandText] = useState('');
  const [maxPoints, setMaxPoints] = useState('100');
  const [deadline, setDeadline] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  
  const [targetClasses, setTargetClasses] = useState<string[]>([]);
  const availableClasses = ['VII-A', 'VII-B', 'VII-C', 'VII-D'];

  const templateInstruksi = `1. Kerjakan tugas ini dengan teliti sesuai materi yang telah dipelajari.
2. Buat jawabanmu di buku tulis, atau kerjakan di aplikasi pilihanmu (Canva, Word, dll).
3. Jika di buku tulis, foto hasil pekerjaanmu dengan pencahayaan yang terang agar mudah dibaca.
4. Pastikan mencantumkan Nama Lengkap, Kelas, dan Nomor Absen di bagian atas lembar tugas.
5. Simpan dan unggah dalam format PDF atau Gambar (JPG/PNG) dengan ukuran maksimal 15 MB.`;

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/teacher/assignments/${id}`)
        .then(res => {
          setTitle(stripMarkdown(res.data.title));
          setCommandText(stripMarkdown(res.data.command_text));
          setInstruction(res.data.instruction || '');
          setMaxPoints(res.data.max_points.toString());
          // Convert deadline format to local datetime-local string
          const deadlineDate = new Date(res.data.deadline);
          // Set to format YYYY-MM-DDTHH:MM
          const offset = deadlineDate.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(deadlineDate.getTime() - offset)).toISOString().slice(0, 16);
          setDeadline(localISOTime);
          
          if (res.data.target_classes) {
            setTargetClasses(res.data.target_classes);
          }
        })
        .catch(e => {
          Swal.fire('Gagal', 'Gagal memuat tugas', 'error');
          navigate('/guru/tugas');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id, navigate, isEdit]);

  const handleUseTemplate = () => {
    setInstruction(templateInstruksi);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('title', stripMarkdown(title));
      formData.append('command_text', stripMarkdown(commandText));
      formData.append('instruction', instruction);
      formData.append('deadline', deadline);
      formData.append('max_points', maxPoints);
      if (attachment) {
        formData.append('attachment', attachment);
      }
      
      targetClasses.forEach((cls) => {
        formData.append('target_classes[]', cls);
      });
      
      if (isEdit) {
        formData.append('_method', 'PUT');
        await api.post(`/api/teacher/assignments/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/teacher/assignments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      navigate('/guru/tugas');
    } catch (error) {
      console.error('Error saving assignment:', error);
      Swal.fire('Sukses', 'Terjadi kesalahan saat menyimpan tugas.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  return (
    <div className="flex flex-col relative w-full min-h-screen px-5 sm:px-8 py-6">
      <div className="flex flex-col w-full space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface"
          >
            <Icon name="arrow_back" className="text-[24px]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-on-surface leading-tight">{isEdit ? 'Edit Tugas' : 'Buat Tugas Baru'}</h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">Berikan tugas, atur tenggat waktu, dan beri instruksi</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Card 1: Informasi Dasar */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-surface-variant/20">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-surface-variant/20 pb-4">
              <Icon name="edit_document" className="" />
              Informasi Utama
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2 flex flex-col space-y-2">
                <label className="text-sm text-on-surface-variant font-bold">
                  Judul Tugas <span className="text-error">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:font-normal placeholder:text-on-surface-variant/60" 
                  placeholder="Contoh: Tugas Praktik 2: Membuat Flowchart" 
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-on-surface-variant font-bold">Poin Maksimal</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(e.target.value)}
                    className="w-full h-12 px-4 pl-12 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium font-mono" 
                  />
                  <Icon name="stars" className="absolute left-3 top-3 text-primary text-[24px]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="command_text" className="text-sm text-on-surface-variant font-bold">
                Sub Judul / Ringkasan Tugas <span className="text-error">*</span>
              </label>
              <textarea
                id="command_text"
                required
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                className="w-full p-4 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium leading-relaxed resize-y placeholder:font-normal placeholder:text-on-surface-variant/60 min-h-[100px]"
                placeholder="Tuliskan ringkasan atau sub judul singkat tugas (contoh: Membuat poster tentang Berpikir Komputasional)..."
              />
              <p className="text-xs text-on-surface-variant/80 font-medium">
                Teks ini tampil langsung sebagai ringkasan di bawah judul tugas pada daftar tugas siswa (tanpa tanda format seperti **).
              </p>
            </div>
          </div>

          {/* Card 2: Pengaturan Kelas, Waktu & File Lampiran */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-surface-variant/20">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 border-b border-surface-variant/20 pb-4">
              <Icon name="settings" className="" />
              Pengaturan Tambahan
            </h2>

            {/* Opsi Kelas */}
            <div className="flex flex-col space-y-3">
              <label className="text-sm text-on-surface-variant font-bold">
                Target Kelas (Opsional)
              </label>
              <p className="text-xs text-on-surface-variant">Jika dikosongkan, tugas akan diberikan ke <strong>Semua Kelas</strong> secara default.</p>
              <div className="flex flex-wrap gap-3">
                {availableClasses.map((cls) => {
                  const isChecked = targetClasses.includes(cls);
                  return (
                    <label key={cls} className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer border transition-all ${isChecked ? 'bg-primary text-on-primary border-primary shadow-sm' : 'bg-surface-container-low text-on-surface-variant border-transparent hover:bg-surface-container'}`}>
                      <input 
                        type="checkbox"
                        className="hidden"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setTargetClasses(targetClasses.filter(c => c !== cls));
                          } else {
                            setTargetClasses([...targetClasses, cls]);
                          }
                        }}
                      />
                      <span className="font-bold text-sm">{cls}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 border-t border-surface-variant/20 pt-6">
              <div className="flex-1 flex flex-col space-y-2">
                <label className="text-sm text-on-surface-variant font-bold">Batas Waktu Pengumpulan (Tenggat)</label>
                <div className="relative">
                  <input 
                    type="datetime-local" 
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col space-y-2">
                <label className="text-sm text-on-surface-variant font-bold flex items-center justify-between">
                  File/Gambar Lampiran
                  <span className="text-[10px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded">Opsional</span>
                </label>
                <label className="h-12 w-full bg-surface-container-low border border-dashed border-outline-variant/60 rounded-xl flex items-center justify-center gap-2 text-primary text-sm font-bold cursor-pointer hover:bg-surface-container-highest transition-colors active:scale-95">
                  <Icon name="upload_file" className="text-[20px]" />
                  {attachment ? attachment.name : "Unggah Gambar/Berkas"}
                  <input 
                    type="file" 
                    accept="image/*,.pdf,.doc,.docx" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachment(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Card 3: Instruksi Pengerjaan */}
          <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-surface-variant/20">
            <div className="flex items-center justify-between border-b border-surface-variant/20 pb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Icon name="list_alt" className="" />
                Instruksi Pengerjaan
              </h2>
              <button 
                type="button" 
                onClick={handleUseTemplate}
                className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-secondary/20 transition-colors"
              >
                <Icon name="magic_button" className="text-[16px]" />
                Gunakan Template Default
              </button>
            </div>

            <div className="flex flex-col space-y-2">
              <RichTextEditor
                id="instruction"
                label="Panduan Langkah Demi Langkah *"
                value={instruction}
                onChange={setInstruction}
                placeholder="Tuliskan petunjuk pengerjaan langkah demi langkah agar siswa tidak kebingungan..."
                minHeight="160px"
                helperText="Gunakan toolbar format (tebal, nomor, daftar butir) agar panduan mudah dibaca siswa di layar HP."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 pb-10">
            <div className="flex gap-4">
              <button 
                type="submit"
                disabled={isSaving}
                className={`flex-1 h-14 px-4 rounded-xl text-on-primary text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${isSaving ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-fixed-variant'}`}
              >
                {isSaving ? (
                  <Icon name="progress_activity" className="animate-spin text-[24px]" />
                ) : (
                  <Icon name="send" className="text-[24px]" />
                )}
                {isSaving ? 'Menyimpan...' : 'Terbitkan Tugas'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
