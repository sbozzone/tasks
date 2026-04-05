# /new — Capture & Classify

Input: $ARGUMENTS

Take whatever Stephen typed and turn it into properly structured vault files.

## Steps

### 1. Parse the input
Extract all entities present in `$ARGUMENTS`:
- **Tasks** — anything with an action and an endpoint
- **Projects** — larger bodies of work made of multiple tasks
- **Ideas** — thoughts, concepts, inspirations (no immediate action required)
- **People** — any individual mentioned by name in a relational context

### 2. Assign business tags
Use these tags in the `business:` YAML field based on context clues:

| If input mentions... | Tag with... |
|---|---|
| workshop, bench, tool, shelf, storage, lumber, wood | `workshop` |
| furniture, custom build, woodworking, client piece | `yourStory-home-design` |
| detailing, wash, van, mobile spa, car care | `time-to-shine` |
| handyman, repair, fix, estimate, contractor | `i-got-a-guy` |
| consulting, CAD, mechanical, engineering, design | `inspiration-at-innovation` |
| 3D print, filament, print farm, model, resin | `3d-printing` |
| YouTube, video, episode, content, channel, craftsman, retirement | `retooling-for-retirement` |
| day job, data, analyst, work, report, meeting (without other context) | `day-job` |

When unclear, use context to infer. If still ambiguous, tag `personal` and note the uncertainty.

### 3. Score confidence for each entity
Rate 0.0–1.0:
- **≥ 0.7** → Create immediately
- **0.5–0.69** → Create with best guess, flag uncertainty in report
- **< 0.5** → Ask one focused question, then act

### 4. Check for duplicates
Before creating any file:
- Search `Tasks/`, `Projects/`, `Ideas/`, `People/` for similar titles
- Fuzzy match is fine (same words, slightly different phrasing)
- If a close match exists → **update it**, don't create a duplicate
- Note the update in your report

### 5. Create files
Use YAML front matter on every file.

**Task template:**
```markdown
---
type: task
status: open
priority: medium
due: YYYY-MM-DD
tags: []
business: [tag]
created: YYYY-MM-DD
recurring: false
---

# [Task Title]

[Any context from the input worth preserving]
```

**Project template:**
```markdown
---
type: project
status: active
started: YYYY-MM-DD
tags: []
business: [tag]
---

# [Project Name]

## Goal
[Inferred from input]

## Active Tasks
- [[linked-task-file]]

## Notes
[Any context from the input]
```

**Idea template:**
```markdown
---
type: idea
created: YYYY-MM-DD
tags: []
business: [tag]
---

# [Idea Title]

[Full thought as captured — preserve the original language]
```

**Person template:**
```markdown
---
type: person
last-contact: YYYY-MM-DD
tags: []
---

# [First Last]

## Context
[Role, how they're connected to Stephen's work]

## Open Items
- [[linked-task-file]]
```

### 6. Link everything
- Every task links to its project (if one exists or was created)
- Every task links to a person (if one was mentioned)
- Every project links back to its tasks
- Every person file lists their linked open items
- Use `[[filename-without-extension]]` format

### 7. Handle due dates
- If a date is mentioned explicitly → use it
- "tomorrow" → tomorrow's date
- "next [day]" → calculate correctly
- "this week" → Friday of the current week
- No date mentioned → leave `due:` field empty, note it in report

### 8. Commit
Auto-commit fires after this command completes.
Format: `cos: /new - [brief summary of what was created/updated]`

Example: `cos: /new - created task "measure shelf bay A", tagged workshop`

### 9. Report in terminal
Short and direct. Tell Stephen:
- What files were created (with links)
- What files were updated
- Any confidence flags or questions
- Any duplicate matches found

Example:
```
Created:
- Tasks/2026-04-04-measure-shelf-bay-a.md [workshop]
- Projects/workshop-organization.md [workshop] (new)

Linked: task → project
Due: no date provided — field left empty
```

---

## Rules

- Never write to `Daily Notes/`
- Always deduplicate before creating
- Preserve the original thought in idea files — don't sanitize it
- If input mentions multiple unrelated things, handle all of them in one pass
- Short report — bullets only
