/* =========================================================
   DL LUXURY
   SISTEMA DE ADMINISTRACIÓN
   SCRIPT PRINCIPAL

   ESTE ARCHIVO MANEJA:

   - Inicio
   - Ingresos
   - Ventas
   - Egresos
   - Stock
   - Dashboard
   - Pedidos
   - Confirmar compra
   - Descontar stock automáticamente
   - Dar puntos
   - Datos económicos de pedidos confirmados

   =========================================================

   STOCK:

   AL CONFIRMAR UNA COMPRA:

   1. Se obtiene el pedido.
   2. Se revisan sus productos.
   3. Se verifica que exista stock suficiente.
   4. Se descuenta la cantidad comprada.
   5. Se confirma el pedido.
   6. Se actualiza el Dashboard.

   =========================================================

   PUNTOS:

   Q10    = 1 punto
   Q20    = 2 puntos
   Q50    = 5 puntos
   Q100   = 10 puntos
   Q500   = 50 puntos
   Q1000  = 100 puntos

   FÓRMULA:

   Math.floor(total / 10)

   LÍMITE:

   SIN LÍMITE DE PUNTOS POR COMPRA.
========================================================= */


document.addEventListener("DOMContentLoaded", function () {

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

    const ANO_KEY =
        "dlLuxuryAñoSeleccionado";

    const VENTAS_KEY =
        "dlLuxuryVentas";

    const EGRESOS_KEY =
        "dlLuxuryEgresos";


    /* =====================================================
       UTILIDADES
    ===================================================== */

    function dinero(numero) {

        const valor =
            Number(numero);

        return "Q" +
            (
                Number.isFinite(valor)
                    ? valor
                    : 0
            ).toFixed(2);
    }


    function escaparHTML(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatearFecha(fecha) {

        if (!fecha) {
            return "";
        }

        const fechaObj =
            new Date(fecha);

        if (
            Number.isNaN(
                fechaObj.getTime()
            )
        ) {
            return "";
        }

        return fechaObj.toLocaleDateString(
            "es-GT",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    function formatearHora(fecha) {

        if (!fecha) {
            return "";
        }

        const fechaObj =
            new Date(fecha);

        if (
            Number.isNaN(
                fechaObj.getTime()
            )
        ) {
            return "";
        }

        return fechaObj.toLocaleTimeString(
            "es-GT",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    function obtenerAno(fecha) {

        if (!fecha) {
            return new Date().getFullYear();
        }

        const fechaObj =
            new Date(fecha);

        if (
            Number.isNaN(
                fechaObj.getTime()
            )
        ) {
            return new Date().getFullYear();
        }

        return fechaObj.getFullYear();
    }


    /* =====================================================
       CALCULAR PUNTOS

       REGLA ACTUAL:

       1 PUNTO POR CADA Q10.

       Q10   = 1
       Q20   = 2
       Q50   = 5
       Q100  = 10
       Q500  = 50
       Q1000 = 100

       SIN LÍMITE.
    ===================================================== */

    function calcularPuntos(total) {

        const monto =
            Number(total) || 0;

        if (
            !Number.isFinite(monto) ||
            monto < 10
        ) {
            return 0;
        }

        return Math.floor(
            monto / 10
        );
    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    function leerDatos(clave) {

        try {

            const datos =
                localStorage.getItem(clave);

            if (!datos) {
                return [];
            }

            const resultado =
                JSON.parse(datos);

            return Array.isArray(resultado)
                ? resultado
                : [];

        } catch (error) {

            console.error(
                "❌ Error leyendo:",
                clave,
                error
            );

            return [];
        }
    }


    function guardarDatos(clave, datos) {

        try {

            localStorage.setItem(
                clave,
                JSON.stringify(datos)
            );

            return true;

        } catch (error) {

            console.error(
                "❌ Error guardando:",
                clave,
                error
            );

            alert(
                "No se pudo guardar la información."
            );

            return false;
        }
    }


    function obtenerVentas() {

        return leerDatos(
            VENTAS_KEY
        );
    }


    function guardarVentas(ventas) {

        return guardarDatos(
            VENTAS_KEY,
            ventas
        );
    }


    function obtenerEgresos() {

        return leerDatos(
            EGRESOS_KEY
        );
    }


    function guardarEgresos(egresos) {

        return guardarDatos(
            EGRESOS_KEY,
            egresos
        );
    }


    /* =====================================================
       OBTENER PEDIDOS CONFIRMADOS
    ===================================================== */

    async function obtenerPedidosConfirmados() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("pedidos")
                    .select("*")
                    .eq(
                        "estado",
                        "confirmada"
                    )
                    .order(
                        "creado_en",
                        {
                            ascending: false
                        }
                    );

            if (error) {

                console.error(
                    "❌ Error obteniendo pedidos confirmados:",
                    error
                );

                return [];
            }

            return data || [];

        } catch (error) {

            console.error(
                "❌ Error inesperado obteniendo pedidos:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       OBTENER TODOS LOS PEDIDOS
    ===================================================== */

    async function obtenerTodosLosPedidos() {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("pedidos")
                    .select("*")
                    .order(
                        "creado_en",
                        {
                            ascending: false
                        }
                    );

            if (error) {

                console.error(
                    "❌ Error obteniendo pedidos:",
                    error
                );

                return {
                    data: [],
                    error: error
                };
            }

            return {
                data: data || [],
                error: null
            };

        } catch (error) {

            console.error(
                "❌ Error inesperado obteniendo pedidos:",
                error
            );

            return {
                data: [],
                error: error
            };
        }
    }


    /* =====================================================
       OBTENER PRODUCTOS DE UN PEDIDO
    ===================================================== */

    function obtenerProductosPedido(pedido) {

        let productos = [];

        try {

            if (
                Array.isArray(
                    pedido?.productos
                )
            ) {

                productos =
                    pedido.productos;

            } else if (
                typeof pedido?.productos === "string"
            ) {

                productos =
                    JSON.parse(
                        pedido.productos
                    );

            } else if (
                pedido?.productos &&
                typeof pedido.productos === "object"
            ) {

                productos = [
                    pedido.productos
                ];
            }

        } catch (error) {

            console.error(
                "❌ Error leyendo productos del pedido:",
                error
            );

            productos = [];
        }

        return Array.isArray(productos)
            ? productos
            : [];
    }


    /* =====================================================
       OBTENER ID DE PRODUCTO
    ===================================================== */

    function obtenerIdProductoPedido(producto) {

        return (
            producto?.producto_id ??
            producto?.id_producto ??
            producto?.product_id ??
            producto?.id ??
            null
        );
    }


    /* =====================================================
       OBTENER NOMBRE DEL PRODUCTO
    ===================================================== */

    function obtenerNombreProductoPedido(producto) {

        return (
            producto?.nombre ||
            producto?.name ||
            producto?.producto ||
            producto?.product_name ||
            ""
        );
    }


    /* =====================================================
       OBTENER CANTIDAD
    ===================================================== */

    function obtenerCantidadProducto(producto) {

        const cantidad =
            Number(
                producto?.cantidad ??
                producto?.quantity ??
                producto?.qty ??
                1
            );

        if (
            !Number.isFinite(cantidad) ||
            cantidad <= 0
        ) {
            return 1;
        }

        return Math.floor(cantidad);
    }


    /* =====================================================
       CANTIDAD TOTAL DE PRODUCTOS
    ===================================================== */

    function obtenerCantidadProductosPedido(pedido) {

        const productos =
            obtenerProductosPedido(
                pedido
            );

        let cantidadTotal = 0;

        productos.forEach(
            function (producto) {

                cantidadTotal +=
                    obtenerCantidadProducto(
                        producto
                    );
            }
        );

        return cantidadTotal;
    }


    /* =====================================================
       OBTENER TOTAL DEL PEDIDO
    ===================================================== */

    function obtenerTotalPedido(pedido) {

        const total =
            Number(
                pedido?.total
            );

        if (
            Number.isFinite(total)
        ) {
            return total;
        }

        const productos =
            obtenerProductosPedido(
                pedido
            );

        let totalCalculado = 0;

        productos.forEach(
            function (producto) {

                const precio =
                    Number(
                        producto?.precio ??
                        producto?.price ??
                        producto?.precio_final ??
                        0
                    );

                const cantidad =
                    obtenerCantidadProducto(
                        producto
                    );

                totalCalculado +=
                    precio * cantidad;
            }
        );

        return totalCalculado;
    }


    /* =====================================================
       NAVEGACIÓN
    ===================================================== */

    window.mostrarSeccion =
        function (
            id,
            boton = null
        ) {

            const paginas = {

                gorras:
                    "gorras.html",

                playeras:
                    "playeras.html",

                hoodies:
                    "hoodies.html",

                perfumes:
                    "perfumes.html",

                accesorios:
                    "accesorios.html",

                descuentos:
                    "descuentos.html"
            };


            if (
                paginas[id]
            ) {

                window.location.href =
                    paginas[id];

                return;
            }


            const secciones =
                document.querySelectorAll(
                    ".seccion"
                );

            secciones.forEach(
                function (seccion) {

                    seccion.classList.remove(
                        "activa"
                    );
                }
            );


            const seccion =
                document.getElementById(
                    id
                );

            if (seccion) {

                seccion.classList.add(
                    "activa"
                );
            }


            const menus =
                document.querySelectorAll(
                    ".menu"
                );

            menus.forEach(
                function (menu) {

                    menu.classList.remove(
                        "active"
                    );
                }
            );


            if (boton) {

                boton.classList.add(
                    "active"
                );
            }


            if (
                id === "inicio"
            ) {

                actualizarDashboard();

                return;
            }


            if (
                id === "ingresos"
            ) {

                cargarIngresos();

                return;
            }


            if (
                id === "ventas"
            ) {

                actualizarDashboard();

                return;
            }


            if (
                id === "egresos"
            ) {

                mostrarEgresos();

                return;
            }


            if (
                id === "stock"
            ) {

                cargarStock();

                return;
            }


            if (
                id === "pedidos"
            ) {

                cargarPedidos();

                return;
            }
        };


    /* =====================================================
       MODAL EGRESO
    ===================================================== */

    window.abrirModalEgreso =
        function () {

            const modal =
                document.getElementById(
                    "modalEgreso"
                );

            const formulario =
                document.getElementById(
                    "formEgreso"
                );

            if (!modal) {
                return;
            }

            if (formulario) {
                formulario.reset();
            }

            modal.style.display =
                "flex";

            modal.classList.add(
                "activo"
            );
        };


    window.cerrarModalEgreso =
        function () {

            const modal =
                document.getElementById(
                    "modalEgreso"
                );

            if (!modal) {
                return;
            }

            modal.style.display =
                "none";

            modal.classList.remove(
                "activo"
            );
        };


    /* =====================================================
       GUARDAR EGRESO
    ===================================================== */

    const formularioEgreso =
        document.getElementById(
            "formEgreso"
        );


    if (formularioEgreso) {

        formularioEgreso.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();


                const descripcionInput =
                    document.getElementById(
                        "descripcionEgreso"
                    );


                const montoInput =
                    document.getElementById(
                        "montoEgreso"
                    );


                const descripcion =
                    descripcionInput
                        ? descripcionInput.value.trim()
                        : "";


                const monto =
                    montoInput
                        ? Number(
                            montoInput.value
                        )
                        : 0;


                if (!descripcion) {

                    alert(
                        "Escribe una descripción."
                    );

                    return;
                }


                if (
                    !Number.isFinite(monto) ||
                    monto <= 0
                ) {

                    alert(
                        "Ingresa un monto válido."
                    );

                    return;
                }


                const egresos =
                    obtenerEgresos();


                egresos.push({

                    id:
                        Date.now().toString(),

                    descripcion:
                        descripcion,

                    monto:
                        monto,

                    fecha:
                        new Date().toISOString()

                });


                if (
                    !guardarEgresos(
                        egresos
                    )
                ) {

                    return;
                }


                alert(
                    "Egreso guardado correctamente."
                );


                window.cerrarModalEgreso();


                mostrarEgresos();

                cargarIngresos();

                actualizarDashboard();

                llenarSelectorAnios();

            }
        );
    }


    /* =====================================================
       MOSTRAR EGRESOS
    ===================================================== */

    function mostrarEgresos() {

        const contenedor =
            document.getElementById(
                "listaEgresos"
            );

        if (!contenedor) {
            return;
        }


        const añoSeleccionado =
            obtenerAnoSeleccionado();


        const egresos =
            obtenerEgresos()
                .filter(
                    function (egreso) {

                        return (
                            obtenerAno(
                                egreso.fecha
                            ) ===
                            añoSeleccionado
                        );
                    }
                );


        contenedor.innerHTML =
            "";


        if (
            egresos.length === 0
        ) {

            contenedor.innerHTML = `
                <div class="sin-productos">

                    <i class="fa-solid fa-money-bill-transfer"></i>

                    <h3>
                        No hay egresos
                    </h3>

                    <p>
                        No hay egresos registrados para ${añoSeleccionado}.
                    </p>

                </div>
            `;

            return;
        }


        egresos
            .slice()
            .reverse()
            .forEach(
                function (egreso) {

                    const tarjeta =
                        document.createElement(
                            "div"
                        );


                    tarjeta.className =
                        "producto-card";


                    tarjeta.innerHTML = `
                        <div class="producto-info">

                            <span class="mini-titulo">
                                ${formatearFecha(
                        egreso.fecha
                    )}
                            </span>

                            <h3>
                                ${escaparHTML(
                        egreso.descripcion
                    )}
                            </h3>

                            <div class="producto-precio">

                                <strong>
                                    ${dinero(
                        egreso.monto
                    )}
                                </strong>

                            </div>

                        </div>
                    `;


                    contenedor.appendChild(
                        tarjeta
                    );
                }
            );
    }


    /* =====================================================
       CARGAR STOCK
    ===================================================== */

    async function cargarStock() {

        const tabla =
            document.getElementById(
                "listaStock"
            );


        const totalProductosElemento =
            document.getElementById(
                "totalProductos"
            );


        const stockTotalElemento =
            document.getElementById(
                "stockTotal"
            );


        const stockBajoElemento =
            document.getElementById(
                "stockBajo"
            );


        if (
            !tabla &&
            !totalProductosElemento &&
            !stockTotalElemento &&
            !stockBajoElemento
        ) {
            return;
        }


        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("productos")
                    .select(
                        "id,nombre,precio,stock,categoria_id,activo"
                    );


            if (error) {

                console.error(
                    "❌ Error cargando stock:",
                    error
                );


                if (tabla) {

                    tabla.innerHTML = `
                        <tr>
                            <td colspan="5">
                                Error al cargar el inventario.
                                <br>
                                ${escaparHTML(
                        error.message
                    )}
                            </td>
                        </tr>
                    `;
                }

                return;
            }


            const productos =
                (data || [])
                    .filter(
                        function (producto) {

                            return (
                                producto.activo !== false
                            );
                        }
                    );


            let stockTotal = 0;

            let stockBajo = 0;


            productos.forEach(
                function (producto) {

                    const stock =
                        Number(
                            producto.stock || 0
                        );


                    stockTotal +=
                        stock;


                    if (
                        stock <= 5
                    ) {

                        stockBajo++;
                    }
                }
            );


            if (totalProductosElemento) {

                totalProductosElemento.textContent =
                    productos.length;
            }


            if (stockTotalElemento) {

                stockTotalElemento.textContent =
                    stockTotal;
            }


            if (stockBajoElemento) {

                stockBajoElemento.textContent =
                    stockBajo;
            }


            if (!tabla) {
                return;
            }


            tabla.innerHTML =
                "";


            if (
                productos.length === 0
            ) {

                tabla.innerHTML = `
                    <tr>
                        <td colspan="5">
                            No hay productos registrados.
                        </td>
                    </tr>
                `;

                return;
            }


            productos.forEach(
                function (producto) {

                    const stock =
                        Number(
                            producto.stock || 0
                        );


                    let estado =
                        "Disponible";


                    if (
                        stock <= 0
                    ) {

                        estado =
                            "Agotado";

                    } else if (
                        stock <= 5
                    ) {

                        estado =
                            "Stock bajo";
                    }


                    const fila =
                        document.createElement(
                            "tr"
                        );


                    fila.innerHTML = `
                        <td>
                            ${escaparHTML(
                        producto.nombre
                    )}
                        </td>

                        <td>
                            ${obtenerNombreCategoria(
                        producto.categoria_id
                    )}
                        </td>

                        <td>
                            ${dinero(
                        producto.precio
                    )}
                        </td>

                        <td>
                            ${stock}
                        </td>

                        <td>
                            ${estado}
                        </td>
                    `;


                    tabla.appendChild(
                        fila
                    );
                }
            );


        } catch (error) {

            console.error(
                "❌ Error inesperado cargando stock:",
                error
            );


            if (tabla) {

                tabla.innerHTML = `
                    <tr>
                        <td colspan="5">
                            Error inesperado al cargar el inventario.
                        </td>
                    </tr>
                `;
            }
        }
    }


    /* =====================================================
       NOMBRE DE CATEGORÍA

       Playeras = 2
       Gorras = 3
       Hoodies = 4
       Perfumes = 5
       Accesorios = 6
    ===================================================== */

    function obtenerNombreCategoria(categoriaId) {

        const categorias = {

            2:
                "Playeras",

            3:
                "Gorras",

            4:
                "Hoodies",

            5:
                "Perfumes",

            6:
                "Accesorios"
        };


        return escaparHTML(
            categorias[categoriaId] ||
            "Sin categoría"
        );
    }


    /* =====================================================
       OBTENER AÑO SELECCIONADO
    ===================================================== */

    function obtenerAnoSeleccionado() {

        const selector =
            document.getElementById(
                "selectorAño"
            );


        if (
            selector &&
            selector.value
        ) {

            const ano =
                Number(
                    selector.value
                );


            if (
                Number.isInteger(ano) &&
                ano >= 1900
            ) {

                return ano;
            }
        }


        const guardado =
            Number(
                localStorage.getItem(
                    ANO_KEY
                )
            );


        if (
            Number.isInteger(guardado) &&
            guardado >= 1900
        ) {

            return guardado;
        }


        return new Date()
            .getFullYear();
    }


    /* =====================================================
       CARGAR VENTAS
    ===================================================== */

    async function cargarVentas() {

        const tabla =
            document.getElementById(
                "tablaVentas"
            );


        if (!tabla) {
            return;
        }


        const añoSeleccionado =
            obtenerAnoSeleccionado();


        const pedidos =
            await obtenerPedidosConfirmados();


        const pedidosAño =
            pedidos.filter(
                function (pedido) {

                    return (
                        obtenerAno(
                            pedido.creado_en
                        ) ===
                        añoSeleccionado
                    );
                }
            );


        tabla.innerHTML =
            "";


        if (
            pedidosAño.length === 0
        ) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay ventas registradas
                        para este año.
                    </td>
                </tr>
            `;

            return;
        }


        pedidosAño.forEach(
            function (pedido) {

                const productos =
                    obtenerProductosPedido(
                        pedido
                    );


                let nombreProducto =
                    "Pedido #" +
                    pedido.id;


                const cantidad =
                    obtenerCantidadProductosPedido(
                        pedido
                    );


                if (
                    productos.length === 1
                ) {

                    nombreProducto =
                        productos[0]?.nombre ||
                        productos[0]?.name ||
                        nombreProducto;
                }


                const fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML = `
                    <td>
                        ${escaparHTML(
                    nombreProducto
                )}
                    </td>

                    <td>
                        ${cantidad}
                    </td>

                    <td>
                        ${dinero(
                    pedido.total
                )}
                    </td>

                    <td>
                        Confirmada
                    </td>
                `;


                tabla.appendChild(
                    fila
                );
            }
        );
    }


    /* =====================================================
       CARGAR INGRESOS
    ===================================================== */

    async function cargarIngresos() {

        const añoSeleccionado =
            obtenerAnoSeleccionado();


        const pedidos =
            await obtenerPedidosConfirmados();


        const pedidosAño =
            pedidos.filter(
                function (pedido) {

                    return (
                        obtenerAno(
                            pedido.creado_en
                        ) ===
                        añoSeleccionado
                    );
                }
            );


        let totalIngresos = 0;

        let cantidadIngresos = 0;


        pedidosAño.forEach(
            function (pedido) {

                totalIngresos +=
                    Number(
                        pedido.total || 0
                    );

                cantidadIngresos++;
            }
        );


        const egresos =
            obtenerEgresos()
                .filter(
                    function (egreso) {

                        return (
                            obtenerAno(
                                egreso.fecha
                            ) ===
                            añoSeleccionado
                        );
                    }
                );


        let totalEgresos = 0;


        egresos.forEach(
            function (egreso) {

                totalEgresos +=
                    Number(
                        egreso.monto || 0
                    );
            }
        );


        const ganancia =
            totalIngresos -
            totalEgresos;


        const elementoIngresos =
            document.getElementById(
                "totalIngresos"
            );


        const cantidadElemento =
            document.getElementById(
                "cantidadIngresos"
            );


        const gananciaElemento =
            document.getElementById(
                "gananciaIngresos"
            );


        if (elementoIngresos) {

            elementoIngresos.textContent =
                dinero(
                    totalIngresos
                );
        }


        if (cantidadElemento) {

            cantidadElemento.textContent =
                cantidadIngresos;
        }


        if (gananciaElemento) {

            gananciaElemento.textContent =
                dinero(
                    ganancia
                );
        }


        const tabla =
            document.getElementById(
                "tablaIngresos"
            );


        if (!tabla) {
            return;
        }


        tabla.innerHTML =
            "";


        if (
            pedidosAño.length === 0
        ) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay ingresos registrados
                        para ${añoSeleccionado}.
                    </td>
                </tr>
            `;

            return;
        }


        pedidosAño.forEach(
            function (pedido) {

                const productos =
                    obtenerProductosPedido(
                        pedido
                    );


                let nombreProducto =
                    "Pedido #" +
                    pedido.id;


                const cantidad =
                    obtenerCantidadProductosPedido(
                        pedido
                    );


                if (
                    productos.length === 1
                ) {

                    nombreProducto =
                        productos[0]?.nombre ||
                        productos[0]?.name ||
                        nombreProducto;
                }


                const fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML = `
                    <td>
                        ${formatearFecha(
                    pedido.creado_en
                )}
                    </td>

                    <td>
                        ${escaparHTML(
                    nombreProducto
                )}
                    </td>

                    <td>
                        ${cantidad}
                    </td>

                    <td>
                        ${dinero(
                    pedido.total
                )}
                    </td>
                `;


                tabla.appendChild(
                    fila
                );
            }
        );
    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    async function actualizarDashboard() {

        const anoActual =
            obtenerAnoSeleccionado();


        const selector =
            document.getElementById(
                "selectorAño"
            );


        if (selector) {

            selector.value =
                String(
                    anoActual
                );
        }


        const anoTexto =
            document.getElementById(
                "añoActual"
            );


        if (anoTexto) {

            anoTexto.textContent =
                anoActual;
        }


        console.log(
            "🔄 Actualizando Dashboard para el año:",
            anoActual
        );


        const pedidos =
            await obtenerPedidosConfirmados();


        const pedidosAño =
            pedidos.filter(
                function (pedido) {

                    return (
                        obtenerAno(
                            pedido.creado_en
                        ) ===
                        anoActual
                    );
                }
            );


        const egresos =
            obtenerEgresos()
                .filter(
                    function (egreso) {

                        return (
                            obtenerAno(
                                egreso.fecha
                            ) ===
                            anoActual
                        );
                    }
                );


        let totalVentas = 0;

        let totalEgresos = 0;

        let productosVendidos = 0;


        pedidosAño.forEach(
            function (pedido) {

                totalVentas +=
                    Number(
                        pedido.total || 0
                    );


                productosVendidos +=
                    obtenerCantidadProductosPedido(
                        pedido
                    );
            }
        );


        egresos.forEach(
            function (egreso) {

                totalEgresos +=
                    Number(
                        egreso.monto || 0
                    );
            }
        );


        const ganancia =
            totalVentas -
            totalEgresos;


        const elementoVentas =
            document.getElementById(
                "totalVentas"
            );


        const elementoIngresos =
            document.getElementById(
                "totalIngresos"
            );


        const elementoEgresos =
            document.getElementById(
                "totalEgresos"
            );


        const elementoGanancia =
            document.getElementById(
                "gananciaTotal"
            );


        const elementoProductos =
            document.getElementById(
                "productosVendidos"
            );


        if (elementoVentas) {

            elementoVentas.textContent =
                dinero(
                    totalVentas
                );
        }


        if (elementoIngresos) {

            elementoIngresos.textContent =
                dinero(
                    totalVentas
                );
        }


        if (elementoEgresos) {

            elementoEgresos.textContent =
                dinero(
                    totalEgresos
                );
        }


        if (elementoGanancia) {

            elementoGanancia.textContent =
                dinero(
                    ganancia
                );
        }


        if (elementoProductos) {

            elementoProductos.textContent =
                productosVendidos;
        }


        /* =========================================
           ACTUALIZAR STOCK
        ========================================= */

        await cargarStock();


        cargarTablaVentasAno(
            pedidosAño
        );


        await cargarIngresos();
    }


    /* =====================================================
       TABLA VENTAS POR AÑO
    ===================================================== */

    function cargarTablaVentasAno(pedidos) {

        const tabla =
            document.getElementById(
                "tablaVentas"
            );


        if (!tabla) {
            return;
        }


        tabla.innerHTML =
            "";


        if (
            !pedidos ||
            pedidos.length === 0
        ) {

            tabla.innerHTML = `
                <tr>
                    <td colspan="4">
                        No hay ventas registradas
                        para este año.
                    </td>
                </tr>
            `;

            return;
        }


        pedidos.forEach(
            function (pedido) {

                const productos =
                    obtenerProductosPedido(
                        pedido
                    );


                let nombreProducto =
                    "Pedido #" +
                    pedido.id;


                const cantidad =
                    obtenerCantidadProductosPedido(
                        pedido
                    );


                if (
                    productos.length === 1
                ) {

                    nombreProducto =
                        productos[0]?.nombre ||
                        productos[0]?.name ||
                        nombreProducto;
                }


                const fila =
                    document.createElement(
                        "tr"
                    );


                fila.innerHTML = `
                    <td>
                        ${escaparHTML(
                    nombreProducto
                )}
                    </td>

                    <td>
                        ${cantidad}
                    </td>

                    <td>
                        ${dinero(
                    pedido.total
                )}
                    </td>

                    <td>
                        Confirmada
                    </td>
                `;


                tabla.appendChild(
                    fila
                );
            }
        );
    }


    /* =====================================================
       SELECTOR DE AÑOS

       2026 - 2067
    ===================================================== */

    async function llenarSelectorAnios() {

        const selector =
            document.getElementById(
                "selectorAño"
            );


        if (!selector) {
            return;
        }


        const anoInicial =
            2026;


        const cantidadAnios =
            42;


        const anos = [];


        for (
            let i = 0;
            i < cantidadAnios;
            i++
        ) {

            anos.push(
                anoInicial + i
            );
        }


        selector.innerHTML =
            "";


        anos.forEach(
            function (ano) {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    String(
                        ano
                    );


                opcion.textContent =
                    String(
                        ano
                    );


                selector.appendChild(
                    opcion
                );
            }
        );


        const guardado =
            Number(
                localStorage.getItem(
                    ANO_KEY
                )
            );


        let anoSeleccionado;


        if (
            Number.isInteger(guardado) &&
            anos.includes(guardado)
        ) {

            anoSeleccionado =
                guardado;

        } else {

            const anoActual =
                new Date()
                    .getFullYear();


            if (
                anos.includes(
                    anoActual
                )
            ) {

                anoSeleccionado =
                    anoActual;

            } else {

                anoSeleccionado =
                    anoInicial;
            }
        }


        selector.value =
            String(
                anoSeleccionado
            );


        localStorage.setItem(
            ANO_KEY,
            String(
                anoSeleccionado
            )
        );


        const anoTexto =
            document.getElementById(
                "añoActual"
            );


        if (anoTexto) {

            anoTexto.textContent =
                anoSeleccionado;
        }
    }


    /* =====================================================
       PEDIDOS
    ===================================================== */

    async function cargarPedidos() {

        const contenedor =
            document.getElementById(
                "listaPedidos"
            );


        if (!contenedor) {
            return;
        }


        contenedor.innerHTML = `
            <div class="sin-productos">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <h3>
                    Cargando pedidos...
                </h3>

            </div>
        `;


        try {

            const resultado =
                await obtenerTodosLosPedidos();


            if (resultado.error) {

                contenedor.innerHTML = `
                    <div class="sin-productos">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <h3>
                            Error al cargar pedidos
                        </h3>

                        <p>
                            ${escaparHTML(
                    resultado.error.message
                )}
                        </p>

                    </div>
                `;

                return;
            }


            const añoSeleccionado =
                obtenerAnoSeleccionado();


            const pedidos =
                (resultado.data || [])
                    .filter(
                        function (pedido) {

                            if (!pedido.creado_en) {
                                return false;
                            }


                            return (
                                obtenerAno(
                                    pedido.creado_en
                                ) ===
                                añoSeleccionado
                            );
                        }
                    );


            contenedor.innerHTML =
                "";


            if (
                pedidos.length === 0
            ) {

                contenedor.innerHTML = `
                    <div class="sin-productos">

                        <i class="fa-solid fa-cart-shopping"></i>

                        <h3>
                            No hay pedidos
                        </h3>

                        <p>
                            No hay pedidos registrados
                            para ${añoSeleccionado}.
                        </p>

                    </div>
                `;

                return;
            }


            pedidos.forEach(
                function (pedido) {

                    crearTarjetaPedido(
                        pedido,
                        contenedor
                    );
                }
            );


        } catch (error) {

            console.error(
                "❌ Error inesperado cargando pedidos:",
                error
            );


            contenedor.innerHTML = `
                <div class="sin-productos">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Error al cargar pedidos
                    </h3>

                    <p>
                        ${escaparHTML(
                error.message
            )}
                    </p>

                </div>
            `;
        }
    }


    /* =====================================================
       CREAR TARJETA PEDIDO
    ===================================================== */

    function crearTarjetaPedido(
        pedido,
        contenedor
    ) {

        const tarjeta =
            document.createElement(
                "div"
            );


        tarjeta.className =
            "producto-card";


        const nombreCliente =
            pedido.cliente_nombre ||
            "Cliente";


        const correoCliente =
            pedido.cliente_correo ||
            "";


        const total =
            obtenerTotalPedido(
                pedido
            );


        const cantidad =
            obtenerCantidadProductosPedido(
                pedido
            );


        const productos =
            obtenerProductosPedido(
                pedido
            );


        const confirmado =
            String(
                pedido.estado || ""
            ).toLowerCase() ===
            "confirmada";


        const puntosValidados =
            pedido.puntos_validados === true;


        const puntosGenerados =
            Number(
                pedido.puntos_generados ??
                pedido.puntos ??
                0
            ) || 0;


        let listaProductos =
            "";


        if (
            productos.length > 0
        ) {

            listaProductos =
                productos
                    .map(
                        function (producto) {

                            const nombre =
                                obtenerNombreProductoPedido(
                                    producto
                                ) ||
                                "Producto";


                            const cantidadProducto =
                                obtenerCantidadProducto(
                                    producto
                                );


                            return `
                                <div style="
                                    margin: 5px 0;
                                    color: #ccc;
                                ">

                                    <i class="fa-solid fa-box"></i>

                                    ${escaparHTML(
                                nombre
                            )}

                                    × ${cantidadProducto}

                                </div>
                            `;
                        }
                    )
                    .join("");

        } else {

            listaProductos = `
                <div style="color:#888;">
                    Sin productos detallados
                </div>
            `;
        }


        /* =================================================
           ESTADO
        ================================================= */

        let estadoHTML =
            "";


        if (confirmado) {

            estadoHTML = `
                <span style="
                    display:inline-block;
                    padding:6px 10px;
                    border-radius:6px;
                    background:#173a20;
                    color:#8ee59c;
                    font-size:13px;
                ">

                    <i class="fa-solid fa-circle-check"></i>

                    Compra confirmada

                </span>
            `;

        } else {

            estadoHTML = `
                <span style="
                    display:inline-block;
                    padding:6px 10px;
                    border-radius:6px;
                    background:#3a2e17;
                    color:#d8b56a;
                    font-size:13px;
                ">

                    <i class="fa-solid fa-clock"></i>

                    Pendiente

                </span>
            `;
        }


        /* =================================================
           BOTÓN CONFIRMAR
        ================================================= */

        let botonConfirmar =
            "";


        if (!confirmado) {

            botonConfirmar = `
                <button
                    type="button"
                    onclick="confirmarCompra(${Number(
                pedido.id
            )})"
                    style="
                        border:none;
                        cursor:pointer;
                        padding:10px 15px;
                        border-radius:7px;
                        background:#d8b56a;
                        color:#111;
                        font-weight:bold;
                        margin-right:8px;
                    "
                >

                    <i class="fa-solid fa-check"></i>

                    Confirmar compra

                </button>
            `;

        } else {

            botonConfirmar = `
                <button
                    type="button"
                    disabled
                    style="
                        border:none;
                        padding:10px 15px;
                        border-radius:7px;
                        background:#333;
                        color:#888;
                        font-weight:bold;
                        margin-right:8px;
                        cursor:not-allowed;
                    "
                >

                    <i class="fa-solid fa-circle-check"></i>

                    Compra confirmada

                </button>
            `;
        }


        /* =================================================
           BOTÓN PUNTOS
        ================================================= */

        let botonPuntos =
            "";


        if (!confirmado) {

            botonPuntos = `
                <button
                    type="button"
                    disabled
                    style="
                        border:none;
                        padding:10px 15px;
                        border-radius:7px;
                        background:#252525;
                        color:#666;
                        font-weight:bold;
                        cursor:not-allowed;
                    "
                >

                    <i class="fa-solid fa-star"></i>

                    Dar puntos

                </button>
            `;

        } else if (puntosValidados) {

            botonPuntos = `
                <button
                    type="button"
                    disabled
                    style="
                        border:none;
                        padding:10px 15px;
                        border-radius:7px;
                        background:#173a20;
                        color:#8ee59c;
                        font-weight:bold;
                        cursor:not-allowed;
                    "
                >

                    <i class="fa-solid fa-star"></i>

                    Puntos otorgados:
                    ${puntosGenerados}

                </button>
            `;

        } else {

            const puntosCalculados =
                calcularPuntos(
                    total
                );


            if (
                puntosCalculados > 0
            ) {

                botonPuntos = `
                    <button
                        type="button"
                        onclick="darPuntos(${Number(
                    pedido.id
                )})"
                        style="
                            border:none;
                            cursor:pointer;
                            padding:10px 15px;
                            border-radius:7px;
                            background:#d8b56a;
                            color:#111;
                            font-weight:bold;
                        "
                    >

                        <i class="fa-solid fa-star"></i>

                        Dar ${puntosCalculados}
                        ${puntosCalculados === 1
                        ? "punto"
                        : "puntos"
                    }

                    </button>
                `;

            } else {

                botonPuntos = `
                    <button
                        type="button"
                        disabled
                        style="
                            border:none;
                            padding:10px 15px;
                            border-radius:7px;
                            background:#252525;
                            color:#888;
                            font-weight:bold;
                            cursor:not-allowed;
                        "
                    >

                        <i class="fa-solid fa-star"></i>

                        No genera puntos

                    </button>
                `;
            }
        }


        /* =================================================
           HTML TARJETA
        ================================================= */

        tarjeta.innerHTML = `

            <div class="producto-info">

                <span class="mini-titulo">

                    PEDIDO #${escaparHTML(
            pedido.id
        )}

                </span>


                <h3 style="margin-top:8px;">

                    ${escaparHTML(
            nombreCliente
        )}

                </h3>


                ${correoCliente
                ? `
                            <p style="
                                color:#999;
                                margin:5px 0;
                            ">

                                <i class="fa-solid fa-envelope"></i>

                                ${escaparHTML(
                    correoCliente
                )}

                            </p>
                        `
                : ""
            }


                <p style="
                    color:#999;
                    margin:5px 0;
                ">

                    <i class="fa-solid fa-calendar"></i>

                    ${formatearFecha(
                pedido.creado_en
            )}

                    ${pedido.creado_en
                ? `
                                -
                                ${formatearHora(
                    pedido.creado_en
                )}
                            `
                : ""
            }

                </p>


                <div style="
                    margin-top:15px;
                    padding:12px;
                    background:#181818;
                    border-radius:8px;
                ">

                    <strong style="
                        color:#d8b56a;
                    ">

                        Productos

                    </strong>


                    <div style="
                        margin-top:8px;
                    ">

                        ${listaProductos}

                    </div>

                </div>


                <div style="
                    margin-top:15px;
                    display:flex;
                    gap:15px;
                    flex-wrap:wrap;
                    align-items:center;
                ">

                    <div>

                        <span style="
                            display:block;
                            color:#888;
                            font-size:12px;
                        ">

                            CANTIDAD

                        </span>

                        <strong>

                            ${cantidad}

                        </strong>

                    </div>


                    <div>

                        <span style="
                            display:block;
                            color:#888;
                            font-size:12px;
                        ">

                            TOTAL

                        </span>

                        <strong style="
                            color:#d8b56a;
                            font-size:18px;
                        ">

                            ${dinero(
                total
            )}

                        </strong>

                    </div>


                    <div>

                        ${estadoHTML}

                    </div>

                </div>


                <div style="
                    margin-top:18px;
                ">

                    ${botonConfirmar}

                    ${botonPuntos}

                </div>

            </div>
        `;


        contenedor.appendChild(
            tarjeta
        );
    }


    /* =====================================================
       PREPARAR PRODUCTOS PARA STOCK
    ===================================================== */

    function prepararProductosParaStock(pedido) {

        const productos =
            obtenerProductosPedido(
                pedido
            );


        const productosAgrupados =
            new Map();


        productos.forEach(
            function (producto) {

                const id =
                    obtenerIdProductoPedido(
                        producto
                    );


                const nombre =
                    obtenerNombreProductoPedido(
                        producto
                    );


                const cantidad =
                    obtenerCantidadProducto(
                        producto
                    );


                /*
                   SI EXISTE ID:
                   USAMOS EL ID.

                   SI NO:
                   USAMOS EL NOMBRE COMO RESPALDO.
                */

                const clave =
                    id !== null &&
                        id !== undefined &&
                        id !== ""
                        ? "id:" + String(id)
                        : "nombre:" +
                        String(nombre)
                            .trim()
                            .toLowerCase();


                if (
                    productosAgrupados.has(
                        clave
                    )
                ) {

                    const existente =
                        productosAgrupados.get(
                            clave
                        );


                    existente.cantidad +=
                        cantidad;

                } else {

                    productosAgrupados.set(
                        clave,
                        {
                            id:
                                id,

                            nombre:
                                nombre,

                            cantidad:
                                cantidad
                        }
                    );
                }
            }
        );


        return Array.from(
            productosAgrupados.values()
        );
    }


    /* =====================================================
       BUSCAR PRODUCTO REAL EN SUPABASE
    ===================================================== */

    async function buscarProductoParaStock(
        productoPedido
    ) {

        const id =
            productoPedido.id;


        const nombre =
            productoPedido.nombre;


        /*
           PRIMERA OPCIÓN:
           BUSCAR POR ID.
        */

        if (
            id !== null &&
            id !== undefined &&
            id !== ""
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("productos")
                    .select(
                        "id,nombre,stock,activo"
                    )
                    .eq(
                        "id",
                        id
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "❌ Error buscando producto por ID:",
                    error
                );


                throw new Error(
                    "No se pudo buscar el producto con ID " +
                    id +
                    ". " +
                    error.message
                );
            }


            if (data) {

                return data;
            }
        }


        /*
           SEGUNDA OPCIÓN:
           BUSCAR POR NOMBRE.
        */

        if (
            nombre &&
            String(nombre).trim()
        ) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("productos")
                    .select(
                        "id,nombre,stock,activo"
                    )
                    .ilike(
                        "nombre",
                        String(nombre).trim()
                    )
                    .limit(1);


            if (error) {

                console.error(
                    "❌ Error buscando producto por nombre:",
                    error
                );


                throw new Error(
                    "No se pudo buscar el producto " +
                    nombre +
                    ". " +
                    error.message
                );
            }


            if (
                data &&
                data.length > 0
            ) {

                return data[0];
            }
        }


        return null;
    }


    /* =====================================================
       RESTAURAR STOCK
    ===================================================== */

    async function restaurarStock(
        productos
    ) {

        if (
            !Array.isArray(productos)
        ) {
            return;
        }


        for (
            const producto
            of productos
        ) {

            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from("productos")
                        .update({
                            stock:
                                producto.stockAnterior
                        })
                        .eq(
                            "id",
                            producto.id
                        );


                if (error) {

                    console.error(
                        "❌ Error restaurando stock:",
                        producto,
                        error
                    );
                }

            } catch (error) {

                console.error(
                    "❌ Error restaurando stock:",
                    producto,
                    error
                );
            }
        }
    }


    /* =====================================================
       DESCONTAR STOCK DE UNA COMPRA

       PASO 1:
       Buscar todos los productos.

       PASO 2:
       Verificar TODO el stock.

       PASO 3:
       Si todo está correcto,
       descontar.

       PASO 4:
       Si falla algo,
       restaurar lo anterior.

       IMPORTANTE:

       El UPDATE ya NO utiliza:

       .select()
       .maybeSingle()

       porque eso podía provocar falsos errores
       aunque Supabase hubiera realizado el UPDATE.
    ===================================================== */

    async function descontarStockPedido(pedido) {

        const productosPedido =
            prepararProductosParaStock(
                pedido
            );


        if (
            productosPedido.length === 0
        ) {

            throw new Error(
                "El pedido no contiene productos."
            );
        }


        console.log(
            "📦 Productos a descontar:",
            productosPedido
        );


        const productosEncontrados =
            [];


        /* ==========================================
           PASO 1
           BUSCAR TODOS
        ========================================== */

        for (
            const productoPedido
            of productosPedido
        ) {

            const producto =
                await buscarProductoParaStock(
                    productoPedido
                );


            if (!producto) {

                throw new Error(
                    "No se encontró en el inventario el producto: " +
                    (
                        productoPedido.nombre ||
                        productoPedido.id ||
                        "Producto desconocido"
                    )
                );
            }


            if (
                producto.activo === false
            ) {

                throw new Error(
                    "El producto " +
                    producto.nombre +
                    " está desactivado."
                );
            }


            const stockActual =
                Number(
                    producto.stock
                );


            if (
                !Number.isFinite(
                    stockActual
                )
            ) {

                throw new Error(
                    "El producto " +
                    producto.nombre +
                    " tiene un stock inválido."
                );
            }


            const cantidadNecesaria =
                Number(
                    productoPedido.cantidad
                );


            if (
                !Number.isFinite(
                    cantidadNecesaria
                ) ||
                cantidadNecesaria <= 0
            ) {

                throw new Error(
                    "La cantidad del producto " +
                    producto.nombre +
                    " no es válida."
                );
            }


            /* ==========================================
               VERIFICAR STOCK
            ========================================== */

            if (
                stockActual <
                cantidadNecesaria
            ) {

                throw new Error(
                    "Stock insuficiente para " +
                    producto.nombre +
                    ".\n\n" +
                    "Stock disponible: " +
                    stockActual +
                    "\n" +
                    "Cantidad solicitada: " +
                    cantidadNecesaria
                );
            }


            productosEncontrados.push({

                id:
                    producto.id,

                nombre:
                    producto.nombre,

                stockAnterior:
                    stockActual,

                cantidad:
                    cantidadNecesaria,

                stockNuevo:
                    stockActual -
                    cantidadNecesaria
            });
        }


        /* ==========================================
           PASO 2
           ACTUALIZAR TODOS

           IMPORTANTE:
           NO usar .select().maybeSingle()
           después del update.
        ========================================== */

        const actualizados = [];


        try {

            for (
                const producto
                of productosEncontrados
            ) {

                const {
                    error
                } =
                    await supabaseClient
                        .from("productos")
                        .update({

                            stock:
                                producto.stockNuevo

                        })
                        .eq(
                            "id",
                            producto.id
                        );


                if (error) {

                    console.error(
                        "❌ Error descontando stock:",
                        error
                    );

                    throw new Error(
                        "No se pudo actualizar el stock de " +
                        producto.nombre +
                        ".\n\n" +
                        error.message
                    );
                }


                /*
                   IMPORTANTE:

                   Si Supabase no devuelve error,
                   consideramos exitoso el UPDATE.

                   No exigimos que data exista.
                */

                actualizados.push(
                    producto
                );


                console.log(
                    "✅ Stock actualizado:",
                    producto.nombre,
                    producto.stockAnterior,
                    "→",
                    producto.stockNuevo
                );
            }


        } catch (error) {

            /*
               SI FALLA UN PRODUCTO,
               RESTAURAMOS LOS ANTERIORES.
            */

            console.log(
                "🔄 Restaurando stock..."
            );


            await restaurarStock(
                actualizados
            );


            throw error;
        }


        return actualizados;
    }


    /* =====================================================
       CONFIRMAR COMPRA

       AQUÍ SE DESCUENTA EL STOCK
    ===================================================== */

    window.confirmarCompra =
        async function (
            pedidoId
        ) {

            const confirmar =
                window.confirm(
                    "¿Deseas confirmar esta compra?\n\n" +
                    "Al confirmar se descontará automáticamente " +
                    "el stock de los productos."
                );


            if (!confirmar) {
                return;
            }


            try {

                /* ==========================================
                   1. OBTENER PEDIDO
                ========================================== */

                const {
                    data: pedido,
                    error: errorPedido
                } =
                    await supabaseClient
                        .from("pedidos")
                        .select("*")
                        .eq(
                            "id",
                            pedidoId
                        )
                        .maybeSingle();


                if (errorPedido) {

                    console.error(
                        "❌ Error buscando pedido:",
                        errorPedido
                    );


                    alert(
                        "No se pudo obtener el pedido.\n\n" +
                        errorPedido.message
                    );


                    return;
                }


                if (!pedido) {

                    alert(
                        "El pedido no existe."
                    );


                    return;
                }


                /* ==========================================
                   2. EVITAR DOBLE DESCUENTO
                ========================================== */

                if (
                    String(
                        pedido.estado || ""
                    ).toLowerCase() ===
                    "confirmada"
                ) {

                    alert(
                        "Este pedido ya está confirmado.\n\n" +
                        "El stock no se volverá a descontar."
                    );


                    await cargarPedidos();


                    return;
                }


                /* ==========================================
                   3. VERIFICAR PRODUCTOS
                ========================================== */

                const productosPedido =
                    obtenerProductosPedido(
                        pedido
                    );


                if (
                    productosPedido.length === 0
                ) {

                    alert(
                        "No se puede confirmar este pedido porque no contiene productos."
                    );


                    return;
                }


                /* ==========================================
                   4. DESCONTAR STOCK
                ========================================== */

                let productosDescontados =
                    [];


                try {

                    productosDescontados =
                        await descontarStockPedido(
                            pedido
                        );

                } catch (errorStock) {

                    console.error(
                        "❌ No se pudo descontar stock:",
                        errorStock
                    );


                    alert(
                        "NO SE CONFIRMÓ LA COMPRA.\n\n" +
                        errorStock.message
                    );


                    return;
                }


                /* ==========================================
                   5. CONFIRMAR PEDIDO
                ========================================== */

                const {
                    error: errorConfirmar
                } =
                    await supabaseClient
                        .from("pedidos")
                        .update({

                            estado:
                                "confirmada",

                            confirmado_en:
                                new Date().toISOString()

                        })
                        .eq(
                            "id",
                            pedidoId
                        );


                if (errorConfirmar) {

                    console.error(
                        "❌ Error confirmando pedido:",
                        errorConfirmar
                    );


                    /*
                       RESTAURAR STOCK
                    */

                    console.log(
                        "🔄 Intentando devolver stock porque la confirmación falló..."
                    );


                    await restaurarStock(
                        productosDescontados
                    );


                    alert(
                        "No se pudo confirmar el pedido.\n\n" +
                        errorConfirmar.message +
                        "\n\n" +
                        "El stock fue restaurado."
                    );


                    return;
                }


                /* ==========================================
                   6. ÉXITO
                ========================================== */

                alert(
                    "COMPRA CONFIRMADA CORRECTAMENTE.\n\n" +
                    "El stock fue descontado automáticamente."
                );


                /* ==========================================
                   7. RECARGAR TODO
                ========================================== */

                await cargarStock();

                await cargarPedidos();

                await actualizarDashboard();

                await llenarSelectorAnios();


            } catch (error) {

                console.error(
                    "❌ Error inesperado confirmando compra:",
                    error
                );


                alert(
                    "Ocurrió un error al confirmar la compra.\n\n" +
                    error.message
                );
            }
        };


    /* =====================================================
       DAR PUNTOS

       REGLA:

       1 PUNTO POR CADA Q10.

       SIN LÍMITE.
    ===================================================== */

    window.darPuntos =
        async function (
            pedidoId
        ) {

            const confirmar =
                window.confirm(
                    "¿Deseas otorgar los puntos de esta compra?"
                );


            if (!confirmar) {
                return;
            }


            try {

                /* ==========================================
                   1. OBTENER PEDIDO
                ========================================== */

                const {
                    data: pedido,
                    error: errorPedido
                } =
                    await supabaseClient
                        .from("pedidos")
                        .select("*")
                        .eq(
                            "id",
                            pedidoId
                        )
                        .maybeSingle();


                if (errorPedido) {

                    console.error(
                        "❌ Error obteniendo pedido:",
                        errorPedido
                    );


                    alert(
                        "No se pudo obtener el pedido.\n\n" +
                        errorPedido.message
                    );


                    return;
                }


                if (!pedido) {

                    alert(
                        "El pedido no existe."
                    );


                    return;
                }


                /* ==========================================
                   2. VERIFICAR CONFIRMACIÓN
                ========================================== */

                if (
                    String(
                        pedido.estado || ""
                    ).toLowerCase() !==
                    "confirmada"
                ) {

                    alert(
                        "Primero debes confirmar la compra."
                    );


                    return;
                }


                /* ==========================================
                   3. EVITAR DOBLE PUNTUACIÓN
                ========================================== */

                if (
                    pedido.puntos_validados === true
                ) {

                    alert(
                        "Los puntos de este pedido ya fueron otorgados."
                    );


                    await cargarPedidos();


                    return;
                }


                /* ==========================================
                   4. CALCULAR PUNTOS
                ========================================== */

                const total =
                    obtenerTotalPedido(
                        pedido
                    );


                const puntos =
                    calcularPuntos(
                        total
                    );


                if (
                    puntos <= 0
                ) {

                    alert(
                        "Esta compra no genera puntos.\n\n" +
                        "La compra mínima para generar puntos es de Q10.00."
                    );


                    return;
                }


                /* ==========================================
                   5. OBTENER USUARIO
                ========================================== */

                const usuarioId =
                    pedido.usuario_id;


                if (!usuarioId) {

                    alert(
                        "Este pedido no tiene usuario_id."
                    );


                    console.error(
                        "Pedido sin usuario_id:",
                        pedido
                    );


                    return;
                }


                /* ==========================================
                   6. OBTENER PERFIL
                ========================================== */

                const {
                    data: perfil,
                    error: errorPerfil
                } =
                    await supabaseClient
                        .from("perfiles")
                        .select(
                            'id,"Puntos"'
                        )
                        .eq(
                            "id",
                            usuarioId
                        )
                        .maybeSingle();


                if (errorPerfil) {

                    console.error(
                        "❌ Error buscando perfil:",
                        errorPerfil
                    );


                    alert(
                        "No se pudo obtener el perfil del cliente.\n\n" +
                        errorPerfil.message
                    );


                    return;
                }


                if (!perfil) {

                    alert(
                        "No existe un perfil para este usuario."
                    );


                    return;
                }


                /* ==========================================
                   7. PUNTOS ACTUALES
                ========================================== */

                const puntosActuales =
                    Number(
                        perfil["Puntos"]
                    ) || 0;


                const nuevosPuntos =
                    puntosActuales +
                    puntos;


                /* ==========================================
                   8. ACTUALIZAR PUNTOS
                ========================================== */

                const {
                    error: errorActualizarPerfil
                } =
                    await supabaseClient
                        .from("perfiles")
                        .update({

                            "Puntos":
                                nuevosPuntos

                        })
                        .eq(
                            "id",
                            usuarioId
                        );


                if (
                    errorActualizarPerfil
                ) {

                    console.error(
                        "❌ Error actualizando puntos:",
                        errorActualizarPerfil
                    );


                    alert(
                        "No se pudieron agregar los puntos.\n\n" +
                        errorActualizarPerfil.message
                    );


                    return;
                }


                /* ==========================================
                   9. MARCAR PEDIDO COMO VALIDADO
                ========================================== */

                const {
                    error: errorValidarPedido
                } =
                    await supabaseClient
                        .from("pedidos")
                        .update({

                            puntos_generados:
                                puntos,

                            puntos_validados:
                                true,

                            puntos_validados_en:
                                new Date().toISOString()

                        })
                        .eq(
                            "id",
                            pedidoId
                        );


                if (
                    errorValidarPedido
                ) {

                    console.error(
                        "❌ Error marcando puntos:",
                        errorValidarPedido
                    );


                    /*
                       IMPORTANTE:

                       Intentamos devolver los puntos
                       si el pedido no pudo marcarse
                       como validado.
                    */

                    const {
                        error: errorReversion
                    } =
                        await supabaseClient
                            .from("perfiles")
                            .update({

                                "Puntos":
                                    puntosActuales

                            })
                            .eq(
                                "id",
                                usuarioId
                            );


                    if (errorReversion) {

                        console.error(
                            "❌ ERROR CRÍTICO: no se pudieron revertir los puntos:",
                            errorReversion
                        );


                        alert(
                            "Los puntos fueron agregados, pero ocurrió un error al marcar el pedido.\n\n" +
                            "NO vuelvas a pulsar 'Dar puntos' hasta revisar el pedido."
                        );

                    } else {

                        alert(
                            "No se pudo validar el pedido.\n\n" +
                            "Los puntos fueron restaurados y no se otorgaron."
                        );
                    }


                    return;
                }


                /* ==========================================
                   10. ÉXITO
                ========================================== */

                alert(
                    "PUNTOS OTORGADOS CORRECTAMENTE.\n\n" +
                    "Puntos agregados: " +
                    puntos +
                    "\n" +
                    "Puntos actuales: " +
                    nuevosPuntos
                );


                await cargarPedidos();


            } catch (error) {

                console.error(
                    "❌ Error inesperado dando puntos:",
                    error
                );


                alert(
                    "Ocurrió un error al otorgar los puntos.\n\n" +
                    error.message
                );
            }
        };


    /* =====================================================
       CAMBIO DE AÑO
    ===================================================== */

    document.addEventListener(
        "añoDashboardCambiado",
        async function (evento) {

            try {

                const ano =
                    Number(
                        evento?.detail?.año
                    );


                if (
                    !Number.isInteger(ano) ||
                    ano < 1900
                ) {

                    console.warn(
                        "⚠️ Año recibido no válido:",
                        evento?.detail?.año
                    );


                    return;
                }


                console.log(
                    "📅 Año seleccionado:",
                    ano
                );


                /* =========================================
                   GUARDAR AÑO
                ========================================= */

                localStorage.setItem(
                    ANO_KEY,
                    String(
                        ano
                    )
                );


                /* =========================================
                   ACTUALIZAR TEXTO
                ========================================= */

                const anoTexto =
                    document.getElementById(
                        "añoActual"
                    );


                if (anoTexto) {

                    anoTexto.textContent =
                        ano;
                }


                /* =========================================
                   ACTUALIZAR DASHBOARD
                ========================================= */

                await actualizarDashboard();


                /* =========================================
                   ACTUALIZAR EGRESOS
                ========================================= */

                mostrarEgresos();


                /* =========================================
                   ACTUALIZAR INGRESOS
                ========================================= */

                await cargarIngresos();


                /* =========================================
                   ACTUALIZAR VENTAS
                ========================================= */

                await cargarVentas();


                /* =========================================
                   ACTUALIZAR PEDIDOS
                ========================================= */

                await cargarPedidos();


                /* =========================================
                   ACTUALIZAR STOCK
                ========================================= */

                await cargarStock();


                /* =========================================
                   AVISAR OTROS SCRIPTS
                ========================================= */

                window.dispatchEvent(
                    new CustomEvent(
                        "dlLuxuryAñoCambiado",
                        {
                            detail: {
                                año: ano
                            }
                        }
                    )
                );


                console.log(
                    "✅ DL Luxury actualizado completamente para:",
                    ano
                );


            } catch (error) {

                console.error(
                    "❌ Error actualizando Dashboard por cambio de año:",
                    error
                );
            }

        }
    );


    /* =====================================================
       CERRAR MODAL EGRESO
    ===================================================== */

    const modalEgreso =
        document.getElementById(
            "modalEgreso"
        );


    if (modalEgreso) {

        modalEgreso.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target !==
                    modalEgreso
                ) {

                    return;
                }


                window.cerrarModalEgreso();
            }
        );
    }


    /* =====================================================
       INICIALIZACIÓN
    ===================================================== */

    async function iniciarDashboard() {

        console.log(
            "DL Luxury - iniciando dashboard..."
        );


        await llenarSelectorAnios();


        await cargarStock();


        await actualizarDashboard();


        await cargarVentas();


        await cargarIngresos();


        mostrarEgresos();


        await cargarPedidos();


        console.log(
            "DL Luxury - dashboard cargado correctamente."
        );
    }


    iniciarDashboard();


    /* =====================================================
       EXPONER FUNCIONES
    ===================================================== */

    window.cargarStock =
        cargarStock;


    window.cargarVentas =
        cargarVentas;


    window.cargarIngresos =
        cargarIngresos;


    window.mostrarEgresos =
        mostrarEgresos;


    window.actualizarDashboard =
        actualizarDashboard;


    window.llenarSelectorAnios =
        llenarSelectorAnios;


    window.obtenerPedidosConfirmados =
        obtenerPedidosConfirmados;


    window.cargarPedidos =
        cargarPedidos;


    window.obtenerProductosPedido =
        obtenerProductosPedido;


    window.obtenerCantidadProductosPedido =
        obtenerCantidadProductosPedido;


    window.obtenerTotalPedido =
        obtenerTotalPedido;


    window.obtenerAnoSeleccionado =
        obtenerAnoSeleccionado;


    window.calcularPuntos =
        calcularPuntos;


    /* =====================================================
       EXPONER FUNCIONES DE STOCK
    ===================================================== */

    window.descontarStockPedido =
        descontarStockPedido;


    window.prepararProductosParaStock =
        prepararProductosParaStock;


    console.log(
        "✅ admin.js cargado correctamente."
    );

});
