# iOS Quick Task Capture — Setup Guide

Capture tasks into Bozzone Tasks in seconds from your iPhone home screen. Tasks appear in the app instantly via Firebase — no separate backend needed.

---

## How It Works

The iOS Shortcut sends a small JSON payload to a private "inbox" path in your existing Firebase database. The app listens for inbox items in real-time and imports them automatically, then clears the inbox.

---

## Step 1 — Find Your Sync Key

1. Open [Bozzone Tasks](https://sbozzone.github.io/tasks/)
2. Tap the sync dot (top-right corner)
3. Copy the key shown (e.g. `bozzone-stephen`)

You'll need this key in Step 3.

---

## Step 2 — Build the iOS Shortcut

Open the **Shortcuts** app on your iPhone and create a new shortcut named **"Quick Task"**.

Add these actions in order:

### Action 1 — Ask for task title
- **Ask for Input**
- Prompt: `What's the task?`
- Input Type: Text
- Save result as: `TaskTitle`

### Action 2 — Choose a section
- **Choose from List**
- Items:
  ```
  YourStory — Pre-Publication  (sec-0)
  YourStory — Post-Publication (sec-1)
  Social Marketing Foundation  (sec-2)
  MSS — Miter Saw Station      (sec-3)
  Z$ Shopping List             (sec-4)
  Retooling for Retirement     (sec-5)
  Product Ideas and Designs    (sec-6)
  Financial and Admin          (sec-7)
  ```
- Prompt: `Which section?`
- Save result as: `SectionChoice`

### Action 3 — Map section name to ID
- **If** `SectionChoice` contains `sec-0` → Set Variable `SectionId` = `sec-0`
- Add **Otherwise If** blocks for each section, or use a **Dictionary** action:

  | Key | Value |
  |-----|-------|
  | `YourStory — Pre-Publication  (sec-0)` | `sec-0` |
  | `YourStory — Post-Publication (sec-1)` | `sec-1` |
  | `Social Marketing Foundation  (sec-2)` | `sec-2` |
  | `MSS — Miter Saw Station      (sec-3)` | `sec-3` |
  | `Z$ Shopping List             (sec-4)` | `sec-4` |
  | `Retooling for Retirement     (sec-5)` | `sec-5` |
  | `Product Ideas and Designs    (sec-6)` | `sec-6` |
  | `Financial and Admin          (sec-7)` | `sec-7` |

  Then: **Get Value** from Dictionary for key `SectionChoice` → save as `SectionId`

### Action 4 — Choose priority (optional)
- **Choose from List**
- Items: `None`, `high`, `medium`, `low`
- Prompt: `Priority?`
- Allow selecting nothing: ON
- Save result as: `Priority`

### Action 5 — Build the JSON payload
- **Dictionary** action with these keys:

  | Key | Type | Value |
  |-----|------|-------|
  | `text` | Text | `TaskTitle` (variable) |
  | `sectionId` | Text | `SectionId` (variable) |
  | `priority` | Text | `Priority` (variable) |

- Save as: `Payload`

### Action 6 — POST to Firebase
- **Get Contents of URL**
- URL:
  ```
  https://todomyway-185c9-default-rtdb.firebaseio.com/dashboards/YOUR-SYNC-KEY/inbox.json
  ```
  Replace `YOUR-SYNC-KEY` with your actual sync key from Step 1.
- Method: `POST`
- Request Body: `JSON`
- Body: `Payload` (variable)

### Action 7 — Confirm
- **Show Notification** (or Show Result)
- Message: `Task added!`

---

## Step 3 — Add to Home Screen

1. In the Shortcut editor, tap the **share icon**
2. Tap **Add to Home Screen**
3. Name it `Quick Task`
4. Choose an icon (e.g. a checkmark or the app icon)
5. Tap **Add**

---

## Section Reference

| Section | ID |
|---------|----|
| YourStory — Pre-Publication | `sec-0` |
| YourStory — Post-Publication | `sec-1` |
| Social Marketing Foundation | `sec-2` |
| MSS — Miter Saw Station | `sec-3` |
| Z$ Shopping List | `sec-4` |
| Retooling for Retirement | `sec-5` |
| Product Ideas and Designs | `sec-6` |
| Financial and Admin | `sec-7` |

---

## Firebase Inbox Payload Format

If you want to integrate from other tools (e.g. Zapier, Make, another app), POST this JSON to the inbox endpoint:

```json
{
  "text":      "Task title (required)",
  "sectionId": "sec-4",
  "priority":  "high",
  "desc":      "Optional longer description",
  "dueDate":   "2026-03-15"
}
```

**Endpoint:**
```
POST https://todomyway-185c9-default-rtdb.firebaseio.com/dashboards/{YOUR-SYNC-KEY}/inbox.json
```

> **Note:** `priority` accepts `"high"`, `"medium"`, `"low"`, or omit for none.
> `dueDate` must be `"YYYY-MM-DD"` format or omitted.
> Captured tasks appear in the app within 1–2 seconds.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Task doesn't appear | Check your sync key matches exactly |
| Wrong section | Verify the `sectionId` value in your payload |
| App shows sync dot as red | Check your internet connection |
| Priority not saving | Use lowercase: `high`, `medium`, `low` |
