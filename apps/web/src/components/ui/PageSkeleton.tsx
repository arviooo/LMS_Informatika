import React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Elemen dasar Skeleton dengan animasi shimmer halus.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer bg-surface-container-highest/70 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * 1. Skeleton untuk Beranda / Dashboard Siswa (`DashboardPage.tsx`)
 */
export function DashboardStudentSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full animate-fade-in">
      {/* Progress Card Skeleton */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-xs border border-surface-variant/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
      </div>

      {/* Topic & Material List Skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-44 rounded-md" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-variant/20 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2.5 border-b border-surface-variant/20 pb-3">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 2. Skeleton untuk Daftar Bab & Materi (`MaterialManagerPage.tsx` & `StudentMaterialListPage.tsx`)
 */
export function MaterialListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-5 w-full animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest rounded-3xl p-4 sm:p-6 shadow-xs border border-surface-variant/20 flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3 border-b border-surface-variant/20 pb-3.5">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-48 sm:w-64 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-3/4 rounded-md" />
            </div>
            <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          </div>

          <div className="flex flex-col gap-3">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between gap-3 bg-surface-container/50 p-3.5 rounded-2xl"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-14 rounded-md" />
                      <Skeleton className="h-3.5 w-14 rounded-md" />
                      <Skeleton className="h-3.5 w-20 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 3. Skeleton untuk Detail Materi & Konten Bacaan (`StudentMaterialPage.tsx` & `StudentMaterialContentPage.tsx`)
 */
export function MaterialDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-24 max-w-4xl mx-auto w-full animate-fade-in">
      {/* Header Title Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-xs border border-surface-variant/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <Skeleton className="h-7 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-full mt-1" />
      </div>

      {/* Content / Steps Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-xs border border-surface-variant/20 flex flex-col gap-4">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-11/12 rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <Skeleton className="h-44 w-full rounded-2xl mt-2" />
        <Skeleton className="h-12 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

/**
 * 4. Skeleton untuk Halaman Kuis (`StudentQuizPage.tsx`)
 */
export function QuizPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col px-4 sm:px-6 pt-6 pb-24 max-w-3xl mx-auto w-full gap-5 animate-fade-in">
      {/* Top Timer & Progress Bar */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>

      {/* Question Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xs border border-surface-variant/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <Skeleton className="h-5 w-full rounded-md mt-2" />
        <Skeleton className="h-5 w-4/5 rounded-md" />

        {/* Options */}
        <div className="flex flex-col gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-2xl border border-surface-variant/20"
            >
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Skeleton untuk Daftar Tugas (`TeacherAssignmentManagerPage.tsx` & `StudentAssignmentListPage.tsx`)
 */
export function AssignmentListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 w-full animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-variant/30 shadow-xs flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="flex flex-col gap-2 py-1">
            <Skeleton className="h-5 w-3/5 rounded-md" />
            <Skeleton className="h-3.5 w-full rounded-md" />
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
          </div>
          <div className="pt-2.5 border-t border-surface-variant/20 flex items-center justify-between">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 6. Skeleton untuk Detail Tugas (`TeacherAssignmentDetailPage.tsx` & `StudentAssignmentPage.tsx`)
 */
export function AssignmentDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 sm:px-8 pt-6 pb-24 max-w-5xl mx-auto w-full animate-fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3.5 w-56 rounded-md" />
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-variant/20 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>
        <Skeleton className="h-6 w-2/3 rounded-md mt-1" />
        <Skeleton className="h-24 w-full rounded-2xl mt-2" />
      </div>

      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant/20 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 7. Skeleton untuk Form Tambah/Edit (`MaterialFormPage.tsx` & `TeacherAssignmentFormPage.tsx`)
 */
export function FormPageSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 sm:px-8 pt-6 pb-24 max-w-4xl mx-auto w-full animate-fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
      </div>

      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-variant/20 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * 8. Skeleton untuk Direktori Guru / Siswa / Rekap Nilai (`TeacherAccountManagerPage`, `TeacherStudentManagerPage`, `TeacherGradebookPage`)
 */
export function DirectoryListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3.5 w-full animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-surface-variant/20 shadow-xs flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-40 sm:w-52 rounded-md" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full shrink-0" />
          </div>
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/**
 * 9. Skeleton untuk Lab Monitoring Guru (`TeacherDashboardPage.tsx`)
 */
export function MonitoringMatrixSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-fade-in">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-surface-container-lowest rounded-3xl p-6 shadow-xs border border-surface-variant/20 flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 10. Skeleton untuk E-Sertifikat (`StudentCertificatePage.tsx`)
 */
export function CertificateSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto animate-fade-in">
      <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-variant/20 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-3.5 w-2/3 rounded-md" />
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-variant/20 shadow-xs flex items-center justify-center">
        <Skeleton className="w-full h-64 sm:h-96 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * 11. Skeleton untuk Halaman Profil (`StudentProfilePage.tsx` & `TeacherProfilePage.tsx`)
 */
export function ProfilePageSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pt-6 pb-24 max-w-2xl mx-auto w-full animate-fade-in">
      {/* Avatar & Identity Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xs border border-surface-variant/20 flex flex-col items-center gap-3">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-6 w-48 rounded-md mt-1" />
        <Skeleton className="h-4 w-32 rounded-full" />
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
      </div>

      {/* Menu List Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-xs border border-surface-variant/20 flex flex-col gap-3">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * 12. Skeleton untuk Grafik & Aktivitas Beranda Guru (`TeacherHomePage.tsx`)
 */
export function TeacherHomeSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-5 sm:px-8 py-4 w-full animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xs border border-surface-variant/20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * 13. Skeleton untuk Halaman Login (`LoginPage.tsx`)
 */
export function LoginPageSkeleton() {
  return (
    <main className="relative min-h-screen overflow-x-clip p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-2xl" />
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-7 w-44 rounded-md" />
        <Skeleton className="h-4 w-56 rounded-md mb-2" />
        <div className="w-full bg-surface-container-lowest p-6 rounded-2xl shadow-xs border border-surface-variant/20 flex flex-col gap-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl mt-2" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </main>
  );
}

/**
 * 14. Skeleton untuk Landing Page (`LandingPage.tsx`)
 */
export function LandingPageSkeleton() {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="w-full px-6 py-4 flex items-center justify-between border-b border-surface-variant/20">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <div className="px-6 pt-24 pb-24 flex flex-col items-center gap-5 max-w-4xl mx-auto w-full">
        <Skeleton className="h-7 w-60 rounded-full" />
        <Skeleton className="h-12 w-4/5 rounded-xl" />
        <Skeleton className="h-12 w-3/5 rounded-xl" />
        <Skeleton className="h-4 w-3/4 rounded-md mt-2" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
          <Skeleton className="h-14 w-full sm:w-56 rounded-2xl" />
          <Skeleton className="h-14 w-full sm:w-56 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}


