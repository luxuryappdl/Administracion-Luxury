/* =========================================================
   DL LUXURY
   PEDIDOS - ADMINISTRACIÓN
   =========================================================

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

   5% DEL TOTAL DE LA COMPRA

   Q100  = 5 puntos
   Q200  = 10 puntos
   Q500  = 25 puntos
   Q1000 = 50 puntos

   1 PUNTO = Q1

   SIN LÍMITE DE PUNTOS POR PEDIDO

   =========================================================
   IMPORTANTE
   =========================================================

   Los puntos se manejan ÚNICAMENTE desde:

       pedidos

   NO se utiliza:

       perfiles

   NO se busca al cliente en:

       perfiles

   NO se modifica:

       perfiles.Puntos

========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_PEDIDOS_URL =
    "https://brnyvkqwkosgtpugxcge.supabase.co";

const SUPABASE_PEDIDOS_KEY =
    "sb_publishable_Qdae9GUtmuosAPP4kemF3A_Vr4HFo0n";

const supabasePedidos =
    window.supabase.createClient(
        SUPABASE_PEDIDOS_URL,
        SUPABASE_PEDIDOS_KEY
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

    const numero =
        Number(valor) || 0;

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

    const fechaObj =
        new Date(fecha);

    if (
        Number.isNaN(
            fechaObj.getTime()
        )
    ) {
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


/* =========================================================
   AÑO SELECCIONADO
========================================================= */

function obtenerAñoSeleccionadoPedidos() {

    const selector =
        document.getElementById(
            "selectorAño"
        );

    if (!selector) {

        return new Date()
            .getFullYear();
    }

    const valor =
        Number(
            selector.value
        );

    return (
        valor ||
        new Date()
            .getFullYear()
    );
}


/* =========================================================
   PRODUCTOS DEL PEDIDO
========================================================= */

