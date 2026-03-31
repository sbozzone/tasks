# Claude Code Prompt — Fix Print Button Visibility

---

## PROBLEM

The print button in the app header is nearly invisible — it renders as a tiny `⊡` 
icon that blends into the header. It needs to be a clearly visible, labeled button
that users can actually find and click.

---

## FIX

Replace the current print button with a clearly labeled pill button that matches
the style of the existing "Add to My Day" button but in a secondary/outline style.

Find the existing print button element in the header (likely `class="print-btn"` or
the button with the `🖨` or `⊡` icon) and replace it with:

```html
<button class="print-day-btn" onclick="printDaySheet()" title="Print today's sheet">
  🖨 Print
</button>
```

CSS — add to the stylesheet (screen only, hidden during print):

```css
.print-day-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'DM Sans', sans-serif;
  font-size: .78rem;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--card-bg);
  color: var(--text-sec);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.print-day-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

@media print {
  .print-day-btn { display: none; }
}
```

Place the button in the header between the view tabs and the gear icon so it is
clearly visible. If there is a right-side header action area, put it there.
It should be as easy to spot as the gear icon — not tucked away.

---

## VERIFICATION

- [ ] A clearly visible "🖨 Print" pill button appears in the header
- [ ] Clicking it triggers the print dialog
- [ ] Button disappears when printing (does not appear on the printed sheet)
- [ ] Button matches the app's light warm style — not jarring
- [ ] Push to GitHub Pages when done
