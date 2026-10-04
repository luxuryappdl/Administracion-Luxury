/* =========================================================
   DL LUXURY
   PWA - ADMINISTRACIÓN
   SERVICE WORKER
   ========================================================= */

const CACHE_NAME = "dl-luxury-admin-v11";


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
   INSTALAR
========================================================= */

self.addEventListener(
    "install",
    event => {

        console.log(
            "DL Luxury: instalando Service Worker:",
            CACHE_NAME
        );


        event.waitUntil(

            (async () => {

                try {

                    const cache =
                        await caches.open(
                            CACHE_NAME
                        );


                    /*
                     * Guardar los archivos uno por uno.
                     *
                     * Si algún archivo falla,
                     * no queremos que todo el proceso
                     * quede bloqueado.
                     */

                    for (
                        const archivo
                        of ARCHIVOS
                    ) {

                        try {

                            const respuesta =
                                await fetch(
                                    archivo,
                                    {
                                        cache:
                                            "no-store"
                                    }
                                );


                            if (
                                respuesta.ok
                            ) {

                                await cache.put(
                                    archivo,
                                    respuesta
                                );

                            } else {

                                console.warn(
                                    "No se pudo guardar:",
                                    archivo,
                                    respuesta.status
                                );

                            }

                        } catch (error) {

                            console.warn(
                                "No se pudo guardar en caché:",
                                archivo,
                                error
                            );

                        }

                    }


                    console.log(
                        "DL Luxury: archivos guardados en caché."
                    );


                } catch (error) {

                    console.error(
                        "DL Luxury: error instalando caché:",
                        error
                    );

                }


                /*
                 * Activar inmediatamente.
                 */

                await self.skipWaiting();

            })()

        );

    }
);


/* =========================================================
   ACTIVAR
========================================================= */

self.addEventListener(
    "activate",
    event => {

        console.log(
            "DL Luxury: activando:",
            CACHE_NAME
        );


        event.waitUntil(

            (async () => {

                const cachesExistentes =
                    await caches.keys();


                await Promise.all(

                    cachesExistentes.map(
                        async cacheName => {

                            /*
                             * Eliminar TODAS las cachés
                             * anteriores de DL Luxury.
                             */

                            if (
                                cacheName.startsWith(
                                    "dl-luxury-admin-"
                                ) &&
                                cacheName !==
                                CACHE_NAME
                            ) {

                                console.log(
                                    "DL Luxury: eliminando caché antigua:",
                                    cacheName
                                );


                                await caches.delete(
                                    cacheName
                                );

                            }

                        }
                    )

                );


                /*
                 * Tomar control inmediatamente.
                 */

                await self.clients.claim();


                console.log(
                    "DL Luxury: Service Worker activo:",
                    CACHE_NAME
                );


                /*
                 * Avisar a las páginas abiertas
                 * que ya hay una versión nueva.
                 */

                const clientes =
                    await self.clients.matchAll(
                        {
                            type: "window"
                        }
                    );


                clientes.forEach(
                    cliente => {

                        cliente.postMessage(
                            {
                                tipo:
                                    "DL_LUXURY_SW_ACTUALIZADO",

                                version:
                                    CACHE_NAME
                            }
                        );

                    }
                );

            })()

        );

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        /*
         * Solo GET.
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
         * Solo archivos del mismo dominio.
         */

        if (
            url.origin !==
            self.location.origin
        ) {

            return;
        }


        /*
         * NO interceptar Supabase.
         */

        if (
            url.hostname.includes(
                "supabase.co"
            )
        ) {

            return;
        }


        /*
         * NO interceptar CDN.
         */

        if (
            url.hostname.includes(
                "jsdelivr.net"
            ) ||
            url.hostname.includes(
                "cdnjs.cloudflare.com"
            )
        ) {

            return;
        }


        /* =================================================
           HTML

           RED PRIMERO
           CACHÉ SOLO COMO RESPALDO
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
                                request,
                                {
                                    cache:
                                        "no-store"
                                }
                            );


                        if (
                            respuesta &&
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
                            "DL Luxury: sin conexión. Usando HTML almacenado."
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


                        const index =
                            await caches.match(
                                "./index.html"
                            );


                        if (
                            index
                        ) {

                            return index;
                        }


                        return new Response(

                            "No hay conexión a Internet y esta página no está almacenada.",

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
           JS / CSS / IMÁGENES / ARCHIVOS LOCALES

           RED PRIMERO

           IMPORTANTE:
           siempre intenta obtener la versión
           actual de GitHub primero.
        ================================================= */

        event.respondWith(

            (async () => {

                try {

                    const respuesta =
                        await fetch(
                            request,
                            {
                                cache:
                                    "no-store"
                            }
                        );


                    if (
                        respuesta &&
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
                        "DL Luxury: recurso no disponible en red:",
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


/* =========================================================
   MENSAJE PARA FORZAR ACTUALIZACIÓN
========================================================= */

self.addEventListener(
    "message",
    event => {

        if (
            event.data ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* =========================================================
   LOG
========================================================= */

console.log(
    "========================================"
);

console.log(
    "DL LUXURY SERVICE WORKER"
);

console.log(
    "Versión:",
    CACHE_NAME
);

console.log(
    "Actualización automática activada"
);

console.log(
    "Caché anterior eliminada"
);

console.log(
    "========================================"
);