function obtenerProductosPedidoAdmin(
    pedido
) {

    if (!pedido) {
        return [];
    }

    let productos =
        pedido.productos;

    if (!productos) {
        return [];
    }


    /* =====================================================
       SI VIENE COMO TEXTO JSON
    ===================================================== */

    if (
        typeof productos === "string"
    ) {

        try {

            productos =
                JSON.parse(
                    productos
                );

        } catch (error) {

            console.warn(
                "No se pudo convertir productos:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       SI ES UN SOLO OBJETO
    ===================================================== */

    if (
        !Array.isArray(productos)
    ) {

        if (
            typeof productos === "object"
        ) {

            return [
                productos
            ];
        }

        return [];
    }


    return productos;
}


/* =========================================================
   CANTIDAD
========================================================= */

function obtenerCantidadPedidoAdmin(
    pedido
) {

    const productos =
        obtenerProductosPedidoAdmin(
            pedido
        );

    if (
        !productos.length
    ) {

        return 0;
    }

    return productos.reduce(
        (
            total,
            producto
        ) => {

            const cantidad =
                Number(
                    producto?.cantidad ??
                    producto?.qty ??
                    producto?.quantity ??
                    1
                ) || 1;

            return (
                total +
                cantidad
            );

        },
        0
    );
}


/* =========================================================
   TOTAL
========================================================= */

function obtenerTotalPedidoAdmin(
    pedido
) {

    if (!pedido) {
        return 0;
    }

    const posiblesValores = [

        pedido.total,

        pedido.total_pedido,

        pedido.monto_total,

        pedido.precio_total

    ];


    for (
        const valor
        of posiblesValores
    ) {

        const numero =
            Number(valor);

        if (
            Number.isFinite(
                numero
            )
        ) {

            return numero;
        }
    }


    return 0;
}


/* =========================================================
   CALCULAR PUNTOS
=========================================================

   REGLA:

   5% DEL TOTAL

   Q100  = 5
   Q200  = 10
   Q500  = 25
   Q1000 = 50

   SIN LÍMITE

   Se utiliza Math.floor() para evitar
   entregar puntos decimales.

========================================================= */

function calcularPuntosPedidoAdmin(
    total
) {

    const valor =
        Number(total) || 0;

    if (
        valor <= 0
    ) {

        return 0;
    }

    return Math.floor(
        valor * 0.05
    );
}


/* =========================================================
   OBTENER ID DEL USUARIO
========================================================= */

function obtenerUsuarioIdPedido(
    pedido
) {

    return (

        pedido?.usuario_id ||

        pedido?.user_id ||

        pedido?.cliente_id ||

        pedido?.usuario ||

        pedido?.cliente ||

        null

    );
}


/* =========================================================
   OBTENER NOMBRE
========================================================= */

function obtenerNombreClientePedido(
    pedido
) {

    return (

        pedido?.cliente_nombre ||

        pedido?.nombre_cliente ||

        pedido?.cliente ||

        pedido?.nombre ||

        pedido?.usuario_nombre ||

        "Cliente"

    );
}


/* =========================================================
   OBTENER CORREO
========================================================= */

function obtenerCorreoClientePedido(
    pedido
) {

    return (

        pedido?.cliente_correo ||

        pedido?.correo ||

        pedido?.email ||

        pedido?.correo_cliente ||

        ""

    );
}


/* =========================================================
   CARGAR PEDIDOS
========================================================= */

async function cargarPedidosAdministracion() {

    const contenedor =
        document.getElementById(
            "listaPedidos"
        );


    if (!contenedor) {

        console.warn(
            "No se encontró #listaPedidos"
        );

        return;
    }


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


        const {
            data,
            error
        } =
            await supabasePedidos

                .from("pedidos")

                .select("*")

                .gte(
                    "creado_en",
                    inicio
                )

                .lt(
                    "creado_en",
                    fin
                )

                .order(
                    "creado_en",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Error cargando pedidos:",
                error
            );


            contenedor.innerHTML = `

                <div class="sin-tickets">

                    Error al cargar los pedidos.

                    <br><br>

                    ${escaparHTMLPedidos(
                error.message
            )}

                </div>

            `;

            return;
        }


        if (
            !data ||
            !data.length
        ) {

            contenedor.innerHTML = `

                <div class="sin-tickets">

                    No hay pedidos para ${año}.

                </div>

            `;

            return;
        }


        contenedor.innerHTML =
            data
                .map(
                    crearTarjetaPedidoAdmin
                )
                .join("");


        /* =====================================================
           ACTIVAR BOTONES DE LAS TARJETAS
        ===================================================== */

        prepararBotonesPedidos();


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
   CREAR TARJETA
========================================================= */

function crearTarjetaPedidoAdmin(
    pedido
) {

    const id =
        pedido?.id ?? "";


    const nombre =
        obtenerNombreClientePedido(
            pedido
        );


    const correo =
        obtenerCorreoClientePedido(
            pedido
        );


    const fecha =
        formatearFechaPedido(
            pedido?.creado_en
        );


    const hora =
        formatearHoraPedido(
            pedido?.creado_en
        );


    const productos =
        obtenerProductosPedidoAdmin(
            pedido
        );


    const cantidad =
        obtenerCantidadPedidoAdmin(
            pedido
        );


    const total =
        obtenerTotalPedidoAdmin(
            pedido
        );


    /* =====================================================
       PUNTOS
    ===================================================== */

    const puntosRegistrados =
        Number(
            pedido?.puntos_generados
        );


    const puntos =
        Number.isFinite(
            puntosRegistrados
        ) &&
            puntosRegistrados > 0

            ? puntosRegistrados

            : calcularPuntosPedidoAdmin(
                total
            );


    const estado =
        String(
            pedido?.estado ||
            "pendiente"
        )
            .trim()
            .toLowerCase();


    const confirmada =
        estado === "confirmada";


    const puntosValidados =
        pedido?.puntos_validados === true;


    let productosHTML = "";


    /* =====================================================
       PRODUCTOS
    ===================================================== */

    if (
        productos.length
    ) {

        productosHTML =
            productos
                .map(
                    producto => {

                        const nombreProducto =
                            producto?.nombre ||
                            producto?.producto ||
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

                                ${escaparHTMLPedidos(
                            nombreProducto
                        )}

                                × ${cantidadProducto}

                            </div>

                        `;

                    }
                )
                .join("");

    } else {

        productosHTML = `

            <div>

                Sin productos registrados

            </div>

        `;
    }


    let botonCompra = "";

    let botonPuntos = "";


    /* =====================================================
       BOTÓN CONFIRMAR COMPRA
    ===================================================== */

    if (
        !confirmada
    ) {

        botonCompra = `

            <button
                type="button"
                class="btn-principal"
                data-confirmar-pedido="${escaparHTMLPedidos(id)}"
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
       BOTÓN PUNTOS
    ===================================================== */

    if (
        !confirmada
    ) {

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

    } else if (
        puntosValidados
    ) {

        botonPuntos = `

            <button
                type="button"
                class="btn-secundario"
                disabled
            >

                <i class="fa-solid fa-star"></i>

                Puntos otorgados:

                ${puntos}

            </button>

        `;

    } else if (
        puntos <= 0
    ) {

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
                data-dar-puntos="${escaparHTMLPedidos(id)}"
            >

                <i class="fa-solid fa-star"></i>

                Dar ${puntos} puntos

            </button>

        `;
    }


    /* =====================================================
       TARJETA
    ===================================================== */

    return `

        <div
            class="producto-card"
            data-pedido-id="${escaparHTMLPedidos(id)}"
        >

            <div
                class="producto-card-cabecera"
            >

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


            <div
                class="producto-card-usuario"
            >

                <strong>

                    ${escaparHTMLPedidos(nombre)}

                </strong>

                ${correo
            ? `

                            <small>

                                ${escaparHTMLPedidos(
                correo
            )}

                            </small>

                        `
            : ""
        }

            </div>


            <div
                class="producto-card-descripcion"
            >

                ${productosHTML}

            </div>


            <div
                class="producto-card-pie"
            >

                <div>

                    <strong>

                        ${cantidad}

                    </strong>

                    producto(s)

                </div>


                <div>

                    <strong>

                        ${dineroPedido(
            total
        )}

                    </strong>

                </div>


                <div>

                    <strong>

                        ${puntos}

                    </strong>

                    puntos disponibles

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
   ACTIVAR BOTONES
=========================================================

   IMPORTANTE:

   No usamos onclick inline para los botones
   de pedidos.

   Esto hace que funcionen correctamente también
   cuando la página está instalada como PWA.

========================================================= */

function prepararBotonesPedidos() {

    const contenedor =
        document.getElementById(
            "listaPedidos"
        );


    if (!contenedor) {
        return;
    }


    /* =====================================================
       CONFIRMAR COMPRA
    ===================================================== */

    const botonesConfirmar =
        contenedor.querySelectorAll(
            "[data-confirmar-pedido]"
        );


    botonesConfirmar.forEach(
        boton => {

            boton.addEventListener(
                "click",
                async function () {

                    const pedidoId =
                        this.getAttribute(
                            "data-confirmar-pedido"
                        );


                    if (!pedidoId) {
                        return;
                    }


                    await window.confirmarCompraPedido(
                        pedidoId
                    );

                }
            );

        }
    );


    /* =====================================================
       DAR PUNTOS
    ===================================================== */

    const botonesPuntos =
        contenedor.querySelectorAll(
            "[data-dar-puntos]"
        );


    botonesPuntos.forEach(
        boton => {

            boton.addEventListener(
                "click",
                async function () {

                    const pedidoId =
                        this.getAttribute(
                            "data-dar-puntos"
                        );


                    if (!pedidoId) {
                        return;
                    }


                    /* Evitar doble toque */

                    if (
                        this.dataset.procesando ===
                        "true"
                    ) {

                        return;
                    }


                    this.dataset.procesando =
                        "true";


                    this.disabled =
                        true;


                    try {

                        await window.darPuntosPedido(
                            pedidoId
                        );

                    } finally {

                        /*
                         * La función recarga las tarjetas.
                         * Si ocurre un error antes de recargar,
                         * permitimos volver a intentar.
                         */

                        this.dataset.procesando =
                            "false";

                    }

                }
            );

        }
    );
}


/* =========================================================
   CONFIRMAR COMPRA
========================================================= */

window.confirmarCompraPedido =
    async function (
        pedidoId
    ) {

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

            const {
                data: pedido,
                error: errorPedido
            } =
                await supabasePedidos

                    .from("pedidos")

                    .select("*")

                    .eq(
                        "id",
                        pedidoId
                    )

                    .maybeSingle();


            if (errorPedido) {

                console.error(
                    "Error obteniendo pedido:",
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
                    "No se encontró el pedido."
                );


                return;
            }


            const estadoActual =
                String(
                    pedido.estado ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                estadoActual ===
                "confirmada"
            ) {

                alert(
                    "Esta compra ya está confirmada."
                );


                await cargarPedidosAdministracion();

                return;
            }


            const {
                data: pedidoConfirmado,
                error
            } =
                await supabasePedidos

                    .from("pedidos")

                    .update({

                        estado:
                            "confirmada",

                        confirmado_en:
                            new Date()
                                .toISOString()

                    })

                    .eq(
                        "id",
                        pedidoId
                    )

                    .select(
                        "id,estado,confirmado_en"
                    )

                    .maybeSingle();


            if (error) {

                console.error(
                    "Error confirmando compra:",
                    error
                );


                alert(
                    "No se pudo confirmar la compra.\n\n" +
                    error.message
                );


                return;
            }


            if (!pedidoConfirmado) {

                alert(
                    "No se pudo confirmar la compra. " +
                    "No se modificó ningún pedido."
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
    async function (
        pedidoId
    ) {

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

            console.log(
                "========================================"
            );

            console.log(
                "⭐ GENERANDO PUNTOS"
            );

            console.log(
                "Pedido:",
                pedidoId
            );

            console.log(
                "========================================"
            );


            /* =================================================
               1. OBTENER PEDIDO
            ================================================= */

            const {
                data: pedido,
                error: errorPedido
            } =
                await supabasePedidos

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
                    "No se encontró el pedido."
                );


                return;
            }


            /* =================================================
               2. VERIFICAR ESTADO
            ================================================= */

            const estado =
                String(
                    pedido.estado ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                estado !==
                "confirmada"
            ) {

                alert(
                    "Primero debes confirmar la compra."
                );


                return;
            }


            /* =================================================
               3. EVITAR DUPLICADOS
            ================================================= */

            if (
                pedido.puntos_validados === true
            ) {

                alert(
                    "Los puntos de este pedido ya fueron otorgados."
                );


                await cargarPedidosAdministracion();

                return;
            }


            /* =================================================
               4. OBTENER TOTAL
            ================================================= */

            const total =
                obtenerTotalPedidoAdmin(
                    pedido
                );


            if (
                total <= 0
            ) {

                alert(
                    "El pedido no tiene un total válido."
                );


                return;
            }


            /* =================================================
               5. CALCULAR PUNTOS
            ================================================= */

            const puntos =
                calcularPuntosPedidoAdmin(
                    total
                );


            if (
                puntos <= 0
            ) {

                alert(
                    "Este pedido no genera puntos porque el total es insuficiente."
                );


                return;
            }


            /* =================================================
               6. INFORMACIÓN DEL PEDIDO

               NO se busca al cliente en perfiles.

               El usuario ya está relacionado con el pedido.
            ================================================= */

            const usuarioId =
                obtenerUsuarioIdPedido(
                    pedido
                );


            console.log(
                "Usuario del pedido:",
                usuarioId
            );

            console.log(
                "Cliente:",
                obtenerNombreClientePedido(
                    pedido
                )
            );

            console.log(
                "Total:",
                total
            );

            console.log(
                "Puntos:",
                puntos
            );


            /* =================================================
               7. GUARDAR PUNTOS

               IMPORTANTE:

               NO usamos:

                   perfiles

               SOLAMENTE:

                   pedidos
            ================================================= */

            /*
             * Primero intentamos actualizar cuando
             * puntos_validados sea FALSE.
             */

            let pedidoActualizado = null;

            let errorValidarPedido = null;


            const resultadoFalse =
                await supabasePedidos

                    .from("pedidos")

                    .update({

                        puntos_generados:
                            puntos,

                        puntos_validados:
                            true,

                        puntos_validados_en:
                            new Date()
                                .toISOString()

                    })

                    .eq(
                        "id",
                        pedidoId
                    )

                    .eq(
                        "puntos_validados",
                        false
                    )

                    .select(
                        "id,usuario_id,total,puntos_generados,puntos_validados,puntos_validados_en"
                    )

                    .maybeSingle();


            pedidoActualizado =
                resultadoFalse.data;


            errorValidarPedido =
                resultadoFalse.error;


            /* =================================================
               8. SI NO ACTUALIZÓ PORQUE ERA NULL

               Intentamos una segunda vez.

               Esto permite trabajar con pedidos antiguos
               donde puntos_validados todavía sea NULL.
            ================================================= */

            if (
                !errorValidarPedido &&
                !pedidoActualizado &&
                pedido.puntos_validados == null
            ) {

                const resultadoNull =
                    await supabasePedidos

                        .from("pedidos")

                        .update({

                            puntos_generados:
                                puntos,

                            puntos_validados:
                                true,

                            puntos_validados_en:
                                new Date()
                                    .toISOString()

                        })

                        .eq(
                            "id",
                            pedidoId
                        )

                        .is(
                            "puntos_validados",
                            null
                        )

                        .select(
                            "id,usuario_id,total,puntos_generados,puntos_validados,puntos_validados_en"
                        )

                        .maybeSingle();


                pedidoActualizado =
                    resultadoNull.data;


                errorValidarPedido =
                    resultadoNull.error;
            }


            /* =================================================
               9. COMPROBAR ERROR
            ================================================= */

            if (
                errorValidarPedido
            ) {

                console.error(
                    "❌ Error guardando puntos:",
                    errorValidarPedido
                );


                alert(

                    "No se pudieron otorgar los puntos.\n\n" +

                    errorValidarPedido.message

                );


                return;
            }


            /* =================================================
               10. COMPROBAR ACTUALIZACIÓN
            ================================================= */

            if (
                !pedidoActualizado
            ) {

                const {
                    data: pedidoComprobacion,
                    error: errorComprobacion
                } =
                    await supabasePedidos

                        .from("pedidos")

                        .select(
                            "id,usuario_id,total,puntos_generados,puntos_validados,puntos_validados_en"
                        )

                        .eq(
                            "id",
                            pedidoId
                        )

                        .maybeSingle();


                if (
                    errorComprobacion
                ) {

                    console.error(
                        "❌ Error comprobando pedido:",
                        errorComprobacion
                    );


                    alert(

                        "No se pudo comprobar el estado de los puntos.\n\n" +

                        errorComprobacion.message

                    );


                    return;
                }


                if (
                    pedidoComprobacion?.puntos_validados === true
                ) {

                    alert(
                        "Los puntos de este pedido ya fueron otorgados."
                    );


                    await cargarPedidosAdministracion();

                    return;
                }


                alert(
                    "No se pudieron registrar los puntos del pedido."
                );


                return;
            }


            /* =================================================
               11. ÉXITO
            ================================================= */

            console.log(
                "========================================"
            );

            console.log(
                "🎉 PUNTOS GENERADOS CORRECTAMENTE"
            );

            console.log(
                "Pedido actualizado:",
                pedidoActualizado
            );

            console.log(
                "========================================"
            );


            alert(

                "¡PUNTOS GENERADOS CORRECTAMENTE!\n\n" +

                "Cliente: " +
                obtenerNombreClientePedido(
                    pedido
                ) +

                "\nVenta: " +
                dineroPedido(
                    total
                ) +

                "\nPuntos generados: " +
                puntos +

                "\n\nLos puntos quedaron registrados en el pedido."

            );


            /* =================================================
               12. RECARGAR
            ================================================= */

            await cargarPedidosAdministracion();


        } catch (error) {

            console.error(
                "❌ Error generando puntos:",
                error
            );


            alert(

                "Ocurrió un error al generar los puntos.\n\n" +

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
   MENSAJES
========================================================= */

console.log(
    "========================================"
);

console.log(
    "DL LUXURY"
);

console.log(
    "pedidos-admin.js cargado correctamente"
);

console.log(
    "Sistema de puntos: 5% del total"
);

console.log(
    "Sin límite de puntos por pedido"
);

console.log(
    "Los puntos se almacenan únicamente en pedidos"
);

console.log(
    "NO se utiliza la tabla perfiles"
);

console.log(
    "Botones preparados para móvil/PWA"
);

console.log(
    "========================================"
);
