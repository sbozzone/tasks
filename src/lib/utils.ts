import {
  format,
  startOfWeek,
  addDays,
  isToday,
  parseISO,
} from "date-fns";

export function getWeekStart(date: Date = new Date()): string {
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, "yyyy-MM-dd");
}

export function getWeekDays(weekStart: string) {
  const start = parseISO(weekStart);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date: format(date, "yyyy-MM-dd"),
      dayName: format(date, "EEEE"),
      shortName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      isToday: isToday(date),
    };
  });
}

export function formatWeekLabel(weekStart: string): string {
  const start = parseISO(weekStart);
  return `Week of ${format(start, "MMMM d")}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
