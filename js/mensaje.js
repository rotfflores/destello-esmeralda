/* =========================================================
   Invitación de graduación · Sección 3: Mensaje del graduado
   ========================================================= */
(function () {
  "use strict";

  var seccion = document.getElementById("mensaje-graduado");
  if (!seccion) return;
  var invitacion = window.INVITACION || {};
  var datos = invitacion.mensaje || {};

  function texto(valor) {
    return typeof valor === "string" && valor.trim() ? valor : "";
  }

  /* ---------- Datos editables (como texto, sin interpretar HTML) ---------- */
  if (Array.isArray(datos.parrafos) && datos.parrafos.length && datos.parrafos.every(texto)) {
    var parrafos = seccion.querySelector("[data-mensaje-parrafos]");
    parrafos.textContent = "";
    datos.parrafos.forEach(function (contenido) {
      var p = document.createElement("p");
      p.textContent = contenido;
      parrafos.appendChild(p);
    });
  }

  if (texto(datos.despedida)) {
    seccion.querySelector("[data-mensaje-despedida]").textContent = datos.despedida;
  }

  // La firma usa el nombre del mensaje o, si falta, el de la portada
  var firma = texto(datos.nombre) || texto(invitacion.nombre);
  if (firma) seccion.querySelector("[data-mensaje-nombre]").textContent = firma;

  var foto = datos.foto || {};
  var imagen = seccion.querySelector("[data-mensaje-foto]");
  var reserva = seccion.querySelector("[data-foto-reserva]");
  if (texto(foto.src)) {
    imagen.addEventListener("load", function () { imagen.hidden = false; reserva.hidden = true; });
    imagen.addEventListener("error", function () { imagen.hidden = true; reserva.hidden = false; });
    if (texto(foto.alt)) imagen.alt = foto.alt;
    imagen.style.objectFit = foto.ajuste === "cover" ? "cover" : "contain";
    if (texto(foto.posicion)) imagen.style.objectPosition = foto.posicion;
    imagen.src = foto.src;
  }

  /* ---------- Partículas doradas ---------- */
  var motas = seccion.querySelector("[data-mensaje-motas]");
  if (motas) {
    for (var i = 0; i < 16; i++) {
      var mota = document.createElement("i");
      mota.style.setProperty("--x", (5 + (i * 29) % 90) + "%");
      mota.style.setProperty("--y", (10 + (i * 23) % 82) + "%");
      mota.style.setProperty("--tamano", (i % 3 === 0 ? 2.5 : 1.5) + "px");
      mota.style.setProperty("--duracion", (15 + (i % 5) * 2) + "s");
      mota.style.setProperty("--espera", (-i * 1.7) + "s");
      motas.appendChild(mota);
    }
  }

  // Sin observador el contenido queda visible y quieto
  if (!("IntersectionObserver" in window)) return;
  var movimiento = window.matchMedia("(prefers-reduced-motion: reduce)");
  var enPantalla = false;

  /* ---------- Ambiente: sólo corre con la sección en pantalla ---------- */
  function actualizarAmbiente() {
    var animar = enPantalla && !document.hidden && !movimiento.matches;
    if (animar) seccion.classList.add("is-iluminada");
    seccion.classList.toggle("is-animando", animar);
  }

  new IntersectionObserver(function (entradas) {
    enPantalla = entradas[0].isIntersecting;
    actualizarAmbiente();
  }, { threshold: 0 }).observe(seccion);
  document.addEventListener("visibilitychange", actualizarAmbiente);

  /* ---------- Revelado único de cada bloque ---------- */
  seccion.classList.add("is-observando");
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-visible");
      observador.unobserve(entrada.target);
    });
  }, { threshold: .18, rootMargin: "0px 0px -6% 0px" });

  seccion.querySelectorAll("[data-revelar]").forEach(function (bloque) {
    observador.observe(bloque);
  });
})();
