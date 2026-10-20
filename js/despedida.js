/* Sección 10 · Datos compartidos, navegación y revelado discreto. */
(function () {
  "use strict";

  var seccion = document.getElementById("despedida");
  if (!seccion) return;
  var invitacion = window.INVITACION || {};
  var datos = invitacion.despedida || {};
  function texto(valor) { return typeof valor === "string" ? valor.trim() : ""; }

  ["antetitulo", "frase", "mensaje", "cierre"].forEach(function (clave) {
    var nodo = seccion.querySelector('[data-despedida-campo="' + clave + '"]');
    if (nodo && texto(datos[clave])) nodo.textContent = datos[clave].trim();
  });
  seccion.querySelector("[data-despedida-nombre]").textContent = texto(invitacion.nombre) || "[Nombre del graduado]";

  var iniciales = texto(datos.iniciales).slice(0, 4);
  var monograma = seccion.querySelector("[data-despedida-iniciales]");
  var birrete = seccion.querySelector("[data-despedida-birrete]");
  monograma.hidden = !iniciales;
  if (iniciales) birrete.setAttribute("hidden", "");
  else birrete.removeAttribute("hidden");
  if (iniciales) monograma.textContent = iniciales.toLocaleUpperCase("es-MX");

  var time = seccion.querySelector("[data-despedida-fecha]");
  var iso = texto((invitacion.fecha || {}).iso);
  var partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (partes) {
    var dia = new Date(Date.UTC(+partes[1], +partes[2] - 1, +partes[3], 12));
    if (dia.getUTCFullYear() === +partes[1] && dia.getUTCMonth() + 1 === +partes[2] && dia.getUTCDate() === +partes[3]) {
      time.dateTime = iso;
      time.textContent = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(dia);
    }
  }

  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  seccion.querySelectorAll("[data-despedida-ir]").forEach(function (enlace) {
    enlace.addEventListener("click", function (evento) {
      var destino = document.querySelector(enlace.getAttribute("href"));
      if (!destino) return;
      evento.preventDefault();
      if (!destino.hasAttribute("tabindex")) destino.setAttribute("tabindex", "-1");
      destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
      destino.focus({ preventScroll: true });
    });
  });

  if (reducido || !("IntersectionObserver" in window)) return;
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("despedida__revelado");
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: .12 });
  seccion.querySelectorAll("[data-despedida-revelar]").forEach(function (nodo) { observador.observe(nodo); });
})();
