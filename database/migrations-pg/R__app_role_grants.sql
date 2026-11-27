-- FITona · PostgreSQL · Permisos del rol de aplicación (si existe). Marca de re-ejecución: ${flyway:timestamp}
-- La aplicación debe conectarse con un rol SIN permisos de DDL (fitona_app); el propietario solo ejecuta migraciones.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fitona_app') THEN
        GRANT USAGE ON SCHEMA public TO fitona_app;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fitona_app;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fitona_app;
    END IF;
END $$;
