<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeacherAccountManagerController extends Controller
{
    /**
     * Memastikan hanya akun guru yang dapat mengelola direktori akun guru.
     */
    private function authorizeKoordinator(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'guru') {
            abort(response()->json([
                'message' => 'Akses ditolak: Hanya Guru yang berhak mengakses direktori akun guru.'
            ], 403));
        }
    }

    public function index(Request $request)
    {
        $this->authorizeKoordinator($request);
        
        $today = now()->startOfDay();

        $teachers = User::where('role', 'guru')
            ->orderByRaw("CASE WHEN identifier_no = 'guruinformatika' OR class_name IS NULL THEN 0 ELSE 1 END, class_name ASC")
            ->get()
            ->map(function ($teacher) use ($today) {
                // Presence detection
                $hasRecentActivity = $teacher->last_activity_at && $teacher->last_activity_at >= now()->subMinutes(3);
                $notLoggedOut = (!$teacher->last_logout_at || ($teacher->last_activity_at && $teacher->last_activity_at > $teacher->last_logout_at));
                
                $isOnline = $hasRecentActivity && $notLoggedOut;
                $isLoggedOut = false;
                if (!$isOnline && $teacher->last_login_at && $teacher->last_login_at >= $today) {
                    $isLoggedOut = true;
                }

                $onlineStatus = $isOnline ? 'online' : ($isLoggedOut ? 'logged_out' : 'offline');

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'identifier_no' => $teacher->identifier_no,
                    'class_name' => $teacher->class_name,
                    'is_coordinator' => empty($teacher->class_name) || $teacher->identifier_no === 'guruinformatika',
                    'role' => $teacher->role,
                    'avatar_url' => $teacher->avatar_url,
                    'is_active' => $teacher->is_active,
                    'last_login_at' => $teacher->last_login_at ? $teacher->last_login_at->format('d M, H:i') : null,
                    'last_logout_at' => $teacher->last_logout_at ? $teacher->last_logout_at->format('d M, H:i') : null,
                    'last_activity_at' => $teacher->last_activity_at ? $teacher->last_activity_at->format('H:i') : null,
                    'online_status' => $onlineStatus,
                ];
            });
            
        return response()->json($teachers);
    }

    public function store(Request $request)
    {
        $this->authorizeKoordinator($request);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'class_name' => 'nullable|string|max:50',
            'identifier_no' => 'nullable|string|max:50|unique:users,identifier_no',
            'password' => 'nullable|string|min:6'
        ]);

        $className = $validated['class_name'] ?? null;
        if ($className === 'Koordinator' || $className === 'Semua Kelas' || empty($className)) {
            $className = null;
        }

        // Auto-generate identifier_no jika kosong (contoh: guru_viia)
        $identifierNo = $validated['identifier_no'] ?? null;
        if (empty($identifierNo)) {
            $slug = $className ? strtolower(str_replace([' ', '-'], '', $className)) : 'koordinator';
            $identifierNo = 'guru_' . $slug;
            $counter = 1;
            $base = $identifierNo;
            while (User::where('identifier_no', $identifierNo)->exists()) {
                $identifierNo = $base . '_' . $counter++;
            }
        }

        $password = !empty($validated['password']) ? $validated['password'] : 'guruinformatika123';

        $teacher = User::create([
            'name' => $validated['name'],
            'identifier_no' => $identifierNo,
            'class_name' => $className,
            'role' => 'guru',
            'password' => Hash::make($password),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Akun guru ' . ($className ? 'pengampu ' . $className : 'Koordinator') . ' berhasil dibuat!',
            'teacher' => $teacher,
            'default_password' => $password
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeKoordinator($request);

        $teacher = User::where('role', 'guru')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'class_name' => 'nullable|string|max:50',
            'identifier_no' => 'required|string|max:50|unique:users,identifier_no,' . $id,
            'password' => 'nullable|string|min:6'
        ]);

        $className = $validated['class_name'] ?? null;
        if ($className === 'Koordinator' || $className === 'Semua Kelas' || empty($className)) {
            $className = null;
        }

        $teacher->name = $validated['name'];
        $teacher->class_name = $className;
        $teacher->identifier_no = $validated['identifier_no'];

        if (!empty($validated['password'])) {
            $teacher->password = Hash::make($validated['password']);
        }

        $teacher->save();

        return response()->json([
            'message' => 'Data guru pengampu berhasil diperbarui!',
            'teacher' => $teacher
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $this->authorizeKoordinator($request);

        $teacher = User::where('role', 'guru')->findOrFail($id);
        $teacher->password = Hash::make('guruinformatika123');
        $teacher->save();

        return response()->json([
            'message' => 'Kata sandi ' . $teacher->name . ' berhasil direset ke "guruinformatika123"'
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $this->authorizeKoordinator($request);

        $teacher = User::where('role', 'guru')->findOrFail($id);
        
        if ($teacher->identifier_no === 'guruinformatika' || $teacher->identifier_no === '0987654321') {
            return response()->json([
                'message' => 'Akun Koordinator Utama tidak dapat dihapus.'
            ], 422);
        }

        $name = $teacher->name;
        $class = $teacher->class_name ?: 'Koordinator';
        $teacher->delete();

        return response()->json([
            'message' => 'Akun guru ' . $class . ' (' . $name . ') berhasil dihapus.'
        ]);
    }

    public function autoGenerateDefault(Request $request)
    {
        $this->authorizeKoordinator($request);
        
        // Perbaiki koordinator jika masih memakai identifier lama
        $coord = User::whereIn('identifier_no', ['guruinformatika', '0987654321'])->first();
        if ($coord) {
            $coord->identifier_no = 'guruinformatika';
            $coord->name = 'Tim Guru Informatika (Koordinator)';
            $coord->class_name = null;
            $coord->save();
        }

        $seeder = new \Database\Seeders\TeacherAccountsSeeder();
        $seeder->run();

        return response()->json([
            'message' => 'Akun otomatis Guru Pengampu Kelas VII A - VII D & Koordinator berhasil disinkronkan ke database!'
        ]);
    }
}
