
/* =========================================================
   DL LUXURY
   SISTEMA DE ADMINISTRACIÓN
   SCRIPT PRINCIPAL

   FUNCIONES:

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
   - Datos económicos

   PUNTOS:

   Q10   = 1 punto
   Q20   = 2 puntos
   Q50   = 5 puntos
   Q100  = 10 puntos
   Q500  = 50 puntos
   Q1000 = 100 puntos

   FÓRMULA:

   Math.floor(total / 10)

   SIN LÍMITE

   IMPORTANTE:

   Los puntos NO se guardan en perfiles.

   Los puntos se guardan en:

   pedidos.puntos_generados
   pedidos.puntos_validados
   pedidos.puntos_validados_en

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
       PUNTOS

       1 PUNTO POR CADA Q10

       Q1-Q9     = 0
       Q10-Q19   = 1
       Q20-Q29   = 2
       Q50-Q59   = 5
       Q100      = 10
       Q500      = 50

       SIN LÍMITE
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


    function guardarDatos(
        clave,
        datos
    ) {

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


    function guardarVentas(
        ventas
    ) {

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


    function guardarEgresos(
        egresos
    ) {

        return guardarDatos(
            EGRESOS_KEY,
            egresos
        );
    }


    /* =====================================================
       PEDIDOS
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
                "❌ Error inesperado:",
                error
            );

            return [];
        }
    }


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
                    error
                };
            }

            return {
                data: data || [],
                error: null
            };

        } catch (error) {

            console.error(
                "❌ Error inesperado:",
                error
            );

            return {
                data: [],
                error
            };
        }
    }


    /* =====================================================
       PRODUCTOS DEL PEDIDO
    ===================================================== */

    function obtenerProductosPedido(
        pedido
    ) {

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
                typeof pedido?.productos ===
                "string"
            ) {

                productos =
                    JSON.parse(
                        pedido.productos
                    );

            } else if (
                pedido?.productos &&
                typeof pedido.productos ===
                "object"
            ) {

                productos = [
                    pedido.productos
                ];
            }

        } catch (error) {

            console.error(
                "❌ Error leyendo productos:",
                error
            );

            productos = [];
        }

        return Array.isArray(productos)
            ? productos
            : [];
    }


    function obtenerIdProductoPedido(
        producto
    ) {

        return (
            producto?.producto_id ??
            producto?.id_producto ??
            producto?.product_id ??
            producto?.id ??
            null
        );
    }


    function obtenerNombreProductoPedido(
        producto
    ) {

        return (
            producto?.nombre ||
            producto?.name ||
            producto?.producto ||
            producto?.product_name ||
            ""
        );
    }


    function obtenerCantidadProducto(
        producto
    ) {

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

        return Math.floor(
            cantidad
        );
    }


    function obtenerCantidadProductosPedido(
        pedido
    ) {

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


    function obtenerTotalPedido(
        pedido
    ) {

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
                    precio *
                    cantidad;
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


            if (paginas[id]) {

                window.location.href =
                    paginas[id];

                return;
            }


            document
                .querySelectorAll(
                    ".seccion"
                )
                .forEach(
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


            document
                .querySelectorAll(
                    ".menu"
                )
                .forEach(
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
            }


            if (
                id === "ingresos"
            ) {

                cargarIngresos();
            }


            if (
                id === "ventas"
            ) {

                actualizarDashboard();
            }


            if (
                id === "egresos"
            ) {

                mostrarEgresos();
            }


            if (
                id === "stock"
            ) {

                cargarStock();
            }


            if (
                id === "pedidos"
            ) {

                cargarPedidos();
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

                    descripcion,

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
       EGRESOS
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

                    <h3>No hay egresos</h3>

                    <p>
                        No hay egresos registrados
                        para ${añoSeleccionado}.
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
       STOCK
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


            if (
                totalProductosElemento
            ) {

                totalProductosElemento.textContent =
                    productos.length;
            }


            if (
                stockTotalElemento
            ) {

                stockTotalElemento.textContent =
                    stockTotal;
            }


            if (
                stockBajoElemento
            ) {

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


    function obtenerNombreCategoria(
        categoriaId
    ) {

        const categorias = {

            2: "Playeras",
            3: "Gorras",
            4: "Hoodies",
            5: "Perfumes",
            6: "Accesorios"

        };


        return escaparHTML(
            categorias[categoriaId] ||
            "Sin categoría"
        );
    }


    /* =====================================================
       AÑO
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
       VENTAS
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


        cargarTablaVentasAno(
            pedidosAño
        );
    }


    /* =====================================================
       INGRESOS
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


        if (
            elementoIngresos
        ) {

            elementoIngresos.textContent =
                dinero(
                    totalIngresos
                );
        }


        if (
            cantidadElemento
        ) {

            cantidadElemento.textContent =
                cantidadIngresos;
        }


        if (
            gananciaElemento
        ) {

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


        if (
            elementoVentas
        ) {

            elementoVentas.textContent =
                dinero(
                    totalVentas
                );
        }


        if (
            elementoIngresos
        ) {

            elementoIngresos.textContent =
                dinero(
                    totalVentas
                );
        }


        if (
            elementoEgresos
        ) {

            elementoEgresos.textContent =
                dinero(
                    totalEgresos
                );
        }


        if (
            elementoGanancia
        ) {

            elementoGanancia.textContent =
                dinero(
                    ganancia
                );
        }


        if (
            elementoProductos
        ) {

            elementoProductos.textContent =
                productosVendidos;
        }


        await cargarStock();


        cargarTablaVentasAno(
            pedidosAño
        );


        await cargarIngresos();
    }


    /* =====================================================
       TABLA DE VENTAS
    ===================================================== */

    function cargarTablaVentasAno(
        pedidos
    ) {

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
    ===================================================== */

    async function llenarSelectorAnios() {

        const selector =
            document.getElementById(
                "selectorAño"
            );


        if (!selector) {
            return;
        }


        const anoInicial = 2026;

        const cantidadAnios = 42;

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
                    String(ano);


                opcion.textContent =
                    String(ano);


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
            Number.isInteger(
                guardado
            ) &&
            anos.includes(
                guardado
            )
        ) {

            anoSeleccionado =
                guardado;

        } else {

            const anoActual =
                new Date()
                    .getFullYear();


            anoSeleccionado =
                anos.includes(
                    anoActual
                )
                    ? anoActual
                    : anoInicial;
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


            if (
                resultado.error
            ) {

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

                            if (
                                !pedido.creado_en
                            ) {
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
                pedido.puntos_generados ?? 0
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
                                    margin:5px 0;
                                    color:#ccc;
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
           ID SEGURO

           IMPORTANTE:

           NO usar Number(pedido.id)

           porque puede ser UUID.
        ================================================= */

        const pedidoIdSeguro =
            encodeURIComponent(
                String(
                    pedido.id
                )
            );


        /* =================================================
           BOTÓN CONFIRMAR
        ================================================= */

        let botonConfirmar =
            "";


        if (!confirmado) {

            botonConfirmar = `
                <button
                    type="button"
                    onclick="confirmarCompra(decodeURIComponent('${pedidoIdSeguro}'))"
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

        } else if (
            puntosValidados
        ) {

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
                        onclick="darPuntos(decodeURIComponent('${pedidoIdSeguro}'))"
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
                        ${
                            puntosCalculados === 1
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
           TARJETA
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


                ${
                    correoCliente
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

                    ${
                        pedido.creado_en
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

    function prepararProductosParaStock(
        pedido
    ) {

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


                const clave =
                    id !== null &&
                    id !== undefined &&
                    id !== ""
                        ? "id:" +
                          String(id)
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
                            id,
                            nombre,
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
       BUSCAR PRODUCTO PARA STOCK
    ===================================================== */

    async function buscarProductoParaStock(
        productoPedido
    ) {

        const id =
            productoPedido.id;


        const nombre =
            productoPedido.nombre;


        /* ==========================================
           BUSCAR POR ID
        ========================================== */

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


        /* ==========================================
           BUSCAR POR NOMBRE
        ========================================== */

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
                        String(
                            nombre
                        ).trim()
                    )
                    .limit(1);


            if (error) {

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
            !Array.isArray(
                productos
            )
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
       DESCONTAR STOCK DEL PEDIDO
    ===================================================== */

    async function descontarStockPedido(
        pedido
    ) {

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


        const productosEncontrados =
            [];


        /* ==========================================
           VERIFICAR TODO ANTES DE MODIFICAR
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
           ACTUALIZAR STOCK
        ========================================== */

        const actualizados =
            [];


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

                    throw new Error(
                        "No se pudo actualizar el stock de " +
                        producto.nombre +
                        ".\n\n" +
                        error.message
                    );
                }


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
                   OBTENER PEDIDO
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
                   EVITAR DOBLE DESCUENTO
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


                let productosDescontados =
                    [];


                /* ==========================================
                   DESCONTAR STOCK
                ========================================== */

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
                   CONFIRMAR PEDIDO
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


                alert(
                    "COMPRA CONFIRMADA CORRECTAMENTE.\n\n" +
                    "El stock fue descontado automáticamente."
                );


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

       SISTEMA ACTUAL

       NO USA:

       perfiles.Puntos

       NO CREA:

       perfiles

       SOLO ACTUALIZA:

       pedidos.puntos_generados
       pedidos.puntos_validados
       pedidos.puntos_validados_en
    ===================================================== */

    window.darPuntos =
        async function (
            pedidoId
        ) {

            if (!pedidoId) {

                alert(
                    "No se recibió el ID del pedido."
                );

                return;
            }


            const confirmar =
                window.confirm(
                    "¿Deseas otorgar los puntos de esta compra?"
                );


            if (!confirmar) {
                return;
            }


            try {

                console.log(
                    "===================================="
                );

                console.log(
                    "⭐ GENERANDO PUNTOS"
                );

                console.log(
                    "Pedido:",
                    pedidoId
                );

                console.log(
                    "===================================="
                );


                /* ==========================================
                   1. OBTENER PEDIDO
                ========================================== */

                const {
                    data: pedido,
                    error: errorPedido
                } =
                    await supabaseClient
                        .from("pedidos")
                        .select(`
                            id,
                            usuario_id,
                            total,
                            estado,
                            puntos_generados,
                            puntos_validados,
                            puntos_validados_en
                        `)
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

                const estado =
                    String(
                        pedido.estado || ""
                    ).toLowerCase();


                if (
                    estado !==
                    "confirmada"
                ) {

                    alert(
                        "Primero debes confirmar la compra."
                    );


                    return;
                }


                /* ==========================================
                   3. EVITAR DUPLICADOS
                ========================================== */

                if (
                    pedido.puntos_validados ===
                    true
                ) {

                    const puntosYaGenerados =
                        Number(
                            pedido.puntos_generados ||
                            0
                        );


                    alert(
                        "Los puntos de este pedido ya fueron otorgados.\n\n" +
                        "Puntos: " +
                        puntosYaGenerados
                    );


                    await cargarPedidos();


                    return;
                }


                /* ==========================================
                   4. CALCULAR TOTAL
                ========================================== */

                const total =
                    obtenerTotalPedido(
                        pedido
                    );


                const puntos =
                    calcularPuntos(
                        total
                    );


                console.log(
                    "💰 Total:",
                    total
                );


                console.log(
                    "⭐ Puntos:",
                    puntos
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
                   5. VERIFICAR USUARIO

                   Solo comprobamos que exista el
                   usuario_id del pedido.

                   NO consultamos perfiles.
                   NO consultamos usuarios.
                ========================================== */

                if (
                    !pedido.usuario_id
                ) {

                    console.warn(
                        "⚠️ Pedido sin usuario_id:",
                        pedido.id
                    );

                    alert(
                        "Este pedido no tiene usuario_id.\n\n" +
                        "No se pueden validar los puntos de este pedido."
                    );


                    return;
                }


                /* ==========================================
                   6. GUARDAR PUNTOS DIRECTAMENTE
                      EN EL PEDIDO
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
                        "❌ Error guardando puntos:",
                        errorValidarPedido
                    );


                    console.error(
                        "Detalles:",
                        {
                            message:
                                errorValidarPedido.message,

                            details:
                                errorValidarPedido.details,

                            hint:
                                errorValidarPedido.hint,

                            code:
                                errorValidarPedido.code
                        }
                    );


                    alert(
                        "No se pudieron registrar los puntos.\n\n" +
                        errorValidarPedido.message
                    );


                    return;
                }


                /* ==========================================
                   7. ÉXITO
                ========================================== */

                console.log(
                    "✅ Puntos guardados correctamente."
                );


                console.log(
                    "Pedido:",
                    pedidoId
                );


                console.log(
                    "Total:",
                    total
                );


                console.log(
                    "Puntos:",
                    puntos
                );


                alert(
                    "PUNTOS OTORGADOS CORRECTAMENTE.\n\n" +
                    "Compra: " +
                    dinero(total) +
                    "\n" +
                    "Puntos generados: " +
                    puntos
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
                        "⚠️ Año inválido:",
                        evento?.detail?.año
                    );


                    return;
                }


                localStorage.setItem(
                    ANO_KEY,
                    String(ano)
                );


                const anoTexto =
                    document.getElementById(
                        "añoActual"
                    );


                if (anoTexto) {

                    anoTexto.textContent =
                        ano;
                }


                await actualizarDashboard();

                mostrarEgresos();

                await cargarIngresos();

                await cargarVentas();

                await cargarPedidos();

                await cargarStock();


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


            } catch (error) {

                console.error(
                    "❌ Error actualizando año:",
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


    window.descontarStockPedido =
        descontarStockPedido;


    window.prepararProductosParaStock =
        prepararProductosParaStock;


    console.log(
        "✅ admin.js cargado correctamente."
    );

});

