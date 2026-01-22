// --- Módulo de registros (reg-frag.js) ---
const fs = require('fs');
const path = require('path');

const BOT_USERNAME = 'El Custodio de los Pilares';
const ingresosRegistrados = new Set();
const mensajesRegistrados = new Set();
const usuariosRegistrados = new Set();
const mensajesJSONRegistrados = new Set();
const usuariosRecientes = new Set();

// --- Configuración de rutas ---
const LOG_DIR = path.join(__dirname, 'registros');
const CHAT_LOG_DIR = path.join(LOG_DIR, 'chats');
const USERS_LOG_DIR = path.join(LOG_DIR, 'usuarios');
const USERS_JSON_FILE = path.join(USERS_LOG_DIR, 'usuarios.json');

// Crear carpetas si no existen
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);
if (!fs.existsSync(CHAT_LOG_DIR)) fs.mkdirSync(CHAT_LOG_DIR);
if (!fs.existsSync(USERS_LOG_DIR)) fs.mkdirSync(USERS_LOG_DIR);

// --- Inicializar archivo JSON global si no existe ---
if (!fs.existsSync(USERS_JSON_FILE)) {
    fs.writeFileSync(USERS_JSON_FILE, JSON.stringify({}, null, 2), 'utf8');
//    console.log("✅ Archivo usuarios.json creado en:", USERS_JSON_FILE);
}

// --- Funciones JSON global ---
function cargarUsuariosJSON() {
    try {
        const data = fs.readFileSync(USERS_JSON_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error leyendo usuarios.json:", err);
        return {};
    }
}

function guardarUsuariosJSON(usuarios) {
    try {
        fs.writeFileSync(USERS_JSON_FILE, JSON.stringify(usuarios, null, 2), 'utf8');
    } catch (err) {
        console.error("Error guardando usuarios.json:", err);
    }
}

function registrarUsuarioJSON(nombrePantalla, nombreBase, nombreUnico, avatarUrl) {
    let usuarios = cargarUsuariosJSON();

    if (!usuarios[nombreUnico]) {
        usuarios[nombreUnico] = { nombrePantalla, nombreBase, avatarUrl, count: 1 };
    } else {
        usuarios[nombreUnico].count++;
        usuarios[nombreUnico].nombrePantalla = nombrePantalla;
        usuarios[nombreUnico].nombreBase = nombreBase;
        usuarios[nombreUnico].avatarUrl = avatarUrl;
    }

    guardarUsuariosJSON(usuarios);
//    console.log(`✅ Usuario ${nombrePantalla} (${nombreBase}) registrado/actualizado en usuarios.json`);
}

// --- Helpers de rutas de log ---
function getChatLogFile() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return path.join(CHAT_LOG_DIR, `${año}-${mes}-${dia}_chat.txt`);
}

function getUsersLogFile() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return path.join(USERS_LOG_DIR, `${año}-${mes}-${dia}_usuarios.txt`);
}

// --- Registrar conversación ---
function registrarConversacion(usuario, texto) {
    if (!texto) return;

    const IGNORAR_USUARIOS_CHAT = ["desconocido", "Tu", "tú", "user-387784429"];
    if (IGNORAR_USUARIOS_CHAT.includes(usuario)) return;
    if (texto.includes('se ha unido al chat') || texto.includes('ha salido del chat')) return;

    const key = usuario + texto;
    if (mensajesRegistrados.has(key)) return;
    mensajesRegistrados.add(key);

    const timestamp = new Date().toLocaleString('es-MX', { hour12: false });
    const esBot = usuario === BOT_USERNAME ? "[BOT]" : "[USER]";
    const linea = `[${timestamp}] ${esBot} ${usuario}: ${texto}\n`;

    fs.appendFileSync(getChatLogFile(), linea, 'utf8');

// --- NUEVAS LLAMADAS ---
    generarHTMLRegistroChatPorUsuario(usuario); // El que ya tenías
    generarHTMLChatGeneral(); // <--- AGREGAR ESTA LÍNEA
}

