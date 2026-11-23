<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): \Illuminate\Http\JsonResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        if ($user) {
            $user->last_login_at = now();
            $user->last_activity_at = now();
            $user->last_logout_at = null;
            $user->save();
        }

        // Generate token for mobile / cross-origin clients where cookies might be blocked
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => (string) $user->id,
                'identifier_no' => $user->identifier_no,
                'class_id' => $user->class_id ? (string) $user->class_id : null,
                'class_name' => $user->class_name,
                'attendance_number' => $user->attendance_number ? (string) $user->attendance_number : null,
                'username' => $user->name,
                'name' => $user->name,
                'role' => $user->role,
                'semester' => $user->semester ?? 'Ganjil',
                'avatar_url' => $user->avatar_url,
                'is_active' => (bool) $user->is_active,
                'last_login_at' => $user->last_login_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ]
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        $user = $request->user();
        if ($user) {
            $user->last_logout_at = now();
            $user->last_activity_at = null;
            $user->save();
            try {
                $user->tokens()->delete();
            } catch (\Exception $e) {}
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
