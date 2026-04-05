# /weekly-review — Weekly Review

Run every Sunday. Review the week. Set up the next one.

This command phases up over time. Check the current phase below and run that version.

---

## How to Know Your Phase

- **Weeks 1–4:** Run Phase 1
- **Month 2 (weeks 5–8):** Run Phase 2
- **Month 3+:** Run Phase 3

If you're unsure, check the date of the first weekly review file in `Outputs/`.

---

## Phase 1 — Simple Summary (Weeks 1–4)

### Steps

1. **Load context**
   - Read `Context/profile.md`
   - Read `Context/writing-style.md`

2. **Scan the week's tasks**
   - Read all files in `Tasks/` modified or created in the past 7 days
   - Categorize each as: Done / Stuck / Never started

3. **Read Daily Notes** (read only — never write to these)
   - Read all files in `Daily Notes/` from the past 7 days
   - Extract: recurring themes, things mentioned multiple times, energy patterns

4. **Read Daily Plans**
   - Read all files in `Daily Plans/` from the past 7 days
   - Compare what was planned vs. what got done

5. **Check active projects**
   - Read all `Projects/` files with `status: active`
   - Note movement (tasks completed) and stalls (no activity this week)

6. **Write the review**
   - Save to `Outputs/YYYY-MM-DD-weekly-review.md`
   - Use Phase 1 output format below

7. **Commit**
   - Format: `cos: /weekly-review - phase 1, X done, Y stuck, Z carried forward`

### Phase 1 Output Format

```markdown
# Weekly Review — Week of [Mon DD – Sun DD, YYYY]

## ✅ Done This Week
- [[task]] · [business]

## 🟡 Stuck (started but not done)
- [[task]] · [business] — [one-line reason if clear]

## ⬜ Never Started
- [[task]] · [business]

## 🗂 Project Pulse
- **[[project]]** — [active/stalled] · [one-line note]

## 📝 Themes from the Week
- [Pattern noticed across daily notes — brief]

## 🔜 Top 3 for Next Week
- [ ] [Most important thing]
- [ ] [Second most important thing]
- [ ] [Third most important thing]

## 🔄 Carried Forward
- [ ] [[task]] (was due [date])

---
*Phase 1 review · Generated [timestamp]*
```

---

## Phase 2 — Pattern Detection (Month 2)

Runs all Phase 1 steps, then adds:

### Additional Steps

6b. **Identify recurring patterns**
   - Which tasks appeared in multiple daily plans but never got done?
   - Which business area got the most attention? The least?
   - Were there any days with zero task progress — and why?

6c. **Surface blockers**
   - List any task that has been `status: open` for more than 14 days
   - Note what might be blocking it (if context exists)

### Phase 2 Additions to Output

```markdown
## 🔁 Recurring Patterns
- [Task/theme that keeps showing up]

## 🚧 Blockers (Open > 14 Days)
- [[task]] — open since [date] · possible blocker: [if known]

## 📊 Business Focus This Week
- Most active: [business]
- Least active: [business]
- Imbalance worth noting: [yes/no + brief note]
```

---

## Phase 3 — Behavioral Insights (Month 3+)

Runs all Phase 1 and Phase 2 steps, then adds the MIRROR framework:

### MIRROR Steps

**M — Map**
Summarize what actually happened this week in 3–5 bullets. Facts only.

**I — Interrogate**
Find the gaps:
- What did Stephen say he'd do vs. what he actually did?
- What consumed time that wasn't on any plan?
- What task appeared 3+ times and still didn't get done?

**R — Reality-check**
Given his constraints (day job, six businesses, workshop project), do the stuck items make sense? Or is something actually wrong with how they're framed?

**O — Reveal**
Name one thing Stephen has been consistently avoiding. Be direct. Cite the evidence (task dates, appearances in daily notes).

**R — Optimize**
Suggest 2–3 specific changes for next week. Not vague advice — actual changes to task framing, scheduling, or prioritization.

**R — Reset**
- List tasks to archive (done or abandoned)
- Confirm Inbox/ is clear
- Confirm next week's Top 3 are in place

### Phase 3 Additions to Output

```markdown
## 🪞 MIRROR

**Map:** [3–5 bullet summary of the week — facts only]

**Interrogate:**
- Said vs. did: [gap]
- Time sink not on any plan: [if found]
- Task appearing 3+ times, still undone: [if found]

**Reality-check:** [One paragraph — honest assessment given his constraints]

**Reveal:** [One thing being avoided. Evidence-based. Direct.]

**Optimize:**
- [Specific change 1]
- [Specific change 2]
- [Specific change 3 if warranted]

**Reset:**
- Archive: [[task]], [[task]]
- Inbox clear: yes/no
- Next week Top 3: confirmed
```

---

## Rules

- Never write to `Daily Notes/` — read only
- Save every review to `Outputs/` — never overwrite a previous review
- Keep all phases cumulative — Phase 3 includes everything from Phases 1 and 2
- Be direct in the Reveal section — sugarcoating is unhelpful
- Short bullets everywhere except Reality-check and Reveal (those can be prose)
