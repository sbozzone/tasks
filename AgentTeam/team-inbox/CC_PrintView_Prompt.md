# Claude Code Prompt — Printable Day Sheet

---

## CONTEXT

Add a print-ready daily sheet to `day-planner.html`. This is a single-sheet landscape
output that combines the digital app data with analog writing space. The user clicks a
Print button in the app header, which renders a hidden print layout and calls
`window.print()`. The regular app UI is completely unchanged — print styles only
activate during printing.

Do not modify any existing views, styles, or JavaScript logic.
All additions are: one print button in the header, one hidden `#print-sheet` div,
CSS `@media print` rules, and one `buildPrintSheet()` function.

---

## PRINT BUTTON

Add a small print button to the existing app header, right side, next to the
settings gear icon.

HTML (insert next to gear icon):
```html
<button class="header-btn print-btn" onclick="printDaySheet()" title="Print today's sheet">
  🖨
</button>
```

CSS (screen only — hide during print):
```css
.print-btn {
  font-size: 1rem;
  padding: 4px 6px;
}
@media print {
  .print-btn { display: none; }
}
```

---

## PRINT TRIGGER FUNCTION

```javascript
function printDaySheet() {
  buildPrintSheet();
  window.print();
}
```

`buildPrintSheet()` populates the `#print-sheet` div with current app data
before `window.print()` is called. Full implementation in the section below.

---

## PRINT LAYOUT STRUCTURE

A single hidden div that only becomes visible during printing:

```html
<div id="print-sheet" aria-hidden="true">
  <!-- populated by buildPrintSheet() before each print -->
</div>
```

CSS to hide on screen and show only when printing:
```css
#print-sheet {
  display: none;
}
@media print {
  /* Hide everything except the print sheet */
  body > *:not(#print-sheet) {
    display: none !important;
  }
  #print-sheet {
    display: block;
  }
}
```

---

## PAGE SETUP — @media print

```css
@media print {
  @page {
    size: landscape;
    margin: 0.5in 0.4in;
  }

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    box-sizing: border-box;
  }

  body {
    background: #fff;
    color: #000;
    font-size: 9pt;
  }

  #print-sheet {
    width: 100%;
    height: 100%;
    font-family: 'DM Sans', 'Segoe UI', sans-serif;
    color: #1a1a1a;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
}
```

---

## PRINT SHEET SECTIONS

### Section A — Header bar (full width, across top)

```
┌─────────────────────────────────────────────────────────────────┐
│  Tuesday, March 31, 2026   4:11 PM   ☁ 78°F Overcast  [pyramid]│
└─────────────────────────────────────────────────────────────────┘
```

HTML structure:
```html
<div class="ps-header">
  <div class="ps-header-left">
    <div class="ps-date" id="ps-date"></div>
    <div class="ps-time" id="ps-time"></div>
  </div>
  <div class="ps-header-center">
    <span class="ps-weather-icon" id="ps-weather-icon"></span>
    <span class="ps-weather-temp" id="ps-weather-temp"></span>
    <span class="ps-weather-desc" id="ps-weather-desc"></span>
  </div>
  <div class="ps-header-right">
    <div class="ps-pyramid">
      <!-- Inline SVG pyramid — drawn in CSS/SVG, no external image needed -->
      <svg width="72" height="48" viewBox="0 0 72 48" xmlns="http://www.w3.org/2000/svg">
        <text x="36" y="6" text-anchor="middle"
          style="font-family:'DM Mono',monospace;font-size:4.5px;fill:#C8430A;letter-spacing:0.05em;font-weight:600">
          PYRAMID OF RELATIONSHIPS
        </text>
        <text x="36" y="10.5" text-anchor="middle"
          style="font-family:'DM Mono',monospace;font-size:3.5px;fill:#999;font-style:italic">
          by Phil Stutz
        </text>
        <!-- Bottom tier: BODY (widest, darkest orange) -->
        <polygon points="10,44 62,44 54,34 18,34" fill="#C8430A"/>
        <text x="36" y="41" text-anchor="middle"
          style="font-family:'DM Sans',sans-serif;font-size:5px;fill:#fff;font-weight:600;letter-spacing:0.08em">
          BODY
        </text>
        <!-- Middle tier: PEOPLE -->
        <polygon points="18,34 54,34 47,24 25,24" fill="#D97757"/>
        <text x="36" y="31" text-anchor="middle"
          style="font-family:'DM Sans',sans-serif;font-size:5px;fill:#fff;font-weight:600;letter-spacing:0.08em">
          PEOPLE
        </text>
        <!-- Top tier: SELF (smallest, lightest) -->
        <polygon points="25,24 47,24 36,14" fill="#E8A87C"/>
        <text x="36" y="22" text-anchor="middle"
          style="font-family:'DM Sans',sans-serif;font-size:4.5px;fill:#fff;font-weight:600;letter-spacing:0.08em">
          SELF
        </text>
      </svg>
    </div>
  </div>
</div>
```

