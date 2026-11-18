package es.fitona.app.security;

import jakarta.enterprise.context.RequestScoped;
import java.util.UUID;

/** Persona autenticada de la petición actual. */
@RequestScoped
public class CurrentUser {
    private UUID id;

    public void set(UUID id) {
        this.id = id;
    }

    public UUID id() {
        if (id == null) throw new IllegalStateException("Petición sin persona autenticada");
        return id;
    }
}
