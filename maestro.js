const fs = require('fs');
const path = require('path');

// Carpeta donde están los HTML originales
const carpeta = path.join(__dirname, 'registros', 'usuarios');

// Carpeta de Scarlett Duvall para los botones del segundo archivo
const carpetaDuvall = path.join(__dirname, '../Scarlett Duvall/registros/usuarios');

// Carpeta destino para Registro_Diario_Duvall.html
const extraDir = path.join(__dirname, '../ngrok/5000/templates');
const extraPath = path.join(extraDir, 'Registro_Diario_Vorador.html');

// Verificar que exista la carpeta original
if (!fs.existsSync(carpeta)) {
    console.error(`La carpeta no existe: ${carpeta}`);
    process.exit(1);
}

// Función para generar el HTML maestro
function generarMaestro() {
    // --- Maestro original ---
    const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith('.html'));

    let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Diario Maestro Oscuro</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; background-color: #121212; color: #e0e0e0; }
h1 { text-align: center; margin-bottom: 30px; color: #ffffff; }
.container { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
.card { display: block; padding: 15px 25px; background-color: #1e1e1e; border-radius: 10px; text-decoration: none; color: #e0e0e0; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.5); transition: all 0.2s; }
.card:hover { background-color: #333333; transform: translateY(-3px); }
</style>
</head>
<body>
<h1>Diario Maestro Oscuro</h1>
<div class="container">
`;

    archivos.forEach(file => {
        const rutaRelativa = path.join('registros', 'usuarios', file).replace(/\\/g, '/');
        const nombre = path.parse(file).name;
        html += `<a class="card" href="${rutaRelativa}" target="_blank">${nombre}</a>\n`;
    });

    html += `</div></body></html>`;

    const salida = path.join(__dirname, 'plantilla_maestro.html');
    fs.writeFileSync(salida, html);
//    console.log(`Se generó plantilla_maestro.html con estilo oscuro y ${archivos.length} archivos.`);

    // --- Segundo HTML Registro_Diario_Duvall ---
    if (!fs.existsSync(extraDir)) {
        fs.mkdirSync(extraDir, { recursive: true });
    }

    const archivosDuvall = fs.existsSync(carpetaDuvall) ? fs.readdirSync(carpetaDuvall).filter(f => f.endsWith('.html')) : [];
    let htmlDuvall = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Registro Diario Duvall</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; background-color: #121212; color: #e0e0e0; }
h1 { text-align: center; margin-bottom: 30px; color: #ffffff; }
.container { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; }
.card { display: block; padding: 15px 25px; background-color: #1e1e1e; border-radius: 10px; text-decoration: none; color: #e0e0e0; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.5); transition: all 0.2s; }
.card:hover { background-color: #333333; transform: translateY(-3px); }
</style>
</head>
<body>
<h1>Registro Diario Duvall</h1>
<div class="container">
`;

    archivosDuvall.forEach(file => {
        // Ruta relativa desde extraDir hacia carpetaDuvall
        const rutaRelativa = path.relative(extraDir, path.join(carpetaDuvall, file)).replace(/\\/g, '/');
        const nombre = path.parse(file).name;
        htmlDuvall += `<a class="card" href="${rutaRelativa}" target="_blank">${nombre}</a>\n`;
    });

    htmlDuvall += `</div></body></html>`;

    fs.writeFileSync(extraPath, htmlDuvall);
//    console.log(`Se generó también ${extraPath} con enlaces relativos hacia Scarlett Duvall.`);
}

// Generar inicialmente
generarMaestro();

// Observar la carpeta original y actualizar automáticamente
fs.watch(carpeta, { persistent: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.html')) {
//        console.log(`Cambio detectado: ${filename} (${eventType})`);
        generarMaestro();
    }
});

// console.log('Observando la carpeta registros/usuarios para actualizaciones...');
