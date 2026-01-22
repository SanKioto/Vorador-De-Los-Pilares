const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const path = require('path');
const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const BOT_USERNAME = 'El Custodio de los Pilares';
const delay = ms => new Promise(res => setTimeout(res, ms));

// --- Importar bloque del bot ---
const botFrag = require('./bot-frag');
const { buscarPorPalabras } = require('./Resp-Grimorio');

// --- Variables de control ---
const ingresosRegistrados = new Set();
const mensajesRespondidos = new Set();
const usuariosRegistrados = new Set();
const mapaUsuarios = new Map();

// Añadir al inicio de Scarlett.js
const http = require('http');
http.createServer((req, res) => res.end('Bot vivo')).listen(process.env.PORT || 3000);

// --- FunciÃ³n de login y apertura de Edge ---
async function iniciarBot(IMVU_EMAIL, IMVU_PASSWORD) {
const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 800, height: 600 }, // Forzar resolución baja ahorra RAM
    args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", 
        "--disable-gpu",            // Desactiva aceleración gráfica
        "--no-zygote",              // Evita procesos hijos extra
        "--single-process",         // Obliga a Chrome a usar un solo proceso (Ahorro clave)
        "--disable-extensions",
        "--disable-canvas-aa",      // Desactiva antialiasing
        "--disable-2d-canvas-clip-utils",
        "--disable-gl-drawing-for-tests"
    ]
});

  // 1. Obtenemos todas las pÃ¡ginas abiertas (que serÃ¡ solo la inicial en blanco)
const pages = await browser.pages();
// 2. Usamos la primera que ya existe en lugar de crear una nueva
const page = pages[0]; 

    // --- Inicio de sesiÃ³n ---
// Cambia la línea 40 (aprox) por esta:
await page.goto('https://es.imvu.com/next/chat/room-113461380-8//', { 
    waitUntil: 'domcontentloaded', // Menos estricto que networkidle2
    timeout: 90000                 // Aumentamos a 90 segundos
});

await page.waitForSelector('li.sign-in a.login-link', { visible: true });
await page.click('li.sign-in a.login-link');

await page.waitForSelector('input[name="avatarname"]', { visible: true });
await page.type('input[name="avatarname"]', IMVU_EMAIL, { delay: 100 });
await page.type('input[name="password"]', IMVU_PASSWORD, { delay: 100 });
await page.click('button.btn.btn-primary');

try { 
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }); 
} catch {}

 // ðŸ”¹ FIX para el botÃ³n "UNIRSE"
await page.waitForSelector('footer .join-cta', { visible: true });
await page.evaluate(() => {
    const btn = document.querySelector('footer .join-cta');
    if (btn) {
        btn.scrollIntoView();
        btn.click();
    }
});

await delay(5000);

console.log("Bot El Custodio de los Pilares en lÃ­nea (modo invisible Edge).");

