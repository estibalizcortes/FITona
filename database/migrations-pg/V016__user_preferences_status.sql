-- V016 · Elementos compartidos entre módulos: preferencias de la pantalla principal guardadas en la cuenta
-- (orden, módulos ocultos, datos en las tarjetas), para que sean iguales en el iPhone y en el ordenador.
-- Son preferencias visuales, no datos de salud. Borrar APP_USERS las elimina en cascada.
CREATE TABLE USER_PREFERENCES (
    USER_ID          BYTEA             NOT NULL,
    HOME_ORDER       VARCHAR(200),
    HOME_HIDDEN      VARCHAR(200),
    HOME_INDICATORS  INTEGER           DEFAULT 1 NOT NULL,
    UPDATED_AT       TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT PK_USER_PREFERENCES PRIMARY KEY (USER_ID),
    CONSTRAINT FK_USER_PREFERENCES_USER FOREIGN KEY (USER_ID) REFERENCES APP_USERS (ID) ON DELETE CASCADE,
    CONSTRAINT CK_USER_PREFERENCES_IND CHECK (HOME_INDICATORS IN (0,1))
);
COMMENT ON TABLE USER_PREFERENCES IS 'Preferencias de la persona compartidas por todos los módulos (pantalla principal: orden y módulos ocultos como listas de identificadores separadas por comas).';
