// E2E de la reorganización modular: selector de módulos, menús de Comida y Trabajo, perfil nutricional, objetivo en «Hoy»,
// plan del día y todo el módulo Trabajo (registrar, calendario, historial). Uso: BASE_URL=http://localhost:4200 node e2e/modules.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4200';
const SHOTS = process.env.SHOTS_DIR ?? 'e2e/screenshots';
mkdirSync(SHOTS, { recursive: true });
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'OK  ' : 'FALLO'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
}
const tabs = async (page) => (await page.locator('nav.tabbar a').allInnerTexts()).map((t) => t.replace(/[^\p{L}]/gu, '').trim());
const tab = (page, name) => page.locator('nav.tabbar a', { hasText: name }).click();
const num = (t) => Number((t.match(/(\d[\d.]*)\s*kcal/) ?? [])[1]?.replace('.', ''));

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: 400, height: 860 }, locale: 'es-ES' });
const page = await ctx.newPage();
page.on('dialog', (d) => d.accept());
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));
const netLog = [];
page.on('requestfailed', (r) => netLog.push('FAILED ' + r.url().slice(-60) + ' ' + (r.failure()?.errorText ?? '')));
page.on('response', (r) => { if (r.status() >= 400) netLog.push(r.status() + ' ' + r.url().slice(-60)); });

