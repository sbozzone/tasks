# AI Second Brain: Build Plan
### Obsidian + Claude Code | Personal Productivity System
**Prepared:** April 4, 2026 | **Inspired by:** Brad Bonanno & Rick Mulready
**Reviewed & simplified:** April 4, 2026

---

## 1. Executive Summary

A personal AI second brain built on Obsidian + Claude Code. One vault. Three commands. Full audit trail.

**The core insight:** Your tools don't talk to each other because they don't share memory. This system gives everything a shared memory — your Obsidian vault — and puts Claude in charge of reading, writing, and reasoning about it.

**The entire daily interface:**

| Command | When | What happens |
|---|---|---|
| `/today` | Every morning | Claude reads tasks + calendar + Gmail → writes your Daily Plan |
| `/new [anything]` | Any time a thought hits | Claude classifies, creates files, links everything |
| `/weekly-review` | Sunday | Claude reads the week, surfaces patterns, drafts next week |

That's it. Three commands. Claude acts autonomously and tells you what it did. Git is your undo button.

---

## 2. Your Profile

| Factor | Detail |
|---|---|
| **Devices** | Windows PC, iPhone, iPad |
| **Sync** | Remotely Save plugin + OneDrive (free) |
| **Calendar** | Google Calendar (keep, mirror into Obsidian) |
| **Email** | Gmail |
| **Coming from** | Scattered apps — Apple Notes, Reminders, Google Calendar |
| **Technical level** | Beginner — low maintenance, minimal plugins |
| **Operator type** | Solo — no team, no Slack |
| **Claude access** | VS Code (Claude Code) for commands; Claude Desktop for vault questions |
| **Daily commitment** | /today each morning + /weekly-review on Sundays |

---

## 3. System Architecture

```
┌─────────────────────────────────────┐
│       CLAUDE CODE (VS Code)          │  ← Execution
│  Reads, writes, reasons about vault  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         3 CLAUDE SKILLS              │  ← Thinking
│    /today   /new   /weekly-review    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     OBSIDIAN VAULT (Git-tracked)     │  ← Memory
│  Tasks · Projects · Ideas · People  │
│  Daily Notes · Daily Plans · Context │
└─────────────────────────────────────┘
```

**Obsidian** = UI for reading and navigating your vault.
**Claude Code** = reads, writes, and reasons about every file.
**Git** = automatic audit trail + undo button.

---

## 4. Vault Structure

```
MyBrain/
├── .claude/
│   ├── commands/
│   │   ├── today.md           ← /today command spec
│   │   ├── new.md             ← /new command spec
│   │   └── weekly-review.md   ← /weekly-review command spec
│   ├── hooks/
│   │   ├── auto-commit.sh     ← commits after each command completes
│   │   └── stop-sound.sh      ← optional chime when background task finishes
│   └── reference/
│       └── file-formats.md    ← YAML templates Claude uses when creating files
├── .git/                      ← auto-managed audit trail
├── .obsidian/                 ← Obsidian config
│
├── Context/                   ← Claude reads this every session
│   ├── profile.md             ← Who you are, goals, working style
│   └── writing-style.md       ← Tone, voice, preferences
│
├── Inbox/                     ← Temporary. Unprocessed captures land here.
├── Daily Notes/               ← Yours only. Claude reads but never writes here.
├── Daily Plans/               ← Claude's. Morning briefings saved here.
│
├── Tasks/                     ← One file per task (YAML front matter)
├── Projects/                  ← One file per project (linked to tasks)
├── Ideas/                     ← Captured thoughts
├── People/                    ← Contacts, clients (optional, add when useful)
│
├── Outputs/                   ← Everything Claude generates, linked to source task
├── Archive/                   ← Completed projects, old plans
├── Attachments/               ← Images, PDFs
├── Templates/                 ← Templater note templates
│
└── CLAUDE.md                  ← The vault constitution
```

### The Critical Distinction

| | Owner | Claude access |
|---|---|---|
| **Daily Note** | You | Read only — rich source for /weekly-review. Never written to. |
| **Daily Plan** | Claude | Claude writes here each morning via /today. |

Your thinking space stays yours. Claude's output has its own space.

