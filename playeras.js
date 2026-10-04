/* =========================================================
   DL LUXURY
   ADMINISTRACIÓN - PLAYERAS

   SUPABASE + STORAGE

   TABLA:
   productos

   CATEGORÍA:
   Playeras = categoria_id 2

   BUCKET:
   productos

   CARPETA:
   playeras

   IMPORTANTE:
   PLAYERAS SE MANEJA EXCLUSIVAMENTE AQUÍ.

   NO USA:
   - localStorage
   - sessionStorage
   - descuentos
   - precio_original
   - precio_final
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURACIÓN SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://brnyvkqwkosgtpugxcge.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Qdae9GUtmuosAPP4kemF3A_Vr4HFo0n";


    /* =====================================================
       CONFIGURACIÓN PLAYERAS
    ===================================================== */

    const BUCKET = "productos";

    const CARPETA_PLAYERAS = "playeras";

    const CATEGORIA_PLAYERAS_ID = 2;


    /* =====================================================
       VARIABLES
    ===================================================== */

    let supabasePlayeras = null;

    let productoEditando = null;

    let imagenActual = null;

    let imagenNueva = null;

    let imagenPreviewURL = null;


    /* =====================================================
       INICIAR
    ===================================================== */

    async function iniciar() {

        try {

            console.log("========================================");
            console.log("DL LUXURY - PLAYERAS");
            console.log("Iniciando...");
            console.log("========================================");


            /* =============================================
               VERIFICAR SUPABASE
            ============================================= */

            if (!window.supabase) {

                throw new Error(
                    "Supabase no está cargado. Verifica el CDN."
                );

            }


            /* =============================================
               CREAR CLIENTE
            ============================================= */

            supabasePlayeras = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


            window.supabasePlayeras = supabasePlayeras;


            console.log(
                "Supabase conectado correctamente."
            );


            /* =============================================
               CONFIGURAR IMAGEN
            ============================================= */

            configurarImagen();


            /* =============================================
               CARGAR PRODUCTOS
            ============================================= */

            await cargarPlayeras();


            console.log(
                "Playeras cargadas correctamente."
            );


        } catch (error) {

            console.error(
                "ERROR AL INICIAR PLAYERAS:",
                error
            );

            mostrarError(
                "No se pudo iniciar el módulo de Playeras."
            );

        }

    }


    /* =====================================================
       ESCAPAR HTML
    ===================================================== */

    function escaparHTML(valor) {

        if (valor === null || valor === undefined) {

            return "";

        }

        return String(valor)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       FORMATEAR PRECIO
    ===================================================== */

    function formatearPrecio(precio) {

        const numero = Number(precio);

        if (!Number.isFinite(numero)) {

            return "Q0.00";

        }

        return numero.toLocaleString(
            "es-GT",
            {
                style: "currency",
                currency: "GTQ",
                minimumFractionDigits: 2
            }
        );

    }


    /* =====================================================
       OBTENER URL DE IMAGEN
    ===================================================== */

    function obtenerURLImagen(imagen) {

        if (!imagen) {

            return "";

        }


        /* =============================================
           SI YA ES UNA URL
        ============================================= */

        if (
            imagen.startsWith("http://") ||
            imagen.startsWith("https://")
        ) {

            return imagen;

        }


        /* =============================================
           NORMALIZAR RUTA
        ============================================= */

        let ruta = imagen
            .replace(/^\/+/, "")
            .replace(/^productos\//, "");


        /* =============================================
           CREAR URL PÚBLICA
        ============================================= */

        const {
            data
        } = supabasePlayeras
            .storage
            .from(BUCKET)
            .getPublicUrl(ruta);


        return data?.publicUrl || "";

    }


    /* =====================================================
       OBTENER RUTA REAL DE IMAGEN
    ===================================================== */

    function obtenerRutaImagen(imagen) {

        if (!imagen) {

            return null;

        }


        if (
            imagen.startsWith("http://") ||
            imagen.startsWith("https://")
        ) {

            const marcador =
                `/storage/v1/object/public/${BUCKET}/`;

            const posicion =
                imagen.indexOf(marcador);


            if (posicion !== -1) {

                return decodeURIComponent(
                    imagen.substring(
                        posicion + marcador.length
                    )
                );

            }


            return null;

        }


        return imagen
            .replace(/^\/+/, "")
            .replace(/^productos\//, "");

    }


    /* =====================================================
       GENERAR NOMBRE DE IMAGEN
    ===================================================== */

    function generarNombreImagen(archivo) {

        const extension =
            archivo.name.includes(".")
                ? archivo.name
                    .split(".")
                    .pop()
                    .toLowerCase()
                : "jpg";


        const nombre =
            "playera-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 9);


        return `${CARPETA_PLAYERAS}/${nombre}.${extension}`;

    }


    /* =====================================================
       CONFIGURAR IMAGEN
    ===================================================== */

    function configurarImagen() {

        const input =
            document.getElementById(
                "imagenProducto"
            );


        if (!input) {

            return;

        }


        input.addEventListener(
            "change",
            function (event) {

                const archivo =
                    event.target.files?.[0];


                if (!archivo) {

                    imagenNueva = null;

                    return;

                }


                /* =========================================
                   VALIDAR TIPO
                ========================================= */

                const tiposPermitidos = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];


                if (
                    !tiposPermitidos.includes(
                        archivo.type
                    )
                ) {

                    alert(
                        "Solo se permiten imágenes JPG, PNG o WEBP."
                    );

                    input.value = "";

                    imagenNueva = null;

                    return;

                }


                /* =========================================
                   VALIDAR TAMAÑO
                ========================================= */

                const maximo =
                    5 * 1024 * 1024;


                if (archivo.size > maximo) {

                    alert(
                        "La imagen no puede superar 5 MB."
                    );

                    input.value = "";

                    imagenNueva = null;

                    return;

                }


                imagenNueva = archivo;


                mostrarVistaPrevia(
                    archivo
                );

            }
        );

    }


    /* =====================================================
       MOSTRAR VISTA PREVIA
    ===================================================== */

    function mostrarVistaPrevia(
        archivo
    ) {

        const contenedor =
            document.getElementById(
                "vistaPrevia"
            );


        if (!contenedor) {

            return;

        }


        if (imagenPreviewURL) {

            URL.revokeObjectURL(
                imagenPreviewURL
            );

        }


        imagenPreviewURL =
            URL.createObjectURL(
                archivo
            );


        contenedor.innerHTML = `
            <img
                src="${imagenPreviewURL}"
                alt="Vista previa"
                style="
                    width:100%;
                    max-height:260px;
                    object-fit:contain;
                    border-radius:12px;
                "
            >
        `;

    }


    /* =====================================================
       MOSTRAR IMAGEN EXISTENTE
    ===================================================== */

    function mostrarImagenExistente(
        imagen
    ) {

        const contenedor =
            document.getElementById(
                "vistaPrevia"
            );


        if (!contenedor) {

            return;

        }


        const url =
            obtenerURLImagen(
                imagen
            );


        if (!url) {

            contenedor.innerHTML = `
                <i class="fa-solid fa-image"></i>
                <p>Vista previa</p>
            `;

            return;

        }


        contenedor.innerHTML = `
            <img
                src="${escaparHTML(url)}"
                alt="Imagen del producto"
                style="
                    width:100%;
                    max-height:260px;
                    object-fit:contain;
                    border-radius:12px;
                "
                onerror="
                    this.style.display='none';
                "
            >
        `;

    }


    /* =====================================================
       SUBIR IMAGEN
    ===================================================== */

    async function subirImagen(
        archivo
    ) {

        if (!archivo) {

            return null;

        }


        const ruta =
            generarNombreImagen(
                archivo
            );


        console.log(
            "Subiendo imagen:",
            ruta
        );


        const {
            error
        } = await supabasePlayeras
            .storage
            .from(BUCKET)
            .upload(
                ruta,
                archivo,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: archivo.type
                }
            );


        if (error) {

            console.error(
                "ERROR AL SUBIR IMAGEN:",
                error
            );

            throw error;

        }


        return ruta;

    }


    /* =====================================================
       ELIMINAR IMAGEN
    ===================================================== */

    async function eliminarImagen(
        imagen
    ) {

        const ruta =
            obtenerRutaImagen(
                imagen
            );


        if (!ruta) {

            return;

        }


        try {

            const {
                error
            } = await supabasePlayeras
                .storage
                .from(BUCKET)
                .remove([
                    ruta
                ]);


            if (error) {

                console.warn(
                    "No se pudo eliminar la imagen:",
                    error
                );

            }

        } catch (error) {

            console.warn(
                "Error eliminando imagen:",
                error
            );

        }

    }


    /* =====================================================
       CARGAR PLAYERAS
    ===================================================== */

    async function cargarPlayeras() {

        const contenedor =
            document.getElementById(
                "productosPlayeras"
            );


        if (!contenedor) {

            console.error(
                "No existe #productosPlayeras"
            );

            return;

        }


        contenedor.innerHTML = `
            <div class="sin-productos">
                <i class="fa-solid fa-spinner fa-spin"></i>

                <h3>
                    Cargando playeras...
                </h3>

                <p>
                    Consultando Supabase...
                </p>
            </div>
        `;


        try {

            const {
                data,
                error
            } = await supabasePlayeras

                .from("productos")

                .select(`
                    id,
                    nombre,
                    genero,
                    descripcion,
                    precio,
                    stock,
                    imagen,
                    activo,
                    categoria_id
                `)

                .eq(
                    "categoria_id",
                    CATEGORIA_PLAYERAS_ID
                )

                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    "ERROR SUPABASE AL CARGAR PLAYERAS:",
                    error
                );

                console.error(
                    "message:",
                    error.message
                );

                console.error(
                    "details:",
                    error.details
                );

                console.error(
                    "hint:",
                    error.hint
                );

                console.error(
                    "code:",
                    error.code
                );

                throw error;

            }


            console.log(
                "Playeras encontradas:",
                data
            );


            if (!data || data.length === 0) {

                contenedor.innerHTML = `
                    <div class="sin-productos">

                        <i class="fa-solid fa-shirt"></i>

                        <h3>
                            No hay playeras
                        </h3>

                        <p>
                            Agrega tu primera playera.
                        </p>

                    </div>
                `;

                return;

            }


            contenedor.innerHTML =
                data
                    .map(
                        crearTarjetaProducto
                    )
                    .join("");


        } catch (error) {

            console.error(
                "ERROR CARGANDO PLAYERAS:",
                error
            );


            contenedor.innerHTML = `
                <div class="sin-productos">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Error al cargar
                    </h3>

                    <p>
                        ${escaparHTML(
                error.message ||
                "No se pudieron cargar las playeras."
            )}
                    </p>

                </div>
            `;

        }

    }


    /* =====================================================
       CREAR TARJETA
    ===================================================== */

    function crearTarjetaProducto(
        producto
    ) {

        const imagen =
            obtenerURLImagen(
                producto.imagen
            );


        const nombre =
            escaparHTML(
                producto.nombre
            );


        const genero =
            escaparHTML(
                producto.genero
            );


        const descripcion =
            escaparHTML(
                producto.descripcion ||
                "Sin descripción."
            );


        const precio =
            formatearPrecio(
                producto.precio
            );


        const stock =
            Number(
                producto.stock
            ) || 0;


        const estadoStock =
            stock > 0
                ? "Disponible"
                : "Agotado";


        const claseStock =
            stock > 0
                ? "stock-disponible"
                : "stock-agotado";


        return `

            <article
                class="producto-card"
                onclick="mostrarDetalle(${producto.id})"
            >

                <div class="producto-imagen">

                    ${imagen
                ? `
                                <img
                                    src="${escaparHTML(imagen)}"
                                    alt="${nombre}"
                                    loading="lazy"
                                    onerror="
                                        this.style.display='none';
                                    "
                                >
                              `
                : `
                                <div class="sin-imagen">

                                    <i class="fa-solid fa-image"></i>

                                </div>
                              `
            }

                </div>


                <div class="producto-info">

                    <span class="producto-genero">
                        ${genero || "Sin género"}
                    </span>


                    <h3>
                        ${nombre}
                    </h3>


                    <p class="producto-descripcion">
                        ${descripcion}
                    </p>


                    <div class="producto-precio">
                        ${precio}
                    </div>


                    <div class="producto-stock ${claseStock}">

                        <i class="fa-solid fa-box"></i>

                        ${stock} disponibles

                        <span>
                            ${estadoStock}
                        </span>

                    </div>


                    <div
                        class="producto-acciones"
                        onclick="event.stopPropagation()"
                    >

                        <button
                            type="button"
                            class="btn-editar"
                            onclick="editarPlayera(${producto.id})"
                        >

                            <i class="fa-solid fa-pen"></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            class="btn-eliminar"
                            onclick="eliminarPlayera(${producto.id})"
                        >

                            <i class="fa-solid fa-trash"></i>

                            Eliminar

                        </button>

                    </div>

                </div>

            </article>

        `;

    }


    /* =====================================================
       ABRIR MODAL
    ===================================================== */

    function abrirModal() {

        productoEditando = null;

        imagenActual = null;

        imagenNueva = null;


        const modal =
            document.getElementById(
                "modalProducto"
            );


        const titulo =
            document.getElementById(
                "tituloModal"
            );


        const formulario =
            document.getElementById(
                "formProducto"
            );


        const inputImagen =
            document.getElementById(
                "imagenProducto"
            );


        if (titulo) {

            titulo.textContent =
                "Agregar Playera";

        }


        if (formulario) {

            formulario.reset();

        }


        if (inputImagen) {

            inputImagen.value = "";

        }


        const vista =
            document.getElementById(
                "vistaPrevia"
            );


        if (vista) {

            vista.innerHTML = `
                <i class="fa-solid fa-image"></i>

                <p>
                    Vista previa
                </p>
            `;

        }


        if (modal) {

            modal.classList.add(
                "mostrar"
            );

            modal.style.display = "flex";

        }


        document.body.style.overflow =
            "hidden";

    }


    /* =====================================================
       CERRAR MODAL
    ===================================================== */

    function cerrarModal() {

        const modal =
            document.getElementById(
                "modalProducto"
            );


        if (modal) {

            modal.classList.remove(
                "mostrar"
            );

            modal.style.display =
                "none";

        }


        document.body.style.overflow =
            "";


        productoEditando = null;

        imagenActual = null;

        imagenNueva = null;


        if (imagenPreviewURL) {

            URL.revokeObjectURL(
                imagenPreviewURL
            );

            imagenPreviewURL = null;

        }

    }


    /* =====================================================
       EDITAR PLAYERA
    ===================================================== */

    async function editarPlayera(
        id
    ) {

        try {

            const {
                data,
                error
            } = await supabasePlayeras

                .from("productos")

                .select(`
                    id,
                    nombre,
                    genero,
                    descripcion,
                    precio,
                    stock,
                    imagen,
                    activo,
                    categoria_id
                `)

                .eq(
                    "id",
                    id
                )

                .eq(
                    "categoria_id",
                    CATEGORIA_PLAYERAS_ID
                )

                .maybeSingle();


            if (error) {

                console.error(
                    "ERROR AL OBTENER PLAYERA:",
                    error
                );

                throw error;

            }


            if (!data) {

                alert(
                    "No se encontró la playera."
                );

                return;

            }


            productoEditando =
                data;


            imagenActual =
                data.imagen ||
                null;


            imagenNueva =
                null;


            /* =============================================
               ABRIR MODAL
            ============================================= */

            const modal =
                document.getElementById(
                    "modalProducto"
                );


            const titulo =
                document.getElementById(
                    "tituloModal"
                );


            if (titulo) {

                titulo.textContent =
                    "Editar Playera";

            }


            /* =============================================
               CAMPOS
            ============================================= */

            document.getElementById(
                "nombreProducto"
            ).value =
                data.nombre || "";


            document.getElementById(
                "generoProducto"
            ).value =
                data.genero || "";


            document.getElementById(
                "descripcionProducto"
            ).value =
                data.descripcion || "";


            document.getElementById(
                "precioProducto"
            ).value =
                data.precio ?? "";


            document.getElementById(
                "stockProducto"
            ).value =
                data.stock ?? 0;


            const inputImagen =
                document.getElementById(
                    "imagenProducto"
                );


            if (inputImagen) {

                inputImagen.value = "";

            }


            /* =============================================
               IMAGEN
            ============================================= */

            mostrarImagenExistente(
                data.imagen
            );


            if (modal) {

                modal.classList.add(
                    "mostrar"
                );

                modal.style.display =
                    "flex";

            }


            document.body.style.overflow =
                "hidden";


        } catch (error) {

            console.error(
                "ERROR EDITANDO PLAYERA:",
                error
            );

            mostrarError(
                "No se pudo cargar la playera."
            );

        }

    }


    /* =====================================================
       GUARDAR PLAYERA
    ===================================================== */

    async function guardarPlayera(
        event
    ) {

        event.preventDefault();


        if (!supabasePlayeras) {

            alert(
                "Supabase todavía no está listo."
            );

            return;

        }


        const nombre =
            document.getElementById(
                "nombreProducto"
            ).value.trim();


        const genero =
            document.getElementById(
                "generoProducto"
            ).value;


        const descripcion =
            document.getElementById(
                "descripcionProducto"
            ).value.trim();


        const precio =
            Number(
                document.getElementById(
                    "precioProducto"
                ).value
            );


        const stock =
            Number(
                document.getElementById(
                    "stockProducto"
                ).value
            );


        /* =================================================
           VALIDACIONES
        ================================================= */

        if (!nombre) {

            alert(
                "Escribe el nombre de la playera."
            );

            return;

        }


        if (!genero) {

            alert(
                "Selecciona para quién es la playera."
            );

            return;

        }


        if (
            !Number.isFinite(precio) ||
            precio <= 0
        ) {

            alert(
                "El precio debe ser mayor a Q0.00."
            );

            return;

        }


        if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            alert(
                "El stock debe ser un número entero igual o mayor a 0."
            );

            return;

        }


        /* =================================================
           BOTÓN GUARDAR
        ================================================= */

        const boton =
            document.querySelector(
                "#formProducto button[type='submit']"
            );


        const textoOriginal =
            boton
                ? boton.innerHTML
                : "";


        if (boton) {

            boton.disabled = true;

            boton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Guardando...
            `;

        }


        let nuevaRutaImagen =
            null;


        try {

            /* =============================================
               SI HAY NUEVA IMAGEN
            ============================================= */

            if (imagenNueva) {

                nuevaRutaImagen =
                    await subirImagen(
                        imagenNueva
                    );

            }


            const imagenFinal =
                nuevaRutaImagen ||
                imagenActual ||
                null;


            /* =============================================
               DATOS
            ============================================= */

            const datosProducto = {

                nombre: nombre,

                genero: genero,

                descripcion:
                    descripcion || null,

                precio:
                    precio,

                stock:
                    stock,

                imagen:
                    imagenFinal,

                activo:
                    true,

                categoria_id:
                    CATEGORIA_PLAYERAS_ID

            };


            /* =============================================
               EDITAR
            ============================================= */

            if (productoEditando) {

                const id =
                    productoEditando.id;


                const {
                    error
                } = await supabasePlayeras

                    .from("productos")

                    .update(
                        datosProducto
                    )

                    .eq(
                        "id",
                        id
                    )

                    .eq(
                        "categoria_id",
                        CATEGORIA_PLAYERAS_ID
                    );


                if (error) {

                    console.error(
                        "ERROR SUPABASE AL ACTUALIZAR:",
                        error
                    );

                    console.error(
                        "message:",
                        error.message
                    );

                    console.error(
                        "details:",
                        error.details
                    );

                    console.error(
                        "hint:",
                        error.hint
                    );

                    console.error(
                        "code:",
                        error.code
                    );


                    /* =================================
                       BORRAR NUEVA IMAGEN SI FALLÓ
                    ================================= */

                    if (nuevaRutaImagen) {

                        await eliminarImagen(
                            nuevaRutaImagen
                        );

                    }


                    throw error;

                }


                /* =========================================
                   ELIMINAR IMAGEN ANTERIOR
                ========================================= */

                if (
                    nuevaRutaImagen &&
                    productoEditando.imagen
                ) {

                    await eliminarImagen(
                        productoEditando.imagen
                    );

                }


                alert(
                    "Playera actualizada correctamente."
                );


            } else {

                /* =========================================
                   CREAR
                ========================================= */

                const {
                    data,
                    error
                } = await supabasePlayeras

                    .from("productos")

                    .insert(
                        datosProducto
                    )

                    .select()
                    .single();


                if (error) {

                    console.error(
                        "ERROR SUPABASE AL CREAR:",
                        error
                    );

                    console.error(
                        "message:",
                        error.message
                    );

                    console.error(
                        "details:",
                        error.details
                    );

                    console.error(
                        "hint:",
                        error.hint
                    );

                    console.error(
                        "code:",
                        error.code
                    );


                    /* =================================
                       BORRAR IMAGEN SI FALLÓ
                    ================================= */

                    if (nuevaRutaImagen) {

                        await eliminarImagen(
                            nuevaRutaImagen
                        );

                    }


                    throw error;

                }


                console.log(
                    "Playera creada:",
                    data
                );


                alert(
                    "Playera agregada correctamente."
                );

            }


            /* =============================================
               CERRAR
            ============================================= */

            cerrarModal();


            /* =============================================
               RECARGAR
            ============================================= */

            await cargarPlayeras();


        } catch (error) {

            console.error(
                "ERROR GUARDANDO PLAYERA:",
                error
            );


            mostrarError(
                error.message ||
                "No se pudo guardar la playera."
            );


        } finally {

            if (boton) {

                boton.disabled = false;

                boton.innerHTML =
                    textoOriginal;

            }

        }

    }


    /* =====================================================
       ELIMINAR PLAYERA
    ===================================================== */

    async function eliminarPlayera(
        id
    ) {

        if (!supabasePlayeras) {

            alert(
                "Supabase todavía no está listo."
            );

            return;

        }


        const confirmar =
            confirm(
                "¿Seguro que deseas eliminar esta playera?\n\nTambién se eliminará su imagen."
            );


        if (!confirmar) {

            return;

        }


        try {

            /* =============================================
               OBTENER PRODUCTO
            ============================================= */

            const {
                data: producto,
                error: errorBusqueda
            } = await supabasePlayeras

                .from("productos")

                .select(`
                    id,
                    imagen,
                    categoria_id
                `)

                .eq(
                    "id",
                    id
                )

                .eq(
                    "categoria_id",
                    CATEGORIA_PLAYERAS_ID
                )

                .maybeSingle();


            if (errorBusqueda) {

                console.error(
                    "ERROR BUSCANDO PLAYERA:",
                    errorBusqueda
                );

                throw errorBusqueda;

            }


            if (!producto) {

                alert(
                    "La playera no existe."
                );

                return;

            }


            /* =============================================
               ELIMINAR PRODUCTO
            ============================================= */

            const {
                error
            } = await supabasePlayeras

                .from("productos")

                .delete()

                .eq(
                    "id",
                    id
                )

                .eq(
                    "categoria_id",
                    CATEGORIA_PLAYERAS_ID
                );


            if (error) {

                console.error(
                    "ERROR SUPABASE AL ELIMINAR:",
                    error
                );

                console.error(
                    "message:",
                    error.message
                );

                console.error(
                    "details:",
                    error.details
                );

                console.error(
                    "hint:",
                    error.hint
                );

                console.error(
                    "code:",
                    error.code
                );

                throw error;

            }


            /* =============================================
               ELIMINAR IMAGEN
            ============================================= */

            if (producto.imagen) {

                await eliminarImagen(
                    producto.imagen
                );

            }


            alert(
                "Playera eliminada correctamente."
            );


            await cargarPlayeras();


        } catch (error) {

            console.error(
                "ERROR ELIMINANDO PLAYERA:",
                error
            );


            mostrarError(
                error.message ||
                "No se pudo eliminar la playera."
            );

        }

    }


    /* =====================================================
       MODAL DETALLE
    ===================================================== */

    function mostrarDetalle(
        id
    ) {

        /*

           Tu HTML actual todavía NO tiene
           un modal #modalDetalle.

           Por eso no intentamos abrir uno
           que no existe.

           Si después quieres el detalle al
           hacer clic en una playera, te lo
           agrego junto con su CSS.

        */

        console.log(
            "Playera seleccionada:",
            id
        );

    }


    /* =====================================================
       MOSTRAR ERROR
    ===================================================== */

    function mostrarError(
        mensaje
    ) {

        alert(
            mensaje
        );

    }


    /* =====================================================
       EVENTO FORMULARIO
    ===================================================== */

    function configurarFormulario() {

        const formulario =
            document.getElementById(
                "formProducto"
            );


        if (!formulario) {

            return;

        }


        formulario.addEventListener(
            "submit",
            guardarPlayera
        );

    }


    /* =====================================================
       CERRAR MODAL CON ESC
    ===================================================== */

    function configurarTeclado() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    cerrarModal();

                }

            }
        );

    }


    /* =====================================================
       CERRAR AL HACER CLIC FUERA
    ===================================================== */

    function configurarClickExterior() {

        const modal =
            document.getElementById(
                "modalProducto"
            );


        if (!modal) {

            return;

        }


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    cerrarModal();

                }

            }
        );

    }


    /* =====================================================
       EXPONER FUNCIONES GLOBALMENTE
    ===================================================== */

    window.abrirModal =
        abrirModal;


    window.cerrarModal =
        cerrarModal;


    window.editarPlayera =
        editarPlayera;


    window.eliminarPlayera =
        eliminarPlayera;


    window.mostrarDetalle =
        mostrarDetalle;


    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                configurarFormulario();

                configurarTeclado();

                configurarClickExterior();

                iniciar();

            }
        );

    } else {

        configurarFormulario();

        configurarTeclado();

        configurarClickExterior();

        iniciar();

    }


})();