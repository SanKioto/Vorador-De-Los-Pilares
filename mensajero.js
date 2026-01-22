const fs = require("fs");
const path = require("path");

const rutaPendientes = path.join(__dirname, "mensajes.json");
const rutaLeidos = path.join(__dirname, "mensajes_leidos.json");

// Cargar mensajes desde archivo
function cargar(ruta) {
  if (!fs.existsSync(ruta)) return [];
  return JSON.parse(fs.readFileSync(ruta, "utf-8"));
}

// Guardar mensajes en archivo
function guardar(ruta, mensajes) {
  fs.writeFileSync(ruta, JSON.stringify(mensajes, null, 2));
}

// Dejar un nuevo mensaje
function dejarMensaje(usuario, texto) {
  const mensajes = cargar(rutaPendientes);
  mensajes.push({
    de: usuario,
    mensaje: texto,
    hora: new Date().toLocaleString()
  });
  guardar(rutaPendientes, mensajes);
}

// Obtener todos los mensajes y moverlos a leídos
function obtenerMensajes() {
  const pendientes = cargar(rutaPendientes);
  if (pendientes.length === 0) return [];

  const leidos = cargar(rutaLeidos);
  guardar(rutaLeidos, leidos.concat(pendientes));
  guardar(rutaPendientes, []); // limpiar pendientes

  return pendientes;
}

module.exports = { dejarMensaje, obtenerMensajes };
