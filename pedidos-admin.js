/* =========================================================
   DL LUXURY
   PEDIDOS - ADMINISTRACIÓN

   ESTE ARCHIVO MANEJA ÚNICAMENTE:

   - Mostrar pedidos
   - Confirmar compra
   - Dar puntos
   - Validar puntos

   NO MODIFICA:
   - Dashboard
   - Ingresos
   - Ventas
   - Egresos
   - Stock

   REGLA DE PUNTOS:

   Q149  = 0 puntos
   Q150  = 5 puntos
   Q300  = 10 puntos
   Q450  = 15 puntos
   Q600  = 20 puntos

   FÓRMULA:

   Math.floor(total / 150) * 5
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
   UTILIDADES
========================================================= */

function escaparHTMLPedidos(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escaparHTML(texto) {

    return escaparHTMLPedidos(texto);

}


function dineroPedido(numero) {

    const valor =
        Number(numero);

    return "Q" +
        (
            Number.isFinite(valor)
                ? valor
                : 0
        ).toFixed(2);

}


function formatearFechaPedido(fecha) {

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
   OBTENER AÑO SELECCIONADO
========================================================= */

function obtenerAñoSeleccionadoPedidos() {

    const selector =
        document.getElementById(
            "selectorAño"
        );


    /*
       SI EL SELECTOR EXISTE Y TIENE
       UN AÑO SELECCIONADO, USAMOS ESE.
    */

    if (
        selector &&
        selector.value
    ) {

        const añoSelect =
            Number(
                selector.value
            );


        if (
            Number.isFinite(añoSelect) &&
            añoSelect >= 1900
        ) {

            return añoSelect;

        }

    }


    /*
       SI TODAVÍA NO TENEMOS VALOR
       EN EL SELECTOR, BUSCAMOS
       EL AÑO GUARDADO.
    */

    const añoGuardado =
        Number(
            localStorage.getItem(
                "dlLuxuryAñoSeleccionado"
            )
        );


    if (
        Number.isFinite(añoGuardado) &&
        añoGuardado >= 1900
    ) {

        return añoGuardado;

    }


    /*
       ÚLTIMO RECURSO:
       AÑO ACTUAL.
    */

    return new Date().getFullYear();

}


/* =========================================================
   OBTENER PRODUCTOS DEL PEDIDO
========================================================= */

function obtenerProductosPedidoAdmin(
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

        }

        else if (
            typeof pedido?.productos === "string"
        ) {

            productos =
                JSON.parse(
                    pedido.productos
                );

        }

        else if (
            pedido?.productos &&
            typeof pedido.productos === "object"
        ) {

            productos = [
                pedido.productos
            ];

        }

    }

    catch (error) {

        console.error(
            "Error leyendo productos del pedido:",
            error
        );

        productos = [];

    }


    return Array.isArray(productos)
        ? productos
        : [];

}


/* =========================================================
   CANTIDAD DE PRODUCTOS
========================================================= */

function obtenerCantidadPedidoAdmin(
    pedido
) {

    const productos =
        obtenerProductosPedidoAdmin(
            pedido
        );


    let cantidad = 0;


    productos.forEach(
        function (producto) {

            cantidad +=
                Number(
                    producto?.cantidad
                ) || 1;

        }
    );


    return cantidad;

}


/* =========================================================
   TOTAL DEL PEDIDO
========================================================= */

function obtenerTotalPedidoAdmin(
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
        obtenerProductosPedidoAdmin(
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
                Number(
                    producto?.cantidad
                ) || 1;


            totalCalculado +=
                precio * cantidad;

        }
    );


    return totalCalculado;

}


/* =========================================================
   CALCULAR PUNTOS
========================================================= */

