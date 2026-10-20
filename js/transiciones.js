/* =========================================================
   Invitación de graduación · Transiciones entre secciones
   Inserta una costura decorativa (aria-hidden) entre cada par
   de secciones de primer nivel dentro de #invitacion.
   ========================================================= */
(function () {
  "use strict";

  var invitacion = document.getElementById("invitacion");
  if (!invitacion) return;

  var reducido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var observa = !reducido && "IntersectionObserver" in window;
  var secciones = Array.prototype.filter.call(invitacion.children, function (hijo) {
    return hijo.tagName === "SECTION";
  });

  function costura() {
    var t = document.createElement("div");
    t.className = "transicion";
    t.setAttribute("aria-hidden", "true");
    t.innerHTML =
      '<span class="transicion__velo"></span>' +
      '<span class="transicion__filete transicion__filete--sup"></span>' +
      '<span class="transicion__filete transicion__filete--inf"></span>' +
      '<span class="transicion__punta transicion__punta--izq"></span>' +
      '<span class="transicion__punta transicion__punta--der"></span>' +
      '<span class="transicion__brillo"></span>';
    if (observa) t.classList.add("is-esperando");
    return t;
  }

  var costuras = [];
  for (var i = 1; i < secciones.length; i++) {
    var t = costura();
    invitacion.insertBefore(t, secciones[i]);
    costuras.push(t);
  }
  if (!observa) return;

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("is-visible");
      observador.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -18% 0px", threshold: 0 });

  costuras.forEach(function (t) { observador.observe(t); });
})();