---

## 5. File Format Standard

Every Task, Project, Idea, and Person file uses YAML front matter. This is what makes Claude's queries reliable.

**Task:**
```yaml
---
type: task
status: open
priority: high
due: 2026-04-10
tags: [follow-up]
created: 2026-04-04
recurring: false
---
# Task Title
Details.
```

**Project:**
```yaml
---
type: project
status: active
started: 2026-04-04
tags: []
---
# Project Name
## Goal
## Active Tasks
- [[Task file name]]
```

**Idea:**
```yaml
---
type: idea
created: 2026-04-04
tags: []
---
# Idea Title
Raw thought or developed concept.
```

**Person (optional):**
```yaml
---
type: person
last-contact: 2026-04-04
tags: []
---
# First Last
## Context
## Open Items
- [[Related task]]
```

---

## 6. The CLAUDE.md Constitution

Written once. Claude reads this before every session.

```markdown
# My Second Brain — Claude's Operating Manual

## Who I Am
[Your name]. Solo. [One sentence about what you do / what matters to you.]

## Vault Layout
- Context/      → My profile. Read this first, every session.
- Daily Notes/  → My private thinking space. READ ONLY. Never create or edit files here.
- Daily Plans/  → Your output space. Save /today briefings here as YYYY-MM-DD-plan.md
- Inbox/        → Unprocessed captures. /new reads and clears from here.
- Tasks/        → One file per task. YAML front matter required.
- Projects/     → One file per project. Link to tasks.
- Ideas/        → Captured thoughts, raw or developed.
- People/       → Contacts. Create when a person recurs across notes.
- Outputs/      → Files you generate. Always link back to the source task.

## File Naming
- tasks/YYYY-MM-DD-task-name.md
- projects/project-name.md
- ideas/YYYY-MM-DD-idea-name.md
- people/firstname-lastname.md
- Daily Plans/YYYY-MM-DD-plan.md

## Classification Rules
- Task: has a defined action and end point
- Project: made of multiple tasks, larger scope
- Idea: a thought, concept, or inspiration (no action required yet)
- Person: any individual who recurs in context of a relationship

## Autonomy
Act first, tell me what you did. I'll review. Git lets me undo mistakes.
If genuinely ambiguous (confidence < 0.5), ask one focused question before proceeding.

## Git Commits
Auto-commit runs after each command completes (not per write).
Format: cos: /command - brief description of what happened
Example: cos: /new - created task "call dentist", linked to no project

## Deduplication
Before creating any file, check for an existing file with a similar title.
Fuzzy match is fine. If a close match exists, update it rather than creating a duplicate.

## Linking
Every new file should link to at least one related existing file using [[wikilinks]].
When creating a task for a person, link to their People/ file. Create it if it doesn't exist.
```

---

## 7. The Three Commands — Full Specs

### `/today`

**Purpose:** Morning briefing. One command, full picture of your day.

**Input:** None required. Optional: `/today focus: deep work` to bias the plan.

**Steps:**
1. Read `Context/profile.md` and `Context/writing-style.md`
2. Read all Tasks/ files with `status: open` — flag any overdue
3. Attempt Google Calendar MCP call — if it fails, skip gracefully
4. Attempt Gmail MCP call — if it fails, skip gracefully
5. Synthesize into a structured Daily Plan
6. Write to `Daily Plans/YYYY-MM-DD-plan.md`
7. Summarize what was created in the terminal

**Output contract:**
```markdown
# Daily Plan — [Date]

## Top 3 Today
- [ ] ...
- [ ] ...
- [ ] ...

## Overdue (needs attention)
- ...

## Schedule (from Calendar, if available)
- ...

## Needs Response (from Gmail, if available)
- ...

## Active Projects — Status
- [[Project name]]: ...
```

**Graceful degradation:** If MCP calls fail, `/today` still runs on vault data alone. Never blocked by external tool failures.

---

### `/new [anything]`

**Purpose:** Brain dump anything. Claude handles classification, file creation, and linking.

**Input:** Free text — a thought, a task, a meeting note, an idea, anything.

