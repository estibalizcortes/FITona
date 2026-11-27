// E2E de la PWA en Chromium real: manifiesto, instalabilidad, CSP, service worker, sin conexión, servidor despertando,
// actualizaciones y auditoría de que NO se guardan datos privados en cachés.
// Requisitos: backend en :8080 con CORS para http://localhost:4300, y e2e/serve-dist.mjs sirviendo la versión 1 en :4300.
// Variables: BASE_URL (http://localhost:4300), V2_DIR (carpeta con la versión 2), V1_DIR.
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4300';
const API = process.env.API_URL ?? 'http://localhost:8080';
const V1 = process.env.V1_DIR, V2 = process.env.V2_DIR;
const SHOTS = process.env.SHOTS_DIR ?? 'e2e/screenshots';
mkdirSync(SHOTS, { recursive: true });
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'OK  ' : 'FALLO'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Tras entrar se ve el selector de módulos: se abre Comida. «Alimentos» se alcanza desde Yo -> Mis alimentos.
async function enterFood(page) {
  await page.locator('a.module', { hasText: 'Comida' }).click({ timeout: 120000 });
  await page.waitForSelector('text=Aún no hay nada registrado');
}
async function goFoods(page) {
  await page.locator('nav.tabbar a', { hasText: 'Yo' }).click();
  await page.getByRole('link', { name: 'Mis alimentos' }).click();
  await page.waitForSelector('h1:has-text("Alimentos")');
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, locale: 'es-ES', serviceWorkers: 'allow' });
const page = await ctx.newPage();
const consoleErrors = [];
const wakePings = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));
page.on('request', (r) => { if (r.url().includes('/q/health/live')) wakePings.push(r.url()); });

