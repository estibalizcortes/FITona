package es.fitona.app.api;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import org.jboss.resteasy.reactive.server.ServerResponseFilter;

/** Toda respuesta de la API (datos de salud, tokens de sesión) lleva «no-store»: ni el navegador, ni el service worker, ni un proxy la guardan. */
public class NoStoreFilter {

    @ServerResponseFilter
    public void filter(ContainerRequestContext request, ContainerResponseContext response) {
        if (request.getUriInfo().getPath().startsWith("/api/")) {
            response.getHeaders().putSingle("Cache-Control", "no-store");
        }
    }
}
