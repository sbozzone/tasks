/**
 * Max Agent Team — Cloudflare Worker
 * Backs tasks.html on GitHub Pages with full CRUD via Cloudflare D1
 *
 * Deploy:
 *   1. wrangler d1 create tasks-db
 *   2. Add binding to wrangler.toml: [[d1_databases]] binding="DB" database_name="tasks-db"
 *   3. wrangler d1 execute tasks-db --file=schema.sql
 *   4. Set secret: wrangler secret put BEARER_TOKEN
 *   5. wrangler deploy
 */

const ALLOWED_ORIGINS = ['https://sbozzone.github.io', 'http://localhost:8765'];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) || ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
}

export default {
  async fetch(request, env) {
    const CORS = corsHeaders(request);
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    const method = request.method;

    // ── OAuth flow (no bearer auth required) ─────────────────
    if (path === '/oauth/authorize' && method === 'GET') {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(env.GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(url.origin + '/oauth/callback')}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}` +
        `&access_type=offline&prompt=consent`;
      return Response.redirect(authUrl, 302);
    }

    if (path === '/oauth/callback' && method === 'GET') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          redirect_uri: url.origin + '/oauth/callback',
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (tokens.refresh_token) {
        return new Response(
          `<html><body style="font-family:sans-serif;padding:40px;text-align:center;">` +
          `<h2>&#9989; Calendar Linked!</h2>` +
          `<p>Copy this refresh token and run:</p>` +
          `<pre style="background:#f5f5f5;padding:16px;border-radius:8px;word-break:break-all;">${tokens.refresh_token}</pre>` +
          `<p><code>echo "${tokens.refresh_token}" | npx wrangler secret put GOOGLE_REFRESH_TOKEN</code></p>` +
          `</body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
      return new Response('No refresh token received. Try again with prompt=consent. Response: ' + JSON.stringify(tokens), { status: 400 });
    }

    // Auth check (skip for GET /quotes/today and /oauth routes)
    if (!path.startsWith('/oauth') && !url.pathname.endsWith('/quotes/today')) {
      const auth = request.headers.get('Authorization') || '';
      if (auth !== `Bearer ${env.BEARER_TOKEN}`) {
        return json({ error: 'Unauthorized' }, 401);
      }
    }

    try {
      // ── Tasks ──────────────────────────────────────────────
      if (path === '/tasks' && method === 'GET') {
        const since = url.searchParams.get('since');
        let stmt = since
          ? env.DB.prepare('SELECT * FROM tasks WHERE deleted=0 AND updated_at > ? ORDER BY updated_at DESC').bind(since)
          : env.DB.prepare('SELECT * FROM tasks WHERE deleted=0 ORDER BY updated_at DESC');
        const { results } = await stmt.all();
        return json(results);
      }

      if (path === '/tasks/all' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM tasks WHERE deleted=0 ORDER BY updated_at DESC'
        ).all();
        return json(results);
      }

      if (path === '/tasks' && method === 'POST') {
        const body = await request.json();
        const now = new Date().toISOString();
        const task = {
          id:            body.id || `id-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
          title:         body.title || 'Untitled',
          description:   body.description || null,
          notes:         body.notes || null,
          status:        body.status || 'not_started',
          priority:      body.priority || null,
          due_date:      body.due_date || null,
          start_date:    body.start_date || null,
          completed_date:body.completed_date || null,
          recurrence:    body.recurrence ? JSON.stringify(body.recurrence) : null,
          tags:          JSON.stringify(body.tags || []),
          subtasks:      JSON.stringify(body.subtasks || []),
          section_id:    body.section_id || null,
          agent:         body.agent || null,
          domain:        body.domain || null,
          my_day:        body.my_day ? 1 : 0,
          my_day_pinned: body.my_day_pinned ? 1 : 0,
          my_day_date:   body.my_day_date || null,
          done:          body.done ? 1 : 0,
          deleted:       0,
          created_at:    body.created_at || now,
          updated_at:    now,
          synced_at:     now,
        };
        await env.DB.prepare(`
          INSERT INTO tasks (id,title,description,notes,status,priority,due_date,start_date,
            completed_date,recurrence,tags,subtasks,section_id,agent,domain,my_day,
            my_day_pinned,my_day_date,done,deleted,created_at,updated_at,synced_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).bind(...Object.values(task)).run();
        return json(task, 201);
      }

      const taskMatch = path.match(/^\/tasks\/(.+)$/);
      if (taskMatch && method === 'PATCH') {
        const id = taskMatch[1];
        const body = await request.json();
        const now = new Date().toISOString();
        const fields = Object.entries(body)
          .filter(([k]) => !['id','created_at'].includes(k))
          .map(([k]) => `${k}=?`).join(',');
        const vals = Object.entries(body)
          .filter(([k]) => !['id','created_at'].includes(k))
          .map(([,v]) => (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v);
        await env.DB.prepare(`UPDATE tasks SET ${fields},updated_at=?,synced_at=? WHERE id=?`)
          .bind(...vals, now, now, id).run();
        const updated = await env.DB.prepare('SELECT * FROM tasks WHERE id=?').bind(id).first();
        return json(updated);
      }

      if (taskMatch && method === 'DELETE') {
        const id = taskMatch[1];
        const now = new Date().toISOString();
        await env.DB.prepare('UPDATE tasks SET deleted=1,updated_at=?,synced_at=? WHERE id=?')
          .bind(now, now, id).run();
        return json({ deleted: id });
      }

      // ── Sections ───────────────────────────────────────────
      if (path === '/sections' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM sections ORDER BY sort_order').all();
        return json(results);
      }

      if (path === '/sections' && method === 'POST') {
        const body = await request.json();
        const now = new Date().toISOString();
        const sec = {
          id:         body.id || `sec-${Date.now()}`,
          title:      body.title || 'New Section',
          icon:       body.icon || '📋',
          priority:   body.priority ? 1 : 0,
          sort_order: body.sort_order ?? 99,
          created_at: now,
        };
        await env.DB.prepare(
          'INSERT INTO sections (id,title,icon,priority,sort_order,created_at) VALUES (?,?,?,?,?,?)'
        ).bind(...Object.values(sec)).run();
        return json(sec, 201);
      }

      // ── Projects ─────────────────────────────────────────────
      if (path === '/projects' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM projects ORDER BY name').all();
        return json(results);
      }

      // ── Tags ───────────────────────────────────────────────
      if (path === '/tags' && method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM tags').all();
        return json(results);
      }

      // ── Quotes ─────────────────────────────────────────────
      if (path === '/quotes/today' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT quote, author FROM daily_quotes WHERE active=1 ORDER BY RANDOM() LIMIT 1'
        ).all();
        return json(results[0] || null);
      }

      // ── Bulk sync (desktop push) ────────────────────────────
      if (path === '/sync' && method === 'POST') {
        const body = await request.json();
        const now = new Date().toISOString();
        let count = 0;

        if (body.tasks?.length) {
          for (const t of body.tasks) {
            await env.DB.prepare(`
              INSERT INTO tasks (id,title,description,notes,status,priority,due_date,start_date,
                completed_date,recurrence,tags,subtasks,section_id,agent,domain,my_day,
                my_day_pinned,my_day_date,done,deleted,created_at,updated_at,synced_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
              ON CONFLICT(id) DO UPDATE SET
                title=excluded.title,description=excluded.description,notes=excluded.notes,
                status=excluded.status,priority=excluded.priority,due_date=excluded.due_date,
                recurrence=excluded.recurrence,tags=excluded.tags,subtasks=excluded.subtasks,
                section_id=excluded.section_id,agent=excluded.agent,domain=excluded.domain,
                my_day=excluded.my_day,my_day_pinned=excluded.my_day_pinned,
                my_day_date=excluded.my_day_date,done=excluded.done,deleted=excluded.deleted,
                updated_at=excluded.updated_at,synced_at=?
              WHERE excluded.updated_at > tasks.updated_at
            `).bind(
              t.id, t.title, t.description||null, t.notes||null, t.status||'not_started',
              t.priority||null, t.due_date||null, t.start_date||null, t.completed_date||null,
              typeof t.recurrence==='object'?JSON.stringify(t.recurrence):t.recurrence||null,
              Array.isArray(t.tags)?JSON.stringify(t.tags):t.tags||'[]',
              Array.isArray(t.subtasks)?JSON.stringify(t.subtasks):t.subtasks||'[]',
              t.section_id||null, t.agent||null, t.domain||null,
              t.my_day?1:0, t.my_day_pinned?1:0, t.my_day_date||null,
              t.done?1:0, t.deleted?1:0,
              t.created_at||now, t.updated_at||now, now, now
            ).run();
            count++;
          }
        }

        if (body.sections?.length) {
          for (const s of body.sections) {
            await env.DB.prepare(`
              INSERT INTO sections (id,title,icon,priority,sort_order,created_at)
              VALUES (?,?,?,?,?,?)
              ON CONFLICT(id) DO UPDATE SET title=excluded.title,icon=excluded.icon,
                priority=excluded.priority,sort_order=excluded.sort_order
            `).bind(s.id,s.title,s.icon||'📋',s.priority?1:0,s.sort_order??0,s.created_at||now).run();
          }
        }

        return json({ synced: count, at: now });
      }

      // ── Calendar ─────────────────────────────────────────────
      if (path === '/calendar/events' && method === 'GET') {
        const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
        const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

        // Check cache first
        const cached = await env.DB.prepare(
          'SELECT * FROM calendar_events WHERE event_date=? AND cached_at > ? ORDER BY start_time'
        ).bind(date, new Date(Date.now() - CACHE_TTL).toISOString()).all();

        if (cached.results.length > 0) {
          return json(cached.results);
        }

        // Fetch from all calendar sources
        let allEvents = [];

        // Google Calendar
        if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN) {
          try {
            const gEvents = await fetchGoogleCalendarEvents(env, date);
            allEvents.push(...gEvents);
          } catch (e) { console.warn('Google Calendar fetch failed:', e.message); }
        }

        // Outlook ICS feed
        if (env.OUTLOOK_ICS_URL) {
          try {
            const oEvents = await fetchOutlookICSEvents(env, date);
            allEvents.push(...oEvents);
          } catch (e) { console.warn('Outlook ICS fetch failed:', e.message); }
        }

        if (allEvents.length > 0) {
          // Cache in D1
          await env.DB.prepare('DELETE FROM calendar_events WHERE event_date=?').bind(date).run();
          const now = new Date().toISOString();
          for (const ev of allEvents) {
            await env.DB.prepare(
              'INSERT OR REPLACE INTO calendar_events (id,title,start_time,end_time,all_day,location,description,calendar_id,event_date,cached_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
            ).bind(ev.id, ev.title, ev.start_time, ev.end_time, ev.all_day ? 1 : 0, ev.location, ev.description, ev.calendar_id, date, now).run();
          }
          return json(allEvents);
        }

        // Fall back to whatever is in D1
        const all = await env.DB.prepare(
          'SELECT * FROM calendar_events WHERE event_date=? ORDER BY start_time'
        ).bind(date).all();
        return json(all.results);
      }

      // Manual calendar event sync (for seeding via API)
      if (path === '/calendar/events' && method === 'POST') {
        const body = await request.json();
        const now = new Date().toISOString();
        let count = 0;
        for (const ev of (body.events || [])) {
          await env.DB.prepare(
            'INSERT OR REPLACE INTO calendar_events (id,title,start_time,end_time,all_day,location,description,calendar_id,event_date,cached_at) VALUES (?,?,?,?,?,?,?,?,?,?)'
          ).bind(ev.id, ev.title, ev.start_time, ev.end_time, ev.all_day ? 1 : 0, ev.location || null, ev.description || null, ev.calendar_id || null, ev.event_date, now).run();
          count++;
        }
        return json({ synced: count });
      }

      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
};

// ── Google Calendar API helper ──────────────────────────────
async function fetchGoogleCalendarEvents(env, date) {
  // Exchange refresh token for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenRes.ok) throw new Error('Failed to refresh Google token');
  const { access_token } = await tokenRes.json();

  // Fetch events for the date
  const timeMin = `${date}T00:00:00-04:00`;
  const timeMax = `${date}T23:59:59-04:00`;
  const calUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

  const calRes = await fetch(calUrl, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!calRes.ok) throw new Error('Failed to fetch calendar events');
  const data = await calRes.json();

  return (data.items || []).map(ev => ({
    id: ev.id,
    title: ev.summary || 'Untitled',
    start_time: ev.start?.dateTime || ev.start?.date || null,
    end_time: ev.end?.dateTime || ev.end?.date || null,
    all_day: !!ev.start?.date,
    location: ev.location || null,
    description: ev.description || null,
    calendar_id: 'primary',
    event_date: date,
  }));
}

// ── Outlook ICS feed parser ─────────────────────────────────
async function fetchOutlookICSEvents(env, date) {
  const res = await fetch(env.OUTLOOK_ICS_URL, {
    headers: { 'User-Agent': 'DayPlanner/1.0' },
  });
  if (!res.ok) throw new Error('Failed to fetch ICS feed');
  const ics = await res.text();
  return parseICSForDate(ics, date);
}

function parseICSForDate(icsText, targetDate) {
  const events = [];
  // Unfold continued lines (RFC 5545: lines starting with space/tab are continuations)
  const unfolded = icsText.replace(/\r?\n[ \t]/g, '');
  const blocks = unfolded.split('BEGIN:VEVENT');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split('END:VEVENT')[0];
    const props = {};
    const rawProps = {};
    block.split(/\r?\n/).forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx < 0) return;
      const keyPart = line.substring(0, colonIdx);
      const val = line.substring(colonIdx + 1);
      const key = keyPart.split(';')[0];
      props[key] = val;
      rawProps[key] = { params: keyPart, value: val };
    });

    const summary = props.SUMMARY || 'Untitled';
    const uid = props.UID || `ics-${i}`;
    const location = props.LOCATION || null;
    const dtstart = props.DTSTART || '';
    const dtend = props.DTEND || '';
    const dtstartParams = rawProps.DTSTART ? rawProps.DTSTART.params : '';

    // Parse dates
    const startParsed = parseICSDate(dtstart);
    const endParsed = parseICSDate(dtend);
    if (!startParsed) continue;

    const isAllDay = dtstartParams.includes('VALUE=DATE') || dtstart.length === 8;
    const eventDate = startParsed.date; // YYYY-MM-DD

    if (eventDate !== targetDate) continue;

    events.push({
      id: 'outlook-' + uid.replace(/[^a-zA-Z0-9-]/g, '').substring(0, 60),
      title: summary.replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\\\\/g, '\\'),
      start_time: startParsed.iso,
      end_time: endParsed ? endParsed.iso : null,
      all_day: isAllDay,
      location: location ? location.replace(/\\n/g, ' ').replace(/\\,/g, ',') : null,
      description: null,
      calendar_id: 'outlook',
      event_date: targetDate,
    });
  }
  return events;
}

function parseICSDate(dtStr) {
  if (!dtStr) return null;
  // Clean any trailing whitespace
  dtStr = dtStr.trim();
  // All-day: YYYYMMDD
  if (/^\d{8}$/.test(dtStr)) {
    const y = dtStr.slice(0,4), m = dtStr.slice(4,6), d = dtStr.slice(6,8);
    return { date: `${y}-${m}-${d}`, iso: `${y}-${m}-${d}` };
  }
  // DateTime: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const match = dtStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (match) {
    const [, y, mo, d, h, mi, s, z] = match;
    const dateStr = `${y}-${mo}-${d}`;
    if (z) {
      // UTC — convert to Eastern
      const utc = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`);
      // Determine EDT (-4) vs EST (-5) — simplify: use -4 for Mar-Nov, -5 otherwise
      const month = utc.getUTCMonth(); // 0-indexed
      const offset = (month >= 2 && month <= 10) ? -4 : -5;
      const eastern = new Date(utc.getTime() + offset * 60 * 60 * 1000);
      const ed = eastern.toISOString().split('T')[0];
      const pad = n => String(n).padStart(2,'0');
      const timeStr = `${pad(eastern.getUTCHours())}:${pad(eastern.getUTCMinutes())}:${pad(eastern.getUTCSeconds())}`;
      return { date: ed, iso: `${ed}T${timeStr}${offset === -4 ? '-04:00' : '-05:00'}` };
    }
    // No Z — assume Eastern time (TZID was on the property)
    return { date: dateStr, iso: `${dateStr}T${h}:${mi}:${s}-04:00` };
  }
  return null;
}

