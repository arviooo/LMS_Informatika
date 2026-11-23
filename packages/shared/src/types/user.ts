// =============================================================
// Tabel: users
// Representasi data pengguna LMS (Siswa, Guru)
// =============================================================

export type UserRole = 'siswa' | 'guru';

export interface User {
  id: string;
  class_id?: string | null;
  attendance_number?: string | null;
  identifier_no: string;    // 10 digit NISN (siswa), NIP (guru)
  username: string;         // username alternatif (opsional)
  name: string;             // Nama lengkap
  role: UserRole;
  class_name?: string | null;
  semester?: string | null;
  avatar_url?: string | null;      
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Relasi: User belongsTo StudyClass (via class_id)
// Relasi: User (student) hasMany StudentProgress