// --- Registrar usuario en TXT ---
function registrarUsuario(usuario) {
    if (!usuario) return;

    const IGNORAR_USUARIOS_CHAT = ["desconocido", "Tu", "tú", "user-387784429"];
    if (IGNORAR_USUARIOS_CHAT.includes(usuario)) return;
    if (usuario === BOT_USERNAME || usuariosRegistrados.has(usuario)) return;

    usuariosRegistrados.add(usuario);
    const timestamp = new Date().toLocaleString('es-MX', { hour12: false });
    const linea = `[${timestamp}] [USER] ${usuario} se ha unido al chat\n`;
    fs.appendFileSync(getUsersLogFile(), linea, 'utf8');
}

// --- JSON diario ---
function getJsonDailyPath() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return path.join(USERS_LOG_DIR, `${año}-${mes}-${dia}_usuarios.json`);
}

function cargarUsuariosJSONDiario() {  
    const archivoDiario = getJsonDailyPath();
    if (!fs.existsSync(archivoDiario)) return {}; 
    const data = fs.readFileSync(archivoDiario, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Error al leer JSON diario:', e);
        return {};
    }
}

function registrarUsuarioCompleto(nombrePantalla, nombreBase, nombreUnico, avatarUrl) {
    let usuarios = cargarUsuariosJSONDiario();
    if (!usuarios[nombreUnico]) {
        usuarios[nombreUnico] = { nombrePantalla, nombreBase, avatarUrl, count: 1 };
    } else {
        usuarios[nombreUnico].count += 1;
    }
    fs.writeFileSync(getJsonDailyPath(), JSON.stringify(usuarios, null, 2), 'utf8');
    usuariosRecientes.add(nombreUnico);
    generarHTMLLibroDiario();
}

