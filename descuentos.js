/* =========================================================
   DL LUXURY
   ADMINISTRACIÓN - DESCUENTOS

   SUPABASE + STORAGE

   TABLA:
   productos

   CATEGORÍA:
   Descuentos

   STORAGE:
   productos/descuentos

   IMPORTANTE:
   Este archivo sigue la misma estructura de ACCESORIOS.

   NO USA:
   - localStorage
   - sessionStorage
   - precio_original
   - precio_final como columna
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIGURACIÓN SUPABASE
    ====================================================== */

    const SUPABASE_URL =
        "https://brnyvkqwkosgtpugxcge.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Qdae9GUtmuosAPP4kemF3A_Vr4HFo0n";

    const BUCKET = "productos";

    // Carpeta de Storage
    const CARPETA_DESCUENTOS = "descuentos";

    // Nombre de la categoría
    const NOMBRE_CATEGORIA = "Descuentos";


    /* =====================================================
       VARIABLES GLOBALES
    ====================================================== */

    let supabaseDescuentos = null;

    let categoriaDescuentosId = null;

    let descuentoEditandoId = null;

    let imagenActual = null;


    /* =====================================================
       INICIAR SUPABASE
    ====================================================== */

    function iniciar() {

        try {

            if (!window.supabase) {

                console.error(
                    "❌ Supabase no está cargado."
                );

                mostrarError(
                    "Supabase no está cargado. Revisa el CDN."
                );

                return;
            }


            supabaseDescuentos =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );


            // Disponible globalmente
            window.supabaseDescuentos =
                supabaseDescuentos;


            console.log(
                "🔌 Supabase conectado."
            );


            configurarImagen();


            obtenerCategoria()
                .then(() => {

                    if (categoriaDescuentosId) {

                        cargarDescuentos();

                    }

                });


        } catch (error) {

            console.error(
                "❌ Error iniciando Supabase:",
                error
            );

            mostrarError(
                "No se pudo conectar con Supabase."
            );
        }
    }


    /* =====================================================
       OBTENER CATEGORÍA
    ====================================================== */

    async function obtenerCategoria() {

        console.log(
            "🔎 Buscando categoría Descuentos..."
        );


        if (!supabaseDescuentos) {

            console.error(
                "❌ Supabase no está inicializado."
            );

            return null;
        }


        const {
            data,
            error
        } = await supabaseDescuentos
            .from("categorias")
            .select("id,nombre")
            .eq(
                "nombre",
                NOMBRE_CATEGORIA
            )
            .maybeSingle();


        if (error) {

            console.error(
                "❌ Error buscando categoría:",
                error
            );

            mostrarError(
                "Error al buscar la categoría Descuentos."
            );

            return null;
        }


        if (!data) {

            console.error(
                "❌ No existe la categoría Descuentos."
            );

            mostrarError(
                "No se encontró la categoría 'Descuentos' en Supabase."
            );

            return null;
        }


        categoriaDescuentosId =
            Number(data.id);


        console.log(
            "✅ Categoría encontrada:",
            data
        );


        console.log(
            "🆔 ID categoría:",
            categoriaDescuentosId
        );


        /*
         * Verificación.
         * Según tu configuración debe ser 6.
         */

        if (categoriaDescuentosId !== 6) {

            console.warn(
                "⚠️ La categoría Descuentos no tiene ID 6. ID encontrado:",
                categoriaDescuentosId
            );

        }


        return data;
    }


    /* =====================================================
       OBTENER URL DE IMAGEN
    ====================================================== */

    function obtenerUrlImagen(imagen) {

        if (!imagen) {

            return "";
        }


        // Si ya es una URL completa
        if (
            imagen.startsWith("http://") ||
            imagen.startsWith("https://")
        ) {

            return imagen;
        }


        const {
            data
        } = supabaseDescuentos
            .storage
            .from(BUCKET)
            .getPublicUrl(imagen);


        return data?.publicUrl || "";
    }


    /* =====================================================
       OBTENER PATH DE IMAGEN
    ====================================================== */

    function obtenerPathImagen(imagen) {

        if (!imagen) {

            return null;
        }


        // Si ya es un path
        if (
            !imagen.startsWith("http://") &&
            !imagen.startsWith("https://")
        ) {

            return imagen;
        }


        try {

            const url =
                new URL(imagen);


            const partes =
                url.pathname.split("/");


            const indice =
                partes.indexOf("productos");


            if (
                indice !== -1 &&
                partes.length > indice + 1
            ) {

                return partes
                    .slice(indice + 1)
                    .join("/");
            }


            return null;


        } catch (error) {

            console.error(
                "❌ No se pudo obtener el path:",
                error
            );

            return null;
        }
    }


    /* =====================================================
       ESCAPAR HTML
    ====================================================== */

    function escaparHTML(texto) {

        if (
            texto === null ||
            texto === undefined
        ) {

            return "";
        }


        return String(texto)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       FORMATO PRECIO
    ====================================================== */

    function formatoPrecio(valor) {

        return Number(
            valor || 0
        ).toFixed(2);
    }


    /* =====================================================
       CALCULAR PRECIO FINAL
    ====================================================== */

    function calcularPrecioFinal(
        precio,
        descuento
    ) {

        const precioNumero =
            Number(precio) || 0;

        const descuentoNumero =
            Number(descuento) || 0;


        if (
            precioNumero <= 0 ||
            descuentoNumero <= 0
        ) {

            return precioNumero;
        }


        const resultado =
            precioNumero -
            (
                precioNumero *
                descuentoNumero /
                100
            );


        return Number(
            Math.max(
                0,
                resultado
            ).toFixed(2)
        );
    }


    /* =====================================================
       ACTUALIZAR PRECIO FINAL EN MODAL
    ====================================================== */

    function actualizarPrecioFinal() {

        const precioInput =
            document.getElementById(
                "precioProducto"
            );


        const descuentoInput =
            document.getElementById(
                "descuentoProducto"
            );


        const precioFinal =
            document.getElementById(
                "precioFinal"
            );


        if (
            !precioInput ||
            !descuentoInput ||
            !precioFinal
        ) {

            return;
        }


        const precio =
            Number(
                precioInput.value
            ) || 0;


        const descuento =
            Number(
                descuentoInput.value
            ) || 0;


        const final =
            calcularPrecioFinal(
                precio,
                descuento
            );


        precioFinal.textContent =
            `Q${formatoPrecio(final)}`;
    }


    /* =====================================================
       GENERAR NOMBRE DE IMAGEN
    ====================================================== */

    function generarNombreImagen(archivo) {

        const extension =
            archivo.name
                .split(".")
                .pop()
                .toLowerCase();


        const nombre =
            "descuento_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8);


        return nombre + "." + extension;
    }


    /* =====================================================
       SUBIR IMAGEN
    ====================================================== */

    async function subirImagen(archivo) {

        if (!archivo) {

            return null;
        }


        if (
            !archivo.type.startsWith("image/")
        ) {

            throw new Error(
                "El archivo seleccionado no es una imagen."
            );
        }


        // Máximo 5 MB
        if (
            archivo.size >
            5 * 1024 * 1024
        ) {

            throw new Error(
                "La imagen no puede superar los 5 MB."
            );
        }


        const nombre =
            generarNombreImagen(
                archivo
            );


        const path =
            CARPETA_DESCUENTOS +
            "/" +
            nombre;


        console.log(
            "⬆️ Subiendo imagen:",
            path
        );


        const {
            error
        } = await supabaseDescuentos
            .storage
            .from(BUCKET)
            .upload(
                path,
                archivo,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


        if (error) {

            console.error(
                "❌ Error subiendo imagen:",
                error
            );

            throw error;
        }


        console.log(
            "✅ Imagen subida:",
            path
        );


        // Guardamos el PATH, igual que accesorios
        return path;
    }


    /* =====================================================
       ELIMINAR IMAGEN
    ====================================================== */

    async function eliminarImagen(path) {

        if (!path) {

            return;
        }


        // Solo eliminar imágenes de descuentos
        if (
            !path.startsWith(
                CARPETA_DESCUENTOS + "/"
            )
        ) {

            console.warn(
                "⚠️ Imagen fuera de la carpeta descuentos:",
                path
            );

            return;
        }


        try {

            const {
                error
            } = await supabaseDescuentos
                .storage
                .from(BUCKET)
                .remove([
                    path
                ]);


            if (error) {

                console.error(
                    "❌ Error eliminando imagen:",
                    error
                );

                return;
            }


            console.log(
                "🗑️ Imagen eliminada:",
                path
            );


        } catch (error) {

            console.error(
                "❌ Error eliminando imagen:",
                error
            );
        }
    }


    /* =====================================================
       VISTA PREVIA
    ====================================================== */

    function mostrarVistaPrevia(archivo) {

        const vistaPrevia =
            document.getElementById(
                "vistaImagen"
            );


        if (!vistaPrevia) {

            return;
        }


        if (!archivo) {

            if (imagenActual) {

                vistaPrevia.innerHTML = `

                    <img
                        src="${obtenerUrlImagen(imagenActual)}"
                        alt="Imagen actual"
                        style="
                            max-width:180px;
                            max-height:180px;
                            object-fit:contain;
                            border-radius:10px;
                        "
                    >

                `;

            } else {

                vistaPrevia.innerHTML = `

                    <i class="fa-solid fa-image"></i>

                    <p>
                        Vista previa
                    </p>

                `;
            }

            return;
        }


        if (
            !archivo.type.startsWith("image/")
        ) {

            vistaPrevia.innerHTML = `

                <p>
                    Selecciona una imagen válida.
                </p>

            `;

            return;
        }


        const lector =
            new FileReader();


        lector.onload =
            function (evento) {

                vistaPrevia.innerHTML = `

                    <img
                        src="${evento.target.result}"
                        alt="Vista previa"
                        style="
                            max-width:180px;
                            max-height:180px;
                            object-fit:contain;
                            border-radius:10px;
                        "
                    >

                `;
            };


        lector.readAsDataURL(
            archivo
        );
    }


    /* =====================================================
       CONFIGURAR INPUT DE IMAGEN
    ====================================================== */

    function configurarImagen() {

        const input =
            document.getElementById(
                "imagenProducto"
            );


        if (!input) {

            console.warn(
                "⚠️ No se encontró #imagenProducto"
            );

            return;
        }


        input.addEventListener(
            "change",
            function () {

                const archivo =
                    this.files?.[0];


                mostrarVistaPrevia(
                    archivo
                );
            }
        );
    }


    /* =====================================================
       CONFIGURAR PRECIO / DESCUENTO
    ====================================================== */

    function configurarCalculoPrecio() {

        const precio =
            document.getElementById(
                "precioProducto"
            );


        const descuento =
            document.getElementById(
                "descuentoProducto"
            );


        if (precio) {

            precio.addEventListener(
                "input",
                actualizarPrecioFinal
            );
        }


        if (descuento) {

            descuento.addEventListener(
                "input",
                actualizarPrecioFinal
            );
        }
    }


    /* =====================================================
       CARGAR DESCUENTOS
    ====================================================== */

    async function cargarDescuentos() {

        console.log(
            "🏷️ Cargando descuentos..."
        );


        if (!supabaseDescuentos) {

            console.error(
                "❌ Supabase no está inicializado."
            );

            return;
        }


        if (!categoriaDescuentosId) {

            console.error(
                "❌ No existe ID de categoría."
            );

            return;
        }


        const contenedor =
            document.getElementById(
                "productosDescuentos"
            );


        if (!contenedor) {

            console.error(
                "❌ No existe #productosDescuentos en el HTML."
            );

            return;
        }


        contenedor.innerHTML = `

            <div class="sin-productos">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <p>
                    Cargando descuentos...
                </p>

            </div>

        `;


        const {
            data,
            error
        } = await supabaseDescuentos
            .from("productos")
            .select(
                "id,nombre,genero,descripcion,precio,descuento,stock,imagen,activo,categoria_id"
            )
            .eq(
                "categoria_id",
                categoriaDescuentosId
            )
            .eq(
                "activo",
                true
            )
            .gt(
                "descuento",
                0
            )
            .order(
                "id",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "❌ Error cargando descuentos:",
                error
            );

            mostrarError(
                "No se pudieron cargar los descuentos."
            );

            return;
        }


        console.log(
            "🏷️ Descuentos cargados:",
            data
        );


        if (
            !data ||
            data.length === 0
        ) {

            contenedor.innerHTML = `

                <div class="sin-productos">

                    <i class="fa-solid fa-tag"></i>

                    <h3>
                        No hay descuentos
                    </h3>

                    <p>
                        Agrega tu primera oferta.
                    </p>

                </div>

            `;

            return;
        }


        contenedor.innerHTML =
            data
                .map(crearTarjeta)
                .join("");


        console.log(
            "✅ Descuentos listos."
        );
    }


    /* =====================================================
       CREAR TARJETA
    ====================================================== */

    function crearTarjeta(producto) {

        const imagen =
            obtenerUrlImagen(
                producto.imagen
            );


        const nombre =
            escaparHTML(
                producto.nombre
            );


        const genero =
            escaparHTML(
                producto.genero ||
                "unisex"
            );


        const descripcion =
            escaparHTML(
                producto.descripcion ||
                ""
            );


        const precio =
            Number(
                producto.precio ||
                0
            );


        const descuento =
            Number(
                producto.descuento ||
                0
            );


        const precioFinal =
            calcularPrecioFinal(
                precio,
                descuento
            );


        const stock =
            Number(
                producto.stock ||
                0
            );


        return `

            <article
                class="producto-card"
                data-id="${producto.id}"
            >

                <div class="producto-imagen">

                    ${imagen

                ?

                `

                            <img
                                src="${escaparHTML(imagen)}"
                                alt="${nombre}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                "
                            >

                        `

                :

                `

                            <div class="sin-imagen">

                                <i class="fa-solid fa-tag"></i>

                            </div>

                        `
            }


                    <span
                        class="producto-descuento"
                        style="
                            position:absolute;
                            top:10px;
                            right:10px;
                        "
                    >
                        -${descuento}%
                    </span>

                </div>


                <div class="producto-info">


                    <div class="producto-categoria">

                        Descuentos

                    </div>


                    <h3>

                        ${nombre}

                    </h3>


                    <p>

                        <strong>
                            Género:
                        </strong>

                        ${genero}

                    </p>


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


                    <div
                        class="producto-precios"
                        style="
                            margin:10px 0;
                        "
                    >

                        <span
                            style="
                                text-decoration:line-through;
                                opacity:.6;
                                margin-right:8px;
                            "
                        >

                            Q${formatoPrecio(precio)}

                        </span>


                        <strong
                            style="
                                font-size:1.2rem;
                            "
                        >

                            Q${formatoPrecio(precioFinal)}

                        </strong>

                    </div>


                    <p class="producto-descuento-texto">

                        <strong>
                            Descuento:
                        </strong>

                        ${descuento}%

                    </p>


                    <p class="producto-stock">

                        Stock: ${stock}

                    </p>


                    <div class="producto-acciones">


                        <button
                            type="button"
                            onclick="editarDescuento(${producto.id})"
                            class="btn-editar"
                        >

                            <i class="fas fa-pen"></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            onclick="eliminarDescuento(${producto.id})"
                            class="btn-eliminar"
                        >

                            <i class="fas fa-trash"></i>

                            Eliminar

                        </button>


                    </div>


                </div>


            </article>

        `;
    }


    /* =====================================================
       ABRIR MODAL NUEVO DESCUENTO
    ====================================================== */

    function abrirModal() {

        const modal =
            document.getElementById(
                "modalProducto"
            );


        if (!modal) {

            console.error(
                "❌ No existe #modalProducto"
            );

            return;
        }


        descuentoEditandoId =
            null;


        imagenActual =
            null;


        const formulario =
            document.getElementById(
                "formProducto"
            );


        if (formulario) {

            formulario.reset();
        }


        const titulo =
            document.getElementById(
                "tituloModal"
            );


        if (titulo) {

            titulo.textContent =
                "Agregar Descuento";
        }


        const precioFinal =
            document.getElementById(
                "precioFinal"
            );


        if (precioFinal) {

            precioFinal.textContent =
                "Q0.00";
        }


        const vistaImagen =
            document.getElementById(
                "vistaImagen"
            );


        if (vistaImagen) {

            vistaImagen.innerHTML = `

                <i class="fa-solid fa-image"></i>

                <p>
                    Vista previa
                </p>

            `;
        }


        modal.classList.add(
            "mostrar"
        );


        modal.style.display =
            "block";
    }


    /* =====================================================
       CERRAR MODAL
    ====================================================== */

    function cerrarModal() {

        const modal =
            document.getElementById(
                "modalProducto"
            );


        if (!modal) {

            return;
        }


        modal.classList.remove(
            "mostrar"
        );


        modal.style.display =
            "none";


        descuentoEditandoId =
            null;


        imagenActual =
            null;


        const formulario =
            document.getElementById(
                "formProducto"
            );


        if (formulario) {

            formulario.reset();
        }


        const precioFinal =
            document.getElementById(
                "precioFinal"
            );


        if (precioFinal) {

            precioFinal.textContent =
                "Q0.00";
        }


        const vistaImagen =
            document.getElementById(
                "vistaImagen"
            );


        if (vistaImagen) {

            vistaImagen.innerHTML = `

                <i class="fa-solid fa-image"></i>

                <p>
                    Vista previa
                </p>

            `;
        }
    }


    /* =====================================================
       MOSTRAR DETALLE
    ====================================================== */

    function mostrarDetalle(id) {

        console.log(
            "👁️ Mostrando detalle:",
            id
        );


        obtenerProducto(
            id
        );
    }


    /* =====================================================
       OBTENER PRODUCTO
    ====================================================== */

    async function obtenerProducto(id) {

        const {
            data,
            error
        } = await supabaseDescuentos
            .from("productos")
            .select(
                "id,nombre,genero,descripcion,precio,descuento,stock,imagen,activo,categoria_id"
            )
            .eq(
                "id",
                id
            )
            .eq(
                "categoria_id",
                categoriaDescuentosId
            )
            .maybeSingle();


        if (error) {

            console.error(
                "❌ Error obteniendo producto:",
                error
            );

            mostrarError(
                "No se pudo obtener el producto."
            );

            return;
        }


        if (!data) {

            mostrarError(
                "El producto no existe."
            );

            return;
        }


        const imagen =
            document.getElementById(
                "detalleImagen"
            );


        const nombre =
            document.getElementById(
                "detalleNombre"
            );


        const descripcion =
            document.getElementById(
                "detalleDescripcion"
            );


        const precioOriginal =
            document.getElementById(
                "detallePrecioOriginal"
            );


        const precioFinal =
            document.getElementById(
                "detallePrecioFinal"
            );


        const descuento =
            document.getElementById(
                "detalleDescuento"
            );


        const stock =
            document.getElementById(
                "detalleStock"
            );


        const genero =
            document.getElementById(
                "detalleGenero"
            );


        const precio =
            Number(
                data.precio ||
                0
            );


        const porcentaje =
            Number(
                data.descuento ||
                0
            );


        const final =
            calcularPrecioFinal(
                precio,
                porcentaje
            );


        if (data.imagen) {

            imagen.src =
                obtenerUrlImagen(
                    data.imagen
                );

            imagen.style.display =
                "block";

        } else {

            imagen.removeAttribute(
                "src"
            );

            imagen.style.display =
                "none";
        }


        nombre.textContent =
            data.nombre ||
            "Producto";


        descripcion.textContent =
            data.descripcion ||
            "Sin descripción";


        precioOriginal.textContent =
            `Q${formatoPrecio(precio)}`;


        precioFinal.textContent =
            `Q${formatoPrecio(final)}`;


        descuento.textContent =
            `${porcentaje}% de descuento`;


        stock.textContent =
            `Stock: ${Number(data.stock) || 0}`;


        genero.textContent =
            data.genero ||
            "Sin especificar";


        const modalDetalle =
            document.getElementById(
                "modalDetalle"
            );


        modalDetalle.classList.add(
            "mostrar"
        );


        modalDetalle.style.display =
            "block";
    }


    /* =====================================================
       CERRAR DETALLE
    ====================================================== */

    function cerrarDetalle() {

        const modal =
            document.getElementById(
                "modalDetalle"
            );


        if (!modal) {

            return;
        }


        modal.classList.remove(
            "mostrar"
        );


        modal.style.display =
            "none";
    }


    /* =====================================================
       EDITAR DESCUENTO
    ====================================================== */

    async function editarDescuento(id) {

        console.log(
            "✏️ Editando descuento:",
            id
        );


        const {
            data,
            error
        } = await supabaseDescuentos
            .from("productos")
            .select(
                "id,nombre,genero,descripcion,precio,descuento,stock,imagen,activo,categoria_id"
            )
            .eq(
                "id",
                id
            )
            .eq(
                "categoria_id",
                categoriaDescuentosId
            )
            .maybeSingle();


        if (error) {

            console.error(
                "❌ Error obteniendo descuento:",
                error
            );

            mostrarError(
                "No se pudo obtener el descuento."
            );

            return;
        }


        if (!data) {

            mostrarError(
                "El descuento no existe."
            );

            return;
        }


        descuentoEditandoId =
            data.id;


        imagenActual =
            data.imagen ||
            null;


        const modal =
            document.getElementById(
                "modalProducto"
            );


        const titulo =
            document.getElementById(
                "tituloModal"
            );


        const nombre =
            document.getElementById(
                "nombreProducto"
            );


        const genero =
            document.getElementById(
                "generoProducto"
            );


        const descripcion =
            document.getElementById(
                "descripcionProducto"
            );


        const precio =
            document.getElementById(
                "precioProducto"
            );


        const descuento =
            document.getElementById(
                "descuentoProducto"
            );


        const stock =
            document.getElementById(
                "stockProducto"
            );


        if (titulo) {

            titulo.textContent =
                "Editar Descuento";
        }


        if (nombre) {

            nombre.value =
                data.nombre ||
                "";
        }


        if (genero) {

            genero.value =
                data.genero ||
                "";
        }


        if (descripcion) {

            descripcion.value =
                data.descripcion ||
                "";
        }


        if (precio) {

            precio.value =
                data.precio ??
                "";
        }


        if (descuento) {

            descuento.value =
                data.descuento ??
                "";
        }


        if (stock) {

            stock.value =
                data.stock ??
                0;
        }


        const vistaImagen =
            document.getElementById(
                "vistaImagen"
            );


        if (
            vistaImagen &&
            data.imagen
        ) {

            const url =
                obtenerUrlImagen(
                    data.imagen
                );


            vistaImagen.innerHTML = `

                <img
                    src="${url}"
                    alt="Imagen actual"
                    style="
                        max-width:180px;
                        max-height:180px;
                        object-fit:contain;
                        border-radius:10px;
                    "
                >

            `;

        } else if (vistaImagen) {

            vistaImagen.innerHTML = `

                <i class="fa-solid fa-image"></i>

                <p>
                    Vista previa
                </p>

            `;
        }


        actualizarPrecioFinal();


        if (modal) {

            modal.classList.add(
                "mostrar"
            );


            modal.style.display =
                "block";
        }
    }


    /* =====================================================
       GUARDAR DESCUENTO
    ====================================================== */

    async function guardarDescuento(evento) {

        if (evento) {

            evento.preventDefault();
        }


        console.log(
            "💾 Guardando descuento..."
        );


        if (!supabaseDescuentos) {

            mostrarError(
                "Supabase no está conectado."
            );

            return;
        }


        if (!categoriaDescuentosId) {

            mostrarError(
                "No se encontró la categoría Descuentos."
            );

            return;
        }


        const nombreInput =
            document.getElementById(
                "nombreProducto"
            );


        const generoInput =
            document.getElementById(
                "generoProducto"
            );


        const descripcionInput =
            document.getElementById(
                "descripcionProducto"
            );


        const precioInput =
            document.getElementById(
                "precioProducto"
            );


        const descuentoInput =
            document.getElementById(
                "descuentoProducto"
            );


        const stockInput =
            document.getElementById(
                "stockProducto"
            );


        const imagenInput =
            document.getElementById(
                "imagenProducto"
            );


        const nombre =
            nombreInput?.value.trim() ||
            "";


        const genero =
            generoInput?.value ||
            "";


        const descripcion =
            descripcionInput?.value.trim() ||
            "";


        const precio =
            Number(
                precioInput?.value
            );


        const descuento =
            Number(
                descuentoInput?.value
            );


        const stock =
            Number(
                stockInput?.value
            );


        const archivo =
            imagenInput?.files?.[0] ||
            null;


        /* =================================================
           VALIDACIONES
        ================================================== */

        if (!nombre) {

            mostrarError(
                "Escribe el nombre del producto."
            );

            nombreInput?.focus();

            return;
        }


        if (
            ![
                "hombre",
                "mujer"
            ].includes(genero)
        ) {

            mostrarError(
                "Selecciona un área válida."
            );

            generoInput?.focus();

            return;
        }


        if (
            !Number.isFinite(precio) ||
            precio <= 0
        ) {

            mostrarError(
                "El precio debe ser mayor que 0."
            );

            precioInput?.focus();

            return;
        }


        if (
            !Number.isFinite(descuento) ||
            descuento < 1 ||
            descuento > 100
        ) {

            mostrarError(
                "El descuento debe estar entre 1% y 100%."
            );

            descuentoInput?.focus();

            return;
        }


        if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            mostrarError(
                "El stock debe ser un número entero mayor o igual a 0."
            );

            stockInput?.focus();

            return;
        }


        /* =================================================
           SUBIR NUEVA IMAGEN
        ================================================== */

        let nuevaImagen =
            imagenActual;


        try {

            if (archivo) {

                nuevaImagen =
                    await subirImagen(
                        archivo
                    );
            }


            /* =============================================
               DATOS A GUARDAR

               IMPORTANTE:
               Solo usamos columnas que ya existen
               en tu estructura de productos.
            ============================================== */

            const datosProducto = {

                nombre:
                    nombre,

                genero:
                    genero,

                descripcion:
                    descripcion,

                precio:
                    precio,

                descuento:
                    descuento,

                stock:
                    stock,

                imagen:
                    nuevaImagen,

                activo:
                    true,

                categoria_id:
                    categoriaDescuentosId

            };


            /* =============================================
               EDITAR
            ============================================== */

            if (descuentoEditandoId) {

                const {
                    error
                } = await supabaseDescuentos
                    .from("productos")
                    .update(
                        datosProducto
                    )
                    .eq(
                        "id",
                        descuentoEditandoId
                    )
                    .eq(
                        "categoria_id",
                        categoriaDescuentosId
                    );


                if (error) {

                    console.error(
                        "❌ Error actualizando descuento:",
                        error
                    );


                    /*
                     * Si subimos una imagen nueva
                     * pero falló el UPDATE,
                     * eliminamos esa imagen.
                     */

                    if (
                        archivo &&
                        nuevaImagen &&
                        nuevaImagen !== imagenActual
                    ) {

                        await eliminarImagen(
                            nuevaImagen
                        );
                    }


                    mostrarError(
                        error.message ||
                        "No se pudo actualizar el descuento."
                    );

                    return;
                }


                /*
                 * Eliminar imagen anterior
                 */

                if (
                    archivo &&
                    imagenActual &&
                    imagenActual !== nuevaImagen
                ) {

                    const pathAnterior =
                        obtenerPathImagen(
                            imagenActual
                        );


                    if (pathAnterior) {

                        await eliminarImagen(
                            pathAnterior
                        );
                    }
                }


                console.log(
                    "✅ Descuento actualizado correctamente."
                );


                cerrarModal();


                await cargarDescuentos();


                return;
            }


            /* =============================================
               CREAR
            ============================================== */

            const {
                data,
                error
            } = await supabaseDescuentos
                .from("productos")
                .insert([
                    datosProducto
                ])
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Error creando descuento:",
                    error
                );


                /*
                 * Si se subió una imagen pero
                 * falló el INSERT, la eliminamos.
                 */

                if (nuevaImagen) {

                    await eliminarImagen(
                        nuevaImagen
                    );
                }


                mostrarError(
                    error.message ||
                    "No se pudo crear el descuento."
                );

                return;
            }


            console.log(
                "✅ Descuento creado:",
                data
            );


            cerrarModal();


            await cargarDescuentos();


        } catch (error) {

            console.error(
                "❌ Error guardando descuento:",
                error
            );


            mostrarError(
                error.message ||
                "Ocurrió un error al guardar el descuento."
            );
        }
    }


    /* =====================================================
       ELIMINAR DESCUENTO
    ====================================================== */

    async function eliminarDescuento(id) {

        if (!id) {

            return;
        }


        const confirmar =
            confirm(
                "¿Estás seguro de que deseas eliminar este descuento?"
            );


        if (!confirmar) {

            return;
        }


        console.log(
            "🗑️ Eliminando descuento:",
            id
        );


        try {

            /* =============================================
               OBTENER IMAGEN
            ============================================== */

            const {
                data: producto,
                error: errorConsulta
            } = await supabaseDescuentos
                .from("productos")
                .select(
                    "id,imagen"
                )
                .eq(
                    "id",
                    id
                )
                .eq(
                    "categoria_id",
                    categoriaDescuentosId
                )
                .maybeSingle();


            if (errorConsulta) {

                console.error(
                    "❌ Error obteniendo descuento:",
                    errorConsulta
                );

                mostrarError(
                    "No se pudo obtener el descuento."
                );

                return;
            }


            if (!producto) {

                mostrarError(
                    "El descuento no existe."
                );

                return;
            }


            /* =============================================
               ELIMINAR DE LA TABLA
            ============================================== */

            const {
                error
            } = await supabaseDescuentos
                .from("productos")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "categoria_id",
                    categoriaDescuentosId
                );


            if (error) {

                console.error(
                    "❌ Error eliminando descuento:",
                    error
                );

                mostrarError(
                    error.message ||
                    "No se pudo eliminar el descuento."
                );

                return;
            }


            /* =============================================
               ELIMINAR IMAGEN
            ============================================== */

            if (producto.imagen) {

                const path =
                    obtenerPathImagen(
                        producto.imagen
                    );


                if (path) {

                    await eliminarImagen(
                        path
                    );
                }
            }


            console.log(
                "✅ Descuento eliminado correctamente."
            );


            await cargarDescuentos();


        } catch (error) {

            console.error(
                "❌ Error eliminando descuento:",
                error
            );


            mostrarError(
                error.message ||
                "Ocurrió un error al eliminar el descuento."
            );
        }
    }


    /* =====================================================
       MOSTRAR ERROR
    ====================================================== */

    function mostrarError(mensaje) {

        console.error(
            "⚠️",
            mensaje
        );


        alert(
            mensaje
        );
    }


    /* =====================================================
       CERRAR MODAL CON OVERLAY
    ====================================================== */

    document.addEventListener(
        "click",
        function (evento) {

            const modal =
                document.getElementById(
                    "modalProducto"
                );


            if (!modal) {

                return;
            }


            if (
                evento.target === modal ||
                evento.target.classList.contains(
                    "modal-producto-overlay"
                )
            ) {

                cerrarModal();
            }
        }
    );


    /* =====================================================
       CERRAR DETALLE CON OVERLAY
    ====================================================== */

    document.addEventListener(
        "click",
        function (evento) {

            const modalDetalle =
                document.getElementById(
                    "modalDetalle"
                );


            if (!modalDetalle) {

                return;
            }


            if (
                evento.target === modalDetalle
            ) {

                cerrarDetalle();
            }
        }
    );


    /* =====================================================
       FORMULARIO
    ====================================================== */

    document.addEventListener(
        "submit",
        function (evento) {

            const formulario =
                evento.target;


            if (
                formulario &&
                formulario.id ===
                "formProducto"
            ) {

                guardarDescuento(
                    evento
                );
            }
        }
    );


    /* =====================================================
       EXPONER FUNCIONES GLOBALMENTE
    ====================================================== */

    window.abrirModal =
        abrirModal;


    window.cerrarModal =
        cerrarModal;


    window.mostrarDetalle =
        mostrarDetalle;


    window.cerrarDetalle =
        cerrarDetalle;


    window.editarDescuento =
        editarDescuento;


    window.guardarDescuento =
        guardarDescuento;


    window.eliminarDescuento =
        eliminarDescuento;


    window.cargarDescuentos =
        cargarDescuentos;


    /* =====================================================
       INICIAR
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                configurarCalculoPrecio();

                iniciar();

            }
        );

    } else {

        configurarCalculoPrecio();

        iniciar();
    }


})();