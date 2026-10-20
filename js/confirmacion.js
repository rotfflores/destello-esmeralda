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
  var despliegue = formulario.querySelector("[data-confirmacion-despliegue]");
  var saludo = formulario.querySelector("[data-confirmacion-saludo]");
  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // El resto del formulario se despliega al elegir una respuesta.
  // Sin JavaScript (o si algo falla antes de aquí) queda abierto.
  seccion.classList.add("confirmacion--plegable");

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
  function desplegar() {
    var eleccion = respuestaElegida();
    if (!eleccion) return;
    saludo.textContent = eleccion === "si"
      ? "¡Qué alegría contar contigo! Completa tus datos para enviar tu respuesta."
      : "Gracias por avisarnos. Escribe tu nombre para enviar tu respuesta.";
    despliegue.classList.add("is-abierto");
  }

  /* ---------- Celebración al aceptar: destellos y el birrete del pase vuela ---------- */
  function celebrar(origen) {
    if (reducido || !origen.animate) return;
    var caja = origen.getBoundingClientRect();
    var capa = document.createElement("div");
    capa.className = "confirmacion__festejo";
    capa.setAttribute("aria-hidden", "true");
    document.body.appendChild(capa);
    var cx = caja.left + caja.width * .3, cy = caja.top + caja.height / 2;
    var formas = ["rombo", "punto", "tira"];
    var mayor = 0;
    for (var i = 0; i < 28; i++) {
      var pieza = document.createElement("i");
      pieza.className = "confirmacion__chispa confirmacion__chispa--" + formas[i % 3];
      pieza.style.left = cx + "px";
      pieza.style.top = cy + "px";
      capa.appendChild(pieza);
      var angulo = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.25;
      var distancia = 70 + Math.random() * 150;
      var dx = Math.cos(angulo) * distancia, dy = Math.sin(angulo) * distancia;
      var giro = (Math.random() - .5) * 540;
      var duracion = 1000 + Math.random() * 700;
      mayor = Math.max(mayor, duracion);
      pieza.animate([
        { transform: "translate(-50%, -50%) scale(.3) rotate(0deg)", opacity: 0 },
        { transform: "translate(calc(-50% + " + dx * .7 + "px), calc(-50% + " + dy * .7 + "px)) scale(1) rotate(" + giro * .6 + "deg)", opacity: 1, offset: .35 },
        { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + (dy + 70) + "px)) scale(.8) rotate(" + giro + "deg)", opacity: 0 }
      ], { duration: duracion, easing: "cubic-bezier(.2, .7, .3, 1)", fill: "both" });
    }
    setTimeout(function () { capa.remove(); }, mayor + 50);
    var birrete = seccion.querySelector(".pase__birrete");
    if (birrete) {
      birrete.animate([
        { transform: "none" },
        { transform: "translateY(-1.6rem) rotate(-16deg)", offset: .4 },
        { transform: "translateY(.15rem) rotate(4deg)", offset: .78 },
        { transform: "none" }
      ], { duration: 1100, easing: "cubic-bezier(.3, .6, .3, 1)" });
    }
    var tarjeta = seccion.querySelector(".pase");
    if (tarjeta) tarjeta.animate([
      { filter: "drop-shadow(0 1.4rem 1.6rem rgba(0, 14, 9, .55))" },
      { filter: "drop-shadow(0 0 1.6rem rgba(236, 213, 176, .55))", offset: .35 },
      { filter: "drop-shadow(0 1.4rem 1.6rem rgba(0, 14, 9, .55))" }
    ], { duration: 1400, easing: "ease-out" });
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
      desplegar();
      if (radio.value === "si") celebrar(radio.closest(".opcion"));
      if (grupoRespuesta.getAttribute("aria-invalid") === "true") validarRespuesta();
      estado.textContent = "";
    });
  });
  asistentes.addEventListener("change", function () { estado.textContent = ""; });
  actualizarAsistentes();
  desplegar();

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
      (respuestaValida ? nombre : respuestas[0]).focus();
      return;
    }
    // Brillo de envío en el botón mientras se abre WhatsApp
    enviar.classList.remove("is-enviando");
    void enviar.offsetWidth;
    enviar.classList.add("is-enviando");
    var enlace = "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(mensaje());
    var ventana = window.open(enlace, "_blank");
    if (ventana) ventana.opener = null;
    else window.location.href = enlace;
    // Abrir WhatsApp no registra la asistencia: la respuesta llega al enviarla.
    estado.textContent = "Tu mensaje está listo en WhatsApp. Envíalo desde ahí para que llegue tu respuesta.";
  });

  /* ---------- Revelado una sola vez y ambiente sólo en pantalla ---------- */
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
