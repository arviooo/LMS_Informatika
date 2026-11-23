// =============================================================
// Tabel: classes
// Representasi kelas sekolah (VII-A, VII-B, VIII-A, dst.)
// =============================================================

export type Semester = 'ganjil' | 'genap';

export interface SchoolClass {
  id: string;
  name: string;             // e.g., "VII-A", "VIII-B"
  grade: number;            // 7, 8, atau 9
  academic_year: string;    // e.g., "2026/2027"
  semester: Semester;
  teacher_id: string;       // FK → users.id (wali kelas / guru informatika)
  student_count?: number;   // Jumlah siswa terdaftar
  created_at: string;
  updated_at: string;
}

// Relasi: SchoolClass belongsTo User (teacher) via teacher_id
// Relasi: SchoolClass hasMany User (students) via class_id
// Relasi: SchoolClass hasMany Topic via class_grade