**Steps:**
1. Parse input for entities: tasks, people, projects, ideas
2. Score classification confidence (0.0–1.0) for each entity
3. If confidence ≥ 0.5: create file immediately
4. If confidence < 0.5: ask one focused question, then proceed
5. Check for duplicates before creating (fuzzy title match)
6. Create files using YAML templates from `file-formats.md`
7. Link all created files to each other and to related existing files
8. Auto-commit: `cos: /new - [summary of what was created]`
9. Report what was created in the terminal

**Example:**
```
/new meeting with Sarah next Thursday to review the website redesign,
     I need to prep some questions beforehand

→ Creates: tasks/2026-04-08-meeting-sarah-website.md
→ Creates: tasks/2026-04-07-prep-questions-for-sarah.md
→ Creates: people/sarah.md (if not exists)
→ Creates/updates: projects/website-redesign.md
→ Links all four together
→ Commits: cos: /new - created 2 tasks, 1 person, linked to website project
```

**Autonomy:** Claude acts and reports. You review in Obsidian. Git is the undo button.

---

### `/weekly-review`

**Purpose:** Sunday session. Understand the week, set up the next one.

**Phase 1 (Weeks 1–4): Simple summary**

Steps:
1. Read all Daily Notes from the past 7 days (read only)
2. Read all Tasks/ files modified or created this week
3. Identify: what got done, what got stuck, what never started
4. Produce a simple summary and 3 priorities for next week
5. Write to `Outputs/YYYY-MM-DD-weekly-review.md`

**Phase 2 (Month 2+): Pattern detection**

Adds:
- Compare what you said you'd do vs what you actually did
- Surface recurring blockers (tasks that appear across multiple weeks)
- Identify one thing you've been consistently avoiding

**Phase 3 (Month 3+): Behavioral insights**

Adds:
- MIRROR framework (Map, Interrogate, Reality-check, Reveal, Optimize, Reset)
- Trend analysis across multiple weekly reviews
- Suggestions for system adjustments

**Output contract (Phase 1):**
```markdown
# Weekly Review — Week of [Date]

## What Got Done
-

## What Got Stuck
-

## What Didn't Start
-

## Patterns This Week
-

## Top 3 for Next Week
- [ ]
- [ ]
- [ ]
```

---

## 8. Git Tracking

The vault is a Git repository. The auto-commit hook fires **once per command** — not once per file write.

**Commit examples:**
```
cos: /today - generated daily plan, 4 open tasks, calendar unavailable
cos: /new - created task "dentist appt", person "Dr. Kim"
cos: /weekly-review - phase 1 summary, 3 tasks carried forward
```

**Why this matters:**
- Full history of every Claude action
- Meaningful, grouped commits (not write spam)
- Revert any command with `git revert`
- Compare state across any two days

Push to a private GitHub repo for offsite backup. You never run `git commit` manually.

---

## 9. External Integrations

| Tool | Role | Phase |
|---|---|---|
| **OneDrive** | Vault sync across PC, iPhone, iPad | Day 1 |
| **GitHub** | Private remote for Git backup | Day 1 |
| **Google Calendar** | Optional enrichment for `/today` | Phase 2 |
| **Gmail** | Optional enrichment for `/today` | Phase 2 |

**Design principle:** `/today` works without Google Calendar or Gmail. They're bonuses, not dependencies. If the MCP connection fails, the morning briefing still runs on vault data.

---

## 10. Sync Setup (Free, Windows + iPhone + iPad)

**Why not iCloud:** iCloud for Windows is unreliable for Obsidian and causes sync conflicts.

**Solution: Remotely Save + OneDrive**

1. OneDrive is already on your Windows PC
2. Create vault inside your OneDrive folder
3. Install OneDrive on iPhone and iPad
4. Install **Remotely Save** community plugin in Obsidian
5. Configure to sync via OneDrive
6. Enable on all devices

Remotely Save handles conflict resolution better than native cloud sync. Battle-tested for PC + iOS.

---

## 11. Plugin Stack

### Day 1 — 4 plugins only

| Plugin | Type | Purpose |
|---|---|---|
| Daily Notes | Core (built-in) | Auto-creates daily note |
| Templater | Community | Dynamic date-aware templates |
| Periodic Notes | Community | Auto-creates weekly notes |
| Remotely Save | Community | Free sync via OneDrive |

