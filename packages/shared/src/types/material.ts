// =============================================================
// Tabel: materials
// Representasi materi pembelajaran (bacaan, video, kuis, tugas)
// =============================================================

export type MaterialType = 'reading' | 'video' | 'quiz' | 'assignment';
export type MaterialFormat = 'pdf' | 'photo' | 'online' | 'video';

export interface Material {
  id: string;
  topic_id: string;                   // FK → topics.id
  title: string;                      // e.g., "Pola Algoritma Sehari-hari"
  type: MaterialType;
  format?: MaterialFormat;            // Format file/konten
  content_url?: string;               // URL konten (jika ada)
  description?: string;               // Deskripsi singkat
  estimated_duration_minutes: number; // Estimasi waktu pengerjaan
  total_pages?: number;               // Jumlah halaman (untuk bacaan)
  points: number;                     // Bobot poin
  deadline?: string;                  // Tenggat waktu (ISO date string)
  order: number;                      // Urutan dalam topik
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Relasi: Material belongsTo Topic via topic_id
// Relasi: Material hasMany StudentProgress via material_id