function calcularPuntosPedidoAdmin(
    total
) {

    const valor =
        Number(total) || 0;


    return Math.floor(
        valor / 150
    ) * 5;

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
   OBTENER NOMBRE DEL CLIENTE
========================================================= */

async function obtenerNombreClientePedido(
    pedido
) {

    const usuarioId =
        obtenerUsuarioIdPedido(
            pedido
        );


    const nombreDirecto =
        pedido?.nombre ||
        pedido?.cliente_nombre ||
        pedido?.nombre_cliente;


    if (nombreDirecto) {

        return nombreDirecto;

    }


    if (!usuarioId) {

        return "Cliente";

    }


    try {

        const {
            data,
            error
        } =
            await supabasePedidos
                .from("perfiles")
                .select(
                    "nombre,apellido,correo"
                )
                .eq(
                    "id",
                    usuarioId
                )
                .maybeSingle();


        if (error) {

            console.warn(
                "No se pudo obtener el perfil:",
                error
            );

            return (
                pedido?.correo ||
                pedido?.cliente_correo ||
                "Cliente"
            );

        }


        if (data) {

            const nombre =
                data.nombre || "";


            const apellido =
                data.apellido || "";


            const nombreCompleto =
                `${nombre} ${apellido}`.trim();


            if (nombreCompleto) {

                return nombreCompleto;

            }


            if (data.correo) {

                return data.correo;

            }

        }

    }

    catch (error) {

        console.warn(
            "Error buscando cliente:",
            error
        );

    }


    return (
        pedido?.correo ||
        pedido?.cliente_correo ||
        "Cliente"
    );

}


/* =========================================================
   OBTENER CORREO DEL CLIENTE
========================================================= */

async function obtenerCorreoClientePedido(
    pedido
) {

    const correoDirecto =
        pedido?.correo ||
        pedido?.cliente_correo;


    if (correoDirecto) {

        return correoDirecto;

    }


    const usuarioId =
        obtenerUsuarioIdPedido(
            pedido
        );


    if (!usuarioId) {

        return "";

    }


    try {

        const {
            data,
            error
        } =
            await supabasePedidos
                .from("perfiles")
                .select(
                    "correo"
                )
                .eq(
                    "id",
                    usuarioId
                )
                .maybeSingle();


        if (
            !error &&
            data?.correo
        ) {

            return data.correo;

        }


        if (error) {

            console.warn(
                "No se pudo obtener correo:",
                error
            );

        }

    }

    catch (error) {

        console.warn(
            "Error obteniendo correo:",
            error
        );

    }


    return "";

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

        const {
            data,
            error
        } =
            await supabasePedidos
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
                "Error cargando pedidos:",
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

            return;

        }


        let pedidos =
            data || [];


        /* =================================================
           OBTENER AÑO
        ================================================= */

        const añoSeleccionado =
            obtenerAñoSeleccionadoPedidos();


        console.log(
            "AÑO SELECCIONADO:",
            añoSeleccionado
        );


        /* =================================================
           FILTRAR POR AÑO
        ================================================= */

        pedidos =
            pedidos.filter(
                function (pedido) {

                    if (
                        !pedido.creado_en
                    ) {

                        return false;

                    }


                    const fechaPedido =
                        new Date(
                            pedido.creado_en
                        );


                    if (
                        Number.isNaN(
                            fechaPedido.getTime()
                        )
                    ) {

                        return false;

                    }


                    const añoPedido =
                        fechaPedido.getFullYear();


                    console.log(
                        "Pedido:",
                        pedido.id,
                        "Año:",
                        añoPedido
                    );


                    return (
                        añoPedido ===
                        añoSeleccionado
                    );

                }
            );


        contenedor.innerHTML = "";


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


        for (
            const pedido of pedidos
        ) {

            await crearTarjetaPedidoAdmin(
                pedido,
                contenedor
            );

        }

    }

    catch (error) {

        console.error(
            "Error inesperado cargando pedidos:",
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


/* =========================================================
   CREAR TARJETA DEL PEDIDO
========================================================= */

async function crearTarjetaPedidoAdmin(
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
        await obtenerNombreClientePedido(
            pedido
        );


    const correoCliente =
        await obtenerCorreoClientePedido(
            pedido
        );


    const total =
        obtenerTotalPedidoAdmin(
            pedido
        );


    const cantidad =
        obtenerCantidadPedidoAdmin(
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
            pedido.puntos_generados
        ) || 0;


    const productos =
        obtenerProductosPedidoAdmin(
            pedido
        );


    let listaProductos = "";


    if (
        productos.length > 0
    ) {

        listaProductos =
            productos
                .map(
                    function (producto) {

                        const nombre =
                            producto?.nombre ||
                            producto?.name ||
                            "Producto";


                        const cantidadProducto =
                            Number(
                                producto?.cantidad
                            ) || 1;


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

    }

    else {

        listaProductos = `
            <div style="color:#888;">
                Sin productos detallados
            </div>
        `;

    }


    /* =====================================================
       ESTADO
    ===================================================== */

    let estadoHTML = "";


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

    }

    else {

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


    /* =====================================================
       BOTÓN CONFIRMAR
    ===================================================== */

    let botonConfirmar = "";


    if (!confirmado) {

        botonConfirmar = `
            <button
                type="button"
                onclick="confirmarCompraPedido('${escaparHTML(
            pedido.id
        )}')"
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

    }

    else {

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


    /* =====================================================
       BOTÓN PUNTOS
    ===================================================== */

    let botonPuntos = "";


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

    }

    else if (puntosValidados) {

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

    }

    else {

        const puntosCalculados =
            calcularPuntosPedidoAdmin(
                total
            );


        if (
            puntosCalculados > 0
        ) {

            botonPuntos = `
                <button
                    type="button"
                    onclick="darPuntosPedido('${escaparHTML(
                pedido.id
            )}')"
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

        }

        else {

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


    /* =====================================================
       TARJETA
    ===================================================== */

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

                ${formatearFechaPedido(
            pedido.creado_en
        )}

                ${pedido.creado_en
            ? `
                            -
                            ${formatearHoraPedido(
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

                        ${dineroPedido(
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


/* =========================================================
   CONFIRMAR COMPRA
========================================================= */

window.confirmarCompraPedido =
    async function (
        pedidoId
    ) {

        const confirmar =
            window.confirm(
                "¿Deseas confirmar esta compra?"
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
                    "Error buscando pedido:",
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


            if (
                String(
                    pedido.estado || ""
                ).toLowerCase() ===
                "confirmada"
            ) {

                alert(
                    "Este pedido ya está confirmado."
                );


                await cargarPedidosAdministracion();

                return;

            }


            const {
                error
            } =
                await supabasePedidos
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


            if (error) {

                console.error(
                    "Error confirmando pedido:",
                    error
                );


                alert(
                    "No se pudo confirmar el pedido.\n\n" +
                    error.message
                );

                return;

            }


            alert(
                "Compra confirmada correctamente."
            );


            await cargarPedidosAdministracion();


            if (
                typeof window.actualizarDashboard ===
                "function"
            ) {

                await window.actualizarDashboard();

            }

        }

        catch (error) {

            console.error(
                "Error inesperado confirmando compra:",
                error
            );


            alert(
                "Ocurrió un error al confirmar la compra."
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

        const confirmar =
            window.confirm(
                "¿Deseas otorgar los puntos de esta compra?"
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
                    "El pedido no existe."
                );

                return;

            }


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
               CALCULAR PUNTOS

               Q149 = 0
               Q150 = 5
               Q300 = 10
               Q450 = 15
               Q600 = 20
            ================================================= */

            const total =
                obtenerTotalPedidoAdmin(
                    pedido
                );


            const puntos =
                calcularPuntosPedidoAdmin(
                    total
                );


            if (
                puntos <= 0
            ) {

                alert(
                    "Esta compra no genera puntos.\n\n" +
                    "La compra mínima es de Q150.00."
                );

                return;

            }


            /* =================================================
               OBTENER USUARIO
            ================================================= */

            const usuarioId =
                obtenerUsuarioIdPedido(
                    pedido
                );


            if (!usuarioId) {

                alert(
                    "No se encontró el usuario asociado a este pedido."
                );


                console.error(
                    "Pedido sin usuario_id/user_id/cliente_id:",
                    pedido
                );

                return;

            }


            /* =================================================
               BUSCAR PERFIL
            ================================================= */

            const {
                data: perfil,
                error: errorPerfil
            } =
                await supabasePedidos
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
                    "Error buscando perfil:",
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


            const puntosActuales =
                Number(
                    perfil["Puntos"]
                ) || 0;


            const nuevosPuntos =
                puntosActuales +
                puntos;


            /* =================================================
               ACTUALIZAR PERFIL
            ================================================= */

            const {
                error: errorActualizarPerfil
            } =
                await supabasePedidos
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
                    "Error actualizando puntos:",
                    errorActualizarPerfil
                );


                alert(
                    "No se pudieron agregar los puntos.\n\n" +
                    errorActualizarPerfil.message
                );

                return;

            }


            /* =================================================
               MARCAR PEDIDO COMO VALIDADO
            ================================================= */

            const {
                error: errorValidarPedido
            } =
                await supabasePedidos
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
                    "Error validando puntos:",
                    errorValidarPedido
                );


                alert(
                    "Los puntos fueron agregados, pero no se pudo marcar el pedido como validado.\n\n" +
                    errorValidarPedido.message
                );

                return;

            }


            alert(
                "Puntos otorgados correctamente.\n\n" +
                "Puntos agregados: " +
                puntos +
                "\n" +
                "Puntos actuales: " +
                nuevosPuntos
            );


            await cargarPedidosAdministracion();


        }

        catch (error) {

            console.error(
                "Error inesperado dando puntos:",
                error
            );


            alert(
                "Ocurrió un error al otorgar los puntos."
            );

        }

    };


/* =========================================================
   REFRESCAR PEDIDOS CUANDO CAMBIA EL AÑO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           CARGA INICIAL
        */

        cargarPedidosAdministracion();


        /*
           SELECTOR DE AÑO
        */

        const selector =
            document.getElementById(
                "selectorAño"
            );


        if (!selector) {

            console.warn(
                "No se encontró el selector #selectorAño"
            );

            return;

        }


        /*
           CAMBIO DE AÑO
        */

        selector.addEventListener(
            "change",
            function () {

                const año =
                    Number(
                        selector.value
                    );


                if (
                    !Number.isFinite(año) ||
                    año < 1900
                ) {

                    return;

                }


                /*
                   GUARDAR AÑO
                */

                localStorage.setItem(
                    "dlLuxuryAñoSeleccionado",
                    String(año)
                );


                console.log(
                    "Cambiando pedidos al año:",
                    año
                );


                /*
                   RECARGAR PEDIDOS
                */

                cargarPedidosAdministracion();

            }
        );


        /*
           SI EL SELECTOR CAMBIA
           DESPUÉS DE QUE ESTE SCRIPT
           YA SE EJECUTÓ, TAMBIÉN
           PODREMOS RECARGAR.
        */

        window.addEventListener(
            "dlLuxuryAñoCambiado",
            function () {

                cargarPedidosAdministracion();

            }
        );

    }
);


/* =========================================================
   EXPONER FUNCIONES
========================================================= */

window.cargarPedidosAdministracion =
    cargarPedidosAdministracion;


window.obtenerProductosPedidoAdmin =
    obtenerProductosPedidoAdmin;


window.obtenerCantidadPedidoAdmin =
    obtenerCantidadPedidoAdmin;


window.obtenerTotalPedidoAdmin =
    obtenerTotalPedidoAdmin;


window.obtenerUsuarioIdPedido =
    obtenerUsuarioIdPedido;


window.obtenerAñoSeleccionadoPedidos =
    obtenerAñoSeleccionadoPedidos;


window.calcularPuntosPedidoAdmin =
    calcularPuntosPedidoAdmin;