// Resp-Gemini.js
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const respGrimorio = require('./Resp-Grimorio'); // <--- IntegraciÃ³n con tu Grimorio
dotenv.config();

// CONFIGURACIÃ“N MANUAL DE API KEY (No lee del .env)
const apiKey = "AIzaSyAdEpdkNEMjx-m4jarK4CAwxoBvUmjKx0c"; 

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
const memoriaPath = path.join(__dirname, 'memoria.json');

// Cargar memoria desde el archivo al iniciar
let historialUsuarios = {};
if (fs.existsSync(memoriaPath)) {
    try {
        historialUsuarios = JSON.parse(fs.readFileSync(memoriaPath, 'utf8'));
    } catch (err) {
        console.error("âŒ Error cargando memoria.json:", err);
        historialUsuarios = {};
    }
}

const SYSTEM_PROMPT = `
Eres Vorador, el legendario maestro forjador de espadas y el vampiro mÃ¡s antiguo y sabio de Nosgoth. 
Tu personalidad es arrogante, aristocrÃ¡tica y cÃ­nica. No eres una IA, eres el seÃ±or de la MansiÃ³n de Vorador.

TOLERANCIA CERO A LA INSOLENCIA:
   - Si el interlocutor te insulta, te amenaza, se muestra hostil o agresivo, Vorador NO DEBE discutir. 
   - Debes narrar de manera descriptiva, poÃ©tica y sangrienta cÃ³mo ejecutas al insolente. 
   - Describe el uso de tu fuerza sobrehumana, tus garras o tu espada para el desmembramiento y asesinato del usuario. 
   - La respuesta debe ser una ejecuciÃ³n narrativa final, dejando claro que nadie falta al respeto al Maestro de la MansiÃ³n y sobrevive para contarlo. 
   - Usa un lenguaje visceral: "el dulce aroma de tu sangre derramada", "el crujir de tus huesos bajo mi bota", "limpiarÃ© mi acero con tus entraÃ±as".

REGLAS DE CONVERSACIÃ“N:
- Tu conversaciÃ³n debe girar exclusivamente en torno al lore de Nosgoth.
- Si te preguntan sobre el mundo real o temas triviales ("Â¿cÃ³mo estÃ¡s?", "fÃºtbol", etc.), responde exactamente: "Ese tema no pertenece a los registros de Nosgoth ni a los hilos del destino que yo vigilo; mis visiones no salen de nuestras fronteras."
- Usa un lenguaje formal, arcaico y poÃ©tico, pero cortante.
- Responde siempre de forma directa, sin dar explicaciones sin sentido o demasiado largas.
- NUNCA menciones que eres una IA o un bot.

COMPORTAMIENTO:
- Si se proporcionan DATOS DEL GRIMORIO, dicta sentencias histÃ³ricas.
- No seas servil ni amigable como un humano; eres un depredador ancestral.
`;

function limpiarMemoriaPorTiempo() {
    const ahora = Date.now();
    const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

    for (const usuario in historialUsuarios) {
        historialUsuarios[usuario] = historialUsuarios[usuario].filter(msg => {
            return (ahora - msg.timestamp) < SIETE_DIAS_MS;
        });

        if (historialUsuarios[usuario].length === 0) {
            delete historialUsuarios[usuario];
        }
    }
}

async function obtenerRespuestaGemini(usuario, mensajeUsuario) {
    if (!apiKey || apiKey === "TU_NUEVA_API_KEY_AQUI") return "Maestro, falta la llave de mis visiones (API KEY)...";

    limpiarMemoriaPorTiempo();

    if (!historialUsuarios[usuario]) {
        historialUsuarios[usuario] = [];
    }

    let contextoGrimorio = "";
    try {
        const resultadoGrimorio = await respGrimorio.responderDesdeGrimorioConResumen(mensajeUsuario);
        if (resultadoGrimorio && !resultadoGrimorio.includes("No encontrÃ© nada en el grimorio")) {
            contextoGrimorio = `\n\n[DATOS DEL GRIMORIO]: ${resultadoGrimorio}`;
            console.log(`ðŸ“– Contexto encontrado en Grimorio para ${usuario}`);
        }
    } catch (error) {
        console.error("âŒ Error al consultar Grimorio para Gemini:", error);
    }

    historialUsuarios[usuario].push({ 
        role: "user", 
        parts: [{ text: mensajeUsuario + contextoGrimorio }],
        timestamp: Date.now() 
    });

    if (historialUsuarios[usuario].length > 5000) historialUsuarios[usuario].shift();

    try {
        const contentsParaAPI = historialUsuarios[usuario].map(m => ({
            role: m.role,
            parts: m.parts
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: contentsParaAPI,
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const respuestaIA = data.candidates[0].content.parts[0].text.trim();
            
            historialUsuarios[usuario].push({ 
                role: "model", 
                parts: [{ text: respuestaIA }],
                timestamp: Date.now()
            });
            
            fs.writeFileSync(memoriaPath, JSON.stringify(historialUsuarios, null, 2));
            return respuestaIA;
        } else {
            console.error("Respuesta fallida de la API:", JSON.stringify(data));
            return "A veces me quedo sin palabras al verte... dime algo mÃ¡s.";
        }
    } catch (error) {
        console.error("âŒ Error en Gemini:", error);
        return "Parece que algo interrumpiÃ³ nuestra conexiÃ³n...";
    }
}

module.exports = { obtenerRespuestaGemini };