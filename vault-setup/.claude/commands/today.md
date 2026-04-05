# /today — Morning Briefing

Generate Stephen's daily plan for today.

## Steps

1. **Load context**
   - Read `Context/profile.md`
   - Read `Context/writing-style.md`
   - Note today's date: use system date

2. **Scan the vault**
   - Read all files in `Tasks/` with `status: open` or `status: in-progress`
   - Identify overdue tasks (due date is before today)
   - Identify tasks due today
   - Identify tasks due in the next 3 days
   - Read all files in `Projects/` with `status: active` — note each project's linked tasks

3. **Check Google Calendar** (attempt via MCP — skip gracefully if unavailable)
   - Pull today's events
   - If MCP fails: note "Calendar unavailable" in the plan, continue

4. **Check Gmail** (attempt via MCP — skip gracefully if unavailable)
   - Look for unread threads needing a response
   - Flag anything that looks time-sensitive
   - If MCP fails: note "Gmail unavailable" in the plan, continue

5. **Write the Daily Plan**
   - Save to `Daily Plans/YYYY-MM-DD-plan.md`
   - Use the output format below
   - Apply writing-style.md: casual, bullet-heavy, action-oriented

6. **Commit**
   - Auto-commit fires after this command completes
   - Format: `cos: /today - daily plan written, X open tasks, Y overdue`

7. **Report in terminal**
   - One short summary: what was written, how many tasks found, any MCP failures

---

## Output Format

```markdown
# Daily Plan — [Day, Month DD YYYY]

## 🔴 Overdue — Handle These First
- [ ] [[task-file]] — due [date] · [business tag]

## ✅ Today
- [ ] [[task-file]] · [business tag]

## 📅 Coming Up (Next 3 Days)
- [ ] [[task-file]] — due [date] · [business tag]

## 📆 Schedule
[Calendar events if available, otherwise: "Calendar not loaded"]

## 📬 Needs Response
[Gmail items if available, otherwise: "Gmail not loaded"]

## 🗂 Active Projects
- **[[project-name]]** — [one-line status based on linked tasks]

---
*Generated [timestamp] · [X] open tasks · [Y] overdue*
```

---

## Rules

- Never write to or edit anything in `Daily Notes/`
- If both MCP sources fail, still produce the plan — vault data is enough
- Keep the plan scannable — bullets only, no paragraphs
- Flag overdue items visually (they go first, always)
- Link every task reference using `[[filename]]`
