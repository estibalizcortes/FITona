// Configuración en tiempo de despliegue. apiBase vacío = la API está en el mismo dominio (docker-compose / nginx).
// En Render (sitio estático) el build lo sobrescribe con la URL del backend, p. ej. https://fitona-api.onrender.com
window.FITONA_CONFIG = { apiBase: '' };
