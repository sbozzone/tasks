# iOS Quick Task Capture — Setup Guide

Capture tasks into Bozzone Tasks in seconds from your iPhone home screen. Every task lands in the **Mailbox** column automatically — no section picking required.

---

## How It Works

Your iPhone Shortcut sends a small JSON payload to a private "inbox" path in your Firebase database. The app picks it up in real-time, drops it into **Mailbox**, and clears the inbox entry — usually within 1–2 seconds.

---

## Step 1 — Find Your Sync Key

1. Open [Bozzone Tasks](https://sbozzone.github.io/tasks/)
2. Tap the **sync dot** (top-right corner)
3. Copy the key shown (e.g. `bozzone-stephen`)

You'll need this in Step 3.

---

## Step 2 — Build the iOS Shortcut

Open the **Shortcuts** app on your iPhone and create a new shortcut. Name it **"Quick Task"** (or anything you like).

Add these actions in order:

---

### Action 1 — Ask for the task title
| Setting | Value |
|---------|-------|
| Action | **Ask for Input** |
| Prompt | `What's the task?` |
| Input Type | Text |
| Variable name | `TaskTitle` |

---

### Action 2 — Choose priority *(optional — skip if you don't need it)*
| Setting | Value |
|---------|-------|
| Action | **Choose from Menu** |
| Prompt | `Priority?` |
| Options | `None`, `high`, `medium`, `low` |
| Variable name | `Priority` |

> **Tip:** If you skip this action, just omit `priority` from the payload in Action 3.

---

### Action 3 — Build the JSON payload
| Setting | Value |
|---------|-------|
| Action | **Dictionary** |

Add these keys to the dictionary:

| Key | Type | Value |
|-----|------|-------|
| `text` | Text | `TaskTitle` *(variable from Action 1)* |
| `priority` | Text | `Priority` *(variable from Action 2, omit if skipped)* |

Save the dictionary as: `Payload`

---

### Action 4 — POST to Firebase
| Setting | Value |
|---------|-------|
| Action | **Get Contents of URL** |
| URL | `https://todomyway-185c9-default-rtdb.firebaseio.com/dashboards/YOUR-SYNC-KEY/inbox.json` |
| Method | `POST` |
| Request Body | `JSON` |
| Body | `Payload` *(variable)* |

> Replace `YOUR-SYNC-KEY` with the key you copied in Step 1.

---

### Action 5 — Confirm
| Setting | Value |
|---------|-------|
| Action | **Show Notification** |
| Message | `Task added to Mailbox ✓` |

---

## Step 3 — Add to Your Home Screen

1. In the Shortcut editor, tap the **share icon** (box with arrow)
2. Tap **Add to Home Screen**
3. Name it `Quick Task`
4. Pick an icon (e.g. ✅ or 📬)
5. Tap **Add**

Tap the icon any time to capture a task in under 10 seconds.

---

## Minimal Shortcut (Title Only)

If you want the fastest possible capture — just a title, no priority prompt — your shortcut only needs **3 actions**:

1. **Ask for Input** → `TaskTitle`
2. **Dictionary** `{ "text": TaskTitle }` → `Payload`
3. **Get Contents of URL** → POST `Payload` to the inbox URL

That's it. The task lands in Mailbox immediately.

---

## Payload Format Reference

For integrations from other tools (Zapier, Make, Scriptable, etc.), POST this JSON to the inbox endpoint:

```json
{
  "text":     "Task title (required)",
  "priority": "high",
  "desc":     "Optional longer description",
  "dueDate":  "2026-03-15"
}
```

**Endpoint:**
```
POST https://todomyway-185c9-default-rtdb.firebaseio.com/dashboards/{YOUR-SYNC-KEY}/inbox.json
```

| Field | Required | Notes |
|-------|----------|-------|
| `text` | ✅ Yes | The task title |
| `priority` | No | `"high"`, `"medium"`, `"low"`, or omit |
| `desc` | No | Short description shown in the task detail |
| `dueDate` | No | Must be `"YYYY-MM-DD"` format |

> All captured tasks go to **Mailbox** regardless of any other fields. From there, drag them into whichever section they belong to.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Task doesn't appear | Double-check your sync key — it must match exactly |
| App sync dot is red | Check your internet connection |
| Priority not saving | Use lowercase: `high`, `medium`, `low` |
| "Permission denied" error from Firebase | Your sync key is wrong or the database URL is incorrect |
| Shortcut asks to allow network access | Tap **Allow** — it needs to reach Firebase |
