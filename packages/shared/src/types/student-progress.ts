// =============================================================
// Tabel: student_progress
// Representasi progres siswa per materi
// =============================================================

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudentProgress {
  id: string;
  student_id: string;       // FK → users.id
  material_id: string;      // FK → materials.id
  status: ProgressStatus;
  current_page?: number;    // Halaman terakhir dibaca
  score?: number;           // Skor (0-100), null jika belum selesai
  time_spent_minutes: number; // Total waktu yang dihabiskan
  completed_at?: string;    // Tanggal selesai (ISO date string)
  updated_at: string;
}

// Aggregasi: Dari tabel ini bisa dihitung:
// - Total aktivitas selesai per siswa
// - Persentase progres keseluruhan
// - Rata-rata skor
// - Materi yang sedang dikerjakan (in_progress)

export interface ProgressSummary {
  total_activities: number;
  completed_activities: number;
  in_progress_activities: number;
  not_started_activities: number;
  completion_percentage: number;
  average_score: number;
}

// Relasi: StudentProgress belongsTo User (student) via student_id
// Relasi: StudentProgress belongsTo Material via material_id
