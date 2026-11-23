import type { Material, StudentProgress, Topic } from '@lms/shared';

import Icon from '../../components/Icon';
interface ReadingCardProps {
  material: Material;
  progress: StudentProgress;
  topic?: Topic;
  onResume?: () => void;
}

export default function ReadingCard({
  material,
  progress,
  topic,
  onResume,
}: ReadingCardProps) {
  const currentPage = progress.current_page ?? 0;
  const totalPages = material.total_pages ?? 0;
  const remainingPages = totalPages - currentPage;
  const estimatedMinutes = Math.max(1, Math.ceil(remainingPages * 0.35));

  return (
    <div className="bg-surface-container-lowest rounded-xl p-[var(--space-md)] shadow-sm border border-primary-fixed/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Icon name="auto_stories" className="text-[16px] text-primary icon-filled" />
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
            Melanjutkan Bacaan
          </span>
        </div>
        {/* Status Badge */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-tertiary">
          <Icon name="schedule" className="text-[12px] icon-filled" />
          <span className="text-[10px] font-semibold">Belum Selesai</span>
        </div>
      </div>

      {/* Topic Reference */}
      {topic && (
        <p className="text-[10px] text-primary font-semibold mb-0.5 tracking-wide">
          Bab {topic.chapter_number}: {topic.title}
        </p>
      )}

      {/* Title */}
      <h3 className="text-headline-sm text-on-surface mb-1.5 leading-snug">
        {material.title}
      </h3>

      {/* Progress Info */}
      <p className="text-body-sm text-on-surface-variant mb-4">
        Halaman {currentPage} dari {totalPages} • Sisa estimasi baca sekitar{' '}
        {estimatedMinutes} menit lagi.
      </p>

      {/* Resume Button */}
      <button
        className="
          w-full h-11 rounded-xl
          bg-primary-fixed text-on-primary-fixed
          text-label-md
          flex items-center justify-center gap-2
          hover:bg-primary-fixed-dim transition-colors
          active:scale-[0.99] duration-150
        "
        onClick={onResume}
        type="button"
      >
        <Icon name="play_circle" className="icon-sm icon-filled" />
        <span>Lanjutkan Membaca</span>
      </button>
    </div>
  );
}
