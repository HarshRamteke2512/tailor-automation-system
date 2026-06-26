import handler from "./dist/server/server.js";
import http from "node:http";

const port = parseInt(process.env.PORT || "", 10) || 4173;

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${port}`;
  const url = new URL(req.url || "/", `http://${host}`);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v !== undefined) {
      if (Array.isArray(v)) {
        for (const val of v) headers.append(k, val);
      } else {
        headers.set(k, v);
      }
    }
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req : undefined,
  });

  handler
    .fetch(request, {}, {})
    .then((response) => {
      res.writeHead(response.status, Object.fromEntries(response.headers));
      return response.body ? response.body.pipeTo(
        new WritableStream({
          write(chunk) { res.write(chunk); },
          close() { res.end(); },
        })
      ) : res.end();
    })
    .catch((err) => {
      console.error(err);
      res.writeHead(500);
      res.end("Internal Server Error");
    });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Frontend server listening on http://0.0.0.0:${port}`);
});