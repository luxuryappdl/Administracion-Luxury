/* =========================================================
   DL LUXURY
   SELECTOR DE AÑOS

   ESTE ARCHIVO SOLO MANEJA:

   - Crear los años
   - Recuperar el año guardado
   - Guardar el año seleccionado
   - Avisar que el año cambió

   NO ACTUALIZA EL DASHBOARD.
   NO MANEJA VENTAS.
   NO MANEJA INGRESOS.
   NO MANEJA EGRESOS.
   NO MANEJA STOCK.

========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const selector =
            document.getElementById(
                "selectorAño"
            );


        if (!selector) {

            console.warn(
                "⚠️ No se encontró #selectorAño"
            );

            return;
        }


        const ANO_INICIAL =
            2026;


        const CANTIDAD_ANOS =
            42;


        const ANO_KEY =
            "dlLuxuryAñoSeleccionado";


        /* =================================================
           CREAR AÑOS
        ================================================= */

        selector.innerHTML =
            "";


        for (
            let i = 0;
            i < CANTIDAD_ANOS;
            i++
        ) {

            const ano =
                ANO_INICIAL + i;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    ano
                );


            option.textContent =
                String(
                    ano
                );


            selector.appendChild(
                option
            );
        }


        /* =================================================
           RECUPERAR AÑO GUARDADO
        ================================================= */

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
            guardado >= ANO_INICIAL &&
            guardado <=
            ANO_INICIAL +
            CANTIDAD_ANOS -
            1
        ) {

            anoSeleccionado =
                guardado;

        } else {

            anoSeleccionado =
                ANO_INICIAL;


            localStorage.setItem(
                ANO_KEY,
                String(
                    anoSeleccionado
                )
            );
        }


        /* =================================================
           MOSTRAR AÑO EN SELECTOR
        ================================================= */

        selector.value =
            String(
                anoSeleccionado
            );


        /* =================================================
           MOSTRAR AÑO ARRIBA DEL DASHBOARD
        ================================================= */

        const textoAno =
            document.getElementById(
                "añoActual"
            );


        if (textoAno) {

            textoAno.textContent =
                anoSeleccionado;
        }


        /* =================================================
           ÚNICO EVENTO DEL SELECTOR
        ================================================= */

        selector.addEventListener(
            "change",
            function () {

                const ano =
                    Number(
                        this.value
                    );


                if (
                    !Number.isInteger(
                        ano
                    )
                ) {

                    return;
                }


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

                const texto =
                    document.getElementById(
                        "añoActual"
                    );


                if (texto) {

                    texto.textContent =
                        ano;
                }


                console.log(
                    "📅 Selector cambió a:",
                    ano
                );


                /* =========================================
                   AVISAR AL ADMIN.JS
                ========================================= */

                document.dispatchEvent(
                    new CustomEvent(
                        "añoDashboardCambiado",
                        {
                            detail: {
                                año: ano
                            }
                        }
                    )
                );

            }
        );


        console.log(
            "✅ Selector de años listo:",
            anoSeleccionado
        );

    }
);