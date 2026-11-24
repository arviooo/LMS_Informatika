<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeacherStudentController extends Controller
{
    private function normalizeClass(?string $cls): string
    {
        return strtolower(str_replace(['-', ' '], '', $cls ?? ''));
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = User::where('role', 'siswa');

        if ($user && $user->class_name) {
            $norm = $this->normalizeClass($user->class_name);
            $query->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
        } else {
            $className = $request->query('class', 'VII A');
            if ($className !== 'Semua Kelas') {
                $norm = $this->normalizeClass($className);
                $query->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
            }
        }
            
        $students = $query->orderBy('name')->get();
            
        return response()->json($students);
    }

    private function buildGradesCollection(?User $user, string $requestedClass = 'VII A')
    {
        $query = User::where('role', 'siswa')
                     ->with(['quizAttempts.quiz.material', 'assignmentSubmissions.assignment']);

        if ($user && $user->class_name) {
            $norm = $this->normalizeClass($user->class_name);
            $query->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
        } else {
            if ($requestedClass !== 'Semua Kelas') {
                $norm = $this->normalizeClass($requestedClass);
                $query->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
            }
        }

        return $query->orderBy('name')->get()->map(function ($student) {
            $quizScore = $student->quizAttempts->avg('score') ?? 0;
            $assignmentScore = $student->assignmentSubmissions->avg('score') ?? 0;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'class_name' => $student->class_name,
                'attendance_number' => $student->attendance_number,
                'identifier_no' => $student->identifier_no,
                'avg_quiz' => round($quizScore, 1),
                'avg_assignment' => round($assignmentScore, 1),
                'final_grade' => round(($quizScore * 0.5) + ($assignmentScore * 0.5), 1),
                'quizzes' => $student->quizAttempts->map(function ($q) {
                    return [
                        'title' => $q->quiz->title ?? 'Kuis',
                        'score' => $q->score,
                    ];
                }),
                'assignments' => $student->assignmentSubmissions->map(function ($a) {
                    return [
                        'title' => $a->assignment->title ?? 'Tugas',
                        'score' => $a->score,
                    ];
                }),
            ];
        });
    }

    public function getGrades(Request $request)
    {
        $user = $request->user();
        $className = $request->query('class', 'VII A');
        $students = $this->buildGradesCollection($user, $className);

        return response()->json($students);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }

    public function createGradesExportLink(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'guru') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $effectiveClass = $user->class_name ?: (string) $request->input('class', 'VII A');
        $status = (string) $request->input('status', 'all');
        $search = (string) $request->input('search', '');
        $sort = (string) $request->input('sort', 'absen');

        $payloadData = [
            'uid' => $user->id,
            'class' => $effectiveClass,
            'status' => in_array($status, ['all', 'tuntas', 'remedial'], true) ? $status : 'all',
            'search' => mb_substr(trim($search), 0, 100),
            'sort' => in_array($sort, ['absen', 'name_asc', 'highest', 'lowest'], true) ? $sort : 'absen',
            'exp' => time() + 600, // berlaku 10 menit
        ];

        $encoded = $this->base64UrlEncode(json_encode($payloadData));
        $sig = hash_hmac('sha256', $encoded, (string) config('app.key'));

        $safeClass = preg_replace('/[^a-zA-Z0-9_-]/', '_', $effectiveClass);
        $safeDate = date('Y-m-d');
        $filename = "Rekap_Nilai_{$safeClass}_{$safeDate}.csv";

        return response()->json([
            'download_path' => "/api/teacher/grades/download?p={$encoded}&s={$sig}",
            'filename' => $filename,
        ]);
    }

    public function downloadGradesCsv(Request $request)
    {
        $encoded = (string) $request->query('p', '');
        $sig = (string) $request->query('s', '');

        if ($encoded === '' || $sig === '') {
            abort(403, 'Tautan unduhan tidak valid.');
        }

        $expected = hash_hmac('sha256', $encoded, (string) config('app.key'));
        if (!hash_equals($expected, $sig)) {
            abort(403, 'Tanda tangan tautan unduhan tidak valid.');
        }

        $payload = json_decode($this->base64UrlDecode($encoded), true);
        if (!is_array($payload) || empty($payload['uid']) || empty($payload['exp']) || time() > (int) $payload['exp']) {
            abort(403, 'Tautan unduhan sudah kedaluwarsa. Silakan tekan tombol Unduh Excel lagi.');
        }

        $teacher = User::where('id', (int) $payload['uid'])->where('role', 'guru')->first();
        if (!$teacher) {
            abort(403, 'Akun guru tidak ditemukan.');
        }

        $activeClass = $teacher->class_name ?: (string) ($payload['class'] ?? 'VII A');
        $status = (string) ($payload['status'] ?? 'all');
        $search = strtolower(trim((string) ($payload['search'] ?? '')));
        $sort = (string) ($payload['sort'] ?? 'absen');

        $students = $this->buildGradesCollection($teacher, $activeClass)->values()->all();

        // Filter status & search sesuai tampilan guru
        $filtered = array_values(array_filter($students, function ($s) use ($status, $search) {
            $grade = (float) ($s['final_grade'] ?? 0);
            if ($status === 'tuntas' && $grade < 75) return false;
            if ($status === 'remedial' && $grade >= 75) return false;

            if ($search !== '') {
                $name = strtolower((string) ($s['name'] ?? ''));
                $nisn = strtolower((string) ($s['identifier_no'] ?? ''));
                $absen = (string) ($s['attendance_number'] ?? '');
                $cls = strtolower((string) ($s['class_name'] ?? ''));
                if (
                    strpos($name, $search) === false &&
                    strpos($nisn, $search) === false &&
                    strpos($absen, $search) === false &&
                    strpos($cls, $search) === false
                ) {
                    return false;
                }
            }
            return true;
        }));

        // Urutkan sesuai pilihan guru
        usort($filtered, function ($a, $b) use ($sort, $activeClass) {
            $gradeA = (float) ($a['final_grade'] ?? 0);
            $gradeB = (float) ($b['final_grade'] ?? 0);
            $nameCmp = strnatcasecmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? ''));

            if ($sort === 'highest') {
                return ($gradeB <=> $gradeA) ?: $nameCmp;
            }
            if ($sort === 'lowest') {
                return ($gradeA <=> $gradeB) ?: $nameCmp;
            }
            if ($sort === 'name_asc') {
                return $nameCmp;
            }

            if ($activeClass === 'Semua Kelas' && ($a['class_name'] ?? '') !== ($b['class_name'] ?? '')) {
                return strnatcasecmp((string) ($a['class_name'] ?? ''), (string) ($b['class_name'] ?? ''));
            }
            $absA = $a['attendance_number'] ?? 9999;
            $absB = $b['attendance_number'] ?? 9999;
            return ($absA <=> $absB) ?: $nameCmp;
        });

        $formatCell = function ($val): string {
            if ($val === null) return '""';
            $clean = trim(preg_replace('/[\r\n]+/', ' ', (string) $val));
            return '"' . str_replace('"', '""', $clean) . '"';
        };

        $headers = [
            'No',
            'No. Absen',
            'Nama Siswa',
            'Kelas',
            'NISN',
            'Rata-rata Kuis',
            'Rata-rata Tugas',
            'Nilai Akhir',
            'Status KKM',
            'Predikat',
        ];

        $lines = [];
        $lines[] = implode(',', array_map($formatCell, $headers));

        foreach ($filtered as $idx => $s) {
            $finalGrade = (float) ($s['final_grade'] ?? 0);
            $predikat = $finalGrade >= 85
                ? 'Sangat Baik (A)'
                : ($finalGrade >= 75
                    ? 'Baik (B - Tuntas)'
                    : ($finalGrade >= 60 ? 'Cukup (C - Bimbingan)' : 'Kurang (D - Remedial)'));

            $row = [
                $idx + 1,
                $s['attendance_number'] ?? '-',
                $s['name'] ?? 'Anonim',
                $s['class_name'] ?? $activeClass,
                $s['identifier_no'] ?? '-',
                $s['avg_quiz'] ?? 0,
                $s['avg_assignment'] ?? 0,
                $finalGrade,
                $finalGrade >= 75 ? 'Tuntas' : 'Remedial',
                $predikat,
            ];
            $lines[] = implode(',', array_map($formatCell, $row));
        }

        $csvContent = "\xEF\xBB\xBF" . implode("\r\n", $lines);
        $safeClass = preg_replace('/[^a-zA-Z0-9_-]/', '_', $activeClass);
        $safeDate = date('Y-m-d');
        $filename = "Rekap_Nilai_{$safeClass}_{$safeDate}.csv";

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Length' => strlen($csvContent),
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $teacher = $request->user();
        $student = User::where('role', 'siswa')->findOrFail($id);

        if ($teacher && $teacher->class_name) {
            if ($this->normalizeClass($teacher->class_name) !== $this->normalizeClass($student->class_name)) {
                return response()->json(['message' => 'Akses ditolak: Anda tidak memiliki izin untuk mereset password siswa kelas lain.'], 403);
            }
        }
        
        $student->update([
            'password' => Hash::make('spentigu123')
        ]);
        
        return response()->json([
            'message' => 'Password reset successfully',
            'student' => $student
        ]);
    }

    public function store(Request $request)
    {
        $teacher = $request->user();
        $validated = $request->validate([
            'name' => 'required|string',
            'identifier_no' => 'required|string|unique:users',
            'class_name' => 'required|string',
            'attendance_number' => 'nullable|integer',
        ]);

        if ($teacher && $teacher->class_name) {
            $validated['class_name'] = $teacher->class_name;
        }

        $validated['role'] = 'siswa';
        $validated['password'] = Hash::make('spentigu123');
        $validated['is_active'] = true;

        $student = User::create($validated);
        return response()->json($student, 201);
    }

    public function update(Request $request, $id)
    {
        $teacher = $request->user();
        $student = User::where('role', 'siswa')->findOrFail($id);

        if ($teacher && $teacher->class_name) {
            if ($this->normalizeClass($teacher->class_name) !== $this->normalizeClass($student->class_name)) {
                return response()->json(['message' => 'Akses ditolak: Anda tidak memiliki izin untuk mengedit data siswa kelas lain.'], 403);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'identifier_no' => 'required|string|unique:users,identifier_no,' . $id,
            'class_name' => 'required|string',
            'attendance_number' => 'nullable|integer',
        ]);

        if ($teacher && $teacher->class_name) {
            $validated['class_name'] = $teacher->class_name;
        }

        $student->update($validated);
        return response()->json($student);
    }

    public function destroy(Request $request, $id)
    {
        $teacher = $request->user();
        $student = User::where('role', 'siswa')->findOrFail($id);

        if ($teacher && $teacher->class_name) {
            if ($this->normalizeClass($teacher->class_name) !== $this->normalizeClass($student->class_name)) {
                return response()->json(['message' => 'Akses ditolak: Anda tidak memiliki izin untuk menghapus siswa kelas lain.'], 403);
            }
        }

        $student->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
