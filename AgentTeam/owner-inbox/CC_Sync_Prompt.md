# Claude Code Prompt — Cross-Device Sync for day-planner.html

---

## SITUATION

`day-planner.html` works perfectly on the PC via `file:///`. The goal is to make it
accessible from anywhere (phone, tablet, any browser) with real-time data sync between
all devices. No manual export/import. Changes on the phone appear on the PC and vice versa.

## ARCHITECTURE

- **Front end**: `day-planner.html` deployed to GitHub Pages at `https://sbozzone.github.io/tasks/`
- **Back end**: Cloudflare Worker (free tier) with Cloudflare D1 (SQLite in the cloud) as the database
- **Sync model**: The HTML app talks directly to the Cloudflare Worker API from the browser.
  localStorage remains the local cache. On every app load and on a 60-second interval,
  the app syncs with D1. Changes are pushed immediately on mutation.

The files `worker.js`, `schema.sql`, and `sync.py` already exist in
`C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam\owner-inbox\`.
Read all three before starting. They are the foundation — do not rewrite them from scratch,
but do update them where the instructions below require it.

---

## PHASE 1 — Deploy the Cloudflare Worker (do this first, verify it works, then move to Phase 2)

### Step 1: Verify Wrangler is installed
```
wrangler --version
```
If not installed:
```
npm install -g wrangler
wrangler login
```

### Step 2: Create the D1 database
```
wrangler d1 create tasks-db
```
Copy the `database_id` from the output. You will need it in the next step.

### Step 3: Create wrangler.toml
Create `wrangler.toml` in the `owner-inbox` directory:
```toml
name = "tasks-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "tasks-db"
database_id = "PASTE_DATABASE_ID_HERE"
```
Replace `PASTE_DATABASE_ID_HERE` with the actual ID from Step 2.

### Step 4: Run the schema against D1
```
wrangler d1 execute tasks-db --file=schema.sql
```
Confirm it runs without errors before continuing.

### Step 5: Set the bearer token secret
Generate a random token (any long random string will do):
```
wrangler secret put BEARER_TOKEN
```
When prompted, enter the token. Save this token — it will be needed in Phase 2.

### Step 6: Deploy the worker
```
wrangler deploy
```
Note the worker URL from the output. It will be:
`https://tasks-worker.YOUR-SUBDOMAIN.workers.dev`

### Step 7: Verify the worker is live
```
curl https://tasks-worker.YOUR-SUBDOMAIN.workers.dev/quotes/today
```
Should return a JSON quote object. If it does, Phase 1 is complete.

---

## PHASE 2 — Update worker.js for browser-based sync

The existing `worker.js` was designed for `sync.py` (server-to-server). Update it for
**direct browser calls** with these changes:

### 2a. CORS — allow the GitHub Pages origin
Update the CORS headers object to allow the GitHub Pages domain:
```javascript
const CORS = {
  'Access-Control-Allow-Origin': 'https://sbozzone.github.io',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};
```
Also add a preflight handler at the very top of the fetch handler (already exists — verify it returns the updated CORS headers).

### 2b. Add a GET /tasks/all endpoint
The existing `GET /tasks?since=` endpoint is fine for incremental sync.
Add a companion that returns everything (used on first load):
```javascript
if (path === '/tasks/all' && method === 'GET') {
  const { results } = await env.DB.prepare(
    'SELECT * FROM tasks WHERE deleted=0 ORDER BY updated_at DESC'
  ).all();
  return json(results);
}
```

### 2c. Add GET /sections and GET /projects endpoints
The existing `GET /sections` endpoint is fine. Add `GET /projects`:
```javascript
if (path === '/projects' && method === 'GET') {
  const { results } = await env.DB.prepare('SELECT * FROM projects ORDER BY name').all();
  return json(results);
}
```
Add a `projects` table to schema.sql if it does not already exist:
```sql
CREATE TABLE IF NOT EXISTS projects (
  id   TEXT PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT OR IGNORE INTO projects (id, name) VALUES
  ('tmm7sn5vj013c7', 'YT-RR'),
  ('tmm7uk09lui3qi', 'WW Biz'),
  ('tmm7ul56yqrjp7', 'Shop'),
  ('tmm8f5fq7b0lsx', 'Personal'),
  ('tmm9r7d4hs4icc', 'Engineering');
```
Run the updated schema against D1:
```
wrangler d1 execute tasks-db --file=schema.sql
```

### 2d. Redeploy
```
wrangler deploy
```

---

## PHASE 3 — Add sync layer to day-planner.html

Open `day-planner.html`. Add a sync module. Do not restructure the existing app —
add the sync layer as a self-contained block of JS near the top of the script section,
under a clear `// ── SYNC MODULE ──` comment.