CSS:
```css
@media print {
  .ps-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 6pt;
    margin-bottom: 6pt;
    border-bottom: 1.5pt solid #1a1a1a;
  }

  .ps-header-left {
    display: flex;
    flex-direction: column;
    gap: 1pt;
  }

  .ps-date {
    font-family: 'Lora', 'Georgia', serif;
    font-size: 18pt;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .ps-time {
    font-family: 'DM Mono', monospace;
    font-size: 8pt;
    color: #888;
    margin-top: 2pt;
  }

  .ps-header-center {
    display: flex;
    align-items: center;
    gap: 6pt;
    background: #1a2f4a;
    color: #fff;
    padding: 6pt 14pt;
    border-radius: 6pt;
  }

  .ps-weather-icon { font-size: 16pt; line-height: 1; }

  .ps-weather-temp {
    font-family: 'DM Mono', monospace;
    font-size: 16pt;
    font-weight: 500;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .ps-weather-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 9pt;
    color: rgba(255,255,255,0.75);
  }

  .ps-header-right {
    display: flex;
    align-items: center;
  }

  .ps-pyramid svg {
    display: block;
  }
}
```

---

### Section B — Three-column body

```
┌──────────────────────┬────────────────────┬──────────────────────┐
│  LEFT COLUMN         │  CENTER COLUMN     │  RIGHT COLUMN        │
│  Intention           │  Schedule          │  Notes (lined)       │
│  Gratitude           │  7am–8pm grid      │                      │
│  Agenda              │                    │                      │
│  Tasks               │                    │                      │
│  Quote               │                    │                      │
└──────────────────────┴────────────────────┴──────────────────────┘
```

HTML:
```html
<div class="ps-body">
  <div class="ps-col ps-col-left" id="ps-col-left"></div>
  <div class="ps-col ps-col-center" id="ps-col-center"></div>
  <div class="ps-col ps-col-right" id="ps-col-right"></div>
</div>
```

CSS:
```css
@media print {
  .ps-body {
    display: grid;
    grid-template-columns: 2.4fr 1.8fr 2fr;
    gap: 0;
    flex: 1;
    border: 1pt solid #ccc;
    border-radius: 4pt;
    overflow: hidden;
  }

  .ps-col {
    padding: 8pt 10pt;
    border-right: 1pt solid #ddd;
  }

  .ps-col:last-child { border-right: none; }

  /* Shared label style across all columns */
  .ps-label {
    font-family: 'DM Mono', monospace;
    font-size: 6pt;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #999;
    margin-bottom: 4pt;
    margin-top: 8pt;
    padding-bottom: 2pt;
    border-bottom: 0.5pt solid #e0e0e0;
  }

  .ps-label:first-child { margin-top: 0; }
}
```

---

### LEFT COLUMN content

Built by `buildPrintSheet()`. Populated in this order:

**1. Intention**
```html
<div class="ps-label">Today's Intention</div>
<div class="ps-intention">${data.intention || ''}</div>
<div class="ps-intention-line"></div>  <!-- shown if intention is empty -->
```
```css
@media print {
  .ps-intention {
    font-family: 'Lora', 'Georgia', serif;
    font-style: italic;
    font-size: 10pt;
    color: #1a1a1a;
    min-height: 14pt;
    line-height: 1.4;
  }
  .ps-intention-line {
    border-bottom: 0.75pt solid #ccc;
    margin-top: 2pt;
    height: 0;
  }
}
```

