/** URL base del backend (config.js, generado en el despliegue). Vacío = misma web (docker-compose / nginx / desarrollo). */
export function apiBase(): string {
  const cfg = (window as unknown as { FITONA_CONFIG?: { apiBase?: string } }).FITONA_CONFIG;
  return (cfg?.apiBase ?? '').replace(/\/+$/, '');
}
