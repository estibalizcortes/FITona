// Mide la apertura de FITona en un Chromium real contra el servidor indicado (no es una prueba): BASE_URL=... node e2e/perf.mjs
import { chromium } from 'playwright';
const BASE = process.env.BASE_URL ?? 'http://localhost:4300';
const RUNS = Number(process.env.RUNS ?? 5);
const br = await chromium.launch();
const ctx0 = await br.newContext({ viewport: { width: 393, height: 852 }, locale: 'es-ES' });
const p0 = await ctx0.newPage();
await p0.goto(BASE); await p0.waitForSelector('h1:has-text("Entrar")');
await p0.getByRole('button', { name: 'Crear una cuenta' }).click();
await p0.getByLabel('Correo electrónico').fill(`perf${Date.now()}@example.com`);
await p0.getByLabel('Contraseña').fill('una-frase-larga-segura');
await p0.getByLabel('Soy mayor de edad').check(); await p0.getByLabel(/Acepto que FITona guarde/).check();
await p0.getByRole('button', { name: 'Crear cuenta' }).click(); await p0.waitForSelector('a.module', { timeout: 90000 });
const session = await p0.evaluate(() => localStorage.getItem('fitona.session'));
await ctx0.close();
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const rows = [];
for (let i = 0; i < RUNS; i++) {
  const ctx = await br.newContext({ viewport: { width: 393, height: 852 }, locale: 'es-ES', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.addInitScript((v) => localStorage.setItem('fitona.session', v), session);
  let api = 0, stat = 0, bytes = 0;
  p.on('response', async (r) => { const u = r.url(); if (u.includes('/api/')) api++; else stat++; const l = Number(r.headers()['content-length'] ?? 0); bytes += l; });
  const t0 = Date.now();
  await p.goto(BASE + '/inicio', { waitUntil: 'commit' });
  await p.waitForSelector('a.module'); const ui = Date.now() - t0;
  await p.waitForLoadState('networkidle'); const idle = Date.now() - t0;
  const t1 = Date.now();
  await p.locator('a.module', { hasText: 'Comida' }).click(); await p.waitForSelector('text=Aún no hay nada registrado'); const hoy = Date.now() - t1;
  rows.push({ ui, idle, hoy, api, stat, kb: Math.round(bytes / 1024) });
  await ctx.close();
}
const f = (k) => med(rows.map((r) => r[k]));
console.log(`BASE=${BASE} · ${RUNS} ejecuciones (caché HTTP vacía, sin service worker)`);
console.log(`interfaz visible (tarjetas de módulos): mediana ${f('ui')} ms (${rows.map((r) => r.ui).join(', ')})`);
console.log(`red en reposo: mediana ${f('idle')} ms · pantalla «Hoy» de Comida tras pulsar: ${f('hoy')} ms`);
console.log(`peticiones al abrir: ${f('stat')} estáticas + ${f('api')} a la API · transferido (content-length): ~${f('kb')} kB`);
await br.close();
