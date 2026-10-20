/* =========================================================
   Sección 9 · Pase y confirmación de asistencia
   Llena el pase con js/datos.js (y con ?invitado=…&lugares=… del
   enlace), valida el formulario y abre WhatsApp con la respuesta
   lista. La respuesta sólo llega cuando el invitado la envía.
   ========================================================= */
(function () {
  "use strict";

  var seccion = document.getElementById("confirmacion");
  if (!seccion) return;

  var datos = window.INVITACION || {};
  var ajustes = datos.confirmacion || {};
  var pase = ajustes.pase || {};
  function texto(valor) { return typeof valor === "string" ? valor.trim() : ""; }

  /* ---------- Datos del pase ---------- */
  var parametros = new URLSearchParams(window.location.search);
  var invitado = texto(parametros.get("invitado")) || texto(pase.invitado);
  var lugares = parseInt(parametros.get("lugares") || pase.lugares, 10);
  if (!(lugares >= 1 && lugares <= 50)) lugares = 0;
  var graduado = texto(datos.nombre);

  function poner(campo, valor) {
    var nodo = seccion.querySelector('[data-confirmacion-campo="' + campo + '"]');
    if (nodo && valor) nodo.textContent = valor;
  }
  poner("antetitulo", texto(ajustes.antetitulo));
  poner("titulo", texto(ajustes.titulo));
  poner("frase", texto(ajustes.frase));
  poner("evento", texto(pase.evento));
  poner("graduado", graduado);

  if (invitado) {
    poner("invitado", invitado);
    seccion.querySelector("[data-confirmacion-invitado]").hidden = false;
  }
  var lineaLugares = seccion.querySelector("[data-confirmacion-lugares]");
  if (lugares) {
    lineaLugares.textContent = "";
    lineaLugares.append("Hemos reservado ");
    var cifra = document.createElement("strong");
    cifra.textContent = String(lugares);
    lineaLugares.append(cifra, lugares === 1 ? " lugar para ti" : " lugares para ti");
    lineaLugares.hidden = false;
  }

  // Fecha del evento: la misma fecha ISO de la portada y la cuenta regresiva
  var fechaTexto = "";
  var bloqueFecha = seccion.querySelector("[data-confirmacion-fecha-bloque]");
  var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto((datos.fecha || {}).iso));
  var dia = partes && new Date(Date.UTC(+partes[1], +partes[2] - 1, +partes[3], 12));
  if (dia && dia.getUTCDate() === +partes[3]) {
    fechaTexto = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(dia);
    var semana = new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: "UTC" }).format(dia);
    var nodoFecha = seccion.querySelector("[data-confirmacion-fecha]");
    nodoFecha.setAttribute("datetime", partes[0]);
    nodoFecha.textContent = "";
    var nodoSemana = document.createElement("span");
    nodoSemana.className = "pase__dia";
    nodoSemana.textContent = semana.charAt(0).toUpperCase() + semana.slice(1);
    nodoFecha.append(nodoSemana, " " + fechaTexto);
  } else if (bloqueFecha) {
    bloqueFecha.hidden = true;
  }

  /* ---------- Formulario ---------- */
  var formulario = seccion.querySelector("[data-confirmacion-formulario]");
  var nombre = formulario.elements.nombre;
  var respuestas = formulario.querySelectorAll('input[name="respuesta"]');
  var grupoRespuesta = formulario.querySelector(".campo--respuesta");
  var campoAsistentes = formulario.querySelector("[data-confirmacion-asistentes]");
  var asistentes = formulario.elements.asistentes;
  var enviar = formulario.querySelector("[data-confirmacion-enviar]");
  var nota = formulario.querySelector("[data-confirmacion-nota]");
  var estado = formulario.querySelector("[data-confirmacion-estado]");
  var limite = formulario.querySelector("[data-confirmacion-limite]");

  if (invitado) nombre.value = invitado;

  if (texto(ajustes.fechaLimite)) {
    limite.textContent = "";
    var fechaLimite = document.createElement("strong");
    fechaLimite.textContent = texto(ajustes.fechaLimite);
    limite.append("Confirma antes del ", fechaLimite);
    limite.hidden = false;
  }

  if (lugares) {
    for (var n = 1; n <= lugares; n++) {
      var opcion = document.createElement("option");
      opcion.value = String(n);
      opcion.textContent = n === 1 ? "1 persona" : n + " personas";
      asistentes.appendChild(opcion);
    }
    asistentes.value = String(lugares);
  }

  // Número de destino: sólo dígitos, con código de país (8 a 15 dígitos)
  var whatsapp = texto(ajustes.whatsapp).replace(/[^\d]/g, "");
  var disponible = whatsapp.length >= 8 && whatsapp.length <= 15;
  enviar.disabled = !disponible;
  nota.textContent = disponible
    ? "Se abrirá WhatsApp con tu respuesta lista para enviar"
    : "Confirmaciones disponibles próximamente";

  function respuestaElegida() {
    for (var i = 0; i < respuestas.length; i++) if (respuestas[i].checked) return respuestas[i].value;
    return "";
  }
  function actualizarAsistentes() {
    campoAsistentes.hidden = !(lugares && respuestaElegida() === "si");
  }

  function mostrarError(id, mensaje) {
    var nodo = document.getElementById(id);
    nodo.textContent = mensaje;
    nodo.hidden = !mensaje;
  }
  function validarNombre() {
    var valido = !!nombre.value.trim();
    nombre.setAttribute("aria-invalid", valido ? "false" : "true");
    mostrarError("confirmacion-nombre-error", valido ? "" : "Escribe tu nombre para que sepamos quién responde.");
    return valido;
  }
  function validarRespuesta() {
    var valido = !!respuestaElegida();
    grupoRespuesta.setAttribute("aria-invalid", valido ? "false" : "true");
    respuestas.forEach(function (radio) { radio.setAttribute("aria-invalid", valido ? "false" : "true"); });
    mostrarError("confirmacion-respuesta-error", valido ? "" : "Elige si podrás asistir.");
    return valido;
  }

  nombre.addEventListener("input", function () {
    if (nombre.getAttribute("aria-invalid") === "true") validarNombre();
    estado.textContent = "";
  });
  respuestas.forEach(function (radio) {
    radio.addEventListener("change", function () {
      actualizarAsistentes();
      if (grupoRespuesta.getAttribute("aria-invalid") === "true") validarRespuesta();
      estado.textContent = "";
    });
  });
  asistentes.addEventListener("change", function () { estado.textContent = ""; });
  actualizarAsistentes();

  function mensaje() {
    var quien = nombre.value.trim().replace(/\s+/g, " ");
    var de = graduado ? " de " + graduado : "";
    if (respuestaElegida() === "no") {
      return "Hola, soy " + quien + ". Gracias por invitarme a la graduación" + de +
        ". En esta ocasión no podré acompañarte. ¡Te deseo una celebración muy especial!";
    }
    var cuerpo = "Hola, soy " + quien + ". Confirmo mi asistencia a la graduación" + de +
      (fechaTexto ? " el " + fechaTexto : "") + ".";
    if (lugares) {
      var cantidad = parseInt(asistentes.value, 10) || 1;
      cuerpo += cantidad === 1 ? " Asistirá 1 persona en total." : " Asistiremos " + cantidad + " personas en total.";
    }
    return cuerpo + " ¡Gracias por la invitación!";
  }

  formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (!disponible) return;
    var nombreValido = validarNombre();
    var respuestaValida = validarRespuesta();
    if (!nombreValido || !respuestaValida) {
      (nombreValido ? respuestas[0] : nombre).focus();
      return;
    }
    var enlace = "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(mensaje());
    var ventana = window.open(enlace, "_blank");
    if (ventana) ventana.opener = null;
    else window.location.href = enlace;
    // Abrir WhatsApp no registra la asistencia: la respuesta llega al enviarla.
    estado.textContent = "Tu mensaje está listo en WhatsApp. Envíalo desde ahí para que llegue tu respuesta.";
  });

  /* ---------- Revelado una sola vez y ambiente sólo en pantalla ---------- */
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reducido) return;
  var enPantalla = false;
  function actualizarAmbiente() {
    seccion.classList.toggle("confirmacion__animando", enPantalla && !document.hidden);
  }
  new IntersectionObserver(function (entradas) {
    enPantalla = entradas[0].isIntersecting;
    actualizarAmbiente();
  }).observe(seccion);
  document.addEventListener("visibilitychange", actualizarAmbiente);

  var revelar = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-visible");
      revelar.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .15 });
  seccion.querySelectorAll("[data-confirmacion-revelar], [data-confirmacion-escena]").forEach(function (nodo) {
    revelar.observe(nodo);
  });
  seccion.classList.add("is-observando");
})();
