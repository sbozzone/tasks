/* ================================================================
   STORAGE HELPER — centralised localStorage access for Bozzone Tasks.

   Both index.html and myday.html import this file.  All localStorage
   key strings are defined here as constants so they can never go out
   of sync between pages, and all reads/writes funnel through small
   typed helpers that make call-sites easier to understand.

   Key layout:
     bozzone-app-v3         → current app data (JSON)
     bozzone-app-v2         → previous version (migration source)
     bozzone-states         → legacy v1 checkbox object (migration source)
     bozzone-sync-key       → Firebase sync identifier
     bozzone-add-top        → boolean setting ('0'/'1')
     bozzone-completion-sound → boolean setting
     bozzone-parse-dates    → boolean setting
     bozzone-notifications  → boolean setting
     bozzone-myday-done-open → whether completed section is expanded
     myday-accent           → accent hex colour chosen in My Day
     myday-bg-image         → background image (base64 data URL)
     bozzone-shortcut-seen  → idempotency list for iOS Shortcuts
     bozzone-shortcut-last  → dedupe guard for rapid re-submissions
     bozzone-touch-debug    → enable touch-debug overlay (dev)
   ================================================================ */

/** @type {Object.<string,string>} localStorage key constants */
var STORAGE_KEYS = {
  APP_DATA_V3:      'bozzone-app-v3',
  APP_DATA_V2:      'bozzone-app-v2',
  APP_DATA_LEGACY:  'bozzone-states',
  SYNC_KEY:         'bozzone-sync-key',
  ADD_TOP:          'bozzone-add-top',
  COMPLETION_SOUND: 'bozzone-completion-sound',
  PARSE_DATES:      'bozzone-parse-dates',
  NOTIFICATIONS:    'bozzone-notifications',
  MYDAY_DONE_OPEN:  'bozzone-myday-done-open',
  MYDAY_ACCENT:     'myday-accent',
  MYDAY_BG_IMAGE:   'myday-bg-image',
  SHORTCUT_SEEN:    'bozzone-shortcut-seen',
  SHORTCUT_LAST:    'bozzone-shortcut-last',
  TOUCH_DEBUG:      'bozzone-touch-debug',
  DARK_MODE:        'bozzone-dark'
};

/* ── Generic wrappers ─────────────────────────────────────────── */

/**
 * Read a string value from localStorage.
 * @param {string} key
 * @returns {string|null}
 */
function storageGet(key) {
  return localStorage.getItem(key);
}

/**
 * Write a string value to localStorage.
 * @param {string} key
 * @param {string} val
 */
function storageSet(key, val) {
  localStorage.setItem(key, val);
}

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
function storageRemove(key) {
  localStorage.removeItem(key);
}

/* ── Boolean helpers ──────────────────────────────────────────── */

/**
 * Read a boolean setting stored as the string '0' or '1'.
 * @param {string} key - one of STORAGE_KEYS
 * @returns {boolean}
 */
function storageGetBool(key) {
  return localStorage.getItem(key) === '1';
}

/**
 * Persist a boolean setting as '0' or '1'.
 * @param {string} key  - one of STORAGE_KEYS
 * @param {boolean} val
 */
function storageSetBool(key, val) {
  localStorage.setItem(key, val ? '1' : '0');
}

/* ── App-data helpers ─────────────────────────────────────────── */

/**
 * Load raw app data from localStorage, trying v3 first then v2.
 * Returns the parsed object, or null if nothing is stored yet.
 * Callers are responsible for running ensureArrays() on the result.
 * @returns {Object|null}
 */
function storageLoadRawData() {
  try {
    var s3 = localStorage.getItem(STORAGE_KEYS.APP_DATA_V3);
    if (s3) return JSON.parse(s3);
    /* Fallback: migrate from v2 format */
    var s2 = localStorage.getItem(STORAGE_KEYS.APP_DATA_V2);
    if (s2) return JSON.parse(s2);
  } catch (e) {}
  return null;
}

/**
 * Persist the main app data object to localStorage (v3 slot).
 * Silently swallows QuotaExceededError — the app still works with
 * Firebase as the primary store even when localStorage is full.
 * @param {Object} data - the current appData object
 */
function storageSaveData(data) {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_DATA_V3, JSON.stringify(data));
  } catch (e) {
    /* localStorage full — not fatal when Firebase sync is active */
  }
}
