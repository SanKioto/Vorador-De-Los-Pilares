import fs from "fs";
import path from "path";
import os from "os";

// Carpetas temporales generales
const carpetasTemp = [
  process.env.TEMP,
  process.env.TMP,
  path.join(process.env.LOCALAPPDATA, "Temp"),
  path.join(process.env.LOCALAPPDATA, "npm-cache"),
  path.join(process.env.LOCALAPPDATA, "node-gyp"),
  path.join(process.env.LOCALAPPDATA, "CrashDumps"),
  path.join(process.env.LOCALAPPDATA, "SquirrelTemp")
];

// Carpetas de cache de navegadores (Edge y Chrome)
const carpetasCacheBrowsers = [
  path.join(process.env.LOCALAPPDATA, "Microsoft", "Edge", "User Data", "Default", "Cache"),
  path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "User Data", "Default", "Cache")
];

// Función recursiva para borrar archivos y carpetas
function limpiarCarpeta(ruta) {
  if (!fs.existsSync(ruta)) return;
  fs.readdirSync(ruta).forEach((archivo) => {
    const fullPath = path.join(ruta, archivo);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        limpiarCarpeta(fullPath);
        fs.rmdirSync(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      // Ignorar errores de archivos en uso
    }
  });
}

// Función principal de limpieza
function limpiarTodo() {
  console.log(`[${new Date().toLocaleString()}] Iniciando limpieza de temporales...`);

  // Limpiar carpetas temporales
  carpetasTemp.forEach(limpiarCarpeta);

  // Limpiar cache de navegadores
  carpetasCacheBrowsers.forEach(limpiarCarpeta);

  console.log(`[${new Date().toLocaleString()}] Limpieza completada.\n`);
}

// Ejecutar limpieza inmediata
limpiarTodo();

// Reinicio cada 1 hora (3600000 ms)
setInterval(limpiarTodo, 3600000);
