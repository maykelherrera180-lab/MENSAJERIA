/* =========================================================
   TELEMESSAGE
   Sistema de mensajería mediante Telegram Bot API
========================================================= */


/* =========================================================
   TOKEN DEL BOT
========================================================= */

const BOT_TOKEN = "8660397498:AAEOpi8r8dwpGQmn7lX9MQiF55IvCCJI44g";


/* =========================================================
   VARIABLES
========================================================= */

let contacts = [];
let selectedContactId = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const contactForm = document.getElementById("contactForm");

const nameInput = document.getElementById("name");
const chatIdInput = document.getElementById("chatId");

const contactList = document.getElementById("contactList");

const contactCount = document.getElementById("contactCount");
const contactBadge = document.getElementById("contactBadge");

const selectedContactBox =
    document.getElementById("selectedContact");

const messageInput =
    document.getElementById("message");

const charCount =
    document.getElementById("charCount");

const sendBtn =
    document.getElementById("sendBtn");

const clearBtn =
    document.getElementById("clearBtn");

const resultBox =
    document.getElementById("result");


/* =========================================================
   REGISTRAR DESTINATARIO
========================================================= */

contactForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = nameInput.value.trim();
    const chatId = chatIdInput.value.trim();


    /* -----------------------------------------
       VALIDAR NOMBRE
    ----------------------------------------- */

    if (name.length < 2) {

        showResult(
            "error",
            "Escribe un nombre válido para el destinatario."
        );

        nameInput.focus();

        return;
    }


    /* -----------------------------------------
       VALIDAR ID
    ----------------------------------------- */

    if (chatId.length < 3) {

        showResult(
            "error",
            "Escribe un ID de Telegram válido."
        );

        chatIdInput.focus();

        return;
    }


    /* -----------------------------------------
       EVITAR DUPLICADOS
    ----------------------------------------- */

    const exists = contacts.some(function(contact) {

        return contact.chatId === chatId;

    });


    if (exists) {

        showResult(
            "error",
            "Ese ID de Telegram ya está registrado."
        );

        return;
    }


    /* -----------------------------------------
       CREAR CONTACTO
    ----------------------------------------- */

    const newContact = {

        id: Date.now(),

        name: name,

        chatId: chatId

    };


    /* -----------------------------------------
       GUARDAR EN MEMORIA
    ----------------------------------------- */

    contacts.push(newContact);


    /* -----------------------------------------
       SELECCIONAR AUTOMÁTICAMENTE
    ----------------------------------------- */

    selectedContactId = newContact.id;


    /* -----------------------------------------
       ACTUALIZAR TODO
    ----------------------------------------- */

    renderContacts();

    updateCounters();

    updateSelectedContact();


    /* -----------------------------------------
       LIMPIAR FORMULARIO
    ----------------------------------------- */

    contactForm.reset();


    /* -----------------------------------------
       MENSAJE
    ----------------------------------------- */

    showResult(
        "success",
        `Destinatario "${name}" registrado correctamente.`
    );


    console.log("Destinatarios actuales:", contacts);

});


/* =========================================================
   MOSTRAR CONTACTOS
========================================================= */

