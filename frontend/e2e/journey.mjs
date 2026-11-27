// Recorrido E2E en navegador real: crear alimento -> registrar en una comida -> calcular -> guardar -> recargar.
// Uso: BASE_URL=http://localhost:4200 node e2e/journey.mjs   (requiere backend + Oracle en marcha y `playwright` instalado)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4200';
const SHOTS = process.env.SHOTS_DIR ?? 'e2e/screenshots';
mkdirSync(SHOTS, { recursive: true });

const results = [];
// «Alimentos» ya no está en el menú inferior de Comida: se llega desde Yo -> Mis alimentos.
async function goFoods(page) {
  await page.locator('nav.tabbar a', { hasText: 'Yo' }).click();
  await page.getByRole('link', { name: 'Mis alimentos' }).click();
  await page.waitForSelector('h1:has-text("Alimentos")');
}
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'OK  ' : 'FALLO'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) process.exitCode = 1;
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const ctx = await browser.newContext({
  viewport: { width: 400, height: 860 },
  deviceScaleFactor: 1,
  locale: 'es-ES',
});
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

try {
  await page.goto(BASE);
  await page.waitForSelector('h1:has-text("Entrar")');
  check(
    'sin sesión se pide entrar (no se ve nada de la app)',
    (await page.locator('nav.tabbar').count()) === 0,
  );
  const mail = `e2e${Date.now()}@example.com`;
  await page.getByRole('button', { name: 'Crear una cuenta' }).click();
  await page.getByLabel('Correo electrónico').fill(mail);
  await page.getByLabel('Contraseña').fill('una-frase-larga-segura');
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.waitForSelector('.error');
  check('crear cuenta exige ser adulta y consentir (sin marcar no entra)', true);
  await page.getByLabel('Soy mayor de edad').check();
  await page.getByLabel(/Acepto que FITona guarde/).check();
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await page.waitForSelector('a.module:has-text("Comida")');
  check(
    'tras entrar se ve el selector de módulos (Comida y Trabajo), no el módulo de comida',
    (await page.locator('a.module').count()) === 2 &&
      (await page.locator('nav.tabbar').count()) === 0,
  );
  await page.locator('a.module', { hasText: 'Comida' }).click();
  await page.waitForSelector('text=Aún no hay nada registrado');
  check('el módulo Comida abre «Hoy» con el día vacío', true);

  // 1) Crear un alimento propio (sin kcal: se calculan con los factores de la UE)
  await goFoods(page);
  await page.getByRole('link', { name: 'Crear alimento' }).click();
  await page.getByLabel('Nombre').fill('Manzana de mi frutería');
  await page.getByLabel('Proteínas (g)').fill('0.3');
  await page.getByLabel('Hidratos de carbono (g)').fill('11.4');
  await page.getByLabel('Grasas (g)').fill('0.2');
  await page.getByLabel('Fibra (g)').fill('2.4');
  await page.getByRole('button', { name: /Añadir medida/ }).click();
  await page.getByLabel('Gramos de 1 unidad').fill('180');
  await page.getByRole('button', { name: 'Guardar alimento' }).click();
  await page.waitForSelector('text=Alimento guardado');
  check(
    'crea el alimento y avisa de que la energía se calculó con factores UE',
    (await page.locator('text=Energía calculada con los factores de la UE').count()) === 1,
  );
  await page.screenshot({ path: `${SHOTS}/1-alimento-creado.png` });

  // 2) Registrar 2 unidades en el desayuno
  await page
    .getByRole('link', { name: 'Registrar una comida' })
    .click()
    .catch(async () => {
      await page
        .getByRole('link', { name: /Registrar/ })
        .first()
        .click();
    });
  await page.waitForSelector('text=Registrar comida');
  await page.getByLabel('Buscar alimento').fill('manzana');
  await page.getByRole('button', { name: /Manzana de mi frutería/ }).click();
  await page.getByLabel('Cantidad').fill('2');
  await page.getByRole('button', { name: 'Añadir a la comida' }).click();
  await page.waitForSelector('text=En esta comida');
  const preview = await page.locator('.subtotal').innerText();
  check(
    'calcula en vivo: 2 manzanas ≈ 192 kcal (valor personalizado, cantidad aproximada)',
    /≈ 192 kcal/.test(preview),
    preview.replace(/\s+/g, ' '),
  );
  await page.screenshot({ path: `${SHOTS}/2-calculo.png` });

  // texto libre sin cifras
  await page.getByText('Sin cifras: apuntar solo lo que he comido').click();
  await page.getByLabel('Descripción').fill('Café con leche');
  await page.getByRole('button', { name: 'Añadir sin cifras' }).click();
  await page.waitForSelector('text=Café con leche (sin cifras)');

  // 3) Guardar y volver a consultar
  await page.locator('select[aria-label="Comida"]').selectOption('BREAKFAST');
  await page.getByRole('button', { name: 'Guardar en el diario' }).click();
  await page.waitForSelector('h2:has-text("Desayuno")');
  const dia1 = await page.locator('main').innerText();
  check(
    'el diario muestra el desayuno con la manzana y el texto sin cifras',
    /Manzana de mi frutería/.test(dia1) && /Café con leche/.test(dia1) && /Sin cifras/.test(dia1),
  );
  check(
    'el total del día es un mínimo (≥ 192 kcal) porque el café no tiene cifras',
    /≥ 192 kcal/.test(dia1),
  );

  await page.reload();
  await page.waitForSelector('h2:has-text("Desayuno")');
  check(
    'tras recargar el navegador el registro sigue ahí (persistido en Oracle)',
    /Manzana de mi frutería/.test(await page.locator('main').innerText()),
  );
  await page.screenshot({ path: `${SHOTS}/3-diario.png` });

  // 4) Modo sencillo: sin cifras
  await page.getByLabel('Modo de uso').selectOption('SIMPLE');
  const simple = await page.locator('main').innerText();
  check('modo sencillo: no se ve ninguna cifra de energía', !/kcal/.test(simple));
  await page.getByLabel('Modo de uso').selectOption('ADVANCED');
  const adv = await page.locator('main').innerText();
  check('modo avanzado: se ven energía y macros', /kcal/.test(adv) && /P \d/.test(adv));
  await page.screenshot({ path: `${SHOTS}/4-avanzado.png` });

  // 5) Receta y registro de una ración
  await page.getByRole('link', { name: 'Recetas' }).click();
  await page.getByRole('link', { name: 'Nueva receta' }).click();
  await page.getByLabel('Nombre').fill('Compota');
  await page.getByLabel('Raciones que salen').fill('2');
  await page.getByLabel('Buscar alimento').fill('manzana');
  await page.getByRole('button', { name: /Manzana de mi frutería/ }).click();
  await page.getByLabel('Cantidad').fill('4');
  await page.getByRole('button', { name: 'Guardar receta' }).click();
  await page.waitForSelector('h1:has-text("Compota")');
  const rec = await page.locator('main').innerText();
  check(
    'la receta calcula por ración: ≈ 192 kcal (4 manzanas / 2 raciones)',
    /192 kcal/.test(rec),
    rec.split('\n').find((l) => /kcal/.test(l)) ?? '',
  );
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  await page.waitForSelector('h2:has-text("Total del día")');
  check(
    'registrar una ración de la receta suma al día (384 kcal mínimo)',
    /≥ 384 kcal|384 kcal/.test(await page.locator('main').innerText()),
  );

  // 5b) Catálogo de arranque y recetas típicas
  await goFoods(page);
  await page.getByLabel('Buscar').fill('batata');
  await page.waitForSelector('text=Boniato');
  const cat = await page.locator('main').innerText();
  check(
    'el catálogo encuentra «batata» como Boniato y avisa de que es aproximado y sin verificar',
    /Boniato/.test(cat) && /sin verificar/.test(cat),
  );
  await page.getByRole('link', { name: 'Recetas' }).click();
  await page.getByRole('tab', { name: /Recetas típicas/ }).click();
  await page.getByLabel('Buscar receta').fill('garbanzos');
  await page.waitForSelector('text=Garbanzos con espinacas');
  check(
    'las recetas típicas se buscan por ingrediente (garbanzos)',
    (await page.locator('.results li').count()) >= 3,
  );
  await page.getByLabel('Buscar receta').fill('tortilla de patatas');
  await page
    .getByRole('link', { name: /Tortilla de patatas/ })
    .first()
    .click();
  await page.waitForSelector('h1:has-text("Tortilla de patatas")');
  const tpl = await page.locator('main').innerText();
  check(
    'la receta típica usa medidas naturales (unidades grandes, chorrito) y pasos con alternativas',
    /unidades grandes/.test(tpl) && /chorrito/.test(tpl) && /freidora de aire/.test(tpl),
    tpl.slice(0, 160).replace(/\s+/g, ' '),
  );
  await page.getByRole('button', { name: /Adaptar y guardar/ }).click();
  await page.waitForSelector('h1:has-text("Editar receta")');
  await page
    .locator('article.card', { hasText: 'Cebolla' })
    .getByRole('button', { name: 'Quitar' })
    .click();
  await page.getByLabel('Nombre').fill('Tortilla de patatas sin cebolla');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await page.waitForSelector('h1:has-text("Tortilla de patatas sin cebolla")');
  const tort = await page.locator('main').innerText();
  check(
    'adaptar una receta típica: sin cebolla, con otro nombre, guardada en Mis recetas (≈ 2xx kcal/ración)',
    !/Cebolla/.test(tort.split('Pasos')[0]) && /\d{3} kcal/.test(tort),
    tort.split('\n').find((l) => /kcal/.test(l)) ?? '',
  );
  await page.getByLabel('Fecha').fill('2026-11-20');
  await page.getByRole('button', { name: 'Registrar', exact: true }).click();
  await page.waitForSelector('h2:has-text("Total del día")');
  check(
    'registrar una ración de mi receta en otra fecha (20/11/2026)',
    /20/.test(page.url()) &&
      /Tortilla de patatas sin cebolla/.test(await page.locator('main').innerText()),
    page.url(),
  );
  await goFoods(page);
  await page.getByLabel('Buscar').fill('helado de chocolate');
  await page
    .getByRole('link', { name: /Helado de chocolate/ })
    .first()
    .click();
  await page.getByRole('link', { name: 'Registrar en el diario' }).click();
  await page.waitForSelector('h2:has-text("Helado de chocolate")');
  await page.getByRole('button', { name: 'Añadir a la comida' }).click();
  await page.getByRole('button', { name: 'Guardar en el diario' }).click();
  await page.waitForSelector('h2:has-text("Total del día")');
  check(
    'registrar un alimento desde su ficha (helado de chocolate)',
    /Helado de chocolate/.test(await page.locator('main').innerText()),
  );

  // 5c) Categorías con imagen, alimento sin datos y valores propios
  await goFoods(page);
  await page.waitForSelector('.tile');
  const tiles = await page.locator('.tile').count();
  check(
    'la pantalla de alimentos muestra las categorías (34 con «Mis alimentos»)',
    tiles === 34,
    `${tiles} categorías`,
  );
  await page.getByRole('button', { name: /Frutas/ }).click();
  await page.waitForSelector('text=Mango');
  const icons = await page.locator('.result .icon').allInnerTexts();
  check(
    'cada alimento de la categoría lleva su imagen (31 frutas)',
    icons.length === 31 && icons.every((i) => i.trim().length > 0) && icons.includes('🥑'),
    `${icons.length} alimentos`,
  );
  await page.getByRole('button', { name: /Categorías/ }).click();
  await page.getByLabel('Buscar').fill('edulcorante');
  await page.waitForSelector('text=Sin datos nutricionales');
  await page.getByRole('link', { name: /Edulcorante/ }).click();
  await page.waitForSelector('text=Poner mis valores');
  check(
    'un alimento sin datos lo dice y no inventa cifras',
    /aún no tiene datos nutricionales/.test(await page.locator('main').innerText()),
  );
  await page.getByRole('link', { name: 'Poner mis valores' }).click();
  await page.getByLabel('Energía (kcal)').fill('160');
  await page.getByLabel('Grasas (g)').fill('14.7');
  await page.getByRole('button', { name: 'Guardar alimento' }).click();
  await page.waitForSelector('text=Alimento guardado');
  await goFoods(page);
  await page.getByLabel('Buscar').fill('edulcorante');
  await page.waitForSelector('text=tus valores');
  const av = await page.locator('main').innerText();
  check(
    'tus valores sustituyen al alimento del catálogo (solo uno «Edulcorante», con datos)',
    (av.match(/Edulcorante/g) ?? []).length === 1 &&
      /160 kcal/.test(av) &&
      !/Sin datos nutricionales/.test(av),
    av.replace(/\s+/g, ' ').slice(0, 120),
  );
  await page.screenshot({ path: `${SHOTS}/5-categorias.png` });

  // 6) Datos del usuario
  await page.getByRole('link', { name: 'Yo' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Descargar mis datos/ }).click(),
  ]);
  check(
    'se pueden descargar los datos propios (JSON)',
    download.suggestedFilename() === 'fitona-mis-datos.json',
  );

  // 7) Cerrar sesión y volver a entrar con el mismo correo: los datos siguen ahí
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.waitForSelector('h1:has-text("Entrar")');
  await page.getByLabel('Correo electrónico').fill(mail);
  await page.getByLabel('Contraseña').fill('mala-contraseña-larga');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForSelector('text=Correo o contraseña incorrectos');
  await page.getByLabel('Contraseña').fill('una-frase-larga-segura');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.waitForSelector('a.module:has-text("Comida")');
  await page.locator('a.module', { hasText: 'Comida' }).click();
  await page.waitForSelector('h2:has-text("Total del día")');
  check('contraseña mala rechazada; al entrar bien los datos de la cuenta siguen ahí', true);

  const realErrors = consoleErrors.filter((m) => !/status of (400|401)/.test(m));
  check(
    'sin errores en la consola del navegador',
    realErrors.length === 0,
    realErrors.join(' | ').slice(0, 200),
  );
} catch (e) {
  check('el recorrido se completa sin excepciones', false, String(e).split('\n')[0]);
  await page.screenshot({ path: `${SHOTS}/error.png` }).catch(() => {});
} finally {
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} comprobaciones superadas`);
}
