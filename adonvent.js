/* =========================================================
   DL LUXURY
   VENTAS + USUARIO + PUNTOS

   ESTE ARCHIVO ES INDEPENDIENTE.

   FUNCIONES:
   - Mostrar usuario logueado
   - Mostrar puntos actuales
   - Mostrar información del cliente

   IMPORTANTE:
   - NO agrega puntos automáticamente
   - NO libera puntos automáticamente
   - Los puntos se validan desde admin.js / pedidos-admin.js
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://brnyvkqwkosgtpugxcge.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Qdae9GUtmuosAPP4kemF3A_Vr4HFo0n";


const supabasePuntos =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   OBTENER ELEMENTO
========================================================= */

function obtenerElementoPuntos(id) {

    return document.getElementById(id);

}


/* =========================================================
   MOSTRAR MENSAJE
========================================================= */

function mostrarMensajePuntos(
    mensaje,
    tipo = "info"
) {

    let contenedor =
        obtenerElementoPuntos(
            "mensajePuntos"
        );


    if (!contenedor) {

        return;

    }


    contenedor.textContent =
        mensaje;


    contenedor.style.margin =
        "15px 0";

    contenedor.style.padding =
        "12px 15px";

    contenedor.style.borderRadius =
        "8px";


    if (
        tipo === "error"
    ) {

        contenedor.style.background =
            "#3a1717";

    } else if (
        tipo === "success"
    ) {

        contenedor.style.background =
            "#173a20";

    } else {

        contenedor.style.background =
            "#252525";

    }


    contenedor.style.color =
        "#ffffff";

}


/* =========================================================
   OBTENER USUARIO LOGUEADO
========================================================= */

async function obtenerUsuarioLogueado() {

    try {

        const {
            data,
            error
        } =
            await supabasePuntos
                .auth
                .getUser();


        if (error) {

            console.error(
                "Error obteniendo usuario:",
                error
            );

            return null;

        }


        return data?.user || null;


    } catch (error) {

        console.error(
            "Error inesperado obteniendo usuario:",
            error
        );

        return null;

    }

}


/* =========================================================
   BUSCAR PERFIL
========================================================= */

async function obtenerPerfilUsuario(
    usuarioId
) {

    if (!usuarioId) {

        return null;

    }


    try {

        const {
            data,
            error
        } =
            await supabasePuntos
                .from("perfiles")
                .select(
                    'id,nombre,apellido,correo,"Puntos"'
                )
                .eq(
                    "id",
                    usuarioId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Error buscando perfil:",
                error
            );

            return null;

        }


        return data;


    } catch (error) {

        console.error(
            "Error inesperado buscando perfil:",
            error
        );

        return null;

    }

}


/* =========================================================
   MOSTRAR USUARIO
========================================================= */

async function mostrarUsuarioVentas() {

    const nombreElemento =
        obtenerElementoPuntos(
            "usuarioVentaNombre"
        );


    const correoElemento =
        obtenerElementoPuntos(
            "usuarioVentaCorreo"
        );


    const puntosElemento =
        obtenerElementoPuntos(
            "usuarioVentaPuntos"
        );


    /*
       Si esta sección no existe,
       no hacemos nada.
    */

    if (
        !nombreElemento &&
        !correoElemento &&
        !puntosElemento
    ) {

        return null;

    }


    const usuario =
        await obtenerUsuarioLogueado();


    /* =====================================================
       SIN USUARIO
    ===================================================== */

    if (!usuario) {

        if (nombreElemento) {

            nombreElemento.textContent =
                "Sin usuario";

        }


        if (correoElemento) {

            correoElemento.textContent =
                "";

        }


        if (puntosElemento) {

            puntosElemento.textContent =
                "0";

        }


        return null;

    }


    /* =====================================================
       PERFIL
    ===================================================== */

    const perfil =
        await obtenerPerfilUsuario(
            usuario.id
        );


    const nombre =
        perfil?.nombre ||
        usuario.user_metadata?.nombre ||
        usuario.email ||
        "Cliente";


    const apellido =
        perfil?.apellido ||
        usuario.user_metadata?.apellido ||
        "";


    const nombreCompleto =
        `${nombre} ${apellido}`.trim();


    const correo =
        perfil?.correo ||
        usuario.email ||
        "";


    /*
       IMPORTANTE:

       La columna de Supabase es:

       "Puntos"

       con P mayúscula.
    */

    const puntos =
        Number(
            perfil?.["Puntos"] || 0
        );


    /* =====================================================
       MOSTRAR DATOS
    ===================================================== */

    if (nombreElemento) {

        nombreElemento.textContent =
            nombreCompleto;

    }


    if (correoElemento) {

        correoElemento.textContent =
            correo;

    }


    if (puntosElemento) {

        puntosElemento.textContent =
            puntos;

    }


    return {

        usuario,
        perfil,
        puntos

    };

}


