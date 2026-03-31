# Max Agent Team — CLAUDE.md

This file is read automatically by Claude Code at the start of every session.

## Project Overview

This is Stephen's personal AI orchestration system managed by **Max** (claude-opus-4-6).

- **owner-inbox/**: Completed deliverables for Stephen's review
- **team-inbox/**: Files dropped here are routed by Max to the right team member
- **db/max.db**: SQLite source of truth for all data
- **TEAM_ROSTER.md**: Full team member definitions
- **MAX_CONSTITUTION.md**: Max's operating rules and team directory

## Command Center

**URL:** `http://localhost:8765/owner-inbox/stephen_ai_command_center_v3.html`

The command center runs on a local Python server (`server.py`) at port 8765.
- **To launch:** double-click `start_team.bat` (starts server + opens Chrome automatically)
- **To stop:** double-click `stop_team.bat`
- **Desktop shortcut:** run `create_shortcut.ps1` once to create a one-click desktop launcher

If Stephen asks about the command center and the server is not running, remind him to run `start_team.bat` first.

---

## Agent Task Creation Protocol

Any agent can create a task in `db/max.db` on Stephen's behalf using Python.
**Always use this standard** so tasks appear in the task tracker and sync to GitHub.

### Quick create (one-liner)

```python
import sqlite3, json
from datetime import datetime

def create_task(title, domain=None, agent=None, priority=None,
                due_date=None, section_id=None, my_day=False, my_day_pinned=False, notes=None):
    db = sqlite3.connect(r"C:\Users\sbozz\OneDrive\Documents\Claude\AgentTeam\db\max.db")
    tid = f"id-{int(datetime.now().timestamp()*1000)}"
    now = datetime.utcnow().isoformat()
    today = datetime.now().strftime('%Y-%m-%d')
    db.execute("""
        INSERT INTO tasks
          (id, title, notes, domain, agent, priority, due_date, section_id,
           my_day, my_day_pinned, my_day_date, status, done, created_at, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,?,?)
    """, (tid, title, notes, domain, agent, priority, due_date, section_id,
          1 if my_day else 0,
          1 if my_day_pinned else 0,
          today if my_day else None,
          'not_started', now, now))
    db.commit()
    db.close()
    return tid
```

### Field reference

| Field | Valid values | Notes |
|-------|-------------|-------|
| `domain` | `YourStory` \| `Woodworking` \| `Personal` \| `Retooling Retirement` | Required when possible |
| `priority` | `low` \| `medium` \| `high` \| `urgent` | Optional |
| `agent` | Any name from TEAM_ROSTER.md (e.g. `"Reed"`, `"Chip"`) | Who should work on it |
| `due_date` | `YYYY-MM-DD` string | Optional |
| `section_id` | See sections table | Optional, e.g. `sec-yourstory` |
| `my_day` | `True` / `False` | Show in today's My Day view |
| `my_day_pinned` | `True` / `False` | Carry over every day until manually unpinned |

### Default section IDs

| Section | ID |
|---------|----|
| YourStory | `sec-yourstory` |
| Woodworking | `sec-woodworking` |
| Personal | `sec-personal` |
| Shopping List | `sec-shopping` |
| Inbox | `sec-inbox` |

### After creating tasks

Always sync to GitHub after creating or updating tasks:
```bash
python owner-inbox/sync.py --push-only
```

Or if Python is unavailable, note in your response that Stephen should run the sync.

---

## Max's Task Creation Examples

When Stephen says something like:

> "Add a task to buy wood for the shelf project"

Max runs:
```python
create_task(
    title="Buy lumber for shelf project",
    domain="Woodworking",
    agent="Chip",
    section_id="sec-woodworking",
    priority="medium"
)
```

> "Remind me to email the gallery about pricing tomorrow"

Max runs:
```python
from datetime import datetime, timedelta
tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
create_task(
    title="Email gallery about pricing",
    domain="YourStory",
    agent="Reed",
    due_date=tomorrow,
    my_day=True,
    priority="medium"
)
```

> "Add this to my day — review the marketing brief"

Max runs:
```python
create_task(
    title="Review marketing brief",
    domain="YourStory",
    agent="Marco",
    my_day=True,
    my_day_pinned=True   # carries over until done
)
```

---

## Team Models

| Agent | Model |
|-------|-------|
| Max | claude-opus-4-6 |
| All others | claude-sonnet-4-6 |

See TEAM_ROSTER.md for full team definitions.
