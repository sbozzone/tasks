#!/usr/bin/env python3
"""
Max Agent Team — Local Server
Serves the AgentTeam folder at http://localhost:8765

Endpoints:
  GET /api/status  -> {"ok": true}
  GET /api/inbox   -> {"owner": N, "team": N}
  All other paths  -> static files from this directory
"""

import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

PORT = 8765
BASE = Path(__file__).parent


class TeamHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE), **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/status'):
            self._json({'ok': True, 'port': PORT})
        elif self.path.startswith('/api/inbox'):
            owner = self._count(BASE / 'owner-inbox')
            team  = self._count(BASE / 'team-inbox')
            self._json({'owner': owner, 'team': team})
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/db/save'):
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            db_path = BASE / 'db' / 'max.db'
            db_path.write_bytes(body)
            self._json({'ok': True, 'bytes': len(body)})
        else:
            self.send_response(404)
            self.end_headers()

    def _count(self, folder):
        try:
            return len([f for f in folder.iterdir()
                        if not f.name.startswith('.') and f.is_file()])
        except Exception:
            return 0

    def _json(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Only log non-200/304 responses to keep console clean
        if args and len(args) >= 2 and str(args[1]) not in ('200', '304'):
            super().log_message(fmt, *args)


if __name__ == '__main__':
    os.chdir(BASE)
    server = HTTPServer(('localhost', PORT), TeamHandler)
    print(f'Max Agent Team server running at http://localhost:{PORT}')
    print(f'Command Center: http://localhost:{PORT}/owner-inbox/stephen_ai_command_center_v3.html')
    print('Press Ctrl+C to stop.\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
