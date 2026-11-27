// Genera los iconos PWA, el apple-touch-icon, el favicon y las pantallas de arranque de iOS a partir de los SVG de esta carpeta.
// Uso (desde frontend/): node tools/pwa/build-icons.mjs   · Requiere Playwright (ya instalado para los E2E).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
const D = 'tools/pwa', OUT = 'public';
const any = readFileSync(`${D}/icon-any.svg`, 'utf8'), maskable = readFileSync(`${D}/icon-maskable.svg`, 'utf8'), square = readFileSync(`${D}/icon-square.svg`, 'utf8');
const br = await chromium.launch(); const page = await br.newPage();
async function png(svg, size, file, bg = 'transparent') {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:${bg}"><div style="width:${size}px;height:${size}px">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body>`);
  await page.screenshot({ path: file, omitBackground: true });
}
for (const s of [48, 72, 96, 128, 144, 152, 167, 192, 256, 384, 512]) await png(any, s, `${OUT}/icons/icon-${s}.png`);
for (const s of [192, 512]) await png(maskable, s, `${OUT}/icons/maskable-${s}.png`);
for (const s of [152, 167]) await png(square, s, `${OUT}/icons/apple-touch-icon-${s}.png`);
await png(square, 180, `${OUT}/apple-touch-icon.png`); await png(any, 32, `${OUT}/icons/favicon-32.png`);
writeFileSync(`${OUT}/icon.svg`, any);
// favicon.ico (PNG de 32 px dentro de un contenedor ICO)
const p32 = readFileSync(`${OUT}/icons/favicon-32.png`);
const head = Buffer.alloc(22); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4); head[6] = 32; head[7] = 32; head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(p32.length, 14); head.writeUInt32LE(22, 18);
writeFileSync(`${OUT}/favicon.ico`, Buffer.concat([head, p32]));
// pantallas de arranque de iOS: fondo vainilla con el icono centrado
for (const f of (await import('node:fs')).readdirSync(`${OUT}/splash`)) {
  const m = f.match(/splash-(\d+)x(\d+)\.png/); if (!m) continue;
  const [w, h] = [Number(m[1]), Number(m[2])], icon = Math.round(w * 0.3);
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<body style="margin:0;background:#fff7e8;display:flex;align-items:center;justify-content:center;height:${h}px"><div style="width:${icon}px;height:${icon}px;filter:drop-shadow(0 ${icon * 0.04}px ${icon * 0.06}px #2d2a3e22)">${any.replace('<svg ', `<svg width="${icon}" height="${icon}" `)}</div></body>`);
  await page.screenshot({ path: `${OUT}/splash/${f}` });
}
await br.close(); console.log('iconos y pantallas de arranque generados');
