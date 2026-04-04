# AI Second Brain: Build Plan
### Obsidian + Claude Code | Personal Productivity System
**Prepared:** April 4, 2026 | **Inspired by:** Brad Bonanno & Rick Mulready

---

## 1. Executive Summary

This document is the complete blueprint for a personal AI second brain — a system that consolidates tasks, projects, ideas, and scheduling into a single, AI-powered workspace with minimal friction and no recurring tool subscriptions beyond what is already in use.

**The core insight:** Existing tools don't talk to each other because they don't share a common memory. This system gives everything a shared memory — the Obsidian vault — and puts Claude in charge of reading, writing, and reasoning about it.

**What the finished system provides:**
- One morning command that briefs you on your entire day
- A single place to brain-dump anything, anytime
- Claude that automatically classifies and files every thought
- A weekly review that surfaces patterns and next actions
- Full audit trail of everything via Git — every note, every task, every action
- Works across Windows PC, iPhone, and iPad

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
| **Claude usage** | Terminal (Claude Code) for power tasks; Claude Desktop for quick vault questions |

---

## 3. System Architecture

The system has three layers:

```
┌─────────────────────────────────────┐
│         CLAUDE CODE (VS Code)        │  ← Execution layer
│  Reads, writes, reasons, delegates   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         CLAUDE SKILLS               │  ← Thinking layer
│  /today  /new  /process-inbox       │
│  /weekly-review  /daily-review      │
│  /delegate  /followup               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       OBSIDIAN VAULT (Git-tracked)  │  ← Memory layer
│  Tasks · Projects · Ideas · People  │
│  Daily Notes · Daily Plans · Context│
└─────────────────────────────────────┘
```

**Layer 1 — Memory (Obsidian):** All knowledge lives here as plain markdown files. Obsidian is the UI for reading and navigating. Every file Claude touches is auto-committed to Git.

**Layer 2 — Thinking (Claude Skills):** Reusable slash commands that define how Claude approaches each task — same logic every time, no re-explaining.

**Layer 3 — Execution (Claude Code in VS Code):** Where work happens. Claude reads the vault, creates files, queries Google Calendar and Gmail, and runs parallel delegated tasks.

---

## 4. Vault Structure

```
MyBrain/
├── .claude/
│   ├── commands/          ← slash command definitions
│   │   ├── today.md
│   │   ├── new.md
│   │   ├── process-inbox.md
│   │   ├── daily-review.md
│   │   ├── weekly-review.md
│   │   ├── delegate.md
│   │   └── followup.md
│   ├── hooks/
│   │   ├── auto-commit.sh     ← commits after every Claude write
│   │   └── stop-sound.sh      ← chime when background task finishes
│   └── reference/
│       ├── employees.json     ← future AI employee registry
│       └── file-formats.md    ← template specs for Claude
├── .git/                  ← auto-managed, full audit trail
├── .obsidian/             ← Obsidian configuration
│
├── Context/               ← Who you are (Claude reads every session)
│   ├── profile.md         ← About you, your goals, working style
│   └── writing-style.md   ← Tone, voice, preferences
│
├── Daily Notes/           ← YOURS ONLY. Claude never touches this.
├── Daily Plans/           ← CLAUDE'S. Morning briefings go here.
│
├── Tasks/                 ← One file per task, YAML front matter
├── Projects/              ← One file per project, linked to tasks
├── Ideas/                 ← Captured thoughts, processed or raw
├── People/                ← One file per person (clients, contacts)
│
├── Outputs/               ← Everything Claude generates (linked to tasks)
├── Archive/               ← Completed projects, old daily plans
├── Attachments/           ← Images, PDFs
├── Templates/             ← Note templates for Templater plugin
│
└── CLAUDE.md              ← The vault constitution
```

### The Critical Distinction

| Note Type | Owner | Purpose |
|---|---|---|
| **Daily Note** | You | Raw brain dump, messy thoughts, screenshots. Claude never touches it. |
| **Daily Plan** | Claude | Structured briefing: calendar, tasks, Gmail. Claude writes it each morning. |

---

## 5. File Format Standard

Every file uses YAML front matter. This is what makes Claude's queries precise.

**Task:**
```yaml
---
type: task
status: open
priority: high
due: 2026-04-10
tags: [follow-up, client]
created: 2026-04-04
recurring: false
---
# Task Title
Description.
```

