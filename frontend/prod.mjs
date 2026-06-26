import handler from "./dist/server/server.js";
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const port = parseInt(process.env.PORT || "", 10) || 4173;
const clientDir = path.resolve("dist/client");
const apiJavaUrl = process.env.API_JAVA_URL || "http://localhost:8089";

const mimeTypes = {
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url || "/";

  // Proxy /api/* requests to the Java backend
  if (urlPath.startsWith("/api/")) {
    const target = new URL(urlPath, apiJavaUrl);
    const proxy = target.protocol === "https:" ? https : http;
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks);
      const headers = { ...req.headers };
      delete headers.host;
      delete headers.connection;
      const proxyReq = proxy.request(target, { method: req.method, headers }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      proxyReq.on("error", () => {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad Gateway");
      });
      if (body.length > 0) proxyReq.write(body);
      proxyReq.end();
    });
    return;
  }

  // Serve static files from dist/client/
  if (urlPath.startsWith("/assets/") || urlPath.startsWith("/icon") || urlPath.startsWith("/manifest")) {
    const filePath = path.join(clientDir, urlPath);
    if (filePath.startsWith(clientDir)) {
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          const ext = path.extname(filePath);
          res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      } catch (e) {
        console.log("[STATIC] error:", e.message);
      }
    }
  }

  // Fall through to TanStack Start SSR handler
  const host = req.headers.host || `localhost:${port}`;
  const url = new URL(urlPath, `http://${host}`);

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
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
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