**2. Gratitude**
```html
<div class="ps-label">I'm Grateful For</div>
<div class="ps-gratitude-list">
  <div class="ps-gratitude-row">
    <span class="ps-gnum">1.</span>
    <span class="ps-gtext">${g[0]}</span>
    <span class="ps-gline"></span>
  </div>
  <!-- repeat for 2, 3 -->
</div>
```
```css
@media print {
  .ps-gratitude-list { display: flex; flex-direction: column; gap: 3pt; }
  .ps-gratitude-row {
    display: flex;
    align-items: baseline;
    gap: 4pt;
  }
  .ps-gnum {
    font-family: 'DM Mono', monospace;
    font-size: 7pt;
    color: #999;
    flex-shrink: 0;
    width: 10pt;
  }
  .ps-gtext {
    font-family: 'DM Sans', sans-serif;
    font-size: 9pt;
    color: #1a1a1a;
    min-width: 20pt;
  }
  .ps-gline {
    flex: 1;
    border-bottom: 0.75pt solid #ccc;
    margin-bottom: 1pt;
  }
}
```

**3. Agenda**
Pull from the existing agenda/calendar events data for the selected date.
Show each event as a row: time + title.
```html
<div class="ps-label">Agenda</div>
<div class="ps-agenda-list" id="ps-agenda-list">
  <div class="ps-agenda-row">
    <span class="ps-atime">10:00 AM</span>
    <span class="ps-atitle">Untitled</span>
  </div>
</div>
```
If no agenda items: show 3 blank lines.
```css
@media print {
  .ps-agenda-list { display: flex; flex-direction: column; gap: 3pt; }
  .ps-agenda-row { display: flex; gap: 6pt; align-items: baseline; }
  .ps-atime {
    font-family: 'DM Mono', monospace;
    font-size: 7.5pt;
    color: #666;
    width: 44pt;
    flex-shrink: 0;
  }
  .ps-atitle {
    font-family: 'DM Sans', sans-serif;
    font-size: 9pt;
    color: #1a1a1a;
    flex: 1;
    border-bottom: 0.5pt solid #e8e8e8;
    padding-bottom: 1pt;
  }
}
```

**4. My Day Tasks**
Pull tasks where `myDay === true` (or `dueDate === selectedDate`).
Show up to 8 tasks. Each: circle checkbox + title.
```html
<div class="ps-label">My Day</div>
<div class="ps-task-list" id="ps-task-list">
  <div class="ps-task-row">
    <span class="ps-checkbox">○</span>
    <span class="ps-task-title">Remove door hinges</span>
  </div>
</div>
```
Pad to 8 rows minimum — empty rows show just the checkbox circle and a line.
```css
@media print {
  .ps-task-list { display: flex; flex-direction: column; gap: 3pt; }
  .ps-task-row { display: flex; gap: 6pt; align-items: baseline; }
  .ps-checkbox {
    font-size: 9pt;
    color: #bbb;
    flex-shrink: 0;
    width: 10pt;
  }
  .ps-task-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 9pt;
    color: #1a1a1a;
    flex: 1;
    border-bottom: 0.5pt solid #e8e8e8;
    padding-bottom: 1pt;
    min-height: 11pt;
  }
  /* Done tasks get strikethrough */
  .ps-task-row.done .ps-task-title {
    text-decoration: line-through;
    color: #aaa;
  }
  .ps-task-row.done .ps-checkbox { color: #D97757; }
}
```

**5. Daily Quote**
Pull today's daily quote from the existing quote rotation.
```html
<div class="ps-quote-block">
  <div class="ps-quote-text">"${quote.text}"</div>
  <div class="ps-quote-author">— ${quote.author}</div>
</div>
```
```css
@media print {
  .ps-quote-block {
    margin-top: 8pt;
    padding: 5pt 8pt;
    border-left: 2pt solid #D97757;
    background: #fdf6f2;
  }
  .ps-quote-text {
    font-family: 'Lora', 'Georgia', serif;
    font-style: italic;
    font-size: 8pt;
    color: #5a3020;
    line-height: 1.5;
  }
  .ps-quote-author {
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    color: #999;
    margin-top: 2pt;
  }
}
```

---

### CENTER COLUMN — Hourly schedule grid

Time slots from 7:00 AM to 8:00 PM in 30-minute increments.
Each slot: time label on left, content area on right.
Agenda events that fall within a time slot are pre-filled.
All other slots are blank lines for handwriting.

```javascript
// Time slots to generate
const slots = [];
for (let h = 7; h <= 20; h++) {
  slots.push({ h, m: 0 });
  if (h < 20) slots.push({ h, m: 30 });
}
// Format: "7:00 AM", "7:30 AM", etc.
```

