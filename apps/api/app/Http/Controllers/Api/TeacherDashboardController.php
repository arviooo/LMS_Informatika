<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\Assignment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class TeacherDashboardController extends Controller
{
    private function normalizeClass(?string $cls): string
    {
        return strtolower(str_replace(['-', ' '], '', $cls ?? ''));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => 'required|string',
            'identifier_no' => 'nullable|string',
            'class_name' => 'nullable|string',
            'password' => 'nullable|string|min:6'
        ]);

        $user->name = $validated['name'];
        if (isset($validated['identifier_no'])) {
            $user->identifier_no = $validated['identifier_no'];
        }
        if ($request->has('class_name')) {
            $cls = $request->input('class_name');
            $user->class_name = ($cls === 'Koordinator' || $cls === 'Semua Kelas' || empty($cls)) ? null : $cls;
        }
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        return response()->json(['message' => 'Profil berhasil diperbarui', 'user' => $user]);
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:2048'
        ]);

        $user = $request->user();
        
        if ($user->avatar_url) {
            $oldRel = ltrim(preg_replace('#^/api/storage/#', '', $user->avatar_url), '/');
            foreach ([storage_path('app/public/' . $oldRel), base_path($oldRel)] as $oldFile) {
                if (file_exists($oldFile) && !is_dir($oldFile)) {
                    @unlink($oldFile);
                }
            }
        }

        $photo = $request->file('photo');
        $ext = strtolower($photo->getClientOriginalExtension() ?: 'jpg');
        $fileName = 'avatar_teacher_' . $user->id . '_' . time() . '.' . $ext;
        $avatarsPath = storage_path('app/public/avatars');
        if (!is_dir($avatarsPath)) {
            @mkdir($avatarsPath, 0775, true);
        }
        $photo->move($avatarsPath, $fileName);

        $user->avatar_url = '/api/storage/avatars/' . $fileName;
        $user->save();

        return response()->json(['message' => 'Foto berhasil diperbarui', 'avatar_url' => $user->avatar_url]);
    }
    public function getMonitoringMatrix(Request $request)
    {
        $teacher = $request->user();
        $materialsCount = Material::count() ?: 1;
        $assignmentsCount = \App\Models\Assignment::count() ?: 1;
        
        $query = User::where('role', 'siswa')->with(['studentProgress', 'quizAttempts', 'assignmentSubmissions']);
        
        if ($teacher && $teacher->class_name) {
            $norm = $this->normalizeClass($teacher->class_name);
            $query->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
        } else if ($request->has('class_name') && $request->class_name !== 'Semua Kelas') {
            $norm = $this->normalizeClass($request->class_name);
            $query->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
        }

        $students = $query->get();
        $studentIds = $students->pluck('id')->toArray();
        $today = now()->startOfDay();

        // Count actual online students from sessions (active in last 15 mins)
        $activeSessionUserIds = [];
        try {
            $activeSessionUserIds = \Illuminate\Support\Facades\DB::table('sessions')
                ->whereIn('user_id', $studentIds)
                ->where('last_activity', '>=', now()->subMinutes(15)->timestamp)
                ->pluck('user_id')
                ->toArray();
        } catch (\Exception $e) {
            $activeSessionUserIds = [];
        }

        $matrix = $students->map(function($student) use ($materialsCount, $assignmentsCount, $activeSessionUserIds, $today) {
            // 1. Modul (20%)
            $readCount = $student->studentProgress->where('is_read', true)->count();
            $modulScore = ($readCount / $materialsCount) * 20;

            // 2. Video (20%)
            $videoCount = $student->studentProgress->where('is_video_watched', true)->count();
            $videoScore = ($videoCount / $materialsCount) * 20;

            // 3. Quiz (30%)
            $quizAvg = $student->quizAttempts->avg('score') ?? 0;
            $quizScore = ($quizAvg / 100) * 30;

            // 4. Tugas (30%)
            $assignmentAvg = $student->assignmentSubmissions->avg('score') ?? 0;
            $assignmentScore = ($assignmentAvg / 100) * 30;

            $totalProgress = $modulScore + $videoScore + $quizScore + $assignmentScore;

            // Real-time Presence Detection:
            // Siswa terdeteksi Online jika:
            // 1. Memiliki heartbeat/aktivitas aktif dalam 5 menit terakhir (toleransi mobile browser throttling)
            // 2. Belum melakukan logout (last_logout_at null atau last_activity_at > last_logout_at)
            $hasRecentActivity = $student->last_activity_at && $student->last_activity_at >= now()->subMinutes(5);
            $notLoggedOut = (!$student->last_logout_at || ($student->last_activity_at && $student->last_activity_at > $student->last_logout_at));
            
            $isOnline = ($hasRecentActivity && $notLoggedOut) || 
                (in_array($student->id, $activeSessionUserIds) && $notLoggedOut && $student->last_activity_at && $student->last_activity_at >= now()->subMinutes(5));

            $isLoggedOut = false;
            if (!$isOnline && $student->last_login_at && $student->last_login_at >= $today) {
                $isLoggedOut = true;
            }

            $onlineStatus = $isOnline ? 'online' : ($isLoggedOut ? 'logged_out' : 'offline');

            return [
                'id' => $student->id,
                'name' => $student->name,
                'identifier_no' => $student->identifier_no,
                'class' => $student->class_name ?: '-',
                'pc_number' => 'PC-' . str_pad($student->id, 2, '0', STR_PAD_LEFT),
                'progress' => round($totalProgress, 1),
                'is_being_guided' => $student->is_being_guided,
                'online_status' => $onlineStatus,
                'last_login_at' => $student->last_login_at ? $student->last_login_at->format('H:i') : null,
                'last_logout_at' => $student->last_logout_at ? $student->last_logout_at->format('H:i') : null,
                'metrics' => [
                    'modul_done' => $readCount > 0,
                    'modul_count' => $readCount,
                    'total_modul' => $materialsCount,
                    'video_done' => $videoCount > 0,
                    'kuis_score' => round($quizAvg, 1),
                    'tugas_done' => $student->assignmentSubmissions->count() > 0,
                    'tugas_count' => $student->assignmentSubmissions->count(),
                    'total_tugas' => $assignmentsCount
                ]
            ];
        });

        // Calculate summary
        $totalStudents = $matrix->count();
        $tuntas = $matrix->where('progress', '>=', 75)->count();
        $bimbingan = $matrix->where('progress', '<', 40)->count();
        
        $onlineCount = $matrix->where('online_status', 'online')->count();
        $loggedOutCount = $matrix->where('online_status', 'logged_out')->count();
        $offlineCount = $matrix->where('online_status', 'offline')->count();

        $averageProgress = $totalStudents > 0 ? $matrix->avg('progress') : 0;

        // Recent Activities (Aktivitas Siswa: Tugas, Kuis, Materi) - filtered to class scope
        $recentAssignments = \App\Models\AssignmentSubmission::whereIn('user_id', $studentIds)
            ->with('user')->orderBy('updated_at', 'desc')->take(5)->get()->map(function ($item) {
                return [
                    'user' => $item->user,
                    'time' => $item->updated_at,
                    'action' => 'Mengumpulkan tugas',
                ];
            });

        $recentQuizzes = \App\Models\QuizAttempt::whereIn('user_id', $studentIds)
            ->with('user')->orderBy('updated_at', 'desc')->take(5)->get()->map(function ($item) {
                return [
                    'user' => $item->user,
                    'time' => $item->updated_at,
                    'action' => 'Mengerjakan kuis',
                ];
            });

        $recentReads = \App\Models\StudentProgress::whereIn('user_id', $studentIds)
            ->with('user')->orderBy('updated_at', 'desc')->take(5)->get()->map(function ($item) {
                return [
                    'user' => $item->user,
                    'time' => $item->updated_at,
                    'action' => 'Mempelajari materi',
                ];
            });

        $recentProfiles = collect([])->concat($recentAssignments)->concat($recentQuizzes)->concat($recentReads)
            ->filter(function($activity) { return $activity['user'] != null; })
            ->sortByDesc('time')
            ->take(5)
            ->map(function ($activity) {
                return [
                    'id' => $activity['user']->id,
                    'name' => $activity['user']->name,
                    'class' => $activity['user']->class_name ?: '-',
                    'time' => $activity['time']->diffForHumans(),
                    'action' => $activity['action'],
                ];
            })->values();

        return response()->json([
            'summary' => [
                'total_students' => $totalStudents,
                'aktif' => $onlineCount,
                'online_count' => $onlineCount,
                'logged_out_count' => $loggedOutCount,
                'offline_count' => $offlineCount,
                'tuntas' => $tuntas,
                'bimbingan' => $bimbingan,
                'average_progress' => round($averageProgress, 1),
            ],
            'students' => $matrix->values(),
            'recent_activities' => $recentProfiles
        ]);
    }

    public function getHomeStats(Request $request)
    {
        $teacher = $request->user();
        $studentsQuery = User::where('role', 'siswa');

        if ($teacher && $teacher->class_name) {
            $norm = $this->normalizeClass($teacher->class_name);
            $studentsQuery->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$norm]);
        }

        $students = $studentsQuery->get();
        $totalStudents = $students->count();
        $studentIds = $students->pluck('id')->toArray();

        // Tasks submitted (total submissions from students in scope)
        $tasksSubmitted = \App\Models\AssignmentSubmission::whereIn('user_id', $studentIds)->count();

        $quizAvg = \App\Models\QuizAttempt::whereIn('user_id', $studentIds)->avg('score') ?? 0;
        $assignmentAvg = \App\Models\AssignmentSubmission::whereIn('user_id', $studentIds)->avg('score') ?? 0;
        
        $globalAverageScore = ($quizAvg * 0.5) + ($assignmentAvg * 0.5);

        $bimbingan = User::where('role', 'siswa')
            ->whereIn('id', $studentIds)
            ->where(function($q) {
                $q->whereHas('quizAttempts', function($sub) {
                    $sub->where('score', '<', 50);
                })->orWhereHas('assignmentSubmissions', function($sub) {
                    $sub->where('score', '<', 50);
                });
            })->count();

        // Hitung Tingkat Kehadiran/Login LMS per Kelas Hari Ini
        $classProgress = [];
        if ($teacher && $teacher->class_name) {
            $classes = collect([$teacher->class_name]);
        } else {
            $classes = User::where('role', 'siswa')->select('class_name')->distinct()->pluck('class_name')->filter();
        }
        
        $today = now()->startOfDay();

        foreach ($classes as $className) {
            $normCls = $this->normalizeClass($className);
            $totalSiswaDiKelas = User::where('role', 'siswa')
                ->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$normCls])
                ->count();
            if ($totalSiswaDiKelas == 0) continue;
            
            $loginHariIni = User::where('role', 'siswa')
                ->whereRaw("LOWER(REPLACE(REPLACE(class_name, '-', ''), ' ', '')) = ?", [$normCls])
                ->where('last_login_at', '>=', $today)
                ->count();
            
            $persentase = ($loginHariIni / $totalSiswaDiKelas) * 100;
            
            $classProgress[] = [
                'label' => $className,
                'value' => round($persentase, 1),
                'count' => $loginHariIni,
                'total' => $totalSiswaDiKelas
            ];
        }

        usort($classProgress, function($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return response()->json([
            'total_students' => $totalStudents,
            'tasks_submitted' => $tasksSubmitted,
            'avg_score' => round($globalAverageScore, 1),
            'bimbingan' => $bimbingan,
            'class_progress' => $classProgress,
        ]);
    }

    public function callStudent(Request $request, $id)
    {
        $teacher = $request->user();
        $student = User::where('role', 'siswa')->findOrFail($id);
        
        if ($teacher && $teacher->class_name) {
            if ($this->normalizeClass($teacher->class_name) !== $this->normalizeClass($student->class_name)) {
                return response()->json(['message' => 'Akses ditolak: Anda tidak memiliki izin memanggil siswa kelas lain.'], 403);
            }
        }

        $message = $request->input('message', 'Silakan maju ke meja guru sekarang.');

        \App\Models\Notification::create([
            'user_id' => $student->id,
            'type' => 'call',
            'title' => 'Panggilan Guru',
            'message' => $message,
            'is_read' => false,
        ]);

        return response()->json(['message' => 'Panggilan berhasil dikirim ke siswa']);
    }

    public function toggleGuidance(Request $request, $id)
    {
        $teacher = $request->user();
        $student = User::where('role', 'siswa')->findOrFail($id);
        
        if ($teacher && $teacher->class_name) {
            if ($this->normalizeClass($teacher->class_name) !== $this->normalizeClass($student->class_name)) {
                return response()->json(['message' => 'Akses ditolak: Anda tidak memiliki izin mengubah status bimbingan siswa kelas lain.'], 403);
            }
        }

        $student->is_being_guided = !$student->is_being_guided;
        $student->save();

        return response()->json([
            'message' => 'Status bimbingan berhasil diperbarui',
            'is_being_guided' => $student->is_being_guided
        ]);
    }
}
