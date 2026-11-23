// =============================================================
// Mock Authentication Service
// Simulasi login/logout untuk development
// =============================================================

import type { User } from '../types';
import axios from '../lib/axios';

export interface LoginCredentials {
  nisn: string;
  password: string;
  role?: 'siswa' | 'guru';
}

export interface AuthResult {
  success: boolean;
  user?: User;
  message: string;
}

/**
 * Login via Laravel Sanctum API
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    // 1. Get CSRF Cookie (wrapped in try-catch so it won't block mobile clients if cookies are restricted)
    try {
      await axios.get('/sanctum/csrf-cookie');
    } catch {
      // Continue anyway, Bearer token will handle authentication
    }

    // 2. Perform Login Request with normalized identifier & strict portal role
    const loginRes = await axios.post('/login', {
      identifier_no: credentials.nisn.trim().toLowerCase(),
      password: credentials.password,
      role: credentials.role,
    });

    // Use user returned directly from login response if available, otherwise fetch from /api/user
    let backendUser = loginRes.data?.user;
    const token = loginRes.data?.token;

    // Frontend safety-net: tolak jika role akun dari server tidak cocok dengan portal yang dipilih
    if (credentials.role && backendUser && backendUser.role !== credentials.role) {
      try {
        await axios.post('/logout');
      } catch {
        // ignore
      }
      try {
        localStorage.removeItem('lms_auth_token');
      } catch {}
      clearSession();

      return {
        success: false,
        message:
          credentials.role === 'siswa'
            ? 'Akun ini terdaftar sebagai Guru. Silakan beralih ke Portal Guru untuk masuk.'
            : 'Akun ini terdaftar sebagai Siswa. Silakan beralih ke Portal Siswa untuk masuk.',
      };
    }

    // Save Bearer token if returned by backend (ensures mobile sessions stay logged in)
    if (token) {
      localStorage.setItem('lms_auth_token', token);
    }

    if (!backendUser) {
      const userRes = await axios.get('/api/user');
      backendUser = userRes.data;

      if (credentials.role && backendUser && backendUser.role !== credentials.role) {
        await logout();
        return {
          success: false,
          message:
            credentials.role === 'siswa'
              ? 'Akun ini terdaftar sebagai Guru. Silakan beralih ke Portal Guru untuk masuk.'
              : 'Akun ini terdaftar sebagai Siswa. Silakan beralih ke Portal Siswa untuk masuk.',
        };
      }
    }
    
    // Convert Laravel User to our shared User type format
    const user: User = {
      id: backendUser.id.toString(),
      identifier_no: backendUser.identifier_no,
      class_id: backendUser.class_id ? backendUser.class_id.toString() : null,
      attendance_number: backendUser.attendance_number ? backendUser.attendance_number.toString() : null,
      username: backendUser.name,
      name: backendUser.name,
      role: backendUser.role,
      class_name: backendUser.class_name,
      semester: backendUser.semester,
      avatar_url: backendUser.avatar_url,
      is_active: backendUser.is_active,
      last_login_at: backendUser.last_login_at,
      created_at: backendUser.created_at,
      updated_at: backendUser.updated_at,
    };

    saveSession(user);

    return {
      success: true,
      user,
      message:
        user.role === 'guru'
          ? 'Berhasil masuk! Membuka Portal Pengajar...'
          : 'Berhasil masuk! Menyiapkan materi pelajaran...',
    };
  } catch (error: any) {
    let msg = 'Terjadi kesalahan jaringan. Coba lagi.';
    const roleError = error.response?.data?.errors?.role?.[0];
    if (roleError) {
      msg = roleError;
    } else if (error.response?.status === 422 || error.response?.status === 401) {
      msg =
        credentials.role === 'guru'
          ? 'NIP / Nama Pengguna atau kata sandi salah.'
          : 'NISN / Nama Pengguna atau kata sandi salah.';
    } else if (error.response?.data?.message) {
      msg = error.response.data.message;
    }
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Logout via API
 */
export async function logout(): Promise<void> {
  try {
    await axios.post('/logout');
  } catch (e) {
    // ignore
  } finally {
    try {
      localStorage.removeItem('lms_auth_token');
    } catch {}
    clearSession();
  }
}

/**
 * Get current user from localStorage (session simulation)
 */
export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem('lms_current_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Save user session
 */
export function saveSession(user: User): void {
  localStorage.setItem('lms_current_user', JSON.stringify(user));
}

/**
 * Clear session
 */
export function clearSession(): void {
  localStorage.removeItem('lms_current_user');
}