### 3a. Config block (user edits these two lines after deploy)
```javascript
const SYNC_CONFIG = {
  workerUrl: 'https://tasks-worker.YOUR-SUBDOMAIN.workers.dev', // ← set after deploy
  token: 'YOUR-BEARER-TOKEN',   // ← set to the wrangler secret value
  enabled: true,                // set false to disable sync entirely
};
```

### 3b. Sync state
```javascript
const syncState = {
  lastSyncedAt: localStorage.getItem('dp_last_synced_at') || null,
  syncing: false,
  online: navigator.onLine,
};
```

### 3c. Push function — called after every local mutation
```javascript
async function pushTask(task) {
  if (!SYNC_CONFIG.enabled || !syncState.online) return;
  const method = task._isNew ? 'POST' : 'PATCH';
  const url = task._isNew
    ? `${SYNC_CONFIG.workerUrl}/tasks`
    : `${SYNC_CONFIG.workerUrl}/tasks/${task.id}`;
  const body = { ...task };
  delete body._isNew;
  try {
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNC_CONFIG.token}`,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.warn('Sync push failed:', e);
  }
}
```

### 3d. Pull function — called on app load and every 60 seconds
```javascript
async function pullTasks() {
  if (!SYNC_CONFIG.enabled || !syncState.online || syncState.syncing) return;
  syncState.syncing = true;
  updateSyncIndicator('syncing');
  try {
    const since = syncState.lastSyncedAt;
    const url = since
      ? `${SYNC_CONFIG.workerUrl}/tasks?since=${encodeURIComponent(since)}`
      : `${SYNC_CONFIG.workerUrl}/tasks/all`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${SYNC_CONFIG.token}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const remote = await res.json();
    mergeRemoteTasks(remote);
    syncState.lastSyncedAt = new Date().toISOString();
    localStorage.setItem('dp_last_synced_at', syncState.lastSyncedAt);
    updateSyncIndicator('ok');
  } catch (e) {
    console.warn('Sync pull failed:', e);
    updateSyncIndicator('error');
  } finally {
    syncState.syncing = false;
  }
}
```

### 3e. Merge function — last-write-wins by updated_at
```javascript
function mergeRemoteTasks(remoteTasks) {
  const local = loadTasks(); // existing localStorage load function
  const localMap = new Map(local.map(t => [t.id, t]));
  let changed = false;
  for (const remote of remoteTasks) {
    const existing = localMap.get(remote.id);
    if (!existing || remote.updated_at > (existing.updated_at || '')) {
      // Parse JSON fields that D1 stores as strings
      if (typeof remote.tags === 'string') remote.tags = JSON.parse(remote.tags || '[]');
      if (typeof remote.subtasks === 'string') remote.subtasks = JSON.parse(remote.subtasks || '[]');
      localMap.set(remote.id, remote);
      changed = true;
    }
  }
  if (changed) {
    saveTasks([...localMap.values()]);
    renderCurrentView(); // re-render whatever view is active
  }
}
```

### 3f. Sync indicator in the header
Add a small sync status dot to the app header (next to the app title).
Three states:
- `ok` → green dot, tooltip "Synced"
- `syncing` → pulsing amber dot, tooltip "Syncing..."
- `error` → grey dot, tooltip "Offline — changes saved locally"
- `offline` → grey dot

```javascript
function updateSyncIndicator(state) {
  const dot = document.getElementById('sync-dot');
  if (!dot) return;
  dot.className = 'sync-dot ' + state;
  const labels = { ok: 'Synced', syncing: 'Syncing...', error: 'Offline', offline: 'Offline' };
  dot.title = labels[state] || '';
}
```

Add to header HTML:
```html
<span id="sync-dot" class="sync-dot offline" title="Offline"></span>
```

Add CSS:
```css
.sync-dot {
  width: 7px; height: 7px; border-radius: 50%;
  display: inline-block; margin-left: 6px; vertical-align: middle;
  transition: background 0.3s;
}
.sync-dot.ok      { background: #3fb97a; }
.sync-dot.syncing { background: #f0a500; animation: pulse 1s infinite; }
.sync-dot.error   { background: #aaa; }
.sync-dot.offline { background: #aaa; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
```

### 3g. Wire up sync lifecycle
Add to app initialization (after localStorage load):
```javascript
// Sync on load
pullTasks();

// Sync every 60 seconds
setInterval(pullTasks, 60_000);

// Sync when tab becomes visible (phone switching apps)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') pullTasks();
});

// Track online/offline
window.addEventListener('online',  () => { syncState.online = true;  pullTasks(); });
window.addEventListener('offline', () => { syncState.online = false; updateSyncIndicator('offline'); });
```

### 3h. Wire pushTask into every mutation
Every function in `day-planner.html` that writes a task to localStorage must also call
`pushTask(task)` immediately after the localStorage write.
Search for every call to `saveTasks(` or `localStorage.setItem('dp_tasks'` and add the push.
For new tasks, set `task._isNew = true` before calling `pushTask`, then delete that flag.
For deletions, call:
```javascript
await fetch(`${SYNC_CONFIG.workerUrl}/tasks/${id}`, {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${SYNC_CONFIG.token}` }
});
```

---

## PHASE 4 — Seed D1 with existing task data

Once the worker is deployed and the HTML is updated, do a one-time push of all existing
localStorage data to D1 using the updated `sync.py`.

Update these two lines in `sync.py`:
```python
WORKER_URL   = "https://tasks-worker.YOUR-SUBDOMAIN.workers.dev"
WORKER_TOKEN = "YOUR-BEARER-TOKEN"
```

Then run:
```
python sync.py --push-only
```

This pushes all local SQLite tasks to D1. After this, the phone will pull them on first load.

If the local SQLite DB (`db/max.db`) does not have the imported tasks yet, run the import first:
```
python sync.py --import-ls bozzone-tasks-2026-03-28.json
python sync.py --push-only
```

---

## PHASE 5 — Deploy HTML to GitHub Pages

### 5a. Copy day-planner.html to the tasks repo
The `sbozzone/tasks` GitHub repo should already be cloned locally.
Find the clone path — it may be referenced in `sync.py` as `TASKS_REPO`.
Copy the updated `day-planner.html` to that repo as `index.html`:
```
copy "C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam\owner-inbox\day-planner.html" "TASKS_REPO_PATH\index.html"
```

### 5b. Commit and push
```
cd TASKS_REPO_PATH
git add index.html
git commit -m "deploy: day-planner with cross-device sync"
git push origin main
```

### 5c. Verify
Open `https://sbozzone.github.io/tasks/` in a browser.
Open it on your phone.
Add a task on the phone. Within 60 seconds (or on next focus) it should appear on the PC.

---

## PHASE 6 — PWA (Install to Phone Home Screen)

Add a Web App Manifest and Service Worker so the phone can install it like a native app
and load offline (cached shell, sync when online).

### 6a. Add manifest to day-planner.html (inline, no separate file needed for GitHub Pages)
Add in `<head>`:
```html
<link rel="manifest" href="data:application/manifest+json,{
  %22name%22:%22Day Planner%22,
  %22short_name%22:%22Planner%22,
  %22start_url%22:%22https://sbozzone.github.io/tasks/%22,
  %22display%22:%22standalone%22,
  %22background_color%22:%22%23F7F6F2%22,
  %22theme_color%22:%22%23D97757%22,
  %22icons%22:[{%22src%22:%22https://fav.farm/📋%22,%22sizes%22:%22192x192%22,%22type%22:%22image/png%22}]
}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Day Planner">
<meta name="theme-color" content="#D97757">
```

### 6b. Add inline Service Worker registration
Add at the bottom of the `<script>` block:
```javascript
if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE = 'day-planner-v1';
    self.addEventListener('install', e => {
      e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/tasks/'])));
    });
    self.addEventListener('fetch', e => {
      if (e.request.url.includes('workers.dev')) return; // never cache API calls
      e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
      );
    });
  `;
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swUrl, { scope: '/tasks/' })
    .catch(e => console.warn('SW registration failed:', e));
}
```

---

## DELIVERABLES

After all phases complete:

1. `owner-inbox/wrangler.toml` — created with correct database_id
2. `owner-inbox/worker.js` — updated with CORS fix, /tasks/all, /projects endpoints
3. `owner-inbox/schema.sql` — updated with projects table + seed data
4. `owner-inbox/day-planner.html` — updated with full sync module + PWA manifest
5. `owner-inbox/sync.py` — updated with correct WORKER_URL and WORKER_TOKEN

The live URL: `https://sbozzone.github.io/tasks/`

---

## VERIFICATION CHECKLIST

- [ ] `curl .../quotes/today` returns JSON (worker is live)
- [ ] `day-planner.html` loads at GitHub Pages URL
- [ ] Sync dot shows green after load
- [ ] Add task on PC → appears on phone within 60 seconds
- [ ] Add task on phone → appears on PC on next focus
- [ ] App installs to phone home screen via "Add to Home Screen"
- [ ] App loads offline (shows cached version, syncs when back online)
- [ ] No CORS errors in browser console

---

## IMPORTANT NOTES FOR CLAUDE CODE

- Do phases in order. Do not start Phase 3 until Phase 1 is verified working.
- After deploying the worker, show Stephen the worker URL and ask him to confirm
  before proceeding to Phase 3.
- The SYNC_CONFIG block in day-planner.html uses placeholder values. After the worker
  is deployed, replace them with the real URL and token before the GitHub push.
- Do not touch the existing UI, views, or data model in day-planner.html.
  Only add the sync module and PWA additions. Existing functionality must not break.
- If wrangler is not installed and npm is not available, stop and tell Stephen to run
  `npm install -g wrangler` manually, then resume from Phase 1 Step 2.
