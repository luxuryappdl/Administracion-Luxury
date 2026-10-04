/* =========================================================
   DL LUXURY
   PEDIDOS - ADMINISTRACIÓN
   =========================================================
   
   SISTEMA DE PUNTOS

   Q1   - Q10    = 1 punto
   Q11  - Q20    = 2 puntos
   Q21  - Q30    = 3 puntos
   ...
   Q190 - Q200   = 20 puntos
   Q200+         = 20 puntos máximo

   MÁXIMO: 20 PUNTOS POR PEDIDO
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

    const numero = Number(valor) || 0;

    return numero.toLocaleString("es-GT", {
        style: "currency",
        currency: "GTQ",
        minimumFractionDigits: 2
    });
}


/* =========================================================
   FECHA
========================================================= */

function formatearFechaPedido(fecha) {

    if (!fecha) return "Sin fecha";

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return "Sin fecha";
    }

    return fechaObj.toLocaleDateString("es-GT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}


/* =========================================================
   HORA
========================================================= */

function formatearHoraPedido(fecha) {

    if (!fecha) return "";

    const fechaObj = new Date(fecha);

    if (Number.isNaN(fechaObj.getTime())) {
        return "";
    }

    return fechaObj.toLocaleTimeString("es-GT", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================================================
   AÑO SELECCIONADO
========================================================= */

function obtenerAñoSeleccionadoPedidos() {

    const selector = document.getElementById("selectorAño");

    if (!selector) {
        return new Date().getFullYear();
    }

    const valor = Number(selector.value);

    return valor || new Date().getFullYear();
}


/* =========================================================
   PRODUCTOS DEL PEDIDO
========================================================= */

function obtenerProductosPedidoAdmin(pedido) {

    if (!pedido) return [];

    let productos = pedido.productos;

    if (!productos) {
        return [];
    }

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

    if (!Array.isArray(productos)) {

        if (typeof productos === "object") {
            return [productos];
        }

        return [];
    }

    return productos;
}


/* =========================================================
   CANTIDAD
========================================================= */

function obtenerCantidadPedidoAdmin(pedido) {

    const productos = obtenerProductosPedidoAdmin(pedido);

    if (!productos.length) {
        return 0;
    }

    return productos.reduce((total, producto) => {

        const cantidad =
            Number(
                producto?.cantidad ??
                producto?.qty ??
                producto?.quantity ??
                1
            ) || 1;

        return total + cantidad;

    }, 0);
}


/* =========================================================
   TOTAL
========================================================= */

function obtenerTotalPedidoAdmin(pedido) {

    if (!pedido) return 0;

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

   NUEVA REGLA:

   Q1  - Q10   = 1 punto
   Q11 - Q20   = 2 puntos
   Q21 - Q30   = 3 puntos

   ...

   MÁXIMO = 20 puntos
========================================================= */

function calcularPuntosPedidoAdmin(total) {

    const valor = Number(total) || 0;

    if (valor <= 0) {
        return 0;
    }

    const puntos = Math.ceil(valor / 10);

    return Math.min(puntos, 20);
}


/* =========================================================
   OBTENER ID DEL USUARIO
========================================================= */

function obtenerUsuarioIdPedido(pedido) {

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

function obtenerNombreClientePedido(pedido) {

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

function obtenerCorreoClientePedido(pedido) {

    return (
        pedido?.cliente_correo ||
        pedido?.correo ||
        pedido?.email ||
        pedido?.correo_cliente ||
        ""
    );
}


/* =========================================================
   BUSCAR PERFIL DEL CLIENTE
========================================================= */

async function buscarPerfilClientePedido(pedido) {

    /*
       1. Primero intentamos encontrarlo por ID.
    */

    const posiblesIds = [
        pedido?.usuario_id,
        pedido?.user_id,
        pedido?.cliente_id,
        pedido?.usuario,
        pedido?.cliente
    ].filter(Boolean);


    for (const id of posiblesIds) {

        try {

            const { data, error } =
                await supabasePedidos
                    .from("perfiles")
                    .select("*")
                    .eq("id", id)
                    .maybeSingle();

            if (error) {

                console.warn(
                    "Error buscando perfil por ID:",
                    error
                );

                continue;
            }

            if (data) {

                return {
                    perfil: data,
                    id: data.id
                };
            }

        } catch (error) {

            console.warn(
                "Error buscando perfil:",
                error
            );
        }
    }


    /*
       2. Si no encontramos por ID,
          buscamos por correo.
    */

    const correoPedido =
        obtenerCorreoClientePedido(pedido)
            .trim()
            .toLowerCase();


    if (!correoPedido) {

        return {
            perfil: null,
            id: null
        };
    }


    /*
       IMPORTANTE:
       No usamos .eq("correo") directamente porque
       no sabemos si la tabla tiene esa columna.

       Traemos los perfiles y buscamos en JS.
    */

    try {

        const { data, error } =
            await supabasePedidos
                .from("perfiles")
                .select("*");

        if (error) {

            console.error(
                "Error consultando perfiles:",
                error
            );

            return {
                perfil: null,
                id: null,
                error
            };
        }


        const perfiles = data || [];


        const perfilEncontrado =
            perfiles.find(perfil => {

                const correos = [

                    perfil?.correo,
                    perfil?.email,
                    perfil?.correo_electronico,
                    perfil?.email_usuario

                ]
                    .filter(Boolean)
                    .map(correo =>
                        String(correo)
                            .trim()
                            .toLowerCase()
                    );

                return correos.includes(correoPedido);
            });


        if (perfilEncontrado) {

            return {
                perfil: perfilEncontrado,
                id: perfilEncontrado.id
            };
        }


    } catch (error) {

        console.error(
            "Error buscando cliente por correo:",
            error
        );

        return {
            perfil: null,
            id: null,
            error
        };
    }


    return {
        perfil: null,
        id: null
    };
}


/* =========================================================
   CARGAR PEDIDOS
========================================================= */

async function cargarPedidosAdministracion() {

    const contenedor =
        document.getElementById("listaPedidos");

    if (!contenedor) {
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


        const { data, error } =
            await supabasePedidos
                .from("pedidos")
                .select("*")
                .gte("creado_en", inicio)
                .lt("creado_en", fin)
                .order("creado_en", {
                    ascending: false
                });


        if (error) {

            console.error(
                "Error cargando pedidos:",
                error
            );

            contenedor.innerHTML = `
                <div class="sin-tickets">
                    Error al cargar los pedidos.
                    <br>
                    ${escaparHTMLPedidos(error.message)}
                </div>
            `;

            return;
        }


        if (!data || !data.length) {

            contenedor.innerHTML = `
                <div class="sin-tickets">
                    No hay pedidos para ${año}.
                </div>
            `;

            return;
        }


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
                <br>
                ${escaparHTMLPedidos(error.message)}
            </div>
        `;
    }
}


/* =========================================================
   CREAR TARJETA
========================================================= */

function crearTarjetaPedidoAdmin(pedido) {

    const id =
        pedido?.id ?? "";

    const nombre =
        obtenerNombreClientePedido(pedido);

    const correo =
        obtenerCorreoClientePedido(pedido);

    const fecha =
        formatearFechaPedido(pedido?.creado_en);

    const hora =
        formatearHoraPedido(pedido?.creado_en);

    const productos =
        obtenerProductosPedidoAdmin(pedido);

    const cantidad =
        obtenerCantidadPedidoAdmin(pedido);

    const total =
        obtenerTotalPedidoAdmin(pedido);

    const puntos =
        calcularPuntosPedidoAdmin(total);

    const estado =
        String(pedido?.estado || "pendiente")
            .toLowerCase();


    const confirmada =
        estado === "confirmada";


    const puntosValidados =
        pedido?.puntos_validados === true;


    let productosHTML = "";


    if (productos.length) {

        productosHTML =
            productos
                .map(producto => {

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
                            ${escaparHTMLPedidos(nombreProducto)}
                            × ${cantidadProducto}
                        </div>
                    `;

                })
                .join("");

    } else {

        productosHTML =
            `<div>Sin productos registrados</div>`;
    }


    let botonCompra = "";

    let botonPuntos = "";


    /*
       CONFIRMAR COMPRA
    */

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


    /*
       PUNTOS
    */

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

        botonPuntos = `
            <button
                type="button"
                class="btn-secundario"
                disabled
            >
                <i class="fa-solid fa-star"></i>
                Puntos otorgados:
                ${Number(pedido?.puntos_generados) || puntos}
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
                        ${hora ? ` · ${hora}` : ""}
                    </span>
                </div>

                <span class="badge-estado ${escaparHTMLPedidos(estado)}">
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
   CONFIRMAR COMPRA
========================================================= */

window.confirmarCompraPedido = async function (pedidoId) {

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

        const { data: pedido, error: errorPedido } =
            await supabasePedidos
                .from("pedidos")
                .select("*")
                .eq("id", pedidoId)
                .maybeSingle();


        if (errorPedido) {

            console.error(
                errorPedido
            );

            alert(
                "No se pudo obtener el pedido:\n" +
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


        const { error } =
            await supabasePedidos
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
                "No se pudo confirmar la compra:\n" +
                error.message
            );

            return;
        }


        alert(
            "Compra confirmada correctamente."
        );


        await cargarPedidosAdministracion();


    } catch (error) {

        console.error(error);

        alert(
            "Ocurrió un error:\n" +
            error.message
        );
    }
};


/* =========================================================
   DAR PUNTOS
========================================================= */

window.darPuntosPedido = async function (pedidoId) {

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

        /*
           OBTENER PEDIDO
        */

        const { data: pedido, error: errorPedido } =
            await supabasePedidos
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


        /*
           VERIFICAR ESTADO
        */

        const estado =
            String(pedido.estado || "")
                .toLowerCase();


        if (estado !== "confirmada") {

            alert(
                "Primero debes confirmar la compra."
            );

            return;
        }


        /*
           EVITAR DUPLICADOS
        */

        if (pedido.puntos_validados === true) {

            alert(
                "Los puntos de este pedido ya fueron otorgados."
            );

            return;
        }


        /*
           CALCULAR PUNTOS
        */

        const total =
            obtenerTotalPedidoAdmin(pedido);


        const puntos =
            calcularPuntosPedidoAdmin(total);


        if (puntos <= 0) {

            alert(
                "El pedido no tiene un total válido para generar puntos."
            );

            return;
        }


        /*
           BUSCAR CLIENTE
        */

        const resultadoPerfil =
            await buscarPerfilClientePedido(pedido);


        const perfil =
            resultadoPerfil?.perfil;


        const usuarioId =
            resultadoPerfil?.id;


        if (!perfil || !usuarioId) {

            const nombre =
                obtenerNombreClientePedido(pedido);


            const correo =
                obtenerCorreoClientePedido(pedido);


            alert(
                "No se encontró el perfil del cliente.\n\n" +
                "Pedido: #" + pedidoId + "\n" +
                "Cliente: " + nombre + "\n" +
                "Correo: " + (correo || "Sin correo") +
                "\n\n" +
                "El pedido necesita tener un usuario asociado " +
                "por ID o un correo que coincida con la tabla perfiles."
            );

            return;
        }


        /*
           PUNTOS ACTUALES
        */

        const puntosActuales =
            Number(perfil["Puntos"]) || 0;


        const nuevosPuntos =
            puntosActuales + puntos;


        console.log(
            "PUNTOS:",
            {
                pedidoId,
                usuarioId,
                puntosActuales,
                puntosGenerados: puntos,
                nuevosPuntos
            }
        );


        /*
           ACTUALIZAR PERFIL
        */

        const { error: errorPerfil } =
            await supabasePedidos
                .from("perfiles")
                .update({
                    "Puntos": nuevosPuntos
                })
                .eq("id", usuarioId);


        if (errorPerfil) {

            console.error(
                "Error actualizando puntos:",
                errorPerfil
            );

            alert(
                "No se pudieron generar los puntos.\n\n" +
                "Error de perfiles:\n" +
                errorPerfil.message
            );

            return;
        }


        /*
           MARCAR PEDIDO COMO VALIDADO
        */

        const { error: errorValidarPedido } =
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
                .eq("id", pedidoId);


        /*
           SI FALLA EL PEDIDO,
           INTENTAMOS DEVOLVER LOS PUNTOS
        */

        if (errorValidarPedido) {

            console.error(
                "Error validando pedido:",
                errorValidarPedido
            );


            await supabasePedidos
                .from("perfiles")
                .update({
                    "Puntos": puntosActuales
                })
                .eq("id", usuarioId);


            alert(
                "Los puntos no pudieron quedar registrados " +
                "en el pedido.\n\n" +
                "Los puntos fueron revertidos para evitar " +
                "duplicarlos.\n\n" +
                "Error:\n" +
                errorValidarPedido.message
            );

            return;
        }


        /*
           TODO CORRECTO
        */

        alert(
            "¡Puntos generados correctamente!\n\n" +
            "Cliente: " +
            obtenerNombreClientePedido(pedido) +
            "\n\n" +
            "Puntos generados: " +
            puntos +
            "\n\n" +
            "Puntos anteriores: " +
            puntosActuales +
            "\n" +
            "Puntos nuevos: " +
            nuevosPuntos
        );


        /*
           RECARGAR PEDIDOS
        */

        await cargarPedidosAdministracion();


    } catch (error) {

        console.error(
            "Error generando puntos:",
            error
        );

        alert(
            "Ocurrió un error al generar los puntos:\n\n" +
            error.message
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
            document.getElementById("selectorAño");


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