**Project:**
```yaml
---
type: project
status: active
started: 2026-04-04
tags: [work]
---
# Project Name
## Goal
## Active Tasks
- [[Task Name]]
```

**Idea:**
```yaml
---
type: idea
created: 2026-04-04
tags: [content]
---
# Idea Title
```

**Person:**
```yaml
---
type: person
last-contact: 2026-04-04
tags: [client]
---
# Name
## Context
## Open Items
- [[Related task]]
```

---

## 6. The CLAUDE.md Constitution

```markdown
# My Second Brain — Claude's Operating Manual

## Who I Am
[Your name]. Solo operator. [Brief description of what you do.]

## Vault Structure
- Context/       → My profile and writing preferences. Read first.
- Daily Notes/   → My private space. Never create, edit, or delete files here.
- Daily Plans/   → Your space. Write morning briefings as YYYY-MM-DD-plan.md
- Tasks/         → One file per task with YAML front matter
- Projects/      → One file per project, linked to tasks
- Ideas/         → Captured thoughts
- People/        → Contacts and clients
- Outputs/       → Files you generate (link back to source task)

## Classification Rules
- Task: anything with a defined end and action required
- Project: larger work made up of multiple tasks
- Idea: a captured thought, concept, or inspiration
- Person: any individual mentioned in context of a relationship

## File Naming
- Tasks: tasks/YYYY-MM-DD-task-name.md
- Projects: projects/project-name.md
- Ideas: ideas/YYYY-MM-DD-idea-name.md
- People: people/firstname-lastname.md

## Confidence Scoring
Rate classification confidence 0.0–1.0. Ask for clarification if below 0.5.

## Git Commits
Every file created or modified gets auto-committed. Format: cos: [action] - [description]

## Working Style
- Action-oriented language
- Surface blockers explicitly
- When in doubt, ask before filing
- Always link related notes using [[wikilinks]]
```

---

## 7. Slash Commands

| Command | What Claude Does |
|---|---|
| `/today` | Reads open tasks + Google Calendar + Gmail → writes Daily Plan |
| `/new [anything]` | Classifies any brain dump, creates files, links them |
| `/process-inbox` | Reads Daily Note captures, extracts tasks, routes ideas |
| `/daily-review` | Compares plan vs actual, updates task statuses |
| `/weekly-review` | Reads week's daily notes, surfaces patterns, drafts next week's top 3 |
| `/followup` | Scans Gmail: who are you waiting on? Who's waiting on you? |
| `/delegate [task]` | Opens separate Claude instance; runs in background; chimes when done |

---

## 8. Daily Rhythm

**Morning (~10 min)**
1. Open Obsidian — Dashboard auto-loads
2. Open VS Code with Claude Code
3. Type `/today` — Claude reads tasks + calendar + Gmail, writes Daily Plan
4. Review Daily Plan in Obsidian
5. Write Daily Note: 3 priorities + anything on your mind (your space only)

**During the day**
- Capture anything to Daily Note or `/new [thought]`
- Mark tasks done inline
- `/delegate [task]` for anything Claude can do while you keep working

**Evening (optional, 5 min)**
- Note wins in Daily Note
- Run `/daily-review`

---

## 9. Weekly Review (Sunday, ~30 min)

Claude uses the **MIRROR framework:**

| Stage | What Happens |
|---|---|
| **Map** | Reads all daily notes from the week |
| **Interrogate** | Surfaces what you said vs what you did; recurring blocked tasks |
| **Reality-check** | Verifies patterns against your actual constraints |
| **Reveal** | Surfaces one thing you've been avoiding (evidence-based) |
| **Optimize** | Suggests 3 changes for next week |
| **Reset** | Clears processed inbox, prepares next weekly note |

Run with: `/weekly-review`

---

## 10. External Integrations

| Tool | Integration | Phase |
|---|---|---|
| **Google Calendar** | MCP server — Claude reads events for `/today` | Phase 2 |
| **Gmail** | MCP server — Claude scans for `/today` and `/followup` | Phase 2 |
| **OneDrive** | Remotely Save plugin — syncs vault across all devices | Day 1 |
| **GitHub** | Private repo — auto-commit hook on every Claude write | Day 1 |

---

## 11. Sync Setup (Free)

**Why not iCloud:** iCloud for Windows causes sync conflicts with Obsidian.

**Solution: Remotely Save + OneDrive**

