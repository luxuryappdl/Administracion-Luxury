/* =========================================================
   DL LUXURY

   ADMINISTRACIÓN - HOODIES

   SUPABASE + STORAGE

   TABLA:
   productos

   CATEGORÍA:
   Hoodies = categoria_id 3

   BUCKET:
   productos

   CARPETA:
   hoodies

   IMPORTANTE:

   HOODIES SE MANEJA EXCLUSIVAMENTE AQUÍ.

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


    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =====================================================
       CONFIGURACIÓN
    ===================================================== */

    const TABLA = "productos";

    const CATEGORIA_HOODIES = 3;

    const BUCKET = "productos";

    const CARPETA = "hoodies";


    /* =====================================================
       ELEMENTOS DEL DOM
    ===================================================== */

    const productosHoodies =
        document.getElementById(
            "productosHoodies"
        );

    const modalProducto =
        document.getElementById(
            "modalProducto"
        );

    const formulario =
        document.getElementById(
            "formProducto"
        );

    const tituloModal =
        document.getElementById(
            "tituloModal"
        );

    const inputImagen =
        document.getElementById(
            "imagenProducto"
        );

    const vistaPrevia =
        document.getElementById(
            "vistaPrevia"
        );

    const inputNombre =
        document.getElementById(
            "nombreProducto"
        );

    const inputDescripcion =
        document.getElementById(
            "descripcionProducto"
        );

    const inputGenero =
        document.getElementById(
            "generoProducto"
        );

    const inputPrecio =
        document.getElementById(
            "precioProducto"
        );

    const inputStock =
        document.getElementById(
            "stockProducto"
        );


    /* =====================================================
       VARIABLES
    ===================================================== */

    let editandoId = null;

    let imagenActual = null;


    /* =====================================================
       CARGAR HOODIES
    ===================================================== */

    async function cargarHoodies() {

        if (!productosHoodies) {

            console.error(
                "No existe #productosHoodies en el HTML."
            );

            return;
        }


        productosHoodies.innerHTML = `

            <div class="sin-productos">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <h3>
                    Cargando Hoodies...
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
                    CATEGORIA_HOODIES
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


            renderizarHoodies(
                data || []
            );


        } catch (error) {

            console.error(
                "Error cargando hoodies:",
                error
            );


            productosHoodies.innerHTML = `

                <div class="sin-productos">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Error al cargar los hoodies
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
       RENDERIZAR HOODIES
    ===================================================== */

    function renderizarHoodies(productos) {


        if (!productos.length) {

            productosHoodies.innerHTML = `

                <div class="sin-productos">

                    <i class="fa-solid fa-shirt"></i>

                    <h3>
                        No hay hoodies
                    </h3>

                    <p>
                        Agrega tu primer hoodie.
                    </p>

                </div>

            `;

            return;
        }


        productosHoodies.innerHTML =

            productos.map(producto => {


                const imagen =
                    obtenerImagen(
                        producto.imagen
                    );


                const genero =
                    normalizarGenero(
                        producto.genero
                    );


                const generoTexto =
                    obtenerTextoGenero(
                        genero
                    );


                const nombre =
                    escaparHTML(
                        producto.nombre ||
                        "Sin nombre"
                    );


                const descripcion =
                    escaparHTML(
                        producto.descripcion ||
                        ""
                    );


                const precio =
                    Number(
                        producto.precio || 0
                    ).toFixed(2);


                const stock =
                    Number(
                        producto.stock || 0
                    );


                return `

                    <article class="producto-card">


                        <!-- =================================
                             IMAGEN
                        ================================== -->

                        <div class="producto-imagen-container">

                            ${imagen

                        ?

                        `

                                    <img
                                        src="${imagen}"
                                        alt="${nombre}"
                                        class="producto-imagen"
                                    >

                                `

                        :

                        `

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

                        ?

                        `

                                    <p class="producto-descripcion">

                                        ${descripcion}

                                    </p>

                                `

                        :

                        ""
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
                                    onclick="editarHoodie(${producto.id})"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                    Editar

                                </button>


                                <button
                                    type="button"
                                    class="btn-eliminar"
                                    onclick="eliminarHoodie(${producto.id})"
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


        if (
            imagen.startsWith("http://") ||
            imagen.startsWith("https://")
        ) {

            return imagen;

        }


        const ruta =
            imagen.replace(/^\/+/, "");


        const {
            data
        } = supabaseClient

            .storage

            .from(BUCKET)

            .getPublicUrl(
                ruta
            );


        return data?.publicUrl || "";

    }


    /* =====================================================
       NORMALIZAR GÉNERO
    ===================================================== */

    function normalizarGenero(genero) {


        const valor =
            String(
                genero || ""
            )
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
                "Agregar Hoodie";

        }


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


        if (modalProducto) {

            modalProducto.classList.add(
                "activo"
            );

        }

    };


    /* =====================================================
       CERRAR MODAL
    ===================================================== */

    window.cerrarModal = function () {


        if (modalProducto) {

            modalProducto.classList.remove(
                "activo"
            );

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
                    !archivo.type.startsWith(
                        "image/"
                    )
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


                lector.readAsDataURL(
                    archivo
                );

            }
        );

    }


    /* =====================================================
       GUARDAR HOODIE
    ===================================================== */

    async function guardarProducto() {


        const nombre =
            inputNombre?.value.trim() ||
            "";


        const descripcion =
            inputDescripcion?.value.trim() ||
            "";


        let genero =
            inputGenero?.value ||
            "unisex";


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
            normalizarGenero(
                genero
            );


        /* ================================================
           VALIDACIONES
        ================================================= */

        if (!nombre) {

            alert(
                "Ingresa el nombre del hoodie."
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
                "btnGuardarHoodie"
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
                    `hoodie_${Date.now()}_${Math.random()
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
                        CATEGORIA_HOODIES

                };


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
                            CATEGORIA_HOODIES
                        );


                if (error) {


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
                    "Hoodie actualizado correctamente."
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
                        CATEGORIA_HOODIES

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
                    "Hoodie agregado correctamente."
                );

            }


            /* ============================================
               CERRAR Y RECARGAR
            ============================================ */

            cerrarModal();

            await cargarHoodies();


        } catch (error) {


            console.error(
                "Error guardando hoodie:",
                error
            );


            alert(
                "No se pudo guardar el hoodie.\n\n" +
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
       
       Tu botón puede tener:
       onclick="guardarHoodie()"
    ===================================================== */

    window.guardarHoodie = function () {

        guardarProducto();

    };


    /* =====================================================
       EDITAR HOODIE
    ===================================================== */

    window.editarHoodie = async function (id) {


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
                        CATEGORIA_HOODIES
                    )

                    .single();


            if (error) {

                throw error;

            }


            if (!data) {

                alert(
                    "No se encontró el hoodie."
                );

                return;

            }


            editandoId =
                data.id;


            imagenActual =
                data.imagen ||
                null;


            /* ============================================
               TÍTULO
            ============================================ */

            if (tituloModal) {

                tituloModal.textContent =
                    "Editar Hoodie";

            }


            /* ============================================
               DATOS
            ============================================ */

            if (inputNombre) {

                inputNombre.value =
                    data.nombre ||
                    "";

            }


            if (inputDescripcion) {

                inputDescripcion.value =
                    data.descripcion ||
                    "";

            }


            if (inputGenero) {

                inputGenero.value =
                    normalizarGenero(
                        data.genero
                    );

            }


            if (inputPrecio) {

                inputPrecio.value =
                    data.precio ??
                    "";

            }


            if (inputStock) {

                inputStock.value =
                    data.stock ??
                    "";

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
                        "Hoodie"
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

            }

            else if (vistaPrevia) {

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
                "Error obteniendo hoodie:",
                error
            );


            alert(
                "No se pudo cargar el hoodie.\n\n" +
                (
                    error.message ||
                    "Error desconocido."
                )
            );

        }

    };


    /* =====================================================
       ELIMINAR HOODIE
    ===================================================== */

    window.eliminarHoodie = async function (id) {


        const confirmar =
            confirm(
                "¿Seguro que deseas eliminar este hoodie?\n\n" +
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
                        CATEGORIA_HOODIES
                    )

                    .single();


            if (errorBusqueda) {

                throw errorBusqueda;

            }


            if (!producto) {

                alert(
                    "El hoodie no existe."
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
                        CATEGORIA_HOODIES
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
                "Hoodie eliminado correctamente."
            );


            await cargarHoodies();


        } catch (error) {


            console.error(
                "Error eliminando hoodie:",
                error
            );


            alert(
                "No se pudo eliminar el hoodie.\n\n" +
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

    function obtenerExtension(
        nombreArchivo
    ) {


        const nombre =
            String(
                nombreArchivo ||
                ""
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

    await cargarHoodies();


});