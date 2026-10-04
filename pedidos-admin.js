
/* =========================================================
   DL LUXURY
   PEDIDOS-ADMIN.JS
   =========================================================

   ADMINISTRACIÓN DE PEDIDOS

   FUNCIONES:

   - Cargar pedidos
   - Mostrar cliente
   - Mostrar productos
   - Mostrar total
   - Confirmar compra
   - Generar puntos manualmente
   - Evitar puntos duplicados

   =========================================================
   SISTEMA DE PUNTOS
   =========================================================

   Q1   - Q10      = 1 punto
   Q11  - Q20      = 2 puntos
   Q21  - Q30      = 3 puntos
   Q91  - Q100     = 10 puntos
   Q191 - Q200     = 20 puntos
   Q491 - Q500     = 50 puntos
   Q991 - Q1000    = 100 puntos

   REGLA:

   1 PUNTO POR CADA Q10 DE COMPRA

   NO EXISTE LÍMITE MÁXIMO.

   =========================================================
   IMPORTANTE
   =========================================================

   Los puntos se manejan ÚNICAMENTE
   desde la tabla "pedidos".

   NO se utiliza la tabla "perfiles".

========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_PEDIDOS_ADMIN_URL =
    "https://brnyvkqwkosgtpugxcge.supabase.co";

const SUPABASE_PEDIDOS_ADMIN_KEY =
    "sb_publishable_Qdae9GUtmuosAPP4kemF3A_Vr4HFo0n";

const supabasePedidosAdmin =
    window.supabase.createClient(
        SUPABASE_PEDIDOS_ADMIN_URL,
        SUPABASE_PEDIDOS_ADMIN_KEY
    );


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTMLPedidos(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escaparHTML(valor) {

    return escaparHTMLPedidos(valor);
}


/* =========================================================
   DINERO
========================================================= */

function dineroPedido(valor) {

    const numero = Number(valor) || 0;

    return numero.toLocaleString(
        "es-GT",
        {
            style: "currency",
            currency: "GTQ",
            minimumFractionDigits: 2
        }
    );
}


/* =========================================================
   FECHA
========================================================= */

