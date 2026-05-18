import http.server
import os

os.chdir('/Users/talia.b/Documents/Tenengroup-Sites-Design-System')

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress access logs

server = http.server.HTTPServer(('', 3333), Handler)
server.serve_forever()
