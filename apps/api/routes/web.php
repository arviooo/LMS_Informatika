<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

$serveSpaIndex = function () {
    $candidates = [
        public_path('index.html'),
        base_path('index.html'),
    ];

    foreach ($candidates as $indexPath) {
        if (file_exists($indexPath)) {
            return response(file_get_contents($indexPath), 200, [
                'Content-Type' => 'text/html; charset=UTF-8',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]);
        }
    }

    return response()->json(['Laravel' => app()->version(), 'error' => 'index.html not found'], 404);
};

Route::get('/', $serveSpaIndex);

require __DIR__.'/auth.php';

// SPA Fallback & Safe Public Asset Route
Route::get('/{any}', function ($any, Request $request) use ($serveSpaIndex) {
    // Never return React HTML for API or JSON requests
    if (str_starts_with($any, 'api/') || $request->expectsJson()) {
        return response()->json(['error' => 'API route not found', 'path' => $any], 404);
    }

    // Block path traversal, dotfiles (e.g. .env, .htaccess), and PHP scripts
    $normalized = ltrim(str_replace('\\', '/', $any), '/');
    if (
        str_contains($normalized, '..') ||
        preg_match('#(^|/)\.#', $normalized) ||
        str_ends_with(strtolower($normalized), '.php')
    ) {
        abort(404);
    }

    // Safely serve storage files strictly within storage/app/public
    if (str_starts_with($normalized, 'storage/')) {
        $storageBase = realpath(storage_path('app/public'));
        $relative = substr($normalized, 8);
        $resolved = $storageBase ? realpath($storageBase . DIRECTORY_SEPARATOR . $relative) : false;

        if ($storageBase && $resolved && str_starts_with($resolved, $storageBase . DIRECTORY_SEPARATOR) && is_file($resolved)) {
            return response()->file($resolved);
        }

        abort(404);
    }

    // Safely serve static assets strictly within public_path()
    $publicBase = realpath(public_path());
    $resolvedPublic = $publicBase ? realpath($publicBase . DIRECTORY_SEPARATOR . $normalized) : false;

    if ($publicBase && $resolvedPublic && str_starts_with($resolvedPublic, $publicBase . DIRECTORY_SEPARATOR) && is_file($resolvedPublic)) {
        $ext = strtolower(pathinfo($resolvedPublic, PATHINFO_EXTENSION));
        $headers = [];
        if ($ext === 'js') $headers['Content-Type'] = 'application/javascript';
        if ($ext === 'css') $headers['Content-Type'] = 'text/css';
        if ($ext === 'svg') $headers['Content-Type'] = 'image/svg+xml';
        if ($ext === 'png') $headers['Content-Type'] = 'image/png';
        if ($ext === 'jpg' || $ext === 'jpeg') $headers['Content-Type'] = 'image/jpeg';
        if ($ext === 'xml') $headers['Content-Type'] = 'application/xml; charset=UTF-8';
        if ($ext === 'txt') $headers['Content-Type'] = 'text/plain; charset=UTF-8';
        if ($ext === 'apk') {
            $headers['Content-Type'] = 'application/vnd.android.package-archive';
            $headers['Content-Disposition'] = 'attachment; filename="LMS_Informatika.apk"';
        }

        return response()->file($resolvedPublic, $headers);
    }

    // Never return index.html for missing APK files
    if (str_ends_with(strtolower($normalized), '.apk')) {
        return response()->json(['error' => 'File APK tidak ditemukan di server'], 404);
    }

    return $serveSpaIndex();
})->where('any', '.*');
