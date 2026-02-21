import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = "."

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Check if file exists
        path = self.translate_path(self.path)
        if not os.path.exists(path) and not os.path.exists(path + "/index.html"):
            # If not found, serve index.html (SPA Routing)
            self.path = "/index.html"
        super().do_GET()

if __name__ == "__main__":
    # Allow port to be passed as argument
    if len(sys.argv) > 1:
        PORT = int(sys.argv[1])

    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"🌍 Serveur SPA démarré sur http://localhost:{PORT}")
        print(f"👉 Les URLs comme /surprise marcheront maintenant au refresh !")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nArrêt du serveur.")