/* =========================================================
   OBTENER PUNTOS
========================================================= */

async function obtenerPuntosUsuario() {

    const usuario =
        await obtenerUsuarioLogueado();


    if (!usuario) {

        return 0;

    }


    const perfil =
        await obtenerPerfilUsuario(
            usuario.id
        );


    return Number(
        perfil?.["Puntos"] || 0
    );

}


/* =========================================================
   REFRESCAR PUNTOS
========================================================= */

async function refrescarPuntosVentas() {

    const usuario =
        await obtenerUsuarioLogueado();


    if (!usuario) {

        return;

    }


    const perfil =
        await obtenerPerfilUsuario(
            usuario.id
        );


    if (!perfil) {

        return;

    }


    const puntosElemento =
        obtenerElementoPuntos(
            "usuarioVentaPuntos"
        );


    if (puntosElemento) {

        puntosElemento.textContent =
            Number(
                perfil["Puntos"] || 0
            );

    }

}


/* =========================================================
   FUNCIÓN DE COMPRA MÍNIMA
========================================================= */

function compraPuedeLiberarPuntos(
    monto
) {

    const total =
        Number(
            monto || 0
        );


    return (
        Number.isFinite(total) &&
        total >= 150
    );

}


/* =========================================================
   CREAR BOTÓN / INFORMACIÓN DE PUNTOS
========================================================= */

/*
   IMPORTANTE:

   Esta función NO agrega puntos.

   Solamente informa al cliente que
   los puntos deben ser validados
   por el administrador.
*/

function crearBotonLiberarPuntos(
    monto,
    ventaId = null
) {

    const contenedor =
        obtenerElementoPuntos(
            "contenedorLiberarPuntos"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML =
        "";


    const total =
        Number(
            monto || 0
        );


    if (
        total >= 150
    ) {

        contenedor.innerHTML = `
            <div style="
                padding:12px;
                border-radius:8px;
                background:#252525;
                color:#d8b56a;
            ">

                <i class="fa-solid fa-circle-info"></i>

                Los puntos de esta compra deben ser
                validados por el administrador.

            </div>
        `;

    } else {

        contenedor.innerHTML = `
            <div style="
                padding:12px;
                border-radius:8px;
                background:#252525;
                color:#aaa;
            ">

                La compra mínima para generar puntos
                es de Q150.00.

            </div>
        `;

    }

}


/* =========================================================
   LIBERAR PUNTOS
========================================================= */

/*
   ESTA FUNCIÓN YA NO AGREGA PUNTOS.

   Se conserva solamente para evitar errores
   con código anterior que pudiera llamarla.
*/

async function liberarPuntos(
    montoCompra,
    ventaId = null
) {

    console.warn(
        "liberarPuntos() ya no agrega puntos automáticamente."
    );


    mostrarMensajePuntos(
        "Los puntos deben ser validados manualmente desde Pedidos.",
        "info"
    );

}


/* =========================================================
   PREPARAR PUNTOS
========================================================= */

async function prepararPuntosVentas(
    montoCompra = 0,
    ventaId = null
) {

    await mostrarUsuarioVentas();


    crearBotonLiberarPuntos(
        montoCompra,
        ventaId
    );

}


/* =========================================================
   EXPONER FUNCIONES
========================================================= */

window.obtenerUsuarioLogueado =
    obtenerUsuarioLogueado;


window.obtenerPerfilUsuario =
    obtenerPerfilUsuario;


window.mostrarUsuarioVentas =
    mostrarUsuarioVentas;


window.obtenerPuntosUsuario =
    obtenerPuntosUsuario;


window.refrescarPuntosVentas =
    refrescarPuntosVentas;


window.compraPuedeLiberarPuntos =
    compraPuedeLiberarPuntos;


window.crearBotonLiberarPuntos =
    crearBotonLiberarPuntos;


window.liberarPuntos =
    liberarPuntos;


window.prepararPuntosVentas =
    prepararPuntosVentas;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            obtenerElementoPuntos(
                "usuarioVentaNombre"
            )
        ) {

            mostrarUsuarioVentas();

        }

    }
);