try {
  // 1) Manifiesto
  const mres = await ctx.request.get(`${BASE}/manifest.webmanifest`);
  const m = await mres.json();
  check('manifiesto con tipo MIME correcto', (mres.headers()['content-type'] ?? '').includes('manifest+json'));
  check('manifiesto: pantalla completa (standalone), id, ámbito y arranque', m.display === 'standalone' && m.id === '/' && m.scope === '/' && m.start_url.startsWith('/'), `${m.display} · ${m.start_url}`);
  check('manifiesto: nombre, colores e idioma', m.name.includes('FITona') && m.short_name === 'FITona' && m.theme_color === '#b34a24' && m.background_color === '#fbf6ef' && m.lang === 'es');
  const any = m.icons.filter((i) => i.purpose === 'any').map((i) => i.sizes), mask = m.icons.filter((i) => i.purpose === 'maskable').map((i) => i.sizes);
  check('manifiesto: iconos any (48→512) y maskable (192 y 512)', any.length >= 8 && any.includes('192x192') && any.includes('512x512') && mask.includes('192x192') && mask.includes('512x512'), `${any.length} any · ${mask.length} maskable`);
  await page.goto(`${BASE}/entrar`);
  const iconCheck = await page.evaluate(async (icons) => Promise.all(icons.map((i) => new Promise((res) => {
    const img = new Image(); img.onload = () => res([i.src, `${img.naturalWidth}x${img.naturalHeight}` === i.sizes]); img.onerror = () => res([i.src, false]); img.src = '/' + i.src;
  }))), m.icons);
  check('todos los iconos del manifiesto existen y miden lo que declaran', iconCheck.every(([, ok]) => ok), `${iconCheck.length} iconos`);
  check('accesos directos del manifiesto (Registrar, Plan, Trabajo)', (m.shortcuts ?? []).length === 3);

  // 2) index.html: iOS, zonas seguras, pantalla de arranque
  const html = await (await ctx.request.get(`${BASE}/`)).text();
  check('iOS: modo app, título, barra de estado e icono táctil', /apple-mobile-web-app-capable/.test(html) && /apple-mobile-web-app-title" content="FITona/.test(html) && /status-bar-style/.test(html) && /rel="apple-touch-icon"/.test(html));
  check('iOS: pantallas de inicio por modelo (≥ 10)', (html.match(/apple-touch-startup-image/g) ?? []).length >= 10, `${(html.match(/apple-touch-startup-image/g) ?? []).length}`);
  check('viewport-fit=cover y pantalla de arranque propia antes de cargar Angular', /viewport-fit=cover/.test(html) && /class="boot"/.test(html));
  const cssUrl = html.match(/href="(styles-[^"]+\.css)"/)[1];
  const css = await (await ctx.request.get(`${BASE}/${cssUrl}`)).text();
  check('zonas seguras del iPhone en el CSS (arriba, abajo, izquierda y derecha)', ['top', 'bottom', 'left', 'right'].every((s) => css.includes(`safe-area-inset-${s}`)));

  // 3) Arranque bajo CSP + service worker
  await page.goto(`${BASE}/`);
  await page.waitForSelector('h1:has-text("Entrar")');
  const csp = (await (await ctx.request.get(`${BASE}/`)).headers())['content-security-policy'] ?? '';
  check('cabecera CSP estricta (scripts solo propios) y la app arranca sin violaciones', /script-src 'self'/.test(csp) && !/script-src[^;]*unsafe/.test(csp) && !consoleErrors.some((e) => /Content Security Policy/i.test(e)), consoleErrors.filter((e) => /Content Security/i.test(e)).join(' | ').slice(0, 120));
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); await page.waitForSelector('h1:has-text("Entrar")');
  await sleep(1500);
  const swState = await page.evaluate(async () => ({ controlled: !!navigator.serviceWorker.controller, active: (await navigator.serviceWorker.getRegistration())?.active?.state }));
  check('service worker activo y controlando la página', swState.controlled && swState.active === 'activated', JSON.stringify(swState));
  const cdp = await ctx.newCDPSession(page);
  const inst = await cdp.send('Page.getInstallabilityErrors');
  check('Chrome la considera instalable (0 errores de instalabilidad)', inst.installabilityErrors.length === 0, JSON.stringify(inst.installabilityErrors.map((e) => e.errorId)));
  check('al abrir la app se «despierta» el backend en segundo plano', wakePings.length >= 1, wakePings[0] ?? 'sin ping');

  // 4) Cuenta y sesión persistente
  const mail = `pwa${Date.now()}@example.com`;
  await page.getByRole('button', { name: 'Crear una cuenta' }).click();
  await page.getByLabel('Correo electrónico').fill(mail);
  await page.getByLabel('Contraseña').fill('una-frase-larga-segura');
  await page.getByLabel('Soy mayor de edad').check();
  await page.getByLabel(/Acepto que FITona guarde/).check();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await enterFood(page);
  check('crear cuenta y entrar bajo CSP + service worker (con el backend de otro dominio)', true);
  await page.reload(); await page.waitForSelector('text=Aún no hay nada registrado');
  const sess = await page.evaluate(() => JSON.parse(localStorage.getItem('fitona.session') ?? 'null'));
  check('la sesión sobrevive a cerrar y reabrir (token guardado en el dispositivo)', !!sess?.token && sess.email === mail);
  await page.evaluate(() => localStorage.setItem('fitona.session', '{"token":"basura <script>","email":1}'));
  await page.reload(); await page.waitForSelector('h1:has-text("Entrar")');
  check('un valor de sesión corrupto o manipulado se descarta y se pide entrar de nuevo', (await page.evaluate(() => localStorage.getItem('fitona.session'))) === null);
  await page.getByLabel('Correo electrónico').fill(mail);
  await page.getByLabel('Contraseña').fill('una-frase-larga-segura');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await enterFood(page);
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem('fitona.session')).token);

  // 5) Auditoría de cachés: nada privado
  await goFoods(page);
  await page.getByLabel('Buscar').fill('manzana'); await page.waitForSelector('.result');
  await page.locator('nav.tabbar a', { hasText: 'Recetas' }).click(); await sleep(800);
  const audit = await page.evaluate(async (tok) => {
    const out = { caches: 0, entries: 0, apiUrls: [], leaks: [] };
    for (const name of await caches.keys()) {
      out.caches++;
      const c = await caches.open(name);
      for (const req of await c.keys()) {
        out.entries++;
        if (/\/api\/|:8080|config\.js/.test(req.url)) out.apiUrls.push(req.url);
        const r = await c.match(req);
        if (r && /text|json|javascript/.test(r.headers.get('content-type') ?? '')) { const t = await r.clone().text(); if (t.includes(tok)) out.leaks.push(req.url); }
      }
    }
    return out;
  }, token);
  check('cachés del navegador: solo archivos estáticos; ninguna URL de /api ni config.js', audit.entries > 5 && audit.apiUrls.length === 0, `${audit.caches} cachés · ${audit.entries} archivos · API: ${audit.apiUrls.length}`);
  check('el token de sesión no aparece en ninguna caché', audit.leaks.length === 0);
  const hdr = await ctx.request.get(`${API}/api/v1/foods?q=manzana`, { headers: { Authorization: `Bearer ${token}` } });
  check('respuestas de la API con Cache-Control: no-store', hdr.headers()['cache-control'] === 'no-store', hdr.headers()['cache-control']);

  // 6) Servidor despertando
  // context.route (no page.route): con un service worker activo, page.route no ve las peticiones
  await ctx.route('**/api/v1/foods?**', async (route) => { await sleep(6500); await route.continue(); });
  await goFoods(page);
  await page.getByLabel('Buscar').fill('pera');
  await page.waitForSelector('.notice:has-text("despertando")', { timeout: 9000 });
  check('si el servidor tarda, aviso amable «se está despertando»', true);
  await page.waitForSelector('.result', { timeout: 20000 });
  check('el aviso desaparece cuando el servidor responde', (await page.locator('.notice:has-text("despertando")').count()) === 0);
  await ctx.unroute('**/api/v1/foods?**');

  // 7) Sin conexión
  await ctx.setOffline(true);
  await page.waitForSelector('.notice.err:has-text("Sin conexión a Internet")');
  check('sin conexión: aviso claro y la app sigue abierta', true);
  await page.getByLabel('Buscar').fill('plátano'); await sleep(1500);
  await page.waitForSelector('main .error:has-text("Sin conexión a Internet")', { timeout: 15000 });
  check('sin conexión: mensaje comprensible («Sin conexión a Internet… no se ha guardado nada») en lugar de un error genérico', true);
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForSelector('nav.tabbar', { timeout: 20000 });
  check('sin conexión: la app se abre igualmente desde el service worker (sesión conservada)', true);
  await ctx.setOffline(false);
  await page.waitForFunction(() => !document.querySelector('.notice.err'), null, { timeout: 15000 });
  check('al volver la conexión desaparece el aviso y todo funciona', true);

  // 8) Actualizaciones
  if (V1 && V2) {
    await ctx.request.get(`${BASE}/__root?dir=${encodeURIComponent(V2)}`);
    await page.reload(); await page.waitForSelector('nav.tabbar');
    await page.waitForSelector('.notice.ok:has-text("versión nueva")', { timeout: 60000 });
    const before = await page.evaluate(() => document.querySelector('meta[name=x-build]')?.content ?? 'v1');
    check('al publicarse una versión nueva se avisa («Hay una versión nueva») sin perder la sesión', true, `en pantalla: ${before}`);
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Actualizar' }).click()]);
    await page.waitForSelector('nav.tabbar');
    await sleep(1000);
    const after = await page.evaluate(() => document.querySelector('meta[name=x-build]')?.content ?? 'v1');
    check('«Actualizar» carga la versión nueva y la sesión sigue abierta', after === 'v2', `ahora: ${after}`);
    await ctx.request.get(`${BASE}/__root?dir=${encodeURIComponent(V1)}`);
  }

  // 9) Cierre de sesión
  await page.locator('nav.tabbar a', { hasText: 'Yo' }).click();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.waitForSelector('h1:has-text("Entrar")');
  check('cerrar sesión borra el token del dispositivo', (await page.evaluate(() => localStorage.getItem('fitona.session'))) === null);

  // 10) iPhone: tarjeta de instalación y captura
  const iphone = await browser.newContext({ ...devices['iPhone 15'], locale: 'es-ES' });
  const ip = await iphone.newPage();
  await ip.goto(`${BASE}/entrar`); await ip.waitForSelector('h1:has-text("Entrar")');
  await ip.getByLabel('Correo electrónico').fill(mail); await ip.getByLabel('Contraseña').fill('una-frase-larga-segura');
  await ip.getByRole('button', { name: 'Entrar', exact: true }).click(); await ip.locator('a.module', { hasText: 'Comida' }).click({ timeout: 120000 }); await ip.waitForSelector('nav.tabbar');
  await ip.locator('nav.tabbar a', { hasText: 'Yo' }).click();
  await ip.waitForSelector('text=Añadir a pantalla de inicio');
  check('en iPhone se explican los pasos «Compartir → Añadir a pantalla de inicio»', true);
  await ip.screenshot({ path: `${SHOTS}/pwa-iphone-yo.png` });
  await iphone.close();

  const real = consoleErrors.filter((e) => !/status of (400|401)|ERR_INTERNET_DISCONNECTED|Failed to load resource|net::ERR/.test(e));
  check('sin errores inesperados en la consola', real.length === 0, real.join(' | ').slice(0, 200));
} catch (e) {
  check('el recorrido se completa sin excepciones', false, String(e).split('\n')[0]);
  await page.screenshot({ path: `${SHOTS}/pwa-error.png` }).catch(() => {});
} finally {
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} comprobaciones superadas`);
}
