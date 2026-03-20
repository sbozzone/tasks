/* ================================================================
   DATE UTILITIES — shared date helpers for Bozzone Tasks.

   Loaded by index.html (which calls parseDateFromTitle when the
   "Parse dates from titles" setting is enabled).  The logic here
   covers all natural-language patterns the app recognises.
   ================================================================ */

/* ── Internal helpers ─────────────────────────────────────────── */

/**
 * Format a Date object as 'YYYY-MM-DD' (ISO date, no time part).
 * Used throughout this module; also used by index.html's rendering.
 * @param {Date} d
 * @returns {string}
 */
function fmtDate(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/**
 * Return a new Date that is `n` days after `d`.
 * Does not mutate the original Date.
 * @param {Date} d
 * @param {number} n - number of days to add (may be negative)
 * @returns {Date}
 */
function addDays(d, n) {
  var r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/* ── Public API ───────────────────────────────────────────────── */

/**
 * Attempt to extract a due date from a task title string.
 *
 * Recognised patterns (case-insensitive, English only):
 *   "today"                → today's date
 *   "tomorrow"             → tomorrow
 *   "in N days"            → N days from now
 *   "in N weeks"           → N * 7 days from now
 *   "next week"            → 7 days from now
 *   "monday" / "tuesday" … → next occurrence of that weekday
 *   "next monday" …        → at least 7 days ahead on that weekday
 *   "jan 15" / "january 15th" … → nearest future occurrence of that date
 *
 * @param {string} text - raw task title
 * @returns {string|null} 'YYYY-MM-DD' string, or null if no date found
 */
function parseDateFromTitle(text) {
  if (!text) return null;
  var t = text.toLowerCase();

  /* Baseline: midnight today in local time */
  var now = new Date();
  now.setHours(0, 0, 0, 0);

  /* ── Relative keywords ── */
  if (/\btoday\b/.test(t))    return fmtDate(now);
  if (/\btomorrow\b/.test(t)) return fmtDate(addDays(now, 1));

  /* "in N days" / "in N weeks" */
  var m = t.match(/\bin\s+(\d+)\s+days?\b/);
  if (m) return fmtDate(addDays(now, parseInt(m[1], 10)));
  m = t.match(/\bin\s+(\d+)\s+weeks?\b/);
  if (m) return fmtDate(addDays(now, parseInt(m[1], 10) * 7));

  /* "next week" (≡ +7 days) */
  if (/\bnext\s+week\b/.test(t)) return fmtDate(addDays(now, 7));

  /* ── Day names ── */
  var DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var dayPattern = '(' + DAY_NAMES.join('|') + ')';
  var nextPfx = new RegExp('\\bnext\\s+' + dayPattern + '\\b').exec(t);
  var dayPfx  = new RegExp('\\b' + dayPattern + '\\b').exec(t);
  var dayMatch = nextPfx || dayPfx;
  if (dayMatch) {
    var target = DAY_NAMES.indexOf(dayMatch[1]);
    var diff   = target - now.getDay();
    /* Always move forward; if "next <day>" force at least +7 */
    if (diff <= 0 || nextPfx) diff += 7;
    return fmtDate(addDays(now, diff));
  }

  /* ── Month + day: "jan 15", "january 15th" ── */
  var MONTH_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                     'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var MONTH_LONG  = ['january', 'february', 'march', 'april', 'may', 'june',
                     'july', 'august', 'september', 'october', 'november', 'december'];
  for (var i = 0; i < 12; i++) {
    var re = new RegExp(
      '\\b(' + MONTH_SHORT[i] + '|' + MONTH_LONG[i] + ')' +
      '\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b'
    );
    var mo = re.exec(t);
    if (mo) {
      var day = parseInt(mo[2], 10);
      var yr  = now.getFullYear();
      var candidate = new Date(yr, i, day);
      /* Roll to next year if the date has already passed this year */
      if (candidate < now) candidate.setFullYear(yr + 1);
      return fmtDate(candidate);
    }
  }

  return null;
}
