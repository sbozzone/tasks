"use client";

import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayPlan, MealPlan } from "@/types/database";

export function DayCard({
  day,
  onTapToAssign,
  onRemoveMeal,
}: {
  day: DayPlan;
  onTapToAssign: (date: string) => void;
  onRemoveMeal: (mealId: string) => void;
}) {
  const hasMeals = day.meals.length > 0;

  return (
    <div
      className={cn(
        "rounded-card border transition-colors",
        day.isToday
          ? "border-accent/40 bg-accent-light/50"
          : "border-border-light bg-card"
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-light/50">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium text-sm",
              day.isToday ? "text-accent font-semibold" : "text-text"
            )}
          >
            {day.dayName}
          </span>
          <span className="text-xs text-text-muted">{day.dayNumber}</span>
        </div>
        {day.isToday && (
          <span className="text-[10px] font-bold text-white bg-accent px-2 py-0.5 rounded-full uppercase tracking-wider">
            Today
          </span>
        )}
      </div>

      <div className="p-3 min-h-[60px]">
        {hasMeals ? (
          <div className="space-y-2">
            {day.meals.map((meal) => (
              <MealChip key={meal.id} meal={meal} onRemove={onRemoveMeal} />
            ))}
          </div>
        ) : (
          <button
            onClick={() => onTapToAssign(day.date)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-border text-text-muted hover:border-accent/40 hover:text-accent hover:bg-accent-light/30 transition-colors min-h-touch"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add dinner</span>
          </button>
        )}
      </div>
    </div>
  );
}

function MealChip({
  meal,
  onRemove,
}: {
  meal: MealPlan;
  onRemove: (id: string) => void;
}) {
  const name = meal.dish?.name || meal.custom_name || "Unknown dish";

  return (
    <div className="flex items-center gap-2 bg-accent-light/70 text-accent-dark rounded-lg px-3 py-2.5 group">
      <span className="flex-1 text-sm font-medium truncate">{name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(meal.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-accent/10 transition-all shrink-0 sm:opacity-100"
        aria-label={`Remove ${name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
