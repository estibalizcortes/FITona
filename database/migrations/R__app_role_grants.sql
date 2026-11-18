-- =============================================================================
-- FITona · Migración repetible · Permisos del rol de aplicación
-- Se ejecuta como propietario del esquema (FITONA_OWNER) tras cada migración.
-- La aplicación se conecta como FITONA_APP, que solo recibe permisos a través
-- del rol FITONA_APP_ROLE (creado en database/provisioning). Sin sinónimos públicos:
-- la aplicación fija el esquema por defecto en su configuración.
-- Marca de ejecución (fuerza la re-ejecución en cada migrate): ${flyway:timestamp}
-- =============================================================================
DECLARE
    e_role_missing EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_role_missing, -1919);
BEGIN
    FOR t IN (SELECT TABLE_NAME FROM USER_TABLES
              WHERE UPPER(TABLE_NAME) NOT LIKE 'FLYWAY%' AND TABLE_NAME NOT LIKE 'DR$%'
                AND NESTED = 'NO' AND SECONDARY = 'N') LOOP
        EXECUTE IMMEDIATE 'GRANT SELECT, INSERT, UPDATE, DELETE ON "' || t.TABLE_NAME || '" TO FITONA_APP_ROLE';
    END LOOP;

    FOR s IN (SELECT SEQUENCE_NAME FROM USER_SEQUENCES WHERE SEQUENCE_NAME NOT LIKE 'ISEQ$$%') LOOP
        EXECUTE IMMEDIATE 'GRANT SELECT ON "' || s.SEQUENCE_NAME || '" TO FITONA_APP_ROLE';
    END LOOP;
EXCEPTION
    WHEN e_role_missing THEN
        RAISE_APPLICATION_ERROR(-20010, 'Falta el rol FITONA_APP_ROLE: ejecute antes database/provisioning.');
END;
/
