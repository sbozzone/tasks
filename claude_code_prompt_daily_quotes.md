# Claude Code Task: Add Daily Inspiration Quotes to "My Day" Applet

## Objective
Integrate a rotating daily quotes system into the "my day" applet/view that displays a random quote on each page load.

## Requirements

### 1. **Quotes Data File**
- **Location**: Git-tracked text file in the project repository
- **Format**: Organized by sections with numbered entries
- **Structure**:
  ```
  SECTION NAME (X quotes)
  Brief description of section theme
  
  1. Quote text here
  — Attribution/Author
  
  2. Next quote
  — Attribution
  ```
- **Sections to include** (user examples):
  - Daily Inspiration Quotes (~100 entries)
  - Classic Programming & Developer Humor (~400 entries)
  - Additional sections as desired
- **Editability**: User should be able to easily add, delete, or reorganize quotes in this file going forward

### 2. **Frontend Integration**
- **Display behavior**: Show a single random quote on each page load
- **Location**: Display in the "my day" applet/view (specify placement if not obvious)
- **Refresh mechanism**: Pull a new random quote every time the view loads (no caching within a session unless specified)
- **Styling**: Match existing applet aesthetics; attribution should be visually distinct from quote text

### 3. **Code Implementation**
- **Quote loading**: Parse the text file and load quotes into the application
- **Selection logic**: Use cryptographically random selection (avoid predictable patterns)
- **Error handling**: Gracefully handle empty sections or malformed entries
- **Performance**: Quotes file should load efficiently (consider lazy-loading if large)

### 4. **Developer Experience**
- Keep the quotes file human-readable and easy to maintain
- Avoid complex parsing logic—plain text with clear delimiters preferred
- Consider adding a comment section at the top of the file (e.g., "# How to add/edit quotes")

## Deliverables
1. **Quotes file** (git-tracked, in project root or designated folder)
2. **Updated "my day" component** with quote display and random selection logic
3. **Documentation** (inline comments) explaining how to maintain the quotes file

## Optional Enhancements
- Timestamp quotes so users can track which ones were shown recently (avoid repeats)
- Add a "refresh quote" button for on-demand quote cycling
- Include quote categories/tags for filtering (e.g., show only programming humor on certain days)

---

**Start with the quotes file structure and the applet integration, then refine styling as needed.**
