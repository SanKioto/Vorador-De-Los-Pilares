// 📜 Resp-Grimorio.js completo (versión final mejorada con sinónimos y normalización)
const fs = require('fs');
const path = require('path');

// Ruta del grimorio
const grimorioPath = path.join(__dirname, 'grimorio.json');

// Cargar grimorio
let grimorio = [];
try {
    grimorio = JSON.parse(fs.readFileSync(grimorioPath, 'utf8'));
    console.log(`✅ Grimorio cargado con ${grimorio.length} fragmentos.`);
} catch (err) {
    console.error("❌ Error al cargar grimorio.json:", err);
}

/**
 * Normaliza texto para que no importe mayúsculas, minúsculas ni tildes
 */
function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Función para obtener sinónimos aproximados (simple, interno)
 * Retorna palabras cercanas según similitud de caracteres
 */
function obtenerSinonimos(palabra, palabrasReferencia) {
    // Retorna palabras que contienen la misma raíz de la palabra (mínimo 3 caracteres consecutivos)
    const raiz = palabra.slice(0, 3);
    return palabrasReferencia.filter(p => normalizar(p).includes(raiz));
}

/**
 * Busca coincidencias de palabras dentro del grimorio y devuelve fragmentos
 * Primero intenta coincidencia exacta de la frase
 * @param {string} consulta
 * @returns {string|null}
 */
function buscarCoincidencias(consulta) {
    if (!consulta) return null;

    const textoConsulta = normalizar(consulta.trim());

    // 1️⃣ Buscar coincidencia exacta de la frase en todo el grimorio
    for (const libro of grimorio) {
        if (!libro.capitulos) continue;

        for (const cap of libro.capitulos) {
            if (!cap.contenido) continue;

            const contenidoNormalizado = normalizar(cap.contenido);
            const indexExacto = contenidoNormalizado.indexOf(textoConsulta);

            if (indexExacto !== -1) {
                // Extraer fragmento desde el final de la consulta hasta el siguiente punto
                const inicioFragmento = indexExacto + textoConsulta.length;
                const restoTexto = cap.contenido.slice(inicioFragmento);
                const finPunto = restoTexto.indexOf('.') + 1 || restoTexto.length;
                const fragmento = restoTexto.slice(0, finPunto).trim();
                return fragmento;
            }
        }
    }

    // 2️⃣ Si no hay coincidencia exacta, recurre al método por palabras
    const palabrasConsulta = textoConsulta.split(/\s+/).filter(p => p.length > 2);

    let mejoresCoincidencias = [];
    let maxPuntos = 0;

    for (const libro of grimorio) {
        if (!libro.capitulos) continue;

        for (const cap of libro.capitulos) {
            if (!cap.contenido) continue;

            const contenidoNormalizado = normalizar(cap.contenido);
            const palabrasContenido = normalizar(cap.contenido).split(/\s+/);

            let puntos = 0;

            for (const palabra of palabrasConsulta) {
                // Coincidencia exacta o aproximada (sinónimos)
                if (contenidoNormalizado.includes(palabra)) {
                    puntos++;
                } else {
                    const sinonimos = obtenerSinonimos(palabra, palabrasContenido);
                    if (sinonimos.length > 0) puntos++;
                }
            }

            if (puntos > 0) {
                if (puntos > maxPuntos) {
                    maxPuntos = puntos;
                    mejoresCoincidencias = [cap.contenido];
                } else if (puntos === maxPuntos) {
                    mejoresCoincidencias.push(cap.contenido);
                }
            }
        }
    }

    if (mejoresCoincidencias.length === 0) return null;

    // Escoger una coincidencia al azar
    const elegido = mejoresCoincidencias[Math.floor(Math.random() * mejoresCoincidencias.length)];

    return extraerFragmento(elegido, palabrasConsulta);
}

/**
 * Extrae un fragmento del texto alrededor de las coincidencias
 */
function extraerFragmento(texto, palabras, rango = 300) {
    const textoNormalizado = normalizar(texto);

    // Buscar la primera palabra encontrada
    let index = -1;
    for (const palabra of palabras) {
        const pos = textoNormalizado.indexOf(palabra);
        if (pos !== -1 && (index === -1 || pos < index)) {
            index = pos;
        }
    }

    if (index === -1) return null;

    // Definir inicio y fin del fragmento alrededor de la coincidencia
    let inicio = Math.max(0, index);
    let fin = Math.min(texto.length, index + 250);

    // Terminar fragmento en el siguiente punto
    const restoTexto = texto.slice(inicio, fin);
    const finPunto = restoTexto.indexOf('.') + 1 || restoTexto.length;

    let fragmento = restoTexto.slice(0, finPunto).trim();

    return fragmento;
}

/**
 * Función nueva: busca cada palabra individualmente y devuelve fragmentos separados
 * @param {string} consulta
 * @returns {string[]|null}
 */
function buscarPorPalabras(consulta) {
    if (!consulta) return null;

    const textoConsulta = normalizar(consulta.trim());
    const palabrasConsulta = textoConsulta.split(/\s+/).filter(p => p.length > 2);
    let respuestasPorPalabra = [];

    for (const palabra of palabrasConsulta) {
        let fragmentosCoincidentes = [];

        for (const libro of grimorio) {
            if (!libro.capitulos) continue;

            for (const cap of libro.capitulos) {
                if (!cap.contenido) continue;

                const contenidoNormalizado = normalizar(cap.contenido);

                if (contenidoNormalizado.includes(palabra)) {
                    const fragmento = extraerFragmento(cap.contenido, [palabra]);
                    if (fragmento) fragmentosCoincidentes.push(fragmento);
                }
            }
        }

        if (fragmentosCoincidentes.length > 0) {
            // Escoger uno al azar si hay varios
            const elegido = fragmentosCoincidentes[Math.floor(Math.random() * fragmentosCoincidentes.length)];
            respuestasPorPalabra.push(elegido);
        }
    }

    return respuestasPorPalabra.length > 0 ? respuestasPorPalabra : null;
}

/**
 * Función pública: devuelve respuesta lista
 */
async function responderDesdeGrimorioConResumen(consulta) {
    try {
        const resultado = buscarCoincidencias(consulta);
        if (!resultado) return "No encontré nada en el grimorio que coincida con tu búsqueda.";
        return resultado;
    } catch (err) {
        console.error("❌ Error en la búsqueda del grimorio:", err);
        return "Ocurrió un error al buscar en el grimorio.";
    }
}

module.exports = {
    responderDesdeGrimorioConResumen,
    buscarPorPalabras
};
