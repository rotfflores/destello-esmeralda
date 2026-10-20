/* =========================================================
   Invitación de graduación · Sección 2: Portada
   ========================================================= */
(function () {
  "use strict";

  var portada = document.getElementById("portada");
  if (!portada) return;

  /* ---------- Datos editables ---------- */
  var datos = window.INVITACION || {};

  function valor(ruta) {
    return ruta.split(".").reduce(function (obj, clave) {
      return obj && obj[clave] !== undefined ? obj[clave] : undefined;
    }, datos);
  }

  var campos = portada.querySelectorAll("[data-campo]");
  for (var i = 0; i < campos.length; i++) {
    var texto = valor(campos[i].getAttribute("data-campo"));
    if (typeof texto === "string" && texto.trim()) campos[i].textContent = texto;
  }

  // Fecha legible por máquinas, si se indicó
  var fecha = portada.querySelector("[data-fecha]");
  if (fecha && datos.fecha && datos.fecha.iso) fecha.setAttribute("data-iso", datos.fecha.iso);

  /* ---------- Revelado en dos fases ----------
     1. Al pulsar «Abrir invitación» el salón (fondo y adornos) aparece
        detrás de las puertas.
     2. Al retirarse la entrada se revelan título, nombre y datos. */
  function entrar() {
    portada.classList.add("is-entrando");
  }

  function activar() {
    entrar();
    portada.classList.add("is-activa");
  }

  if (document.getElementById("entrada")) {
    document.addEventListener("invitacion:abriendo", entrar, { once: true });
    document.addEventListener("invitacion:abierta", activar, { once: true });
  } else {
    activar();
  }

  /* ---------- Continuar hacia la siguiente sección ---------- */
  var continuar = document.getElementById("portada-continuar");
  if (continuar) {
    continuar.addEventListener("click", function (evento) {
      var siguiente = portada.nextElementSibling;
      while (siguiente && siguiente.tagName !== "SECTION") siguiente = siguiente.nextElementSibling;
      if (!siguiente) return;
      evento.preventDefault();

      var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      siguiente.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
      if (!siguiente.hasAttribute("tabindex")) siguiente.setAttribute("tabindex", "-1");
      siguiente.focus({ preventScroll: true });
    });
  }
})();
