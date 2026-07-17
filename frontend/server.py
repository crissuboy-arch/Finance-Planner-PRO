import http.server, json, urllib.request, os, socketserver, sys

NVIDIA_KEY = os.environ.get("NVIDIA_API_KEY", "")
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
PORT = int(os.environ.get("PORT", "8000"))
DIR = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        self._cors()
        self.send_response(200)
        self.end_headers()

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_POST(self):
        if self.path == "/api/chat":
            return self._chat()
        self.send_response(404)
        self.end_headers()

    def _chat(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length)) if length else {}

        if not body.get("model"):
            body["model"] = "meta/llama-3.1-8b-instruct"
        body.setdefault("temperature", 0.7)
        body.setdefault("max_tokens", 500)

        req = urllib.request.Request(
            NVIDIA_URL,
            data=json.dumps(body).encode(),
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer " + NVIDIA_KEY,
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            self.send_response(200)
            self._cors()
            self.end_headers()
            self.wfile.write(data)
        except urllib.error.HTTPError as e:
            err = e.read()
            self.send_response(e.code)
            self._cors()
            self.end_headers()
            self.wfile.write(err)

    def end_headers(self):
        if self.path.endswith(".js"):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        if self.path.startswith("/api/"):
            self.send_response(404)
            self.end_headers()
            return
        return super().do_GET()


if __name__ == "__main__":
    os.chdir(DIR)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("Server on http://localhost:" + str(PORT))
        sys.stdout.flush()
        httpd.serve_forever()
