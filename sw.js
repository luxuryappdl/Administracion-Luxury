/* =========================================================
DL LUXURY
PWA - ADMINISTRACIÓN
========================================================= */

const CACHE_NAME = "dl-luxury-admin-v6";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./admin.js",
    "./adonvent.js",
    "./pedidos-admin.js",
    "./anos.js",
    "./manifest.json",
    "./icono1.png",
    "./icono2.png"
];

/* =========================================================
INSTALAR SERVICE WORKER
========================================================= */

self.addEventListener("install", event => {


    console.log("DL Luxury: instalando PWA...", CACHE_NAME);

    event.waitUntil(
        (async () => {

            const cache = await caches.open(CACHE_NAME);

            const resultados = await Promise.allSettled(
                ARCHIVOS.map(archivo => cache.add(archivo))
            );

            resultados.forEach((resultado, index) => {

                if (resultado.status === "rejected") {
                    console.warn(
                        "DL Luxury: no se pudo almacenar:",
                        ARCHIVOS[index],
                        resultado.reason
                    );
                }

            });

            console.log("DL Luxury: instalación del service worker completada.");

            await self.skipWaiting();

        })().catch(error => {

            console.error(
                "DL Luxury: error instalando service worker:",
                error
            );

            throw error;

        })
    );
    ```

});

/* =========================================================
ACTIVAR Y LIMPIAR CACHÉ ANTIGUA
========================================================= */

self.addEventListener("activate", event => {

    ```
    console.log("DL Luxury: activando nueva versión...");

    event.waitUntil(
        (async () => {

            const claves = await caches.keys();

            await Promise.all(
                claves.map(async clave => {

                    // Solo eliminar cachés de esta aplicación.
                    if (
                        clave.startsWith("dl-luxury-admin-") &&
                        clave !== CACHE_NAME
                    ) {
                        await caches.delete(clave);

                        console.log(
                            "DL Luxury: caché antigua eliminada:",
                            clave
                        );
                    }

                })
            );

            await self.clients.claim();

            console.log("DL Luxury: aplicación actualizada.");

        })()
    );
    ```

});

/* =========================================================
INTERCEPTAR PETICIONES
========================================================= */

self.addEventListener("fetch", event => {

    ```
    const request = event.request;

    // Solo procesar peticiones GET.
    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    // No interceptar peticiones externas.
    if (url.origin !== self.location.origin) {
        return;
    }

    // No interceptar Supabase ni servicios externos.
    if (
        url.hostname.includes("supabase.co") ||
        url.hostname.includes("cdnjs.cloudflare.com") ||
        url.hostname.includes("jsdelivr.net")
    ) {
        return;
    }


    /* =====================================================
       PÁGINAS HTML: RED PRIMERO, CACHÉ COMO RESPALDO
    ===================================================== */

    if (
        request.mode === "navigate" ||
        url.pathname.endsWith(".html") ||
        url.pathname.endsWith("/")
    ) {

        event.respondWith(
            (async () => {

                try {

                    const respuesta = await fetch(request);

                    if (respuesta.ok) {

                        const cache = await caches.open(CACHE_NAME);

                        await cache.put(request, respuesta.clone());

                    }

                    return respuesta;

                } catch (error) {

                    console.warn(
                        "DL Luxury: sin conexión, buscando página guardada."
                    );

                    const guardada = await caches.match(request);

                    if (guardada) {
                        return guardada;
                    }

                    const paginaInicio = await caches.match("./index.html");

                    if (paginaInicio) {
                        return paginaInicio;
                    }

                    return new Response(
                        "No hay conexión a Internet y esta página no está guardada.",
                        {
                            status: 503,
                            headers: {
                                "Content-Type": "text/plain; charset=utf-8"
                            }
                        }
                    );

                }

            })()
        );

        return;
    }


    /* =====================================================
       RECURSOS LOCALES: CACHÉ PRIMERO
    ===================================================== */

    event.respondWith(
        (async () => {

            const guardado = await caches.match(request);

            if (guardado) {
                return guardado;
            }

            const respuesta = await fetch(request);

            if (respuesta.ok) {

                const cache = await caches.open(CACHE_NAME);

                await cache.put(request, respuesta.clone());

            }

            return respuesta;

        })()
    );

});