**Rule: No other plugins for the first two weeks.** Learn core Obsidian first.

### Week 3–4 (only if needed)

| Plugin | Purpose |
|---|---|
| Tasks | Cross-vault task queries (if managing 20+ tasks) |
| QuickAdd | Fast one-tap iPhone capture shortcut |

### Month 2+ (optional)

| Plugin | Purpose |
|---|---|
| Full Calendar | Read-only Google Calendar view via ICS |
| Omnisearch | Better vault-wide search |
| Dataview | Dashboard queries (only if you want them) |

---

## 12. Implementation Phases

### Phase 0 — Foundation (Day 1–3)
- [ ] Clone `github.com/bradautomates/second-brain`
- [ ] Open as Obsidian vault
- [ ] Create private GitHub repo, push vault
- [ ] Set up Remotely Save + OneDrive sync
- [ ] Write `CLAUDE.md` constitution
- [ ] Write `Context/profile.md` (who you are, what matters)
- [ ] Write `Context/writing-style.md` (tone, preferences)
- [ ] Set up daily note + weekly note Templater templates
- [ ] Configure VS Code with Claude Code
- [ ] Test `/new "call dentist tomorrow"` end-to-end

### Phase 1 — Build the Habit (Week 1–2)
- [ ] `/today` every morning — no skipping
- [ ] `/new` whenever a thought hits — no organizing manually
- [ ] No new plugins
- [ ] Don't organize anything in Obsidian yet
- [ ] Goal: both commands feel natural and automatic

### Phase 2 — Wire Up Integrations (Week 3–4)
- [ ] Connect Google Calendar MCP
- [ ] Connect Gmail MCP
- [ ] First `/weekly-review` (Phase 1: simple summary)
- [ ] Refine `CLAUDE.md` based on what's working
- [ ] Add Tasks plugin if tracking 20+ items

### Phase 3 — Projects (Month 2)
- [ ] Migrate active projects into `Projects/`
- [ ] `/weekly-review` upgrades to Phase 2 (pattern detection)
- [ ] Add QuickAdd for iPhone one-tap capture
- [ ] Optional: Full Calendar for GCal view in Obsidian

### Phase 4 — Optimize (Month 3+)
- [ ] `/weekly-review` upgrades to Phase 3 (MIRROR framework)
- [ ] Add Dataview if you want dashboard views
- [ ] Archive and clean vault
- [ ] Build first specialist command or AI employee repo if desired

---

## 13. Pitfalls to Avoid

| Pitfall | Prevention |
|---|---|
| Over-structuring before using | Start flat. Folders add themselves when needed. |
| Plugin creep | Zero new plugins week 1. One max per week after. |
| Building > using | 15 minutes config, then just use it |
| Skipping Sunday review | Without it, notes are write-only |
| iCloud sync on Windows | Remotely Save + OneDrive only |
| Expecting perfection from /new | Git is the safety net. Let Claude act. |

---

## 14. The Flywheel

> *"I'm not training it anymore. I'm just taking notes."* — Brad Bonanno

Every note adds context. Every `/today` briefing gets sharper. Every Sunday review makes the next one more accurate. The `Context/` folder grows with you.

You don't maintain this system. You use it. The using is the maintaining.

---

## 15. What This System Is Not

- Not a replacement for Google Calendar (GCal stays, Obsidian mirrors it)
- Not perfect on Day 1 (it evolves with you)
- Not zero-effort (Claude processes what you capture — capture is your job)
- Not locked to any vendor (plain `.md` files, always yours)

---

## 16. Inspiration & Sources

| Source | Contribution |
|---|---|
| **Brad Bonanno** — `github.com/bradautomates/second-brain` | Vault structure, Git tracking, hooks, free repo to clone |
| **Rick Mulready** — YouTube: Rick Mulready | Daily note vs Daily plan distinction, morning briefing concept |
| **Structural critique** | Git commit granularity, graceful degradation, command specs, phased weekly review |

---

*Export to PDF: Open in Obsidian → Ctrl+P → Export to PDF*
