#!/usr/bin/env bash
# Monta FITona en un servidor Ubuntu 24.04 nuevo. Ejecutar como root DENTRO de la carpeta del repositorio:
#   bash deploy/setup-server.sh app.tudominio.es
# Instala Docker, crea .env con contraseñas aleatorias (si no existe), añade memoria de intercambio y arranca todo con HTTPS.
set -euo pipefail
DOMAIN="${1:?Indica el dominio: bash deploy/setup-server.sh app.tudominio.es}"
cd "$(dirname "$0")/.."

apt-get update -y
apt-get install -y docker.io docker-compose-v2 git openssl

# 2 GB de swap si no hay: Oracle y las compilaciones lo agradecen en servidores pequeños.
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

if [ ! -f .env ]; then
  rnd() { echo "Fi$(openssl rand -hex 16)"; }   # empieza por letra (exigencia de Oracle) y solo lleva letras/números
  cat > .env <<ENV
ORACLE_SYS_PASSWORD=$(rnd)
FITONA_OWNER_PASSWORD=$(rnd)
FITONA_APP_PASSWORD=$(rnd)
FITONA_DOMAIN=${DOMAIN}
ENV
  chmod 600 .env
  echo ".env creado con contraseñas aleatorias (guárdalas en un gestor de contraseñas: cat .env)"
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
echo
echo "Listo. Abre https://${DOMAIN} (el certificado puede tardar un minuto la primera vez)."
