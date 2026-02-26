# Bozzone Tasks — Setup Guide

## How It Works

- **index.html** — the full app (mobile-responsive, works on phone/iPad/desktop)
- **Firebase Realtime Database** — syncs checkbox states across all your devices
- **GitHub Pages** — free hosting so you can open the URL on any device
- **PWA** — installable to your phone/iPad home screen like a native app

---

## Step 1: Create a Firebase Project (free)

1. Go to https://console.firebase.google.com/
2. Click **Add project**
3. Name it `bozzone-tasks` (or anything you like)
4. Disable Google Analytics (not needed) and click **Create project**

## Step 2: Enable Realtime Database

1. In the left sidebar, click **Build > Realtime Database**
2. Click **Create Database**
3. Choose any location, click **Next**
4. Select **Start in test mode**, click **Enable**

### Set database rules

Go to the **Rules** tab and replace the content with:

```json
{
  "rules": {
    "dashboards": {
      "$key": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

Click **Publish**.

## Step 3: Get Your Firebase Config

1. Click the **gear icon** (top-left) > **Project settings**
2. Scroll to **Your apps** and click the **Web** icon `</>`
3. Enter any nickname (e.g. `tasks`) and click **Register app**
4. You'll see a config block like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "bozzone-tasks.firebaseapp.com",
  databaseURL: "https://bozzone-tasks-default-rtdb.firebaseio.com",
  projectId: "bozzone-tasks",
  storageBucket: "bozzone-tasks.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Copy these values.

## Step 4: Paste Config into index.html

Open `index.html` and find the `firebaseConfig` block near the top of the `<script>` section. Replace the placeholder values with your real ones:

```javascript
var firebaseConfig = {
  apiKey:            "AIzaSy...",        // your real key
  authDomain:        "bozzone-tasks.firebaseapp.com",
  databaseURL:       "https://bozzone-tasks-default-rtdb.firebaseio.com",
  projectId:         "bozzone-tasks",
  storageBucket:     "bozzone-tasks.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123"
};
```

## Step 5: Deploy to GitHub Pages

1. Go to https://github.com and create a **new repository** (e.g. `bozzone-tasks`)
2. Upload these four files: `index.html`, `manifest.json`, `sw.js`, `icon.svg`
3. Go to **Settings > Pages**
4. Under Source, select **Deploy from a branch**
5. Choose `main` branch, `/ (root)` folder, click **Save**
6. Your site will be live at: `https://YOUR_USERNAME.github.io/bozzone-tasks/`

## Step 6: Use It on All Your Devices

1. Open the GitHub Pages URL on your **desktop, phone, and iPad**
2. Enter the **same sync key** on every device (e.g. `bozzone42`)
3. Check a task on one device — it shows checked on all others instantly

### Install on home screen

- **iPhone / iPad:** Open in Safari > tap Share > **Add to Home Screen**
- **Android:** Open in Chrome > tap menu (three dots) > **Add to Home Screen**

The app will open full-screen like a native app.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Green dot doesn't appear | Double-check your Firebase config values in index.html |
| Tasks don't sync | Make sure you used the exact same sync key on both devices |
| "Permission denied" errors | Check your Realtime Database rules (Step 2) |
| App doesn't install to home screen | Make sure you're using HTTPS (GitHub Pages provides this) |

## Notes

- **Firebase API keys are safe to include in client code** — they just identify your project. Security is handled by your database rules.
- **Offline support:** Firebase SDK caches data locally, so the app works even without internet. Changes sync when you reconnect.
- **Test mode** database rules expire after 30 days. Make sure you set the permanent rules from Step 2 before then.
