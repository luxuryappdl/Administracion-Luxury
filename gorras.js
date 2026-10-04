/* =========================================================
   DL LUXURY
   ADMINISTRACIÓN - GORRAS

   SUPABASE + STORAGE

   TABLA:
   productos

   CATEGORÍA:
   Gorras = categoria_id 1

   BUCKET:
   productos

   CARPETA:
   gorras

   IMPORTANTE:
   GORRAS SE MANEJA EXCLUSIVAMENTE AQUÍ.

   NO USA:
   - localStorage
   - sessionStorage
   - descuentos
   - precio_final
   - precio_original
========================================================= */


document.addEventListener("DOMContentLoaded", async function () {


    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://brnyvkqwkosgtpugxcge.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Qdae9GUtmuosAPP4kemF3A_Vr4HFo0n";


    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


    /* =====================================================
       CONFIGURACIÓN
    ===================================================== */

    const TABLA = "productos";

    const CATEGORIA_GORRAS = 1;

    const BUCKET = "productos";

    const CARPETA = "gorras";


    /* =====================================================
       ELEMENTOS DEL DOM
    ===================================================== */

    const productosGorras =
        document.getElementById("productosGorras");

    const modalProducto =
        document.getElementById("modalProducto");

    const formulario =
        document.getElementById("formProducto");

    const tituloModal =
        document.getElementById("tituloModal");

    const inputImagen =
        document.getElementById("imagenProducto");

    const vistaPrevia =
        document.getElementById("vistaPrevia");

    const inputNombre =
        document.getElementById("nombreProducto");

    const inputDescripcion =
        document.getElementById("descripcionProducto");

    const inputGenero =
        document.getElementById("generoProducto");

    const inputPrecio =
        document.getElementById("precioProducto");

    const inputStock =
        document.getElementById("stockProducto");


    /* =====================================================
       VARIABLES
    ===================================================== */

    let editandoId = null;

    let imagenActual = null;


    /* =====================================================
       CARGAR GORRAS
    ===================================================== */

    async function cargarGorras() {

        if (!productosGorras) {
            console.error(
                "No existe #productosGorras en el HTML."
            );
            return;
        }


        productosGorras.innerHTML = `
            <div class="sin-productos">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <h3>
                    Cargando Gorras...
                </h3>

                <p>
                    Conectando con Supabase...
                </p>

            </div>
        `;


        try {

            const {
                data,
                error
            } = await supabaseClient

                .from(TABLA)

                .select("*")

                .eq(
                    "categoria_id",
                    CATEGORIA_GORRAS
                )

                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


            if (error) {
                throw error;
            }


            renderizarGorras(data || []);


        } catch (error) {

            console.error(
                "Error cargando gorras:",
                error
            );


            productosGorras.innerHTML = `
                <div class="sin-productos">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Error al cargar las gorras
                    </h3>

                    <p>
                        ${escaparHTML(
                error.message ||
                "No fue posible conectar con Supabase."
            )}
                    </p>

                </div>
            `;

        }

    }


    /* =====================================================
       RENDERIZAR GORRAS
    ===================================================== */

    function renderizarGorras(productos) {


        if (!productos.length) {

            productosGorras.innerHTML = `
                <div class="sin-productos">

                    <i class="fa-solid fa-hat-cowboy"></i>

                    <h3>
                        No hay gorras
                    </h3>

                    <p>
                        Agrega tu primera gorra.
                    </p>

                </div>
            `;

            return;
        }


        productosGorras.innerHTML =
            productos.map(producto => {


                const imagen =
                    obtenerImagen(producto.imagen);


                const genero =
                    normalizarGenero(producto.genero);


                const generoTexto =
                    obtenerTextoGenero(genero);


                const nombre =
                    escaparHTML(
                        producto.nombre || "Sin nombre"
                    );


                const descripcion =
                    escaparHTML(
                        producto.descripcion || ""
                    );


                const precio =
                    Number(producto.precio || 0)
                        .toFixed(2);


                const stock =
                    Number(producto.stock || 0);


                return `

                    <article class="producto-card">


                        <!-- =================================
                             IMAGEN
                        ================================== -->

                        <div class="producto-imagen-container">

                            ${imagen
                        ? `
                                        <img
                                            src="${imagen}"
                                            alt="${nombre}"
                                            class="producto-imagen"
                                        >
                                      `
                        : `
                                        <div class="sin-imagen">

                                            <i class="fa-solid fa-image"></i>

                                        </div>
                                      `
                    }

                        </div>


                        <!-- =================================
                             INFORMACIÓN
                        ================================== -->

                        <div class="producto-info">


                            <span class="producto-genero">

                                ${generoTexto}

                            </span>


                            <h3 class="producto-nombre">

                                ${nombre}

                            </h3>


                            ${descripcion
                        ? `
                                        <p class="producto-descripcion">

                                            ${descripcion}

                                        </p>
                                      `
                        : ""
                    }


                            <div class="producto-precio">

                                Q${precio}

                            </div>


                            <div class="producto-stock">

                                Stock:
                                <strong>
                                    ${stock}
                                </strong>

                            </div>


                            <!-- =============================
                                 ACCIONES
                            ============================== -->

                            <div class="producto-acciones">


                                <button
                                    type="button"
                                    class="btn-editar"
                                    onclick="editarGorra(${producto.id})"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                    Editar

                                </button>


                                <button
                                    type="button"
                                    class="btn-eliminar"
                                    onclick="eliminarGorra(${producto.id})"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                    Eliminar

                                </button>


                            </div>


                        </div>


                    </article>

                `;

            }).join("");

    }


    /* =====================================================
       OBTENER IMAGEN
    ===================================================== */

    function obtenerImagen(imagen) {


        if (!imagen) {
            return "";
        }


        /*
           Si ya es una URL completa,
           se utiliza directamente.
        */

        if (
            imagen.startsWith("http://") ||
            imagen.startsWith("https://")
        ) {

            return imagen;

        }


        /*
           Si es una ruta de Storage,
           eliminamos las barras iniciales.
        */

        const ruta =
            imagen.replace(/^\/+/, "");


        const {
            data
        } = supabaseClient
            .storage
            .from(BUCKET)
            .getPublicUrl(ruta);


        return data?.publicUrl || "";

    }


    /* =====================================================
       NORMALIZAR GÉNERO
    ===================================================== */

    function normalizarGenero(genero) {

        const valor =
            String(genero || "")
                .trim()
                .toLowerCase();


        if (
            valor === "hombre" ||
            valor === "mujer" ||
            valor === "unisex"
        ) {

            return valor;

        }


        return "unisex";

    }


    /* =====================================================
       TEXTO DEL GÉNERO
    ===================================================== */

    function obtenerTextoGenero(genero) {


        switch (genero) {

            case "hombre":
                return "Hombre";


            case "mujer":
                return "Mujer";


            case "unisex":
                return "Unisex";


            default:
                return "Unisex";

        }

    }


    /* =====================================================
       ABRIR MODAL
    ===================================================== */

    window.abrirModal = function () {


        editandoId = null;

        imagenActual = null;


        if (tituloModal) {

            tituloModal.textContent =
                "Agregar Gorra";

        }


        if (formulario) {

            formulario.reset();

        }


        /*
           Género por defecto:
           UNISEX
        */

        if (inputGenero) {

            inputGenero.value =
                "unisex";

        }


        if (vistaPrevia) {

            vistaPrevia.innerHTML = `

                <i class="fa-solid fa-image"></i>

                <p>
                    Vista previa
                </p>

            `;

        }


        if (inputImagen) {

            inputImagen.value = "";

        }


        if (modalProducto) {

            modalProducto.classList.add("activo");

        }

    };


    /* =====================================================
       CERRAR MODAL
    ===================================================== */

    window.cerrarModal = function () {


        if (modalProducto) {

            modalProducto.classList.remove("activo");

        }


        editandoId = null;

        imagenActual = null;


        if (formulario) {

            formulario.reset();

        }


        if (inputGenero) {

            inputGenero.value =
                "unisex";

        }


        if (vistaPrevia) {

            vistaPrevia.innerHTML = `

                <i class="fa-solid fa-image"></i>

                <p>
                    Vista previa
                </p>

            `;

        }


        if (inputImagen) {

            inputImagen.value = "";

        }

    };


    /* =====================================================
       VISTA PREVIA DE IMAGEN
    ===================================================== */

    if (inputImagen) {


        inputImagen.addEventListener(
            "change",
            function () {


                const archivo =
                    this.files?.[0];


                if (!archivo) {

                    return;

                }


                if (
                    !archivo.type.startsWith("image/")
                ) {

                    alert(
                        "Selecciona una imagen válida."
                    );

                    this.value = "";

                    return;

                }


                const lector =
                    new FileReader();


                lector.onload =
                    function (evento) {


                        if (!vistaPrevia) {
                            return;
                        }


                        vistaPrevia.innerHTML = `

                            <img
                                src="${evento.target.result}"
                                alt="Vista previa"
                            >

                        `;

                    };


                lector.readAsDataURL(archivo);

            }
        );

    }


    /* =====================================================
       GUARDAR GORRA
    ===================================================== */

    async function guardarProducto() {


        /* ================================================
           DATOS
        ================================================= */

        const nombre =
            inputNombre?.value.trim() || "";


        const descripcion =
            inputDescripcion?.value.trim() || "";


        let genero =
            inputGenero?.value || "unisex";


        const precio =
            parseFloat(
                inputPrecio?.value || ""
            );


        const stock =
            parseInt(
                inputStock?.value || "",
                10
            );


        /* ================================================
           VALIDAR GÉNERO
        ================================================= */

        genero =
            normalizarGenero(genero);


        /* ================================================
           VALIDACIONES
        ================================================= */

        if (!nombre) {

            alert(
                "Ingresa el nombre de la gorra."
            );

            inputNombre?.focus();

            return;

        }


        if (
            Number.isNaN(precio) ||
            precio < 0
        ) {

            alert(
                "Ingresa un precio válido."
            );

            inputPrecio?.focus();

            return;

        }


        if (
            Number.isNaN(stock) ||
            stock < 0
        ) {

            alert(
                "Ingresa una cantidad de stock válida."
            );

            inputStock?.focus();

            return;

        }


        /* ================================================
           BOTÓN
        ================================================= */

        const botonGuardar =
            document.getElementById(
                "btnGuardarGorra"
            );


        const textoOriginal =
            botonGuardar?.innerHTML ||
            "";


        if (botonGuardar) {

            botonGuardar.disabled = true;

            botonGuardar.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Guardando...

            `;

        }


        try {


            /* ============================================
               IMAGEN
            ============================================ */

            let rutaImagen =
                imagenActual;


            /*
               Si seleccionó una imagen nueva,
               se sube a Storage.
            */

            if (
                inputImagen?.files?.length
            ) {


                const archivo =
                    inputImagen.files[0];


                const extension =
                    obtenerExtension(
                        archivo.name
                    );


                const nombreArchivo =
                    `gorra_${Date.now()}_${Math.random()
                        .toString(36)
                        .substring(2, 8)}.${extension}`;


                const ruta =
                    `${CARPETA}/${nombreArchivo}`;


                const {
                    error:
                    errorUpload
                } =
                    await supabaseClient

                        .storage

                        .from(BUCKET)

                        .upload(
                            ruta,
                            archivo,
                            {
                                cacheControl:
                                    "3600",

                                upsert:
                                    false
                            }
                        );


                if (errorUpload) {

                    throw errorUpload;

                }


                rutaImagen =
                    ruta;


                /*
                   Si estamos editando y había
                   una imagen anterior, la eliminamos.
                */

                if (
                    editandoId &&
                    imagenActual
                ) {

                    await eliminarImagenStorage(
                        imagenActual
                    );

                }

            }


            /* ============================================
               EDITAR
            ============================================ */

            if (editandoId) {


                const datosActualizar = {

                    nombre:
                        nombre,

                    descripcion:
                        descripcion,

                    genero:
                        genero,

                    precio:
                        precio,

                    stock:
                        stock,

                    categoria_id:
                        CATEGORIA_GORRAS

                };


                /*
                   Solo actualizamos imagen
                   si se subió una nueva.
                */

                if (
                    inputImagen?.files?.length &&
                    rutaImagen
                ) {

                    datosActualizar.imagen =
                        rutaImagen;

                }


                const {
                    error
                } =
                    await supabaseClient

                        .from(TABLA)

                        .update(
                            datosActualizar
                        )

                        .eq(
                            "id",
                            editandoId
                        )

                        .eq(
                            "categoria_id",
                            CATEGORIA_GORRAS
                        );


                if (error) {

                    /*
                       Si falló la actualización y
                       acabamos de subir una imagen,
                       intentamos eliminarla.
                    */

                    if (
                        inputImagen?.files?.length &&
                        rutaImagen &&
                        rutaImagen !== imagenActual
                    ) {

                        await eliminarImagenStorage(
                            rutaImagen
                        );

                    }


                    throw error;

                }


                alert(
                    "Gorra actualizada correctamente."
                );

            }


            /* ============================================
               AGREGAR
            ============================================ */

            else {


                const datosNuevoProducto = {

                    nombre:
                        nombre,

                    descripcion:
                        descripcion,

                    genero:
                        genero,

                    precio:
                        precio,

                    stock:
                        stock,

                    imagen:
                        rutaImagen,

                    activo:
                        true,

                    categoria_id:
                        CATEGORIA_GORRAS

                };


                const {
                    error
                } =
                    await supabaseClient

                        .from(TABLA)

                        .insert(
                            datosNuevoProducto
                        );


                if (error) {


                    /*
                       Si la base de datos falló,
                       eliminamos la imagen que acabamos
                       de subir para no dejar basura
                       en Storage.
                    */

                    if (
                        rutaImagen
                    ) {

                        await eliminarImagenStorage(
                            rutaImagen
                        );

                    }


                    throw error;

                }


                alert(
                    "Gorra agregada correctamente."
                );

            }


            /* ============================================
               CERRAR Y RECARGAR
            ============================================ */

            cerrarModal();

            await cargarGorras();


        } catch (error) {


            console.error(
                "Error guardando gorra:",
                error
            );


            alert(
                "No se pudo guardar la gorra.\n\n" +
                (
                    error.message ||
                    "Error desconocido."
                )
            );


        } finally {


            if (botonGuardar) {

                botonGuardar.disabled = false;

                botonGuardar.innerHTML =
                    textoOriginal;

            }

        }

    }


    /* =====================================================
       COMPATIBILIDAD CON TU HTML
       
       Tu botón tiene:
       onclick="guardarGorra()"
    ===================================================== */

    window.guardarGorra = function () {

        guardarProducto();

    };


    /* =====================================================
       EDITAR GORRA
    ===================================================== */

    window.editarGorra = async function (id) {


        try {


            const {
                data,
                error
            } =
                await supabaseClient

                    .from(TABLA)

                    .select("*")

                    .eq(
                        "id",
                        id
                    )

                    .eq(
                        "categoria_id",
                        CATEGORIA_GORRAS
                    )

                    .single();


            if (error) {

                throw error;

            }


            if (!data) {

                alert(
                    "No se encontró la gorra."
                );

                return;

            }


            editandoId =
                data.id;


            imagenActual =
                data.imagen || null;


            /* ============================================
               TÍTULO
            ============================================ */

            if (tituloModal) {

                tituloModal.textContent =
                    "Editar Gorra";

            }


            /* ============================================
               DATOS
            ============================================ */

            if (inputNombre) {

                inputNombre.value =
                    data.nombre || "";

            }


            if (inputDescripcion) {

                inputDescripcion.value =
                    data.descripcion || "";

            }


            if (inputGenero) {

                inputGenero.value =
                    normalizarGenero(
                        data.genero
                    );

            }


            if (inputPrecio) {

                inputPrecio.value =
                    data.precio ?? "";

            }


            if (inputStock) {

                inputStock.value =
                    data.stock ?? "";

            }


            /* ============================================
               LIMPIAR INPUT DE IMAGEN
            ============================================ */

            if (inputImagen) {

                inputImagen.value = "";

            }


            /* ============================================
               MOSTRAR IMAGEN ACTUAL
            ============================================ */

            if (
                vistaPrevia &&
                data.imagen
            ) {


                const imagen =
                    obtenerImagen(
                        data.imagen
                    );


                if (imagen) {

                    vistaPrevia.innerHTML = `

                        <img
                            src="${imagen}"
                            alt="${escaparHTML(
                        data.nombre ||
                        "Gorra"
                    )}"
                        >

                    `;

                } else {

                    vistaPrevia.innerHTML = `

                        <i class="fa-solid fa-image"></i>

                        <p>
                            Sin imagen
                        </p>

                    `;

                }

            } else if (vistaPrevia) {

                vistaPrevia.innerHTML = `

                    <i class="fa-solid fa-image"></i>

                    <p>
                        Sin imagen
                    </p>

                `;

            }


            /* ============================================
               ABRIR MODAL
            ============================================ */

            if (modalProducto) {

                modalProducto.classList.add(
                    "activo"
                );

            }


        } catch (error) {


            console.error(
                "Error obteniendo gorra:",
                error
            );


            alert(
                "No se pudo cargar la gorra.\n\n" +
                (
                    error.message ||
                    "Error desconocido."
                )
            );

        }

    };


    /* =====================================================
       ELIMINAR GORRA
    ===================================================== */

    window.eliminarGorra = async function (id) {


        const confirmar =
            confirm(
                "¿Seguro que deseas eliminar esta gorra?\n\n" +
                "Esta acción no se puede deshacer."
            );


        if (!confirmar) {

            return;

        }


        try {


            /* ============================================
               OBTENER PRODUCTO
            ============================================ */

            const {
                data:
                producto,
                error:
                errorBusqueda
            } =
                await supabaseClient

                    .from(TABLA)

                    .select("*")

                    .eq(
                        "id",
                        id
                    )

                    .eq(
                        "categoria_id",
                        CATEGORIA_GORRAS
                    )

                    .single();


            if (errorBusqueda) {

                throw errorBusqueda;

            }


            if (!producto) {

                alert(
                    "La gorra no existe."
                );

                return;

            }


            /* ============================================
               ELIMINAR REGISTRO
            ============================================ */

            const {
                error:
                errorEliminar
            } =
                await supabaseClient

                    .from(TABLA)

                    .delete()

                    .eq(
                        "id",
                        id
                    )

                    .eq(
                        "categoria_id",
                        CATEGORIA_GORRAS
                    );


            if (errorEliminar) {

                throw errorEliminar;

            }


            /* ============================================
               ELIMINAR IMAGEN
            ============================================ */

            if (producto.imagen) {

                await eliminarImagenStorage(
                    producto.imagen
                );

            }


            alert(
                "Gorra eliminada correctamente."
            );


            await cargarGorras();


        } catch (error) {


            console.error(
                "Error eliminando gorra:",
                error
            );


            alert(
                "No se pudo eliminar la gorra.\n\n" +
                (
                    error.message ||
                    "Error desconocido."
                )
            );

        }

    };


    /* =====================================================
       ELIMINAR IMAGEN DE STORAGE
    ===================================================== */

    async function eliminarImagenStorage(imagen) {


        if (!imagen) {

            return;

        }


        /*
           Si es URL completa de Supabase,
           intentamos extraer la ruta.
        */

        let ruta =
            imagen;


        if (
            imagen.startsWith("http://") ||
            imagen.startsWith("https://")
        ) {


            const marcador =
                `/storage/v1/object/public/${BUCKET}/`;


            const posicion =
                imagen.indexOf(
                    marcador
                );


            if (posicion !== -1) {

                ruta =
                    imagen.substring(
                        posicion +
                        marcador.length
                    );

            } else {

                /*
                   No podemos determinar
                   la ruta de Storage.
                */

                return;

            }

        }


        ruta =
            ruta.replace(
                /^\/+/,
                ""
            );


        if (!ruta) {

            return;

        }


        try {


            const {
                error
            } =
                await supabaseClient

                    .storage

                    .from(BUCKET)

                    .remove([
                        ruta
                    ]);


            if (error) {

                console.warn(
                    "No se pudo eliminar la imagen del Storage:",
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
       OBTENER EXTENSIÓN
    ===================================================== */

    function obtenerExtension(nombreArchivo) {


        const nombre =
            String(
                nombreArchivo || ""
            )
                .toLowerCase();


        const partes =
            nombre.split(".");


        if (partes.length < 2) {

            return "jpg";

        }


        const extension =
            partes.pop();


        const extensionesPermitidas = [
            "jpg",
            "jpeg",
            "png",
            "webp"
        ];


        if (
            !extensionesPermitidas.includes(
                extension
            )
        ) {

            return "jpg";

        }


        return extension;

    }


    /* =====================================================
       ESCAPAR HTML
    ===================================================== */

    function escaparHTML(texto) {


        return String(
            texto ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       CERRAR MODAL AL HACER CLICK AFUERA
    ===================================================== */

    if (modalProducto) {


        modalProducto.addEventListener(
            "click",
            function (evento) {


                if (
                    evento.target ===
                    modalProducto
                ) {

                    cerrarModal();

                }

            }
        );

    }


    /* =====================================================
       ESC PARA CERRAR MODAL
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (evento) {


            if (
                evento.key === "Escape" &&
                modalProducto?.classList.contains(
                    "activo"
                )
            ) {

                cerrarModal();

            }

        }
    );


    /* =====================================================
       CARGA INICIAL
    ===================================================== */

    await cargarGorras();


});