<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';


// Temporary route for InfinityFree Database Migration
Route::get('/setup-db', function () {
    try {
        Illuminate\Support\Facades\Artisan::call('migrate:fresh', [
            '--force' => true,
            '--seed' => true
        ]);
        return 'Database successfully migrated and seeded! <br><br> <a href="/">Back to Home</a>';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

Route::get('/upgrade-db', function () {
    try {
        $messages = [];
        if (!Illuminate\Support\Facades\Schema::hasColumn('users', 'last_login_at')) {
            Illuminate\Support\Facades\Schema::table('users', function ($table) {
                $table->timestamp('last_login_at')->nullable();
            });
            $messages[] = 'Kolom last_login_at berhasil ditambahkan.';
        }
        if (!Illuminate\Support\Facades\Schema::hasColumn('users', 'last_logout_at')) {
            Illuminate\Support\Facades\Schema::table('users', function ($table) {
                $table->timestamp('last_logout_at')->nullable();
            });
            $messages[] = 'Kolom last_logout_at berhasil ditambahkan.';
        }
        if (!Illuminate\Support\Facades\Schema::hasColumn('users', 'last_activity_at')) {
            Illuminate\Support\Facades\Schema::table('users', function ($table) {
                $table->timestamp('last_activity_at')->nullable();
            });
            $messages[] = 'Kolom last_activity_at berhasil ditambahkan.';
        }

        // Reset & Pastikan Akun Koordinator memiliki nama yang benar dan memantau semua kelas (bukan 0987654321)
        $coord = \App\Models\User::where('identifier_no', '0987654321')->first();
        if ($coord) {
            $coord->name = 'Tim Guru Informatika (Koordinator)';
            $coord->class_name = null;
            $coord->class_id = null;
            $coord->role = 'guru';
            $coord->save();
            $messages[] = 'Profil Koordinator Guru berhasil diperbaiki (Nama: Tim Guru Informatika, Akses: Semua Kelas).';
        }

        // Auto-seed 4 class teachers & coordinator
        $seeder = new \Database\Seeders\TeacherAccountsSeeder();
        $seeder->run();
        $messages[] = 'Akun Guru Kelas (VII A - VII D) & Koordinator disinkronkan ke database.';

        return empty($messages) ? 'Database sudah up to date (last_login_at, last_logout_at, last_activity_at & 5 Akun Guru aktif).' : implode('<br>', $messages);
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

// Debug route to see what files exist on the server
Route::get('/debug-assets', function () {
    $dir = base_path('assets');
    if (!is_dir($dir)) return 'Assets directory not found at: ' . $dir;
    return array_diff(scandir($dir), ['..', '.']);
});

// SPA Fallback & Asset Route
Route::get('/{any}', function ($any, \Illuminate\Http\Request $request) {
    // If the request is meant for the API, never return the React HTML!
    if (str_starts_with($any, 'api/') || $request->expectsJson()) {
        return response()->json(['error' => 'API route not found', 'path' => $any], 404);
    }

    // If browser is asking for a storage file
    if (str_starts_with($any, 'storage/')) {
        $path = storage_path('app/public/' . substr($any, 8));
    } else {
        // If browser is asking for an asset
        $path = base_path($any);
    }
    
    if (file_exists($path) && !is_dir($path)) {
        $ext = pathinfo($path, PATHINFO_EXTENSION);
        $headers = [];
        if ($ext === 'js') $headers['Content-Type'] = 'application/javascript';
        if ($ext === 'css') $headers['Content-Type'] = 'text/css';
        if ($ext === 'svg') $headers['Content-Type'] = 'image/svg+xml';
        if ($ext === 'png') $headers['Content-Type'] = 'image/png';
        if ($ext === 'jpg' || $ext === 'jpeg') $headers['Content-Type'] = 'image/jpeg';
        if ($ext === 'apk') {
            $headers['Content-Type'] = 'application/vnd.android.package-archive';
            $headers['Content-Disposition'] = 'attachment; filename="LMS_Informatika.apk"';
        }
        
        return response()->file($path, $headers);
    }
    
    // Jangan pernah mengirim index.html jika yang diminta adalah file .apk yang tidak ditemukan
    if (str_ends_with(strtolower($any), '.apk')) {
        return response()->json(['error' => 'File APK tidak ditemukan di server', 'path_checked' => $path], 404);
    }

    // Otherwise, serve the React index.html with anti-cache headers (prevents stale Android WebView cache)
    $indexPath = base_path('index.html');
    if (file_exists($indexPath)) {
        return response(file_get_contents($indexPath), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
    return response()->json(['Laravel' => app()->version(), 'error' => 'index.html not found', 'path_checked' => $indexPath], 404);
})->where('any', '.*');
