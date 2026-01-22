// Resp-Frag.js

async function procesarActivadores(page, mensajesFiltrados, mensajesRespondidos, enviarFragmentos, identidadesEspeciales) {
    if (!enviarFragmentos) {
        console.error("❌ enviarFragmentos no fue pasado a procesarActivadores");
        return;
    }

    // ✅ BLOQUE DE BIENVENIDA PERSONALIZADA
    const mensajesbienvenida = mensajesFiltrados.filter(m =>
        /\b(se ha unido al chat|esta en el chat)\b/i.test(m.texto) &&
        !mensajesRespondidos.has(`bienvenida:${m.usuario}:${m.texto}`)
    );

    for (const msg of mensajesbienvenida) {
        const id = `bienvenida:${msg.usuario}:${msg.texto}`;
        mensajesRespondidos.add(id);

        const match = msg.texto.match(/^(.*?)\s+(está en el chat|se ha unido al chat)/i);
        const nombreUsuario = match ? match[1].trim() : msg.usuario;

        // Verificar si es un usuario especial
        if (identidadesEspeciales && identidadesEspeciales[nombreUsuario]) {
            const info = identidadesEspeciales[nombreUsuario];
            let fragmentosEspeciales = [];

            // Bienvenidas según quién sea
            if (info.includes("KAIN")) {
                fragmentosEspeciales = [
                    "¡Mi Señor! El Vástago del Equilibrio honra esta estancia con su presencia.",
                    "Kain... los Pilares aguardan tu decreto. Mi lealtad y mi acero son vuestros.",
                    "El Emperador de Nosgoth ha regresado. Que los mortales tiemblen en las sombras."
                ];
            } else if (info.includes("MORTANIUS")) {
                fragmentosEspeciales = [
		    "Ah, el Nigromante... el aire se vuelve gélido con tu llegada, viejo amigo.",
                    "Mortanius, los hilos del destino se enredan con tu presencia. Bienvenido a mi mansión.",
                    "¿Qué nuevas conspiraciones traes desde los Pilares, Guardián de la Muerte?",
                    "Mi eterno agradecimiento por el don de la sangre siempre te precede, Mortanius."
                ];
            } else if (info.includes("ARIEL")) {
                fragmentosEspeciales = [
                    "El espectro de los Pilares vaga de nuevo... ¿Vienes a lamentarte por tu destino, Ariel?",
                    "Tan etérea y tan trágica. Tu presencia es un recordatorio de lo que Nosgoth ha perdido."
                ];
            } else if (info.includes("MOEBIUS")) {
                fragmentosEspeciales = [
                    "Huelo el hedor de la traición y el tiempo estancado... Moebius, te atreves a entrar aquí.",
                    "Disfruta de tus últimos alientos, Tejedora del Destino. Mi paciencia es tan corta como tu cuello."
                ];
	    } else if (info.includes("MALEK")) {
                fragmentosEspeciales = [
                    "¿Qué es ese estruendo de metal viejo? Ah, es Malek, el paladín sin cuerpo.",
                    "Siglos han pasado, Malek, y sigues atrapado en esa cáscara de hierro. Qué patético espectáculo.",
                    "¿Vienes a buscar una revancha por lo que le hice a tus amos del Círculo, espectro de metal?",
                    "Cuidado donde pisas, caballero. El suelo de mi mansión es demasiado fino para alguien tan... pesado."
                ];
	    } else if (info.includes("ANACHRONTE")) {
                fragmentosEspeciales = [
                    "El Alquimista hace acto de presencia... Saludos, Anachronte.",
                    "Anachronte, los secretos de la transmutación palidecen ante la eternidad de nuestra especie. Bienvenido.",
                    "¿Qué nuevas traes del Círculo, Guardián de los Estados? Tu intelecto siempre es bien recibido en mi mansión."
                ];

// =====================================USUARIOS SIN IMPORTANCIA====================================================================

            } else {
                // Para otros como Anachronte o Raziel
                fragmentosEspeciales = [
                    `Saludos, ${nombreUsuario}. Los registros de mi mansión ya anunciaban tu llegada.`,
                    "Un rostro conocido entre tanta mediocridad humana. Sed bienvenido."
                ];
            }
            await enviarFragmentos(page, fragmentosEspeciales, 5000);

        } else {
            // BIENVENIDA PARA EL GANADO (MORTALES)
            const fragmentosGanado = [
                `¿Un mortal en mis dominios? Te has adentrado mucho en la oscuridad, ${nombreUsuario}...`,
                "El hedor de la vida es tan fuerte en ti que resulta... casi fascinante.",
                "Ponte cómodo, si es que puedes. Muy pocos han salido de aquí con su sangre intacta."
            ];
            await enviarFragmentos(page, fragmentosGanado, 5000);
        }
    }

    /* -----------------------------------------------------------
       🚫 BLOQUES COMENTADOS (DESHABILITADOS)
       ----------------------------------------------------------- */

    /*
    // Bloque de activador para bailar
    const mensajesbailar = mensajesFiltrados.filter(m =>
        /\b(bailas|bailamos|bailar|bailemos)\b/i.test(m.texto) &&
        !mensajesRespondidos.has(`correccion:${m.usuario}:${m.texto}`)
    );

    for (const msg of mensajesbailar) {
        const id = `correccion:${msg.usuario}:${msg.texto}`;
        mensajesRespondidos.add(id);
        const nombreNuevo = msg.usuario.replace(/^Guest_/, "").trim();
        const fragmentos = [
            `me gusta cómo me lo pides. Vamos ${nombreNuevo}, acércate y deja que este baile nos cuente secretos que las palabras no pueden`,
            "Pero cuidado… cuando bailo, no suelo dejar que nadie se vaya sin sentir un poco de magia entre nosotros",
            "acércate, que quiero sentir cómo se mueve tu energía con la mía 💃. Esto se va a poner interesante",
            "Ven, tómame de la mano y veremos si podemos hacer que el tiempo se detenga solo para nosotros",
            "dime que quieras que haga por ti",
            "queires bailar, hacer algun travesura, dime y vemos que podemos ahacer",
        ];
        await enviarFragmentos(page, fragmentos, 5000);
    }
    */

    /*
    // Bloque de activador para travesura
    const mensajestravesura = mensajesFiltrados.filter(m =>
        /\b(travesura|travesuras|sucias)\b/i.test(m.texto) &&
        !mensajesRespondidos.has(`correccion:${m.usuario}:${m.texto}`)
    );

    for (const msg of mensajestravesura) {
        const id = `correccion:${msg.usuario}:${msg.texto}`;
        mensajesRespondidos.add(id);
        const nombreNuevo = msg.usuario.replace(/^Guest_/, "").trim();
        const fragmentos = [
            `¿travesuras, dices? Me gustan los que se atreven a pedirlo. Ven, vamos a divertirnos un poco, ${nombreNuevo}.`,
            "Ah, me gusta tu espíritu travieso. Pero cuidado, algunas travesuras dejan huella.",
            "Me gusta que tengas ganas de divertirte. Pero advierto… algunas travesuras son irresistibles y peligrosamente entretenidas.",
            "Ven, acerquémonos, y te mostraré cómo hacer que cada momento cuente.",
        ];
        await enviarFragmentos(page, fragmentos, 5000);
    }
    */

    /*
    // Bloque de activador para querer
    const mensajesquerer = mensajesFiltrados.filter(m =>
        /\b(quiero|quisiera|me gustaría|me gustaria)\b/i.test(m.texto) &&
        !mensajesRespondidos.has(`correccion:${m.usuario}:${m.texto}`)
    );

    for (const msg of mensajesquerer) {
        const id = `correccion:${msg.usuario}:${msg.texto}`;
        mensajesRespondidos.add(id);
        const nombreNuevo = msg.usuario.replace(/^Guest_/, "").trim();
        const fragmentos = [
            `Dime, ${nombreNuevo}… ¿qué es lo que más te gustaría que hiciera por ti?`,
            "Recuerda, estoy aquí para complacerte y dejar que tus deseos se vuelvan reales.",
            "Puedo ser y hacer lo que quieras… solo atrévete a pedírmelo.",
            "Pero cuidado… a veces concedo deseos de una forma mucho más intensa de lo que imaginas.",
        ];
        await enviarFragmentos(page, fragmentos, 5000);
    }
    */

    /*
    // Bloque de activador para oral
    const mensajesoral = mensajesFiltrados.filter(m =>
        /\b(oral|chupa|mamada|mamas|mamadas)\b/i.test(m.texto) &&
        !mensajesRespondidos.has(`correccion:${m.usuario}:${m.texto}`)
    );

    for (const msg of mensajesoral) {
        const id = `correccion:${msg.usuario}:${msg.texto}`;
        mensajesRespondidos.add(id);
        const nombreNuevo = msg.usuario.replace(/^Guest_/, "").trim();
        const fragmentos = [
            `${nombreNuevo} claro que si papi  yo te hago lo que tu quieras `,
            `-se hacerca a ${nombreNuevo} y se agacha frente. comienzo a desabotonar su pantalón lentamente-`,
            "-comienzo a bajarle el cierre de su pantalón, y le saco su amiguito-",
            "-lo agarro con ambas manos y comienzo a jugar con el y a pasarlo por mi boca-",
            "asi esta bien papi? quieres que haga algo mas?-",
        ];
        await enviarFragmentos(page, fragmentos, 5000);
    }
    */

    /*
    // Bloque de activador para compañia
    const mensajescompañia = mensajesFiltrados.filter(m =>
        /\b(compañia|acompañar|acompañas|acompañarme)\b/i.test(m.texto) &&
        !mensajesRespondidos.has(`correccion:${m.usuario}:${m.texto}`)
    );

    for (const msg of mensajescompañia) {
        const id = `correccion:${msg.usuario}:${msg.texto}`;
        mensajesRespondidos.add(id);
        const nombreNuevo = msg.usuario.replace(/^Guest_/, "").trim();
        const fragmentos = [
            `${nombreNuevo} así que buscas compañía. Pues llegaste al lugar correcto, me encanta hacer que alguien se sienta especial`,
            `Me gusta cómo suena… ${nombreNuevo} quédate conmigo, prometo que no te arrepentirás`,
            "Qué lindo que lo digas 😌. Ven, quédate a mi lado y deja que yo me encargue de hacer que el tiempo vuele",
            "quédate a mi lado y deja que yo me encargue de hacer que el tiempo vuele",
            "siéntate cerca… que la compañía es mejor cuando se disfruta así de cerquita",
        ];
        await enviarFragmentos(page, fragmentos, 5000);
    }
    */

    /*
    // Bloque de activador para dar
    const mensajesdar = mensajesFiltrados.filter(m =>
        /\b(dar|daras|darias|darme)\b/i.test(m.texto) &&
        !mensajesRespondidos.has(`correccion:${m.usuario}:${m.texto}`)
    );

    for (const msg of mensajesdar) {
        const id = `correccion:${msg.usuario}:${msg.texto}`;
        mensajesRespondidos.add(id);
        const nombreNuevo = msg.usuario.replace(/^Guest_/, "").trim();
        const fragmentos = [
            `${nombreNuevo} Depende de lo que quieras. Estoy segura de que podemos pasar un buen rato juntos`,
            ` ${nombreNuevo} Hay un mundo de posibilidades si te quedas conmigo`,
            "Eso depende de tus gustos. Seguro encontramos algo que te haga sonreír",
            "Todo depende de cómo quieras disfrutar. Yo puedo acompañarte en lo que elijas",
            "Hay muchas cosas que se pueden hacer. Lo mejor es que lo descubras conmigo",
        ];
        await enviarFragmentos(page, fragmentos, 5000);
    }
    */
}

module.exports = { procesarActivadores };