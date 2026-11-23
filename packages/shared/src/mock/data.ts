// =============================================================
// Mock Data Fixtures
// Data simulasi untuk development & testing
// =============================================================

import type {
  User,
  SchoolClass,
  Topic,
  Material,
  StudentProgress,
  ProgressSummary,
} from '../types';

// ─── Users ───────────────────────────────────────────────────

export const mockStudents: User[] = [
  {
    id: 'u-student-001',
    identifier_no: '0012345678',
    username: 'ahmad.rizki',
    name: 'Ahmad Rizki',
    role: 'siswa',
    avatar_url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ahmad',
    class_id: 'c-viia',
    is_active: true,
    created_at: '2026-07-15T08:00:00Z',
    updated_at: '2026-09-20T10:30:00Z',
  },
  {
    id: 'u-student-002',
    identifier_no: '0012345679',
    username: 'siti.nurhaliza',
    name: 'Siti Nurhaliza',
    role: 'siswa',
    avatar_url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Siti',
    class_id: 'c-viia',
    is_active: true,
    created_at: '2026-07-15T08:00:00Z',
    updated_at: '2026-09-20T10:30:00Z',
  },
];

export const mockTeachers: User[] = [
  {
    id: 'u-teacher-001',
    identifier_no: '198505012010011001',
    username: 'pak.budi',
    name: 'Budi Santoso, S.Pd.',
    email: 'budi.santoso@smpn3gubug.sch.id',
    role: 'guru',
    avatar_url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Budi',
    is_active: true,
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-09-20T10:30:00Z',
  },
];

// ─── Classes ─────────────────────────────────────────────────

export const mockClasses: SchoolClass[] = [
  {
    id: 'c-viia',
    name: 'VII-A',
    grade: 7,
    academic_year: '2026/2027',
    semester: 'genap',
    teacher_id: 'u-teacher-001',
    student_count: 32,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
  },
  {
    id: 'c-viib',
    name: 'VII-B',
    grade: 7,
    academic_year: '2026/2027',
    semester: 'genap',
    teacher_id: 'u-teacher-001',
    student_count: 30,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
  },
];

// ─── Topics ──────────────────────────────────────────────────

export const mockTopics: Topic[] = [
  {
    id: 't-001',
    title: 'Berpikir Komputasional',
    description:
      'Memahami konsep dasar berpikir komputasional: dekomposisi, pengenalan pola, abstraksi, dan algoritma.',
    class_grade: 7,
    chapter_number: 2,
    total_materials: 5,
    icon: 'psychology',
    created_at: '2026-07-15T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 't-002',
    title: 'Algoritma dan Pemrograman',
    description:
      'Pengantar algoritma: flowchart, pseudocode, dan pemrograman visual sederhana.',
    class_grade: 7,
    chapter_number: 3,
    total_materials: 6,
    icon: 'code',
    created_at: '2026-07-15T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
  },
];

// ─── Materials ───────────────────────────────────────────────

export const mockMaterials: Material[] = [
  {
    id: 'm-001',
    topic_id: 't-001',
    title: 'Pola Algoritma Sehari-hari',
    type: 'reading',
    description:
      'Halaman 18 dari 26 • Sisa estimasi baca sekitar 6 menit lagi.',
    estimated_duration_minutes: 20,
    total_pages: 26,
    points: 50,
    order: 1,
    is_published: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-09-10T00:00:00Z',
  },
  {
    id: 'm-002',
    topic_id: 't-002',
    title: 'Algoritma Pemrograman Sederhana',
    type: 'assignment',
    format: 'pdf',
    description:
      'Membuat diagram alir (flowchart) pengambilan keputusan lampu lalu lintas persimpangan jalan...',
    estimated_duration_minutes: 45,
    points: 100,
    deadline: '2026-09-24T23:59:00+07:00',
    order: 1,
    is_published: true,
    created_at: '2026-08-15T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z',
  },
  {
    id: 'm-003',
    topic_id: 't-001',
    title: 'Dekomposisi Masalah',
    type: 'reading',
    estimated_duration_minutes: 15,
    total_pages: 18,
    points: 30,
    order: 2,
    is_published: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-09-10T00:00:00Z',
  },
  {
    id: 'm-004',
    topic_id: 't-001',
    title: 'Kuis: Pengenalan Pola',
    type: 'quiz',
    estimated_duration_minutes: 15,
    points: 40,
    order: 3,
    is_published: true,
    created_at: '2026-08-05T00:00:00Z',
    updated_at: '2026-09-15T00:00:00Z',
  },
];

// ─── Student Progress ────────────────────────────────────────

export const mockProgress: StudentProgress[] = [
  {
    id: 'sp-001',
    student_id: 'u-student-001',
    material_id: 'm-001',
    status: 'in_progress',
    current_page: 18,
    time_spent_minutes: 14,
    updated_at: '2026-09-22T14:30:00Z',
  },
  {
    id: 'sp-002',
    student_id: 'u-student-001',
    material_id: 'm-002',
    status: 'not_started',
    time_spent_minutes: 0,
    updated_at: '2026-09-20T08:00:00Z',
  },
  {
    id: 'sp-003',
    student_id: 'u-student-001',
    material_id: 'm-003',
    status: 'completed',
    current_page: 18,
    score: 85,
    time_spent_minutes: 18,
    completed_at: '2026-09-18T10:00:00Z',
    updated_at: '2026-09-18T10:00:00Z',
  },
  {
    id: 'sp-004',
    student_id: 'u-student-001',
    material_id: 'm-004',
    status: 'completed',
    score: 90,
    time_spent_minutes: 12,
    completed_at: '2026-09-19T11:30:00Z',
    updated_at: '2026-09-19T11:30:00Z',
  },
];

// ─── Aggregated Summary ──────────────────────────────────────

export function getProgressSummary(
  studentId: string,
  progressList: StudentProgress[] = mockProgress,
  materialsList: Material[] = mockMaterials
): ProgressSummary {
  const studentProgress = progressList.filter(
    (p) => p.student_id === studentId
  );

  const totalActivities = materialsList.filter((m) => m.is_published).length;
  const completed = studentProgress.filter(
    (p) => p.status === 'completed'
  ).length;
  const inProgress = studentProgress.filter(
    (p) => p.status === 'in_progress'
  ).length;
  const notStarted = totalActivities - completed - inProgress;

  const scores = studentProgress
    .filter((p) => p.score !== undefined)
    .map((p) => p.score!);
  const avgScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    total_activities: totalActivities,
    completed_activities: completed,
    in_progress_activities: inProgress,
    not_started_activities: notStarted,
    completion_percentage: Math.round((completed / totalActivities) * 100),
    average_score: Math.round(avgScore),
  };
}