try {
  // 1) Entrar y ver el selector de módulos
  await page.goto(BASE);
  await page.waitForSelector('h1:has-text("Entrar")');
  await page.getByRole('button', { name: 'Crear una cuenta' }).click();
  await page.getByLabel('Correo electrónico').fill(`mod${Date.now()}@example.com`);
  await page.getByLabel('Contraseña').fill('una-frase-larga-segura');
  await page.getByLabel('Soy mayor de edad').check();
  await page.getByLabel(/Acepto que FITona guarde/).check();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.waitForSelector('a.module:has-text("Comida")', { timeout: 60000 });
  const mods = (await page.locator('a.module strong').allInnerTexts());
  check('pantalla principal: selector con los módulos Comida y Trabajo y sin menú inferior', mods.join() === 'Comida,Trabajo' && (await page.locator('nav.tabbar').count()) === 0, mods.join(' · '));
  await page.screenshot({ path: `${SHOTS}/m1-selector.png` });

  // 1b) Base visual: próximos módulos, personalización, tema, sin scroll horizontal
  const soon = (await page.locator('.module.soon strong').allInnerTexts()).join();
  check('los módulos aún no construidos se ven como «Próximamente» (sin botón) y no inventan datos', soon === 'Salud,Economía,Deporte,Cuidado personal' && (await page.locator('a.module .stat').count()) === 0, soon);
  check('pantalla principal sin scroll horizontal', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.getByRole('button', { name: 'Personalizar' }).click();
  await page.getByRole('button', { name: 'Subir Trabajo' }).click();
  await page.reload();
  await page.waitForSelector('a.module');
  check('el orden de los módulos se guarda al recargar', (await page.locator('a.module strong').allInnerTexts()).join() === 'Trabajo,Comida');
  await page.getByRole('button', { name: 'Personalizar' }).click();
  await page.getByRole('button', { name: 'Bajar Trabajo' }).click();
  await page.getByRole('button', { name: 'Ocultar' }).first().click();
  await page.waitForFunction(() => document.querySelectorAll('a.module').length === 1);
  check('un módulo se puede ocultar', true);
  await page.getByRole('button', { name: 'Ocultar' }).first().click(); // el último visible no se puede ocultar
  check('no deja la pantalla sin módulos', (await page.locator('a.module').count()) === 1);
  await page.getByRole('button', { name: 'Mostrar' }).click();
  await page.getByRole('button', { name: 'Listo' }).click();
  check('al volver a mostrarlo reaparecen los dos', (await page.locator('a.module strong').allInnerTexts()).join() === 'Comida,Trabajo');
  // Solo tema claro: aunque el móvil esté en modo oscuro, FITona sigue luminosa (fondo vainilla)
  const dark = await ctx.newPage();
  await dark.emulateMedia({ colorScheme: 'dark' });
  await dark.goto(BASE + '/inicio'); await dark.waitForSelector('a.module');
  check('con el móvil en modo oscuro FITona sigue clara (fondo vainilla, sin modo oscuro)', (await dark.evaluate(() => getComputedStyle(document.body).backgroundColor)) === 'rgb(255, 247, 232)');
  await dark.close();
  // Las preferencias están en la cuenta: sin copia local siguen ahí (otro dispositivo)
  await page.getByRole('button', { name: 'Personalizar' }).click();
  await page.getByRole('button', { name: 'Subir Trabajo' }).click();
  await page.waitForTimeout(800);
  const other = await browser.newContext({ viewport: { width: 400, height: 860 }, locale: 'es-ES' });
  const op = await other.newPage();
  const sess = await page.evaluate(() => localStorage.getItem('fitona.session'));
  await op.addInitScript((v) => localStorage.setItem('fitona.session', v), sess);
  await op.goto(BASE + '/inicio'); await op.waitForFunction(() => document.querySelector('a.module strong')?.textContent === 'Trabajo', null, { timeout: 15000 }).catch(() => {});
  check('el orden de los módulos se guarda en la cuenta (otro dispositivo sin copia local lo ve)', (await op.locator('a.module strong').allInnerTexts()).join() === 'Trabajo,Comida');
  await other.close();
  await page.getByRole('button', { name: 'Bajar Trabajo' }).click();
  await page.waitForTimeout(500);
  // Servidor despertando: la interfaz se ve al instante, el aviso es real y desaparece solo (sin bloquear la app)
  const slowCtx = await browser.newContext({ viewport: { width: 400, height: 860 }, locale: 'es-ES' });
  await slowCtx.route('**/api/v1/status', async (r) => { await new Promise((x) => setTimeout(x, 5000)); await r.continue().catch(() => {}); });
  const sp = await slowCtx.newPage();
  const sess2 = await page.evaluate(() => localStorage.getItem('fitona.session'));
  await sp.addInitScript((v) => localStorage.setItem('fitona.session', v), sess2);
  const t0 = Date.now();
  await sp.goto(BASE + '/inicio'); await sp.waitForSelector('a.module');
  const shownIn = Date.now() - t0;
  await sp.waitForSelector('.conn[data-notice="waking"]', { timeout: 8000 });
  check('con el servidor despertando se ve la pantalla principal enseguida y un aviso real con Fiona', shownIn < 4000 && (await sp.locator('a.module').count()) >= 2, `interfaz en ${shownIn} ms`);
  await sp.waitForFunction(() => !document.querySelector('.conn'), null, { timeout: 12000 });
  check('al responder el servidor el aviso desaparece solo', true);
  await slowCtx.close();
  // sin conexión: aviso distinto
  await ctx.setOffline(true);
  await page.waitForSelector('.conn[data-notice="offline"]', { timeout: 8000 });
  check('sin conexión el aviso lo dice (y no habla de servidor despertando)', /Sin conexión/.test(await page.locator('.conn').innerText()));
  await ctx.setOffline(false);
  await page.waitForFunction(() => !document.querySelector('.conn'), null, { timeout: 15000 });

  await page.goto(BASE + '/inicio');
  await page.waitForSelector('a.module:has-text("Comida")');

  // 2) Comida: menú y objetivo
  await page.locator('a.module', { hasText: 'Comida' }).click();
  await page.waitForSelector('text=Aún no hay nada registrado');
  check('el módulo Comida tiñe la app con su color (data-module)', (await page.evaluate(() => document.querySelector('app-root')?.getAttribute('data-module'))) === 'food');
  check('Comida: menú inferior Hoy · Alimentos · Registrar · Plan · Recetas', (await tabs(page)).join() === 'Hoy,Alimentos,Registrar,Plan,Recetas', (await tabs(page)).join(' · '));
  check('Hoy sin perfil invita a completarlo (sin cifras inventadas)', /perfil nutricional/.test(await page.locator('main').innerText()));
  await page.getByRole('link', { name: 'perfil nutricional' }).click();
  await page.waitForSelector('h1:has-text("Perfil nutricional")');
  await page.getByLabel('Edad (años)').fill('30'); await page.getByLabel('Altura (cm)').fill('165');
  await page.getByLabel('Peso actual (kg)').fill('65'); await page.getByLabel('Peso objetivo (kg)').fill('60');
  await page.getByLabel('Deporte semanal (horas)').fill('3');
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await page.waitForSelector('text=Tu objetivo orientativo');
  const m1 = await page.locator('article:has-text("Tu objetivo orientativo")').innerText();
  check('mantenimiento: objetivo calculado a mano (BMR 1370 · PAL 1,3 + deporte ≈ 1920 kcal)', num(m1) === 1920, m1.split('\n')[1] ?? '');
  await page.getByLabel('Modo', { exact: true }).selectOption('DEFICIT');
  await page.getByRole('button', { name: 'Guardar perfil' }).click();
  await page.waitForFunction(() => /Déficit aplicado/.test(document.body.innerText));
  const m2 = await page.locator('article:has-text("Tu objetivo orientativo")').innerText();
  check('déficit moderado: ≈ 15 % menos (1630 kcal) y se muestra el déficit aplicado', num(m2) === 1630 && /Déficit aplicado/.test(m2), m2.split('\n')[1] ?? '');
  check('estimación orientativa, no consejo médico, sin presión', /no es consejo médico/i.test(m2) && /Mifflin/.test(m2));

  await tab(page, 'Hoy');
  await page.waitForSelector('.goal:has-text("objetivo")');
  const g = await page.locator('.goal').first().innerText();
  check('Hoy muestra el total del día y el objetivo (0 de 1630) con texto neutro', /Hoy ≈ 0 kcal/.test(g) && /objetivo ≈ 1630 kcal/.test(g) && /Te quedan ≈ 1630 kcal como referencia/.test(g), g.replace(/\n/g, ' · '));

  // 3) Plan: elegir desayuno y cena, sugerir el resto
  await tab(page, 'Plan');
  await page.waitForSelector('h1:has-text("Plan del día")');
  const pick = async (slotLabel, title) => {
    const sel = page.getByLabel(`Elegir para ${slotLabel}`);
    const value = await sel.locator('option', { hasText: title }).first().getAttribute('value');
    await sel.selectOption(value);
  };
  await pick('Desayuno', 'Avena con leche y plátano');
  await pick('Cena', 'Tortilla francesa');
  await page.getByRole('button', { name: 'Sugerir el resto' }).click();
  await page.waitForSelector('[data-slot="LUNCH"]:has-text("sugerido")');
  await page.waitForSelector('[data-slot="SNACK"]:has-text("sugerido")');
  const planTotal = num(await page.locator('article.day').innerText());
  check('si eliges desayuno y cena, FITona sugiere comida y merienda para acercarse al objetivo', Math.abs(planTotal - 1630) <= 450 && /elegido por ti/.test(await page.locator('[data-slot="BREAKFAST"]').innerText()), `plan ≈ ${planTotal} kcal de 1630`);
  const titles = await page.locator('[data-slot] p strong').allInnerTexts();
  check('el plan no repite recetas y tiene un mensaje neutro', new Set(titles).size === titles.length && (await page.locator('[role="status"][aria-live]').innerText()).length > 10, titles.join(' | '));
  await page.screenshot({ path: `${SHOTS}/m2-plan.png`, fullPage: true });
  await page.locator('[data-slot="BREAKFAST"]').getByRole('button', { name: 'Añadir al diario' }).click();
  await page.waitForSelector('[data-slot="BREAKFAST"]:has-text("Añadido al diario")');
  await tab(page, 'Hoy');
  await page.waitForSelector('article.card:has-text("Desayuno")');
  const g2 = await page.locator('.goal').first().innerText();
  check('«Añadir al diario» lo registra (solo al confirmarlo) y «Hoy» refleja el total frente al objetivo', num(g2.split('objetivo')[0]) > 250, g2.replace(/\n/g, ' · '));
  await tab(page, 'Plan');
  await page.waitForSelector('[data-slot="BREAKFAST"]:has-text("ya registrado")');
  check('lo registrado en el diario cuenta como elegido en el plan', true);

  // 4) Cambiar de módulo: Trabajo
  await page.getByRole('link', { name: /FITona/ }).first().click();
  await page.waitForSelector('a.module:has-text("Trabajo")');
  await page.locator('a.module', { hasText: 'Trabajo' }).click();
  await page.waitForSelector('text=Aún no has registrado nada hoy');
  check('Trabajo: menú inferior Hoy · Calendario · Registrar · Historial', (await tabs(page)).join() === 'Hoy,Calendario,Registrar,Historial', (await tabs(page)).join(' · '));
  check('Trabajo · Hoy: resumen del día vacío', /Aún no has registrado nada hoy/.test(await page.locator('main').innerText()));

  // 5) Registrar un resumen y un texto largo
  await tab(page, 'Registrar');
  await page.getByLabel('Tipo').selectOption('SUMMARY');
  await page.getByLabel('Título').fill('Reunión de equipo');
  await page.getByLabel('Texto').fill('Resumen de la reunión con Ángel: presupuesto y plazos del trimestre.');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.waitForSelector('text=Reunión de equipo');
  await tab(page, 'Registrar');
  await page.getByLabel('Tipo').selectOption('PROMPT');
  const long = 'Actúa como un revisor técnico. '.repeat(160);
  await page.getByLabel('Texto').fill(long);
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.waitForSelector('text=Actúa como un revisor');
  const today = await page.locator('main').innerText();
  check('Trabajo · Hoy: resumen del día con 1 resumen y 1 texto/prompt', /1\s*resumen/.test(today) && /1\s*texto/.test(today), today.split('\n').find((l) => /resumen\(es\)/.test(l)) ?? '');

  // 6) Calendario
  await tab(page, 'Calendario');
  await page.waitForSelector('.cal-day.has');
  const cell = await page.locator('.cal-day.today').getAttribute('aria-label');
  check('Calendario: el día de hoy marca 2 registros y se ven al seleccionarlo', /2 registro/.test(cell) && (await page.locator('app-work-entry-list li').count()) === 2, cell);
  await page.getByRole('button', { name: 'Mes anterior' }).click(); await page.getByRole('button', { name: 'Mes siguiente' }).click();
  await page.getByRole('link', { name: 'Añadir un registro este día' }).click();
  await page.getByLabel('Fecha').fill('2026-11-10');
  await page.getByLabel('Texto').fill('Nota de otro día');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.waitForSelector('h2:has-text("10 de noviembre de 2026")');
  check('Calendario: un registro en otra fecha se ve en ese día', (await page.locator('main').innerText()).includes('Nota de otro día'));
  await page.screenshot({ path: `${SHOTS}/m3-calendario.png` });

  // 7) Historial: buscar y filtrar, editar y borrar
  await tab(page, 'Historial');
  await page.waitForSelector('h1:has-text("Historial")');
  await page.waitForFunction(() => document.querySelectorAll('app-work-entry-list li').length === 3, null, { timeout: 15000 }).catch(() => {});
  const hist = await page.locator('app-work-entry-list li').allInnerTexts();
  check('Historial: lista los 3 registros, los más recientes primero', hist.length === 3 && /Nota de otro día/.test(hist[2]), `${hist.length} registros: ` + hist.map((h) => h.split('\n')[0]).join(' | '));
  await page.getByLabel('Buscar en el historial').fill('ÁNGEL');
  await page.waitForFunction(() => document.querySelectorAll('app-work-entry-list li').length === 1);
  check('Historial: la búsqueda no distingue mayúsculas', /Reunión de equipo/.test(await page.locator('main').innerText()));
  await page.getByLabel('Buscar en el historial').fill('');
  await page.getByLabel('Filtrar por tipo').selectOption('PROMPT');
  await page.waitForFunction(() => document.querySelectorAll('app-work-entry-list li').length === 1);
  check('Historial: el filtro por tipo funciona', /Texto \/ prompt/.test(await page.locator('main').innerText()));
  await page.getByLabel('Filtrar por tipo').selectOption('');
  await page.getByLabel('Buscar en el historial').fill('otro día');
  await page.waitForFunction(() => document.querySelectorAll('app-work-entry-list li').length === 1);
  await page.locator('app-work-entry-list a').first().click();
  await page.waitForSelector('h1:has-text("Editar registro")');
  await page.getByLabel('Título').fill('Editada');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.waitForSelector('h2:has-text("10 de noviembre de 2026")');
  await page.locator('app-work-entry-list a').first().click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Título"]')?.value === 'Editada', null, { timeout: 15000 }).catch(() => {});
  check('editar un registro conserva y actualiza sus datos', (await page.getByLabel('Título').inputValue()) === 'Editada');
  await page.getByRole('button', { name: 'Borrar' }).click();
  await page.waitForSelector('h1:has-text("Hoy")');
  await tab(page, 'Historial');
  await page.getByLabel('Buscar en el historial').fill('otro día');
  await page.waitForFunction(() => document.querySelectorAll('app-work-entry-list li').length === 0);
  check('borrar un registro lo quita del historial', true);

  // 8) Yo de Trabajo: ajustes y cuenta, sin lo de Comida
  await page.locator('a.me-link').click();
  await page.waitForSelector('h2:has-text("Tu cuenta")');
  const yo = await page.locator('main').innerText();
  check('Trabajo · Yo: cuenta y datos, sin el perfil nutricional', /Tu cuenta/.test(yo) && /Tus datos/.test(yo) && !/Perfil nutricional/.test(yo));
  await page.getByRole('link', { name: 'Cambiar de módulo' }).click();
  await page.waitForSelector('a.module:has-text("Comida")');
  await page.waitForFunction(() => document.querySelectorAll('nav.tabbar').length === 0, null, { timeout: 10000 }).catch(() => {});
  check('se puede volver al selector de módulos', (await page.locator('nav.tabbar').count()) === 0);

  const real = consoleErrors.filter((e) => !/status of (400|401)/.test(e));
  check('sin errores en la consola del navegador', real.length === 0, real.join(' | ').slice(0, 200));
} catch (e) {
  check('el recorrido se completa sin excepciones', false, String(e).split('\n')[0]);
  console.log('URL:', page.url(), '| errores de consola:', consoleErrors.join(' | ').slice(0, 400), '| red:', netLog.slice(-8).join(' ; '));
  await page.screenshot({ path: `${SHOTS}/m-error.png` }).catch(() => {});
} finally {
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} comprobaciones superadas`);
}
