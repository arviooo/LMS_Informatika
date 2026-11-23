import { AnimatedVisual } from '../ui/AnimatedVisuals';

export default function TipsCard() {
  return (
    <div className="bg-gradient-to-r from-amber-100/90 via-yellow-50 to-orange-100/80 rounded-3xl p-5 shadow-sm flex items-start gap-3.5 border-2 border-amber-300/80 relative overflow-hidden">
      {/* Icon */}
      <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 border-2 border-amber-300 shadow-sm p-1.5">
        <AnimatedVisual type="lightbulb" className="w-8 h-8" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] font-black text-amber-950 mb-1 flex items-center gap-1.5">
          <span>Tips Informatika Hari Ini</span>
        </p>
        <p className="text-[11px] text-amber-900/85 leading-relaxed font-semibold">
          Dekomposisi adalah memecah masalah rumit menjadi bagian-bagian kecil yang mudah
          diselesaikan satu per satu. Coba terapkan saat mengerjakan tugas!
        </p>
      </div>
    </div>
  );
}
