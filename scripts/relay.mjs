import http from "node:http";
import net from "node:net";

// Sandboxes/CI often sit behind an authenticated HTTP proxy, and Chromium's
// proxy bypass for localhost is unreliable. So when HTTPS_PROXY is set we run a
// tiny local relay: localhost traffic goes direct, everything else is tunnelled
// through the upstream proxy with its credentials. Credentials are never logged.
export async function startRelay() {
  const raw = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
  if (!raw) return null;
  const up = new URL(raw);
  const auth = up.username ? "Basic " + Buffer.from(`${decodeURIComponent(up.username)}:${decodeURIComponent(up.password)}`).toString("base64") : null;
  const isLocal = (h) => ["localhost", "127.0.0.1", "::1"].includes(h);
  const server = http.createServer((req, res) => {
    const target = new URL(req.url);
    const local = isLocal(target.hostname);
    const opts = local
      ? { host: target.hostname, port: target.port || 80, path: target.pathname + target.search, method: req.method, headers: req.headers }
      : { host: up.hostname, port: up.port || 80, path: req.url, method: req.method, headers: { ...req.headers, ...(auth ? { "proxy-authorization": auth } : {}) } };
    const preq = http.request(opts, (pres) => { res.writeHead(pres.statusCode, pres.headers); pres.pipe(res); });
    preq.on("error", () => { res.writeHead(502); res.end(); });
    req.on("error", () => preq.destroy());
    res.on("error", () => {});
    req.pipe(preq);
  });
  server.on("connect", (req, client, head) => {
    const [host, port] = req.url.split(":");
    if (isLocal(host)) {
      const s = net.connect(Number(port), host, () => { client.write("HTTP/1.1 200 OK\r\n\r\n"); s.write(head); s.pipe(client); client.pipe(s); });
      s.on("error", () => client.destroy());
      client.on("error", () => s.destroy());
      return;
    }
    const s = net.connect(Number(up.port || 80), up.hostname, () => {
      s.write(`CONNECT ${req.url} HTTP/1.1\r\nHost: ${req.url}\r\n${auth ? `Proxy-Authorization: ${auth}\r\n` : ""}\r\n`);
      let buf = Buffer.alloc(0);
      const onData = (d) => {
        buf = Buffer.concat([buf, d]);
        const i = buf.indexOf("\r\n\r\n");
        if (i === -1) return;
        s.off("data", onData);
        const ok = /^HTTP\/1\.[01] 200/.test(buf.slice(0, i).toString());
        if (!ok) { client.end("HTTP/1.1 502 Bad Gateway\r\n\r\n"); s.destroy(); return; }
        client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        const rest = buf.slice(i + 4);
        if (rest.length) client.write(rest);
        s.write(head);
        s.pipe(client); client.pipe(s);
      };
      s.on("data", onData);
    });
    s.on("error", () => client.destroy());
    client.on("error", () => s.destroy());
  });
  server.on("clientError", (_e, sock) => sock.destroy());
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return server;
}
