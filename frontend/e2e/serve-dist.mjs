// Servidor estático de PRUEBA que imita a Render (cabeceras, caché y reescritura SPA). Solo para las pruebas E2E de la PWA.
// Uso: ROOT=/ruta/dist PORT=4300 API_ORIGIN=http://localhost:8080 node e2e/serve-dist.mjs
// GET /__root?dir=/otra/ruta  cambia la carpeta servida (simula desplegar una versión nueva).
import http from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT ?? 4300);
const API = process.env.API_ORIGIN ?? 'http://localhost:8080';
let root = process.env.ROOT;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain' };
const NO_CACHE = new Set(['/ngsw-worker.js', '/safety-worker.js', '/ngsw.json', '/config.js', '/index.html', '/manifest.webmanifest']);
const CSP = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ${API}; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/__root') { root = url.searchParams.get('dir'); res.end('ok'); return; }
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, path);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    if (extname(path)) { res.writeHead(404); res.end('no encontrado'); return; }
    file = join(root, 'index.html'); path = '/index.html'; // reescritura SPA /* -> /index.html
  }
  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', NO_CACHE.has(path) ? 'no-cache' : 'public, max-age=0, must-revalidate');
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`sirviendo ${root} en http://localhost:${PORT}`));
