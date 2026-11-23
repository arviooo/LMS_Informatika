// =============================================================
// Tabel: topics
// Representasi bab/topik pembelajaran informatika
// =============================================================

export interface Topic {
  id: string;
  title: string;            // e.g., "Berpikir Komputasional"
  description: string;      // Deskripsi singkat topik
  class_grade: number;      // Untuk kelas berapa (7, 8, 9)
  chapter_number: number;   // Nomor bab (urutan)
  total_materials: number;  // Jumlah materi dalam topik
  icon?: string;            // Material Symbols icon name
  created_at: string;
  updated_at: string;
}

// Relasi: Topic hasMany Material via topic_id
// Relasi: Topic belongsTo grade level (class_grade)