function formatearFechaPedido(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return "Sin fecha";
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


/* =========================================================
   HORA
========================================================= */

function formatearHoraPedido(fecha) {

    if (!fecha) {
        return "";
    }

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
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


/* =========================================================
   AÑO SELECCIONADO
========================================================= */

function obtenerAñoSeleccionadoPedidos() {

    const selector =
        document.getElementById("selectorAño");

    if (!selector) {
        return new Date().getFullYear();
    }

    const valor =
        Number(selector.value);

    return valor || new Date().getFullYear();
}


/* =========================================================
   OBTENER PRODUCTOS
========================================================= */

function obtenerProductosPedidoAdmin(pedido) {

    if (!pedido) {
        return [];
    }

    let productos = pedido.productos;

    if (!productos) {
        return [];
    }

    /* =====================================================
       SI VIENE COMO TEXTO JSON
    ===================================================== */

    if (typeof productos === "string") {

        try {

            productos = JSON.parse(productos);

        } catch (error) {

            console.warn(
                "No se pudo convertir productos:",
                error
            );

            return [];
        }
    }

    /* =====================================================
       SI VIENE COMO OBJETO
    ===================================================== */

    if (!Array.isArray(productos)) {

        if (typeof productos === "object") {
            return [productos];
        }

        return [];
    }

    return productos;
}


/* =========================================================
   CANTIDAD TOTAL
========================================================= */

function obtenerCantidadPedidoAdmin(pedido) {

    const productos =
        obtenerProductosPedidoAdmin(pedido);

    if (!productos.length) {
        return 0;
    }

    return productos.reduce(
        (total, producto) => {

            const cantidad =
                Number(
                    producto?.cantidad ??
                    producto?.qty ??
                    producto?.quantity ??
                    1
                ) || 1;

            return total + cantidad;

        },
        0
    );
}


/* =========================================================
   TOTAL DEL PEDIDO
========================================================= */

function obtenerTotalPedidoAdmin(pedido) {

    if (!pedido) {
        return 0;
    }

    const posiblesValores = [

        pedido.total,

        pedido.total_pedido,

        pedido.monto_total,

        pedido.precio_total

    ];

    for (const valor of posiblesValores) {

        const numero = Number(valor);

        if (Number.isFinite(numero)) {
            return numero;
        }
    }

    return 0;
}


/* =========================================================
   CALCULAR PUNTOS
=========================================================

   REGLA:

   1 PUNTO POR CADA Q10

   Math.ceil(total / 10)

   NO HAY LÍMITE MÁXIMO.

========================================================= */

function calcularPuntosPedidoAdmin(total) {

    const valor =
        Number(total) || 0;

    if (valor <= 0) {
        return 0;
    }

    return Math.ceil(valor / 10);
}


/* =========================================================
   OBTENER ID DEL USUARIO
========================================================= */

function obtenerUsuarioIdPedido(pedido) {

    const usuario =
        pedido?.usuario;

    const cliente =
        pedido?.cliente;

    return (

        pedido?.usuario_id ||

        pedido?.user_id ||

        pedido?.cliente_id ||

        (
            typeof usuario === "object"
                ? usuario?.id
                : usuario
        ) ||

        (
            typeof cliente === "object"
                ? cliente?.id
                : cliente
        ) ||

        null

    );
}


/* =========================================================
   OBTENER NOMBRE
========================================================= */

function obtenerNombreClientePedido(pedido) {

    return (

        pedido?.cliente_nombre ||

        pedido?.nombre_cliente ||

        (
            typeof pedido?.cliente === "object"
                ? pedido?.cliente?.nombre
                : pedido?.cliente
        ) ||

        pedido?.nombre ||

        pedido?.usuario_nombre ||

        "Cliente"

    );
}


/* =========================================================
   OBTENER CORREO
========================================================= */

function obtenerCorreoClientePedido(pedido) {

    return (

        pedido?.cliente_correo ||

        pedido?.correo ||

        pedido?.email ||

        pedido?.correo_cliente ||

        (
            typeof pedido?.cliente === "object"
                ? pedido?.cliente?.email
                : ""
        ) ||

        ""

    );
}


/* =========================================================
   CARGAR PEDIDOS
========================================================= */

async function cargarPedidosAdministracion() {

    const contenedor =
        document.getElementById("listaPedidos");

    if (!contenedor) {

        console.warn(
            "No se encontró #listaPedidos"
        );

        return;
    }

    /* =====================================================
       CARGANDO
    ===================================================== */

    contenedor.innerHTML = `
        <div class="sin-tickets">
            Cargando pedidos...
        </div>
    `;

    try {

        const año =
            obtenerAñoSeleccionadoPedidos();

        const inicio =
            `${año}-01-01T00:00:00.000Z`;

        const fin =
            `${año + 1}-01-01T00:00:00.000Z`;

        /* =================================================
           CONSULTAR PEDIDOS
        ================================================= */

        const {
            data,
            error
        } =
            await supabasePedidosAdmin
                .from("pedidos")
                .select("*")
                .gte("creado_en", inicio)
                .lt("creado_en", fin)
                .order(
                    "creado_en",
                    {
                        ascending: false
                    }
                );

        /* =================================================
           ERROR
        ================================================= */

        if (error) {

            console.error(
                "Error cargando pedidos:",
                error
            );

            contenedor.innerHTML = `
                <div class="sin-tickets">
                    Error al cargar los pedidos.
                    <br><br>
                    ${escaparHTMLPedidos(error.message)}
                </div>
            `;

            return;
        }

        /* =================================================
           SIN PEDIDOS
        ================================================= */

        if (!data || !data.length) {

            contenedor.innerHTML = `
                <div class="sin-tickets">
                    No hay pedidos para ${año}.
                </div>
            `;

            return;
        }

        /* =================================================
           MOSTRAR PEDIDOS
        ================================================= */

        contenedor.innerHTML =
            data
                .map(crearTarjetaPedidoAdmin)
                .join("");

    } catch (error) {

        console.error(
            "Error inesperado cargando pedidos:",
            error
        );

        contenedor.innerHTML = `
            <div class="sin-tickets">
                Ocurrió un error al cargar los pedidos.
                <br><br>
                ${escaparHTMLPedidos(
            error?.message ||
            "Error desconocido"
        )}
            </div>
        `;
    }
}


/* =========================================================
   CREAR TARJETA DEL PEDIDO
========================================================= */

function crearTarjetaPedidoAdmin(pedido) {

    const id =
        pedido?.id ?? "";

    const nombre =
        obtenerNombreClientePedido(pedido);

    const correo =
        obtenerCorreoClientePedido(pedido);

    const fecha =
        formatearFechaPedido(
            pedido?.creado_en
        );

    const hora =
        formatearHoraPedido(
            pedido?.creado_en
        );

    const productos =
        obtenerProductosPedidoAdmin(pedido);

    const cantidad =
        obtenerCantidadPedidoAdmin(pedido);

    const total =
        obtenerTotalPedidoAdmin(pedido);

    const puntos =
        calcularPuntosPedidoAdmin(total);

    const estado =
        String(
            pedido?.estado ||
            "pendiente"
        ).toLowerCase();

    const confirmada =
        estado === "confirmada";

    const puntosValidados =
        pedido?.puntos_validados === true;


    /* =====================================================
       PRODUCTOS
    ===================================================== */

    let productosHTML = "";

    if (productos.length) {

        productosHTML =
            productos
                .map(producto => {

                    const nombreProducto =
                        producto?.nombre ||
                        producto?.producto ||
                        producto?.name ||
                        "Producto";

                    const cantidadProducto =
                        Number(
                            producto?.cantidad ??
                            producto?.qty ??
                            producto?.quantity ??
                            1
                        ) || 1;

                    return `
                        <div>
                            ${escaparHTMLPedidos(nombreProducto)}
                            × ${cantidadProducto}
                        </div>
                    `;

                })
                .join("");

    } else {

        productosHTML = `
            <div>
                Sin productos registrados
            </div>
        `;
    }


    /* =====================================================
       BOTONES
    ===================================================== */

    let botonCompra = "";
    let botonPuntos = "";


    /* =====================================================
       BOTÓN CONFIRMAR COMPRA
    ===================================================== */

    if (!confirmada) {

        botonCompra = `
            <button
                type="button"
                class="btn-principal"
                onclick="confirmarCompraPedido('${escaparHTMLPedidos(id)}')"
            >
                <i class="fa-solid fa-check"></i>
                Confirmar compra
            </button>
        `;

    } else {

        botonCompra = `
            <button
                type="button"
                class="btn-principal"
                disabled
            >
                <i class="fa-solid fa-check"></i>
                Compra confirmada
            </button>
        `;
    }


    /* =====================================================
       BOTÓN DE PUNTOS
    ===================================================== */

    if (!confirmada) {

        botonPuntos = `
            <button
                type="button"
                class="btn-secundario"
                disabled
            >
                <i class="fa-solid fa-star"></i>
                Confirma la compra primero
            </button>
        `;

    } else if (puntosValidados) {

        const puntosOtorgados =
            Number(
                pedido?.puntos_generados
            ) || puntos;

        botonPuntos = `
            <button
                type="button"
                class="btn-secundario"
                disabled
            >
                <i class="fa-solid fa-star"></i>
                Puntos otorgados:
                ${puntosOtorgados}
            </button>
        `;

    } else if (puntos <= 0) {

        botonPuntos = `
            <button
                type="button"
                class="btn-secundario"
                disabled
            >
                <i class="fa-solid fa-star"></i>
                Sin puntos
            </button>
        `;

    } else {

        botonPuntos = `
            <button
                type="button"
                class="btn-principal"
                onclick="darPuntosPedido('${escaparHTMLPedidos(id)}')"
            >
                <i class="fa-solid fa-star"></i>
                Dar ${puntos} puntos
            </button>
        `;
    }


    /* =====================================================
       TEXTO DE PUNTOS
    ===================================================== */

    const textoPuntos =
        puntos === 1
            ? "punto disponible"
            : "puntos disponibles";


    /* =====================================================
       TARJETA COMPLETA
    ===================================================== */

    return `
        <div
            class="producto-card"
            data-pedido-id="${escaparHTMLPedidos(id)}"
        >

            <div class="producto-card-cabecera">

                <div>

                    <strong>
                        Pedido #${escaparHTMLPedidos(id)}
                    </strong>

                    <span>
                        ${fecha}

                        ${hora
            ? ` · ${hora}`
            : ""
        }
                    </span>

                </div>

                <span
                    class="badge-estado ${escaparHTMLPedidos(estado)}"
                >
                    ${escaparHTMLPedidos(estado)}
                </span>

            </div>


            <div class="producto-card-usuario">

                <strong>
                    ${escaparHTMLPedidos(nombre)}
                </strong>

                ${correo
            ? `
                            <small>
                                ${escaparHTMLPedidos(correo)}
                            </small>
                        `
            : ""
        }

            </div>


            <div class="producto-card-descripcion">

                ${productosHTML}

            </div>


            <div class="producto-card-pie">

                <div>

                    <strong>
                        ${cantidad}
                    </strong>

                    producto(s)

                </div>


                <div>

                    <strong>
                        ${dineroPedido(total)}
                    </strong>

                    total

                </div>


                <div>

                    <strong>
                        ${puntos}
                    </strong>

                    ${textoPuntos}

                </div>

            </div>


            <div
                class="modal-acciones"
                style="margin-top:15px;"
            >

                ${botonCompra}

                ${botonPuntos}

            </div>

        </div>
    `;
}


/* =========================================================
   CONFIRMAR COMPRA
========================================================= */

window.confirmarCompraPedido =
    async function (pedidoId) {

        if (!pedidoId) {
            return;
        }

        const confirmar =
            window.confirm(
                "¿Confirmar esta compra?"
            );

        if (!confirmar) {
            return;
        }

        try {

            /* =============================================
               BUSCAR PEDIDO
            ============================================= */

            const {
                data: pedido,
                error: errorPedido
            } =
                await supabasePedidosAdmin
                    .from("pedidos")
                    .select("*")
                    .eq("id", pedidoId)
                    .maybeSingle();

            if (errorPedido) {

                console.error(
                    "Error obteniendo pedido:",
                    errorPedido
                );

                alert(
                    "No se pudo obtener el pedido:\n\n" +
                    errorPedido.message
                );

                return;
            }

            if (!pedido) {

                alert(
                    "No se encontró el pedido."
                );

                return;
            }


            /* =============================================
               COMPROBAR SI YA ESTÁ CONFIRMADO
            ============================================= */

            const estadoActual =
                String(
                    pedido.estado || ""
                ).toLowerCase();

            if (estadoActual === "confirmada") {

                alert(
                    "Esta compra ya está confirmada."
                );

                await cargarPedidosAdministracion();

                return;
            }


            /* =============================================
               CONFIRMAR
            ============================================= */

            const {
                error
            } =
                await supabasePedidosAdmin
                    .from("pedidos")
                    .update({
                        estado: "confirmada",
                        confirmado_en:
                            new Date().toISOString()
                    })
                    .eq("id", pedidoId);

            if (error) {

                console.error(
                    "Error confirmando compra:",
                    error
                );

                alert(
                    "No se pudo confirmar la compra:\n\n" +
                    error.message
                );

                return;
            }


            alert(
                "Compra confirmada correctamente."
            );

            await cargarPedidosAdministracion();

        } catch (error) {

            console.error(
                "Error confirmando compra:",
                error
            );

            alert(
                "Ocurrió un error:\n\n" +
                (
                    error?.message ||
                    "Error desconocido"
                )
            );
        }
    };


/* =========================================================
   DAR PUNTOS
========================================================= */

window.darPuntosPedido =
    async function (pedidoId) {

        if (!pedidoId) {
            return;
        }

        const confirmar =
            window.confirm(
                "¿Deseas otorgar los puntos de este pedido?"
            );

        if (!confirmar) {
            return;
        }

        try {

            /* =============================================
               1. OBTENER PEDIDO
            ============================================= */

            const {
                data: pedido,
                error: errorPedido
            } =
                await supabasePedidosAdmin
                    .from("pedidos")
                    .select("*")
                    .eq("id", pedidoId)
                    .maybeSingle();

            if (errorPedido) {

                console.error(
                    "Error obteniendo pedido:",
                    errorPedido
                );

                alert(
                    "No se pudo obtener el pedido:\n\n" +
                    errorPedido.message
                );

                return;
            }

            if (!pedido) {

                alert(
                    "No se encontró el pedido."
                );

                return;
            }


            /* =============================================
               2. VERIFICAR COMPRA CONFIRMADA
            ============================================= */

            const estado =
                String(
                    pedido.estado || ""
                ).toLowerCase();

            if (estado !== "confirmada") {

                alert(
                    "Primero debes confirmar la compra."
                );

                return;
            }


            /* =============================================
               3. EVITAR DUPLICADOS
            ============================================= */

            if (
                pedido.puntos_validados === true
            ) {

                alert(
                    "Los puntos de este pedido ya fueron otorgados."
                );

                await cargarPedidosAdministracion();

                return;
            }


            /* =============================================
               4. OBTENER TOTAL
            ============================================= */

            const total =
                obtenerTotalPedidoAdmin(pedido);


            /* =============================================
               5. CALCULAR PUNTOS
            ============================================= */

            const puntos =
                calcularPuntosPedidoAdmin(total);

            if (puntos <= 0) {

                alert(
                    "El pedido no tiene un total válido para generar puntos."
                );

                return;
            }


            /* =============================================
               6. INFORMACIÓN
            ============================================= */

            const usuarioId =
                obtenerUsuarioIdPedido(pedido);

            console.log(
                "===================================="
            );

            console.log(
                "GENERANDO PUNTOS"
            );

            console.log(
                "===================================="
            );

            console.log(
                "Pedido:",
                pedidoId
            );

            console.log(
                "Usuario:",
                usuarioId
            );

            console.log(
                "Cliente:",
                obtenerNombreClientePedido(pedido)
            );

            console.log(
                "Correo:",
                obtenerCorreoClientePedido(pedido)
            );

            console.log(
                "Total:",
                total
            );

            console.log(
                "Puntos:",
                puntos
            );


            /* =============================================
               7. ACTUALIZAR PEDIDO
            =============================================

               IMPORTANTE:

               SOLO se modifica la tabla pedidos.

               NO se toca perfiles.

               También se aceptan registros antiguos
               donde puntos_validados sea NULL.
            ============================================= */

            const {
                data: pedidoActualizado,
                error: errorValidarPedido
            } =
                await supabasePedidosAdmin
                    .from("pedidos")
                    .update({
                        puntos_generados: puntos,
                        puntos_validados: true,
                        puntos_validados_en:
                            new Date().toISOString()
                    })
                    .eq("id", pedidoId)
                    .or(
                        "puntos_validados.is.null,puntos_validados.eq.false"
                    )
                    .select(
                        "id, usuario_id, puntos_generados, puntos_validados, puntos_validados_en"
                    )
                    .maybeSingle();


            /* =============================================
               ERROR
            ============================================= */

            if (errorValidarPedido) {

                console.error(
                    "Error registrando puntos:",
                    errorValidarPedido
                );

                alert(
                    "No se pudieron generar los puntos.\n\n" +
                    "Error:\n" +
                    errorValidarPedido.message
                );

                return;
            }


            /* =============================================
               NO SE ACTUALIZÓ
            ============================================= */

            if (!pedidoActualizado) {

                alert(
                    "Los puntos no fueron generados.\n\n" +
                    "Es posible que ya hayan sido otorgados."
                );

                await cargarPedidosAdministracion();

                return;
            }


            /* =============================================
               VERIFICAR ACTUALIZACIÓN
            ============================================= */

            if (
                pedidoActualizado.puntos_validados !== true
            ) {

                alert(
                    "No se pudo confirmar que los puntos quedaron registrados."
                );

                return;
            }


            /* =============================================
               ÉXITO
            ============================================= */

            alert(
                "¡Puntos generados correctamente!\n\n" +

                "Cliente: " +
                obtenerNombreClientePedido(pedido) +

                "\n\n" +

                "Pedido: #" +
                pedidoId +

                "\n\n" +

                "Compra: " +
                dineroPedido(total) +

                "\n\n" +

                "Puntos generados: " +
                puntos +

                "\n\n" +

                "Sistema: 1 punto por cada Q10 de compra"
            );


            /* =============================================
               RECARGAR
            ============================================= */

            await cargarPedidosAdministracion();

        } catch (error) {

            console.error(
                "Error generando los puntos:",
                error
            );

            alert(
                "Ocurrió un error al generar los puntos:\n\n" +
                (
                    error?.message ||
                    "Error desconocido"
                )
            );
        }
    };


/* =========================================================
   INICIALIZAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarPedidosAdministracion();

        const selector =
            document.getElementById(
                "selectorAño"
            );

        if (selector) {

            selector.addEventListener(
                "change",
                () => {

                    cargarPedidosAdministracion();

                }
            );
        }

    }
);


/* =========================================================
   EXPONER FUNCIONES
========================================================= */

window.cargarPedidosAdministracion =
    cargarPedidosAdministracion;

window.calcularPuntosPedidoAdmin =
    calcularPuntosPedidoAdmin;

window.obtenerTotalPedidoAdmin =
    obtenerTotalPedidoAdmin;

window.obtenerProductosPedidoAdmin =
    obtenerProductosPedidoAdmin;

window.obtenerUsuarioIdPedido =
    obtenerUsuarioIdPedido;

window.obtenerNombreClientePedido =
    obtenerNombreClientePedido;

window.obtenerCorreoClientePedido =
    obtenerCorreoClientePedido;


/* =========================================================
   PRUEBAS DEL SISTEMA DE PUNTOS
========================================================= */

console.log(
    "===================================="
);

console.log(
    "DL LUXURY"
);

console.log(
    "pedidos-admin.js cargado correctamente"
);

console.log(
    "Sistema de puntos:"
);

console.log(
    "Q10 = 1 punto"
);

console.log(
    "Q100 = 10 puntos"
);

console.log(
    "Q500 = 50 puntos"
);

console.log(
    "Q1000 = 100 puntos"
);

console.log(
    "SIN LÍMITE MÁXIMO"
);

console.log(
    "Los puntos se almacenan únicamente en pedidos."
);

console.log(
    "NO se utiliza la tabla perfiles."
);

console.log(
    "===================================="
);
