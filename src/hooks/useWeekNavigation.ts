"use client";

import { useState, useCallback } from "react";
import { getWeekStart, formatWeekLabel } from "@/lib/utils";
import { addDays, parseISO } from "date-fns";
import { format } from "date-fns";

export function useWeekNavigation() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());

  const weekLabel = formatWeekLabel(weekStart);

  const goToPrevWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = addDays(parseISO(prev), -7);
      return format(d, "yyyy-MM-dd");
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = addDays(parseISO(prev), 7);
      return format(d, "yyyy-MM-dd");
    });
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getWeekStart());
  }, []);

  return { weekStart, weekLabel, goToPrevWeek, goToNextWeek, goToToday };
}
