"""
Max Agent Team — Sync Script
Bidirectional sync: local SQLite ↔ Cloudflare D1 + GitHub push

Usage:
  python sync.py                    # full sync: pull D1 → local, push local → D1, export HTML, push GitHub
  python sync.py --pull-only        # pull from D1 into local SQLite only
  python sync.py --push-only        # push local SQLite to D1 + GitHub only
  python sync.py --export           # regenerate index.html from local data only (no network)
  python sync.py --import-ls FILE   # import localStorage JSON export into local SQLite (one-time migration)
"""

import argparse
import json
import os
import re
import sqlite3
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import urllib.request
import urllib.error

# ─── CONFIG ─────────────────────────────────────────────────────────────────
WORKER_URL   = "https://tasks-worker.sbozzone.workers.dev"
WORKER_TOKEN = "vDcBjaApsCPuAIUIwfg9SwvlzuLI3npaKpi28wdtw4Q"
DB_PATH      = r"C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam\db\max.db"
TASKS_REPO   = r"C:\Users\sbozz\OneDrive\Documents\Claude\tasks"
HTML_TEMPLATE= r"C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam\owner-inbox\day-planner.html"
# ─────────────────────────────────────────────────────────────────────────────


def db_connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def api(method, path, body=None):
    """Call Cloudflare Worker API."""
    url = WORKER_URL.rstrip('/') + path
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url, data=data, method=method,
        headers={
            'Authorization': f'Bearer {WORKER_TOKEN}',
            'Content-Type': 'application/json',
            'User-Agent': 'MaxAgentTeam-Sync/1.0',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  [API error] {method} {path} -> {e.code}: {e.read().decode('utf-8', errors='replace')}")
        return None


def pull_from_d1(conn):
    """Pull tasks changed in D1 since last sync and merge into local SQLite."""
    cur = conn.execute("SELECT MAX(synced_at) FROM tasks")
    last = (cur.fetchone()[0] or '2000-01-01T00:00:00')
    print(f"  Pulling D1 changes since {last}...")

    remote_tasks = api('GET', f'/tasks?since={last}') or []
    remote_secs  = api('GET', '/sections') or []

    merged = 0
    for t in remote_tasks:
        existing = conn.execute('SELECT updated_at FROM tasks WHERE id=?', (t['id'],)).fetchone()
        if not existing or t.get('updated_at','') > existing['updated_at']:
            cols = ['id','title','description','notes','status','priority','due_date','start_date',
                    'completed_date','recurrence','tags','subtasks','section_id','agent','domain',
                    'my_day','my_day_pinned','my_day_date','done','deleted','created_at','updated_at','synced_at']
            vals = [t.get(c) for c in cols]
            conn.execute(f"""
                INSERT OR REPLACE INTO tasks ({','.join(cols)}) VALUES ({','.join(['?']*len(cols))})
            """, vals)
            merged += 1

    for s in remote_secs:
        conn.execute("""
            INSERT OR IGNORE INTO sections (id,title,icon,priority,sort_order,created_at)
            VALUES (:id,:title,:icon,:priority,:sort_order,:created_at)
        """, dict(s))

    conn.commit()
    conn.execute("INSERT INTO sync_log (direction,records,status) VALUES ('pull',?,?)", (merged,'ok'))
    conn.commit()
    print(f"  Pulled {merged} tasks from D1.")
    return merged


def push_to_d1(conn):
    """Push local tasks not yet synced to D1."""
    print("  Pushing local changes to D1...")
    tasks = [dict(r) for r in conn.execute(
        "SELECT * FROM tasks WHERE synced_at IS NULL OR updated_at > synced_at"
    ).fetchall()]
    secs = [dict(r) for r in conn.execute("SELECT * FROM sections").fetchall()]

    if not tasks and not secs:
        print("  Nothing to push.")
        return 0

    result = api('POST', '/sync', {'tasks': tasks, 'sections': secs})
    if result:
        now = datetime.now(timezone.utc).isoformat()
        conn.execute("UPDATE tasks SET synced_at=? WHERE synced_at IS NULL OR updated_at > synced_at", (now,))
        conn.commit()
        conn.execute("INSERT INTO sync_log (direction,records,status) VALUES ('push',?,?)", (len(tasks),'ok'))
        conn.commit()
        print(f"  Pushed {len(tasks)} tasks to D1.")
        return len(tasks)
    return 0


def export_html(conn):
    """Export task data as JSON, embed into tasks.html, write to tasks repo."""
    if not os.path.exists(HTML_TEMPLATE):
        print(f"  [warn] HTML template not found at {HTML_TEMPLATE}")
        return False

    tasks    = [dict(r) for r in conn.execute("SELECT * FROM tasks WHERE deleted=0").fetchall()]
    sections = [dict(r) for r in conn.execute("SELECT * FROM sections ORDER BY sort_order").fetchall()]
    tags     = [dict(r) for r in conn.execute("SELECT * FROM tags").fetchall()]
    quotes   = [dict(r) for r in conn.execute("SELECT quote,author FROM daily_quotes WHERE active=1").fetchall()]

    seed = json.dumps({'tasks': tasks, 'sections': sections, 'tags': tags, 'quotes': quotes}, default=str)

    with open(HTML_TEMPLATE, 'r', encoding='utf-8') as f:
        html = f.read()

    # Inject seed data (use lambda to avoid regex escape issues in seed JSON)
    replacement = f'window.__SEED_DATA__ = {seed};'
    html = re.sub(
        r'window\.__SEED_DATA__\s*=\s*\{[^;]*\};',
        lambda m: replacement,
        html
    )
    if 'window.__SEED_DATA__' not in html:
        html = html.replace('<script>', f'<script>\nwindow.__SEED_DATA__ = {seed};\n', 1)

    out_path = Path(TASKS_REPO) / 'index.html'
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding='utf-8')

    conn.execute("INSERT INTO sync_log (direction,records,status,message) VALUES ('export',?,'ok','')", (len(tasks),))
    conn.commit()
    print(f"  Exported {len(tasks)} tasks -> {out_path}")
    return True


