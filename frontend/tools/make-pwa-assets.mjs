// Genera los iconos y las pantallas de inicio (iOS) de la PWA a partir de tools/pwa/*.svg.
// Uso (desde frontend/):  node tools/make-pwa-assets.mjs        (necesita `playwright` con Chromium)
// Los PNG resultantes SE VERSIONAN: no hace falta ejecutarlo para compilar la app.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';

const SRC = 'tools/pwa';
const OUT = 'public';
mkdirSync(`${OUT}/icons`, { recursive: true });
mkdirSync(`${OUT}/splash`, { recursive: true });
const anySvg = readFileSync(`${SRC}/icon-any.svg`, 'utf8');
const maskSvg = readFileSync(`${SRC}/icon-maskable.svg`, 'utf8');

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();

async function png(html, w, h, file, transparent = false) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:${transparent ? 'transparent' : '#fbf6ef'}">${html}</body></html>`);
  await page.screenshot({ path: file, omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
}
const icon = (svg, s) => `<div style="width:${s}px;height:${s}px">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</div>`;

// Iconos «any» (esquinas redondeadas, fondo transparente en las esquinas)
for (const s of [48, 72, 96, 128, 144, 152, 167, 192, 256, 384, 512]) await png(icon(anySvg, s), s, s, `${OUT}/icons/icon-${s}.png`, true);
// Iconos «maskable» (a sangre; el arte está en la zona segura del 80 %)
for (const s of [192, 512]) await png(icon(maskSvg, s), s, s, `${OUT}/icons/maskable-${s}.png`);
// iOS: iconos opacos (iOS aplica sus propias esquinas)
await png(icon(maskSvg, 180), 180, 180, `${OUT}/apple-touch-icon.png`);
for (const s of [152, 167]) await png(icon(maskSvg, s), s, s, `${OUT}/icons/apple-touch-icon-${s}.png`);
// Favicon: SVG + PNG 32 + .ico (16/32/48 con PNG incrustado)
writeFileSync(`${OUT}/icon.svg`, anySvg);
await png(icon(anySvg, 32), 32, 32, `${OUT}/icons/favicon-32.png`, true);
const frames = [];
for (const s of [16, 32, 48]) {
  await png(icon(anySvg, s), s, s, `/tmp/fav-${s}.png`, true);
  frames.push({ s, data: readFileSync(`/tmp/fav-${s}.png`) });
}
const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(frames.length, 4);
let offset = 6 + 16 * frames.length;
const dir = frames.map(({ s, data }) => {
  const e = Buffer.alloc(16); e[0] = s; e[1] = s; e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12);
  offset += data.length; return e;
});
writeFileSync(`${OUT}/favicon.ico`, Buffer.concat([head, ...dir, ...frames.map((f) => f.data)]));

// Pantallas de inicio de iOS (apple-touch-startup-image), solo vertical. [ancho pt, alto pt, factor]
const DEVICES = [[440, 956, 3], [420, 912, 3], [402, 874, 3], [430, 932, 3], [393, 852, 3], [390, 844, 3], [375, 812, 3], [414, 896, 3], [414, 896, 2], [414, 736, 3], [375, 667, 2]];
const manifest = [];
for (const [wp, hp, f] of DEVICES) {
  const w = wp * f, h = hp * f, size = Math.round(w * 0.26);
  const html = `<div style="width:${w}px;height:${h}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(w * 0.04)}px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
    ${icon(anySvg, size)}
    <div style="font-size:${Math.round(w * 0.085)}px;font-weight:800;letter-spacing:.02em;color:#b34a24">FITona</div>
    <div style="font-size:${Math.round(w * 0.036)}px;color:#6b5f57">Come bien, sin culpa</div></div>`;
  await png(html, w, h, `${OUT}/splash/splash-${w}x${h}.png`);
  manifest.push(`<link rel="apple-touch-startup-image" href="splash/splash-${w}x${h}.png" media="(device-width: ${wp}px) and (device-height: ${hp}px) and (-webkit-device-pixel-ratio: ${f}) and (orientation: portrait)" />`);
}
writeFileSync('tools/pwa/splash-links.html', manifest.join('\n') + '\n');
await browser.close();
console.log('Iconos y pantallas de inicio generados. Enlaces de iOS en tools/pwa/splash-links.html');
