const fs = require("fs");
const regFrag = require('./reg-frag');
const respActivadores = require('./resp-activadores');
const respFrag = require('./Resp-Frag');
const respGrimorio = require('./Resp-Grimorio');
const maestroFrag = require('./maestro');
//const limpiarFrag = require('./limpiar');
const { dejarMensaje, obtenerMensajes } = require("./mensajero");
const respGemini = require('./Resp-Gemini'); // <--- IMPORTACIÃ“N DE GEMINI

// --- NUEVO: GestiÃ³n de Cola de Mensajes ---
const colaMensajes = [];
let enviandoMensaje = false;

// --- NUEVO: Puente que recibe el mensaje y lo manda a la cola ---
// --- NUEVO: Puente que recibe el mensaje y lo manda a la cola ---
async function enviarMensaje(page, texto, BOT_USERNAME) {
    if (!texto) return;
    // Anotamos el mensaje en la lista de espera
    colaMensajes.push({ texto, BOT_USERNAME });
    // Le decimos al procesador que empiece a trabajar (sin await para no frenar el loop)
    procesarCola(page);
}

// --- FUNCIÃ“N RESTAURADA: AquÃ­ estaba el error ---
async function enviarMensajeOriginal(page, texto, BOT_USERNAME, esFragmento = false) {
    const LONGITUD_MAXIMA = 240;

    // LÃ³gica de fragmentaciÃ³n integrada
    if (!esFragmento && texto.length > LONGITUD_MAXIMA) {
        const fragmentos = [];
        let textoRestante = texto;

        while (textoRestante.length > 0) {
            if (textoRestante.length <= LONGITUD_MAXIMA) {
                fragmentos.push(textoRestante);
                break;
            }
            let indiceCorte = textoRestante.lastIndexOf('. ', LONGITUD_MAXIMA);
            if (indiceCorte === -1) indiceCorte = textoRestante.lastIndexOf(', ', LONGITUD_MAXIMA);
            if (indiceCorte === -1) indiceCorte = textoRestante.lastIndexOf(' ', LONGITUD_MAXIMA);
            if (indiceCorte === -1) indiceCorte = LONGITUD_MAXIMA;
            else indiceCorte += 1;

            fragmentos.push(textoRestante.substring(0, indiceCorte).trim());
            textoRestante = textoRestante.substring(indiceCorte).trim();
        }

        await enviarFragmentos(page, fragmentos, 2000, BOT_USERNAME);
        return; 
    }

    // LÃ³gica original para enviar al navegador
    const textareaSelector = 'textarea.input-text.no-focus';
    const botonEnviarSelector = 'button.btn.btn-small.btn-ghost.btn-strokeless.btn-send';

    await page.evaluate((selector, texto) => {
        const textarea = document.querySelector(selector);
        if (textarea) {
            textarea.value = texto;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, textareaSelector, texto);

    await page.evaluate(selector => {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.disabled = false;
            btn.click();
        }
    }, botonEnviarSelector);

    regFrag.registrarConversacion(BOT_USERNAME, texto);
}

// --- FunciÃ³n para enviar fragmentos ---
async function enviarFragmentos(page, fragmentos, pausa = 2000, BOT_USERNAME) {
    for (const frag of fragmentos) {
        await enviarMensajeOriginal(page, frag, BOT_USERNAME, true); 
        await new Promise(res => setTimeout(res, pausa));
    }
}
// --- Simular actividad ---
async function simularActividad(page) {
    await page.evaluate(() => {
        document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
    });
}

// --- Stub de irAlUsuario ---
async function irAlUsuario(page, usuario) {
    console.log(`FunciÃ³n irAlUsuario llamada para: ${usuario}`);
}

// --- Loop principal del bot ---
async function loopPrincipal(page, { BOT_USERNAME, ingresosRegistrados, mensajesRespondidos, usuariosRegistrados, mapaUsuarios, identidadesEspeciales }) {
    setInterval(() => simularActividad(page), 60000);

    while (true) {
        try {
            const mensajes = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.cs2-msg')).map(el => {
                    let usuario = el.querySelector('.cs2-name')?.innerText?.trim();
                    const texto = el.querySelector('.cs2-text')?.innerText?.trim() || "";

                    if (!usuario && el.dataset.id) {
                        const match = el.dataset.id.match(/user-(\d+)/);
                        if (match) usuario = `user-${match[1]}`;
                    }
                    if (!usuario) usuario = "desconocido";

                    let avatarUrl = el.querySelector('.cs2-thumb img')?.src || 
                                    el.querySelector('img.cs2-thumb')?.src || '';

                    return { texto, usuario, avatarUrl };
                });
            });

            for (const m of mensajes) {
                const nombreUnico = m.usuario;
                const avatarUrl = m.avatarUrl || '';
                const frasesSistema = [
                    'estÃ¡ en el chat', 'estan en el chat', 'se ha unido al chat', 'esta en el chat',
                    'ha salido del chat', 'ha abandonado el chat'
                ];

                const esIngreso = frasesSistema.some(frase => m.texto.includes(frase));

                if (esIngreso) {
                    const nombrePantalla = m.texto
                        .replace('estÃ¡ en el chat', '')
                        .replace('estan en el chat', '')
                        .replace('se ha unido al chat','')
                        .replace('ha salido del chat','')
                        .replace('ha abandonado el chat','')
                        .trim();

                    mapaUsuarios.set(nombreUnico, nombrePantalla);

                    if (!usuariosRegistrados.has(nombreUnico)) {
                        usuariosRegistrados.add(nombreUnico);
                        const timestamp = new Date().toLocaleString('es-MX', { hour12: false });
                        const linea = `[${timestamp}] [USER] ${nombrePantalla} se ha unido al chat\n`;
                        fs.appendFileSync(regFrag.getUsersLogFile(), linea, 'utf8');
                    }

                    const ingresoId = nombreUnico + m.texto;
                    if (!ingresosRegistrados.has(ingresoId)) {
                        ingresosRegistrados.add(ingresoId);
                        regFrag.registrarUsuarioCompleto(nombrePantalla, nombreUnico, nombreUnico, avatarUrl);
                    }
                    continue;
                }

                const nombreParaChat = mapaUsuarios.get(nombreUnico) || nombreUnico;
                regFrag.registrarConversacion(nombreParaChat, m.texto);
            }

            const IGNORAR_USUARIOS = [BOT_USERNAME, "desconocido", "Tu", "tÃº", "user-387784429", "desconocido"];
            const mensajesFiltrados = mensajes.filter(m => !IGNORAR_USUARIOS.includes(m.usuario));

            // Bloque de mensajero (LÃ³gica original)
            const usuariosExcluidos = ["El Custodio de los Pilares", "ElCustodiodelosPilar", "user-387784429", "desconocido", BOT_USERNAME]; 

            for (const { texto, usuario } of mensajesFiltrados) {
                const keyMensaje = usuario + texto;
                if (mensajesRespondidos.has(keyMensaje)) continue;

                if (/dile a tu amo|dejale un mensaje a tu amo|avÃ­sale a tu amo|dile a/i.test(texto) && !usuariosExcluidos.includes(usuario)) {
                    dejarMensaje(usuario, texto);
                    await enviarMensaje(page, `Muy bien, ${usuario}, le darÃ© tu mensaje a mi amo cuando regrese.`, BOT_USERNAME);
                    mensajesRespondidos.add(keyMensaje);
                    continue;
                }

                if (texto.includes("leer mensajes")) {
                    const mensajesPendientes = obtenerMensajes();
                    if (mensajesPendientes.length > 0) {
                        for (const m of mensajesPendientes) {
                            await enviarMensaje(page, `Mi SeÃ±or, ${m.de} dejÃ³ este mensaje para usted: "${m.mensaje}" (a las ${m.hora}).`, BOT_USERNAME);
                        }
                    }
                    mensajesRespondidos.add(keyMensaje);
                    continue;
                }
            }

                for (const mensaje of mensajesFiltrados) {
                const key = mensaje.usuario + mensaje.texto;
                if (mensajesRespondidos.has(key)) continue;
                mensajesRespondidos.add(key);

                const texto = mensaje.texto.trim();

               // ðŸ”¹ BLOQUE INTEGRADO CON MEMORIA DE 7 DÃAS, IDENTIDAD Y LIMPIEZA
if (texto.toLowerCase().startsWith('!c')) {
    const consulta = texto.slice(3).trim(); 
    if (!consulta) {
        await enviarMensaje(page, "Dime algo, no seas tÃ­mido...", BOT_USERNAME);
        continue;
    }

    try {
        console.log(`ðŸ¤– Consultando Gemini para ${mensaje.usuario} (Memoria activa 7 dÃ­as)`);
        
        // 1. Identificar rango (sin alterar el ID del usuario para no romper la memoria)
        const rango = identidadesEspeciales[mensaje.usuario] || "GANADO (Mortal)";
        const contextoIdentidad = `[ACTÃšA ANTE: ${mensaje.usuario} QUE ES ${rango}] `;

        // 2. PASAMOS USUARIO (para memoria) Y CONSULTA (con contexto de identidad)
        let respuestaIA = await respGemini.obtenerRespuestaGemini(mensaje.usuario, contextoIdentidad + consulta);

        // 3. LIMPIEZA DE SALIDA (Para quitar el !c y nombres repetidos)
        respuestaIA = respuestaIA
            .replace(/!c/gi, '') 
            .replace(/Vorador:/gi, '')
            .replace(/ScarlettDuvall:/gi, '')
            .trim();

        enviarMensaje(page, respuestaIA, BOT_USERNAME).catch(err => console.error(err));
    } catch (err) {
        console.error("âŒ Error con Gemini:", err);
        let resultado = await respGrimorio.responderDesdeGrimorioConResumen(consulta);
        if (resultado) await enviarMensaje(page, resultado, BOT_USERNAME);
    }
    continue;
}

                // Otros activadores manuales (creditos, skb, etc.)
                if (await respActivadores.manejarActivadores(page, mensaje, enviarMensaje, irAlUsuario)) {
                    continue;
                }
            }

            // Procesar fragmentos automÃ¡ticos (bailar, bienvenida, travesuras)
            await respFrag.procesarActivadores(page, mensajesFiltrados, mensajesRespondidos, enviarFragmentos, identidadesEspeciales);
            
            await new Promise(res => setTimeout(res, 1000));
        } catch (err) {
            console.error("Error en el loop del bot:", err);
        }
    }
}

// --- NUEVO: Procesador de la cola en segundo plano ---
async function procesarCola(page) {
    // Si ya hay un envÃ­o en curso o la cola estÃ¡ vacÃ­a, no hace nada
    if (enviandoMensaje || colaMensajes.length === 0) return;

    enviandoMensaje = true;
    const { texto, BOT_USERNAME } = colaMensajes.shift();

    try {
        // Llamamos a tu funciÃ³n original (que ya tiene la lÃ³gica de fragmentos)
        // Pero usamos 'await' aquÃ­ para que la COLA espere, no el loop principal
        await enviarMensajeOriginal(page, texto, BOT_USERNAME);
    } catch (err) {
        console.error("âŒ Error en procesador de cola:", err);
    } finally {
    enviandoMensaje = false;
    // Si hay mÃ¡s mensajes, procesar de inmediato (0 o 100ms)
    if (colaMensajes.length > 0) {
        setImmediate(() => procesarCola(page)); 
    }
}
}
// AsegÃºrate de que se vea asÃ­ al final
module.exports = { loopPrincipal, enviarMensaje, enviarFragmentos, simularActividad, irAlUsuario };