def push_github():
    """Git commit and push index.html to GitHub."""
    repo = Path(TASKS_REPO)
    if not (repo / '.git').exists():
        print(f"  [warn] {TASKS_REPO} is not a git repo. Run: git clone git@github.com:sbozzone/tasks.git <path>")
        return False

    ts = datetime.now().strftime('%Y-%m-%d %H:%M')
    cmds = [
        ['git', '-C', str(repo), 'add', 'index.html'],
        ['git', '-C', str(repo), 'commit', '-m', f'sync: {ts}'],
        ['git', '-C', str(repo), 'push', 'origin', 'main'],
    ]
    for cmd in cmds:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            if 'nothing to commit' in result.stdout + result.stderr:
                print("  GitHub: nothing new to commit.")
                return True
            print(f"  [git error] {' '.join(cmd)}: {result.stderr.strip()}")
            return False

    print(f"  Pushed to GitHub: https://sbozzone.github.io/tasks/")
    return True


def import_localstorage(filepath, conn):
    """One-time import of localStorage bozzone-v3 JSON export."""
    with open(filepath, 'r') as f:
        data = json.load(f)

    if isinstance(data, str):
        data = json.loads(data)

    sections = data.get('sections', [])
    tags     = data.get('tags', [])
    now = datetime.now(timezone.utc).isoformat()
    count = 0

    for tag in tags:
        conn.execute(
            "INSERT OR IGNORE INTO tags (id,name,color) VALUES (?,?,?)",
            (tag['id'], tag['name'], tag.get('color','#4A90D9'))
        )

    for sec in sections:
        sec_id = sec.get('id','sec-unknown')
        conn.execute(
            "INSERT OR IGNORE INTO sections (id,title,icon,priority,sort_order) VALUES (?,?,?,?,?)",
            (sec_id, sec.get('title','Section'), sec.get('icon','📋'),
             1 if sec.get('priority') else 0, sections.index(sec))
        )
        for task in sec.get('tasks', []):
            tid = task.get('id') or f"id-{int(datetime.now().timestamp()*1000)}-{count}"
            conn.execute("""
                INSERT OR IGNORE INTO tasks
                  (id,title,description,notes,status,priority,due_date,start_date,
                   completed_date,recurrence,tags,subtasks,section_id,done,created_at,updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, (
                tid, task.get('title') or task.get('text',''),
                task.get('description'), task.get('notes'),
                task.get('status','not_started'), task.get('priority'),
                task.get('dueDate'), task.get('startDate'), task.get('completedDate'),
                json.dumps(task['recurrence']) if task.get('recurrence') else None,
                json.dumps(task.get('tags',[])), json.dumps(task.get('subtasks',[])),
                sec_id, 1 if task.get('done') else 0, now, now
            ))
            count += 1

    conn.commit()
    print(f"  Imported {count} tasks from localStorage export.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pull-only',  action='store_true')
    parser.add_argument('--push-only',  action='store_true')
    parser.add_argument('--export',     action='store_true')
    parser.add_argument('--import-ls',  metavar='FILE')
    args = parser.parse_args()

    conn = db_connect()

    if args.import_ls:
        print("Importing localStorage export...")
        import_localstorage(args.import_ls, conn)
        conn.close()
        return

    if args.export:
        print("Exporting HTML...")
        export_html(conn)
        conn.close()
        return

    if args.pull_only:
        print("Pulling from D1...")
        pull_from_d1(conn)
        conn.close()
        return

    if args.push_only:
        print("Pushing to D1 + GitHub...")
        push_to_d1(conn)
        export_html(conn)
        push_github()
        conn.close()
        return

    # Full sync
    print("=== Full sync ===")
    print("1/4  Pull from D1...")
    pull_from_d1(conn)
    print("2/4  Push to D1...")
    push_to_d1(conn)
    print("3/4  Export HTML...")
    export_html(conn)
    print("4/4  Push to GitHub...")
    push_github()
    conn.close()
    print("=== Sync complete ===")


if __name__ == '__main__':
    main()
