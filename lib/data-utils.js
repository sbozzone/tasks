/* ================================================================
   DATA UTILITIES — shared data-model helpers for Bozzone Tasks.

   Loaded by both index.html and myday.html before their own script
   blocks so that uid(), findSec(), ensureArrays() etc. are
   available to both pages from a single source of truth.
   ================================================================ */

/* ── Default tags ─────────────────────────────────────────────── */

/**
 * Initial tag set used when a brand-new data store is created.
 * Stored here so both pages and ensureArrays() can reference them.
 * @type {Array<{id:string, name:string, color:string}>}
 */
var DEFAULT_TAGS = [
  { id: 'tag-work',     name: 'Work',     color: '#4A90D9' },
  { id: 'tag-shop',     name: 'Shop',     color: '#5CC1A9' },
  { id: 'tag-business', name: 'Business', color: '#D97757' }
];

/* ── ID generation ────────────────────────────────────────────── */

/**
 * Generate a unique ID suitable for tasks, sections, and tags.
 * Format: 't' + base-36 timestamp + 5 random alphanumeric chars.
 * Collisions are astronomically unlikely within a single user session.
 * @returns {string}
 */
function uid() {
  return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ── Lookup helpers ───────────────────────────────────────────── */

/**
 * Find a section in the global appData by its ID.
 * Returns null when the section does not exist (e.g. was deleted).
 * @param {string} id - section ID
 * @returns {Object|null}
 */
function findSec(id) {
  var secs = appData.sections || [];
  for (var i = 0; i < secs.length; i++) {
    if (secs[i].id === id) return secs[i];
  }
  return null;
}

/**
 * Find a tag in the global appData by its ID.
 * @param {string} id - tag ID
 * @returns {Object|null}
 */
function findTag(id) {
  var tags = appData.tags || [];
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].id === id) return tags[i];
  }
  return null;
}

/* ── Data normalisation ───────────────────────────────────────── */

/**
 * Normalise raw data loaded from Firebase or localStorage.
 *
 * Firebase Realtime Database returns plain objects wherever the
 * client stored arrays; this function converts those back.  It also
 * runs all field-name migrations accumulated across app versions:
 *
 *   groups    → projects  (renamed in v2)
 *   groupId   → projectId (renamed in v2)
 *   isMailbox → isInbox   (renamed in v2)
 *   text      → title     (renamed early on)
 *   desc      → description
 *   done      → status    (status enum introduced in v2)
 *   'todo'    → 'not_started'
 *   'inprogress' → 'in_progress'
 *
 * Safe to call multiple times — migrations are guarded by
 * `=== undefined` / `!Array.isArray` checks.
 *
 * @param {Object|null} data - raw object from Firebase or JSON.parse
 * @returns {Object} - normalised data with sections/tags/projects arrays
 */
function ensureArrays(data) {
  /* Bootstrap empty data store */
  if (!data) {
    return {
      sections: [],
      tags: DEFAULT_TAGS.map(function(t) { return { id: t.id, name: t.name, color: t.color }; }),
      projects: []
    };
  }

  /* ── Top-level arrays ── */
  if (!data.sections) data.sections = [];
  if (!Array.isArray(data.sections)) data.sections = Object.values(data.sections);

  /* Seed default tags on first load if none are stored */
  if (!data.tags) {
    data.tags = DEFAULT_TAGS.map(function(t) { return { id: t.id, name: t.name, color: t.color }; });
  }
  if (!Array.isArray(data.tags)) data.tags = Object.values(data.tags);

  /* Migrate groups → projects */
  if (!data.projects) {
    data.projects = data.groups
      ? (Array.isArray(data.groups) ? data.groups : Object.values(data.groups))
      : [];
  }
  if (!Array.isArray(data.projects)) data.projects = Object.values(data.projects);

  /* ── Per-section migrations ── */
  data.sections.forEach(function(sec) {
    /* groupId → projectId */
    if (sec.projectId === undefined) {
      sec.projectId = (sec.groupId !== undefined ? sec.groupId : null);
    }
    /* isMailbox → isInbox */
    if (sec.isInbox === undefined) sec.isInbox = !!sec.isMailbox;

    /* Ensure tasks is an array (Firebase may return an object) */
    if (!sec.tasks) sec.tasks = [];
    if (!Array.isArray(sec.tasks)) sec.tasks = Object.values(sec.tasks);

    /* ── Per-task migrations ── */
    sec.tasks.forEach(function(task) {
      /* tags must be an array */
      if (!task.tags) task.tags = [];
      if (!Array.isArray(task.tags)) task.tags = Object.values(task.tags);

      /* text → title */
      if (!task.title && task.text) task.title = task.text;
      if (!task.title) task.title = '';
      task.text = task.title; /* keep in sync for legacy read paths */

      /* desc → description */
      if (!task.description && task.desc !== undefined) task.description = task.desc;
      if (task.description === undefined) task.description = '';

      /* Status enum migration */
      if (!task.status) task.status = task.done ? 'done' : 'not_started';
      if (task.status === 'todo')       task.status = 'not_started';
      if (task.status === 'inprogress') task.status = 'in_progress';
      task.done = (task.status === 'done'); /* keep boolean in sync */

      /* Optional fields default to neutral values */
      if (!task.subtasks) task.subtasks = [];
      if (!Array.isArray(task.subtasks)) task.subtasks = [];

      /* Migrate subtask text → title */
      task.subtasks.forEach(function(sub) {
        if (!sub.title && sub.text) sub.title = sub.text;
        if (!sub.title) sub.title = '';
      });

      if (task.priority      === undefined) task.priority      = null;
      if (task.dueDate       === undefined) task.dueDate       = null;
      if (task.startDate     === undefined) task.startDate     = null;
      if (task.completedDate === undefined) task.completedDate = null;
      if (task.notes         === undefined) task.notes         = '';
      if (task.recurrence    === undefined) task.recurrence    = null;
    });
  });

  return data;
}