function renderContacts() {

    if (contacts.length === 0) {

        contactList.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    ♙
                </div>

                <strong>
                    No hay destinatarios
                </strong>

                <p>
                    Registra una persona para comenzar.
                </p>

            </div>

        `;

        return;
    }


    contactList.innerHTML = contacts.map(function(contact) {

        const initials = getInitials(contact.name);

        const isSelected =
            contact.id === selectedContactId;


        return `

            <div
                class="contact-item ${isSelected ? "active" : ""}"
                data-id="${contact.id}"
            >

                <div class="contact-avatar">
                    ${escapeHTML(initials)}
                </div>


                <div class="contact-info">

                    <strong>
                        ${escapeHTML(contact.name)}
                    </strong>

                    <span>
                        ID: ${escapeHTML(contact.chatId)}
                    </span>

                </div>


                <button
                    type="button"
                    class="delete-contact"
                    data-delete="${contact.id}"
                    title="Eliminar destinatario"
                >
                    ×
                </button>

            </div>

        `;

    }).join("");

}


/* =========================================================
   EVENTO PARA SELECCIONAR CONTACTOS
   USAMOS UN SOLO EVENTO EN LA LISTA
========================================================= */

contactList.addEventListener("click", function(event) {


    /* -----------------------------------------
       SI PRESIONA EL BOTÓN ELIMINAR
    ----------------------------------------- */

    const deleteButton =
        event.target.closest("[data-delete]");


    if (deleteButton) {

        event.stopPropagation();

        const id =
            Number(deleteButton.dataset.delete);

        deleteContact(id);

        return;
    }


    /* -----------------------------------------
       BUSCAR CONTACTO
    ----------------------------------------- */

    const contactElement =
        event.target.closest(".contact-item");


    if (!contactElement) {

        return;
    }


    const id =
        Number(contactElement.dataset.id);


    selectContact(id);

});


/* =========================================================
   SELECCIONAR CONTACTO
========================================================= */

function selectContact(id) {

    const contact = contacts.find(function(item) {

        return item.id === id;

    });


    if (!contact) {

        return;
    }


    /* Guardar ID seleccionado */

    selectedContactId = id;


    /* Actualizar pantalla */

    updateSelectedContact();


    /* Actualizar lista */

    renderContacts();


    /* Activar mensaje */

    messageInput.disabled = false;

    sendBtn.disabled = false;

    clearBtn.disabled = false;


    messageInput.placeholder =
        `Escribe un mensaje para ${contact.name}...`;


    hideResult();


    console.log(
        "Contacto seleccionado:",
        contact
    );

}


/* =========================================================
   ACTUALIZAR CONTACTO SELECCIONADO
========================================================= */

function updateSelectedContact() {

    const contact = contacts.find(function(item) {

        return item.id === selectedContactId;

    });


    /* Si no existe contacto */

    if (!contact) {

        selectedContactBox.innerHTML = `

            <div class="selected-avatar">
                ?
            </div>

            <div>

                <span>Destinatario</span>

                <strong>
                    Ninguno seleccionado
                </strong>

            </div>

        `;

        messageInput.disabled = true;

        sendBtn.disabled = true;

        clearBtn.disabled = true;

        messageInput.value = "";

        charCount.textContent = "0 / 4096";

        return;
    }


    /* Iniciales */

    const initials =
        getInitials(contact.name);


    selectedContactBox.innerHTML = `

        <div class="selected-avatar">
            ${escapeHTML(initials)}
        </div>

        <div>

            <span>Destinatario</span>

            <strong>
                ${escapeHTML(contact.name)}
            </strong>

        </div>

    `;

}


/* =========================================================
   ELIMINAR CONTACTO
========================================================= */

function deleteContact(id) {

    const contact = contacts.find(function(item) {

        return item.id === id;

    });


    if (!contact) {

        return;
    }


    /* Eliminar */

    contacts = contacts.filter(function(item) {

        return item.id !== id;

    });


    /* Si era el seleccionado */

    if (selectedContactId === id) {

        selectedContactId = null;

        messageInput.value = "";

        charCount.textContent = "0 / 4096";

        messageInput.disabled = true;

        sendBtn.disabled = true;

        clearBtn.disabled = true;

    }


    /* Actualizar interfaz */

    renderContacts();

    updateCounters();

    updateSelectedContact();


    showResult(
        "success",
        `El destinatario "${contact.name}" fue eliminado.`
    );

}


/* =========================================================
   CONTADORES
========================================================= */

function updateCounters() {

    const total = contacts.length;

    contactCount.textContent = total;

    contactBadge.textContent = total;

}


/* =========================================================
   CONTADOR DEL MENSAJE
========================================================= */

messageInput.addEventListener("input", function() {

    charCount.textContent =
        `${this.value.length} / 4096`;

});


/* =========================================================
   LIMPIAR MENSAJE
========================================================= */

clearBtn.addEventListener("click", function() {

    messageInput.value = "";

    charCount.textContent = "0 / 4096";

    hideResult();

    messageInput.focus();

});


/* =========================================================
   ENVIAR MENSAJE
========================================================= */

sendBtn.addEventListener("click", async function() {


    /* -----------------------------------------
       VERIFICAR CONTACTO
    ----------------------------------------- */

    const contact = contacts.find(function(item) {

        return item.id === selectedContactId;

    });


    if (!contact) {

        showResult(
            "error",
            "Selecciona un destinatario antes de enviar."
        );

        return;
    }


    /* -----------------------------------------
       MENSAJE
    ----------------------------------------- */

    const message =
        messageInput.value.trim();


    if (!message) {

        showResult(
            "error",
            "Escribe un mensaje antes de enviarlo."
        );

        messageInput.focus();

        return;
    }


    /* -----------------------------------------
       VERIFICAR TOKEN
    ----------------------------------------- */

    if (
        !BOT_TOKEN ||
        BOT_TOKEN === "PEGA_AQUI_EL_NUEVO_TOKEN"
    ) {

        showResult(
            "error",
            "Debes colocar el token de tu bot en script.js."
        );

        return;
    }


    /* -----------------------------------------
       BLOQUEAR BOTONES
    ----------------------------------------- */

    sendBtn.disabled = true;

    clearBtn.disabled = true;


    const originalText =
        sendBtn.innerHTML;


    sendBtn.innerHTML =
        "Enviando...";


    try {


        /* -----------------------------------------
           URL TELEGRAM
        ----------------------------------------- */

        const url =
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;


        /* -----------------------------------------
           PETICIÓN
        ----------------------------------------- */

        const response = await fetch(url, {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

                chat_id: contact.chatId,

                text: message

            })

        });


        const data =
            await response.json();


        /* -----------------------------------------
           COMPROBAR RESPUESTA
        ----------------------------------------- */

        if (
            !response.ok ||
            !data.ok
        ) {

            throw new Error(
                data.description ||
                "Telegram rechazó el mensaje."
            );

        }


        /* -----------------------------------------
           ÉXITO
        ----------------------------------------- */

        showResult(
            "success",
            `Mensaje enviado correctamente a ${contact.name}.`
        );


        /* Limpiar mensaje */

        messageInput.value = "";

        charCount.textContent =
            "0 / 4096";


    } catch (error) {

        console.error(
            "Error de Telegram:",
            error
        );


        showResult(
            "error",
            `No se pudo enviar el mensaje: ${getTelegramError(error.message)}`
        );


    } finally {

        sendBtn.disabled = false;

        clearBtn.disabled = false;

        sendBtn.innerHTML =
            originalText;

    }

});


/* =========================================================
   ERRORES DE TELEGRAM
========================================================= */

function getTelegramError(message) {

    const error =
        String(message).toLowerCase();


    if (
        error.includes("chat not found")
    ) {

        return "No se encontró ese chat. Verifica el ID de Telegram.";

    }


    if (
        error.includes("user is deactivated")
    ) {

        return "Ese usuario ya no está disponible.";

    }


    if (
        error.includes("bot was blocked")
    ) {

        return "El destinatario bloqueó el bot.";

    }


    if (
        error.includes("unauthorized")
    ) {

        return "El token del bot no es válido.";

    }


    if (
        error.includes("chat_id")
    ) {

        return "El ID de Telegram no es válido.";

    }


    if (
        error.includes("forbidden")
    ) {

        return "El bot no tiene permiso para escribir en ese chat.";

    }


    return message;

}


/* =========================================================
   MOSTRAR RESULTADO
========================================================= */

function showResult(type, message) {

    resultBox.className =
        `result ${type}`;

    resultBox.textContent =
        message;

    resultBox.style.display =
        "block";

}


/* =========================================================
   OCULTAR RESULTADO
========================================================= */

function hideResult() {

    resultBox.style.display =
        "none";

    resultBox.className =
        "result";

    resultBox.textContent =
        "";

}


/* =========================================================
   OBTENER INICIALES
========================================================= */

function getInitials(name) {

    const words =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   PROTEGER HTML
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   INICIAR
========================================================= */

renderContacts();

updateCounters();

updateSelectedContact();