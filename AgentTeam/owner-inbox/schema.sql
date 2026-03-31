-- ============================================================
-- Max Agent Team — Task Tracker Schema
-- Run once: python -c "import sqlite3; conn=sqlite3.connect('db/max.db'); conn.executescript(open('owner-inbox/schema.sql').read()); conn.close(); print('Done')"
-- ============================================================

-- Sections (kanban columns)
CREATE TABLE IF NOT EXISTS sections (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  icon        TEXT DEFAULT '📋',
  priority    INTEGER DEFAULT 0,
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL,
  color TEXT DEFAULT '#4A90D9'
);

-- Tasks (full schema)
CREATE TABLE IF NOT EXISTS tasks (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT,
  notes          TEXT,
  status         TEXT DEFAULT 'not_started',   -- not_started | in_progress | blocked | done
  priority       TEXT,                          -- low | medium | high | urgent
  due_date       TEXT,                          -- YYYY-MM-DD
  start_date     TEXT,                          -- YYYY-MM-DD
  completed_date TEXT,                          -- YYYY-MM-DD
  recurrence     TEXT,                          -- JSON: {"type":"daily","interval":1}
  tags           TEXT DEFAULT '[]',             -- JSON array of tag IDs
  subtasks       TEXT DEFAULT '[]',             -- JSON array of {id,title,done}
  section_id     TEXT REFERENCES sections(id),
  agent          TEXT,                          -- assigned agent (e.g. "Reed")
  domain         TEXT,                          -- YourStory | Woodworking | Personal | Retooling Retirement
  my_day         INTEGER DEFAULT 0,             -- 1 = show in My Day today
  my_day_pinned  INTEGER DEFAULT 0,             -- 1 = manually pinned (carries over daily)
  my_day_date    TEXT,                          -- YYYY-MM-DD when last pinned
  done           INTEGER DEFAULT 0,
  deleted        INTEGER DEFAULT 0,
  created_at     TEXT DEFAULT (datetime('now')),
  updated_at     TEXT DEFAULT (datetime('now')),
  synced_at      TEXT                           -- last synced to Cloudflare D1
);

-- Daily quotes (shown in My Day view)
CREATE TABLE IF NOT EXISTS daily_quotes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  quote      TEXT NOT NULL,
  author     TEXT,
  active     INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Calendar events cache (synced from Google Calendar)
CREATE TABLE IF NOT EXISTS calendar_events (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  start_time  TEXT,
  end_time    TEXT,
  all_day     INTEGER DEFAULT 0,
  location    TEXT,
  description TEXT,
  calendar_id TEXT,
  event_date  TEXT,
  cached_at   TEXT
);

-- Sync log
CREATE TABLE IF NOT EXISTS sync_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  direction  TEXT,    -- push | pull | export
  records    INTEGER DEFAULT 0,
  status     TEXT,    -- ok | error
  message    TEXT,
  synced_at  TEXT DEFAULT (datetime('now'))
);

-- Keep existing tables (do not drop)
CREATE TABLE IF NOT EXISTS journal_entries (
  id         INTEGER PRIMARY KEY,
  date       TEXT,
  entry      TEXT,
  mood       TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  status      TEXT,
  owner       TEXT,
  start_date  TEXT,
  end_date    TEXT,
  description TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY,
  name       TEXT,
  role       TEXT,
  email      TEXT,
  phone      TEXT,
  company    TEXT,
  notes      TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS woodworking_projects (
  id         INTEGER PRIMARY KEY,
  name       TEXT,
  status     TEXT,
  wood_type  TEXT,
  dimensions TEXT,
  joinery    TEXT,
  finish     TEXT,
  notes      TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS team_roster (
  id         INTEGER PRIMARY KEY,
  name       TEXT UNIQUE,
  role       TEXT,
  personality TEXT,
  tools      TEXT,
  skills     TEXT,
  status     TEXT,
  hired_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Migrate business_tasks (local SQLite only — not run on D1)
-- INSERT OR IGNORE INTO tasks (id, title, status, agent, domain, created_at, updated_at)
-- SELECT 'bt-' || id, task, LOWER(REPLACE(COALESCE(status,'Open'), ' ', '_')),
--   assigned_to, category, created_at, created_at
-- FROM business_tasks;

-- Seed default sections
INSERT OR IGNORE INTO sections (id, title, icon, sort_order) VALUES
  ('sec-yourstory',  'YourStory',      '🪑', 0),
  ('sec-woodworking','Woodworking',    '🪵', 1),
  ('sec-personal',   'Personal',       '🌿', 2),
  ('sec-shopping',   'Shopping List',  '🛒', 3),
  ('sec-inbox',      'Inbox',          '📥', 4);

-- Seed default tags
INSERT OR IGNORE INTO tags (id, name, color) VALUES
  ('tag-work',     'Work',     '#4A90D9'),
  ('tag-personal', 'Personal', '#5CC1A9'),
  ('tag-urgent',   'Urgent',   '#E74C3C'),
  ('tag-idea',     'Idea',     '#9B59B6');

-- Seed starter quotes
INSERT OR IGNORE INTO daily_quotes (quote, author) VALUES
  ('The secret of getting ahead is getting started.', 'Mark Twain'),
  ('It always seems impossible until it''s done.', 'Nelson Mandela'),
  ('Done is better than perfect.', 'Sheryl Sandberg'),
  ('Small steps every day.', NULL),
  ('Focus on the work, not the worry.', NULL),
  ('One good thing at a time.', NULL),
  ('Make something today.', NULL),
  ('Measure twice, cut once.', 'Woodworker''s proverb'),
  ('The best time to plant a tree was 20 years ago. The second best time is now.', 'Chinese proverb'),
  ('Creativity is intelligence having fun.', 'Albert Einstein');

-- Seed project map (used by worker /projects endpoint)
INSERT OR IGNORE INTO projects (id, name) VALUES
  ('tmm7sn5vj013c7', 'YT-RR'),
  ('tmm7uk09lui3qi', 'WW Biz'),
  ('tmm7ul56yqrjp7', 'Shop'),
  ('tmm8f5fq7b0lsx', 'Personal'),
  ('tmm9r7d4hs4icc', 'Engineering');
