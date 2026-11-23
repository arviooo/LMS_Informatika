import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentMaterialPage from './pages/siswa/StudentMaterialPage';
import StudentMaterialListPage from './pages/siswa/StudentMaterialListPage';
import StudentQuizPage from './pages/siswa/StudentQuizPage';
import StudentCertificatePage from './pages/siswa/StudentCertificatePage';
import StudentAssignmentPage from './pages/siswa/StudentAssignmentPage';
import StudentAssignmentListPage from './pages/siswa/StudentAssignmentListPage';
import StudentProfilePage from './pages/siswa/StudentProfilePage';
import StudentMaterialContentPage from './pages/siswa/StudentMaterialContentPage';
import TeacherDashboardPage from './pages/guru/TeacherDashboardPage';
import MaterialManagerPage from './pages/guru/MaterialManagerPage';
import MaterialFormPage from './pages/guru/MaterialFormPage';
import TeacherAssignmentManagerPage from './pages/guru/TeacherAssignmentManagerPage';
import TeacherAssignmentFormPage from './pages/guru/TeacherAssignmentFormPage';
import TeacherAssignmentDetailPage from './pages/guru/TeacherAssignmentDetailPage';
import TeacherProfilePage from './pages/guru/TeacherProfilePage';
import TeacherHomePage from './pages/guru/TeacherHomePage';
import TeacherStudentManagerPage from './pages/guru/TeacherStudentManagerPage';
import TeacherGradebookPage from './pages/guru/TeacherGradebookPage';
import TeacherAccountManagerPage from './pages/guru/TeacherAccountManagerPage';
import type { User } from '@lms/shared';
import { getCurrentUser, saveSession, clearSession, logout, api, backendUrl } from '@lms/shared';
import TeacherLayout from './components/layout/TeacherLayout';
import SplashScreen from './components/ui/SplashScreen';
import { initGlobalSoundEffects } from './lib/soundEffects';

import Icon from './components/Icon';
// ─── Auth Context ────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  handleLogin: (user: User) => void;
  handleLogout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  handleLogin: () => {},
  handleLogout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ─── App Component ───────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      // Validate role in case of stale cache (student -> siswa)
      if (storedUser.role === 'siswa' || storedUser.role === 'guru') {
        setUser(storedUser);
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
    const cleanupSounds = initGlobalSoundEffects();
    return cleanupSounds;
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    saveSession(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      if (user?.role === 'siswa') {
        await api.post('/api/student/leave').catch(() => {});
      }
    } catch {}
    setUser(null);
    logout(); // Calls backend /logout and then clearSession()
  };

  // Real-time Student Presence Heartbeat
  useEffect(() => {
    if (!user || user.role !== 'siswa') return;

    let lastSent = 0;
    const sendHeartbeat = async () => {
      try {
        lastSent = Date.now();
        await api.post('/api/student/heartbeat');
      } catch (e) {
        // Silent catch
      }
    };

    // Immediate ping on mount / login
    sendHeartbeat();

    // Regular interval: ping every 35 seconds
    const interval = setInterval(sendHeartbeat, 35000);

    // Active interaction listener (throttled to max 1 request per 15s)
    const onUserActive = () => {
      const now = Date.now();
      if (now - lastSent > 15000) {
        sendHeartbeat();
      }
    };

    // Visibility change: when student returns to tab or wakes mobile screen
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastSent > 10000) {
          sendHeartbeat();
        }
      }
    };

    window.addEventListener('pointerdown', onUserActive, { passive: true });
    window.addEventListener('keydown', onUserActive, { passive: true });
    window.addEventListener('scroll', onUserActive, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pointerdown', onUserActive);
      window.removeEventListener('keydown', onUserActive);
      window.removeEventListener('scroll', onUserActive);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user]);

  if (isLoading) {
    return <SplashScreen isAppReady={false} onFinish={() => {}} />;
  }

  const getDashboardRoute = (user: User | null) => {
    if (!user) return '/';
    return user.role === 'guru' ? '/guru/home' : '/dashboard';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, handleLogin, handleLogout }}>
      {showSplash && (
        <SplashScreen isAppReady={!isLoading} onFinish={() => setShowSplash(false)} />
      )}
      {/* Global Background Batik Pattern */}
      <div 
        className="fixed inset-0 z-0 bg-repeat opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "url('/bg-batik.jpg')", backgroundSize: "120px" }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-surface/20 via-surface/80 to-surface pointer-events-none" />

      <div className="relative z-10 w-full min-h-screen">
        <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to={getDashboardRoute(user)} replace /> : <LandingPage />
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to={getDashboardRoute(user)} replace /> : <LoginPage />
          }
        />
        <Route
          path="/dashboard"
          element={
            user && user.role === 'siswa' ? <DashboardPage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/tugas"
          element={
            user && user.role === 'siswa' ? <StudentAssignmentListPage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/materi"
          element={
            user && user.role === 'siswa' ? <StudentMaterialListPage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/siswa/materi/:id"
          element={
            user && user.role === 'siswa' ? <StudentMaterialPage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/siswa/materi/:id/baca"
          element={
            user && user.role === 'siswa' ? <StudentMaterialContentPage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/siswa/materi/:id/kuis"
          element={
            user && user.role === 'siswa' ? <StudentQuizPage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/siswa/sertifikat"
          element={
            user && user.role === 'siswa' ? <StudentCertificatePage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/siswa/tugas/:id"
          element={
            user && user.role === 'siswa' ? <StudentAssignmentPage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route
          path="/akun"
          element={
            user && user.role === 'siswa' ? <StudentProfilePage /> : <Navigate to={getDashboardRoute(user)} replace />
          }
        />
        <Route element={<TeacherLayout />}>
          <Route
            path="/guru/home"
            element={
              user && user.role === 'guru' ? <TeacherHomePage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/dashboard"
            element={
              user && user.role === 'guru' ? <TeacherDashboardPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/materi"
            element={
              user && user.role === 'guru' ? <MaterialManagerPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/materi/tambah"
            element={
              user && user.role === 'guru' ? <MaterialFormPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/materi/edit/:id"
            element={
              user && user.role === 'guru' ? <MaterialFormPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/tugas"
            element={
              user && user.role === 'guru' ? <TeacherAssignmentManagerPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/tugas/tambah"
            element={
              user && user.role === 'guru' ? <TeacherAssignmentFormPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/tugas/edit/:id"
            element={
              user && user.role === 'guru' ? <TeacherAssignmentFormPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/tugas/:id"
            element={
              user && user.role === 'guru' ? <TeacherAssignmentDetailPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/akun"
            element={
              user && user.role === 'guru' ? <TeacherProfilePage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/akun/siswa"
            element={
              user && user.role === 'guru' ? <TeacherStudentManagerPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/akun/pengampu"
            element={
              user && user.role === 'guru' ? <TeacherAccountManagerPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
          <Route
            path="/guru/nilai"
            element={
              user && user.role === 'guru' ? <TeacherGradebookPage /> : <Navigate to={getDashboardRoute(user)} replace />
            }
          />
        </Route>
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
}