```html
<div class="ps-label">Schedule</div>
<div class="ps-schedule-grid">
  <div class="ps-slot">
    <span class="ps-slot-time">7:00 AM</span>
    <span class="ps-slot-content"></span>  <!-- or event title if matched -->
  </div>
  <!-- ... one row per 30-min slot ... -->
</div>
```

Event matching logic: for each agenda event with a time, find the slot where
`slotTime <= eventTime < slotTime + 30min` and inject the event title into
`ps-slot-content`. All-day events are shown at the very top before 7:00 AM
under an "ALL DAY" label.

```css
@media print {
  .ps-schedule-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ps-slot {
    display: flex;
    align-items: baseline;
    gap: 4pt;
    border-bottom: 0.5pt solid #ececec;
    padding: 1.5pt 0;
  }

  /* Hour slots get a slightly darker line */
  .ps-slot.hour { border-bottom-color: #ccc; }

  .ps-slot-time {
    font-family: 'DM Mono', monospace;
    font-size: 6.5pt;
    color: #999;
    width: 32pt;
    flex-shrink: 0;
    line-height: 1.4;
  }

  /* Half-hour times are lighter */
  .ps-slot.half-hour .ps-slot-time { color: #ccc; font-size: 6pt; }

  .ps-slot-content {
    flex: 1;
    font-family: 'DM Sans', sans-serif;
    font-size: 8pt;
    color: #1a1a1a;
    min-height: 9pt;
    line-height: 1.3;
  }

  /* Pre-filled events get accent treatment */
  .ps-slot-content.has-event {
    color: #1a3a5c;
    font-weight: 500;
  }

  .ps-all-day {
    display: flex;
    gap: 4pt;
    align-items: baseline;
    padding: 2pt 0 4pt;
    border-bottom: 1pt solid #ccc;
    margin-bottom: 3pt;
  }

  .ps-all-day-label {
    font-family: 'DM Mono', monospace;
    font-size: 6pt;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    width: 32pt;
    flex-shrink: 0;
  }

  .ps-all-day-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 8pt;
    color: #1a1a1a;
    font-weight: 500;
  }
}
```

---

### RIGHT COLUMN — Lined notes space

Pure analog writing area. No dynamic content. Just a header and ruled lines.

Built statically — does not need `buildPrintSheet()` to populate it.
Inject once at page load as static HTML inside `ps-col-right`.

```html
<div class="ps-label">Notes</div>
<div class="ps-lined-notes">
  <!-- 22 ruled lines — enough to fill the column -->
</div>
```

Generate 22 `<div class="ps-line"></div>` elements.

```css
@media print {
  .ps-col-right {
    background: #fdfcfa;  /* very faint warm tint */
  }

  .ps-lined-notes {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: 2pt;
    height: calc(100% - 20pt);
  }

  .ps-line {
    flex: 1;
    border-bottom: 0.75pt solid #ddd;
    min-height: 14pt;
  }

  /* Every 5th line slightly darker — helps visual grouping when writing */
  .ps-line:nth-child(5n) { border-bottom-color: #bbb; }
}
```

---

## buildPrintSheet() FUNCTION

This function runs every time the print button is clicked.
It reads current app state and populates the `#print-sheet` div.

