"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export function WeekNavigation({
  weekLabel,
  onPrev,
  onNext,
  onToday,
  onClearWeek,
}: {
  weekLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onClearWeek: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="p-2 rounded-lg text-text-secondary hover:bg-card-header transition-colors min-h-touch min-w-[44px] flex items-center justify-center"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onToday}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-card-header transition-colors"
        >
          {weekLabel}
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-lg text-text-secondary hover:bg-card-header transition-colors min-h-touch min-w-[44px] flex items-center justify-center"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <button
        onClick={onClearWeek}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-text-muted hover:text-red hover:bg-red/5 rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Clear</span>
      </button>
    </div>
  );
}
