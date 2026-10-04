
/* =========================================================
   DL LUXURY
   PWA - ADMINISTRACIÓN
   SERVICE WORKER
========================================================= */

const CACHE_NAME = "dl-luxury-admin-v7";

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

    console.log(
        "DL Luxury: instalando PWA...",
        CACHE_NAME
    );

    event.waitUntil(

        (async () => {

            const cache =
                await caches.open(CACHE_NAME);

            const resultados =
                await Promise.allSettled(

                    ARCHIVOS.map(
                        archivo =>
                            cache.add(
                                archivo
                            )
                    )

                );

            resultados.forEach(
                (resultado, index) => {

                    if (
                        resultado.status ===
                        "rejected"
                    ) {

                        console.warn(
                            "DL Luxury: no se pudo almacenar:",
                            ARCHIVOS[index],
                            resultado.reason
                        );

                    }

                }
            );

            console.log(
                "DL Luxury: instalación completada."
            );

            /*
             * Activar inmediatamente
             */
            await self.skipWaiting();

        })()

    );

});


/* =========================================================
   ACTIVAR Y LIMPIAR CACHÉS ANTIGUOS
========================================================= */

self.addEventListener(
    "activate",
    event => {

        console.log(
            "DL Luxury: activando nueva versión:",
            CACHE_NAME
        );

        event.waitUntil(

            (async () => {

                const claves =
                    await caches.keys();

                await Promise.all(

                    claves.map(
                        async clave => {

                            if (
                                clave.startsWith(
                                    "dl-luxury-admin-"
                                ) &&
                                clave !==
                                CACHE_NAME
                            ) {

                                console.log(
                                    "DL Luxury: eliminando caché antigua:",
                                    clave
                                );

                                await caches.delete(
                                    clave
                                );

                            }

                        }
                    )

                );

                /*
                 * Tomar control de todas
                 * las páginas abiertas.
                 */
                await self.clients.claim();

                console.log(
                    "DL Luxury: nueva versión activa."
                );

            })()

        );

    }
);


/* =========================================================
   INTERCEPTAR PETICIONES
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        /*
         * Solo GET
         */
        if (
            request.method !== "GET"
        ) {

            return;

        }


        const url =
            new URL(
                request.url
            );


        /*
         * Solo recursos del mismo dominio
         */
        if (
            url.origin !==
            self.location.origin
        ) {

            return;

        }


        /*
         * No interceptar Supabase
         */
        if (
            url.hostname.includes(
                "supabase.co"
            )
        ) {

            return;

        }


        /*
         * No interceptar CDN externos
         */
        if (
            url.hostname.includes(
                "cdnjs.cloudflare.com"
            ) ||
            url.hostname.includes(
                "jsdelivr.net"
            )
        ) {

            return;

        }


        /* =================================================
           HTML
           
           RED PRIMERO
           CACHÉ COMO RESPALDO
        ================================================= */

        if (
            request.mode === "navigate" ||
            url.pathname.endsWith(".html") ||
            url.pathname.endsWith("/")
        ) {

            event.respondWith(

                (async () => {

                    try {

                        const respuesta =
                            await fetch(
                                request
                            );


                        if (
                            respuesta.ok
                        ) {

                            const cache =
                                await caches.open(
                                    CACHE_NAME
                                );

                            await cache.put(
                                request,
                                respuesta.clone()
                            );

                        }


                        return respuesta;

                    } catch (error) {

                        console.warn(
                            "DL Luxury: sin conexión."
                        );


                        const guardada =
                            await caches.match(
                                request
                            );


                        if (
                            guardada
                        ) {

                            return guardada;

                        }


                        const paginaInicio =
                            await caches.match(
                                "./index.html"
                            );


                        if (
                            paginaInicio
                        ) {

                            return paginaInicio;

                        }


                        return new Response(

                            "No hay conexión a Internet y esta página no está guardada.",

                            {
                                status: 503,

                                headers: {
                                    "Content-Type":
                                        "text/plain; charset=utf-8"
                                }
                            }

                        );

                    }

                })()

            );

            return;

        }


        /* =================================================
           JAVASCRIPT / CSS / IMÁGENES / OTROS RECURSOS

           RED PRIMERO PARA ARCHIVOS LOCALES

           Esto evita que el teléfono se quede
           eternamente con pedidos-admin.js viejo.
        ================================================= */

        event.respondWith(

            (async () => {

                try {

                    const respuesta =
                        await fetch(
                            request
                        );


                    if (
                        respuesta.ok
                    ) {

                        const cache =
                            await caches.open(
                                CACHE_NAME
                            );

                        await cache.put(
                            request,
                            respuesta.clone()
                        );

                    }


                    return respuesta;

                } catch (error) {

                    console.warn(
                        "DL Luxury: no se pudo obtener recurso de red:",
                        request.url
                    );


                    const guardado =
                        await caches.match(
                            request
                        );


                    if (
                        guardado
                    ) {

                        return guardado;

                    }


                    throw error;

                }

            })()

        );

    }
);