```javascript
function buildPrintSheet() {
  const dateStr = getSelectedDateStr(); // existing function — returns 'YYYY-MM-DD'
  const dateObj = new Date(dateStr + 'T12:00:00'); // noon to avoid timezone edge cases
  const dailyData = loadDailyData(dateStr);

  // ── Header ──────────────────────────────────────────────────────
  // Date
  document.getElementById('ps-date').textContent = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // Time (current time, not date-specific)
  document.getElementById('ps-time').textContent = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit'
  });

  // Weather — pull from existing cached weather data in localStorage
  const weatherCache = JSON.parse(localStorage.getItem('dp_weather_cache') || 'null');
  if (weatherCache?.data) {
    const w = weatherCache.data; // use existing weather data structure
    document.getElementById('ps-weather-icon').textContent = w.currentIcon || '🌤';
    document.getElementById('ps-weather-temp').textContent = `${w.currentTemp}°F`;
    document.getElementById('ps-weather-desc').textContent = w.currentCondition || '';
  }

  // ── Left Column ────────────────────────────────────────────────
  const leftCol = document.getElementById('ps-col-left');

  // Intention
  const intentionEl = leftCol.querySelector('.ps-intention');
  if (intentionEl) intentionEl.textContent = dailyData.intention || '';

  // Gratitude
  const gTexts = leftCol.querySelectorAll('.ps-gtext');
  (dailyData.gratitude || ['', '', '']).forEach((g, i) => {
    if (gTexts[i]) gTexts[i].textContent = g;
  });

  // Agenda — pull from existing agenda events data
  const agendaList = document.getElementById('ps-agenda-list');
  const events = getAgendaEventsForDate(dateStr); // use existing function that powers the Agenda section
  agendaList.innerHTML = '';
  const agendaItems = events.length > 0 ? events : [null, null, null]; // 3 blank rows if empty
  agendaItems.slice(0, 8).forEach(ev => {
    const row = document.createElement('div');
    row.className = 'ps-agenda-row';
    row.innerHTML = `
      <span class="ps-atime">${ev ? formatEventTime(ev) : ''}</span>
      <span class="ps-atitle">${ev ? ev.title : ''}</span>
    `;
    agendaList.appendChild(row);
  });

  // Tasks — myDay tasks for selected date
  const taskList = document.getElementById('ps-task-list');
  const tasks = getMyDayTasksForDate(dateStr); // myDay===true tasks, or dueDate===dateStr
  taskList.innerHTML = '';
  const paddedTasks = [...tasks.slice(0, 8)];
  while (paddedTasks.length < 8) paddedTasks.push(null); // pad to 8 rows
  paddedTasks.forEach(task => {
    const row = document.createElement('div');
    row.className = `ps-task-row${task?.done ? ' done' : ''}`;
    row.innerHTML = `
      <span class="ps-checkbox">${task?.done ? '✓' : '○'}</span>
      <span class="ps-task-title">${task?.title || ''}</span>
    `;
    taskList.appendChild(row);
  });

  // Quote — use existing quote selection logic
  const quote = getDailyQuote(); // existing function
  const quoteBlock = leftCol.querySelector('.ps-quote-block');
  if (quoteBlock && quote) {
    quoteBlock.querySelector('.ps-quote-text').textContent = `"${quote.text}"`;
    quoteBlock.querySelector('.ps-quote-author').textContent = `— ${quote.author || 'Unknown'}`;
  }

  // ── Center Column — Schedule ───────────────────────────────────
  const centerCol = document.getElementById('ps-col-center');
  const scheduleGrid = centerCol.querySelector('.ps-schedule-grid');
  scheduleGrid.innerHTML = '';

  // All-day events
  const allDayEvents = events.filter(e => e.allDay);
  allDayEvents.forEach(ev => {
    const row = document.createElement('div');
    row.className = 'ps-all-day';
    row.innerHTML = `
      <span class="ps-all-day-label">All day</span>
      <span class="ps-all-day-title">${ev.title}</span>
    `;
    scheduleGrid.appendChild(row);
  });

  // Timed slots 7am–8pm, 30-min increments
  const timedEvents = events.filter(e => !e.allDay);
  for (let h = 7; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 20 && m === 30) break;
      const slotMinutes = h * 60 + m;
      const isHour = m === 0;

      // Find matching event
      const matchedEvent = timedEvents.find(ev => {
        const evMin = getEventStartMinutes(ev); // minutes since midnight
        return evMin >= slotMinutes && evMin < slotMinutes + 30;
      });

      const timeLabel = formatSlotTime(h, m); // "7:00 AM", "7:30 AM"

      const slot = document.createElement('div');
      slot.className = `ps-slot ${isHour ? 'hour' : 'half-hour'}`;
      slot.innerHTML = `
        <span class="ps-slot-time">${isHour ? timeLabel : timeLabel.replace(/^\d+/, '')}</span>
        <span class="ps-slot-content ${matchedEvent ? 'has-event' : ''}">
          ${matchedEvent ? matchedEvent.title : ''}
        </span>
      `;
      scheduleGrid.appendChild(slot);
    }
  }

  // Notes area in daily data
  // (Right column is static ruled lines — no dynamic content needed)
}
```

---

## HELPER FUNCTIONS

Add these small helpers if they don't already exist in the app:

```javascript
function formatSlotTime(h, m) {
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m === 0 ? '00' : '30';
  return `${displayH}:${displayM} ${period}`;
}

function getEventStartMinutes(ev) {
  // Parse event start time to minutes since midnight
  // Adapt to whatever format the existing agenda events use
  if (!ev.startTime) return -1;
  const [h, m] = ev.startTime.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatEventTime(ev) {
  if (ev.allDay) return 'All day';
  if (!ev.startTime) return '';
  const [h, m] = ev.startTime.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  const displayM = m === 0 ? '' : `:${String(m).padStart(2,'0')}`;
  return `${displayH}${displayM} ${period}`;
}
```

