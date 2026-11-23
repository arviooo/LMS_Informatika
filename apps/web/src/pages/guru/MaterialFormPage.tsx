import Swal from 'sweetalert2';
import { useState, useEffect } from 'react';
import { api } from '@lms/shared';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import Icon from '../../components/Icon';
import { FormPageSkeleton } from '../../components/ui/PageSkeleton';
import RichTextEditor from '../../components/ui/RichTextEditor';
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  temp_id: string;
  question_text: string;
  points: number;
  correct_answer: string;
  options: QuizOption[];
}

export default function MaterialFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const initialTopicId = searchParams.get('topic_id');
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [targetClasses, setTargetClasses] = useState<string[]>([]);
  const availableClasses = ['VII-A', 'VII-B', 'VII-C', 'VII-D'];
  
  const [formData, setFormData] = useState({
    topic_id: initialTopicId || '',
    title: '',
    content_text: '',
    youtube_video_id: '',
    estimated_read_time: 15,
    order_number: 1,
    attachment_path: ''
  });

  const [quizData, setQuizData] = useState({
    duration_minutes: 30,
    passing_grade: 75,
    status: 'draft',
    questions: [] as QuizQuestion[]
  });

  // Track the question currently expanded for editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [topics, setTopics] = useState<{id: number, title: string}[]>([]);

  useEffect(() => {
    fetchTopics();
    if (isEdit) {
      fetchMaterial();
    }
  }, [id]);

  // Fetch quiz whenever material id changes (if isEdit)
  useEffect(() => {
    if (isEdit && id) {
      fetchQuiz(id);
    }
  }, [id, isEdit]);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/api/teacher/topics');
      setTopics(res.data);
      if (!isEdit && !formData.topic_id && res.data.length > 0) {
        setFormData(prev => ({ ...prev, topic_id: String(res.data[0].id) }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMaterial = async () => {
    try {
      const res = await api.get(`/api/teacher/materials/${id}`);
      setFormData({
        topic_id: String(res.data.topic_id),
        title: res.data.title,
        content_text: res.data.content_text,
        youtube_video_id: res.data.youtube_video_id || '',
        estimated_read_time: res.data.estimated_read_time,
        order_number: res.data.order_number,
        attachment_path: res.data.attachment_path || ''
      });
      if (res.data.target_classes) {
        setTargetClasses(res.data.target_classes);
      }
    } catch (e) {
      Swal.fire('Gagal', 'Gagal memuat materi', 'error');
      navigate('/guru/materi');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuiz = async (materialId: string) => {
    try {
      const res = await api.get(`/api/teacher/materials/${materialId}/quiz`);
      if (res.data) {
        setQuizData({
          duration_minutes: res.data.duration_minutes,
          passing_grade: res.data.passing_grade,
          status: res.data.status,
          questions: res.data.questions.map((q: any) => ({
            temp_id: Math.random().toString(36).substr(2, 9),
            question_text: q.question_text,
            points: q.points,
            correct_answer: q.correct_answer,
            options: q.options || [
              { id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }
            ]
          }))
        });
      } else {
        // Reset quiz if no quiz exists for this material
        setQuizData({
          duration_minutes: 30,
          passing_grade: 75,
          status: 'draft',
          questions: []
        });
      }
    } catch (e) {
      console.error('Failed to fetch quiz', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Save Material
      const fd = new FormData();
      fd.append('topic_id', formData.topic_id);
      fd.append('title', formData.title);
      fd.append('content_text', formData.content_text);
      fd.append('estimated_read_time', formData.estimated_read_time.toString());
      fd.append('order_number', formData.order_number.toString());
      if (formData.youtube_video_id) {
        fd.append('youtube_video_id', formData.youtube_video_id);
      }
      if (selectedFile) {
        fd.append('attachment', selectedFile);
      }
      
      targetClasses.forEach((cls) => {
        fd.append('target_classes[]', cls);
      });

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      let materialId = id;
      if (isEdit) {
        fd.append('_method', 'PUT');
        await api.post(`/api/teacher/materials/${id}`, fd, config);
      } else {
        const matRes = await api.post('/api/teacher/materials', fd, config);
        materialId = matRes.data.id;
      }

      // 2. Save Quiz
      await api.post('/api/teacher/quizzes', {
        topic_id: formData.topic_id,
        material_id: materialId,
        passing_grade: quizData.passing_grade,
        duration_minutes: quizData.duration_minutes,
        status: status,
        questions: quizData.questions
      });

      Swal.fire('Sukses', `Berhasil menyimpan materi dan kuis sebagai ${status === 'draft' ? 'Draf' : 'Terbit'}`, 'success');
      navigate('/guru/materi');
    } catch (e: any) {
      console.error(e);
      Swal.fire('Gagal', 'Gagal menyimpan materi dan kuis. Pastikan semua field terisi benar.', 'error');
      setIsSaving(false);
    }
  };

  const handleAddQuestion = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setQuizData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          temp_id: newId,
          question_text: '',
          points: 10,
          correct_answer: 'A',
          options: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' },
          ]
        }
      ]
    }));
    setEditingQuestionId(newId);
    setActiveStep(2);
  };

  const updateQuestion = (tempId: string, updates: Partial<QuizQuestion>) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.temp_id === tempId ? { ...q, ...updates } : q)
    }));
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.temp_id !== questionId) return q;
        return {
          ...q,
          options: q.options.map(opt => opt.id === optionId ? { ...opt, text } : opt)
        };
      })
    }));
  };

  const removeQuestion = (tempId: string) => {
    if (!window.confirm("Hapus soal ini?")) return;
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.temp_id !== tempId)
    }));
    if (editingQuestionId === tempId) {
      setEditingQuestionId(null);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  return (
    <div className="flex flex-col relative w-full min-h-screen px-5 sm:px-8 py-6">
      <div className="flex flex-col w-full space-y-6">
        
        {/* Header Context Badge */}
        <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <Icon name="auto_stories" className="" />
            <div className="truncate flex flex-col gap-0.5">
              <span className="text-[10px] text-primary uppercase font-bold tracking-wider block">Informatika Kelas VII</span>
              <span className="text-base sm:text-lg text-on-surface truncate font-bold block">{isEdit ? 'Edit Materi & Kuis' : 'Buat Materi & Kuis'}</span>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${quizData.status === 'published' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-primary'}`}>
            <Icon name={quizData.status === 'published' ? 'check_circle' : 'offline_pin'} className="text-[16px]" />
            <span className="hidden sm:inline">{quizData.status === 'published' ? 'Sudah Terbit' : 'Mode Draf'}</span>
            <span className="sm:hidden">{quizData.status === 'published' ? 'Terbit' : 'Draf'}</span>
          </span>
        </div>

        {/* Interactive Segmented Step Navigation */}
        <div className="grid grid-cols-2 p-1.5 bg-surface-container rounded-xl gap-1.5 shadow-inner">
          <button 
            type="button"
            onClick={() => setActiveStep(1)}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg transition-all duration-300 ${activeStep === 1 ? 'bg-surface-container-lowest text-primary shadow-sm scale-100' : 'text-on-surface-variant hover:text-on-surface scale-[0.98]'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${activeStep === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>1</span>
            <span className="text-sm font-bold truncate">Info Materi</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveStep(2)}
            className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg transition-all duration-300 ${activeStep === 2 ? 'bg-surface-container-lowest text-primary shadow-sm scale-100' : 'text-on-surface-variant hover:text-on-surface scale-[0.98]'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${activeStep === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>2</span>
            <span className="text-sm font-bold truncate">Butir Kuis</span>
          </button>
        </div>

        <form onSubmit={e => handleSubmit(e, 'published')} className="flex flex-col gap-6">
          
          {/* STEP 1: FORMULIR MATERI PELAJARAN */}
          <div className={`flex flex-col space-y-6 transition-all duration-300 ${activeStep === 1 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
            
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-surface-variant/20">
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-on-surface-variant font-bold flex items-center gap-1">
                  Judul Materi / Topik <span className="text-error">*</span>
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full h-12 px-4 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:font-normal placeholder:text-on-surface-variant/60" 
                  placeholder="Contoh: Pengenalan Algoritma" 
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm text-on-surface-variant font-bold flex items-center gap-1">
                  Bab / Unit Pembelajaran <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <select 
                    required
                    value={formData.topic_id}
                    onChange={e => setFormData({...formData, topic_id: e.target.value})}
                    className="w-full h-12 px-4 pr-10 bg-surface-container-low rounded-xl text-sm text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  >
                    <option value="" disabled>-- Pilih Bab --</option>
                    {topics.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  <Icon name="expand_more" className="absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[24px]" />
                </div>
              </div>

              {/* Opsi Kelas */}
              <div className="flex flex-col space-y-3">
                <label className="text-sm text-on-surface-variant font-bold">
                  Target Kelas (Opsional)
                </label>
                <p className="text-xs text-on-surface-variant">Jika dikosongkan, materi akan diberikan ke <strong>Semua Kelas</strong> secara default.</p>
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

              <div className="flex flex-col space-y-2">
                <RichTextEditor
                  id="content_text"
                  label="Deskripsi & Panduan Belajar *"
                  value={formData.content_text}
                  onChange={(val) => setFormData({ ...formData, content_text: val })}
                  placeholder="Tuliskan tujuan pembelajaran dan instruksi belajar siswa. Gunakan format judul, tebal, miring, daftar poin, dan tab pratinjau..."
                  minHeight="180px"
                  helperText="Format teks akan tampil rapi dan tertata saat diakses oleh siswa."
                />
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-surface-variant/20">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <Icon name="layers" className="" />
                  Lampiran Belajar
                </span>
                <span className="text-[10px] sm:text-xs text-on-surface-variant font-bold bg-surface-container-low px-2.5 py-1 rounded-lg">Hemat Kuota Ready</span>
              </div>
              
              <div className="flex flex-col space-y-2 pb-4 border-b border-surface-variant/20">
                <label className="text-sm text-on-surface-variant font-bold">ID Video YouTube (Opsional)</label>
                <div className="flex items-center gap-2">
                  <span className="bg-surface-container-high px-3 h-12 rounded-xl flex items-center justify-center text-sm font-medium text-on-surface-variant border border-transparent">
                    youtube.com/watch?v=
                  </span>
                  <input 
                    type="text" 
                    value={formData.youtube_video_id}
                    onChange={e => setFormData({...formData, youtube_video_id: e.target.value})}
                    className="flex-1 h-12 px-4 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" 
                    placeholder="Contoh: dQw4w9WgXcQ" 
                  />
                </div>
              </div>

              <label className="bg-surface-container-low rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-colors hover:bg-surface-container-highest border-2 border-dashed border-outline-variant/60">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                  <Icon name="cloud_upload" className="text-[28px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-on-surface">Unggah Lampiran (Opsional)</span>
                  <span className="text-xs text-on-surface-variant font-medium">Gambar, PDF, DOCX (Maks. 10MB)</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*,.pdf,.docx,.doc"
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }} 
                />
              </label>
              
              {(selectedFile || formData.attachment_path) && (
                <div className="mt-2 bg-surface-container-low p-3 rounded-xl flex items-center justify-between border border-surface-variant/30 hover:border-error/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {(() => {
                      const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : formData.attachment_path;
                      const isImage = selectedFile ? selectedFile.type.startsWith('image/') : formData.attachment_path.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
                      const displayFileName = selectedFile ? selectedFile.name : formData.attachment_path.split('/').pop() || 'Lampiran Tersimpan';
                      
                      return (
                        <>
                          {isImage ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0 shadow-sm border border-outline-variant/30">
                              <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20">
                              <Icon name="description" className="text-[28px]" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 gap-0.5">
                            <span className="text-sm text-on-surface truncate font-bold">{displayFileName}</span>
                            {!selectedFile && <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded w-fit">Sudah Tersimpan</span>}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <button 
                    onClick={() => { setSelectedFile(null); setFormData({...formData, attachment_path: ''}) }}
                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors rounded-full flex-shrink-0" 
                    type="button"
                    title="Hapus Lampiran"
                  >
                    <Icon name="delete_outline" className="text-[22px]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: FORMULIR SOAL KUIS INTERAKTIF */}
          <div className={`flex flex-col space-y-6 transition-all duration-300 ${activeStep === 2 ? 'opacity-100 translate-x-0' : 'hidden'}`}>
            
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-highest">
              <div className="flex flex-col gap-0.5">
                <span className="text-xl font-bold text-on-surface">Kelola Butir Kuis</span>
                <span className="text-sm text-on-surface-variant font-medium">Topik: {topics.find(t => t.id === Number(formData.topic_id))?.title || '-'}</span>
              </div>
              <button 
                type="button"
                onClick={handleAddQuestion}
                className="h-10 px-4 bg-secondary-container text-on-secondary-container rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-secondary/30 active:scale-95 transition-all" 
              >
                <Icon name="add" className="text-[20px]" />
                <span className="hidden sm:inline">Tambah Soal</span>
                <span className="sm:hidden">Tambah</span>
              </button>
            </div>

            {quizData.questions.length === 0 && (
              <div className="bg-surface-container-low p-8 rounded-3xl text-center flex flex-col items-center gap-3">
                <Icon name="assignment_turned_in" className="text-[48px] text-outline-variant" />
                <p className="text-on-surface-variant font-medium">Belum ada butir soal. Klik 'Tambah Soal' untuk membuat.</p>
              </div>
            )}

            {quizData.questions.map((q, index) => {
              const isEditing = editingQuestionId === q.temp_id;
              
              if (!isEditing) {
                // Mode Ringkas
                return (
                  <div key={q.temp_id} className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl shadow-sm flex items-center justify-between border border-surface-variant/30 hover:border-primary/40 transition-colors group">
                    <div className="flex items-center gap-5 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant text-sm flex items-center justify-center font-bold flex-shrink-0">{index + 1}</span>
                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-sm text-on-surface font-bold truncate">{q.question_text || '(Soal belum ditulis)'}</span>
                        <span className="text-[11px] font-bold text-on-surface-variant">Kunci: {q.correct_answer} • <span className="text-primary">{q.points} Poin</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                      <button onClick={() => setEditingQuestionId(q.temp_id)} className="w-9 h-9 rounded-xl bg-surface-container-low text-primary flex items-center justify-center hover:bg-primary-container transition-colors" title="Edit Soal" type="button">
                        <Icon name="edit" className="text-[18px]" />
                      </button>
                      <button onClick={() => removeQuestion(q.temp_id)} className="w-9 h-9 rounded-xl bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-on-error transition-colors" title="Hapus Soal" type="button">
                        <Icon name="delete" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                );
              }

              // Mode Edit
              return (
                <div key={q.temp_id} className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary text-on-primary text-sm flex items-center justify-center font-bold shadow-sm">{index + 1}</span>
                      <span className="text-base font-bold text-on-surface">Edit Soal</span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-variant/30">
                      <span className="text-xs text-on-surface-variant font-bold">Bobot:</span>
                      <input 
                        className="w-8 text-center text-sm font-black text-primary bg-transparent focus:outline-none" 
                        type="number" 
                        value={q.points}
                        onChange={(e) => updateQuestion(q.temp_id, { points: Number(e.target.value) })}
                      />
                      <span className="text-xs text-on-surface-variant font-bold">Poin</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <label className="text-sm text-on-surface-variant font-bold">Kalimat Soal</label>
                    <textarea 
                      required
                      className="w-full p-4 bg-surface-container-low rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-y" 
                      rows={3} 
                      value={q.question_text}
                      onChange={(e) => updateQuestion(q.temp_id, { question_text: e.target.value })}
                      placeholder="Masukkan pertanyaan..."
                    ></textarea>
                  </div>

                  <div className="flex flex-col space-y-2.5">
                    <span className="text-sm text-on-surface-variant font-bold flex items-center justify-between mb-1">
                      <span>Opsi Jawaban & Kunci</span>
                      <span className="text-secondary text-xs font-bold flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded-full border border-secondary/20">
                        <Icon name="radio_button_checked" className="text-[16px]" /> Ketuk lingkaran untuk kunci
                      </span>
                    </span>
                    
                    {q.options.map(opt => (
                      <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${q.correct_answer === opt.id ? 'bg-secondary-container/20 border-2 border-secondary/50 shadow-sm relative overflow-hidden' : 'bg-surface-container-low hover:bg-surface-container-highest border border-transparent'}`}>
                        {q.correct_answer === opt.id && <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-secondary"></div>}
                        <input 
                          className={`w-5 h-5 flex-shrink-0 ${q.correct_answer === opt.id ? 'text-secondary accent-secondary' : 'text-primary accent-primary'}`} 
                          name={`kunci-soal-${q.temp_id}`} 
                          type="radio" 
                          checked={q.correct_answer === opt.id}
                          onChange={() => updateQuestion(q.temp_id, { correct_answer: opt.id })}
                        />
                        <span className={`w-6 text-sm font-bold ${q.correct_answer === opt.id ? 'text-secondary' : 'text-on-surface-variant'}`}>{opt.id}.</span>
                        <input 
                          required
                          className={`w-full bg-transparent text-sm focus:outline-none ${q.correct_answer === opt.id ? 'text-on-surface font-bold' : 'text-on-surface font-medium'}`} 
                          type="text" 
                          value={opt.text}
                          onChange={(e) => updateOption(q.temp_id, opt.id, e.target.value)}
                          placeholder={`Jawaban ${opt.id}`}
                        />
                        {q.correct_answer === opt.id && (
                          <Icon name="check_circle" className="" />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="button" 
                      onClick={() => setEditingQuestionId(null)}
                      className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-sm font-bold rounded-lg transition-colors"
                    >
                      Tutup Editor Soal
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pengaturan Ujian */}
            <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col space-y-6 border border-surface-variant/20 mt-4">
              <span className="text-base font-bold text-on-surface flex items-center gap-2 border-b border-surface-container-high pb-3">
                <Icon name="tune" className="text-primary text-[24px]" />
                Konfigurasi Pelaksanaan
              </span>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">Batas Waktu Kuis</span>
                  <span className="text-xs text-on-surface-variant mt-1 font-medium">Hitungan mundur saat mulai</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-variant/20">
                  <Icon name="timer" className="text-on-surface-variant text-[20px]" />
                  <input 
                    className="w-12 text-center text-sm font-black text-on-surface bg-transparent focus:outline-none" 
                    type="number" 
                    value={quizData.duration_minutes}
                    onChange={(e) => setQuizData({...quizData, duration_minutes: Number(e.target.value)})}
                  />
                  <span className="text-xs text-on-surface-variant font-bold">Menit</span>
                </div>
              </div>
            </div>
          </div>

          {/* STICKY BOTTOM ACTIONS FOR TEACHER */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={isSaving}
                className="h-12 sm:h-14 px-4 rounded-xl bg-surface-container-lowest text-on-surface-variant text-sm font-bold flex items-center justify-center gap-2 shadow-sm border border-surface-container-high hover:bg-surface-container-low hover:text-on-surface active:scale-95 transition-all"
              >
                <Icon name="save_as" className="text-[20px] sm:text-[24px]" />
                Simpan Draf
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className={`h-12 sm:h-14 px-4 rounded-xl text-on-primary text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${isSaving ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-fixed-variant'}`}
              >
                {isSaving ? (
                  <Icon name="progress_activity" className="animate-spin text-[20px] sm:text-[24px]" />
                ) : (
                  <Icon name="send" className="text-[20px] sm:text-[24px]" />
                )}
                {isSaving ? 'Menyimpan...' : 'Terbitkan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