1. OneDrive is already on Windows PC (built-in)
2. Create vault inside your OneDrive folder
3. Install OneDrive on iPhone and iPad
4. Install Remotely Save community plugin in Obsidian
5. Configure to use OneDrive as backend
6. Enable on all three devices

---

## 12. Git Tracking

The vault is also a Git repository. The auto-commit hook fires every time Claude creates or modifies a file.

**Benefits:**
- Full audit trail of every Claude action
- Time travel — revert any mistake instantly
- Compare any two points in time
- Something Notion, Apple Notes, and plain Obsidian cannot do

**Commit format:** `cos: created task - follow up with dentist`

Git commits are automatic. Push to a private GitHub repo for offsite backup.

---

## 13. Plugin Stack

### Phase 1 — Day 1

| Plugin | Type | Purpose |
|---|---|---|
| Daily Notes | Core (built-in) | Auto-creates daily note |
| Templater | Community | Dynamic templates |
| Periodic Notes | Community | Auto-creates weekly notes |
| Remotely Save | Community | Free sync via OneDrive |

### Phase 2 — Week 3–4

| Plugin | Purpose |
|---|---|
| Tasks | Cross-vault task queries |
| QuickAdd | Fast iPhone capture |

### Phase 3 — Month 2+ (optional)

| Plugin | Purpose |
|---|---|
| Full Calendar | Read-only Google Calendar view |
| Omnisearch | Better vault-wide search |
| Dataview | Dashboard views |

**Rule:** No plugins for the first two weeks.

---

## 14. Implementation Phases

### Phase 0 — Foundation (Day 1–3)
- [ ] Clone `github.com/bradautomates/second-brain`
- [ ] Open as Obsidian vault
- [ ] Set up Remotely Save + OneDrive sync
- [ ] Initialize as private Git repo on GitHub
- [ ] Write `CLAUDE.md` constitution
- [ ] Write `Context/profile.md` and `Context/writing-style.md`
- [ ] Set up daily note and weekly note templates
- [ ] Configure VS Code with Claude Code extension
- [ ] Test `/new` command end-to-end

### Phase 1 — Capture Habit (Week 1–2)
- [ ] Use Daily Notes and `/new` command only
- [ ] Do not organize — just capture
- [ ] No new plugins
- [ ] Run first `/process-inbox` at end of week

### Phase 2 — Claude Workflows (Week 3–4)
- [ ] Connect Google Calendar MCP
- [ ] Connect Gmail MCP
- [ ] Run `/today` every morning for one week
- [ ] Run first `/weekly-review`
- [ ] Refine `CLAUDE.md` based on what works

### Phase 3 — Projects (Month 2)
- [ ] Migrate active projects into `Projects/`
- [ ] Set up `/delegate` for background tasks
- [ ] Add QuickAdd for iPhone capture

### Phase 4 — Optimization (Month 3+)
- [ ] Add Dataview if needed
- [ ] Refine weekly review prompts
- [ ] Build first specialist AI employee repo if desired

---

## 15. Top Pitfalls to Avoid

| Pitfall | Prevention |
|---|---|
| Over-structuring before using | Start flat. Add folders only when a category hits 20+ notes. |
| Too many plugins too fast | Zero plugins week 1. One per week max after that. |
| Building instead of using | 15 min config, then use it. The using is the building. |
| Skipping the weekly review | Without it, notes are write-only. |
| Not linking notes | Every note should link to 1–2 others. |
| iCloud sync on Windows | Use Remotely Save + OneDrive instead. |

---

## 16. The Flywheel

> *"I'm not training it anymore. I'm just taking notes."* — Brad Bonanno

The system compounds over time. Every note makes the next briefing smarter. Every weekly review makes the next one more accurate. The `Context/` folder grows richer as you refine it. You don't maintain the system — you use it. The using is the maintaining.

---

## 17. Inspiration & Sources

| Source | Contribution |
|---|---|
| **Brad Bonanno** (`github.com/bradautomates/second-brain`) | Vault structure, Git tracking, hooks, parallel delegation, free repo |
| **Rick Mulready** (YouTube: Rick Mulready) | Daily note vs Daily plan distinction, morning briefing workflow |
| **Obsidian community research** | Plugin recommendations, sync strategies, beginner pitfalls |
| **Claude + Obsidian MCP research** | Integration patterns, CLAUDE.md constitution |

---

*To export as PDF: Open in Obsidian → Ctrl+P → Export to PDF*