---

## STATIC PRINT SHEET SKELETON

The `#print-sheet` div should be written into the HTML with its full skeleton
so only the dynamic parts (text content) need to be filled by `buildPrintSheet()`.
This avoids rebuilding the entire DOM on every print.

Write the complete static skeleton into `#print-sheet` at page load:

```html
<div id="print-sheet" aria-hidden="true">

  <!-- HEADER -->
  <div class="ps-header">
    <div class="ps-header-left">
      <div class="ps-date" id="ps-date"></div>
      <div class="ps-time" id="ps-time"></div>
    </div>
    <div class="ps-header-center">
      <span class="ps-weather-icon" id="ps-weather-icon"></span>
      <span class="ps-weather-temp" id="ps-weather-temp"></span>
      <span class="ps-weather-desc" id="ps-weather-desc"></span>
    </div>
    <div class="ps-header-right">
      <div class="ps-pyramid">
        <!-- SVG pyramid here (paste from above) -->
      </div>
    </div>
  </div>

  <!-- BODY -->
  <div class="ps-body">

    <!-- LEFT COLUMN -->
    <div class="ps-col ps-col-left" id="ps-col-left">
      <div class="ps-label">Today's Intention</div>
      <div class="ps-intention"></div>
      <div class="ps-intention-line"></div>

      <div class="ps-label">I'm Grateful For</div>
      <div class="ps-gratitude-list">
        <div class="ps-gratitude-row"><span class="ps-gnum">1.</span><span class="ps-gtext"></span><span class="ps-gline"></span></div>
        <div class="ps-gratitude-row"><span class="ps-gnum">2.</span><span class="ps-gtext"></span><span class="ps-gline"></span></div>
        <div class="ps-gratitude-row"><span class="ps-gnum">3.</span><span class="ps-gtext"></span><span class="ps-gline"></span></div>
      </div>

      <div class="ps-label">Agenda</div>
      <div class="ps-agenda-list" id="ps-agenda-list"></div>

      <div class="ps-label">My Day</div>
      <div class="ps-task-list" id="ps-task-list"></div>

      <div class="ps-quote-block">
        <div class="ps-quote-text"></div>
        <div class="ps-quote-author"></div>
      </div>
    </div>

    <!-- CENTER COLUMN -->
    <div class="ps-col ps-col-center" id="ps-col-center">
      <div class="ps-label">Schedule</div>
      <div class="ps-schedule-grid" id="ps-schedule-grid"></div>
    </div>

    <!-- RIGHT COLUMN -->
    <div class="ps-col ps-col-right" id="ps-col-right">
      <div class="ps-label">Notes</div>
      <div class="ps-lined-notes" id="ps-lined-notes">
        <!-- 22 lines injected once at load -->
      </div>
    </div>

  </div>
</div>
```

Inject the 22 note lines once at app load (not on every print):
```javascript
const linesContainer = document.getElementById('ps-lined-notes');
if (linesContainer && linesContainer.children.length === 0) {
  for (let i = 0; i < 22; i++) {
    const line = document.createElement('div');
    line.className = 'ps-line';
    linesContainer.appendChild(line);
  }
}
```

---

## VERIFICATION CHECKLIST

- [ ] Print 🖨 button appears in the header next to the gear icon
- [ ] Clicking the print button opens the browser print dialog
- [ ] Printed output is landscape orientation, single page
- [ ] Header shows: full date in Lora serif, current time, weather pill, Stutz pyramid SVG
- [ ] Left column shows: intention (or blank line), 3 gratitude lines, agenda events, 8 task rows, quote with accent border
- [ ] Center column shows: 7:00 AM – 8:00 PM in 30-min slots; agenda events pre-filled in correct slots
- [ ] Right column shows: 22 ruled lines on warm background, no dynamic content
- [ ] All-day events appear above the 7:00 AM slot with "All day" label
- [ ] Done tasks show strikethrough and ✓ checkbox
- [ ] Empty task rows show ○ and a ruled line
- [ ] Gratitude lines with text show the text; empty ones show just the rule line
- [ ] The regular app UI is completely hidden during print
- [ ] The print sheet div is invisible on screen
- [ ] No color backgrounds bleed outside their containers when printed
- [ ] Push updated file to GitHub Pages when done