// --- Generar HTML libro diario ---
function generarHTMLLibroDiario() {
    const usuarios = cargarUsuariosJSONDiario();
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const BOOK_HTML_FILE_DAILY = path.join(USERS_LOG_DIR, `${año}-${mes}-${dia}_usuarios.html`);

    let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Usuarios del chat - ${año}-${mes}-${dia}</title>
<style>
body { font-family: Arial, sans-serif; background: #1c1c1c; color: #fff; }
.container { display: flex; flex-wrap: wrap; gap: 15px; padding: 20px; }
.usuario { display: flex; flex-direction: column; align-items: center; width: 120px; transition: transform 0.2s; }
.usuario img { width: 80px; height: 80px; border-radius: 50%; border: 2px solid gold; cursor: pointer; }
.usuario img.recent { border: 3px solid lime; transform: scale(1.05); }
.nombre { margin-top: 5px; text-align: center; font-size: 0.9em; }
.nombre-pantalla { font-weight: bold; }
.nombre-base { font-size: 0.8em; color: #aaa; }
.count { font-size: 0.8em; color: #ffd700; }
button.regchat { margin-top: 5px; padding: 3px 6px; font-size: 0.8em; border: none; border-radius: 6px; cursor: pointer; background: #444; color: #fff; }
button.regchat:hover { background: #666; }
</style>
</head>
<body>
<h1>Usuarios del chat - ${año}-${mes}-${dia}</h1>
<div class="container">`;

    for (const nombreUnico in usuarios) {
    const u = usuarios[nombreUnico];
    const recentClass = usuariosRecientes.has(nombreUnico) ? 'recent' : '';

    // Limpiamos los nombres de símbolos para que coincidan con el archivo físico (.html)
    const pantallaLimpia = limpiarNombreArchivo(u.nombrePantalla);
    const unicoLimpio = limpiarNombreArchivo(nombreUnico);

    // Escapar comillas para el JavaScript del botón
    const pantallaEscapada = pantallaLimpia.replace(/'/g, "\\'");
    const unicoEscapado = unicoLimpio.replace(/'/g, "\\'");

    html += `<div class="usuario">
<a href="https://es.imvu.com/next/av/${u.nombreBase}/" target="_blank">
<img src="${u.avatarUrl}" title="${u.nombrePantalla}" class="${recentClass}">
</a>
<div class="nombre">
  <div class="nombre-pantalla">${u.nombrePantalla}</div>
  <div class="nombre-base">${u.nombreBase}</div>
</div>
<div class="count">Ingresos: ${u.count}</div>
<button class="regchat" onclick="
(function() {
    const nombres = ['${pantallaEscapada}', '${unicoEscapado}'];
    const fecha = '${año}-${mes}-${dia}';
    for (let i = 0; i < nombres.length; i++) {
        const ruta = '../chats/registro_chat_' + nombres[i] + '_' + fecha + '.html';
        try {
            const win = window.open(ruta, '_blank');
            if (win) break;
        } catch(e){}
    }
})()
">RegChat</button>
</div>`;

    }

    html += `</div></body></html>`;
    fs.writeFileSync(BOOK_HTML_FILE_DAILY, html, 'utf8');
    usuariosRecientes.clear();
//    console.log(`✅ Libro HTML diario actualizado: ${BOOK_HTML_FILE_DAILY}`);
}

// --- Generar HTML chat por usuario ---
function generarHTMLRegistroChatPorUsuario(usuario) {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    // Limpiamos el nombre para que coincida con el archivo físico
    const usuarioLimpio = limpiarNombreArchivo(usuario);
    const archivoHTML = path.join(CHAT_LOG_DIR, `registro_chat_${usuarioLimpio}_${año}-${mes}-${dia}.html`);

    // Obtenemos las líneas del chat filtradas por el usuario o el bot
    const chatLines = fs.existsSync(getChatLogFile()) 
        ? fs.readFileSync(getChatLogFile(), 'utf8')
            .split('\n')
            .filter(line => line.includes(`[USER] ${usuario}:`) || line.includes(`[BOT] ${BOT_USERNAME}:`))
        : [];

    // DISEÑO IDENTICO A MORTHEMAR
    let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Registro de chat - ${usuario}</title>
<style>
body { font-family: Arial, sans-serif; background: #111; color: #fff; padding: 20px; }
h1 { text-align: center; }
.log { margin-top: 20px; border: 1px solid #333; padding: 15px; background: #1a1a1a; border-radius: 8px; }
.mensaje { border-bottom: 1px solid #333; padding: 8px; font-size: 0.95em; line-height: 1.4; }
.mensaje:last-child { border-bottom: none; }
.usuario { font-weight: bold; color: #ffd700; } /* Color Dorado para el nombre */
.bot { color: #00ff00; font-weight: bold; } /* Color Verde para el bot */
.texto { margin-left: 10px; color: #ddd; }
.timestamp { color: #666; font-size: 0.8em; margin-right: 8px; }
</style>
</head>
<body>
<h1>Registro de chat de ${usuario}</h1>
<div class="log">`;

    for (const line of chatLines) {
        if (!line.trim()) continue;

        // 1. Limpiar la fecha [00/00/0000 00:00:00] y las etiquetas de sistema
        // La regex /^\[.*?\]\s*/ elimina el primer bloque de corchetes (la fecha)
        let lineaLimpia = line.replace(/^\[.*?\]\s*/, '') 
                              .replace('[USER]', '')
                              .replace('[BOT]', '');

        // 2. Determinar si es un mensaje del Bot para asignar el color
        const esBot = line.includes(`[BOT]`);
        
        // 3. Separar el nombre del contenido usando los ":" como separador
        const indiceDosPuntos = lineaLimpia.indexOf(':');
        
        if (indiceDosPuntos !== -1) {
            // Extraer el nombre (lo que está antes de los puntos)
            const nombre = lineaLimpia.substring(0, indiceDosPuntos).trim();
            // Extraer el mensaje (lo que está después de los puntos, incluyendo los puntos)
            const mensajeRestante = lineaLimpia.substring(indiceDosPuntos);

            // Definir color: Verde para el bot, Dorado para el usuario (#ffd700)
            const colorNombre = esBot ? '#00ff00' : '#ffd700';

            // 4. Construir el HTML con el nombre en negritas (<b>) y con color
            html += `<div class="mensaje">
                <b style="color: ${colorNombre};">${nombre}</b>${mensajeRestante}
            </div>`;
        } else {
            // Si la línea no sigue el formato estándar, se añade limpia
            html += `<div class="mensaje">${lineaLimpia}</div>`;
        }
    }

    // Si no hay mensajes, mostramos un aviso como en Morthemar
    if (chatLines.length === 0 || (chatLines.length === 1 && chatLines[0] === "")) {
        html += `<p style="text-align:center; color:#888;">No hay mensajes registrados para este usuario en el día de hoy.</p>`;
    }

    html += `</div></body></html>`;
    
    fs.writeFileSync(archivoHTML, html, 'utf8');
}
// Función para limpiar nombres de archivos (quitar símbolos como • o |)
function limpiarNombreArchivo(nombre) {
    // Si el nombre no existe o no es una cadena, usamos el nombre del bot o "Desconocido"
    if (!nombre || typeof nombre !== 'string') {
        nombre = typeof BOT_USERNAME !== 'undefined' ? BOT_USERNAME : "Usuario";
    }
    return nombre.replace(/[<>:"/\\|?*•]/g, '_').trim();
}

// --- Generar HTML del Chat General ---
function generarHTMLChatGeneral() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const fechaStr = `${año}-${mes}-${dia}`;

    // Nombre específico solicitado: registro_chat_tú_YYYY-MM-DD.html
    const archivoHTML = path.join(CHAT_LOG_DIR, `registro_chat_tú_${fechaStr}.html`);
    const archivoTXT = getChatLogFile();

    if (!fs.existsSync(archivoTXT)) return;

    const chatLines = fs.readFileSync(archivoTXT, 'utf8').split('\n');

    let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Registro General de Chat - ${fechaStr}</title>
<style>
body { font-family: Arial, sans-serif; background: #111; color: #fff; padding: 20px; }
h1 { text-align: center; color: #ffd700; }
.log { margin-top: 20px; border: 1px solid #333; padding: 15px; background: #1a1a1a; border-radius: 8px; }
.mensaje { border-bottom: 1px solid #333; padding: 8px; font-size: 0.95em; line-height: 1.4; }
.mensaje:last-child { border-bottom: none; }
.usuario { font-weight: bold; }
.timestamp { color: #666; font-size: 0.8em; margin-right: 8px; }
</style>
</head>
<body>
<h1>Registro General de Chat (${fechaStr})</h1>
<div class="log">`;

    for (const line of chatLines) {
        if (!line.trim()) continue;

        // Extraer Timestamp [00/00/0000 00:00:00]
        const matchTime = line.match(/^\[(.*?)\]/);
        const timestamp = matchTime ? matchTime[1] : "";
        
        // Limpiar etiquetas de sistema
        let lineaLimpia = line.replace(/^\[.*?\]\s*/, '').replace('[USER]', '').replace('[BOT]', '');
        
        const esBot = line.includes('[BOT]');
        const indiceDosPuntos = lineaLimpia.indexOf(':');

        if (indiceDosPuntos !== -1) {
            const nombre = lineaLimpia.substring(0, indiceDosPuntos).trim();
            const mensajeRestante = lineaLimpia.substring(indiceDosPuntos);
            const colorNombre = esBot ? '#00ff00' : '#ffd700';

            html += `<div class="mensaje">
                <span class="timestamp">[${timestamp}]</span>
                <b style="color: ${colorNombre};">${nombre}</b>${mensajeRestante}
            </div>`;
        } else {
            html += `<div class="mensaje"><span class="timestamp">[${timestamp}]</span> ${lineaLimpia}</div>`;
        }
    }

    html += `</div></body></html>`;
    fs.writeFileSync(archivoHTML, html, 'utf8');
}

module.exports = {
    registrarConversacion,
    generarHTMLChatGeneral,
    registrarUsuario,
    registrarUsuarioJSON,
    registrarUsuarioCompleto,
    generarHTMLLibroDiario,
    generarHTMLRegistroChatPorUsuario,
    cargarUsuariosJSON,
    guardarUsuariosJSON,
    cargarUsuariosJSONDiario,
    getChatLogFile,
    getUsersLogFile,
    getJsonDailyPath,
    LOG_DIR,
    CHAT_LOG_DIR,
    USERS_LOG_DIR,
    USERS_JSON_FILE,
    ingresosRegistrados,
    usuariosRegistrados,
    usuariosRecientes,
    mensajesRegistrados
};
