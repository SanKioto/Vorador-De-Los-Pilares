// Resp-Activadores.js
async function manejarActivadores(page, mensaje, enviarMensaje, irAlUsuario) {
    const texto = mensaje.texto.toLowerCase();

    if (texto.includes("!skb")) {
        await irAlUsuario(page, mensaje.usuario);
        return true;
    }

    if (texto.includes("credito") || texto.includes("creditos")) {
        await enviarMensaje(page, "Hola, actualmente estoy manejando el tema de los creditos de forma privada y discreta. No puedo dar detalles completos aquí dentro de la plataforma, pero si deseas más información o saber cómo funciona el proceso, puedes contactarme directamente por WhatsApp. Ahí te podré explicar todo de manera clara y segura... (pide informacion y se te dara el contacto");
        return true;
    }

    const activadoresPrepagada = ["prepagada", "prepagadas", "tarjeta", "tarjetas", "prepaid", "prepaids", "prepaid card", "prepaids cards"];
    if (activadoresPrepagada.some(palabra => texto.includes(palabra))) {
        await enviarMensaje(page, "Hola, actualmente estoy manejando el tema de las tarjetas prepagadas de forma privada y discreta. No puedo dar detalles completos aquí dentro de la plataforma, pero si deseas más información o saber cómo funciona el proceso, puedes contactarme directamente. Ahí te podré explicar todo de manera clara y segura... (pide informacion y se te dara el contacto");
        return true;
    }

    const activadoresCreador = ["crear", "producto", "pedido", "diseño"];
    if (activadoresCreador.some(palabra => texto.includes(palabra))) {
        await enviarMensaje(page, "Soy creador de productos hechos desde cero y completamente personalizados. Mi trabajo consiste en diseñar y desarrollar artículos únicos, adaptados al gusto y las necesidades de cada persona. La idea es que no recibas algo genérico, sino un producto pensado especialmente para ti, con los detalles y estilo que prefieras... (pide informacion y se te dara el contacto");
        return true;
    }

    const activadoresBot = ["bot", "bots", "Bot", "Bots", "npc"];
    if (activadoresBot.some(palabra => texto.includes(palabra))) {
        await enviarMensaje(page, "Me dedico a crear bots personalizados, diseñados según las necesidades de cada persona o proyecto. Estos bots pueden adaptarse a distintas funciones, como responder mensajes, automatizar tareas, o incluso interactuar en plataformas específicas. Si tienes alguna idea o te interesa contar con un bot a la medida, puedo orientarte y desarrollar la solución que mejor se ajuste a lo que buscas. (pide informacion y se te dara el contacto");
        return true;
    }

    const activadoresContacto = ["comunico", "contacto", "Informacion", "Información", "informacion"];
    if (activadoresContacto.some(palabra => texto.includes(palabra))) {
        await enviarMensaje(page, "Si deseas ponerte en contacto conmigo de manera más rápida y directa, puedes escribirme mediante Telegram y con gusto te atendere https://t.me/SanKioto.");
        return true;
    }

    return false;
}

module.exports = {
    manejarActivadores
};