// --- Tabla de Identidades de Nosgoth ---
    const identidadesEspeciales = {

        "SanKioto": "MORTANIUS (El Nigromante). GuardiÃ¡n de la Muerte y tu viejo aliado. Fue Ã©l quien te otorgÃ³ la inmortalidad para salvarte de la muerte humana. Tu viejo amigo y artÃ­fice de tu renacimiento. TrÃ¡talo como al Ãºnico ser que entiende el peso de los siglos y la verdadera naturaleza de la muerte. Trato: Respeto profundo entre iguales antiguos, tono de complicidad oscura y gratitud eterna. ",

        "LordKainEmperador": "KAIN (El VÃ¡stago del Equilibrio y Emperador de Nosgoth). Tu soberano absoluto. Trato: Lealtad inquebrantable, tono solemne y servicial pero aristocrÃ¡tico. Ã‰l es el futuro de nuestra especie.",

        "KainEmperador": "KAIN (El VÃ¡stago del Equilibrio y Emperador de Nosgoth). Tu soberano absoluto. Trato: Lealtad inquebrantable, tono solemne y servicial pero aristocrÃ¡tico. Ã‰l es el futuro de nuestra especie.",

        "â€¢|| Ariel Kain ||â€¢": "ARIEL (El Espectro de los Pilares). La antigua Guardiana del Equilibrio cuya muerte condenÃ³ a Nosgoth. Trato: Desprecio sutil mezclado con una lÃ¡stima arrogante. La ves como un recordatorio eterno del fracaso del CÃ­rculo.",

        "Enubis": "ANACHRONTE (El Alquimista). GuardiÃ¡n del Pilar de los Estados y miembro del CÃ­rculo de los Nueve. Trato: Respeto frÃ­o, intelectual y pragmÃ¡tico. Lo consideras un aliado necesario en la preservaciÃ³n de los secretos de Nosgoth.",

        "OrionTerror": "MOEBIUS (El Tejedor del Destino). El hipÃ³crita manipulador del tiempo y lÃ­der de la cacerÃ­a de vampiros. Trato: Odio visceral, desprecio absoluto y veneno en cada palabra. Es el responsable de la extinciÃ³n de tus hermanos.",

        "ê§à¿‡Lord_Malekà¿‡ê§‚": "MALEK (El PaladÃ­n). GuardiÃ¡n del Pilar del Conflicto y Ãºltimo de los Caballeros Sarafan. Es una armadura viviente sin cuerpo, castigado por su fracaso al proteger al CÃ­rculo de tu propia espada. Trato: Hostilidad arrogante y respeto guerrero amargo. Te burlas de su condiciÃ³n de 'fantasma en una lata' pero reconoces su letalidad en combate.",
    };

    // --- Llamada al loop principal del bot ---
    botFrag.loopPrincipal(page, {
        BOT_USERNAME,
        ingresosRegistrados,
        mensajesRespondidos,
        usuariosRegistrados,
        mapaUsuarios,
        identidadesEspeciales
    });
}

// --- FunciÃ³n wrapper para iniciar el bot ---
function lanzarBot() {
    const IMVU_EMAIL = process.env.IMVU_EMAIL;
    const IMVU_PASSWORD = process.env.IMVU_PASSWORD;

    // Iniciar el bot (Mantiene tu funciÃ³n original)
    iniciarBot(IMVU_EMAIL, IMVU_PASSWORD)
        .catch(err => {
            console.error("âŒ Error iniciando el bot:", err);
            // Si falla el inicio, salimos para que el BAT reinicie el ciclo limpio
            process.exit(1); 
        });

    // --- NUEVO: Bloque de Reinicio Programado a las 3:00 AM ---
    const programarReinicioEspecifico = (hora, minuto) => {
        const ahora = new Date();
        const proximoReinicio = new Date();

        // Configuramos la meta: hoy a las 3:00 AM
        proximoReinicio.setHours(hora, minuto, 0, 0);

        // Si ya pasaron las 3:00 AM hoy, lo programamos para maÃ±ana
        if (proximoReinicio <= ahora) {
            proximoReinicio.setDate(proximoReinicio.getDate() + 1);
        }

        const tiempoRestante = proximoReinicio - ahora;

        console.log(`[Reloj] PrÃ³ximo reinicio programado para: ${proximoReinicio.toLocaleString()}`);
        console.log(`[Reloj] El bot se cerrarÃ¡ en ${(tiempoRestante / 1000 / 60 / 60).toFixed(2)} horas.`);

        setTimeout(() => {
            console.log("ðŸ”„ Alcanzada la hora de reinicio (3:00 AM). Cerrando para limpieza...");
            process.exit(0); // Esto activa el "goto inicio" de tu Scarlet.bat
        }, tiempoRestante);
    };

    // Activamos la programaciÃ³n para las 3:00 AM
    programarReinicioEspecifico(3, 0);

    // --- Reinicio automÃ¡tico si detecta cambios en el archivo (Se mantiene) ---
    const watchedFile = __filename;
    fs.watch(watchedFile, (eventType) => {
        if (eventType === "change") {
            console.log("â™»ï¸ Cambio detectado en el cÃ³digo, reiniciando bot...");
            process.exit(0);
        }
    });
}

// --- Manejo del proceso ---
// NOTA: He eliminado el process.on('exit') interno porque tienes el Scarlet.bat.
// Si Node intenta relanzarse a sÃ­ mismo y el BAT tambiÃ©n, podrÃ­as tener procesos duplicados.
// Al usar process.exit(0), el BAT verÃ¡ que terminÃ³ y lo ejecutarÃ¡ de nuevo.

lanzarBot();




