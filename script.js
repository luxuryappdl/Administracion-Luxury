/* =========================================================
   DL LUXURY
   SCRIPT PRINCIPAL

   ESTE ARCHIVO MANEJA ÚNICAMENTE:

   - Instalación PWA

   =========================================================

   IMPORTANTE:

   EL DASHBOARD LO MANEJA:

   admin.js

   EL SELECTOR DE AÑOS LO MANEJA:

   anos.js

   ESTE ARCHIVO NO MANEJA:

   - Ventas
   - Ingresos
   - Egresos
   - Stock
   - Dashboard
   - Selector de año
   - Año seleccionado
   - Productos
   - Categorías
   - Pedidos

========================================================= */


/* =========================================================
   DL LUXURY
   BOTÓN DE INSTALACIÓN PWA
========================================================= */

let deferredPrompt = null;


/* =========================================================
   OBTENER BOTÓN
========================================================= */

function obtenerBotonInstalarPWA() {

    return document.getElementById(
        "botonInstalarPWA"
    );
}


/* =========================================================
   MOSTRAR BOTÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const botonInstalarPWA =
            obtenerBotonInstalarPWA();


        if (
            botonInstalarPWA
        ) {

            botonInstalarPWA.classList.add(
                "visible"
            );


            console.log(
                "✅ Botón de instalación encontrado."
            );


        } else {

            console.warn(
                "⚠️ No se encontró el botón #botonInstalarPWA."
            );
        }
    }
);


/* =========================================================
   EVENTO DE INSTALACIÓN
========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    function (evento) {

        console.log(
            "📲 PWA disponible para instalar."
        );


        /*
           Evitar que Chrome muestre
           automáticamente el aviso.
        */

        evento.preventDefault();


        deferredPrompt =
            evento;
    }
);


/* =========================================================
   CLICK EN EL BOTÓN DE INSTALACIÓN
========================================================= */

document.addEventListener(
    "click",
    async function (evento) {

        const boton =
            evento.target.closest(
                "#botonInstalarPWA"
            );


        if (!boton) {
            return;
        }


        /*
           Si Chrome todavía no permite
           la instalación.
        */

        if (
            !deferredPrompt
        ) {

            alert(
                "La instalación de DL Luxury todavía no está disponible. " +
                "Verifica que estés usando Chrome o Edge y que la PWA esté correctamente configurada."
            );


            return;
        }


        try {

            /*
               Mostrar ventana de instalación.
            */

            await deferredPrompt.prompt();


            const resultado =
                await deferredPrompt.userChoice;


            console.log(
                "📲 Resultado de instalación:",
                resultado.outcome
            );


        } catch (error) {

            console.error(
                "❌ Error durante la instalación de la PWA:",
                error
            );


        } finally {

            deferredPrompt =
                null;
        }

    }
);


/* =========================================================
   CUANDO LA APP YA FUE INSTALADA
========================================================= */

window.addEventListener(
    "appinstalled",
    function () {

        console.log(
            "✅ DL Luxury fue instalada correctamente."
        );


        deferredPrompt =
            null;


        const botonInstalarPWA =
            obtenerBotonInstalarPWA();


        if (
            botonInstalarPWA
        ) {

            botonInstalarPWA.classList.remove(
                "visible"
            );
        }

    }
);